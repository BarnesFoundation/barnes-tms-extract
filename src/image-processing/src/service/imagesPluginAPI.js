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
		this._imageUploader = new ImageUploader(path.resolve(process.cwd(), csvDir));
		this._websocketUpdater = new WebsocketUpdater('images', port, this._imageUploader);
	}

	get name() { return "images"; }

	/**
	 * Return a description of the ImageUploader
	 * @see {@link ImageUploader#status}
	 * @return {ImageUploader~ImageUploaderStatus}
	 */
	info() {
		return Object.assign({}, this._imageUploader.status);
	}

	/**
	 * Begin tiling and uploading images from TMS
	 * @see {@link ImageUploader#process}
	 * @return {Object} {success: true} if the call to start processing was successful, {success:false} otherwise
	 */
	tile() {
		// new instance of websocket updater?
		return fetchAvailableImages.then((outputPath) => {
			const tileUploader = new TileUploader(outputPath, csvDir);
			return tileUploader.init();
		}).then(() => {
			return tileUploader.process();
		}).then(() => {
			return { success: true };
		});
	}

	raw() {
		// new instance of websocket updater?
		return fetchAvailableImages.then((outputPath) => {
			const rawUploader = new RawUploader(outputPath, csvDir);
			return rawUploader.init();
		 }).then(() => {
			return rawUploader.process();
		 }).then(() => {
			return { success: true };
		 });
	}

	upload() {
		//upload all JPGs
		// "regular uploader"
	}
}

module.exports = makeAPI('role:images', ImagesPluginAPI);
