const TileUploader = require('../../image-processing/src/script/tileUploader.js')
const ImageResizerAndUploader = require('../../image-processing/src/script/imageResizer.js')

const { makeElasticsearchOptions } = require('../../util/elasticOptions.js')

const csvRootDirectory = require('config').CSV.rootDirectory

// Does this make new tiles?
// const tileUploader = new TileUploader(csvRootDirectory)
//tileUploader.init().then(() => tileUploader.process())

const imageResizerAndUploader = new ImageResizerAndUploader(csvRootDirectory, makeElasticsearchOptions())
imageResizerAndUploader.init().then(() => imageResizerAndUploader.process())
