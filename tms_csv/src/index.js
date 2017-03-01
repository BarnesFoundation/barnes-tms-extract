const TMSExporter = require('./tmsExporter.js');

const configFile = './searchConfig.json';
const credfile = './credentials.json';

const tmsExporter = new TMSExporter(credfile);

tmsExporter.exportCSV(configFile).done();
