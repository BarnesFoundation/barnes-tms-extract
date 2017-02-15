import fs from "fs";
import csv from "fast-csv";

export default class CSVWriter {
	constructor(path) {
		this._headers = null;
		this._csvStream = csv.createWriteStream({headers: true});
    this._writableStream = fs.createWriteStream(path);
    this._csvStream.pipe(this._writableStream);
	}

	set headers(headers) {
		this._headers = headers;
	}

	write(rowDict) {
		this._csvStream.write(rowDict);
	}

	end() {
		this._csvStream.end();
	}
}