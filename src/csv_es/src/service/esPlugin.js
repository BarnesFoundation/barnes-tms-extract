const ESCollection = require('../script/esCollection.js');
const WebsocketUpdater = require('../../../util/websocketUpdater.js');

const config = require('config');
const fs = require('fs');
const path = require('path');

const port = config.Server.port;

/**
 * Seneca plugin for coordinating with the Elasticsearch importer
 * @constructor
 * @see {@link ESCollection}
 */
function ESPluginAPI(options) {
	const host = options.host;

	/**
	 * Returns a description of the Elasticsearch collection index
	 * @alias desc
	 * @memberof ESPluginAPI
	 * @instance
	 * @see {@link ESCollection#description}
	 * @param {object} msg - unused
	 * @param {function} respond - Callback receiving the index description
	 */
	const	descHandler = (msg, respond) => {
		const esCollection = new ESCollection(host);
		const websocketUpdater = new WebsocketUpdater('es', port, esCollection);
		esCollection.init().then(() => {
			esCollection.description().then((res) => {
				respond(null, res);
			});
		});
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
	const syncHandler = (msg, respond) => {
		const csvPath = msg.csv;
		const esCollection = new ESCollection(host);
		const websocketUpdater = new WebsocketUpdater('es', port, esCollection);
		esCollection.init().then(() => esCollection.syncESToCSV(csvPath)).then((res) => {
			esCollection.description().then((res) => {
				respond(null, res);
			});
		});
	}

	this.add('role:es,cmd:desc', descHandler);
	this.add('role:es,cmd:sync', syncHandler);
}

module.exports = ESPluginAPI;
