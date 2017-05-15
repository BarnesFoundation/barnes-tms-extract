const ESCollection = require('../script/esCollection.js');
const WebsocketUpdater = require('../../../util/websocketUpdater.js');
const { SenecaPluginAPI, makeAPI } = require('../../../util/senecaPluginAPI.js');

const config = require('config');
const fs = require('fs');
const path = require('path');

const port = config.Server.port;

/**
 * Seneca plugin for coordinating with the Elasticsearch importer
 * @see {@link ESCollection}
 * @param {string} options.host - Hostname for the Elasticsearch server
 * @param {string} options.csvDir - Path to the root CSV export directory
 */
class ESPluginAPI extends SenecaPluginAPI {
	constructor(seneca, options) {
		super(seneca, options);

		this._esOptions = options.esOptions;

		this._csvDir = options.csvDir;
	}

	get name() { return "es"; }

	_makeOptionsForClient() {
		let esCredentials = null;
		if (this._esOptions.credentials) {
			const upass = config.Credentials.es[this._esOptions.credentials];
			esCredentials = `${upass.username}:${upass.password}`;
		}

		return {
			host: [
				{
					host: this._esOptions.host,
					auth: esCredentials || undefined,
					protocol: this._esOptions.protocol || 'http',
					port: this._esOptions.port || 9200
				}
			]
		};
	}

	/**
	 * Returns a description of the Elasticsearch collection index
	 * @see {@link ESCollection#description}
	 * @return {Promise} Resolves to a description of the Elasticsearch collection index
	 */
	desc() {
		const esCollection = new ESCollection(this._makeOptionsForClient(), this._csvDir);
		const websocketUpdater = new WebsocketUpdater('es', port, esCollection);
		return esCollection.description();
	}

	/**
	 * Synchronizes the Elasticsearch collection index with a given CSV file
	 * @see {@link ESCollection#syncESToCSV}
	 * @param {string} csv - Name of the CSV export with which to sync
	 * @return {Promise} Resolves to a description of the Elasticsearch collection index after sync
	 */
	sync(csv) {
		const esCollection = new ESCollection(this._makeOptionsForClient(), this._csvDir);
		const websocketUpdater = new WebsocketUpdater('es', port, esCollection);
		esCollection.syncESToCSV(csv);
		console.log("Returning description");
		return esCollection.description();
	}

	/**
	 * Performs an elasticsearch query and returns the results as JSON
	 * @see {@link ESCollection#search}
	 * @param {string} query - Query to pass to Elasticsearch simple search
	 * @return {Promise} Resolves to the JSON returned from ES
	 */
	search(query) {
		const esCollection = new ESCollection(this._makeOptionsForClient(), this._csvDir);
		const websocketUpdater = new WebsocketUpdater('es', port, esCollection);
		return esCollection.search(query);
	}
}

module.exports = makeAPI('role:es', ESPluginAPI);
