const ExportConfig = require('./exportConfig.js');
const CSVWriter = require('./csvWriter.js');
const TMSURLReader = require('./tmsURLReader.js');
const WarningReporter = require('./warningReporter.js');
const logger = require('./logger.js');

const fs = require('fs');
const _ = require('lodash');

// const configFile = "./searchConfig.json";

module.exports = class TMSExporter {
	constructor(credentials) {
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
			total: this._totalObjectCount,
		};
	}

	_finishExport() {
		this._active = false;
		this._csv.end();
		this._warningReporter.end();
	}

	_loadCredentials(credsPath) {
		logger.info(`Loading credentials at ${credsPath}`);
		const creds = fs.readFileSync(credsPath, 'utf8');

		if (!creds) {
			logger.error(`Could not load credentials at ${credsPath}`);
			logger.info(`Make sure there is a json file at ${credsPath} containing your eMuseum API key, and/or your username and passwork`);
		}

		return JSON.parse(creds);
	}

	_processTMS(credentials, config, csvOutputDir) {
		this._active = true;
		this._processedObjectCount = 0;
		this._totalObjectCount = 0;

		let limitOutput = false;

		const name = 'objects';

		const collectionFields = config.fields;

		const tms = new TMSURLReader(credentials);

		const csvFilePath = `${csvOutputDir}/${name}.csv`;

		this._csv = new CSVWriter(csvFilePath);
		this._warningReporter = new WarningReporter(csvOutputDir, config);
		if (config.debug && config.debug.limit) {
			limitOutput = true;
			logger.info(`Limiting output to ${config.debug.limit} entires`);
		}

		tms.rootURL = config.apiURL;
		tms.path = '';
		logger.info(`Processing collection ${name} with url ${tms.collectionURL}`);

		const processTMSHelper = () => {
			return tms.next().then((artObject) => {
				if (artObject) {
					let id = artObject.descriptionWithFields([config.primaryKey])[config.primaryKey];
					let description = artObject.descriptionWithFields(config.fields);
					logger.debug(description);
					this._csv.write(description);
					this._warningReporter.appendFieldsForObject(id, artObject, description);

					this._processedObjectCount++;
					if (this._processedObjectCount % 100 === 0) {
						logger.info(`Processed ${this._processedObjectCount} of ${this._totalObjectCount} collection objects`)
					}
					if (limitOutput && this._processedObjectCount >= config.debug.limit) {
						logger.info(`Reached ${this._processedObjectCount} collection objects processed, finishing`);
						this._finishExport();
					} else {
						return processTMSHelper();
					}
				} else {
					processTMSHelper();
				}
			} else {
				this._finishExport();
			}
		}, (error) => {
			logger.warn(error);
			logger.info('Error fetching collection object, skipping');
			tms.hasNext().then((res) => {
				if (!res) {
					this._finishExport();
				} else {
					processTMSHelper();
				}
			}, (error) => {
				logger.warn(error);
				logger.info(`Error fetching collection object, skipping`);
				tms.hasNext().then((res) => {
					if (!res) {
						this._finishExport();
					} else {
						return processTMSHelper();
					}
				}, (error) => {
					logger.error(error);
					logger.info(`Error fetching collection data, finishing`);
					this._finishExport();
				});
			});
		});

		return tms.getObjectCount().then((res) => {
			this._totalObjectCount = res;
			logger.info(`Processing ${this._totalObjectCount} collection objects`);
			return processTMSHelper();
		}, (err) => {
			logger.error(error);
			this._finishExport();
		});
	}

	exportCSV(configFile) {
		logger.info('Beginning CSV export');

		const config = new ExportConfig(configFile);

		const outputFolderName = `csv_${new Date().getTime()}`;
		const outputPath = `${config.outputDirectory}/${outputFolderName}`;
		logger.info(`Creating CSV output directory ${outputPath}`);
		fs.mkdirSync(outputPath);

		logger.info(`Reading TMS API from root URL ${config.apiURL}`);

		return this._processTMS(this._credentials, config, outputPath);
	}
};
