# The Collection Spelunker Architecture

Albert Barnes wanted to use his collection to teach all audiences how to appreciate art, and he reasoned that grouping his artworks according to formal connections (rather than historical ones) made them more accessible. As a result, Barnes arranged his collection in “ensembles,” distinctive wall compositions organized according to formal principles of light, color, line, and space, rather than by chronology, nationality, style, or genre. In rethinking the presentation of our collection online, we are taking a more experiential and Barnes-like approach. Just like our founder, we’re going to start by focusing on the needs and interests of non-specialist, non-professional audiences and, therefore, develop a collections website that makes the image primary. Thinking about Barnes and his teaching style very specifically, we will design an interface that highlights purely visual connections between artworks — colors, shapes, lines, for example — so a visitor always has a way to move forward and deeper into the collection in a self-directed fashion.

This Barnes Collection Spelunker is a group of services and scripts that pulls data from a TMS endpoint into a more usable form. Also included is a script for tiling and uploading images using go-ifff. Installation instructions can be found at https://github.com/thisisaaronland/go-iiif. Finally, a dashboard displays the current state of all the mircoservices, and all exported data in all formats.

![Architechture](./misc/ARCHITECTURE.png)

The Collection Spelunker consists of the following layers

* source of truth (TMS)
* export tools (TMS-API microservice)
* data model (CSV)
* import tools (CSV-ES microservice)
* datastore (Elasticsearch)
* dashboard (Node.js and Express.js, connects to microservices with Seneca.js)
* web application (Node.js and Express.js)

Folders in this repository are organized as follows

* src/csv_es - A node.js script (and Seneca.js microservice) that synchronizes an Elasticsearch index with the contents of an exported CSV file
* src/csv_viewer - A javascript tool for rendering a CSV file in a searchable, filterable format
* src.dashboard - A Seneca.js microservice with an Express.js server that displays the current state of the Collection Spelunker
* src/iiif-image-processor - A node.js script (and Seneca.js microservice) that pulls images from TMS and exports tiled versions of those images to an Amazon s3 bucket
* src/py_csv_diff - A python script that can compute the difference between two CSV files
* src/scripts - Miscellaneous scripts
* src/tms_csv - A node.js script (and Seneca.js microservice) that pulls object data from TMS and outputs data in a CSV format
* util - Shared javascript utilities

## Data model

The Barnes Collection has the following keys. The data model itself is limited by design, and exposes the following Barnes-specific properties [TMS field name in brackets]:

* id [id]
* Artist/Maker [people]
* Culture [culture]
* Title [title]
* Date [displayDate]
* Period [period]
* Medium [medium]
* Dimensions[dimensions]
* Object Number [invno]
* Object Location [locations]
* Copyright Status [copyright]
* Exhibition History [exhHistory]
* Bibliography [bibliography]
* Short Description [shortDescription]
* Long Description [longDescription]
* Visual Description [visualDescription]

## Import

The scope of the import tools is limited to communicating with the data-model compliant static files and the datastore (Elasticsearch).

The collection-spelunker import tools are written in Python and JavaScript. Python has a library called csvdiff which makes it easy to find changes in the exported csv's. The JavaScript portion is a Seneca.js microservice which communicates with the dashboard.

## Datastore

Elasticsearch is the primary datastore. Each collection object maps to a single Elasticsearch object with type `object`. Each column in the CSV file exported from TMS becomes a single field in the object.

Elasticsearch (ES) has been chosen because:

* It provides robust full-text search (Lucene).
* It provides suitably RDBMS-like funcitonality, certainly for the purposes a small to medium-size collections spelunker.
* It provides sophisticated faceting features, not easily implemented in a traditional RDBMS.
* ES can be taught to index and query arbitrary nested hierarchical data structures (machinetags) for per-object metadata that can not be mapped easily to a key-value pair.
* The absence of a predetermined fixed schema  allows for rapid prototyping and iterating in order to improve existing functionality and developing new ones.
* Query results can be easily cached (using a variety of in-memory or on-disk or third-party caching providers).
* ES can be hosted locally for development purposes, on an institution's own dedicated hardware or using virtualized hardware like Amazon Web Services (AWS) or via a dedicated third-party service. Ultimately, in the eyes of the web application (discussed below) the datastore is simply an "addressable" service and can live anywhere on the Internet.

## Dashboard

The dashboard provides a web interface to run the import/export scripts, view log files and exported CSV's, and see the status of the scripts. It is written in Node.js/Express.js and uses Seneca.js to communicate with the various microservices.

## Web application

Express.js will be the primary, or default, tool for developing a web application for the collection-spelunker. Like the datastore an abstract model for the web application may be defined and be implemented in another framework or programming environment but this is also outside the scope of the current work.

Express.js has been chosen because:

* It is written in the JavaScript programming language which enjoys a large and active developer community and lots of documentation.
* It has a very small "footprint" for dependencies and setup costs.
* It can be easily integrated with more sophisticated hosting options if or when the demands of an institution require it.
* Although it is possible, with enough effort, to built an overly complex and complicated application in any development environment the constraints of the Node framework lends itself to a useful and necessary "enforced simplicity" for the purposes of a collection-spelunker that can meet the needs of a variety of institutions.
* Equally the "enforced simplicity" make the option of extending or even porting existing collection-spelunker installation to a different framework or development environment a managable and affordable task.
* Node applications can be hosted locally for development purposes, on an institution's own dedicated hardware or using virtualized hardware like Amazon Web Services (AWS) or via a dedicated third-party service.


