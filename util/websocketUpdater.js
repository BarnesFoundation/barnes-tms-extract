const io = require('socket.io-client');

module.exports = class WebsocketUpdater {
	constructor(name, port, updateEmitter) {
		this._name = name;
		this._socket = io.connect("http://localhost:" + port);
		this._updateEmitter = updateEmitter;
		updateEmitter.on('started', () => this._broadcastProgress('started'));
		updateEmitter.on('progress',() => this._broadcastProgress('progress'));
		updateEmitter.on('completed', () => this._broadcastProgress('completed'));
	}

	_broadcastProgress(status) {
		if (this._socket) {
			this._socket.emit('status', this._name, status, this._updateEmitter.status);
		}
	}
};
