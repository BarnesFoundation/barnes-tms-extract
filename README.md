# Collection Spelunker
The Barnes Foundation Collection Spelunker exports data from a TMS server and imports that data into an Elasticsearch index. The Spelunker will also pull images from TMS, tile those images, and then upload them to Amazon s3 for later viewing. These processes can be initiated by the user or configured to run automatically as part of a nightly cron. A dashboard reports the state of all running microservices.

## Requirements

One or two scripts require Python to run. Before running `npm install`, make sure
that you have Python 2.7 installed, along with pip and conda.

The image processor requires go-ifff. Installation instructions can be found at https://github.com/thisisaaronland/go-iiif

The image processor also requires phantomjs. Install as appropriate for your system.

If you plan on using the encrypted keys contained in this repository, then you will need to unlock the repo using git-crypt. Install git-crypt as appropriate for your system, then contact the repository admins for the key needed to unlock the repository.

## Setup

Run `npm install` to install Node dependencies and to setup the python environment.

This repository contains encrypted keys for connecting to the Barnes TMS as well as the Amazon s3 instance used to upload tiled images. If you plan to use the Barnes credentials for TMS and s3, then you will need to unlock the repository using git-crypt. You will need to contact the repository admins for a copy of the key needed to unlock the repository. With that key available somewhere on the machine, type:

`git-crypt unlock path/to/your/key`

to unlock the repository. This should decrypt the files `config/credentials.json` and `config/iiif.json`.

## Run

From the repository root, run

`npm run serve`

to start the dashboard server, the tms-to-csv microservice, the csv-list microservice, the iiif microservice and the csv-to-elasticsearch microservice. Visit `http://localhost:3000` to access the dashboard. From here, you should be able to initiate the export-import process.
