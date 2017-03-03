const io = require('socket.io');
const TMSExporter = require('../tms_csv/src/tmsExporter.js');
const TMSWebsocketUpdater = require('./tmsWebsocketUpdater.js');
const {
	lastStartTime,
	lastCompleteTime
} = require("./tmsLog.js");

const tmsExporter = new TMSExporter('../tms_csv/credentials.json');

const exportProcessPort = 8001;

const searchConfig = '../tms_csv/searchConfig.json';

const tmsWebsocketUpdater = new TMSWebsocketUpdater(exportProcessPort, tmsExporter);

function tmstocsv(options) {
	this.add('role:tmstocsv,cmd:info', (msg, respond) => {
    const data = {
      startTime: lastStartTime(),
      completeTime: lastCompleteTime(),
      active: tmsExporter.active,
      progress: tmsExporter.progress,
      updatePort: exportProcessPort
    };
		respond(null, data);
	});

	this.add('role:tmstocsv,cmd:run', function run(msg, respond) {
		if (tmsExporter.active) {
			respond(null, { time: lastStartTime() });
		} else {
			tmsExporter.exportCSV(searchConfig);
			respond(null, { time: lastStartTime() });
		}
	});

	this.add('role:tmstocsv,cmd:cancel', function cancel(msg, respond) {
		if (tmsExporter.active) {
			tmsExporter.cancelExport();
			respond(null, { time: lastStartTime() });
		} else {
			respond(null, { time: lastStartTime() });
		}
	});

	this.add('role:tmstocsv,cmd:active', function run(msg, respond) {
		respond(null, { active: tmsExporter.active });
	});
}

module.exports = tmstocsv;
