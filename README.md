# barnes TMS extract

Scripts to import the barnes eMuseum api into elasticsearch to be used by [barnes-collection-www][].

We have [elasticsearch][] and [kibana][] v5.4 running on aws. Contact Micah Walter for credentials.

For more context into the early decision making of the system, see the [architecture doc](./ARCHITECTURE.md).
For more information about how the CSV files for image information are created, see the [datascience doc](./DATASCIENCE.md).

## Passwords

Usernames and passwords are stored, encrypted, in this repository. They can be decrypted and viewed using [git-crypt](https://github.com/agwa/git-crypt), which can be installed via homebrew, apt, or manually. After decrypting with `git-crypt unlock /path/to/key`, they can be found in the `config` directory.

- config/credentials.json -- Access keys for s2, AWS, Kibana and TMS
- config/esapi.htpasswd -- Username and password for accessing the elasticsearch API wrapper
- config/users.htpasswd -- Username and password for viewing the admin dashboard

## Setup

There are a number of scripts in this repository, written in javascript, python, and go.

    # install nvm and conda
    curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.8/install.sh | bash
    curl -o- https://repo.continuum.io/miniconda/Miniconda3-latest-Linux-x86_64.sh | bash

    # install node stable, python requirements, and go image tiling dependencies
    nvm install stable
    nvm alias default stable
    nvm use default
    git submodule update --remote --recursive
    [[ -e `which conda` ]] && bash src/scripts/pythonenv.sh || pip install -r src/python_scripts/requirements.txt
    cd src/image-processing/go-iiif && make bin

The csv diff and palette extraction scripts are built on python 2, and have dependencies that can be installed via `pip install -r src/python_scripts/requirements.txt`. We recommend using `miniconda` to make sure your python environment is up to date - `src/scripts/pythonenv.sh` will create an miniconda environment, activate it, and install the requirements there.

The image tile creation scripts depend on [go-iiif](https://github.com/thisisaaronland/go-iiif) which has [its own wonky setup](https://github.com/aaronland/go-iiif#setup). We have included it as a submodule.

All the rest of the scripts are written and tested on node.js stable. We recommend using [nvm](https://github.com/creationix/nvm) which can be installed with `curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.8/install.sh | bash`.

## Scripts

This repo includes a number of utility scripts that come in handy for taking care of various tasks. These can be found in `src/scripts` and most can be run with node.

* `collectHighlights.js` - Creates a directory in the root of this repository called `highlights` with all images that are tagged as highlights
* `compilePug.js` - Compiles all pug templates into one file to be used in the dashboard. *It is necessary to run this any time the templates are changed*.
* `nightlyColorProcess.js` - Run to perform Cooper-Hewitt color processing on all TMS images. Intended to be run as part of a nightly cron
* `nightlyRun.js` - Runs to pull in new data from TMS and clean up old CSV's. Intended to be run as part of a nightly cron.
* `nightlyValidate.js` - Validates latest CSV and syncs it with Elasticsearch. Intended to be run as part of a nightly cron.
* `oldCSVClean.js` - Removes CSV's older than 15 days
* `printConfig.js` - Prints the entire configuration for the project.
* `pythonenv.sh` - Bash script to set up the python environment
* `rebuildES.js` - Empties Elasticsearch index and rebuilds it from scratch. Optional --csv argument can be used to specify the name of a TMS export CSV file to rebuild from (eg `node src/scripts/rebuildES.js --csv csv_1493737217168)
* `saveImageKeysToEs.js` - Restores `imageSecret` and `imageOriginalSecret` keys from S3 if they are deleted from Elasticsearch
* `startEs.sh` - Starts Elastcisearch on the local machine if it is not running
* `updateMappings.js` - Updates Elasticsearch mappings if they change, from file `config/mapping.json`


## Live crontab
SHELL=/bin/bash
PATH=$PATH:/home/ubuntu/.nvm/versions/node/v9.2.1/bin
00 00 * * * cd /usr/local/barnes/projects/barnes-tms-extract && /bin/bash src/scripts/update_collection_data.sh

## Example crontab
Here's an example of a crontab that might work with this repo

```
SHELL=/bin/bash
PATH=$PATH:/home/ubuntu/.nvm/versions/node/v9.2.1/bin
00 00 * * * cd /usr/local/barnes/projects/CollectionWebsite/ && node src/scripts/nightlyRun.js
00 01 * * * cd /usr/local/barnes/projects/CollectionWebsite/ && node src/scripts/nightlyValidate.js
15 01 * * * cd /usr/local/barnes/projects/CollectionWebsite/ && node src/scripts/nightlyColorProcess.js
20 01 * * * cd /usr/local/barnes/projects/CollectionWebsite/ && node src/scripts/saveImageKeysToEs.js
```

## Data Pipeline

On a nightly basis, the scripts in [scripts/update][] run on the admin server to:
1. Export TMS data from the eMuseum API.
2. Create a new, timestamped index in Elasticsearch. The naming pattern for Elasticsearch indices is `collection_<timestamp>`.
3. Ingest the TMS data exported from eMuseum into the new Elasticsearch index.
4. Add color data to all documents in the Elasticsearch index.
5. Add image secrets to all documents, which allows the client to access images in S3.
6. Add computer vision data to all documents.
7. Add tags to all documents.

These scripts rely on the existence of a series of CSV files to add image secrets, computer vision data, etc. Those files must be stored in the directory referenced in [`config/base.json`](./config/base.json) in `CSV.dataPath`. If these files are missing, the update scripts will not finish running, and the collection index will be considered incomplete and ignored by the front-end.

## using elasticserch

The [barnes-collection-www][] application is a good example for reading from the most recent complete Elasticsearch index.
It looks for indices named `collection_*` and selects the index with the *latest* timestamp that also has content in the `tags` field on individual objects.

You can get a sorted list of the collection indices by running in Kibana Dev Tools:

    GET _cat/indices/collection_*?v&s=index


The most recent index will be at the bottom of the list. It should contain around 2265 documents.

## Data Mapping

The mapping for the collection data stored in Elasticsearch is defined in [`config/mapping.json`](./config/mapping.json).

You can also retrieve the mapping for a specific index by running in Kibana Dev Tools:
```
GET collection_<timestamp>/_mapping
```

## Resources

The [Elasticsearch v5.4 documentation][] is unfortunately, the best resource we have found so far. Be aware that there are completely separate references for each version of Elasticsearch. If you locate solutions to problems through Google or StackOverflow, you will frequently be taken to a reference page for a different version than the one you’re using. Make sure to watch for that, so that you don’t get stuck trying a method that’s been deprecated or hasn’t been introduced in your version.

Clicking “View in Console” on any example queries in the docs will take you to your Kibana Dev Tools console and insert the query. This is very helpful.

[barnes-collection-www]: https://github.com/barnesfoundation/barnes-collection-www
[elasticsearch]: https://a3bf81f3efa82d7e9a6b1c6fcc91e1d3.us-east-1.aws.found.io:9243
[Kibana]: https://b289f66f9c19402e7ce08eb03e56b486.us-east-1.aws.found.io
[scripts/update]: ./scripts/update

[Elasticsearch v5.4 documentation]: https://www.elastic.co/guide/en/elasticsearch/reference/5.4/index.html

