const ESCollection = require('../script/esCollection.js');
const csvDir = '../../../dashboard/public/output';

const fs = require('fs');
const path = require('path');

function es(options) {

	console.dir(options);

	const host = options.host || 'localhost:9200';

	this.add('role:es,cmd:desc', (msg, respond) => {
		const esCollection = new ESCollection(host);
		esCollection.init().then(() => {
			esCollection.description().then((res) => {
				respond(null, res);
			});
		});
	});

	this.add('role:es,cmd:sync', (msg, respond) => {
		const csvPath = path.join(csvDir, msg.csv);
		const esCollection = new ESCollection(host);
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
