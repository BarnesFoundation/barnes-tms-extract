# Barnes Foundation Elasticsearch Documentation

## Elasticsearch & Kibana

- Elasticsearch endpoint: https://a3bf81f3efa82d7e9a6b1c6fcc91e1d3.us-east-1.aws.found.io:9243
- Kibana: https://b289f66f9c19402e7ce08eb03e56b486.us-east-1.aws.found.io

Credentials for Elasticsearch and Kibana are the same. Contact Steve Brady to request them.

We are running Elasticsearch and Kibana at version 5.4. This is an outdated version, so be sure to keep this in mind if any queries are failing; its capabilities have evolved significantly.

You can access the data stored in Elasticsearch in several ways:
1. Query the Elasticsearch endpoint directly.
2. Use Kibana to explore the data either through its search function or by using the Dev Tools interface to construct and run Elasticsearch queries.
3. Use [elasticsearch.js](https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/quick-start.html), a Node client for querying an Elasticsearch index.
4. Presumably there are other Elasticsearch clients, too.

## Data Pipeline

On a nightly basis, the Node scripts found in the [barnes-tms-extract](https://github.com/barnesfoundation/barnes-tms-extract) repo run on the admin server to:
1. Export TMS data from the eMuseum API.
2. Create a new, timestamped index in Elasticsearch. The naming pattern for Elasticsearch indices is `collection_<timestamp>`.
3. Ingest the TMS data exported from eMuseum into the new Elasticsearch index.
4. Add color data to all documents in the Elasticsearch index.
5. Add image secrets to all documents, which allows the client to access images in S3.
6. Add computer vision data to all documents.
7. Add tags to all documents.

The React application is always reading from the most recent complete Elasticsearch index. It looks for indices named `collection_*` and selects the index with the *latest* timestamp that also has content in the `tags` field on individual objects. This is a reasonable way to isolate the most recent complete index for other projects as well.

You can get a sorted list of the collection indices by running in Kibana Dev Tools:
```
GET _cat/indices/collection_*?v&s=index
```

The most recent index will be at the bottom of the list. It should contain around 2265 documents.

## Data Mapping

The mapping for the collection data stored in Elasticsearch is defined in [`config/mapping.json`](https://github.com/BarnesFoundation/barnes-tms-extract/blob/master/config/mapping.json).

You can also retrieve the mapping for a specific index by running in Kibana Dev Tools:
```
GET collection_<timestamp>/_mapping
```

## Resources

Elasticsearch documentation: https://www.elastic.co/guide/en/elasticsearch/reference/5.4/index.html

Clicking “View in Console” on any example queries in the docs will take you to your Kibana Dev Tools console and insert the query. This is very helpful.

elasticsearch.js documentation:
https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/index.html

## Nota Bene

- The scripts to update Elasticsearch rely on the existence of a series of CSV files to add image secrets, computer vision data, etc. These files must be stored in the directory referenced in [`config/base.json`](https://github.com/BarnesFoundation/barnes-tms-extract/blob/master/config/base.json) in `CSV.dataPath`. If these files are missing, the update scripts will not finish running, and the collection index will be considered incomplete and ignored by the front-end.
- The Elasticsearch documentation (including elasticsearch.js) is not our favorite. Be aware that there are completely separate references for each version of Elasticsearch. If you locate solutions to problems through Google or StackOverflow, you will frequently be taken to a reference page for a different version than the one you’re using. Make sure to watch for that, so that you don’t get stuck trying a method that’s been deprecated or hasn’t been introduced in your version.
