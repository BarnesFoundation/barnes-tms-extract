const ImageUploader = require('../../image-processing/src/script/imageUploader.js')
const RawUploader = require('../../image-processing/src/script/rawUploader.js')
const TileUploader = require('../../image-processing/src/script/tileUploader.js')
const ImageResizer = require('../../image-processing/src/script/imageResizer.js')

const { makeElasticsearchOptions } = require('../../util/elasticOptions.js')

const csvRootDirectory = require('config').CSV.rootDirectory

/*
const imageUploader = new ImageUploader(csvRootDirectory)
imageUploader.init().then(() => imageUploader.process())

const rawUploader = new RawUploader(csvRootDirectory)
rawUploader.init().then(() => rawUploader.process())
*/
const tileUploader = new TileUploader(csvRootDirectory)
tileUploader.init().then(() => tileUploader.process())

/*
const imageResizer = new ImageResizer(csvRootDirectory, makeElasticsearchOptions())
imageResizer.init().then(() => imageResizer.process())
*/
