const config = require('config');
const io = require('socket.io');
const path = require('path');
const seneca = require('seneca');
const TMSExporter = require('../script/tmsExporter.js');
const WebsocketUpdater = require('../../../util/websocketUpdater.js');
const {
	lastStartTime,
	lastCompleteTime,
} = require('./tmsLog.js');
const logger = require('../script/logger.js');

function tmstocsv(options) {
	const exportConfig = config.TMS.export;

	const credentials = config.Credentials.tms;

	const logfile = options.log || config.TMS.log;

	const exportProcessPort = options.port || 3000;

	const tmsExporter = new TMSExporter(credentials);

	const tmsWebsocketUpdater = new WebsocketUpdater("tmstocsv", exportProcessPort, tmsExporter);

	this.add('role:tmstocsv,cmd:info', (msg, respond) => {
		const data = {
			startTime: lastStartTime(logfile),
			completeTime: lastCompleteTime(logfile),
			active: tmsExporter.status.active,
			progress: tmsExporter.status,
			updatePort: exportProcessPort,
		};
		respond(null, data);
	});

	this.add('role:tmstocsv,cmd:run', function run(msg, respond) {
		if (tmsExporter.active) {
			respond(null, { time: lastStartTime(logfile) });
		} else {
			tmsExporter.exportCSV(exportConfig).then((res) => {
				if (res.status === 'COMPLETED') {
					this.act('role:es,cmd:sync', { csv: res.csv }, (err, result) => {
						logger.info('ES Sync completed');
						logger.info(result);
					});
					this.act('role:images,cmd:tile', (err, result) => {
						logger.info('Images tile and sync begun.');
					});
				}
			});
			respond(null, { time: lastStartTime(logfile) });
		}
	});

	this.add('role:tmstocsv,cmd:cancel', (msg, respond) => {
		if (tmsExporter.active) {
			tmsExporter.cancelExport();
			respond(null, { time: lastStartTime(logfile) });
		} else {
			respond(null, { time: lastStartTime(logfile) });
		}
	});

	this.add('role:tmstocsv,cmd:active', (msg, respond) => {
		respond(null, { active: tmsExporter.active });
	});
}

module.exports = tmstocsv;
