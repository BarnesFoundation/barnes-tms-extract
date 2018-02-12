const ImageUploader = require('../script/imageUploader.js');
const WebsocketUpdater = require('../../../util/websocketUpdater.js');
const { SenecaPluginAPI, makeAPI } = require('../../../util/senecaPluginAPI.js');
const TileUploader = require('../script/tileUploader.js');
const RawUploader = require('../script/rawUploader.js');
const ImageResizer = require('../script/imageResizer.js');
const { makeElasticsearchOptions } = require('../../../util/elasticOptions.js');

const config = require('config');
const path = require('path');

const csvRootDirectory = config.CSV.rootDirectory;
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
		this._imageResizer = null;
	}

	get name() { return "images"; }

	info() {
		if (this._tileUploader) {
			return this._tileUploader.status;
		} else if(this._imageUploader) {
			return this._imageUploader.status;
		} else if (this._rawUploader) {
			return this._rawUploader.status;
		} else if (this._imageResizer) {
			return this._imageResizer.status;
		}
		return { isRunning: false };
	}

	/**
	 * Begin tiling and uploading images from TMS
	 * @see {@link ImageUploader#process}
	 * @return {Object} {success: true} if the call to start processing was successful, {success:false} otherwise
	 */
	tile() {
		let websocketUpdater;
		this._tileUploader = new TileUploader(csvRootDirectory);
		websocketUpdater = new WebsocketUpdater('images', port, this._tileUploader);
		this._tileUploader.init().then(() => {
			return this._tileUploader.process();
		}).then(() => {
			this._tileUploader = null;
		});
		return { success: true };
	}

	raw() {
		this._rawUploader = new RawUploader(csvRootDirectory);
		const websocketUpdater = new WebsocketUpdater('images', port, this._rawUploader);
		this._rawUploader.init().then(() => {
			return this._rawUploader.process();
		 }).then(() => {
		 	this._rawUploader = null;
		 });
		return { success: true };
	}

	upload() {
		this._imageUploader = new ImageUploader(csvRootDirectory);
		const websocketUpdater = new WebsocketUpdater('images', port, this._imageUploader);
		this._imageUploader.init().then(() => {
			return this._imageUploader.process();
		}).then(() => {
			this._imageUploader = null;
		});
		return { success: true };
	}

	resize() {
		this._imageResizer = new ImageResizer(csvRootDirectory, makeElasticsearchOptions());
		const websocketUpdater = new WebsocketUpdater('images', port, this._imageResizer);
		this._imageResizer.init().then(() => {
			return this._imageResizer.process();
		}).then(() => {
			this._imageResizer = null;
		});
		return { success: true };
	}

	cancel() {
		this._imageUploader = null;
		this._rawUploader = null;
		this._tileUploader = null;
	}
}

module.exports = makeAPI('role:images', ImagesPluginAPI);
