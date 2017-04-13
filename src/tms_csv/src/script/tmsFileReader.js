const ArtObject = require('./artObject.js');
const TMSReader = require('./tmsReader.js');

const fs = require('fs');

/**
 * Reads a directory of JSON files, each one representing a TMS collection object,
 *  as if it were a TMS API. Used mostly for testing
 * @implements TMSReader
 */
class TMSFileReader extends TMSReader {
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
		return new Promise(resolve => resolve(this._index < this._files.length));
	}

	next() {
		return new Promise((resolve, reject) => {
			if (this._index >= this._files.length) {
				reject('No more objects');
			} else {
				const artObjectPath = `${this.path}/${this._files[this._index]}`;
				const description = fs.readFileSync(artObjectPath, 'utf8');
				this._index += 1;
				resolve(new ArtObject(description));
			}
		});
	}
};


module.exports = TMSFileReader;