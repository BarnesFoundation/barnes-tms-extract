const EventEmitter = require('events');

/**
 * Subclass to add `started`, `progress` and `completed` functions. Then, just implement
 * the `status` getter that returns an object describing the status of your object. Long
 * running objects like {@link TMSExporter} subclass this class to send updates as they run.
 * @interface
 * @global
 */
class UpdateEmitter extends EventEmitter {

	/**
	 * Returns an empty object by default. Subclasses should override to return more detail
	 * @property {object} status object
	 * @example
	 * class MyClass extends UpdateEmitter {
	 * 	get status() {
	 *		return {
	 *			progress: '50%'
	 *		};
	 * 	}
	 * }
	 */
	get status() {
		return {};
	}

	/**
	 * Emit a `started` event with the result of calling {@link UpdateEmitter~status}
	 * @fires UpdateEmitter#started
	 */
	started() {
		this.emit('started', this.status);
	}

	/**
	 * Emit a `progress` event with the result of calling {@link UpdateEmitter~status}
	 * @fires UpdateEmitter#progress
	 */
	progress() {
		this.emit('progress', this.status);
	}

	/**
	 * Emit a `completed` event with the result of calling {@link UpdateEmitter~status}
	 * @fires UpdateEmitter#completed
	 */
	completed() {
		this.emit('completed', this.status);
	}
}

/**
 * Update started event. Property keys depend on subclass implementation
 *
 * @event UpdateEmitter#started
 * @type {object}
 */

 /**
 * Update progress event. Property keys depend on subclass implementation
 *
 * @event UpdateEmitter#progress
 * @type {object}
 */

 /**
 * Update completed event. Property keys depend on subclass implementation
 *
 * @event UpdateEmitter#completed
 * @type {object}
 */

module.exports = UpdateEmitter;
