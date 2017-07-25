const config = require('config');
const path = require('path');

const { csvForEach } = require('../util/csvUtil.js');
const ESCollection = require('../csv_es/src/script/esColleciton.js');
const csvDir = config.CSV.path;
const { makeElasticsearchOptions } = require('../util/elasticOptions.js');

const esClient = new ESCollection(makeElasticsearchOptions(), csvDir);

// Get a list of all CSV files from directory

// For each CSV file:

// Establish the CSV pathname
const csvPath = path.join(csvDir, csvSlug, 'data.csv');

// Read CSV keys and create an object template


// Identify ID by which to add new data
// const objectID =

csvForEach(csvPath, (row) => {
  // Update the appropriate document in ES.
});
