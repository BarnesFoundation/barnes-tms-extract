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

module.exports.makeAPI = function(role, apiObjectClass) {
	const f = function(options) {
		const apiObject = new apiObjectClass(options);
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
