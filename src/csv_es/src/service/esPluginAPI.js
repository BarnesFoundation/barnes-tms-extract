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
 */
class ESPluginAPI extends SenecaPluginAPI {
	constructor(seneca, options) {
		super(seneca, options);
		this._host = options.host;
	}

	/**
	 * Returns a description of the Elasticsearch collection index
	 * @see {@link ESCollection#description}
	 * @return {Promise} Resolves to a description of the Elasticsearch collection index
	 */
	desc() {
		const esCollection = new ESCollection(this._host);
		const websocketUpdater = new WebsocketUpdater('es', port, esCollection);
		return esCollection.init()
		 .then(() => esCollection.description());
	}

	/**
	 * Synchronizes the Elasticsearch collection index with a given CSV file
	 * @see {@link ESCollection#syncESToCSV}
	 * @param {string} csv - Path to the CSV file with which to synchronize
	 * @return {Promise} Resolves to a description of the Elasticsearch collection index after sync
	 */
	sync(csv) {
		const csvPath = csv;
		const esCollection = new ESCollection(this._host);
		const websocketUpdater = new WebsocketUpdater('es', port, esCollection);
		return esCollection.init()
		 .then(() => esCollection.syncESToCSV(csvPath))
		 .then(() => esCollection.description());
	}
}

module.exports = makeAPI('role:es', ESPluginAPI);
