const config = require('config');
const path = require('path');
const TMSExporter = require('../../tms_csv/src/script/tmsExporter.js');

const credentials = config.Credentials.tms;
const exportConfig = config.TMS.export;

const tmsExporter = new TMSExporter(credentials);

const argv = require('minimist')(process.argv.slice(2));

const source = argv.d || path.resolve(__dirname, '../../data/objects');

const logger = require('../../util/logger.js')(path.join(__dirname, "logs/cron_logs.txt"));

logger.info("Beginning TMS to CSV export...");

tmsExporter.exportCSV(exportConfig)
  .then((res) => {
    if (res.status === 'COMPLETED') {
      logger.info('Export completed.');
      logger.info(res);
    }
  });
