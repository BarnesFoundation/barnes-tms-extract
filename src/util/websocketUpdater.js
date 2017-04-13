const io = require('socket.io-client');

/**
 * Forwards updates from a subclass of {@link UpdateEmitter} to a websocket
 * @global
 * @param {string} name - Name string to be send with each {@link UpdateEmitter#status} event
 * @param {number} port - Websocket port to which to connect and forward events
 * @param {UpdateEmitter} updateEmitter - Concrete subclass of {@link UpdateEmitter}
 */
class WebsocketUpdater {
	constructor(name, port, updateEmitter) {
		this._name = name;
		this._socket = io.connect(`http://localhost:${port}`);
		this._updateEmitter = updateEmitter;
		updateEmitter.on('started', () => this._broadcastProgress('started'));
		updateEmitter.on('progress', () => this._broadcastProgress('progress'));
		updateEmitter.on('completed', () => this._broadcastProgress('completed'));
	}

	_broadcastProgress(status) {
		if (this._socket) {
			Promise.resolve(this._updateEmitter.status).then((res) => {
				this._socket.emit('status', this._name, status, res);
			});
		}
	}
};

 /**
 * Forwarded event from an {@link UpdateEmitter} subclass
 *
 * @event WebsocketUpdater#status
 * @param {string} name - Name of the event
 * @param {string} status - Will be `started`, `progress` or `completed`
 * @param {object} state - Params depend on subclass implementation
 */

 module.exports = WebsocketUpdater;