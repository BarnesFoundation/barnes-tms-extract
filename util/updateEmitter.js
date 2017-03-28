const EventEmitter = require('events');

class UpdateEmitter extends EventEmitter {
  get status() {
    return {};
  }

  started() {
    this.emit('started', this.status);
  }

  progress() {
    this.emit('progress', this.status);
  }

  completed() {
    this.emit('completed', this.status);
  }
}