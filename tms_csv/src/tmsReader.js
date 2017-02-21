module.exports = class TMSReader {

	constructor() {
		this._path = null;
	}

	get path() {
		return this._path;
	}

	set path(path) {
		this._path = path;
	}

	hasNext() { return false; }

	next() { return null; }
}