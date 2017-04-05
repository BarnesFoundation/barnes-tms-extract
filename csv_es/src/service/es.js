const ESCollection = require('../script/esCollection.js');
const WebsocketUpdater = require('../../../util/websocketUpdater.js');
const csvDir = '../../../dashboard/public/output';

const fs = require('fs');
const path = require('path');

function es(options) {

	console.dir(options);

	const host = options.host || 'localhost:9200';

	this.add('role:es,cmd:desc', (msg, respond) => {
		const esCollection = new ESCollection(host);
		const websocketUpdater = new WebsocketUpdater("es", 3000, esCollection);
		esCollection.init().then(() => {
			esCollection.description().then((res) => {
				respond(null, res);
			});
		});
	});

	this.add('role:es,cmd:sync', (msg, respond) => {
		const csvPath = msg.csv;
		const esCollection = new ESCollection(host);
		const websocketUpdater = new WebsocketUpdater("es", 3000, esCollection);
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
