const logger = require("./logger.js");

const fs = require("fs");
const csv = require("fast-csv");

module.exports = class CSVWriter {
	constructor(path) {
		logger.info(`Opening CSV file at ${path}`);
		this._path = path;
		this._csvStream = csv.createWriteStream({headers: true});
    this._writableStream = fs.createWriteStream(path);
    this._csvStream.pipe(this._writableStream);
	}

	write(rowDict) {
		logger.debug(`Writing CSV row with data ${JSON.stringify(rowDict)}`);
		this._csvStream.write(rowDict);
	}

	end() {
		logger.info(`Closing CSV file at ${this._path}`);
		this._csvStream.end();
	}
}