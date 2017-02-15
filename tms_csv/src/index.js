import CSVWriter from "./csvWriter.js";
import TMSReader from "./tmsReader.js";

const outputPath = "output/test.csv";
const tms = new TMSReader("data/json");
const csv = new CSVWriter(outputPath);
const fields = [
	"people",
	"title",
	"displayDate",
	"medium",
	"dimensions",
	"invno",
	"id"
];

for (var i = 0; i < tms.length; i++) {
	let artObject = tms.objectAtIndex(i);
	let description = artObject.descriptionWithFields(fields);
	csv.write(description);
}

csv.end();
