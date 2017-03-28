const io = require('socket.io');

module.exports = class WebsocketUpdater {
  constructor(port, updateEmitter) {
    this._socket = io();
    this._updateEmitter = updateEmitter;
    this._socket.listen(port);
    this._socket.on('connection', this._broadcastProgress.bind(this));
    updateEmitter.on('started', this._broadcastProgress.bind(this));
    updateEmitter.on('progress', this._broadcastProgress.bind(this));
    updateEmitter.on('completed', this._broadcastProgress.bind(this));
  }

  _broadcastProgress() {
    if (this._socket) {
      this._socket.emit('status', this._updateEmitter.status);
    }
  }
};