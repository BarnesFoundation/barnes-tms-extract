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
 * @memberof Elasticsearch
 */
function ESPlugin(options) {
	const host = options.host;

	/**
	 * Returns a description of the Elasticsearch collection index
	 * @name desc
	 * @memberof ESPlugin
	 * @see {@link ESCollection.description}
	 */
	this.add('role:es,cmd:desc', (msg, respond) => {
		const esCollection = new ESCollection(host);
		const websocketUpdater = new WebsocketUpdater('es', port, esCollection);
		esCollection.init().then(() => {
			esCollection.description().then((res) => {
				respond(null, res);
			});
		});
	});

	/**
	 * Synchronizes the Elasticsearch collection index with a given CSV file
	 * msg.csv must be a string that is the path to a CSV file
	 * Returns a description of the Elasticsearch collection index on completion
	 * @name sync
	 * @member {function}
	 * @see {@link ESCollection.syncESToCSV}
	 */
	this.add('role:es,cmd:sync', (msg, respond) => {
		const csvPath = msg.csv;
		const esCollection = new ESCollection(host);
		const websocketUpdater = new WebsocketUpdater('es', port, esCollection);
		esCollection.init().then(() => esCollection.syncESToCSV(csvPath)).then((res) => {
			esCollection.description().then((res) => {
				respond(null, res);
			});
		});
	});
}

module.exports = es;
