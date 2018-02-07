## Elasticsearch

The file located at `config/mapping.json` details the structure of the Elasticsearch index. The index is named `collection` and contains two object types, `meta` and `object`. The `meta` type object is a singleton, and contains the following fields:

- hasImportedCSV -- Boolean, whether or not the elasticsearch index has ever successfully imported a CSV file
- lastCSVImportTimestamp -- timestamp matching the name of the TMS export CSV last imported

The `object` type describes a piece in the collection, and includes the following fields:

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

If at any time the Elasticsearch index becomes corrupted and needs to be rebuild, it can be reconstructed from a TMS export and by running a few analysis scripts.

- run `src/scripts/rebuildES.js --csv csv_***`, replacing csv_*** with the name of the CSV to rebuild from
- run `pm2 start ecosystem.config.js` if the COLOR_PROCESSING microservice is not running
- run `src/scripts/nightlyColorProcess.js` to run Cooper-Hewitt color processing on all of the images
- run `src/scripts/saveImageKeysToEs.js` to store all of the image keys in Elasticsearch

## Kibana

We are using Elasticcloud to provide a Kibana dashboard, which can be used to view and explore data in the Elasticsearch index. The web address, username and password for that dashboard are not needed by any scripts in this repository, and so are not stored here.

In order to load the Kibana dashboard, it is necessary to click on the Management tab, and then to use `collection` as the index pattern, since this is the name of the index holding the collection objects.

## JSDoc Code Documentation

All of the backend code is documented using JSDoc. To generate documentation, first ensure that jsdoc and jsdoc-to-markdown are installed globally. Then run

```
npm run docs
```

which should build the documentation in `docs`. View `docs/collection-website/0.0.1/index.html` in any browser. Documentation can also be generated in markdown format:

```
npm run docs-md
```

which will generate the file `docs.md`

---

# Quick Steps to Manually Update the Site

It's important to run these commands at the root of this repo on the admin server, so that you have the correct data CSVs in place.

1. Set the name of the collection index in `local.json`. For now we are toggling between `collection_a` and `collection_b`, but you can also make it whatever you want.
```
{
  "Elasticsearch": {
    "index": "collection_a"
  }
}
```
It is very important that you set this collection index name to something new. If you don't, you will overwrite the live index and create some downtime.

If this is a new collection index name, you'll need to add it to Kibana manually in order to look at it. In Kibana, go to Management > Index Patterns > +, and put the new collection index name in the field for *Index name or pattern*. Uncheck the box for time-based events. Click Create.

2. Prepare the new ES index.
```
node src/scripts/updates/00_prepareESIndex.js
```
This builds a new index with the given name in Elasticsearch, adds our mapping, and adds some metadata. When this step is complete, you should see that new index in Kibana, with 1 hit for the meta object.

3. Export a new CSV from TMS.
```
node src/scripts/updates/01_exportTMSToCSV.js
```
This will take a while. When it's done, you can check to see that there's a new set of CSVs in `dashboard/src/public/output`. Eventually we should have this write to a better location, but I didn't want to mess with that yet.

4. Import this new CSV into ES.
```
node src/scripts/updates/02_importTMSDataToES.js
```
When this is done, you should see 2220 hits in the appropriate index on Kibana.
You might see some errors while this is running, but it should be fine.

5. Add the image secrets to ES.
```
node src/scripts/updates/03_addImageSecretsToES.js
```
When this is done, you should see that 1873 objects in this index have `imageSecret` and `imageOriginalSecret` in Kibana.

6. Add the color data to ES.
```
node src/scripts/updates/04_addColorDataToES.js
```
When this is done, you should see that objects have blobbed `color` data in Kibana.

7. Import the computer vision data CSVs to ES.
```
node src/scripts/updates/05_importDataCSVsToES.js
```
When this is done, you should see that many of the objects (not all) have a variety of float descriptors attached to them.

8. Add the tags to ES.
```
node src/scripts/updates/06_addTagsToES.js
```
When this is done, you should see that many of the objects (not all) have a nested `tags` property in Kibana.

9. Switch the `ELASTICSEARCH_INDEX` environment variable in `barnes-collection-www` to the new index name, and rebuild.

10. A few notes:
- The bash script in `update_collection_data.sh` doesn't work yet, so don't run it.
- Kibana's search function can take some time to catch up, but the Dev Tools query tools should show you right away that you get the same results for a query in each of the indexes.
- Here's a good test search:
```
GET /collection_a/_search
{
  "from": 0,
  "size": 50,
  "sort": {
    "_score": {
      "order": "desc"
    }
  },
  "query": {
    "bool": {
      "filter": {
        "exists": {
          "field": "imageSecret"
        }
      },
      "must": {
        "multi_match": {
          "query": "french",
          "fields": [
            "tags.tag.*",
            "tags.category.*",
            "title.*",
            "people.*",
            "medium.*",
            "shortDescription.*",
            "longDescription.*",
            "visualDescription.*",
            "culture",
            "exhHistory.*",
            "bibliography.*",
            "period"
          ]
        }
      }
    }
  },
  "explain": "true"
}
```
- Have a nice day!
