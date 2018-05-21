const ImageUploader = require('../../image-processing/src/script/imageUploader.js')
const RawUploader = require('../../image-processing/src/script/rawUploader.js')

const csvRootDirectory = require('config').CSV.rootDirectory

const imageUploader = new ImageUploader(csvRootDirectory)
imageUploader.init().then(() => imageUploader.process())

const rawUploader = new RawUploader(csvRootDirectory)
rawUploader.init().then(() => rawUploader.process())
