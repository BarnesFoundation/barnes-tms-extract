const logger = require('./logger.js');

const fs = require('fs');
const csv = require('fast-csv');

/**
 * Manages writing to a CSV file
 * @param {string} path - Path to the `objects.csv` file that will contain the export
 * @throws Error if the file cannot be created or opened for some reason
 */
class CSVWriter {
	constructor(path, headers, logger=null) {
		this._logger = logger;
		if (this._logger) this._logger.info(`Opening CSV file at ${path}`);
		this._path = path;
		this._csvStream = csv.createWriteStream({ headers: headers });
		this._writableStream = fs.createWriteStream(path);
		this._csvStream.pipe(this._writableStream);
	}

	/**
	 * Write a flat JSON object (string and number fields only) to a row of the CSV
	 * @param {object} rowDict - JSON descripton of a collection object, probably returned
	 *  from {@link ArtObject#descriptionWithFields}
	 * @throws Error if the write stream fails for some reason
	 */
	write(rowDict) {
		if (this._logger) this._logger.debug(`Writing CSV row with data ${JSON.stringify(rowDict)}`);
		this._csvStream.write(rowDict);
	}

	/**
	 * Close the CSV file and finish writing
	 * @throws Error if closing the file fails for some reason
	 */
	end() {
		if (this._logger) this._logger.info(`Closing CSV file at ${this._path}`);
		this._csvStream.end();
	}
};

module.exports = CSVWriter;