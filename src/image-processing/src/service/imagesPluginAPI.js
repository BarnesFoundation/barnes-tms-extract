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
	}

	get name() { return "images"; }

	get status() {
		return {
			isRunning: this._isRunning
		}
	}

	/**
	 * Begin tiling and uploading images from TMS
	 * @see {@link ImageUploader#process}
	 * @return {Object} {success: true} if the call to start processing was successful, {success:false} otherwise
	 */
	tile() {
		let websocketUpdater;
		return fetchAvailableImages.then((outputPath) => {
			const tileUploader = new TileUploader(outputPath, csvDir);
			websocketUpdater = new WebsocketUpdater('images', port, tileUploader);
			return tileUploader.init();
		}).then(() => {
			return tileUploader.process();
		}).then(() => {
			return { success: true };
		});
	}

	raw() {
		let websocketUpdater;
		return fetchAvailableImages.then((outputPath) => {
			const rawUploader = new RawUploader(outputPath, csvDir);
			websocketUpdater = new WebsocketUpdater('images', port, rawUploader);
			return rawUploader.init();
		 }).then(() => {
			return rawUploader.process();
		 }).then(() => {
			return { success: true };
		 });
	}

	upload() {
		let websocketUpdater;
		return fetchAvailableImages.then((outputPath) => {
			const imageUploader = new ImageUploader(outputPath, csvDir);
			websocketUpdater = new WebsocketUpdater('images', port, imageUploader);
			return imageUploader.init();
		}).then(() => {
			return imageUploader.process();
		}).then(() => {
			return { success: true };
		});
	}
}

module.exports = makeAPI('role:images', ImagesPluginAPI);
