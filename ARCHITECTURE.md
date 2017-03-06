# collection-spleunker architecture

The collection-spelunker consists of the following layers, or separation of concerns:

* source of truth (TMS)
* export tools (TMS-API microservice)
* data model (CSV)
* import tools (CSV-ES microservice)
* datastore (Elasticsearch)
* dashboard (Node.js and Express.js, connects to microservices with Seneca.js)
* web application (Node.js and Express.js)

Wherever possible each layer is only aware of the layers immediately following or proceeding them.

## Source of truth (TMS)

TMS is considered to be the source of truth for all collections data. The collection-spelunker is assumed to be a read-only reflection of the data. 

## Export (TMS-API)

The TMS API is considered to be the primary or default means of exporting data from TMS. The scope of the export tools is limited to communicating with the "source of truth" and generating data-model compliant static files (discussed below).

It should be possible to write a suitable export tool in any programming language as all communications will happen via HTTP requests and all output will be plain text formats such as CSV or JSON. 

The collection-spelunker export tools are written in JavaScript/Node.js. This was chosen to provide a working utility for easy introspection, experimentation and extending. JavaScript is also one of the most popular programming languages of today and has a huge ecosystem of libraries.

## Data model

Until, or unless, there is a compelling reason to do otherwise the data model will assume a standard rows and columns (CSV) format. Columns with multiple values will be encoded as delimiter-separated values. This includes complex hierarchical data or collection-specific details that augment the default data model (discussed below), all of which will be encoded as machinetags (also discussed below).

The data model itself is limited by design and will consist of the following "first-class" objects and properties:

### Objects

* ID
* Accession number
* Name
* TBW

### People 

* ID
* Name
* Date of birth
* Date of death
* TBW

## Import

The scope of the import tools is limited to communicating with the data-model compliant static files and the datastore (Elasticsearch).

The collection-spelunker import tools are written in Python and JavaScript. Python has a fantastic library called csvdiff which makes it easy to find changes in the exported csv's. The JavaScript portion is a Seneca.js microservice which communicates with the dashboard.

## Datastore

Elasticsearch is the primary, or default, datastore. Future iterations of the collection-spelunker _may_ define an abstract model that could be implemented by another datastore but this is outside the scope of the current work.

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

The  will be the primary, or default, tool for developing a web application for the collection-spelunker. Like the datastore an abstract model for the web application may be defined and be implemented in another framework or programming environment but this is also outside the scope of the current work.

Flask has been chosen because:

* It is written in the Python programming language which enjoys a large and active developer community and lots of documentation.
* It has a very small "footprint" for dependencies and setup costs.
* It can be easily integrated with more sophisticated hosting options if or when the demands of an institution require it.
* Although it is possible, with enough effort, to built an overly complex and complicated application in any development environment the constraints of the Flask framework lends itself to a useful and necessary "enforced simplicity" for the purposes of a collection-spelunker that can meet the needs of a variety of institutions.
* Equally the "enforced simplicity" make the option of extending or even porting existing collection-spelunker installation to a different framework or development environment a managable and affordable task.
* Flask applications can be hosted locally for development purposes, on an institution's own dedicated hardware or using virtualized hardware like Amazon Web Services (AWS) or via a dedicated third-party service.

## The gory details

### Customization and templates

Something something something headers and footers and CSS files something something something. Nothing else. By design.

### Machine tags

TBW

* http://aaronland.info/talks/mw10_machinetags/
* https://github.com/straup/machinetags-readinglist
* https://github.com/whosonfirst/py-machinetag
* https://github.com/whosonfirst/py-machinetag-elasticsearch

### Dates

Something something something Library of Congress Extended DateTime Format (EDTF) something something something.

## References and pre-existing work

TBW



