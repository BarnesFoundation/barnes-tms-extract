const config = require('config');
const path = require('path');
const TMSExporter = require('../script/tmsExporter.js');
const WebsocketUpdater = require('../../../util/websocketUpdater.js');
const {
	lastStartTime,
	lastCompleteTime,
} = require('./tmsLog.js');
const logger = require('../script/logger.js');
const { SenecaPluginAPI, makeAPI } = require('../../../util/senecaPluginAPI.js');

class TMSExportAPI extends SenecaPluginAPI {
	constructor(seneca, options) {
		super(seneca, options);
		this._exportConfig = config.TMS.export;
		this._credentials = config.Credentials.tms;
		this._logfile = options.log || config.TMS.log;
		this._exportProcessPort = options.port || 3000;
		this._tmsExporter = new TMSExporter(this._credentials);
		this._tmsWebsocketUpdater = new WebsocketUpdater('tmstocsv', this._exportProcessPort, this._tmsExporter);
	}

	get name() { return "tmstocsv"; }

	active() {
		return { active: this._tmsExporter.active };
	}

	cancel() {
		if (this._tmsExporter.active) this._tmsExporter.cancelExport();
		return { time: lastStartTime(logfile) };
	}

	info() {
		return Object.assign({
			startTime: lastStartTime(this._logfile),
			completeTime: lastCompleteTime(this._logfile),
			updatePort: this._exportProcessPort
		}, this._tmsExporter.status);
	}

	run() {
		if (this._tmsExporter.active) {
			return { time: lastStartTime(this._logfile) };
		} else {
			this._tmsExporter.exportCSV(this._exportConfig);
			return { time: lastStartTime(this._logfile) };
		}
	}
}

module.exports = makeAPI('role:tmstocsv', TMSExportAPI);
