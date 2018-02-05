# Barnes TMS extract

Scripts to import the barnes eMuseum api into elasticsearch to be used by [barnes-collection-www][].

For more context into what all the code is doing, see the [architecture doc](./ARCHITECTURE.md).

Most of the scripts are in `src/scripts`, `src/scripts/updates`, and can be run with node.

- `collectHighlights.js` - Creates a directory in the root of this repository called `highlights` with all images that are tagged as highlights
- `nightlyColorProcess.js` - Run to perform Cooper-Hewitt color processing on all TMS images. Intended to be run as part of a nightly cron
- `pythonenv.sh` - Bash script to set up the python environment
- `updateMappings.js` - Updates Elasticsearch mappings if they change, from file `config/mapping.json`

## Setup

Usernames and passwords are encrypted and stored in [**config/**](./config). They can be decrypted and viewed using [git-crypt](https://github.com/agwa/git-crypt) via `git-crypt unlock /path/to/key`, and include:

- **config/credentials.json** -- Access keys for s2, AWS, Kibana and TMS
- **config/esapi.htpasswd** -- Username and password for accessing the elasticsearch API wrapper
- **config/users.htpasswd** -- Username and password for viewing the admin dashboard

Scripts in this repository are written in node.js, python and go. We use [miniconda](https://conda.io/miniconda.html) to manage python and [nvm](https://github.com/creationix/nvm) to manage node. To install nvm, node stable, and miniconda:

```bash
# install nvm and switch to node stable
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.8/install.sh | bash
nvm install stable
nvm alias default stable
nvm use stable

# install miniconda
curl -o- https://repo.continuum.io/miniconda/Miniconda3-latest-Linux-x86_64.sh | bash
```

Once you have miniconda and nodejs stable working, install python requirements, node.js packages, and go-ifff

```bash
# install the node.js dependencies for most scripts
npm install

# install python dependencies for the csv diffing and palette extraction scripts
[[ -e `which conda` ]] && bash src/scripts/pythonenv.sh || {
[[ -e `which pip` ]] && pip install -r src/python_scripts/requirements.txt }

# install go-iiif for the tile creation scripts
git submodule update --remote --recursive
cd src/image-processing/go-iiif && make bin
```

# Running

To update the collection index, every night the following scripts from [`scripts/update`](./scripts/update):

**00_prepareESIndex.js** creates the timestamped index

This builds a new index with the given name in Elasticsearch, adds our mapping, and adds some metadata. When this step is complete, you should see that new index in Kibana, with 1 hit for the meta object.

**01_exportTMSToCSV.js** extracts object csv files from tms emuseum api

This will take a while. When it's done, you can check to see that there's a new set of CSVs in `dashboard/src/public/output`.

**02_importTMSDataToES.js** parses object csvs and adds them to elasticsearch

You may see errors while running, but thats okay, as long as there are around 2200 hits in the index

**03_processAndUploadImagesToS3.js**

- upload original images to s3 bucket (src/image-processing/src/script/imageUploader.js)
- create tiles from images in bucket
- upload tiles to s3 bucket (src/image-processing/src/script/tileUploader.js)
- NOTE: do we need to esCollection._updateESWithColorData ? whats the difference between `writeDataToES` and the csvs we create?

**04_addImageSecretsToES.js** add image secrets from s3 images bucket

About 1873 objects should have `imageSecret` and `imageOriginalSecret`, grabbed from s3

**04_addColorDataToES.js** grab color data

When this is done, objects should have blobbed `color` data attached

// _NOTE_: does this currently grab from csv or not?

**05_importDataCSVsToES.js** add a variety of image descriptors to all the objects

// _NOTE_: does this currently grab from csv or not?

**06_addTagsToES.js** add tags to some of the objects

// _NOTE_: does this currently grab from csv or not?

These scripts rely on the existence of a series of CSV files to add image secrets, computer vision data, etc. Those files must be stored in the directory referenced in [`config/base.json`](./config/base.json) in `CSV.dataPath`. If these files are missing, the update scripts will not finish running, and the collection index will be considered incomplete and ignored by the front-end.


## Deployment

Contact Micah Walter for access to our [elasticsearch][] and [kibana][] 5.4 machines running on aws.

### Live crontab

```cron
SHELL=/bin/bash
PATH=$PATH:/home/ubuntu/.nvm/versions/node/v9.2.1/bin
00 00 * * * cd /usr/local/barnes/projects/barnes-tms-extract && /bin/bash src/scripts/update_collection_data.sh
```

## Data Model

The file located at [`config/mapping.json`](./config/mapping.json) details the structure of the Elasticsearch index. The index is named `collection` and contains two object types, `meta` and `object`.

#### `meta` is a singleton

- **hasImportedCSV**(Boolean) whether or not the elasticsearch index has ever successfully imported a CSV file
- **lastCSVImportTimestamp**(timestamp) time of TMS export CSV that was last imported

#### `object` describes a piece in the collection

- bibliography
- classification -- eg Painting, Sculpture
- copyright -- Unused, see `objRightsTypeId`
- culture -- The culture that is the creator of the work, used in place of people sometimes
- description -- Unused, but left in temporarily until short and long descriptions are filled in
- dimensions -- Stored as plain text, so it's not possible to search for pieces with a specific width
- exhHistory -- Exhibition history
- highlight -- Whether or not the piece is currently highlighted
- id -- Matches the TMS id, and is also the value of the _id field for this document
- invno -- The inventory number of this collection object
- locations -- Where in the Barnes this piece is stored
- longDescription
- medium
- objRightsTypeId -- Enumerated constant, indicating the object rights bin into which this object falls
- onView -- Whether or not the object is currently on view
- people -- The creators of the work
- period -- Estimated date. Stored as text and not used for sorting
- room
- shortDescription
- provenance
- title
- wall -- north, south, east or west
- visualDescription
- imageSecret -- Uses the [Flickr API](https://www.flickr.com/services/api/misc.urls.html) standard, a key for all smaller than copyright size images
- imageOriginalSecret - Uses the [Flickr API](https://www.flickr.com/services/api/misc.urls.html) standard, a key for the larger image size (4096 px)


## Using elasticserch

The [barnes-collection-www][] application is a good example for reading from the most recent complete Elasticsearch index.
It looks for indices named `collection_*` and selects the index with the *latest* timestamp that also has content in the `tags` field on individual objects.

You can get a sorted list of the collection indices by running in Kibana Dev Tools:

    GET _cat/indices/collection_*?v&s=index

The most recent index will be at the bottom of the list. It should contain around 2265 documents.

## Resources

The [Elasticsearch v5.4 documentation][] is unfortunately, the best resource we have found so far. Be aware that there are completely separate references for each version of Elasticsearch. If you locate solutions to problems through Google or StackOverflow, you will frequently be taken to a reference page for a different version than the one you’re using. Make sure to watch for that, so that you don’t get stuck trying a method that’s been deprecated or hasn’t been introduced in your version.

Clicking “View in Console” on any example queries in the docs will take you to your Kibana Dev Tools console and insert the query. This is very helpful.

[barnes-collection-www]: https://github.com/barnesfoundation/barnes-collection-www
[elasticsearch]: https://a3bf81f3efa82d7e9a6b1c6fcc91e1d3.us-east-1.aws.found.io:9243
[Kibana]: https://b289f66f9c19402e7ce08eb03e56b486.us-east-1.aws.found.io
[scripts/update]: ./scripts/update

[Elasticsearch v5.4 documentation]: https://www.elastic.co/guide/en/elasticsearch/reference/5.4/index.html

