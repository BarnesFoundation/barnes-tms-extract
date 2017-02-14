import fs from "fs";

import ArtObject from "./artObject.js";

export default class TMSReader {
	constructor(dataDirectory) {
		this._directory = dataDirectory;
		this._files = fs.readdirSync(dataDirectory);
		this._artObjects = [];
		for (let i = 0; i < this._files.length; i++) {
			const path = this._directory + "/" + this._files[i];
			const description = fs.readFileSync(path, 'utf8');
			this._artObjects.push( new ArtObject(description) );
		}
	}

	get length() {
		return this._files.length;
	}

	objectAtIndex(index) {
		return this._artObjects[index];
	}
}