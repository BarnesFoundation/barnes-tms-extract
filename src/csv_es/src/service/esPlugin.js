const ESCollection = require('../script/esCollection.js');
const WebsocketUpdater = require('../../../util/websocketUpdater.js');
const { makeAPI } = require('../../../util/makeAPI.js');

const config = require('config');
const fs = require('fs');
const path = require('path');

const port = config.Server.port;

/**
 * Seneca plugin for coordinating with the Elasticsearch importer
 * @constructor
 * @see {@link ESCollection}
 */
class ESPluginAPI {
	constructor(options) {
		this._host = options.host
	}

	/**
	 * Returns a description of the Elasticsearch collection index
	 * @alias desc
	 * @memberof ESPluginAPI
	 * @instance
	 * @see {@link ESCollection#description}
	 * @param {object} msg - unused
	 * @param {function} respond - Callback receiving the index description
	 */
	desc() {
		const esCollection = new ESCollection(this._host);
		const websocketUpdater = new WebsocketUpdater('es', port, esCollection);
		return esCollection.init()
		 .then(() => esCollection.description());
	}

	/**
	 * Synchronizes the Elasticsearch collection index with a given CSV file
	 * @alias sync
	 * @memberof ESPluginAPI
	 * @instance
	 * @see {@link ESCollection#syncESToCSV}
	 * @param {object} msg - Message passed to the seneca action
	 * @param {string} msg.csv - Path to the CSV file with which to synchronize
	 * @param {function} respond - Callback receiving the index description
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
