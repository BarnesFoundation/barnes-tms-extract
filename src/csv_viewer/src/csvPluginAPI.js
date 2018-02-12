const { SenecaPluginAPI, makeAPI } = require('../../util/senecaPluginAPI.js');

const config = require('config');
const fs = require('fs');
const path = require('path');

const csvRootDirectory = config.CSV.rootDirectory;

/**
 * Seneca plugin for listing the exported CSV files
 */
class CSVPluginAPI extends SenecaPluginAPI {
	constructor(seneca, options) {
		super(seneca, options);
	}

	get name() { return "csv"; }

	/**
	 * typedef {Object} CSVExportDescription
	 * @description Status of a pass of the TMS to CSV export script
	 * @name CSVPluginAPI~CSVExportDescription
	 * @property {string} file - The CSV filename
	 * @property {string} status - Export status (INCOMPLETE, COMPLETED, ERROR)
	 * @property {string} createdAt - When the export started
	 * @property {number} processedObjects - Number of objects that have been exported
	 * @property {number} totalObjects - Total number of objects to export
	 */

	/**
	 * List the CSV files that have been exported from TMS
	 * @return {CSVPluginAPI~CSVExportDescription[]}
	 */
	list() {
		const files = fs.readdirSync(csvRootDirectory);
		const data = { files: [] };
		files.forEach((file) => {
			if (path.basename(file).startsWith('csv_')) {
				try {
					const metaPath = path.join(csvRootDirectory, file, 'meta.json');
					const metaString = fs.readFileSync(metaPath);
					const metadata = JSON.parse(metaString);
					metadata.name = file;
					data.files.push(metadata);
				} catch (e) {
					// TODO: Consider logging this
				}
			}
		});

		return data;
	}
}

module.exports = makeAPI('role:csv', CSVPluginAPI);
