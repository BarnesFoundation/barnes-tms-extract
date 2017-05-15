const logger = require('./esLogger.js');
const mapping = require('config').mapping;
const {
	doCSVKeysMatch,
	diffCSV,
} = require('../../../util/csvUtil.js');
const UpdateEmitter = require('../../../util/updateEmitter.js');

const csv = require('fast-csv');
const config = require('config');
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
 * @param {string} esOptions - Options dictionary used to initialize an elasticsearch client
 * @param {string} csvRootDirectory - Path to the directory containing csv_* directories with exports from TMS
 */
class ESCollection extends UpdateEmitter {
	constructor(esOptions, csvRootDirectory) {
		super();
		this._client = new elasticsearch.Client( esOptions );
		Promise.promisifyAll(this._client);
		Promise.promisifyAll(this._client.cat);
		Promise.promisifyAll(this._client.indices);
		this._csvRootDir = csvRootDirectory;
		this._running = false;
	}

	/** @property {ESCollection~ESImportStatus} status
	 * @override
	 */
	get status() {
		return this.description();
	}

	/**
	 * Analyze a JSON object before sending it to be stored in ES, decorating it
	 * with additional KV pairs and filtering out bad characters
	 */
	_analyzedData(data) {
		const onViewPrefix = 'Barnes Foundation (Philadelphia), Collection Gallery';

		// Turn empty strings into null
		let dataCopy = Object.assign({}, data);
		dataCopy.id = parseInt(dataCopy.id);
		dataCopy = _.mapValues(dataCopy, (v, k) => {
			if (v === '') return null;
			return v;
		});

		// Add a KV pair for onView, if the data has a field called locations
		if (_.has(dataCopy, 'locations')) {
			const location = dataCopy.locations;
			const onView = location.includes(onViewPrefix);
			dataCopy.onView = onView;
		}

		// Add a room, if the data is on view
		if (dataCopy.onView === true) {
			const location = dataCopy.locations;
			const start = location.indexOf(onViewPrefix) + onViewPrefix.length;
			const sections = location.substr(start).split(',');
			if (sections.length >= 2) {
				dataCopy.room = sections[1].trim();
			}
		}

		// Add a wall, if the data is on view
		if (dataCopy.onView === true) {
			const location = dataCopy.locations;
			if (location.includes('North Wall')) dataCopy.wall = 'north';
			if (location.includes('South Wall')) dataCopy.wall = 'south';
			if (location.includes('East Wall')) dataCopy.wall = 'east';
			if (location.includes('West Wall')) dataCopy.wall = 'west';
		}

		return dataCopy;
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
			body: mapping
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
		const dataCopy = this._analyzedData(data);
		return this._client.updateAsync({
			index: 'collection',
			type: 'object',
			id: dataCopy.id,
			body: {
				doc: dataCopy,
				doc_as_upsert: true
			}
		});
	}

	/**
	 * Removes the collection index
	 * @return {Promise} Resolved when the elasticsearch request completes
	 */
	_deleteCollectionIndex() {
		return this._collectionIndexExists().then((res) => {
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
			return `csv_${res._source.lastCSVImportTimestamp}`;
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
		return new Promise((resolve, reject) => {
			try {
				csv
					.fromPath(csvFilePath, { headers: true })
					.on('data', (data) => {
						this._createDocumentWithData(data, this._client);
					})
					.on('end', () => {
						this._updateMetaForCSVFile(csvExport).then(() => {
							logger.info('Finished export');
							this.completed();
							resolve();
						});
					});
			} catch (e) {
				reject(e);
			}
		});
	}

	_updateDocumentWithData(docId, data) {
		const dataCopy = this._analyzedData(data);
		return this._client.updateAsync({
			index: 'collection',
			type: 'object',
			id: docId,
			body: {
				doc: dataCopy,
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
	 * Removes all objects from the collections index and resets the meta document
	 * @return {Promise} Resolves to a description of the Elasticsearch index
	 */
	clearCollectionObjects() {
		return this._collectionIndexExists().then((res) => {
			if (res) {
				return this._client.updateAsync({
					index: 'collection',
					type: 'meta',
					id: 1,
					body: {
						doc: {
							hasImportedCSV: false,
							lastCSVImportTimestamp: 0,
						},
					},
				}).then((res) => {
					return this._client.deleteByQueryAsync({
						conflicts: 'proceed',
						index: 'collection',
						type: 'object',
						body: {
							query: {
								match_all: {},
							},
						},
					});
				});
			}
		});
	}

	completed() {
		this._running = false;
		super.completed();
	}

	/**
	 * Returns a description of the Elasticsearch index.
	 * @return {Promise} Resolves to a description of the Elasticsearch index
	 */
	description() {
		logger.info("Description began");
		return this._collectionIndexExists().then((res) => {
			if (!res) {
				return { status: 'uninitialized' };
			} else {
				const metaGetter = this._client.getAsync({
					index: 'collection',
					type: 'meta',
					id: 1,
				}).then((response) => {
					return {
						hasImportedCSV: response._source.hasImportedCSV,
						lastCSVImportTimestamp: response._source.lastCSVImportTimestamp,
						lastImportedCSV: response._source.hasImportedCSV ? `csv_${response._source.lastCSVImportTimestamp}` : null,
					};
				});

				const countGetter = this._client.countAsync({
					index: 'collection',
					type: 'object',
				}).then((response) => {
					return {
						count: response.count || 0
					}
				});

				return Promise.all([metaGetter, countGetter]).then((res) => {
					const [meta, count] = res;
					logger.info("Description complete");
					return Object.assign({running: this._running}, meta, count);
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
	 * Performs a simple query search using the given elasticsearch query
	 * @param {string} query - The search query
	 * @return {Promise} Resolves to the result of the elasticsearch query on completion
	 */
	search(query) {
		console.log("Searching for ", query);
		return this._client.search({
			index: 'collection',
			q: query
		});
	}

	started() {
		this._running = true;
		super.started();
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
					logger.info("Can't find previously imported CSV --- importing all objects from " + csvExport);
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
			logger.info('No previous CSV file has been imported --- importing all objects from ' + csvExport);
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
