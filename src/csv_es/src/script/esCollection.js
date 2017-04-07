/** @namespace Elasticsearch */

const logger = require('./esLogger.js');
const {
	doCSVKeysMatch,
	diffCSV,
} = require('../../../util/csvUtil.js');
const UpdateEmitter = require('../../../util/updateEmitter.js');

const csv = require('fast-csv');
const elasticsearch = require('elasticsearch');
const fs = require('fs');
const path = require('path');
const shell = require('shelljs');
const tmp = require('tmp');
const _ = require('lodash');

/**
 * Manages the process of importing a CSV file into Elasticsearch. The `collection` index has two types,
 * `meta` and `object`. The `meta` type stores information about the import process itself, including the
 * timestamp of the last CSV file to be imported (lastCSVImportTimestamp) and whether or not the index is
 * currently synchronized with a CSV file (hasImportedCSV). The `object` type stores the collection objects
 * themselves, and will have different fields depending on the headers of the imported CSV file
 * @memberof Elasticsearch
 */
class ESCollection extends UpdateEmitter {
	constructor(esHost) {
		super();
		this._didInit = false;
		this._esHost = esHost;
		this._client = new elasticsearch.Client({
			host: this._esHost,
		});
	}

	// @ignore
	get status() {
		return this.description();
	}

	/**
	 * Check whether or not the collection metadata exists
	 * @private
	 * @return {Promise} Resolved when the elasticsearch request completes
	 */
	_collectionMetadataExists() {
		return new Promise((resolve, reject) => {
			this._client.exists({
				index: 'collection',
				type: 'meta',
				id: 1,
			}, (error, exists) => {
				if (error) reject(error);
				resolve(exists);
			});
		});
	}

	/**
	 * Creates a meta type for the collection index, if necessary
	 * @private
	 * @return {Promise} Resolved when the elasticsearch request completes
	 */
	_createCollectionMetadata() {
		return new Promise((resolve, reject) => {
			this._client.create({
				index: 'collection',
				type: 'meta',
				id: 1,
				body: {
					hasImportedCSV: false,
					lastCSVImportTimestamp: 0,
				},
			}, (error, response) => {
				if (error) reject(error);
				resolve(error);
			});
		});
	}

	/**
	 * Create a new object document, for the given dictionary of CSV data
	 * @private
	 * @param {object} data - key-value pairs to add for the given object
	 * @return {Promise} Resolved when the elasticsearch request completes
	 */
	_createDocumentWithData(data) {
		let dataCopy = Object.assign({}, data);
		dataCopy.id = parseInt(dataCopy.id);
		dataCopy = _.mapValues(dataCopy, (v, k) => {
			if (v === '') return null;
			return v;
		});
		return new Promise((resolve, reject) => {
			this._client.create({
				index: 'collection',
				type: 'object',
				id: dataCopy.id,
				body: dataCopy,
			}, (error, response) => {
				if (error) reject(error);
				resolve(response);
			});
		});
	}

	_deleteDocumentWithId(docId) {
		return new Promise((resolve, reject) => {
			this._client.delete({
				index: 'collection',
				type: 'object',
				id: docId,
			}, (error, response) => {
				if (error) reject(error);
				resolve(response);
			});
		});
	}

	_getLastCSVName() {
		return new Promise((resolve, reject) => {
			this._client.get({
				index: 'collection',
				type: 'meta',
				id: 1,
			}, (error, response) => {
				if (error) reject(error);
				if (response._source.hasImportedCSV === false) resolve(null);
				resolve(`csv_${response._source.lastCSVImportTimestamp}`);
			});
		});
	}

	/**
	 * Synchronize the elasticsearch index withe given CSV file
	 * @private
	 * @param {string} Path to the CSV file with which to synchronize
	 */
	_syncESWithCSV(csvFilePath) {
		this.started();
		csv
			.fromPath(csvFilePath, { headers: true })
			.on('data', (data) => {
				this._createDocumentWithData(data, this._client);
			})
			.on('end', () => {
				this._updateMetaForCSVFile(csvFilePath).then(() => {
					logger.info('Finished export');
					this.completed();
				});
			});
	}

	_updateDocumentWithData(docId, data) {
		return new Promise((resolve, reject) => {
			this._client.update({
				index: 'collection',
				type: 'object',
				id: docId,
				body: {
					doc: data,
				},
			}, (error, response) => {
				if (error) reject(error);
				resolve(response);
			});
		});
	}

	_updateESWithCSV(csvFilePath) {
		this.started();
		const csvDir = path.resolve(path.dirname(csvFilePath), '..');
		const tmpDir = tmp.dirSync();
		const outputJsonFile = path.join(tmpDir.name, 'diff.json');
		return this._getLastCSVName().then((oldCsvName) => {
			logger.info(`Previously imported csv ${oldCsvName}`);
			const oldCsvPath = path.join(csvDir, oldCsvName, 'objects.csv');
			const res = diffCSV(oldCsvPath, csvFilePath, logger);
			return this._updateESWithDiffJSON(res);
		}).then(() => {
			logger.info('Finished import, updating index metadata');
			return this._updateMetaForCSVFile(csvFilePath).then(() => {
				logger.info('Index metadata updated');
				this.completed();
			});
		});
	}

	_updateESWithDiffJSON(diffJson) {
		const todos = [];
		logger.info(
			`Updating to new CSV. 
			${diffJson.added.length} new documents, 
			${diffJson.changed.length} changed documents, 
			${diffJson.removed.length} removed documents.`
		);
		_.forEach(diffJson.added, (added) => {
			todos.push(this._createDocumentWithData(added));
		});
		_.forEach(diffJson.changed, (changed) => {
			const id = parseInt(changed.key[0]);
			_.forEach(changed.fields, (v, k) => {
				todos.push(this._updateDocumentWithData(id, { k: v.to }));
			});
		});
		_.forEach(diffJson.removed, (removed) => {
			const id = parseInt(removed.id);
			todos.push(this._deleteDocumentWithId(id));
		});

		return Promise.all(todos);
	}

	_updateMetaForCSVFile(csvFilePath) {
		const bn = path.dirname(csvFilePath).split(path.sep).pop();
		const timestamp = parseInt(bn.split('_')[1]);
		return new Promise((resolve, reject) => {
			this._client.update({
				index: 'collection',
				type: 'meta',
				id: 1,
				body: {
					doc: {
						hasImportedCSV: true,
						lastCSVImportTimestamp: timestamp,
					},
				},
			}, (error, response) => {
				if (error) reject(error);
				resolve(response);
			});
		});
	}

	/**
	 * Remove all collection objects from the collection index and the object type
	 * @return {Promise} Resolved when the elasticsearch request completes
	 */
	clearCollectionObjects() {
		if (!this._didInit) {
			throw new this.constructor.ESCollectionException('Must call init() before interacting with ESCollection object');
		}
		return new Promise((resolve, reject) => {
			this._client.update({
				index: 'collection',
				type: 'meta',
				id: 1,
				body: {
					doc: {
						hasImportedCSV: false,
						lastCSVImportTimestamp: 0,
					},
				},
			}, (error, response) => {
				if (error) reject(error);
				this._client.deleteByQuery({
					conflicts: 'proceed',
					index: 'collection',
					type: 'object',
					body: {
						query: {
							match_all: {},
						},
					},
				}, (error, response) => {
					if (error) reject(error);
					resolve(response);
				});
			});
		});
	}

	/**
	 * Returns a description of the Elasticsearch index.
	 * @return {Promise} Resolves to a description of the Elasticsearch index
	 */
	description() {
		if (!this._didInit) {
			throw new this.constructor.ESCollectionException('Must call init() before interacting with ESCollection object');
		}
		const metaGetter = new Promise((resolve, reject) => {
			this._client.get({
				index: 'collection',
				type: 'meta',
				id: 1,
			}, (error, response) => {
				if (error) reject(error);
				resolve({
					hasImportedCSV: response._source.hasImportedCSV,
					lastCSVImportTimestamp: response._source.lastCSVImportTimestamp,
					lastImportedCSV: response._source.hasImportedCSV ? `csv_${response._source.lastCSVImportTimestamp}` : null,
				});
			});
		});

		const countGetter = new Promise((resolve, reject) => {
			this._client.count({
				index: 'collection',
				type: 'object',
			}, (error, response) => {
				if (error) reject(error);
				resolve({
					count: response.count || 0,
				});
			});
		});

		return Promise.all([metaGetter, countGetter]).then((res) => {
			const [meta, count] = res;
			return Object.assign({}, meta, count);
		});
	}

	/**
	 * Must be called before trying to interact with the ES collection index. This
	 * will prepare the index by, for example, adding the collection metadata
	 * @return {Promise} Resolved when the elasticsearch request completes
	 */
	init() {
		this._didInit = true;
		return this._collectionMetadataExists().then((exists) => {
			if (!exists) {
				return this._createCollectionMetadata();
			}
		}, (error) => {
			throw error;
		});
	}

	/**
	 * Attempts to synchronize the Elasticsearch index with the given CSV file.
	 * If the index has already been synchronized with a CSV file, then this function will compare the CSV
	 * file to be imported with the previous file. Only the differences between the two will be used to
	 * update Elasticsearch. If the previous file cannot be found, or if the two CSV files have different
	 * headers, then the Elasticsearch index will be cleared before updating.
	 * @param {string} csvFilePath - Path to the CSV file to synchronize with ES
	 * @return {Promise} Resolved when the synchronization is complete
	 * @throws {ESCollectionException}
	 */
	syncESToCSV(csvFilePath) {
		if (!this._didInit) {
			throw new this.constructor.ESCollectionException('Must call init() before interacting with ESCollection object');
		}
		// TODO: Throw an error if you can't find this CSV
		return this._getLastCSVName().then((res) => {
			const canDiff = (res !== null);
			if (canDiff) {
				const csvDir = path.resolve(path.dirname(csvFilePath), '..');
				const lastCSVFilePath = path.join(csvDir, res, 'objects.csv');
				if (!fs.existsSync(lastCSVFilePath)) {
					logger.info("Can't find previously imported CSV --- initializing new ES index");
					return false;
				}

				return doCSVKeysMatch(lastCSVFilePath, csvFilePath).then((res) => {
					if (res) {
						logger.info('CSV keys match');
					} else {
						logger.info('CSV keys do not match');
					}
					return res;
				});
			}
			logger.info('No previous CSV file has been imported --- initializing new ES index');
			return false;
		}).then((tryToDiff) => {
			if (tryToDiff) {
				logger.info('Updating from previously imported CSV');
				return this._updateESWithCSV(csvFilePath);
			}
			logger.info(`Initializing with CSV ${csvFilePath}`);
			return this.clearCollectionObjects().then(res => this._syncESWithCSV(csvFilePath));
		});
	}
};

/**
 * Exceptions thrown by the {@link ESCollection} class
 * @constructor ESCollectionException
 * @static
 */
ESCollection.ESCollectionException = function(message) {
	this.message = message;
	this.name = 'ESCollectionException';
}

module.exports = ESCollection;
