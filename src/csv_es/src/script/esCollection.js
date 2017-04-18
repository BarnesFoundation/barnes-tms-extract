const logger = require('./esLogger.js');
const {
	doCSVKeysMatch,
	diffCSV,
} = require('../../../util/csvUtil.js');
const UpdateEmitter = require('../../../util/updateEmitter.js');

const csv = require('fast-csv');
const Promise = require('bluebird');
const elasticsearch = require('elasticsearch');
const fs = require('fs');
const path = require('path');
const shell = require('shelljs');
const tmp = require('tmp');
const _ = require('lodash');

/**
 * @typedef {object} ESCollection~ESImportStatus
 * @property {boolean} hasImportedCSV - Whether the ES index has imported a CSV
 * @property {number} lastCSVImportTimestamp - UNIX timestamp of the last imported CSV
 * @property {string} lastImportedCSV - Name of the last imported CSV file
 */

/**
 * Manages the process of importing a CSV file into Elasticsearch. The `collection` index has two types,
 * `meta` and `object`. The `meta` type stores information about the import process itself, including the
 * timestamp of the last CSV file to be imported (lastCSVImportTimestamp) and whether or not the index is
 * currently synchronized with a CSV file (hasImportedCSV). The `object` type stores the collection objects
 * themselves, and will have different fields depending on the headers of the imported CSV file
 * @param {string} esHost - Host of the running elasticsearch server
 * @param {string} csvRootDirectory - Path to the directory containing csv_* directories with exports from TMS
 */
class ESCollection extends UpdateEmitter {
	constructor(esHost, csvRootDirectory) {
		super();
		this._esHost = esHost;
		this._client = new elasticsearch.Client({
			host: this._esHost,
		});
		Promise.promisifyAll(this._client);
		Promise.promisifyAll(this._client.cat);
		Promise.promisifyAll(this._client.indices);
		this._csvRootDir = csvRootDirectory;
	}

	/** @property {ESCollection~ESImportStatus} status
	 * @override
	 */
	get status() {
		return this.description();
	}

	/**
	 * Whether or not the collection index exists
	 * @private
	 */
	_collectionIndexExists() {
		return this._client.indices.existsAsync({
			index: 'collection'
		});
	}

	/**
	 * Check whether or not the collection metadata exists
	 * @private
	 * @return {Promise} Resolved when the elasticsearch request completes
	 */
	_collectionMetadataExists() {
		return this._client.existsAsync({
			index: 'collection',
			type: 'meta',
			id: 1
		});
	}

	/**
	 * Creates the index for the collection
	 * @private
	 * @return {Promise} Resolved when the elasticsearch request completes
	 */
	_createCollectionIndex() {
		return this._client.indices.createAsync({
			index: 'collection',
			body: require('mapping.json')
		});
	}

	/**
	 * Creates a meta type for the collection index
	 * @private
	 * @return {Promise} Resolved when the elasticsearch request completes
	 */
	_createCollectionMetadata() {
		return this._client.createAsync({
			index: 'collection',
			type: 'meta',
			id: 1,
			body: {
				hasImportedCSV: false,
				lastCSVImportTimestamp: 0
			}
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
		return this._client.createAsync({
			index: 'collection',
			type: 'object',
			id: dataCopy.id,
			body: dataCopy,
		});
	}

	/**
	 * Removes the collection index
	 * @return {Promise} Resolved when the elasticsearch request completes
	 */
	_deleteCollectionIndex() {
		return this._client.collectionIndexExists().then((res) => {
			if (res) {
				return this._client.indices.deleteAsync({ index: 'collection' });
			}
		});
	}

	/**
	 * Delete a document by id
	 * @private
	 * @param {number} docId - ID of the document to delete
	 * @return {Promise} Resolved when the elasticsearch request completes
	 */
	_deleteDocumentWithId(docId) {
		return this._client.deleteAsync({
			index: 'collection',
			type: 'object',
			id: docId,
		});
	}

	/**
	 * Get the name of the last CSV to be imported
	 * @private
	 */
	_getLastCSVName() {
		return this._client.getAsync({
			index: 'collection',
			type: 'meta',
			id: 1,
		}).then((res) => {
			if (res._source.hasImportedCSV === false) return null;
			return `csv_${response._source.lastCSVImportTimestamp}`;
		});
	}

	/**
	 * Whether or not the index is ready to sync with a CSV. Checks if the index exists
	 * and whether the meta object exists
	 * @return {Promise} Resolved when the elasticsearch request complete, result is whether the index is ready
	 */
	_isIndexReadyForSync() {
		return this._collectionIndexExists().then((res) => {
			if (!res) return false;
			return this._collectionMetadataExists();
		});
	}

	/**
	 * Creates the index if it doesn't exists, and creates the meta object if it doesn't exist
	 * @private
	 * @return {Promise} Resolved when the elasticsearch request complete
	 */
	_prepareIndexForSync() {
		return this._collectionIndexExists().then((res) => {
			if (!res) {
				return this._createCollectionIndex();
			}
		}).then(() => {
			return this._collectionMetadataExists();
		}).then((res) => {
			if (!res) {
				return this._createCollectionMetadata();
			}
		});
	}

	/**
	 * Synchronize the elasticsearch index with the given CSV file
	 * @private
	 * @param {string} csvExport - Name of the CSV export with which to synchronize
	 */
	_syncESWithCSV(csvExport) {
		const csvFilePath = path.join(this._csvRootDir, csvExport, 'objects.csv');
		this.started();
		csv
			.fromPath(csvFilePath, { headers: true })
			.on('data', (data) => {
				this._createDocumentWithData(data, this._client);
			})
			.on('end', () => {
				this._updateMetaForCSVFile(csvExport).then(() => {
					logger.info('Finished export');
					this.completed();
				});
			});
	}

	_updateDocumentWithData(docId, data) {
		return this._client.updateAsync({
			index: 'collection',
			type: 'object',
			id: docId,
			body: {
				doc: data,
			},
		});
	}

	/**
	 * Update the elasticsearch index with the given CSV file
	 * @private
	 * @param {string} csvExport - Name of the CSV export
	 */
	_updateESWithCSV(csvExport) {
		const csvFilePath = path.join(this._csvRootDir, csvExport, 'objects.csv');
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
			return this._updateMetaForCSVFile(csvExport).then(() => {
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

	/**
	 * Update the elasticsearch metadata type for the given CSV file
	 * @private
	 * @param {string} csvExport - Name of the CSV export
	 */
	_updateMetaForCSVFile(csvExport) {
		const csvFilePath = path.join(this._csvRootDir, csvExport, 'objects.csv');
		const bn = path.dirname(csvFilePath).split(path.sep).pop();
		const timestamp = parseInt(bn.split('_')[1]);
		return this._client.updateAsync({
			index: 'collection',
			type: 'meta',
			id: 1,
			body: {
				doc: {
					hasImportedCSV: true,
					lastCSVImportTimestamp: timestamp,
				},
			},
		});
	}

	/**
	 * Returns a description of the Elasticsearch index.
	 * @return {Promise} Resolves to a description of the Elasticsearch index
	 */
	description() {
		return this.collectionIndexExists().then((res) => {
			if (!res) {
				return { status: 'uninitialized' };
			} else {
				const metaGetter = new Promise((resolve, reject) => {
					this._client.get({
						index: 'collection',
						type: 'meta',
						id: 1,
					}, (error, response) => {
						if (error) {
							reject(error);
						} else {
							resolve({
								hasImportedCSV: response._source.hasImportedCSV,
								lastCSVImportTimestamp: response._source.lastCSVImportTimestamp,
								lastImportedCSV: response._source.hasImportedCSV ? `csv_${response._source.lastCSVImportTimestamp}` : null,
							});
						}
					});
				});

				const countGetter = new Promise((resolve, reject) => {
					this._client.count({
						index: 'collection',
						type: 'object',
					}, (error, response) => {
						if (error) {
							reject(error);
						} else {
							resolve({
							count: response.count || 0,
						});
						}
					});
				});

				return Promise.all([metaGetter, countGetter]).then((res) => {
					const [meta, count] = res;
					return Object.assign({}, meta, count);
				});
			}
		})
	}

	/**
	 * Public wrapper for _prepareIndexForSync, which creates the index and metadata document
	 * @return {Promise} Resolved when the elasticsearch request completes
	 */
	initialize() {
		return this._prepareIndexForSync();
	}

	/**
	 * Attempts to synchronize the Elasticsearch index with the given CSV export
	 * If the index has already been synchronized with a CSV file, then this function will compare the CSV
	 * file to be imported with the previous file. Only the differences between the two will be used to
	 * update Elasticsearch. If the previous file cannot be found, or if the two CSV files have different
	 * headers, then the Elasticsearch index will be cleared before updating.
	 * @param {string} csvExport - Name of the CSV export to synchronize with ES
	 * @return {Promise} Resolved when the synchronization is complete
	 * @throws {ESCollectionException}
	 */
	syncESToCSV(csvExport) {
		const csvFilePath = path.join(this._csvRootDir, csvExport, 'objects.csv');

		return this._prepareIndexForSync().then(() => {
			return this._getLastCSVName();
		}).then((lastCSVName) => {
			const canDiff = (lastCSVName !== null);
			if (canDiff) {
				const lastCSVFilePath = path.join(this._csvRootDir, lastCSVName, 'objects.csv');
				if (!fs.existsSync(lastCSVFilePath)) {
					logger.info("Can't find previously imported CSV --- importing all objects from " + lastCSVName);
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
			logger.info('No previous CSV file has been imported --- importing all objects from ' + lastCSVName);
			return false;
		}).then((tryToDiff) => {
			if (tryToDiff) {
				logger.info('Updating from previously imported CSV');
				return this._updateESWithCSV(csvExport);
			}
			logger.info(`Initializing with CSV ${csvFilePath}`);
			return this.clearCollectionObjects().then(res => this._syncESWithCSV(csvExport));
		});
	}
};

/**
 * Exceptions thrown by the {@link ESCollection} class
 * @constructor ESCollectionException
 * @memberof ESCollection
 * @static
 */
ESCollection.ESCollectionException = function(message) {
	this.message = message;
	this.name = 'ESCollectionException';
}

module.exports = ESCollection;
