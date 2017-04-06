const ExportConfig = require('./exportConfig.js');
const {
	ExportMetadata,
	ExportStatus,
} = require('./exportMetadata.js');
const CSVWriter = require('./csvWriter.js');
const TMSURLReader = require('./tmsURLReader.js');
const WarningReporter = require('./warningReporter.js');
const UpdateEmitter = require('../../../util/updateEmitter.js');
const logger = require('./logger.js');

const config = require('config');
const EventEmitter = require('events');
const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const iconv = require('iconv-lite');

function decodeUTF8InterpretedAsWin(str) {
	if (typeof str !== 'string') return str;
	const buf = new Buffer(str);
	const newnewbuf = iconv.encode(buf, 'win-1252');
	return newnewbuf.toString();
}

module.exports = class TMSExporter extends UpdateEmitter {
	constructor(credentials) {
		super();
		this._credentials = credentials;
		this._processedObjectCount = 0;
		this._totalObjectCount = 0;
		this._active = false;
	}

	get active() {
		return this._active;
	}

	get csvFilePath() {
		return this._csvFilePath;
	}

	get status() {
		return {
			active: this._active,
			csv: this._csvFilePath,
			processed: this._processedObjectCount,
			total: this._totalObjectCount,
			status: (this._exportMeta ? this._exportMeta.status : null)
		};
	}

	_finishExport(config, status) {
		this._active = false;
		this._csv.end();
		this._warningReporter.end();
		this.completed();
		logger.info('CSV export completed', { tag: 'tag:complete' });
		this._exportMeta.status = status;
	}

	_processTMS(credentials, exportConfig, csvOutputDir) {
		this._active = true;
		this._processedObjectCount = 0;
		this._totalObjectCount = 0;

		let limitOutput = false;

		const name = 'objects';

		const collectionFields = exportConfig.fields;

		const tms = new TMSURLReader(credentials);

		const csvFilePath = `${csvOutputDir}/${name}.csv`;
		this._csvFilePath = csvFilePath;

		this._exportMeta = new ExportMetadata(`${csvOutputDir}/meta.json`);
		this._exportMeta.status = ExportStatus.INCOMPLETE;
		this._csv = new CSVWriter(csvFilePath);
		this._warningReporter = new WarningReporter(csvOutputDir, exportConfig);
		if (exportConfig.debug && exportConfig.debug.limit) {
			limitOutput = true;
			this._totalObjectCount = exportConfig.debug.limit;
			this._exportMeta.totalObjects = this._totalObjectCount;
			logger.info(`Limiting output to ${exportConfig.debug.limit} entires`);
		}

		tms.rootURL = exportConfig.apiURL;
		tms.path = '';
		logger.info(`Processing collection ${name} with url ${tms.collectionURL}`);

		const processTMSHelper = () => tms.next().then((artObject) => {
			if (!this._active) {
				this._finishExport(exportConfig, ExportStatus.CANCELLED);
			}

			if (artObject) {
				const id = artObject.descriptionWithFields([exportConfig.primaryKey])[exportConfig.primaryKey];
				const description = artObject.descriptionWithFields(exportConfig.fields);
				_.forOwn(description, (value, key) => {
					description[key] = decodeUTF8InterpretedAsWin(value);
				});
				logger.debug(description);
				this._csv.write(description);
				this._warningReporter.appendFieldsForObject(id, artObject, description);

				this._processedObjectCount++;
				this._exportMeta.processedObjects = this._processedObjectCount;
				this.progress();
				if (this._processedObjectCount % 100 === 0) {
					logger.info(`Processed ${this._processedObjectCount} of ${this._totalObjectCount} collection objects`);
				}
				if (limitOutput && this._processedObjectCount >= exportConfig.debug.limit) {
					logger.info(`Reached ${this._processedObjectCount} collection objects processed, finishing`);
					this._finishExport(exportConfig, ExportStatus.COMPLETED);
				} else {
					return processTMSHelper();
				}
			} else {
				this._finishExport(exportConfig, ExportStatus.COMPLETED);
			}
		}, (error) => {
			logger.warn(error);
			logger.info('Error fetching collection object, skipping');
			tms.hasNext().then((res) => {
				if (!res) {
					this._finishExport(exportConfig, ExportStatus.COMPLETED);
				} else {
					return processTMSHelper();
				}
			}, (error) => {
				logger.error(error);
				logger.info('Error fetching collection data, finishing');
				this._finishExport(exportConfig, ExportStatus.ERROR);
			});
		});

		this._exportMeta.processedObjects = 0;
		this.started();

		if (limitOutput) {
			logger.info(`Processing ${this._totalObjectCount} collection objects`);
			return processTMSHelper();
		} else {
			return tms.getObjectCount().then((res) => {
				this._totalObjectCount = res;
				this._exportMeta.totalObjects = this._totalObjectCount;
				logger.info(`Processing ${this._totalObjectCount} collection objects`);
				return processTMSHelper();
			}, (err) => {
				logger.error(error);
				this._finishExport(exportConfig, ExportStatus.ERROR);
			});
		}
	}

	cancelExport() {
		logger.info('Cancelling CSV export', { tag: 'tag:cancel' });
		this._active = false;
		this._exportMeta.status = ExportStatus.CANCELLED;
	}

	exportCSV(configJSON) {
		logger.info('Beginning CSV export', { tag: 'tag:start' });

		const exportConfig = new ExportConfig(configJSON);

		const outputFolderName = `csv_${new Date().getTime()}`;
		const outputPath = `${exportConfig.outputDirectory}/${outputFolderName}`;
		logger.info(`Creating CSV output directory ${outputPath}`);
		fs.mkdirSync(outputPath);

		logger.info(`Reading TMS API from root URL ${exportConfig.apiURL}`);

		return this._processTMS(this._credentials, exportConfig, outputPath).then(res => this.status);
	}
};
