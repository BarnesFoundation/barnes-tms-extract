const fs = require('fs');

const ExportStatus = Object.freeze({
	INCOMPLETE: 'INCOMPLETE',
	CANCELLED: 'CANCELLED',
	COMPLETED: 'COMPLETED',
	ERROR: 'ERROR',
});

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

	get status() {
		return this._status;
	}

	set status(s) {
		if (this._status !== s) {
			this._status = s;
			this._updateOutput();
		}
	}

	get createdAt() {
		return this._createdAt;
	}

	_updateOutput() {
		fs.writeFile(this._outputFilePath, this.description(), 'utf8', (err) => {
			if (err) throw err;
		});
	}

	description() {
		const desc = {};
		desc.status = this.status;
		desc.createdAt = this.createdAt;
		return JSON.stringify(desc);
	}
}

module.exports = {
	ExportMetadata,
	ExportStatus,
};
