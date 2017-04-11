# First principles (or statements of bias) for a collection-spelunker

## Separation of concerns

A collection-spelunker consists of the following layers, or separation of concerns:

* Source of Truth 
* Export Tools
* Data Model
* Import Tools
* Datastore
* Web Application

Wherever possible each layer is only aware of the layers immediately following or proceeding it.

## Technology Choices

Technology choices for a collection-spelunker should be guided by the notions of enforced simplicity and reproducability. 

It should be possible to implement most or all of the functionality for a collection-spelunker in a new programming language or environment in days or weeks at most and it should be possible to do so using a pre-existing implementation as a guide.

This mandates an enforced simplicity in both the functionality and the design and the implementation of a system. Developers should not rely on application or framework specific features because of their immediate short-term benefit unless that functionality is readily available in other languages or programming environments.

The goal of the collection-spelunker is to define a model for a simple, modestly-featured collections website with as low a barrier to setup and maintenance as possible. The goal is not to impose any one institution's technology preferences, or infrastructure burdens, on another.

The measure of any one implementation should be how quickly and easily it can be translated in another programming language or environment, better suited to the needs of a different institution.

### Programming Languages

Ideally a collection-spelunker should provide tools (for each applicable layer) written in the multiple programming languages: one interpreted and one compiled; typically these are loosely and strictly typed languages respectively.

Examples of the former include languages like Javascript, Ruby or Python with the aim of providing a working utility for easy introspection, experimentation and extending by experienced and novice users alike.

Examples of the latter include like Go or Java that enforce an additional level of programming diligence (by virtue of being stricly typed) and that can be pre-compiled to operating system specific binaries in order to minimize the burden of installing tool-specific dependencies. This is especially important for museum staff who have neither the time or the inclination to dabble in the technology but still need to perform tasks related to the collection-spelunker.

### Datastores

While a specific datastore is suggested below, the choice of which datastore should be governed by the features it provides:

* It is open source and openly licensed.
* It provides robust full-text search (typically Lucene).
* It provides suitably relational database (RDBMS) -like funcitonality, certainly for the purposes a small to medium-size collections spelunker.
* It provides sophisticated faceting features, not easily implemented in a traditional RDBMS.
* It should not require a predetermined fixed schema  allows for rapid prototyping and iterating in order to improve existing functionality and developing new ones. (In reality, almost every non-fixed schema evolves to become fixed but that is left as an institution-specific detail.)
* Query results can be easily cached (using a variety of in-memory or on-disk or third-party caching providers).
* It can be hosted locally for development purposes, on an institution's own dedicated hardware or using virtualized hardware like Amazon Web Services (AWS) or via a dedicated third-party service (like Heroku).
* Ideally, it can be taught to index and query arbitrary nested hierarchical data structures (machinetags) for per-object metadata that can not be mapped easily to a key-value pair.

Importantly, in the eyes of the web application (discussed below) the datastore is simply an "addressable" service and can live anywhere on the Internet.

### Web Applications

The choice of a specific programming language or framework for a web application will depend heavily on the cost and availability of the staff to implement the work. The following general criteria should be used to evaluate web application choices:

* It is written in the a programming language which enjoys an active developer community or at least lots of documentation.
* It has a very small "footprint" for dependencies and setup costs.
* It can degrade gradefully and work without Javascript being enabled in a user's web browser.
* It can be easily integrated with more sophisticated hosting options if or when the demands of an institution require it.
* Although it is possible with enough effort to built an overly complex and complicated application in any development environment the constraints of the application framework chose should lend themselves to a useful and necessary "enforced simplicity" for the purposes of a collection-spelunker that can meet the needs of a variety of institutions.
* Equally the "enforced simplicity" make the option of extending or even porting existing collection-spelunker installation to a different framework or development environment a managable and affordable task.
* Applications can be hosted locally for development purposes, on an institution's own dedicated hardware or using virtualized hardware like Amazon Web Services (AWS) or via a dedicated third-party service (like Heroku).

## Source of Truth

For the purpose of this document TMS is considered to be the source of truth for all collections data.

A collection-spelunker is assumed to be a read-only reflection of the data exported by TMS (or any other similar source of truth about a collection). 

## Export Tools

The TMS API is considered to be the primary or default means of exporting data from TMS. The scope of the export tools is limited to communicating with the "source of truth" and generating data-model compliant static files (discussed below).

It should be possible to write a suitable export tool in any programming language as all communications will happen via HTTP requests and all output will be plain text formats such as CSV or JSON. 

Ideally CSV would the default export format since it enjoys both broad understanding and tooling across the sector. While JSON is a mature and robust format well-understood in the developer community it remains foreign and error-prone for non-technical users. There may be instances where nested datastructures are necessary, and which are not easily modeled in a CSV file, but as a rule CSV files should be the "lingua franca" for a collection-spelunker.

## Data Model

Until, or unless, there is a compelling reason to do otherwise the data model will assume a standard rows and columns (CSV) format. Columns with multiple values will be encoded as delimiter-separated values. This includes complex hierarchical data or collection-specific details that augment the default data model all of which will be encoded as machinetags (discussed below).

The minimal data model (MDM) itself is limited by design and will consist of the following "first-class" objects and properties:

_To be defined in a separate document._

The MDM for a single object is not meant to capture the complete representation of any given institution. The MDM is meant to be a common middle ground that spans a wide array of institutions. Something that is more complex than the Dublin Core model but simpler than "your museum's data model".

Although still under consideration one approach for enabling more complex and nuanced meta data in the datastore is the use of arbitrary "machine tags". These would allow an institution to index and query custom namespaced or prefixed data alongside the MDM. For example, the machine tag `barnes:adjacent_object=AF45.b,c` might be used to denote one or more works that are hung adjacent to a specific object.

For people implementing a collection-spelunker this would mean:

* Developing import tools that recognize a machine tag and index it correctly in the datastore
* Creating a suitable scheme for indexing and querying machine tags in the datastore
* Creating suitable interfaces for querying and displaying machine tags indexed in the datastore

A longer discussion about machine tags, including their suitability for this project, is outside the scope of this document. Further reading on the subject is available here:

* http://aaronland.info/talks/mw10_machinetags/
* https://github.com/straup/machinetags-readinglist
* https://github.com/whosonfirst/py-machinetag
* https://github.com/whosonfirst/py-machinetag-elasticsearch

## Import tools

The scope of the import tools is limited to communicating with the data-model compliant static files, the datastore and nothing else. For example, the import tools need not have any awareness of or functionality relating to the web application.

Ideally it should be possible for an institution who does _not_ already use TMS as their "source of truth" to produce an export-compliant CSV (or JSON) file manually and then import it using these tools.

## Datastore

As of this writing Elasticsearch (ES) is suggested because it best meets the criteria defined in the Technology Choices/Datastores section.

Future iterations of the collection-spelunker _may_ define an abstract model that could be implemented by another datastore but this is outside the scope of the current work.

## Web application

As of this writing a web application like (but not limited to) Flask is suggested because it best meets the criteria defined in the Technology Choices/Programming Languages and Technology Choices/Web Applications sections.

The specific functionality of the web application is to be defined in a separate document. This document does not concern itself so much with _what_ a collection-spelunker does its job but rather with _how_ it does its job.

Like the datastore an abstract model for the web application be defined and be implemented in another framework or programming environment but this is also outside the scope of the current work.
