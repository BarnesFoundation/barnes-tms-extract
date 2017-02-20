import logger from "./logger.js";

import fs from "fs";
import csv from "fast-csv";

export default class CSVWriter {
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