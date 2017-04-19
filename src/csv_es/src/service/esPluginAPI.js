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
		this._host = options.host;
		this._csvDir = options.csvDir;
	}

	/**
	 * Returns a description of the Elasticsearch collection index
	 * @see {@link ESCollection#description}
	 * @return {Promise} Resolves to a description of the Elasticsearch collection index
	 */
	desc() {
		const esCollection = new ESCollection(this._host, this._csvDir);
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
		const esCollection = new ESCollection(this._host, this._csvDir);
		const websocketUpdater = new WebsocketUpdater('es', port, esCollection);
		return esCollection.syncESToCSV(csv)
		 .then(() => esCollection.description());
	}
}

module.exports = makeAPI('role:es', ESPluginAPI);
