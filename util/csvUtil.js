const fs = require('fs');
const _ = require('lodash');
const path = require('path');
const tmp = require('tmp');
const shell = require('shelljs');
const csv = require('fast-csv');

function logShellOutput(logger, op) {
	if (op.code === 0) {
		logger.info(op.stdout);
	} else {
		logger.error(op.sterr);
	}
}

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
 * Calls a callback function for each row of a CSV on the given CSV path.
 * First row of the CSV must be headers. Callback function has one argument,
 * an object whose keys are the header columns.
 * @param {string} csvPath - Path to the csv file
 * @param {function} cb - Function to call on each row
 */
module.exports.csvForEach = function(csvPath, cb, completedCb) {
	const stream = fs.createReadStream(csvPath);
	csv.fromStream(stream, {headers : true})
		.on("data", cb)
		.on("end", completedCb);
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

/**
 * Diffs two csvs and returns a JSON object of all fields changed, added, or removed
 * using the python library csvdiff.
 * @param {string} oldCSVPath - Path to the old CSV file
 * @param {string} newCSVPath - Path to the new CSV file
 * @param {logger} logger - instance of winston logger, specific to the microservice
 * @return {object} the diff in JSON form
 */
module.exports.diffCSV = function(oldCSVPath, newCSVPath, logger) {
	const pyDiff = path.resolve(__dirname, "../py_csv_diff/py_csv_diff.py");
	const resolvedOldPath = path.relative(".", oldCSVPath);
	const resolvedNewPath = path.relative(".", newCSVPath);
	const tmpDir = tmp.dirSync();
	const outputJsonFile = path.join(tmpDir.name, "diff.json");
	logger.info(`Running CSV diff python script on ${oldCSVPath} ${newCSVPath}`);
	logShellOutput(logger, shell.exec("source activate tmsdiff", { shell: bashPath }));
	logShellOutput(logger, shell.exec(`python ${pyDiff} ${resolvedOldPath} ${resolvedNewPath} ${outputJsonFile}`, { shell: bashPath }));
	logShellOutput(logger, shell.exec("source deactivate", { shell: bashPath }));
	return JSON.parse(fs.readFileSync(outputJsonFile));
}
