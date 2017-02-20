import ExportConfig from "./exportConfig.js";
import CSVWriter from "./csvWriter.js";
import TMSURLReader from "./tmsURLReader.js";
import logger from "./logger.js";

import fs from 'fs';
import _ from "lodash";

const configFile = "./searchConfig.json";

function exportCSV(configFile) {

	logger.info("Beginning CSV export");

	const config = new ExportConfig(configFile);
	const tms = new TMSURLReader();

	const outputFolderName = `csv_${new Date().getTime()}`;
	const outputPath = config.outputDirectory + "/" + outputFolderName;
	logger.info(`Creating CSV output directory ${outputPath}`);
	fs.mkdirSync(outputPath);

	logger.info(`Reading TMS API from root URL ${config.apiURL}`);

	processTMS(config, tms, outputPath);
}

function processTMS(config, tms, csvOutputDir) {

	for (let i = 0; i < config.collectionsCount; i++) {
		let processCount = 0;

		let limitOutput = false;

		const name = config.nameForCollectionAtIndex(i);

		const collectionFields = config.fieldsForCollectionAtIndex(i);

		if (collectionFields.length === 0) {
			logger.warn(`Collection ${name} has no fields---skipping`);
			continue;
		}

		const csvFilePath = `${csvOutputDir}/${name}.csv`;

		const csv = new CSVWriter(csvFilePath);

		if (config.debug && config.debug.limit) {
			limitOutput = true;
			logger.info(`Limiting output to ${config.debug.limit} entires`);
		}

		tms.path = `${config.apiURL}${config.pathForCollectionAtIndex(i)}/objects`;
		logger.info(`Processing collection {name} with url {tms.path}`);

		const processTMSHelper = () => {
			tms.next().then((artObject) => {
				if (artObject) {
					let description = artObject.descriptionWithFields([config.primaryKey]);
					Object.assign(description, artObject.descriptionWithFields(config.fieldsForCollectionAtIndex(i)));
					logger.debug(description);
					csv.write(description);

					processCount++;
					if (limitOutput && processCount >= config.debug.limit) {
						logger.info(`Reached ${processCount} entries processed, finishing`);
						csv.end();
					} else {
						processTMSHelper();
					}
				} else {
					csv.end();
				}
			}, (error) => {
				logger.warn(error);
				logger.info(`Error fetching collection object, skipping`);
				tms.hasNext().then((res) => {
					if (!res) {
						csv.end();
					} else {
						processTMSHelper();
					}
				}, (error) => {
					logger.error(error);
					logger.info(`Error fetching collection data, finishing`);
					csv.end();
				});
			});
		}

		processTMSHelper();
	}
}

exportCSV(configFile);
