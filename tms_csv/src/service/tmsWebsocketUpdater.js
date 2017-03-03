const io = require('socket.io');

module.exports = class TMSWebsocketUpdater {
	constructor(port, tmsExporter) {
		this._socket = io();
		this._tmsExporter = tmsExporter;
		this._socket.listen(port);
		this._socket.on('connection', this._broadcastProgress.bind(this));
		tmsExporter.on('started', this._broadcastProgress.bind(this));
		tmsExporter.on('progress', this._broadcastProgress.bind(this));
		tmsExporter.on('completed', this._broadcastProgress.bind(this));
	}

	_broadcastProgress() {
		if (this._socket) {
			this._socket.emit('active', this._tmsExporter.active);
			this._socket.emit('progress', this._tmsExporter.progress);
		}
	}
}