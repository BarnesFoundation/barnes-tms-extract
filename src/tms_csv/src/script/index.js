const TMSExporter = require('./tmsExporter.js');

const config = require('config');

const credentials = config.Credentials.tms;

const tmsExporter = new TMSExporter(credentials);

tmsExporter.exportCSV(config.TMS.export).then(() => {
	console.log('All done!!');
});
