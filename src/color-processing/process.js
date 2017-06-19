const aws4  = require('aws4');
const config = require('config');
const path = require('path');
const s3 = require('s3');
const csv = require('fast-csv');
const fs = require('fs');
const https = require('https');
const Promise = require('bluebird');
const eachLimit = require('async/eachLimit');
const _ = require('lodash');
const elasticsearch = require('elasticsearch');
const CSVWriter = require('../util/csvWriter.js');
const { makeElasticsearchOptions } = require('../util/elasticOptions.js');
const logger = require('../util/logger.js')(path.join(__dirname, './logs/all-logs.txt'));

const crypto = require("crypto-js");

function flattenColorCalculationResult(color) {

	if (color.average === undefined) return null;

	const ret = {};
	ret["reference-closest"] = color["reference-closest"];
	ret["average-color"] = color.average.color;
	ret["average-closest"] = color.average.closest;
	color["palette"].forEach((color, idx) => {
		['color', 'closest'].forEach((type) => {
			ret[`palette-${type}-${idx}`] = color[type];
		});
	});

	return ret;
}

const parallelRequests = 100;

const credentials = config.Credentials.colorAnalysis;

const colorProcessingHost = credentials.host;

const colorProcessingPath = credentials.path;

const bucketName = credentials.awsBucket;

const awsFolderPath = credentials.awsFolderPath;

const csvOutput = './colors.csv';

const esOptions = makeElasticsearchOptions();

const esClient = elasticsearch.Client( esOptions );

Promise.promisifyAll(esClient);

const s3Client = s3.createClient({
	s3Options: {
		accessKeyId: credentials.awsAccessKeyId,
		secretAccessKey: credentials.awsSecretAccessKey,
		region: credentials.awsRegion
	}
});

let results = [];
logger.info("Beginning color processing");
s3Client.listObjects({
	s3Params: {
		Bucket: bucketName,
		Prefix: awsFolderPath,
		MaxKeys: 5000
	}
}).on('data', function(data) {
		results = results.concat(data.Contents);
	})
	.on('end', function() {
		logger.info(`Listed ${results.length} objects`);
		processColorForImages(results);
	});

function processColorForImages(images) {
	let csv = null, warn = null;
	eachLimit(images, parallelRequests, (image, next) => {
		if (image.Key.indexOf('_b.') === -1) {
			next();
		} else {
			const options = {
				hostname: colorProcessingHost,
				path: `${colorProcessingPath}?bucket=${bucketName}&object=${image.Key}`,
				service: 'execute-api',
				method: 'POST'
			};

			aws4.sign(options, {
				accessKeyId: credentials.awsAccessKeyId,
				secretAccessKey: credentials.awsSecretAccessKey
			});
			logger.info("Making request for image " + image.Key);
			https.request(options, (res) => {
				let d = '';

				res.on('data', (data) => {
					d += data;
				});
				res.on('end', () => {
					logger.info("Received data for image " + image.Key);
					handleImageJSONData(d, image).then(() => {
						logger.info("Finished handling data for image " + image.Key);
						next();
					}).catch((err) => {
						logger.warn(err);
						next();
					});
				});
			}).end();
		}
	}, (err) => {
		if (err) console.dir(err);
		logger.info("All done!");
		if (csv) csv.end();
		if (warn) warn.end();
	});
}

function handleImageJSONData(d, image) {
	let imageData;

	try {
		imageData = JSON.parse(d);
	} catch (e) {
		return new Promise.reject(e);
	}

	const f = flattenColorCalculationResult(imageData);

	if (f === null) {
		logger.warn("Got a weird result for " + image.Key);
		logger.warn(d);
		if (warn === null) warn = new CSVWriter("./warnings.csv", ["message", "key"]);
		warn.write({message: d, key: image.Key});
		return new Promise.resolve();
	} else {
		const fields = Object.assign({}, f, { key: image.Key });
		if (csv === null) csv = new CSVWriter(csvOutput, _.keys(fields));
		csv.write(fields);
		const tmsId = path.basename(image.Key).split('_')[0];
		return writeDataToES(tmsId, f);
	}
}

function writeDataToES(tmsId, flattenedData) {
	return esClient.exists({
		index: 'collection',
		type: 'object',
		id: tmsId
	}).then((res) => {
		if (res) {
			return esClient.update({
				index: 'collection',
				type: 'object',
				id: tmsId,
				body: {
					doc: {
						color: flattenedData
					}
				}
			}).then(() => {
				logger.info("Successfully updated CH color data for " + tmsId);
			});
		} else {
			logger.info("Skipping stroring CH color data for " + tmsId +": no tms data for this image");
		}
	});
}
