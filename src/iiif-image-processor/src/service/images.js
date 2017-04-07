const ImageUploader = require('../script/imageUploader.js');
const WebsocketUpdater = require('../../../util/websocketUpdater.js');

const config = require('config');
const path = require('path');

const csvDir = config.CSV.path;
const port = config.Server.port;

function images() {
	const imageUploader = new ImageUploader(path.resolve(process.cwd(), csvDir));
	const websocketUpdater = new WebsocketUpdater('images', port, imageUploader);
	this.add('role:images,cmd:tile', (msg, respond) => {
		imageUploader.process();
		respond(null, { success: true });
	});

	this.add('role:images,cmd:info', (msg, respond) => {
		respond(null, Object.assign({}, imageUploader.status, { updatePort: port }));
	});
}

module.exports = images;
