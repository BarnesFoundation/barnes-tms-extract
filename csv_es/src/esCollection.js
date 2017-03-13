const csv = require('fast-csv');
const elasticsearch = require('elasticsearch');

module.exports = class ESCollection {
	constructor(esHost) {
		this._esHost = esHost;
		this._client = new elasticsearch.Client({
			host: this._esHost,
			log: 'trace'
		});
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
				id: 1
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
					lastCSVImportTimestamp: 0
				}
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
	_pushCSVDataToES(data) {
		const dataCopy = Object.assign({}, data);
		dataCopy.id = parseInt(dataCopy.id);
		return new Promise((resolve, reject) => {
			this._client.create({
				index: 'collection',
				type: 'object',
				id: dataCopy.id,
				body: dataCopy
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
		return new Promise((resolve, reject) => {
			this._client.deleteByQuery({
				index: 'collection',
				type: 'object',
				body: {
					query: {
						match_all: {}
					}
				}
			}, (error, response) => {
				if (error) reject(error);
				resolve(response);
			});
		});
	}

	/**
	 * Must be called before trying to interact with the ES collection index. This
	 * will prepare the index by, for example, adding the collection metadata
	 * @return {Promise} Resolved when the elasticsearch request completes
	 */
	init() {
		return this._collectionMetadataExists().then((exists) => {
			if (!exists) {
				debugger;
				return this._createCollectionMetadata();
			}
		}, (error) => {
			throw error;
		});
	}

	/**
	 * Synchronize the elasticsearch index withe given CSV file
	 * @param {string} Path to the CSV file with which to synchronize
	 */
	syncESWithCSV(csvFilePath) {
		csv
			.fromPath(csvFilePath, { headers: true })
			.on('data', (data) => {
				this._pushCSVDataToES(data, this._client);
			})
			.on('end', () => {
				console.log('Finished export');
			});
	}
}
