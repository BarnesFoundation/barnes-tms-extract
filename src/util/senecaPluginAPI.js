/**
 * Base class and functions for using an class to implement a Seneca Plugin API
 * @module
 */

const _ = require('lodash');

module.exports = {};

const STRIP_COMMENTS = /(\/\/.*$)|(\/\*[\s\S]*?\*\/)|(\s*=[^,\)]*(('(?:\\'|[^'\r\n])*')|("(?:\\"|[^"\r\n])*"))|(\s*=[^,\)]*))/mg;
const ARGUMENT_NAMES = /([^\s,]+)/g;
function getParamNames(func) {
  const fnStr = func.toString().replace(STRIP_COMMENTS, '');
  let result = fnStr.slice(fnStr.indexOf('(')+1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
  if (result === null)
     result = [];
  return result;
}

function getFunctionDescriptors(objClass) {
	let descriptors = Object.getOwnPropertyDescriptors(objClass.prototype);
	descriptors = _.filter(descriptors, (desc) => {
		if (typeof (desc.value) !== 'function') return false;
		if (desc.value.name === 'constructor') return false;
		if (desc.value.name === objClass.name) return false;
		return true;
	});
	return descriptors;
}

/**
 * Abstract base class for Seneca API plugin services
 * @abstract
 * @param {object} seneca - The seneca object used to initialize the API plugin
 * @param {object} options - Opitions to be passed to the plugin on initialization
 */
class SenecaPluginAPI {
	constructor(seneca, options) {
		this._seneca = seneca;
	}

	/**
	 * The seneca object used to initialize the API plugin
	 */
	get seneca() {
		return this._seneca;
	}
}

/**
 * Given a role and the name of a class extending {@link SenecaPluginAPI}, this function
 * returns a function that Seneca can call to configure a plugin API.
 * @param {string} role - A role string that will be prefixed to actions exposed by the plugin.
 * @param {class} apiObjectClass - Classname that extends {@link SenecaPluginAPI}
 * @return A function suitable for being required by Seneca.use
 * @example
 * // filename myCustomAPI.js
 * class MyCustomAPI extends SenecaPluginAPI {
 * 	constructor(seneca, options) {
 * 		super(seneca, options);
 *		this._something = options.something;
 * 	}
 *	description() {
 *		return { status: 'OK', something: this._something };
 * 	}
 * }
 * const { makeAPI } = require('./senecaPluginAPI');
 * module.exports = makeAPI('role:custom', MyCustomAPI);
 * // Returns an API that will respond to 'role:custom,cmd:description'
 * // Use by calling require('seneca')().use('./myCustomAPI.js')
 */
module.exports.makeAPI = function(role, apiObjectClass) {
	const f = function(options) {
		const apiObject = new apiObjectClass(this, options);
		const descriptors = getFunctionDescriptors(apiObjectClass);

		_.forEach(descriptors, (d) => {
			const argnames = getParamNames(d.value);

			const handler = (msg, done) => {
				const args = _.at(msg, argnames);
				Promise.resolve(d.value.apply(apiObject, args)).then((res) => {
					done(res)
				});
			}

			this.add(role, { cmd:d.value.name }, handler);
		});
	}
	return f;
}

module.exports.SenecaPluginAPI = SenecaPluginAPI;