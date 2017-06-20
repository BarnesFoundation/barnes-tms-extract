# Collection Spelunker
The Barnes Foundation Collection Spelunker exports data from a TMS server and imports that data into an Elasticsearch index. The Spelunker will also pull images from TMS, tile those images, and then upload them to Amazon s3 for later viewing. These processes can be initiated by the user or configured to run automatically as part of a nightly cron. A dashboard reports the state of all running microservices.

## Requirements

One or two scripts require Python to run. Before running `npm install`, make sure
that you have Python 2.7 installed, along with pip and conda.

The image processor requires go-ifff. Installation instructions can be found at https://github.com/thisisaaronland/go-iiif

If you plan on using the encrypted keys contained in this repository, then you will need to unlock the repo using git-crypt. Install git-crypt as appropriate for your system, then contact the repository admins for the key needed to unlock the repository.

## Setup

This repository is dependent on a submodule called [go-iiif](https://github.com/thisisaaronland/go-iiif). To initialize it, run `git submodule init`. 

Run `git submodule init` and `npm install` to install Node dependencies and to setup the python environment.

This repository contains encrypted keys for connecting to the Barnes TMS as well as the Amazon s3 instance used to upload tiled images. If you plan to use the Barnes credentials for TMS and s3, then you will need to unlock the repository using git-crypt. You will need to contact the repository admins for a copy of the key needed to unlock the repository. With that key available somewhere on the machine, type:

`git-crypt unlock path/to/your/key`

to unlock the repository. This should decrypt the files `config/credentials.json` and `config/iiif.json`.

You will also need to build the `go-iiif` submodule. To this, run
```bash
cd src/image-processing/go-iiif
make bin
```

## Run

From the repository root, run

`pm2 start ecosystem.config.json`, or `pm2 start ecosystem.config.json --env production` in production.

to start the dashboard server and all microservices. Visit `http://localhost:3000` to access the dashboard. From here, you will be able to initiate the export-import process.

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

## Example crontab

Here's an example of a crontab that might work with this repo

```

SHELL=/bin/bash
PATH=$PATH:/home/ubuntu/.nvm/versions/node/v6.2.2/bin
00 00 * * * cd /usr/local/barnes/projects/CollectionWebsite/ && node src/scripts/nightlyRun.js
00 01 * * * cd /usr/local/barnes/projects/CollectionWebsite/ && node src/scripts/nightlyValidate.js
15 01 * * * cd /usr/local/barnes/projects/CollectionWebsite/ && node src/scripts/nightlyColorProcess.js
20 01 * * * cd /usr/local/barnes/projects/CollectionWebsite/ && node src/scripts/saveImageKeysToEs.js
```
