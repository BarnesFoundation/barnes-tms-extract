const ESCollection = require('./esCollection.js');
const logger = require('./esLogger.js');

const esHost = 'localhost:9200';

const argv = require('minimist')(process.argv.slice(2));

const esCollection = new ESCollection(esHost);

const csvRootDir = argv._[0];

const targetCSV = argv._[1];

esCollection.init().then(() => return esCollection.clearCollectionObjects).then(() => {
	return esCollection.syncESToCSV(path.join(csvRootDir, targetCSV, "objects.csv"));
}).then(() => {
	logger.info("Updated to csv " + targetCSV);
});
