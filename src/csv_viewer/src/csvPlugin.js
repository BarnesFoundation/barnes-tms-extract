const { makeAPI } = require('../../util/makeAPI.js');

const config = require('config');
const fs = require('fs');
const path = require('path');

const csvDir = config.CSV.path;

class CSVPluginAPI {
	list() {
		const files = fs.readdirSync(csvDir);
		console.log(files);
		const data = { files: [] };
		files.forEach((file) => {
			if (path.basename(file).startsWith('csv_')) {
				try {
					const metaPath = path.join(csvDir, file, 'meta.json');
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
