## Modules

<dl>
<dt><a href="#module_/Users/samtarakajian/git/barnes-vagrant/projects/CollectionWebsite/src/util/csvUtil">/Users/samtarakajian/git/barnes-vagrant/projects/CollectionWebsite/src/util/csvUtil</a></dt>
<dd><p>Utitly functions for working with CSV files</p></dd>
<dt><a href="#module_/Users/samtarakajian/git/barnes-vagrant/projects/CollectionWebsite/src/util/senecaPluginAPI">/Users/samtarakajian/git/barnes-vagrant/projects/CollectionWebsite/src/util/senecaPluginAPI</a></dt>
<dd><p>Base class and functions for using an class to implement a Seneca Plugin API</p></dd>
</dl>

## Classes

<dl>
<dt><a href="#ColorProcessAPI">ColorProcessAPI</a></dt>
<dd><p>Seneca plugin for processing TMS images using the Cooper Hewitt palette extractor</p></dd>
<dt><a href="#ESCollection">ESCollection</a></dt>
<dd><p>Manages the process of importing a CSV file into Elasticsearch. The <code>collection</code> index has two types,
<code>meta</code> and <code>object</code>. The <code>meta</code> type stores information about the import process itself, including the
timestamp of the last CSV file to be imported (lastCSVImportTimestamp) and whether or not the index is
currently synchronized with a CSV file (hasImportedCSV). The <code>object</code> type stores the collection objects
themselves, and will have different fields depending on the headers of the imported CSV file</p></dd>
<dt><a href="#ESPluginAPI">ESPluginAPI</a></dt>
<dd><p>Seneca plugin for coordinating with the Elasticsearch importer</p></dd>
<dt><a href="#CSVPluginAPI">CSVPluginAPI</a></dt>
<dd><p>Seneca plugin for listing the exported CSV files</p></dd>
<dt><a href="#ImageUploader">ImageUploader</a></dt>
<dd><p>Uploads images (jpgs) to Amazon s3 from TMS</p></dd>
<dt><a href="#RawUploader">RawUploader</a></dt>
<dd><p>Uploads raw images (tifs) to Amazon s3 from TMS</p></dd>
<dt><a href="#TileUploader">TileUploader</a></dt>
<dd><p>Uploads tiled images, by IIIF spec to Amazon s3 from TMS</p></dd>
<dt><a href="#ImagesPluginAPI">ImagesPluginAPI</a></dt>
<dd><p>Seneca plugin for coordinating with the image tiling and upload scripts</p></dd>
<dt><a href="#ArtObject">ArtObject</a></dt>
<dd><p>Thin wrapper around the JSON description of a collection object in TMS</p></dd>
<dt><a href="#ExportConfig">ExportConfig</a></dt>
<dd><p>Wrapper and validator for a JSON object implementing <a href="#TMSExporter..TMSExportConfiguration">TMSExportConfiguration</a></p></dd>
<dt><a href="#ExportMetadata">ExportMetadata</a></dt>
<dd><p>Synchronizes the state of a TMS export process with a <code>meta.json</code> file.</p></dd>
<dt><a href="#TMSExporter">TMSExporter</a></dt>
<dd><p>Manages the export from TMS to a CSV file.</p></dd>
<dt><a href="#TMSFileReader">TMSFileReader</a></dt>
<dd><p>Reads a directory of JSON files, each one representing a TMS collection object,
 as if it were a TMS API. Used mostly for testing</p></dd>
<dt><a href="#TMSURLReader">TMSURLReader</a></dt>
<dd></dd>
<dt><a href="#WarningReporter">WarningReporter</a></dt>
<dd><p>Writes warnings to a CSV file as they are emitted by the TMS export script. Warning file will
be called <code>warnings.csv</code></p></dd>
<dt><a href="#CSVWriter">CSVWriter</a></dt>
<dd><p>Manages writing to a CSV file</p></dd>
<dt><a href="#WebsocketUpdater">WebsocketUpdater</a></dt>
<dd><p>Forwards updates from a subclass of <a href="#UpdateEmitter">UpdateEmitter</a> to a websocket</p></dd>
</dl>

<a name="module_/Users/samtarakajian/git/barnes-vagrant/projects/CollectionWebsite/src/util/csvUtil"></a>

## /Users/samtarakajian/git/barnes-vagrant/projects/CollectionWebsite/src/util/csvUtil
<p>Utitly functions for working with CSV files</p>


* [/Users/samtarakajian/git/barnes-vagrant/projects/CollectionWebsite/src/util/csvUtil](#module_/Users/samtarakajian/git/barnes-vagrant/projects/CollectionWebsite/src/util/csvUtil)
    * [.csvForEach(csvPath, cb)](#module_/Users/samtarakajian/git/barnes-vagrant/projects/CollectionWebsite/src/util/csvUtil.csvForEach)
    * [.csvCompleted(csvDirPath)](#module_/Users/samtarakajian/git/barnes-vagrant/projects/CollectionWebsite/src/util/csvUtil.csvCompleted) ⇒ <code>bool</code>
    * [.doCSVKeysMatch(csvFilePathA, csvFilePathB)](#module_/Users/samtarakajian/git/barnes-vagrant/projects/CollectionWebsite/src/util/csvUtil.doCSVKeysMatch) ⇒ <code>Promise</code>
    * [.getLastCompletedCSV(csvRootDir)](#module_/Users/samtarakajian/git/barnes-vagrant/projects/CollectionWebsite/src/util/csvUtil.getLastCompletedCSV) ⇒ <code>string</code>
    * [.diffCSV(oldCSVPath, newCSVPath, logger)](#module_/Users/samtarakajian/git/barnes-vagrant/projects/CollectionWebsite/src/util/csvUtil.diffCSV) ⇒ <code>object</code>

<a name="module_/Users/samtarakajian/git/barnes-vagrant/projects/CollectionWebsite/src/util/csvUtil.csvForEach"></a>

### /Users/samtarakajian/git/barnes-vagrant/projects/CollectionWebsite/src/util/csvUtil.csvForEach(csvPath, cb)
<p>Calls a callback function for each row of a CSV on the given CSV path.
First row of the CSV must be headers. Callback function has one argument,
an object whose keys are the header columns.</p>

**Kind**: static method of [<code>/Users/samtarakajian/git/barnes-vagrant/projects/CollectionWebsite/src/util/csvUtil</code>](#module_/Users/samtarakajian/git/barnes-vagrant/projects/CollectionWebsite/src/util/csvUtil)  

| Param | Type | Description |
| --- | --- | --- |
| csvPath | <code>string</code> | <p>Path to the csv file</p> |
| cb | <code>function</code> | <p>Function to call on each row</p> |

<a name="module_/Users/samtarakajian/git/barnes-vagrant/projects/CollectionWebsite/src/util/csvUtil.csvCompleted"></a>

### /Users/samtarakajian/git/barnes-vagrant/projects/CollectionWebsite/src/util/csvUtil.csvCompleted(csvDirPath) ⇒ <code>bool</code>
<p>Whether or not the csv export contained in the given directory ran to completion or not</p>

**Kind**: static method of [<code>/Users/samtarakajian/git/barnes-vagrant/projects/CollectionWebsite/src/util/csvUtil</code>](#module_/Users/samtarakajian/git/barnes-vagrant/projects/CollectionWebsite/src/util/csvUtil)  
**Returns**: <code>bool</code> - <p>True if the CSV export script ran to completion, false otherwise</p>  

| Param | Type | Description |
| --- | --- | --- |
| csvDirPath | <code>string</code> | <p>Path to the folder containing the files exported by the  CSV export script</p> |

<a name="module_/Users/samtarakajian/git/barnes-vagrant/projects/CollectionWebsite/src/util/csvUtil.doCSVKeysMatch"></a>

### /Users/samtarakajian/git/barnes-vagrant/projects/CollectionWebsite/src/util/csvUtil.doCSVKeysMatch(csvFilePathA, csvFilePathB) ⇒ <code>Promise</code>
<p>Whether or not the header keys for two CSV files are the same or different
(the headers need not be in the same order to be the same)</p>

**Kind**: static method of [<code>/Users/samtarakajian/git/barnes-vagrant/projects/CollectionWebsite/src/util/csvUtil</code>](#module_/Users/samtarakajian/git/barnes-vagrant/projects/CollectionWebsite/src/util/csvUtil)  
**Returns**: <code>Promise</code> - <p>Resolves to true if the headers match, false otherwires</p>  

| Param | Type | Description |
| --- | --- | --- |
| csvFilePathA | <code>string</code> | <p>Path to the first objects.csv file</p> |
| csvFilePathB | <code>string</code> | <p>Path to the second objects.csv file</p> |

<a name="module_/Users/samtarakajian/git/barnes-vagrant/projects/CollectionWebsite/src/util/csvUtil.getLastCompletedCSV"></a>

### /Users/samtarakajian/git/barnes-vagrant/projects/CollectionWebsite/src/util/csvUtil.getLastCompletedCSV(csvRootDir) ⇒ <code>string</code>
<p>Name of the most recent CSV directory, given the directory containing CSV directories</p>

**Kind**: static method of [<code>/Users/samtarakajian/git/barnes-vagrant/projects/CollectionWebsite/src/util/csvUtil</code>](#module_/Users/samtarakajian/git/barnes-vagrant/projects/CollectionWebsite/src/util/csvUtil)  
**Returns**: <code>string</code> - <p>Name of the most recent CSV directory</p>  

| Param | Type | Description |
| --- | --- | --- |
| csvRootDir | <code>string</code> | <p>Path to the directory containing csv_* directories,  as output by the CSV export script</p> |

<a name="module_/Users/samtarakajian/git/barnes-vagrant/projects/CollectionWebsite/src/util/csvUtil.diffCSV"></a>

### /Users/samtarakajian/git/barnes-vagrant/projects/CollectionWebsite/src/util/csvUtil.diffCSV(oldCSVPath, newCSVPath, logger) ⇒ <code>object</code>
<p>Diffs two csvs and returns a JSON object of all fields changed, added, or removed
using the python library csvdiff.</p>

**Kind**: static method of [<code>/Users/samtarakajian/git/barnes-vagrant/projects/CollectionWebsite/src/util/csvUtil</code>](#module_/Users/samtarakajian/git/barnes-vagrant/projects/CollectionWebsite/src/util/csvUtil)  
**Returns**: <code>object</code> - <p>the diff in JSON form</p>  

| Param | Type | Description |
| --- | --- | --- |
| oldCSVPath | <code>string</code> | <p>Path to the old CSV file</p> |
| newCSVPath | <code>string</code> | <p>Path to the new CSV file</p> |
| logger | <code>logger</code> | <p>instance of winston logger, specific to the microservice</p> |

<a name="module_/Users/samtarakajian/git/barnes-vagrant/projects/CollectionWebsite/src/util/senecaPluginAPI"></a>

## /Users/samtarakajian/git/barnes-vagrant/projects/CollectionWebsite/src/util/senecaPluginAPI
<p>Base class and functions for using an class to implement a Seneca Plugin API</p>


* [/Users/samtarakajian/git/barnes-vagrant/projects/CollectionWebsite/src/util/senecaPluginAPI](#module_/Users/samtarakajian/git/barnes-vagrant/projects/CollectionWebsite/src/util/senecaPluginAPI)
    * _static_
        * [.makeAPI(role, apiObjectClass)](#module_/Users/samtarakajian/git/barnes-vagrant/projects/CollectionWebsite/src/util/senecaPluginAPI.makeAPI) ⇒
    * _inner_
        * *[~SenecaPluginAPI](#module_/Users/samtarakajian/git/barnes-vagrant/projects/CollectionWebsite/src/util/senecaPluginAPI..SenecaPluginAPI)*
            * *[new SenecaPluginAPI(seneca, options)](#new_module_/Users/samtarakajian/git/barnes-vagrant/projects/CollectionWebsite/src/util/senecaPluginAPI..SenecaPluginAPI_new)*
            * *[.seneca](#module_/Users/samtarakajian/git/barnes-vagrant/projects/CollectionWebsite/src/util/senecaPluginAPI..SenecaPluginAPI+seneca)*

<a name="module_/Users/samtarakajian/git/barnes-vagrant/projects/CollectionWebsite/src/util/senecaPluginAPI.makeAPI"></a>

### /Users/samtarakajian/git/barnes-vagrant/projects/CollectionWebsite/src/util/senecaPluginAPI.makeAPI(role, apiObjectClass) ⇒
<p>Given a role and the name of a class extending [SenecaPluginAPI](SenecaPluginAPI), this function
returns a function that Seneca can call to configure a plugin API.</p>

**Kind**: static method of [<code>/Users/samtarakajian/git/barnes-vagrant/projects/CollectionWebsite/src/util/senecaPluginAPI</code>](#module_/Users/samtarakajian/git/barnes-vagrant/projects/CollectionWebsite/src/util/senecaPluginAPI)  
**Returns**: <p>A function suitable for being required by Seneca.use</p>  

| Param | Type | Description |
| --- | --- | --- |
| role | <code>string</code> | <p>A role string that will be prefixed to actions exposed by the plugin.</p> |
| apiObjectClass | <code>class</code> | <p>Classname that extends [SenecaPluginAPI](SenecaPluginAPI)</p> |

**Example**  
```js
// filename myCustomAPI.js
class MyCustomAPI extends SenecaPluginAPI {
	constructor(seneca, options) {
		super(seneca, options);
		this._something = options.something;
	}
	description() {
		return { status: 'OK', something: this._something };
	}
}
const { makeAPI } = require('./senecaPluginAPI');
module.exports = makeAPI('role:custom', MyCustomAPI);
// Returns an API that will respond to 'role:custom,cmd:description'
// Use by calling require('seneca')().use('./myCustomAPI.js')
```
<a name="module_/Users/samtarakajian/git/barnes-vagrant/projects/CollectionWebsite/src/util/senecaPluginAPI..SenecaPluginAPI"></a>

### */Users/samtarakajian/git/barnes-vagrant/projects/CollectionWebsite/src/util/senecaPluginAPI~SenecaPluginAPI*
<p>Abstract base class for Seneca API plugin services</p>

**Kind**: inner abstract class of [<code>/Users/samtarakajian/git/barnes-vagrant/projects/CollectionWebsite/src/util/senecaPluginAPI</code>](#module_/Users/samtarakajian/git/barnes-vagrant/projects/CollectionWebsite/src/util/senecaPluginAPI)  

* *[~SenecaPluginAPI](#module_/Users/samtarakajian/git/barnes-vagrant/projects/CollectionWebsite/src/util/senecaPluginAPI..SenecaPluginAPI)*
    * *[new SenecaPluginAPI(seneca, options)](#new_module_/Users/samtarakajian/git/barnes-vagrant/projects/CollectionWebsite/src/util/senecaPluginAPI..SenecaPluginAPI_new)*
    * *[.seneca](#module_/Users/samtarakajian/git/barnes-vagrant/projects/CollectionWebsite/src/util/senecaPluginAPI..SenecaPluginAPI+seneca)*

<a name="new_module_/Users/samtarakajian/git/barnes-vagrant/projects/CollectionWebsite/src/util/senecaPluginAPI..SenecaPluginAPI_new"></a>

#### *new SenecaPluginAPI(seneca, options)*

| Param | Type | Description |
| --- | --- | --- |
| seneca | <code>object</code> | <p>The seneca object used to initialize the API plugin</p> |
| options | <code>object</code> | <p>Opitions to be passed to the plugin on initialization</p> |

<a name="module_/Users/samtarakajian/git/barnes-vagrant/projects/CollectionWebsite/src/util/senecaPluginAPI..SenecaPluginAPI+seneca"></a>

#### *senecaPluginAPI.seneca*
<p>The seneca object used to initialize the API plugin</p>

**Kind**: instance property of [<code>SenecaPluginAPI</code>](#module_/Users/samtarakajian/git/barnes-vagrant/projects/CollectionWebsite/src/util/senecaPluginAPI..SenecaPluginAPI)  
<a name="TMSReader"></a>

## TMSReader
**Kind**: global interface  

* [TMSReader](#TMSReader)
    * *[.hasNext()](#TMSReader+hasNext) ⇒ <code>bool</code>*
    * [.next()](#TMSReader+next) ⇒

<a name="TMSReader+hasNext"></a>

### *tmsReader.hasNext() ⇒ <code>bool</code>*
<p>Whether or not there are more TMS objects in the collection</p>

**Kind**: instance abstract method of [<code>TMSReader</code>](#TMSReader)  
<a name="TMSReader+next"></a>

### tmsReader.next() ⇒
**Kind**: instance method of [<code>TMSReader</code>](#TMSReader)  
**Returns**: <p>JSON description of a TMS collection object, in whatever format TMS provides</p>  
<a name="UpdateEmitter"></a>

## UpdateEmitter
**Kind**: global interface  

* [UpdateEmitter](#UpdateEmitter)
    * [.status](#UpdateEmitter+status)
    * [.started()](#UpdateEmitter+started)
    * [.progress()](#UpdateEmitter+progress)
    * [.completed()](#UpdateEmitter+completed)
    * ["started"](#UpdateEmitter+event_started)
    * ["progress"](#UpdateEmitter+event_progress)
    * ["completed"](#UpdateEmitter+event_completed)

<a name="UpdateEmitter+status"></a>

### updateEmitter.status
<p>Returns an empty object by default. Subclasses should override to return more detail</p>

**Kind**: instance property of [<code>UpdateEmitter</code>](#UpdateEmitter)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| status | <code>object</code> | <p>object</p> |

**Example**  
```js
class MyClass extends UpdateEmitter {
	get status() {
		return {
			progress: '50%'
		};
	}
}
```
<a name="UpdateEmitter+started"></a>

### updateEmitter.started()
<p>Emit a <code>started</code> event with the result of calling [UpdateEmitter~status](UpdateEmitter~status)</p>

**Kind**: instance method of [<code>UpdateEmitter</code>](#UpdateEmitter)  
**Emits**: [<code>started</code>](#UpdateEmitter+event_started)  
<a name="UpdateEmitter+progress"></a>

### updateEmitter.progress()
<p>Emit a <code>progress</code> event with the result of calling [UpdateEmitter~status](UpdateEmitter~status)</p>

**Kind**: instance method of [<code>UpdateEmitter</code>](#UpdateEmitter)  
**Emits**: [<code>progress</code>](#UpdateEmitter+event_progress)  
<a name="UpdateEmitter+completed"></a>

### updateEmitter.completed()
<p>Emit a <code>completed</code> event with the result of calling [UpdateEmitter~status](UpdateEmitter~status)</p>

**Kind**: instance method of [<code>UpdateEmitter</code>](#UpdateEmitter)  
**Emits**: [<code>completed</code>](#UpdateEmitter+event_completed)  
<a name="UpdateEmitter+event_started"></a>

### "started"
<p>Update started event. Property keys depend on subclass implementation</p>

**Kind**: event emitted by [<code>UpdateEmitter</code>](#UpdateEmitter)  
<a name="UpdateEmitter+event_progress"></a>

### "progress"
<p>Update progress event. Property keys depend on subclass implementation</p>

**Kind**: event emitted by [<code>UpdateEmitter</code>](#UpdateEmitter)  
<a name="UpdateEmitter+event_completed"></a>

### "completed"
<p>Update completed event. Property keys depend on subclass implementation</p>

**Kind**: event emitted by [<code>UpdateEmitter</code>](#UpdateEmitter)  
<a name="ColorProcessAPI"></a>

## ColorProcessAPI
<p>Seneca plugin for processing TMS images using the Cooper Hewitt palette extractor</p>

**Kind**: global class  
<a name="ColorProcessAPI+process"></a>

### colorProcessAPI.process()
<p>Begin the Cooper-Hewitt color processing operation</p>

**Kind**: instance method of [<code>ColorProcessAPI</code>](#ColorProcessAPI)  
<a name="ESCollection"></a>

## ESCollection
<p>Manages the process of importing a CSV file into Elasticsearch. The <code>collection</code> index has two types,
<code>meta</code> and <code>object</code>. The <code>meta</code> type stores information about the import process itself, including the
timestamp of the last CSV file to be imported (lastCSVImportTimestamp) and whether or not the index is
currently synchronized with a CSV file (hasImportedCSV). The <code>object</code> type stores the collection objects
themselves, and will have different fields depending on the headers of the imported CSV file</p>

**Kind**: global class  

* [ESCollection](#ESCollection)
    * [new ESCollection(esOptions, csvRootDirectory)](#new_ESCollection_new)
    * _instance_
        * [.status](#ESCollection+status)
        * [._analyzedData()](#ESCollection+_analyzedData)
        * [._deleteCollectionIndex()](#ESCollection+_deleteCollectionIndex) ⇒ <code>Promise</code>
        * [._isIndexReadyForSync()](#ESCollection+_isIndexReadyForSync) ⇒ <code>Promise</code>
        * [._updateMappings()](#ESCollection+_updateMappings) ⇒ <code>Promise</code>
        * [.clearCollectionObjects()](#ESCollection+clearCollectionObjects) ⇒ <code>Promise</code>
        * [.description()](#ESCollection+description) ⇒ <code>Promise</code>
        * [.initialize()](#ESCollection+initialize) ⇒ <code>Promise</code>
        * [.search(query)](#ESCollection+search) ⇒ <code>Promise</code>
        * [.syncESToCSV(csvExport)](#ESCollection+syncESToCSV) ⇒ <code>Promise</code>
        * [.validateForCSV(csvExport)](#ESCollection+validateForCSV) ⇒ <code>Promise</code>
    * _static_
        * [.ESCollectionException](#ESCollection.ESCollectionException)
            * [new ESCollectionException()](#new_ESCollection.ESCollectionException_new)
    * _inner_
        * [~ESImportStatus](#ESCollection..ESImportStatus) : <code>object</code>

<a name="new_ESCollection_new"></a>

### new ESCollection(esOptions, csvRootDirectory)

| Param | Type | Description |
| --- | --- | --- |
| esOptions | <code>string</code> | <p>Options dictionary used to initialize an elasticsearch client</p> |
| csvRootDirectory | <code>string</code> | <p>Path to the directory containing csv_* directories with exports from TMS</p> |

<a name="ESCollection+status"></a>

### esCollection.status
**Kind**: instance property of [<code>ESCollection</code>](#ESCollection)  
**Properties**

| Name | Type |
| --- | --- |
| status | [<code>ESImportStatus</code>](#ESCollection..ESImportStatus) | 

<a name="ESCollection+_analyzedData"></a>

### esCollection._analyzedData()
<p>Analyze a JSON object before sending it to be stored in ES, decorating it
with additional KV pairs and filtering out bad characters</p>

**Kind**: instance method of [<code>ESCollection</code>](#ESCollection)  
<a name="ESCollection+_deleteCollectionIndex"></a>

### esCollection._deleteCollectionIndex() ⇒ <code>Promise</code>
<p>Removes the collection index</p>

**Kind**: instance method of [<code>ESCollection</code>](#ESCollection)  
**Returns**: <code>Promise</code> - <p>Resolved when the elasticsearch request completes</p>  
<a name="ESCollection+_isIndexReadyForSync"></a>

### esCollection._isIndexReadyForSync() ⇒ <code>Promise</code>
<p>Whether or not the index is ready to sync with a CSV. Checks if the index exists
and whether the meta object exists</p>

**Kind**: instance method of [<code>ESCollection</code>](#ESCollection)  
**Returns**: <code>Promise</code> - <p>Resolved when the elasticsearch request complete, result is whether the index is ready</p>  
<a name="ESCollection+_updateMappings"></a>

### esCollection._updateMappings() ⇒ <code>Promise</code>
<p>Reindexes the collection index based on the mappings file.</p>

**Kind**: instance method of [<code>ESCollection</code>](#ESCollection)  
**Returns**: <code>Promise</code> - <p>Resolves to a description of the Elasticsearch index</p>  
<a name="ESCollection+clearCollectionObjects"></a>

### esCollection.clearCollectionObjects() ⇒ <code>Promise</code>
<p>Removes all objects from the collections index and resets the meta document</p>

**Kind**: instance method of [<code>ESCollection</code>](#ESCollection)  
**Returns**: <code>Promise</code> - <p>Resolves to a description of the Elasticsearch index</p>  
<a name="ESCollection+description"></a>

### esCollection.description() ⇒ <code>Promise</code>
<p>Returns a description of the Elasticsearch index.</p>

**Kind**: instance method of [<code>ESCollection</code>](#ESCollection)  
**Returns**: <code>Promise</code> - <p>Resolves to a description of the Elasticsearch index</p>  
<a name="ESCollection+initialize"></a>

### esCollection.initialize() ⇒ <code>Promise</code>
<p>Public wrapper for _prepareIndexForSync, which creates the index and metadata document</p>

**Kind**: instance method of [<code>ESCollection</code>](#ESCollection)  
**Returns**: <code>Promise</code> - <p>Resolved when the elasticsearch request completes</p>  
<a name="ESCollection+search"></a>

### esCollection.search(query) ⇒ <code>Promise</code>
<p>Performs a simple query search using the given elasticsearch query</p>

**Kind**: instance method of [<code>ESCollection</code>](#ESCollection)  
**Returns**: <code>Promise</code> - <p>Resolves to the result of the elasticsearch query on completion</p>  

| Param | Type | Description |
| --- | --- | --- |
| query | <code>string</code> | <p>The search query</p> |

<a name="ESCollection+syncESToCSV"></a>

### esCollection.syncESToCSV(csvExport) ⇒ <code>Promise</code>
<p>Attempts to synchronize the Elasticsearch index with the given CSV export
If the index has already been synchronized with a CSV file, then this function will compare the CSV
file to be imported with the previous file. Only the differences between the two will be used to
update Elasticsearch. If the previous file cannot be found, or if the two CSV files have different
headers, then the Elasticsearch index will be cleared before updating.</p>

**Kind**: instance method of [<code>ESCollection</code>](#ESCollection)  
**Returns**: <code>Promise</code> - <p>Resolved when the synchronization is complete</p>  
**Throws**:

- <code>ESCollectionException</code> 


| Param | Type | Description |
| --- | --- | --- |
| csvExport | <code>string</code> | <p>Name of the CSV export to synchronize with ES</p> |

<a name="ESCollection+validateForCSV"></a>

### esCollection.validateForCSV(csvExport) ⇒ <code>Promise</code>
<p>Verifies that the Elasticsearch index is exactly in sync with a given CSV file.</p>

**Kind**: instance method of [<code>ESCollection</code>](#ESCollection)  
**Returns**: <code>Promise</code> - <p>Resolves to true if the two documents are in sync and false otherwise</p>  

| Param | Type | Description |
| --- | --- | --- |
| csvExport | <code>string</code> | <p>Name of the CSV export to synchronize with ES</p> |

<a name="ESCollection.ESCollectionException"></a>

### ESCollection.ESCollectionException
**Kind**: static class of [<code>ESCollection</code>](#ESCollection)  
<a name="new_ESCollection.ESCollectionException_new"></a>

#### new ESCollectionException()
<p>Exceptions thrown by the [ESCollection](#ESCollection) class</p>

<a name="ESCollection..ESImportStatus"></a>

### ESCollection~ESImportStatus : <code>object</code>
**Kind**: inner typedef of [<code>ESCollection</code>](#ESCollection)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| hasImportedCSV | <code>boolean</code> | <p>Whether the ES index has imported a CSV</p> |
| lastCSVImportTimestamp | <code>number</code> | <p>UNIX timestamp of the last imported CSV</p> |
| lastImportedCSV | <code>string</code> | <p>Name of the last imported CSV file</p> |

<a name="ESPluginAPI"></a>

## ESPluginAPI
<p>Seneca plugin for coordinating with the Elasticsearch importer</p>

**Kind**: global class  
**See**: [ESCollection](#ESCollection)  

* [ESPluginAPI](#ESPluginAPI)
    * [new ESPluginAPI()](#new_ESPluginAPI_new)
    * [.desc()](#ESPluginAPI+desc) ⇒ <code>Promise</code>
    * [.sync(csv)](#ESPluginAPI+sync) ⇒ <code>Promise</code>
    * [.search(query)](#ESPluginAPI+search) ⇒ <code>Promise</code>
    * [.validate(csv)](#ESPluginAPI+validate) ⇒ <code>Promise</code>
    * [.validateAndResync(csv)](#ESPluginAPI+validateAndResync) ⇒ <code>Promise</code>

<a name="new_ESPluginAPI_new"></a>

### new ESPluginAPI()

| Param | Type | Description |
| --- | --- | --- |
| options.host | <code>string</code> | <p>Hostname for the Elasticsearch server</p> |
| options.csvDir | <code>string</code> | <p>Path to the root CSV export directory</p> |

<a name="ESPluginAPI+desc"></a>

### esPluginAPI.desc() ⇒ <code>Promise</code>
<p>Returns a description of the Elasticsearch collection index</p>

**Kind**: instance method of [<code>ESPluginAPI</code>](#ESPluginAPI)  
**Returns**: <code>Promise</code> - <p>Resolves to a description of the Elasticsearch collection index</p>  
**See**: [description](#ESCollection+description)  
<a name="ESPluginAPI+sync"></a>

### esPluginAPI.sync(csv) ⇒ <code>Promise</code>
<p>Synchronizes the Elasticsearch collection index with a given CSV file</p>

**Kind**: instance method of [<code>ESPluginAPI</code>](#ESPluginAPI)  
**Returns**: <code>Promise</code> - <p>Resolves to a description of the Elasticsearch collection index after sync</p>  
**See**: [syncESToCSV](#ESCollection+syncESToCSV)  

| Param | Type | Description |
| --- | --- | --- |
| csv | <code>string</code> | <p>Name of the CSV export with which to sync</p> |

<a name="ESPluginAPI+search"></a>

### esPluginAPI.search(query) ⇒ <code>Promise</code>
<p>Performs an elasticsearch query and returns the results as JSON</p>

**Kind**: instance method of [<code>ESPluginAPI</code>](#ESPluginAPI)  
**Returns**: <code>Promise</code> - <p>Resolves to the JSON returned from ES</p>  
**See**: [search](#ESCollection+search)  

| Param | Type | Description |
| --- | --- | --- |
| query | <code>string</code> | <p>Query to pass to Elasticsearch simple search</p> |

<a name="ESPluginAPI+validate"></a>

### esPluginAPI.validate(csv) ⇒ <code>Promise</code>
<p>Checks whether or not the elasticsearch index is in sync with a given CSV</p>

**Kind**: instance method of [<code>ESPluginAPI</code>](#ESPluginAPI)  
**Returns**: <code>Promise</code> - <p>Resolves to a description of the Elasticsearch collection index after sync</p>  
**See**: [validateForCSV](#ESCollection+validateForCSV)  

| Param | Type | Description |
| --- | --- | --- |
| csv | <code>string</code> | <p>Name of the CSV export with which to sync</p> |

<a name="ESPluginAPI+validateAndResync"></a>

### esPluginAPI.validateAndResync(csv) ⇒ <code>Promise</code>
<p>Checks whether or not the elasticsearch index is in sync with a given CSV. If the CSV is not valid,
attempt another sync</p>

**Kind**: instance method of [<code>ESPluginAPI</code>](#ESPluginAPI)  
**Returns**: <code>Promise</code> - <p>Resolves to a description of the Elasticsearch collection index after sync</p>  
**See**: [validateForCSV](#ESCollection+validateForCSV)  

| Param | Type | Description |
| --- | --- | --- |
| csv | <code>string</code> | <p>Name of the CSV export with which to sync</p> |

<a name="CSVPluginAPI"></a>

## CSVPluginAPI
<p>Seneca plugin for listing the exported CSV files</p>

**Kind**: global class  

* [CSVPluginAPI](#CSVPluginAPI)
    * _instance_
        * [.list()](#CSVPluginAPI+list) ⇒ [<code>Array.&lt;CSVExportDescription&gt;</code>](#CSVPluginAPI..CSVExportDescription)
    * _inner_
        * [~CSVExportDescription](#CSVPluginAPI..CSVExportDescription)

<a name="CSVPluginAPI+list"></a>

### csvPluginAPI.list() ⇒ [<code>Array.&lt;CSVExportDescription&gt;</code>](#CSVPluginAPI..CSVExportDescription)
<p>List the CSV files that have been exported from TMS</p>

**Kind**: instance method of [<code>CSVPluginAPI</code>](#CSVPluginAPI)  
<a name="CSVPluginAPI..CSVExportDescription"></a>

### CSVPluginAPI~CSVExportDescription
<p>Status of a pass of the TMS to CSV export script</p>

**Kind**: inner property of [<code>CSVPluginAPI</code>](#CSVPluginAPI)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| file | <code>string</code> | <p>The CSV filename</p> |
| status | <code>string</code> | <p>Export status (INCOMPLETE, COMPLETED, ERROR)</p> |
| createdAt | <code>string</code> | <p>When the export started</p> |
| processedObjects | <code>number</code> | <p>Number of objects that have been exported</p> |
| totalObjects | <code>number</code> | <p>Total number of objects to export</p> |

<a name="ImageUploader"></a>

## ImageUploader
<p>Uploads images (jpgs) to Amazon s3 from TMS</p>

**Kind**: global class  

* [ImageUploader](#ImageUploader)
    * [new ImageUploader(csvDir)](#new_ImageUploader_new)
    * _instance_
        * [.status](#ImageUploader+status) : [<code>ImageUploaderStatus</code>](#ImageUploader..ImageUploaderStatus)
        * [.init()](#ImageUploader+init)
        * [.process()](#ImageUploader+process)
    * _inner_
        * [~ImageUploaderStatus](#ImageUploader..ImageUploaderStatus) : <code>Object</code>

<a name="new_ImageUploader_new"></a>

### new ImageUploader(csvDir)

| Param | Type | Description |
| --- | --- | --- |
| csvDir | <code>string</code> | <p>Path to the directory containing csv_* directories exported from TMS  The script will tile and upload images using the most recent complete export in the directory</p> |

<a name="ImageUploader+status"></a>

### imageUploader.status : [<code>ImageUploaderStatus</code>](#ImageUploader..ImageUploaderStatus)
**Kind**: instance property of [<code>ImageUploader</code>](#ImageUploader)  
<a name="ImageUploader+init"></a>

### imageUploader.init()
<p>Initializes the Image Uploader by fetching all images available on TMS and all images already
uploaded to Amazon S3.</p>

**Kind**: instance method of [<code>ImageUploader</code>](#ImageUploader)  
<a name="ImageUploader+process"></a>

### imageUploader.process()
<p>Begin the process of uploading images to S3</p>

**Kind**: instance method of [<code>ImageUploader</code>](#ImageUploader)  
<a name="ImageUploader..ImageUploaderStatus"></a>

### ImageUploader~ImageUploaderStatus : <code>Object</code>
<p>Current status of the Image Uploader script</p>

**Kind**: inner typedef of [<code>ImageUploader</code>](#ImageUploader)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| type | <code>string</code> | <p>Always 'imageUploader'</p> |
| isRunning | <code>boolean</code> | <p>Whether or not the script is running</p> |
| currentStep | <code>string</code> | <p>Current step in the upload process</p> |
| numImagesUploaded | <code>number</code> | <p>Total number of images uploaded</p> |
| totalImagesToUpload | <code>number</code> | <p>Number of images to upload</p> |
| uploadIndex | <code>number</code> | <p>Number of images uploaded by the current task</p> |

<a name="RawUploader"></a>

## RawUploader
<p>Uploads raw images (tifs) to Amazon s3 from TMS</p>

**Kind**: global class  

* [RawUploader](#RawUploader)
    * [new RawUploader(pathToAvailableImages, csvDir)](#new_RawUploader_new)
    * _instance_
        * [.process()](#RawUploader+process)
    * _inner_
        * [~RawUploaderStatus](#RawUploader..RawUploaderStatus) : <code>Object</code>

<a name="new_RawUploader_new"></a>

### new RawUploader(pathToAvailableImages, csvDir)

| Param | Type | Description |
| --- | --- | --- |
| pathToAvailableImages | <code>string</code> | <p>Path to the JSON file containing all available images on TMS</p> |
| csvDir | <code>string</code> | <p>Path to the directory containing csv_* directories exported from TMS  The script will tile and upload images using the most recent complete export in the directory</p> |

<a name="RawUploader+process"></a>

### rawUploader.process()
<p>Begin the process of uploading raw images to S3</p>

**Kind**: instance method of [<code>RawUploader</code>](#RawUploader)  
<a name="RawUploader..RawUploaderStatus"></a>

### RawUploader~RawUploaderStatus : <code>Object</code>
<p>Current status of the Raw Uploader script</p>

**Kind**: inner typedef of [<code>RawUploader</code>](#RawUploader)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| type | <code>string</code> | <p>Always 'rawUploader'</p> |
| isRunning | <code>boolean</code> | <p>Whether or not the script is running</p> |
| currentStep | <code>string</code> | <p>Current step in the tiling process</p> |
| numImagesUploaded | <code>number</code> | <p>Number of images tiled and uploaded</p> |
| totalImagesToUpload | <code>number</code> | <p>Number of images to tile and upload</p> |

<a name="TileUploader"></a>

## TileUploader
<p>Uploads tiled images, by IIIF spec to Amazon s3 from TMS</p>

**Kind**: global class  

* [TileUploader](#TileUploader)
    * [new TileUploader(pathToAvailableImages, csvDir)](#new_TileUploader_new)
    * _instance_
        * [.status](#TileUploader+status) : [<code>TileUploaderStatus</code>](#TileUploader..TileUploaderStatus)
        * [.init()](#TileUploader+init)
        * [.process()](#TileUploader+process)
    * _static_
        * [.RawUploader#status](#TileUploader.RawUploader+status) : [<code>TileUploaderStatus</code>](#TileUploader..TileUploaderStatus)
    * _inner_
        * [~TileUploaderStatus](#TileUploader..TileUploaderStatus) : <code>Object</code>

<a name="new_TileUploader_new"></a>

### new TileUploader(pathToAvailableImages, csvDir)

| Param | Type | Description |
| --- | --- | --- |
| pathToAvailableImages | <code>string</code> | <p>Path to the JSON file containing all available images on TMS</p> |
| csvDir | <code>string</code> | <p>Path to the directory containing csv_* directories exported from TMS  The script will tile and upload images using the most recent complete export in the directory</p> |

<a name="TileUploader+status"></a>

### tileUploader.status : [<code>TileUploaderStatus</code>](#TileUploader..TileUploaderStatus)
**Kind**: instance property of [<code>TileUploader</code>](#TileUploader)  
<a name="TileUploader+init"></a>

### tileUploader.init()
<p>Initializes the Tile Uploader by fetching all images available on TMS and all images already
uploaded to Amazon S3.</p>

**Kind**: instance method of [<code>TileUploader</code>](#TileUploader)  
<a name="TileUploader+process"></a>

### tileUploader.process()
<p>Begin the process of tiling and uploading images to S3</p>

**Kind**: instance method of [<code>TileUploader</code>](#TileUploader)  
<a name="TileUploader.RawUploader+status"></a>

### TileUploader.RawUploader#status : [<code>TileUploaderStatus</code>](#TileUploader..TileUploaderStatus)
**Kind**: static property of [<code>TileUploader</code>](#TileUploader)  
<a name="TileUploader..TileUploaderStatus"></a>

### TileUploader~TileUploaderStatus : <code>Object</code>
<p>Current status of the Tile Uploader script</p>

**Kind**: inner typedef of [<code>TileUploader</code>](#TileUploader)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| type | <code>string</code> | <p>Always 'tileUploader'</p> |
| isRunning | <code>boolean</code> | <p>Whether or not the script is running</p> |
| currentStep | <code>string</code> | <p>Current step in the tiling process</p> |
| numImagesUploaded | <code>number</code> | <p>Number of images tiled and uploaded</p> |
| totalImagesToUpload | <code>number</code> | <p>Number of images to tile and upload</p> |
| uploadIndex | <code>number</code> | <p>Number of images uploaded by the current task</p> |

<a name="ImagesPluginAPI"></a>

## ImagesPluginAPI
<p>Seneca plugin for coordinating with the image tiling and upload scripts</p>

**Kind**: global class  
**See**: [ImageUploader](#ImageUploader)  
<a name="ImagesPluginAPI+tile"></a>

### imagesPluginAPI.tile() ⇒ <code>Object</code>
<p>Begin tiling and uploading images from TMS</p>

**Kind**: instance method of [<code>ImagesPluginAPI</code>](#ImagesPluginAPI)  
**Returns**: <code>Object</code> - <p>{success: true} if the call to start processing was successful, {success:false} otherwise</p>  
**See**: [process](#ImageUploader+process)  
<a name="ArtObject"></a>

## ArtObject
<p>Thin wrapper around the JSON description of a collection object in TMS</p>

**Kind**: global class  

* [ArtObject](#ArtObject)
    * [new ArtObject(jsonDescription, searchConfig)](#new_ArtObject_new)
    * [.transformedDescription](#ArtObject+transformedDescription)
    * [.descriptionWithFields(fields)](#ArtObject+descriptionWithFields) ⇒ <code>object</code>

<a name="new_ArtObject_new"></a>

### new ArtObject(jsonDescription, searchConfig)

| Param | Type | Description |
| --- | --- | --- |
| jsonDescription | <code>object</code> | <p>JSON description as returned by the TMS API</p> |
| searchConfig | [<code>ExportConfig</code>](#ExportConfig) | <p>Export configuration</p> |

<a name="ArtObject+transformedDescription"></a>

### artObject.transformedDescription
**Kind**: instance property of [<code>ArtObject</code>](#ArtObject)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| transformedDescription | <code>object</code> | <p>JSON description with TMS field metadata stripped</p> |

<a name="ArtObject+descriptionWithFields"></a>

### artObject.descriptionWithFields(fields) ⇒ <code>object</code>
<p>Returns a description of the collection object, stripped of TMS metadata, and limited to
the specified fields.</p>

**Kind**: instance method of [<code>ArtObject</code>](#ArtObject)  
**Returns**: <code>object</code> - <p>Selected JSON description</p>  

| Param | Type | Description |
| --- | --- | --- |
| fields | <code>Array.&lt;string&gt;</code> | <p>Fields to retrieve from the object description</p> |

<a name="ExportConfig"></a>

## ExportConfig
<p>Wrapper and validator for a JSON object implementing [TMSExportConfiguration](#TMSExporter..TMSExportConfiguration)</p>

**Kind**: global class  

* [ExportConfig](#ExportConfig)
    * [new ExportConfig(config)](#new_ExportConfig_new)
    * [.fieldHasAlias(field)](#ExportConfig+fieldHasAlias)
    * [.fieldIsEnumerated(field)](#ExportConfig+fieldIsEnumerated)
    * [.fieldIsMask(field)](#ExportConfig+fieldIsMask)
    * [.fieldIsRequired(field)](#ExportConfig+fieldIsRequired)
    * [.fieldMaskSelector(field)](#ExportConfig+fieldMaskSelector)

<a name="new_ExportConfig_new"></a>

### new ExportConfig(config)
**Throws**:

- <p>Error if the TMS export configuration is impropertly constructed</p>


| Param | Type | Description |
| --- | --- | --- |
| config | [<code>TMSExportConfiguration</code>](#TMSExporter..TMSExportConfiguration) | <p>TMS export configuration</p> |

<a name="ExportConfig+fieldHasAlias"></a>

### exportConfig.fieldHasAlias(field)
<p>Whether or not the field with the given name will have an aliased name in the export</p>

**Kind**: instance method of [<code>ExportConfig</code>](#ExportConfig)  

| Param | Type | Description |
| --- | --- | --- |
| field | <code>string</code> | <p>the name of the field</p> |

<a name="ExportConfig+fieldIsEnumerated"></a>

### exportConfig.fieldIsEnumerated(field)
<p>Whether or not the field with a given name represents an enumerated value</p>

**Kind**: instance method of [<code>ExportConfig</code>](#ExportConfig)  

| Param | Type | Description |
| --- | --- | --- |
| field | <code>string</code> | <p>the name of the field</p> |

<a name="ExportConfig+fieldIsMask"></a>

### exportConfig.fieldIsMask(field)
<p>Whether or not the field with a given name represents a mask value</p>

**Kind**: instance method of [<code>ExportConfig</code>](#ExportConfig)  

| Param | Type | Description |
| --- | --- | --- |
| field | <code>string</code> | <p>the name of the field</p> |

<a name="ExportConfig+fieldIsRequired"></a>

### exportConfig.fieldIsRequired(field)
<p>Whether or not the field with a given name must be included</p>

**Kind**: instance method of [<code>ExportConfig</code>](#ExportConfig)  

| Param | Type | Description |
| --- | --- | --- |
| field | <code>string</code> | <p>the name of the field</p> |

<a name="ExportConfig+fieldMaskSelector"></a>

### exportConfig.fieldMaskSelector(field)
<p>Returns the mask string to select given a field name</p>

**Kind**: instance method of [<code>ExportConfig</code>](#ExportConfig)  

| Param | Type | Description |
| --- | --- | --- |
| field | <code>string</code> | <p>the name of the field</p> |

<a name="ExportMetadata"></a>

## ExportMetadata
<p>Synchronizes the state of a TMS export process with a <code>meta.json</code> file.</p>

**Kind**: global class  

* [ExportMetadata](#ExportMetadata)
    * [new ExportMetadata(jsonExportPath)](#new_ExportMetadata_new)
    * _instance_
        * [.status](#ExportMetadata+status)
        * [.createdAt](#ExportMetadata+createdAt)
        * [.processedObjects](#ExportMetadata+processedObjects)
        * [.totalObjects](#ExportMetadata+totalObjects)
        * [.description()](#ExportMetadata+description) ⇒ <code>object</code>
    * _inner_
        * [~ExportStatus](#ExportMetadata..ExportStatus) : <code>enum</code>

<a name="new_ExportMetadata_new"></a>

### new ExportMetadata(jsonExportPath)
**Throws**:

- <p>Error if the file cannot be created for some reason</p>


| Param | Type | Description |
| --- | --- | --- |
| jsonExportPath | <code>string</code> | <p>Path where the <code>meta.json</code> file will be created</p> |

<a name="ExportMetadata+status"></a>

### exportMetadata.status
**Kind**: instance property of [<code>ExportMetadata</code>](#ExportMetadata)  
**Properties**

| Name | Type |
| --- | --- |
| status | [<code>ExportStatus</code>](#ExportMetadata..ExportStatus) | 

<a name="ExportMetadata+createdAt"></a>

### exportMetadata.createdAt
**Kind**: instance property of [<code>ExportMetadata</code>](#ExportMetadata)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| createdAt- | <code>number</code> | <p>UNIX timestamp for the start of the TMS export process</p> |

<a name="ExportMetadata+processedObjects"></a>

### exportMetadata.processedObjects
**Kind**: instance property of [<code>ExportMetadata</code>](#ExportMetadata)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| processedObjects | <code>number</code> | <p>Number of objects that have been exported</p> |

<a name="ExportMetadata+totalObjects"></a>

### exportMetadata.totalObjects
**Kind**: instance property of [<code>ExportMetadata</code>](#ExportMetadata)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| totalObjects | <code>number</code> | <p>Number of objects that will be exported</p> |

<a name="ExportMetadata+description"></a>

### exportMetadata.description() ⇒ <code>object</code>
<p>Structured description of the current status of the TMS export</p>

**Kind**: instance method of [<code>ExportMetadata</code>](#ExportMetadata)  
**Returns**: <code>object</code> - <p>Structured status</p>  
<a name="ExportMetadata..ExportStatus"></a>

### ExportMetadata~ExportStatus : <code>enum</code>
**Kind**: inner enum of [<code>ExportMetadata</code>](#ExportMetadata)  
<a name="TMSExporter"></a>

## TMSExporter
<p>Manages the export from TMS to a CSV file.</p>

**Kind**: global class  
**Implements**: <code>{@link UpdateEmitter}</code>  

* [TMSExporter](#TMSExporter)
    * [new TMSExporter(credentials)](#new_TMSExporter_new)
    * _instance_
        * [.active](#TMSExporter+active)
        * [.csvFilePath](#TMSExporter+csvFilePath)
        * [.status](#TMSExporter+status)
        * [.cancelExport()](#TMSExporter+cancelExport)
        * [.exportCSV(configJSON)](#TMSExporter+exportCSV) ⇒ <code>Promise</code>
    * _inner_
        * [~TMSCredentials](#TMSExporter..TMSCredentials) : <code>object</code>
        * [~TMSExportStatus](#TMSExporter..TMSExportStatus) : <code>object</code>
        * [~TMSExportConfiguration](#TMSExporter..TMSExportConfiguration) : <code>object</code>
        * [~TMSFieldExportConfiguration](#TMSExporter..TMSFieldExportConfiguration) : <code>object</code>

<a name="new_TMSExporter_new"></a>

### new TMSExporter(credentials)

| Param | Type | Description |
| --- | --- | --- |
| credentials | <code>TMSCredentials</code> | <p>Credentials for connecting to the TMS API. These are typically  loaded from <code>config/credentials.json</code>, which is encrypted by default</p> |

<a name="TMSExporter+active"></a>

### tmsExporter.active
**Kind**: instance property of [<code>TMSExporter</code>](#TMSExporter)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| active | <code>boolean</code> | <p>Whether or not the TMS export script is currently running</p> |

<a name="TMSExporter+csvFilePath"></a>

### tmsExporter.csvFilePath
**Kind**: instance property of [<code>TMSExporter</code>](#TMSExporter)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| csvFilePath | <code>string</code> | <p>Path to the objects.csv file containing the exported collection objects</p> |

<a name="TMSExporter+status"></a>

### tmsExporter.status
**Kind**: instance property of [<code>TMSExporter</code>](#TMSExporter)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| status | [<code>TMSExportStatus</code>](#TMSExporter..TMSExportStatus) | <p>Status of the currently running TMSExport status</p> |

<a name="TMSExporter+cancelExport"></a>

### tmsExporter.cancelExport()
<p>Stop the running TMS export</p>

**Kind**: instance method of [<code>TMSExporter</code>](#TMSExporter)  
<a name="TMSExporter+exportCSV"></a>

### tmsExporter.exportCSV(configJSON) ⇒ <code>Promise</code>
<p>Begin the TMS export process</p>

**Kind**: instance method of [<code>TMSExporter</code>](#TMSExporter)  
**Returns**: <code>Promise</code> - <ul>
<li>Resolves when completed</li>
</ul>  
**Emits**: [<code>started</code>](#UpdateEmitter+event_started), [<code>progress</code>](#UpdateEmitter+event_progress), [<code>completed</code>](#UpdateEmitter+event_completed)  

| Param | Type | Description |
| --- | --- | --- |
| configJSON | [<code>TMSExportConfiguration</code>](#TMSExporter..TMSExportConfiguration) | <p>Export configuration</p> |

<a name="TMSExporter..TMSCredentials"></a>

### TMSExporter~TMSCredentials : <code>object</code>
<p>Credentials for connecting to a TMS API</p>

**Kind**: inner typedef of [<code>TMSExporter</code>](#TMSExporter)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| key | <code>string</code> | <p>TMS key</p> |
| username | <code>string</code> | <p>TMS username</p> |
| password | <code>string</code> | <p>TMS password</p> |

<a name="TMSExporter..TMSExportStatus"></a>

### TMSExporter~TMSExportStatus : <code>object</code>
<p>Status of a running TMS export</p>

**Kind**: inner typedef of [<code>TMSExporter</code>](#TMSExporter)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| active | <code>boolean</code> | <p>Whether or not the TMS export script is currently running</p> |
| csv | <code>string</code> | <p>Path to the objects.csv file containing the exported collection objects</p> |
| processed | <code>number</code> | <p>Number of collection objects that have been processed</p> |
| total | <code>number</code> | <p>Totl number of collection objects that will be exported</p> |
| status | [<code>ExportStatus</code>](#ExportMetadata..ExportStatus) | <p>Status of the TMS export</p> |

<a name="TMSExporter..TMSExportConfiguration"></a>

### TMSExporter~TMSExportConfiguration : <code>object</code>
<p>Configures the TMS export process. Specifies the root TMS API URL, the output directory,
 debug configuration, which fields to export, and which warnings to generate</p>

**Kind**: inner typedef of [<code>TMSExporter</code>](#TMSExporter)  
**Default**: <code>false</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| apiURL | <code>string</code> | <p>The root TMS API URL</p> |
| outputDirectory | <code>string</code> | <p>The directory into which the exported CSV file will be placed</p> |
| debug | <code>object</code> | <p>Debug values (optional)</p> |
| debug.limit | <code>number</code> | <p>Exit after exporting this many collection objects (optional)</p> |
| fields | [<code>Array.&lt;TMSFieldExportConfiguration&gt;</code>](#TMSExporter..TMSFieldExportConfiguration) | <p>Export configuration for each field that is to be exported</p> |
| warnings | <code>object</code> | <p>Warning flags. Warnings are written to <code>warnings.csv</code></p> |
| warnings.singletonFields | <code>boolean</code> | <p>Emit a warning for fields that only appear a very small number of times</p> |
| warnings.missingFields | <code>boolean</code> | <p>Emit a warning for objects that do not expose a required field</p> |
| warnings.unusedFields | <code>boolean</code> | <p>Emit a warning for fields that are not exported</p> |

<a name="TMSExporter..TMSFieldExportConfiguration"></a>

### TMSExporter~TMSFieldExportConfiguration : <code>object</code>
<p>Export configuration for a particular TMS field</p>

**Kind**: inner typedef of [<code>TMSExporter</code>](#TMSExporter)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | <p>The name of the field to be exported</p> |
| primaryKey | <code>boolean</code> | <p>Whether this field should be used as a unique identifier for the object (one required)</p> |
| required | <code>boolean</code> | <p>Whether the field must be present (when absent a warning will be generated)</p> |
| enumerated | <code>boolean</code> | <p>Whether the field is expected to have one of a small number of values</p> |

<a name="TMSFileReader"></a>

## TMSFileReader
<p>Reads a directory of JSON files, each one representing a TMS collection object,
 as if it were a TMS API. Used mostly for testing</p>

**Kind**: global class  
**Implements**: [<code>TMSReader</code>](#TMSReader)  

* [TMSFileReader](#TMSFileReader)
    * *[.hasNext()](#TMSFileReader+hasNext) ⇒ <code>bool</code>*
    * [.next()](#TMSFileReader+next) ⇒

<a name="TMSFileReader+hasNext"></a>

### *tmsFileReader.hasNext() ⇒ <code>bool</code>*
<p>Whether or not there are more TMS objects in the collection</p>

**Kind**: instance abstract method of [<code>TMSFileReader</code>](#TMSFileReader)  
**Implements**: [<code>hasNext</code>](#TMSReader+hasNext)  
<a name="TMSFileReader+next"></a>

### tmsFileReader.next() ⇒
**Kind**: instance method of [<code>TMSFileReader</code>](#TMSFileReader)  
**Implements**: [<code>next</code>](#TMSReader+next)  
**Returns**: <p>JSON description of a TMS collection object, in whatever format TMS provides</p>  
<a name="TMSURLReader"></a>

## TMSURLReader
**Kind**: global class  
**Implements**: [<code>TMSReader</code>](#TMSReader)  

* [TMSURLReader](#TMSURLReader)
    * [.getObjectCount()](#TMSURLReader+getObjectCount) ⇒ <code>Promise</code>
    * *[.hasNext()](#TMSURLReader+hasNext) ⇒ <code>bool</code>*
    * [.next()](#TMSURLReader+next) ⇒

<a name="TMSURLReader+getObjectCount"></a>

### tmsurlReader.getObjectCount() ⇒ <code>Promise</code>
<p>Return the number of objects in the collection. This function must actually retrieve
each page of objects in the collection, and so can be very slow. Even for the Barnes collection
(about 4000 objects) this function can take up to a minute</p>

**Kind**: instance method of [<code>TMSURLReader</code>](#TMSURLReader)  
**Returns**: <code>Promise</code> - <p>resolves to the number of objects in the collection</p>  
<a name="TMSURLReader+hasNext"></a>

### *tmsurlReader.hasNext() ⇒ <code>bool</code>*
<p>Whether or not there are more TMS objects in the collection</p>

**Kind**: instance abstract method of [<code>TMSURLReader</code>](#TMSURLReader)  
**Implements**: [<code>hasNext</code>](#TMSReader+hasNext)  
<a name="TMSURLReader+next"></a>

### tmsurlReader.next() ⇒
**Kind**: instance method of [<code>TMSURLReader</code>](#TMSURLReader)  
**Implements**: [<code>next</code>](#TMSReader+next)  
**Returns**: <p>JSON description of a TMS collection object, in whatever format TMS provides</p>  
<a name="WarningReporter"></a>

## WarningReporter
<p>Writes warnings to a CSV file as they are emitted by the TMS export script. Warning file will
be called <code>warnings.csv</code></p>

**Kind**: global class  

* [WarningReporter](#WarningReporter)
    * [new WarningReporter(outputDirectory, searchConfig)](#new_WarningReporter_new)
    * [.appendFieldsForObject(objectId, artObject, description)](#WarningReporter+appendFieldsForObject)
    * [.end()](#WarningReporter+end)

<a name="new_WarningReporter_new"></a>

### new WarningReporter(outputDirectory, searchConfig)
**Throws**:

- <p>Error if the output file cannot be opened for some reason</p>


| Param | Type | Description |
| --- | --- | --- |
| outputDirectory | <code>string</code> | <p>Directory contaning the <code>meta.json</code> and <code>objects.csv</code> files exported by the TMS script</p> |
| searchConfig | [<code>ExportConfig</code>](#ExportConfig) | <p>Export configuration</p> |

<a name="WarningReporter+appendFieldsForObject"></a>

### warningReporter.appendFieldsForObject(objectId, artObject, description)
<p>Call this function to process the object with the given identifier</p>

**Kind**: instance method of [<code>WarningReporter</code>](#WarningReporter)  
**Throws**:

- <p>Error if writing to the CSV file fails for some reason</p>


| Param | Type | Description |
| --- | --- | --- |
| objectId | <code>number</code> \| <code>string</code> | <p>Unique identifier for collection objects</p> |
| artObject | [<code>ArtObject</code>](#ArtObject) | <p>the object itself</p> |
| description | <code>object</code> | <p>The fields that should be exported</p> |

<a name="WarningReporter+end"></a>

### warningReporter.end()
<p>Close the <code>warnings.csv</code> output file</p>

**Kind**: instance method of [<code>WarningReporter</code>](#WarningReporter)  
**Throws**:

- <p>Error if closing the file fails for some reason</p>

<a name="CSVWriter"></a>

## CSVWriter
<p>Manages writing to a CSV file</p>

**Kind**: global class  

* [CSVWriter](#CSVWriter)
    * [new CSVWriter(path)](#new_CSVWriter_new)
    * [.write(rowDict)](#CSVWriter+write)
    * [.end()](#CSVWriter+end)

<a name="new_CSVWriter_new"></a>

### new CSVWriter(path)
**Throws**:

- <p>Error if the file cannot be created or opened for some reason</p>


| Param | Type | Description |
| --- | --- | --- |
| path | <code>string</code> | <p>Path to the <code>objects.csv</code> file that will contain the export</p> |

<a name="CSVWriter+write"></a>

### csvWriter.write(rowDict)
<p>Write a flat JSON object (string and number fields only) to a row of the CSV</p>

**Kind**: instance method of [<code>CSVWriter</code>](#CSVWriter)  
**Throws**:

- <p>Error if the write stream fails for some reason</p>


| Param | Type | Description |
| --- | --- | --- |
| rowDict | <code>object</code> | <p>JSON descripton of a collection object, probably returned  from [descriptionWithFields](#ArtObject+descriptionWithFields)</p> |

<a name="CSVWriter+end"></a>

### csvWriter.end()
<p>Close the CSV file and finish writing</p>

**Kind**: instance method of [<code>CSVWriter</code>](#CSVWriter)  
**Throws**:

- <p>Error if closing the file fails for some reason</p>

<a name="WebsocketUpdater"></a>

## WebsocketUpdater
<p>Forwards updates from a subclass of [UpdateEmitter](#UpdateEmitter) to a websocket</p>

**Kind**: global class  

* [WebsocketUpdater](#WebsocketUpdater)
    * [new WebsocketUpdater(name, port, updateEmitter)](#new_WebsocketUpdater_new)
    * ["status" (name, status, state)](#WebsocketUpdater+event_status)

<a name="new_WebsocketUpdater_new"></a>

### new WebsocketUpdater(name, port, updateEmitter)

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | <p>Name string to be send with each [status](#UpdateEmitter+status) event</p> |
| port | <code>number</code> | <p>Websocket port to which to connect and forward events</p> |
| updateEmitter | [<code>UpdateEmitter</code>](#UpdateEmitter) | <p>Concrete subclass of [UpdateEmitter](#UpdateEmitter)</p> |

<a name="WebsocketUpdater+event_status"></a>

### "status" (name, status, state)
<p>Forwarded event from an [UpdateEmitter](#UpdateEmitter) subclass</p>

**Kind**: event emitted by [<code>WebsocketUpdater</code>](#WebsocketUpdater)  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | <p>Name of the event</p> |
| status | <code>string</code> | <p>Will be <code>started</code>, <code>progress</code> or <code>completed</code></p> |
| state | <code>object</code> | <p>Params depend on subclass implementation</p> |

