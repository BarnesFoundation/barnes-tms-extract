const ExportConfig = require("./exportConfig.js");
const {
	ExportMetadata,
	ExportStatus
} = require("./exportMetadata.js");
const CSVWriter = require("./csvWriter.js");
const TMSURLReader = require("./tmsURLReader.js");
const WarningReporter = require("./warningReporter.js");
const logger = require("./logger.js");

const fs = require('fs');
const path = require('path');
const _ = require("lodash");
const EventEmitter = require('events');
const iconv = require('iconv-lite');
const shell = require('shelljs');

function decodeUTF8InterpretedAsWin(str) {
	if (typeof str !== "string") return str;
	var buf = new Buffer(str);
	var newnewbuf = iconv.encode(buf, 'win-1252');
	return newnewbuf.toString();
}

function logShellOutput(op) {
	if (op.code === 0) {
		logger.info(op.stdout);
	} else {
		logger.error(op.sterr);
	}
}

module.exports = class TMSExporter extends EventEmitter {
	constructor(credentials) {
		super();
		this._credentials = this._loadCredentials(credentials);
		this._processedObjectCount = 0;
		this._totalObjectCount = 0;
		this._active = false;
	}

	get active() {
		return this._active;
	}

	get progress() {
		return {
			processed: this._processedObjectCount,
			total: this._totalObjectCount
		};
	}

	_diffCSV(config) {
		const pyDiff = path.resolve(__dirname, "../../../py_csv_diff/py_csv_diff.py");
		logger.info(`Running CSV diff python script on ${config.outputDirectory}`);
		logShellOutput(shell.exec("source activate tmsdiff"));
		logShellOutput(shell.exec(`python ${pyDiff} ${config.outputDirectory}`));
		logShellOutput(shell.exec("source deactivate"));
	}

	_finishExport(config, status) {
		this._active = false;
		this._csv.end();
		this._warningReporter.end();
		this.emit("completed");
		logger.info("CSV export completed", { tag: "tag:complete" });
		this._diffCSV(config);
	}

	_loadCredentials(credsPath) {
		logger.info(`Loading credentials at ${credsPath}`);
		const creds = fs.readFileSync(credsPath, "utf8");

		if (!creds) {
			logger.error(`Could not load credentials at ${credsPath}`);
			logger.info(`Make sure there is a json file at ${credsPath} containing your eMuseum API key, and/or your username and passwork`);
		}

		return JSON.parse(creds);
	}

	_processTMS(credentials, config, csvOutputDir) {
		this._active = true;
		this.emit("started");
		this._processedObjectCount = 0;
		this._totalObjectCount = 0;

		let limitOutput = false;

		const name = "objects";

		const collectionFields = config.fields;

		const tms = new TMSURLReader(credentials);

		const csvFilePath = `${csvOutputDir}/${name}.csv`;

		this._exportMeta = new ExportMetadata(`${csvOutputDir}/meta.json`);
		this._exportMeta.status = ExportStatus.INCOMPLETE;
		this._csv = new CSVWriter(csvFilePath);
		this._warningReporter = new WarningReporter(csvOutputDir, config);
		if (config.debug && config.debug.limit) {
			limitOutput = true;
			logger.info(`Limiting output to ${config.debug.limit} entires`);
		}

		tms.rootURL = config.apiURL;
		tms.path = "";
		logger.info(`Processing collection ${name} with url ${tms.collectionURL}`);

		const processTMSHelper = () => {
			return tms.next().then((artObject) => {
				if (!this._active) {
					this._finishExport(config, ExportStatus.CANCELLED);
					return;
				}

				if (artObject) {
					let id = artObject.descriptionWithFields([config.primaryKey])[config.primaryKey];
					let description = artObject.descriptionWithFields(config.fields);
					_.forOwn(description, function(value, key) {
						description[key] = decodeUTF8InterpretedAsWin(value);
					});
					logger.debug(description);
					this._csv.write(description);
					this._warningReporter.appendFieldsForObject(id, artObject, description);

					this._processedObjectCount++;
					this.emit('progress');
					if (this._processedObjectCount % 100 === 0) {
						logger.info(`Processed ${this._processedObjectCount} of ${this._totalObjectCount} collection objects`)
					}
					if (limitOutput && this._processedObjectCount >= config.debug.limit) {
						logger.info(`Reached ${this._processedObjectCount} collection objects processed, finishing`);
						this._finishExport(config, ExportStatus.COMPLETED);
					} else {
						return processTMSHelper();
					}
				} else {
					this._finishExport(config, ExportStatus.COMPLETED);
				}
			}, (error) => {
				logger.warn(error);
				logger.info(`Error fetching collection object, skipping`);
				tms.hasNext().then((res) => {
					if (!res) {
						this._finishExport(config, ExportStatus.COMPLETED);
					} else {
						return processTMSHelper();
					}
				}, (error) => {
					logger.error(error);
					logger.info(`Error fetching collection data, finishing`);
					this._finishExport(config, ExportStatus.ERROR);
				});
			});
		}

		return tms.getObjectCount().then((res) => {
			this._totalObjectCount = res;
			logger.info(`Processing ${this._totalObjectCount} collection objects`);
			return processTMSHelper();
		}, (err) => {
			logger.error(error);
			this._finishExport(config, ExportStatus.ERROR);
		});
	}

	cancelExport() {
		logger.info("Cancelling CSV export", { tag: "tag:cancel" });
		this._active = false;
		this._exportMeta.status = ExportStatus.CANCELLED;
	}

	exportCSV(configFile) {
		logger.info("Beginning CSV export", { tag: "tag:start" });

		const config = new ExportConfig(configFile);

		const outputFolderName = `csv_${new Date().getTime()}`;
		const outputPath = config.outputDirectory + "/" + outputFolderName;
		logger.info(`Creating CSV output directory ${outputPath}`);
		fs.mkdirSync(outputPath);

		logger.info(`Reading TMS API from root URL ${config.apiURL}`);

		return this._processTMS(this._credentials, config, outputPath);
	}
}
