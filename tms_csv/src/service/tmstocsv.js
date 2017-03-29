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
	const searchConfig = options.config;

	const credentials = options.creds;

	const logfile = options.log || './logs/all-logs.log';

	const exportProcessPort = options.port || 8001;

	const tmsExporter = new TMSExporter(credentials);

	const tmsWebsocketUpdater = new WebsocketUpdater(exportProcessPort, tmsExporter);

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
			tmsExporter.exportCSV(searchConfig).then((res) => {
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
