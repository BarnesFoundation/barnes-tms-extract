
/**
 * Interface for any object that serves as an iterator over TMS collection objects in JSON format
 * @interface
 */
class TMSReader {

	constructor() {
		this._path = null;
	}

	// @property {string} path - Path to the TMS api
	get path() {
		return this._path;
	}

	set path(path) {
		this._path = path;
	}

	/**
	 * Whether or not there are more TMS objects in the collection
	 * @return {bool}
	 * @abstract
	 */
	hasNext() { return false; }

	/**
	 * @return JSON description of a TMS collection object, in whatever format TMS provides
	 */
	next() { return null; }
};

module.exports = TMSReader;