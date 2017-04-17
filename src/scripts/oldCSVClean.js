const fs = require('fs-extra');
const moment = require('moment');
const path = require('path');
const source = require('config').CSV.path;

const cutoff = moment().subtract(15, 'days');

// Remove every directory older than 15 days
const dirs = fs.readdirSync(source);

const dirsToDelete = [];

dirs.forEach((d) => {
	if (d.startsWith('csv_')) {
		const ts = parseInt(d.split('_')[1], 10);

		const csvTime = moment(ts);

		if (csvTime.isBefore(cutoff)) {
			dirsToDelete.push(d);
		}
	}
});

dirsToDelete.forEach((d) => {
	const dpath = path.join(source, d);

	fs.removeSync(dpath);
});
