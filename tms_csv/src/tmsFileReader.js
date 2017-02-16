import ArtObject from "./artObject.js";
import TMSReader from "./tmsReader.js";

import fs from "fs";

export default class TMSFileReader extends TMSReader {
	constructor() {
		super();
		this._index = 0;
		this._files = [];
	}

	get path() {
		return super.path;
	}

	set path(path) {
		super.path = path;
		this._index = 0;
		this._files = fs.readdirSync(path);
		console.log(this._files);
	}

	hasNext() {
		return new Promise((resolve) => resolve(this._index < this._files.length));
	}

	next() {
		return new Promise((resolve, reject) => {
			if (this._index >= this._files.length) {
				reject("No more objects");
			} else {
				const artObjectPath = this.path + "/" + this._files[this._index];
				const description = fs.readFileSync(artObjectPath, 'utf8');
				this._index++;
				resolve(new ArtObject(description));
			}
		});
	}
}