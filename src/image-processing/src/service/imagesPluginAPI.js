const ImageUploader = require('../script/imageUploader.js');
const WebsocketUpdater = require('../../../util/websocketUpdater.js');
const { SenecaPluginAPI, makeAPI } = require('../../../util/senecaPluginAPI.js');
const TileUploader = require('../script/tileUploader.js');
const RawUploader = require('../script/rawUploader.js');
const fetchAvailableImages = require('../script/tmsImageFetch.js');

const config = require('config');
const path = require('path');

const csvDir = config.CSV.path;
const port = config.Server.port;

/**
 * Seneca plugin for coordinating with the image tiling and upload scripts
 * @see {@link ImageUploader}
 */
class ImagesPluginAPI extends SenecaPluginAPI {
	constructor(seneca, options) {
		super(seneca, options);
		this._tileUploader = null;
		this._rawUploader = null;
		this._imageUploader = null;
	}

	get name() { return "images"; }

	info() {
		const tileUploaderStatus = this._tileUploader ? this._tileUploader.status : { type: 'tileUploader', isRunning: false };
		const rawUploaderStatus = this._rawUploader ? this._rawUploader.status : { type: 'rawUploader', isRunning: false };
		const imageUploaderStatus = this._imageUploader ? this._imageUploader.status : { type: 'imageUploader', isRunning: false };
		return [tileUploaderStatus, rawUploaderStatus, imageUploaderStatus];
	}

	/**
	 * Begin tiling and uploading images from TMS
	 * @see {@link ImageUploader#process}
	 * @return {Object} {success: true} if the call to start processing was successful, {success:false} otherwise
	 */
	tile() {
		let websocketUpdater;
		fetchAvailableImages().then((outputPath) => {
			this._tileUploader = new TileUploader(outputPath, csvDir);
			websocketUpdater = new WebsocketUpdater('images', port, this._tileUploader);
			return this._tileUploader.init();
		}).then(() => {
			return this._tileUploader.process();
		}).then(() => {
			this._tileUploader = null;
		});
		return { success: true };
	}

	raw() {
		let websocketUpdater;
		fetchAvailableImages().then((outputPath) => {
			this._rawUploader = new RawUploader(outputPath, csvDir);
			websocketUpdater = new WebsocketUpdater('images', port, this._rawUploader);
			return this._rawUploader.init();
		 }).then(() => {
			return this._rawUploader.process();
		 }).then(() => {
		 	this._rawUploader = null;
		 });
		return { success: true };
	}

	upload() {
		console.log('called upload images');
		let websocketUpdater;
		fetchAvailableImages().then((outputPath) => {
			this._imageUploader = new ImageUploader(outputPath, csvDir);
			websocketUpdater = new WebsocketUpdater('images', port, this._imageUploader);
			return this._imageUploader.init();
		}).then(() => {
			return this._imageUploader.process();
		}).then(() => {
			this._imageUploader = null;
		});
		return { success: true };
	}
}

module.exports = makeAPI('role:images', ImagesPluginAPI);
