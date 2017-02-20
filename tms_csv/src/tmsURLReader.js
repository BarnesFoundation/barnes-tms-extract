import ArtObject from "./artObject.js";
import TMSReader from "./tmsReader.js";
import logger from "./logger.js";

import https from "https";
import url from "url";

export default class TMSURLReader extends TMSReader {
	constructor() {
		super();
		this._currentPageIndex = -1;
		this._currentIndexOfObjectInPage = 0;
		this._numberOfObjectsOnCurrentPage = 0;
		this._currentPageJSON = null;
	}

	get path() {
		return super.path;
	}

	set path(path) {
		super.path = path;
		this._currentPageIndex = -1;
		this._currentIndexOfObjectInPage = 0;
		this._numberOfObjectsOnCurrentPage = 0;
		this._currentPageJSON = null;
	}

	_currentPageHasMoreObjects() {
		return this._currentIndexOfObjectInPage < this._numberOfObjectsOnCurrentPage;
	}

	_fetchArtObjectWithId(id) {
		const requestURL = url.parse(this.path + "/" + id + "/json");

		logger.info(`Fething collection object with id: ${id} at url: ${requestURL.href}`);
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
					logger.info(`Received data for collection object with id: ${id}`);
					logger.debug(`Object data: ${data}`);
					try {
						const artObjectDescription = JSON.parse(data);
						resolve(new ArtObject(artObjectDescription));
					} catch (e) {
						reject(e);
					}
				});
			});

			req.on("error", (e) => {
				reject(e);
			});

			req.end();
		});
	}

	_fetchNextPage() {
		this._currentPageIndex++;
		const requestURL = url.parse(this.path + "/json" + "?page=" + (this._currentPageIndex + 1));

		logger.info(`Requesting collection page with url: ${requestURL.href}`);

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
					logger.info(`Received collection page with url: ${requestURL.href}`);
					logger.debug(data);
					try {
						this._updateWithJSONResponse(data);
						resolve();
					} catch (e) {
						reject(e);
					}
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
		return new Promise((resolve, reject) => {
			if (this._currentPageHasMoreObjects()) {
				resolve(true);
			} else {
				this._fetchNextPage().then(() => {
					resolve(this._currentPageHasMoreObjects());
				}, (e) => {
					reject(e);
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
						this._currentIndexOfObjectInPage++;
						reject(error);
					});
				} else {
					resolve(null);
				}
			}, (error) => {
				reject(error);
			});
		})
	}
}