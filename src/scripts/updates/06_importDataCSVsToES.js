const config = require('config');
const path = require('path');
const ESCollection = require('../../csv_es/src/script/esCollection.js');
const { makeElasticsearchOptions } = require('../../util/elasticOptions.js');

const esClient = new ESCollection(makeElasticsearchOptions(), config.CSV.dataPath);
const dataCSVs = config.CSV.dataFilenames;

const importCSVs = (csvs) => {
  const targetCSV = csvs.shift();
  if (targetCSV) {
    esClient.importDataCSVToES(targetCSV).then((res) => {
      console.log('Imported', targetCSV);
      importCSVs(csvs);
    }).catch((res) => {
      console.log('Error importing', targetCSV);
      importCSVs(csvs);
    })
  }
}

importCSVs(dataCSVs);
