const ESCollection = require('../script/esCollection.js');
const WebsocketUpdater = require('../../../util/websocketUpdater.js');
const { SenecaPluginAPI, makeAPI } = require('../../../util/senecaPluginAPI.js');

const config = require('config');
const fs = require('fs');
const path = require('path');

const port = config.Server.port;

/**
 * Seneca plugin for coordinating with the Elasticsearch importer
 * @see {@link ESCollection}
 * @param {string} options.host - Hostname for the Elasticsearch server
 * @param {string} options.csvRootDirectory - Path to the root CSV export directory
 */
class ESPluginAPI extends SenecaPluginAPI {
	constructor(seneca, options) {
		super(seneca, options);
		this._esOptions = options.esOptions;
		this._csvRootDirectory = options.csvRootDirectory;
		this._esCollection = new ESCollection(this._esOptions, this._csvRootDirectory);
		this._websocketUpdater = new WebsocketUpdater('es', port, this._esCollection);
	}

	get name() { return "es"; }

	/**
	 * Returns a description of the Elasticsearch collection index
	 * @see {@link ESCollection#description}
	 * @return {Promise} Resolves to a description of the Elasticsearch collection index
	 */
	desc() {
		return this._esCollection.description();
	}

	/**
	 * Performs an elasticsearch query and returns the results as JSON
	 * @see {@link ESCollection#search}
	 * @param {string} query - Query to pass to Elasticsearch simple search
	 * @return {Promise} Resolves to the JSON returned from ES
	 */
	search(query) {
		return this._esCollection.search(query);
	}

module.exports = makeAPI('role:es', ESPluginAPI);
