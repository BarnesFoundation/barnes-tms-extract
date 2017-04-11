const config = require('config');
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

	active() {
		return { active: this._tmsExporter.active };
	}

	cancel() {
		if (this._tmsExporter.active) this._tmsExporter.cancelExport();
		return { time: lastStartTime(logfile) };
	}

	info() {
		return {
			startTime: lastStartTime(this._logfile),
			completeTime: lastCompleteTime(this._logfile),
			active: this._tmsExporter.status.active,
			progress: this._tmsExporter.status,
			updatePort: this._exportProcessPort,
		};
	}

	run() {
		if (this._tmsExporter.active) {
			return { time: lastStartTime(this._logfile) };
		} else {
			this._tmsExporter.exportCSV(this._exportConfig)
				.then((res) => {
					if (res.status === 'COMPLETED') {
						this.seneca.act('role:es,cmd:sync', { csv: res.csv }, (err, result) => {
							logger.info('ES Sync completed');
							logger.info(result);
						});
						this.seneca.act('role:images,cmd:tile', () => {
							logger.info('Images tile and sync begun');
						});
					}
				});
			return { time: lastStartTime(this._logfile) };
		}
	}
}

module.exports = makeAPI('role:tmstocsv', TMSExportAPI);
