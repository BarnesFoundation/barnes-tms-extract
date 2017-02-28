const ExportConfig = require("./exportConfig.js");
const CSVWriter = require("./csvWriter.js");
const TMSURLReader = require("./tmsURLReader.js");
const WarningReporter = require("./warningReporter.js");
const logger = require("./logger.js");

const fs = require('fs');
const _ = require("lodash");

const configFile = "./searchConfig.json";

function loadCredentials() {
	const credsPath = "./credentials.json";

	logger.info(`Loading credentials at ${credsPath}`);

	const creds = fs.readFileSync(credsPath, "utf8");

	if (!creds) {
		logger.error(`Could not load credentials at ${credsPath}`);
		logger.info(`Make sure there is a json file at ${credsPath} containing your eMuseum API key, and/or your username and passwork`);
	}

	return JSON.parse(creds);
}

function exportCSV(credentials, configFile) {

	logger.info("Beginning CSV export");

	const config = new ExportConfig(configFile);

	const outputFolderName = `csv_${new Date().getTime()}`;
	const outputPath = config.outputDirectory + "/" + outputFolderName;
	logger.info(`Creating CSV output directory ${outputPath}`);
	fs.mkdirSync(outputPath);

	logger.info(`Reading TMS API from root URL ${config.apiURL}`);

	processTMS(credentials, config, outputPath);
}

function processTMS(credentials, config, csvOutputDir) {
	let processCount = 0;

	let limitOutput = false;

	let totalObjectCount;

	const name = "objects";

	const collectionFields = config.fields;

	const tms = new TMSURLReader(credentials);

	const csvFilePath = `${csvOutputDir}/${name}.csv`;

	const csv = new CSVWriter(csvFilePath);

	const warningReporter = new WarningReporter(csvOutputDir, config);

	if (config.debug && config.debug.limit) {
		limitOutput = true;
		logger.info(`Limiting output to ${config.debug.limit} entires`);
	}

	tms.rootURL = config.apiURL;
	tms.path = "";
	logger.info(`Processing collection ${name} with url ${tms.collectionURL}`);

	const finishExport = () => {
		csv.end();
		warningReporter.end();
	}

	const processTMSHelper = () => {
		tms.next().then((artObject) => {
			if (artObject) {
				let id = artObject.descriptionWithFields([config.primaryKey])[config.primaryKey];
				let description = artObject.descriptionWithFields(config.fields);
				logger.debug(description);
				csv.write(description);
				warningReporter.appendFieldsForObject(id, artObject, description);

				processCount++;
				if (processCount % 100 === 0) {
					logger.info(`Processed ${progressCount} of ${totalObjectCount} collection objects`)
				}
				if (limitOutput && processCount >= config.debug.limit) {
					logger.info(`Reached ${processCount} collection objects processed, finishing`);
					finishExport();
				} else {
					processTMSHelper();
				}
			} else {
				finishExport();
			}
		}, (error) => {
			logger.warn(error);
			logger.info(`Error fetching collection object, skipping`);
			tms.hasNext().then((res) => {
				if (!res) {
					finishExport();
				} else {
					processTMSHelper();
				}
			}, (error) => {
				logger.error(error);
				logger.info(`Error fetching collection data, finishing`);
				finishExport();
			});
		});
	}

	tms.getObjectCount().then((res) => {
		totalObjectCount = res;
		logger.info(`Processing ${totalObjectCount} collection objects`);
		processTMSHelper();
	}, (err) => {
		logger.error(error);
		finishExport();
	});
}

const credentials = loadCredentials();
exportCSV(credentials, configFile);
