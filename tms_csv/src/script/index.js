const TMSExporter = require('./tmsExporter.js');

const argv = require('minimist')(process.argv.slice(2));

const configFile = argv.config;
const credfile = argv.creds;

const tmsExporter = new TMSExporter(credfile);

tmsExporter.exportCSV(configFile).then( () => {
	console.log("All done!!");
});
