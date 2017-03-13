const csv = require('fast-csv');
const elasticsearch = require('elasticsearch');
const fs = require('fs');
const _ = require('lodash');
const path = require('path');

// Just for giggles
const client = new elasticsearch.Client({
	host: 'localhost:9200',
	log: 'trace'
});

// client.ping().then((res) => console.log(res), (err) => console.error(err));

function createCollectionMetadata() {
	client.create({
		index: 'collection',
		type: 'meta',
		id: 1,
		body: {
			hasImportedCSV: false,
			lastCSVImportTimestamp: 0
		}
	}, function(error, res) {
		if (error) console.log(error);
	});
}

function csvCompleted(csvDirPath) {
	const metapath = path.join(csvDirPath, 'meta.json');
	try {
		const status = JSON.parse(fs.readFileSync(metapath, 'utf8')).status;
		return status.toLowerCase() === 'completed';
	} catch (e) {
		return false;
	}
}

function getLastCompletedCSV(csvRootDir) {
	let dirs = fs.readdirSync(csvRootDir);
	dirs = _.filter(dirs, (d) => d.startsWith("csv_")).sort();
	dirs = _.filter(dirs, (d) => csvCompleted(path.join('../dashboard/public/output', d)));
	if (dirs.length > 0) return dirs.pop();
	return null;
}

function pushCSVDataToES(data, client) {
	const dataCopy = Object.assign({}, data);
	dataCopy.id = parseInt(dataCopy.id);
	client.create({
		index: 'collection',
		type: 'object',
		id: dataCopy.id,
		body: dataCopy
	});
}

function writeCSVToES(csvFilePath, client) {
	csv
		.fromPath(csvFilePath, { headers: true })
		.on('data', (data) => {
			pushCSVDataToES(data, client);
		})
		.on('end', () => {
			console.log('Finished export');
		});
}

// Try to get /collection/meta/1
// client.exists({
// 	index: 'collection',
// 	type: 'meta',
// 	id: 1
// }, function(error, exists) {
// 	if (!error) {
// 		if (!exists) createCollectionMetadata();
// 	} else {
// 		console.log(error);
// 	}
// });

function doEverything() {
	client.deleteByQuery({
		index: 'collection',
		type: 'object',
		body: {
			query: {
			   match_all: {}
		  }
		}
	}, function(error, res) {
		if (error) {
			console.error(error);
		} else {
			const csvRootDir = '../dashboard/public/output';
			const cp = getLastCompletedCSV(csvRootDir);
			writeCSVToES(path.join(csvRootDir, cp, 'objects.csv'), client);
		}
	});
}