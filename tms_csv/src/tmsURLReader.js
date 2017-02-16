import ArtObject from "./artObject.js";
import TMSReader from "./tmsReader.js";

import https from "https";
import url from "url";

export default class TMSURLReader extends TMSReader {
	constructor() {
		super();
		this._currentPageIndex = 0;
		this._currentIndexOfObjectInPage = 0;
		this._numberOfObjectsOnCurrentPage = 0;
		this._currentPageJSON = null;
	}

	_currentPageHasMoreObjects() {
		return this._currentIndexOfObjectInPage < this._numberOfObjectsOnCurrentPage;
	}

	_fetchArtObjectWithId(id) {
		console.log("Fetching art object with id: " + id);

		const requestURL = url.parse(this.path + "/" + id + "/json");
		console.log("REQUEST -----------");
		console.log(requestURL);
		const options = {
			hostname: requestURL.hostname,
			port: 443,
			path: requestURL.path,
			method: "GET"
		};

		return new Promise((resolve, reject) => {
			var req = https.request(options, (res) => {

				let data = "";

				res.on("data", (d) => {
					data += d;
				});

				res.on("end", () => {
					console.log("Object data for id: " + id);
					console.log(data);
					const artObjectDescription = JSON.parse(data);
					resolve(new ArtObject(artObjectDescription));
				});
			});

			req.on("error", (e) => {
				reject(e);
			});

			req.end();
		});
	}

	_fetchNextPage() {
		console.log("Fetching new page...");
		this._currentPageIndex++;
		const requestURL = url.parse(this.path + "/json" + "?page=" + (this._currentPageIndex + 1));
		const options = {
			hostname: requestURL.hostname,
			port: 443,
			path: requestURL.path,
			method: "GET"
		};

		return new Promise((resolve, reject) => {
			var req = https.request(options, (res) => {

				let data = "";

				res.on("data", (d) => {
					data += d;
				});

				res.on("end", () => {
					this._updateWithJSONResponse(data);
					resolve();
				});
			});

			req.on("error", (e) => {
				reject(e);
			});

			req.end();
		});
	}

	_updateWithJSONResponse(data) {
		this._currentIndexOfObjectInPage = 0;
		this._numberOfObjectsOnCurrentPage = 0;

		if (data) {
			this._currentPageJSON = JSON.parse(data);
			if (this._currentPageJSON.objects !== undefined) {
				this._numberOfObjectsOnCurrentPage = this._currentPageJSON.objects.length;
			}
		} else {
			this._currentPageJSON = null;
		}
	}

	hasNext() {
		console.log("Has next");
		return new Promise((resolve) => {
			if (this._currentPageHasMoreObjects()) {
				console.log("Has more objects");
				resolve(true);
			} else {
				this._fetchNextPage().then(() => {
					resolve(this._currentPageHasMoreObjects());
				});
			}
		});
	}

	next() {
		return new Promise((resolve, reject) => {
			this.hasNext().then((hasNext) => {
				if (hasNext) {
					const objectId = this._currentPageJSON.objects[this._currentIndexOfObjectInPage].id.value;
					this._fetchArtObjectWithId(objectId).then((artObject) => {
						this._currentIndexOfObjectInPage++;
						resolve(artObject);
					}, (error) => {
						//TODO: Handle the error
						reject("Error resolving object");
					});
				} else {
					reject("No more objects");
				}
			});
		})
	}
}