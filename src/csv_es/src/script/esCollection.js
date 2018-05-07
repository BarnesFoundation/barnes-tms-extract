const logger = require('./esLogger.js');
const mapping = require('config').mapping;
const {
	doCSVKeysMatch,
	diffCSV,
} = require('../../../util/csvUtil.js');
const UpdateEmitter = require('../../../util/updateEmitter.js');

const csv = require('fast-csv');
const config = require('config');
const Promise = require('bluebird');
const eachLimit = require('async/eachLimit');
const elasticsearch = require('elasticsearch');
const fs = require('fs');
const path = require('path');
const shell = require('shelljs');
const tmp = require('tmp');
const _ = require('lodash');

const rateLimit = 50;

const ESCollectionStatus = Object.freeze({
	READY: "READY",
	SYNCING: "SYNCING",
	VALIDATING: "VALIDATING"
});

/**
 * FIXME:
 * Manages the process of importing a CSV file into Elasticsearch. The `collection` index has one type,
 * `object`. The `object` type stores the collection objects
 * themselves, and will have different fields depending on the headers of the imported CSV file
 * @param {string} esOptions - Options dictionary used to initialize an elasticsearch client
 * @param {string} csvRootDirectory - Path to the directory containing csv_* directories with exports from TMS
 */
class ESCollection extends UpdateEmitter {
	constructor(esOptions, csvRootDirectory) {
		super();
		this._client = new elasticsearch.Client( esOptions );
		Promise.promisifyAll(this._client);
		Promise.promisifyAll(this._client.cat);
		Promise.promisifyAll(this._client.indices);
		this._csvRootDir = csvRootDirectory;
		this._status = ESCollectionStatus.READY;
		this._message = "";
		this._kibanaUrl = config.Elasticsearch.kibana;
    this._prefix = config.Elasticsearch.prefix || 'collection';
	}

	/** @property {ESCollection~ESImportStatus} status
	 * @override
	 */
	get status() {
		return this.description();
	}

	/**
	 * Analyze a JSON object before sending it to be stored in ES, decorating it
	 * with additional KV pairs and filtering out bad characters
	 */
	_analyzedData(data) {
		const onViewPrefix = 'Barnes Foundation (Philadelphia), Collection Gallery';

		// Turn empty strings into null
		let dataCopy = Object.assign({}, data);
		dataCopy.id = parseInt(dataCopy.id);
		dataCopy = _.mapValues(dataCopy, (v, k) => {
			if (v === '') return null;
			return v;
		});

		// Add a KV pair for onView, if the data has a field called locations
		if (_.has(dataCopy, 'locations')) {
			let onView = false;
			const location = dataCopy.locations;
			if (location) {
				onView = location.includes(onViewPrefix);
			}
			dataCopy.onView = onView;
		}

		// Add a room, if the data is on view
		if (dataCopy.onView === true) {
			const location = dataCopy.locations;
			const start = location.indexOf(onViewPrefix) + onViewPrefix.length;
			const sections = location.substr(start).split(',');
			if (sections.length >= 2) {
				dataCopy.room = sections[1].trim();
			}
		}

		// Add a wall, if the data is on view
		if (dataCopy.onView === true) {
			const location = dataCopy.locations;
			if (location.includes('North Wall')) dataCopy.wall = 'north';
			if (location.includes('South Wall')) dataCopy.wall = 'south';
			if (location.includes('East Wall')) dataCopy.wall = 'east';
			if (location.includes('West Wall')) dataCopy.wall = 'west';
		}

		return dataCopy;
	}

	_latestCollection() {
    return this._client.cat
      .indices({index: 'collection_*', s: 'creation.date:desc', h: ['i']})
      .then(index => {
        if (index) {
          const name = index.split('\n')[0]
          return name
        } else {
          throw new Error("no index made");
        }
      })
	}

	/**
	 * Creates the index for the collection
	 * @private
	 * @return {Promise} Resolved when the elasticsearch request completes
	 */
	_createCollectionIndex(index) {
    console.log(`creating index ${index}`)
		return this._client.indices.createAsync({
			index: index,
			body: mapping
		})
	}

	/**
	 * Create a new object document, for the given dictionary of CSV data
	 * @private
	 * @param {object} data - key-value pairs to add for the given object
	 * @return {Promise} Resolved when the elasticsearch request completes
	 */
	_createDocumentWithData(data) {
		const dataCopy = this._analyzedData(data);
    return this._latestCollection().then(index => {
      console.log(`createDocumentWithData index is ${index}`)
      this._client.updateAsync({
        index: index,
        type: 'object',
        id: dataCopy.id,
        body: {
          doc: dataCopy,
          doc_as_upsert: true
        }
      })
    })
  }

	/**
	 * Return an ES6 Set containing all of the IDs of all the objects in a CSV file
	 * @private
	 * @param {string} csvExport - Name of the CSV export to pull IDs from
	 * @return {Promise} Resolves to the ES6 Set containing all ids
	 */
	_getAllCSVIds(csvExport) {
		return new Promise((resolve, reject) => {
			const allCSVIds = new Set();
			const csvFilePath = path.join(this._csvRootDir, csvExport, 'objects.csv');
			try {
				csv
					.fromPath(csvFilePath, { headers: true })
					.on('data', (data) => {
						allCSVIds.add(parseInt(data.id));
					})
					.on('end', () => {
						resolve(allCSVIds);
					});
			} catch (e) {
				reject(e);
			}
		});
	}

  /**
   * Create a new index with the current timestamp
   * @private
   * @return {Promise} the index name
   */
  _prepareIndexForSync() {
    const timestamp = Date.now()
    const index = `${this._prefix}_${timestamp}`
    return this._createCollectionIndex(index)
  }

	/**
	 * Synchronize the elasticsearch index with the given CSV file
	 * @private
	 * @param {string} csvExport - Name of the CSV export with which to synchronize
	 */
	syncESWithCSV(csvExport) {
    this._prepareIndexForSync().then(index => {
      const csvFilePath = path.join(this._csvRootDir, csvExport, 'objects.csv');
      let processed = 0;
      logger.info("Beginning CSV sync");
      return new Promise((resolve, reject) => {
        const todos = [];
        try {
          csv
            .fromPath(csvFilePath, { headers: true })
            .on('data', (data) => {
              todos.push(data);
            })
            .on('end', () => {
              eachLimit(todos, rateLimit, (data, cb) => {
                this._createDocumentWithData(data, this._client)
                  .then(() => {
		    console.log('added ' + data.id);
                    cb();
                  })
                  .catch(e => {
                    console.error('problem with' + data.id)
                    console.error(e)
                    reject(e)
		});
              }, (err) => {
		if (err) return reject(err)
                logger.info('Finished export');
                resolve()
              })
            });
        } catch (e) {
          reject(e)
        }
      })
    })
	}

	_updateDocumentWithData(docId, data) {
		const dataCopy = this._analyzedData(data);
    return this._latestCollection().then(index => {
      this._client.updateAsync({
        index: index,
        type: 'object',
        id: docId,
        body: {
          doc: dataCopy,
        },
      })
    })
	}

	/**
	 * Reindexes the collection index based on the mappings file.
	 * @return {Promise} Resolves to a description of the Elasticsearch index
	 */
	_updateMappings() {
		var mappings = mapping.mappings.object.properties;
		mappings = this._addDataPropsToMappings(mappings);

		return this._latestCollection().then((index) => {
      return this._client.indices.putMapping({
        index: index,
        body: { properties: mappings },
        type: 'document'
      });
		})
	}

	_addDataPropsToMappings(mappings) {
		const csvTypes = [
			'color_descriptor.csv',
			'generic_descriptor.csv',
			'light_line_space_indicators.csv',
			'composition_descriptor.csv',
			'light_descriptor.csv',
			'line_HVDC_indicators.csv'
		];
		csvTypes.forEach((csvType) => {
			let headers = this._getDataHeaders(csvType);
			headers.splice(0, 1);

			headers.forEach((header) => {
				mappings[header] = {
					type: "multi_field",
					fields: {}
				};
				mappings[header]['fields'][header] = { type: "float" };
				mappings[header]['fields'][`string-${header}`] = { type: "string" };
			});
		});

		return mappings;
	}

	completed(message) {
		this._status = ESCollectionStatus.READY;
		this._message = message;
		logger.info(message);
		super.completed();
	}

	/**
	 * Returns a description of the Elasticsearch index.
	 * @return {Promise} Resolves to a description of the Elasticsearch index
	 */
	description() {
    return this._latestCollection()
      .catch(() => {
				return { status: 'uninitialized' };
      })
      .then(index => {
        const countGetter =
          this._client.countAsync({
              index: index,
              type: 'object',
          }).then(response => {
            return {
              count: response.count || 0
            }
          })

				return Promise.all([countGetter]).then((res) => {
					const [count] = res;
					return Object.assign({
						status: this._status,
						message: this._message,
						kibanaUrl: this._kibanaUrl,
						index: index
					}, count);
				});
			})
	}

	/**
	 * Public wrapper for _prepareIndexForSync, which creates the index document
	 * @return {Promise} Resolved when the elasticsearch request completes
	 */
	initialize() {
		return this._prepareIndexForSync();
	}

	progress(message) {
		this._message = message;
		super.progress();
	}

	/**
	 * Performs a simple query search using the given elasticsearch query
	 * @param {string} query - The search query
	 * @return {Promise} Resolves to the result of the elasticsearch query on completion
	 */
	search(query) {
		console.log("Searching for ", query)
    return this.latestCollection().then(index => {
      this._client.search({
        index: index,
        q: query
      })
    })
	}

	started(status, message) {
		this._status = status;
		this._message = message;
		logger.info(this._message);
		super.started();
	}

	/**
	 * Attempts to import a data CSV into the Elasticsearch index.
	 * @param {string} importCSV - Name of the data CSV to import into ES
	 * @return {Promise} Resolved when the synchronization is complete
	 * @throws {ESCollectionException}
	 */
	importDataCSVToES(importCSV) {
		const csvFilePath = path.join(this._csvRootDir, importCSV);

		if (!fs.existsSync(csvFilePath)) {
			logger.info("Can't find CSV to import. Stopping.");
			return false;
		}

		return this._updateESWithDataCSV(csvFilePath).then((res) => {
			logger.info(res);
		});
	}

	/**
	 * Returns array of headers for specified CSV type.
	 * @param {string} csvType - Type of CSV data to import.
	 * @return {array} headers
	 */
	_getDataHeaders(csvType) {
		let headers = ['id'];

		switch(csvType) {
			case 'generic_descriptor.csv':
				for (let i = 1; i < 21; i++) {
					headers.push('generic_desc_'+i);
				}
				return headers;
			case 'light_descriptor.csv':
				for (let i = 1; i < 11; i++) {
					headers.push('light_desc_'+i);
				}
				return headers;
			case 'color_descriptor.csv':
				for (let i = 1; i < 61; i++) {
					headers.push('color_desc_'+i);
				}
				return headers;
			case 'composition_descriptor.csv':
				for (let i = 1; i < 41; i++) {
					headers.push('comp_desc_'+i);
				}
				return headers;
			case 'light_line_space_indicators.csv':
				return ['id', 'light', 'line', 'space'];
			case 'line_HVDC_indicators.csv':
				return ['id', 'horizontal', 'vertical', 'diagonal', 'curvy'];
			case 'tags.csv':
				return ['id', 'tag', 'category', 'confidence'];
			default:
				return false;
		}
	}

	/**
	 * Returns object structured for import into ES index.
	 * If no data is provided, returns empty object.
	 * @param {string} csvType - Type of CSV data to import.
	 * @param {object} data - Data in row of CSV.
	 * @return {object} formattedDoc - Object containing CSV data.
	 */
	_getFormattedDoc(csvType, data) {
		let formattedDoc = {};
		const headers = this._getDataHeaders(csvType);

		if (headers) {
			for (let i = 1; i < headers.length; i++) {
				const header = headers[i];
				formattedDoc[header] = data[header];
			}
		}

		return formattedDoc;
	}

	/**
	 * Update the elasticsearch index with the given CSV file
	 * @private
	 * @param {string} csvFilePath - File path of the CSV to import.
	 */
	_updateESWithDataCSV(csvFilePath) {
		const csvType = path.basename(csvFilePath);
		const headers = this._getDataHeaders(csvType);

		let processed = 0;
		logger.info("Beginning CSV import");
		return new Promise((resolve, reject) => {
			const lines = [];
			try {
				csv
					.fromPath(csvFilePath, {
						headers: headers,
						ignoreEmpty: true
					})
					.on('data', (data) => {
						lines.push(data);
					})
					.on('end', () => {
						eachLimit(lines, rateLimit, (data, cb) => {
							const formattedDoc = this._getFormattedDoc(csvType, data);
							const docId = parseInt(data.id);

							this._updateDocumentWithPartialDoc(docId, formattedDoc).then(() => {
								logger.info(`Synchronizing with ${csvFilePath}, ${++processed} documents uploaded`);
								cb();
							})
							.catch(reject);
						}, () => {
							logger.info('imported');
							resolve();
						});
					});
			} catch (e) {
				reject(e);
			}
		});
	}

	_updateESWithImageSecrets(csvFilePath) {
		let processed = 0;
		const imageSecrets = [];

    logger.info("Beginning image secrets import...");

    return new Promise((resolve, reject) => {
      try {
        csv.fromPath(csvFilePath, {
          headers: false,
          ignoreEmpty: true
        })
        .on('data', (data) => {
          const image = {
            id: data[0],
            imageSecret: data[1],
            imageOriginalSecret: data[2]
          };
          imageSecrets.push(image);
        })
        .on('end', (data) => {
          eachLimit(imageSecrets, rateLimit, (image, cb) => {
            let formattedDoc = {};
            formattedDoc['imageSecret'] = image.imageSecret;
            formattedDoc['imageOriginalSecret'] = image.imageOriginalSecret;
            console.log(formattedDoc);

            this._updateDocumentWithPartialDoc(image.id, formattedDoc).then(() => {
              logger.info(`Image secrets added to ${++processed} objects`);
              cb();
            })
	    .catch(reject)
          }, () => {
            logger.info('Imported image secrets!');
            resolve();
          })
        })
      } catch (e) {
        reject(e);
      }
    })
	}

	_updateESWithColorData(csvFilePath) {
		let processed = 0;
		const colorData = [];

		logger.info("Beginning color data import...");

		return new Promise((resolve, reject) => {
			try {
				csv.fromPath(csvFilePath, {
					headers: true,
					ignoreEmpty: true
				})
				.on('data', (data) => {
					const colorObject = data
					colorObject.id = data._id
					delete colorObject._id
					delete colorObject._index
					delete colorObject._score
					delete colorObject._type

					colorData.push(colorObject);
				})
				.on('end', (data) => {
					eachLimit(colorData, rateLimit, (object, cb) => {
						this._updateDocumentWithPartialDoc(object.id, object).then(() => {
							logger.info(`Added color data to ${++processed} objects`);
							cb();
						})
						.catch(reject);
					}, () => {
						logger.info('imported color data');
						resolve();
					})
				})
			} catch (e) {
				reject(e);
			}
		})
	}

	_updateESwithDocumentTags(csvFilePath) {
		let processed = 0;
		logger.info("Beginning tag import");

		return new Promise((resolve, reject) => {
			const objectTags = {};
			try {
				csv
					.fromPath(csvFilePath, {
						headers: ['id', 'tag', 'category', 'confidence'],
						ignoreEmpty: true
					})
					.on('data', (tag) => {
						if (parseFloat(tag.confidence) >= 0.2) {
							let id = tag.id;
							const tagObject = {
								tag: tag.tag,
								category: tag.category,
								confidence: tag.confidence
							};

							objectTags[id] = objectTags[id] || { 'id': id };
							objectTags[id]['tags'] = objectTags[id]['tags'] || [];
							objectTags[id]['tags'].push(tagObject);
						}
					})
					.on('end', () => {
						eachLimit(objectTags, rateLimit, (object, cb) => {
							this._updateDocumentWithPartialDoc(object.id, object)
							  .then(() => {
  								logger.info(`${++processed} objects tagged`);
  								cb();
  							})
  							.catch(reject);
						}, () => {
							logger.info('imported tags');
							resolve();
						})
					});
			} catch (e) {
				reject(e);
			}
		})
	}

	_updateDocumentWithPartialDoc(docId, partialDoc) {
    return this._latestCollection()
      .then((index) => {
        console.log(`(Updating index ${index})`)
        return this._client.updateAsync({
          index: index,
          type: 'object',
          id: docId,
          body: {
            doc: partialDoc,
          },
        })
      })
	}

	/**
	 * Verifies that the Elasticsearch index is exactly in sync with a given CSV file.
	 * @param {string} csvExport - Name of the CSV export to synchronize with ES
	 * @return {Promise} Resolves to true if the two documents are in sync and false otherwise
	 */
	validateForCSV(csvExport) {
		const csvFilePath = path.join(this._csvRootDir, csvExport, 'objects.csv');

		let allEsIds, allCSVIds;

		this.started(ESCollectionStatus.VALIDATING, `Validating index to match ${csvExport}`);
		return this._getAllObjectIds().then((ids) => {
			allEsIds = ids;
			this.progress(`Fetched ${allEsIds.size} from Elasticsearch`);
			return this._getAllCSVIds(csvExport);
		}).then((ids) => {
			allCSVIds = ids;
			this.progress(`Fetched ${allCSVIds.size} from CSV export`);
			return _.isEqual(allEsIds, allCSVIds);
		}).then((idsAreEqual) => {
			if (!idsAreEqual) {
				return false;
			} else {
				const allDataPresent = this._compareCSVDataWithIndex(csvExport);
				return allDataPresent;
			}
		}).then((valid) => {
			this.completed(`Index ${valid ? "matches" : "does not match"} ${csvExport}`);
			return valid;
		});
	}
};

/**
 * Exceptions thrown by the {@link ESCollection} class
 * @constructor ESCollectionException
 * @memberof ESCollection
 * @static
 */
ESCollection.ESCollectionException = function(message) {
	this.message = message;
	this.name = 'ESCollectionException';
}

module.exports = ESCollection;
