const fs = require('fs');
const _ = require('lodash');
const path = require('path');

/**
 * Read just the first line of a file (up to the first newline character)
 * @private
 * @param {string} path - File path
 * @return {Promise} Resolves to the first line of the file
 */
_readFirstLine = function(path) {
	return new Promise(function (resolve, reject) {
		const rs = fs.createReadStream(path, {encoding: 'utf8'});
		let acc = '';
		let pos = 0;
		let index;
		rs
			.on('data', function (chunk) {
				index = chunk.indexOf('\n');
				acc += chunk;
				index !== -1 ? rs.close() : pos += chunk.length;
			})
			.on('close', function () {
				resolve(acc.slice(0, pos + index));
			})
			.on('error', function (err) {
				reject(err);
			})
	});
}

/**
 * Whether or not the csv export contained in the given directory ran to completion or not
 * @param {string} csvDirPath - Path to the folder containing the files exported by the
 *  CSV export script
 * @return {bool} True if the CSV export script ran to completion, false otherwise
 */
module.exports.csvCompleted = function(csvDirPath) {
	const metapath = path.join(csvDirPath, 'meta.json');
	try {
		const status = JSON.parse(fs.readFileSync(metapath, 'utf8')).status;
		return status.toLowerCase() === 'completed';
	} catch (e) {
		return false;
	}
}

/**
 * Whether or not the header keys for two CSV files are the same or different
 * (the headers need not be in the same order to be the same)
 * @param {string} csvFilePathA - Path to the first objects.csv file
 * @param {string} csvFilePathB - Path to the second objects.csv file
 * @return {Promise} Resolves to true if the headers match, false otherwires
 */
module.exports.doCSVKeysMatch = function(csvFilePathA, csvFilePathB, delim = ",") {
	const proms = [];
	proms.push(_readFirstLine(csvFilePathA));
	proms.push(_readFirstLine(csvFilePathB));
	const all = Promise.all(proms);
	return all.then((res) => {
		const keysA = res[0].split(delim);
		const keysB = res[1].split(delim);
		return _.difference(keysA, keysB).length === 0 && _.difference(keysB, keysA).length === 0;
	}, (err) => {
		throw err;
	});
}

/**
 * Name of the most recent CSV directory, given the directory containing CSV directories
 * @param {string} csvRootDir - Path to the directory containing csv_* directories,
 *  as output by the CSV export script
 * @return {string} Name of the most recent CSV directory
 */
module.exports.getLastCompletedCSV = function(csvRootDir) {
	let dirs = fs.readdirSync(csvRootDir);
	dirs = _.filter(dirs, (d) => d.startsWith("csv_")).sort();
	dirs = _.filter(dirs, (d) => module.exports.csvCompleted(path.join(csvRootDir, d)));
	if (dirs.length > 0) return dirs.pop();
	return null;
}
