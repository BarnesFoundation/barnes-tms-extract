const fs = require('fs');
const csv = require('fast-csv');
const execSync = require('child_process').execSync;

const credentials = require('./credentials.json');
const { getLastCompletedCSV } = require('../csv_es/src/script/csvUtil.js');

const csvDir = '../dashboard/public/output';

const lastCSV = getLastCompletedCSV(csvDir);
const imageNames = require('./names.json').images

const stream = fs.createReadStream(`${csvDir}/${lastCSV}/objects.csv`);
csv.fromStream(stream, {headers : true})
	.on("data", function(data) {
		const found = imageNames.find((element) => {
			return element.name === data.primaryMedia
		});
		if (found) {
			const cmd = `./go-iiif/bin/iiif-tile-seed -config config.json -endpoint http://barnes-image-repository.s3-website-us-east-1.amazonaws.com/tiles -verbose -loglevel debug ${found.name}`;
			execSync(cmd, (error, stdout, stderr) => {
			  if (error) {
			    console.error(`exec error: ${error}`);
			    return;
			  }
			  console.log(`stdout: ${stdout}`);
			  console.log(`stderr: ${stderr}`);
			});
		}
	});
