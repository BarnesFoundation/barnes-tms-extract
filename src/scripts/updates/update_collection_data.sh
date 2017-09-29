#!/bin/bash

node src/scripts/updates/00_prepareESIndex.js &&
node src/scripts/updates/01_exportTMSToCSV.js &&
node src/scripts/updates/02_importTMSDataToES.js &&
node src/scripts/updates/03_addImageSecretsToES.js &&
node src/scripts/updates/04_addColorDataToES.js &&
node src/scripts/updates/05_importDataCSVsToES.js &&
node src/scripts/updates/06_addTagsToES.js



