const ESCollection = require('../script/esCollection.js');
const WebsocketUpdater = require('../../../util/websocketUpdater.js');

const config = require('config');
const fs = require('fs');
const path = require('path');

const csvDir = config.CSV.path;
const port = config.Server.port;

function es(options) {

	console.dir(options);

	const host = options.host || 'localhost:9200';

	this.add('role:es,cmd:desc', (msg, respond) => {
		const esCollection = new ESCollection(host);
		const websocketUpdater = new WebsocketUpdater("es", port, esCollection);
		esCollection.init().then(() => {
			esCollection.description().then((res) => {
				respond(null, res);
			});
		});
	});

	this.add('role:es,cmd:sync', (msg, respond) => {
		const csvPath = msg.csv;
		const esCollection = new ESCollection(host);
		const websocketUpdater = new WebsocketUpdater("es", port, esCollection);
		esCollection.init().then(() => {
			return esCollection.syncESToCSV(csvPath);
		}).then((res) => {
			esCollection.description().then((res) => {
				respond(null, res);
			})
		});
	});
}

module.exports = es;
