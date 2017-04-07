const config = require('config');
const fs = require('fs');
const path = require('path');

const csvDir = config.CSV.path;

function csv(options) {
	this.add('role:csv,cmd:list', (msg, respond) => {
		fs.readdir(csvDir, (err, files) => {
			const data = { files: [] };
			files.forEach(file => {
				if (path.basename(file).startsWith("csv_")) {
					try {
						const metaString = fs.readFileSync(csvDir + "/" + file + "/meta.json")
						const metadata = JSON.parse(metaString);
						metadata.name = file;
						data.files.push(metadata);
					} catch (e) {
						// TODO: Consider logging this
					}
				}
			});
			respond(err, data);
		});
	});
}

module.exports = csv;
