// copied from src/color-processing/colorProcessPluginAPI.js

const config = require('config')
const path = require('path')
const ESCollection = require('../../csv_es/src/script/esCollection.js')
const { makeElasticsearchOptions } = require('../../util/elasticOptions.js')
let esIndex = null

const aws4 = require('aws4')
const s3 = require('s3')
const https = require('https')
const Promise = require('bluebird')
const eachLimit = require('async/eachLimit')
const logger = require('../../util/logger.js')(path.join(__dirname, './logs/all-logs.txt'))

const parallelRequests = 100
const credentials = config.Credentials.colorAnalysis
const colorProcessingHost = credentials.host
const colorProcessingPath = credentials.path
const bucketName = credentials.awsBucket
const awsFolderPath = credentials.awsFolderPath

const esOptions = makeElasticsearchOptions()
const csvRootDirectory = config.CSV.dataPath
const esClient = new ESCollection(esOptions, csvRootDirectory)

const s3Client = s3.createClient({
  s3Options: {
    accessKeyId: credentials.awsAccessKeyId,
    secretAccessKey: credentials.awsSecretAccessKey,
    region: credentials.awsRegion
  }
})

function flattenColorCalculationResult (color) {
  if (color.average === undefined) return null

  const ret = {}
  ret['reference-closest'] = color['reference-closest']
  ret['average-color'] = color.average.color
  ret['average-closest'] = color.average.closest
  color['palette'].forEach((color, idx) => {
    ['color', 'closest'].forEach((type) => {
      ret[`palette-${type}-${idx}`] = color[type]
    })
  })

  return ret
}

function processS3Images () {
  logger.info('Beginning to process')
  let results = []
  s3Client.listObjects({
    s3Params: {
      Bucket: bucketName,
      Prefix: awsFolderPath,
      MaxKeys: 5000
    }
  })
  .on('data', function (data) {
    results = results.concat(data.Contents)
  })
  .on('end', () => {
    logger.info(`Listed ${results.length} objects`)
    processColorForImages(
      results,
      esClient)
    .then(() => {
      console.log('All done')
    })
  })
}

function processColorForImages (images, esClient) {
  return new Promise((resolve, reject) => {
    eachLimit(images, parallelRequests, (image, next) => {
      if (image.Key.indexOf('_b.') === -1) {
        next()
      } else {
        const options = {
          hostname: colorProcessingHost,
          path: `${colorProcessingPath}?bucket=${bucketName}&object=${image.Key}`,
          service: 'execute-api',
          method: 'POST'
        }

        aws4.sign(options, {
          accessKeyId: credentials.awsAccessKeyId,
          secretAccessKey: credentials.awsSecretAccessKey
        })
        logger.info('Making request for image ' + image.Key)
        https.request(options, (res) => {
          let d = ''

          res.on('data', (data) => {
            d += data
          })
          res.on('end', () => {
            logger.info('Received data for image ' + image.Key)
            handleImageJSONData(d, image, esClient).then(() => {
              console.log('Finished handling data for image ' + image.Key)
              next()
            }).catch((err) => {
              logger.warn(err)
              next()
            })
          })
        }).end()
      }
    }, (err) => {
      if (err) console.dir(err)
      resolve()
    })
  })
}

function handleImageJSONData (d, image, esClient) {
  let imageData

  try {
    imageData = JSON.parse(d)
  } catch (e) {
    return new Promise.reject(e)
  }

  const f = flattenColorCalculationResult(imageData)

  if (f === null) {
    logger.warn('Got a weird result for ' + image.Key)
    logger.warn(d)
    return new Promise.resolve()
  } else {
    const tmsId = path.basename(image.Key).split('_')[0]
    return writeDataToES(tmsId, f, esClient)
  }
}

const getIndex = function (callback) {
  if (esIndex !== null && typeof esIndex === 'string' && esIndex.length > 0) { return callback(null, esIndex) }

  return esClient.cat
    .indices({index: 'collection_*', s: 'creation.date:desc', h: ['i']})
    .then(idx => { esIndex = idx; return callback(null, idx) })
}

function writeDataToES (tmsId, flattenedData, esClient) {
  getIndex((err, index) => {
    if (err) throw err
    return esClient.exists({
      index: index,
      type: 'object',
      id: tmsId
    }).then((res) => {
      if (res) {
        return esClient.update({
          // index: 'collection',
          index: config.Elasticsearch.index,
          type: 'object',
          id: tmsId,
          body: {
            doc: {
              color: flattenedData
            }
          }
        }).then(() => {
          logger.info('Successfully updated CH color data for ' + tmsId)
        })
      } else {
        logger.info('Skipping stroring CH color data for ' + tmsId + ': no tms data for this image')
      }
    })
  })
}

processS3Images()

// TODO: figure out the difference between this and writeDataToES, which one is redundant?
// esClient.updateESWithColorData(config.CSV.rootDirectory)
