// okay all this uses is  makeElasticSearchOptions and prepareIndexForSync and description

const ESCollection = require('../../csv_es/src/script/esCollection.js')
const { makeElasticsearchOptions } = require('../../util/elasticOptions.js')
const logger = require('../../csv_es/src/script/esLogger.js')

const options = makeElasticsearchOptions()
const csvRootDir = 'src/dashboard/public/output/'
const esCollection = new ESCollection(options, csvRootDir)

esCollection._prepareIndexForSync().then((res) => {
  esCollection.description().then((res) => { logger.info(res) })
});
