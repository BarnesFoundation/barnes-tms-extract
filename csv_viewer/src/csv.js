const fs = require('fs');
const path = require('path');

function csv(options) {

	console.dir(options);

	const csvDir = options.d || './dashboard/public/output';

	this.add('role:csv,cmd:list', (msg, respond) => {
		fs.readdir(csvDir, (err, files) => {
			const data = { files: [] };
			files.forEach(file => {
				if (path.basename(file).startsWith("csv_")) data.files.push(file);
			});
			respond(err, data);
		});
	});
}

module.exports = csv;
