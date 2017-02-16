import ExportConfig from "./exportConfig.js";
import CSVWriter from "./csvWriter.js";
import TMSURLReader from "./tmsURLReader.js";

import fs from 'fs';

const config = new ExportConfig("./searchConfig.json");
const tms = new TMSURLReader();

// Create the directory where the results will live
const outputFolderName = `csv_${new Date().getTime()}`;
const outputPath = config.outputDirectory + "/" + outputFolderName;
fs.mkdirSync(outputPath);

tms.path = "https://emuseum.barnesfoundation.org/objects";

const csv = new CSVWriter(outputPath + "/common.csv");

function processTMS() {
	tms.next().then((artObject) => {
		const description = artObject.descriptionWithFields(config.fields);
		console.log(description);
		csv.write(description);
		processTMS();
	}, () => {
		csv.end();
	});
}

processTMS();
