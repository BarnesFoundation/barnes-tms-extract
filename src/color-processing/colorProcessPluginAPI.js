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
const { SenecaPluginAPI, makeAPI } = require('../util/senecaPluginAPI.js');
const WebsocketUpdater = require('../util/websocketUpdater.js');
const UpdateEmitter = require('../util/updateEmitter.js');
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

const ColorProcessAPIStatus = Object.freeze({
	READY: "READY",
	RUNNING: "RUNNING"
});

class ColorProcessor extends UpdateEmitter {
	constructor() {
		super();

		this._s3Client = s3.createClient({
			s3Options: {
				accessKeyId: credentials.awsAccessKeyId,
				secretAccessKey: credentials.awsSecretAccessKey,
				region: credentials.awsRegion
			}
		});

		const esOptions = makeElasticsearchOptions();

		this._esClient = elasticsearch.Client( esOptions );

		Promise.promisifyAll(this._esClient);

		this._status = ColorProcessAPIStatus.READY;

		this._message = "Ready to process";
	}

	get status() {
		return this.desc();
	}

	desc() {
		return {
			status: this._status,
			message: this._message
		};
	}

	started(message) {
		this._status = ColorProcessAPIStatus.RUNNING;
		this._message = message;
		logger.info(message);
		super.started();
	}

	progress(message) {
		this._message = message;
		logger.info(message);
		super.progress();
	}

	completed(message) {
		this._status = ColorProcessAPIStatus.READY;
		this._message = message;
		logger.info(message);
		super.completed();
	}

	process() {
		logger.info("Beginning to process");
		let results = [];
		this.started("Beginning color processing");
		const esClient = this._esClient;
		this._s3Client.listObjects({
			s3Params: {
				Bucket: bucketName,
				Prefix: awsFolderPath,
				MaxKeys: 5000
			}
		})
		.on('data', function(data) {
			results = results.concat(data.Contents);
		})
		.on('end', () => {
			logger.info(`Listed ${results.length} objects`);
			processColorForImages(
				results,
				(message) => this.progress(message),
				esClient)
			.then(() => {
				this.completed("All done");
			});
		});

		return this.desc();
	}
}

/**
 * Seneca plugin for processing TMS images using the Cooper Hewitt palette extractor
 */
class ColorProcessAPI extends SenecaPluginAPI {
	constructor(seneca, options) {
		super(seneca, options);

		this._colorProcessor = new ColorProcessor();

		this._websocketUpdater = new WebsocketUpdater('color', config.Server.port, this._colorProcessor);
	}

	get name() { return "color"; }

	desc() {
		return this._colorProcessor.desc();
	}

	/**
	 * Begin the Cooper-Hewitt color processing operation
	 */
	process() {
		return this._colorProcessor.process();
	}
}

function processColorForImages(images, progressCb, esClient) {
	return new Promise((resolve, reject) => {
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
						handleImageJSONData(d, image, esClient).then(() => {
							progressCb("Finished handling data for image " + image.Key);
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
			resolve();
		});
	});
}

function handleImageJSONData(d, image, esClient) {
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
		return new Promise.resolve();
	} else {
		const fields = Object.assign({}, f, { key: image.Key });
		const tmsId = path.basename(image.Key).split('_')[0];
		return writeDataToES(tmsId, f, esClient);
	}
}

function writeDataToES(tmsId, flattenedData, esClient) {
	return esClient.exists({
		// index: 'collection',
		index: config.Elasticsearch.index,
		type: 'object',
		id: tmsId
	}).then((res) => {
		if (res) {
			return esClient.update({
				// index: 'collection',
				index: config.Elasticsearch.index,
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

module.exports = makeAPI('role:color', ColorProcessAPI);
