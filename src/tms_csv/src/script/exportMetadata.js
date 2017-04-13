const fs = require('fs');

/**
 * @alias ExportMetadata~ExportStatus
 * @enum {string}
 */
const ExportStatus = Object.freeze({
	INCOMPLETE: 'INCOMPLETE',
	CANCELLED: 'CANCELLED',
	COMPLETED: 'COMPLETED',
	ERROR: 'ERROR',
});

/**
 * Synchronizes the state of a TMS export process with a `meta.json` file.
 * @param {string} jsonExportPath - Path where the `meta.json` file will be created
 * @throws Error if the file cannot be created for some reason
 */
class ExportMetadata {
	constructor(jsonExportPath) {
		this._outputFilePath = jsonExportPath;
		const fd = fs.openSync(this._outputFilePath, 'w+');
		fs.closeSync(fd);
		fs.accessSync(this._outputFilePath, 'W_OK');
		this._status = ExportStatus.INCOMPLETE;
		this._createdAt = `${new Date()}`;
		this._updateOutput();
	}

	/** @property {ExportMetadata~ExportStatus} status */
	get status() {
		return this._status;
	}

	set status(s) {
		if (this._status !== s) {
			this._status = s;
			this._updateOutput();
		}
	}

	/** @property {number} createdAt- UNIX timestamp for the start of the TMS export process */
	get createdAt() {
		return this._createdAt;
	}

	/** @property {number} processedObjects - Number of objects that have been exported */
	get processedObjects() {
		return this._processedObjects;
	}

	set processedObjects(objects) {
		this._processedObjects = objects;
		this._updateOutput();
	}

	/** @property {number} totalObjects - Number of objects that will be exported */
	get totalObjects() {
		return this._totalObjects;
	}

	set totalObjects(objects) {
		this._totalObjects = objects;
		this._updateOutput();
	}

	_updateOutput() {
		fs.writeFileSync(this._outputFilePath, this.description(), 'utf8');
	}

	/**
	 * Structured description of the current status of the TMS export
	 * @return {object} Structured status
	 */
	description() {
		const desc = {};
		desc.status = this.status;
		desc.createdAt = this.createdAt;
		desc.processedObjects = this.processedObjects;
		desc.totalObjects = this.totalObjects;
		return JSON.stringify(desc);
	}
}

module.exports = {
	ExportMetadata,
	ExportStatus,
};
