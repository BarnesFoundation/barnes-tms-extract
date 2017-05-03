function pug_escape(e){var a=""+e,t=pug_match_html.exec(a);if(!t)return e;var r,c,n,s="";for(r=t.index,c=0;r<a.length;r++){switch(a.charCodeAt(r)){case 34:n="&quot;";break;case 38:n="&amp;";break;case 60:n="&lt;";break;case 62:n="&gt;";break;default:continue}c!==r&&(s+=a.substring(c,r)),c=r+1,s+=n}return c!==r?s+a.substring(c,r):s}
var pug_match_html=/["&<>]/;
function pug_rethrow(n,e,r,t){if(!(n instanceof Error))throw n;if(!("undefined"==typeof window&&e||t))throw n.message+=" on line "+r,n;try{t=t||require("fs").readFileSync(e,"utf8")}catch(e){pug_rethrow(n,null,r)}var i=3,a=t.split("\n"),o=Math.max(r-i,0),h=Math.min(a.length,r+i),i=a.slice(o,h).map(function(n,e){var t=e+o+1;return(t==r?"  > ":"    ")+t+"| "+n}).join("\n");throw n.path=e,n.message=(e||"Pug")+":"+r+"\n"+i+"\n\n"+n.message,n}function csv(locals) {var pug_html = "", pug_mixins = {}, pug_interp;var pug_debug_filename, pug_debug_line;try {;var locals_for_with = (locals || {});(function (csvId, csvType) {;pug_debug_line = 1;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Fcsv.pug";
pug_html = pug_html + "\u003C!DOCTYPE html\u003E";
;pug_debug_line = 2;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Fcsv.pug";
pug_html = pug_html + "\u003Chtml\u003E";
;pug_debug_line = 3;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Fcsv.pug";
pug_html = pug_html + "\u003Chead\u003E";
;pug_debug_line = 4;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Fcsv.pug";
pug_html = pug_html + "\u003Cmeta charset=\"UTF-8\"\u003E";
;pug_debug_line = 5;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Fcsv.pug";
pug_html = pug_html + "\u003Cmeta name=\"viewport\" content=\"maximum-scale=1,width=device-width,initial-scale=1,user-scalable=0\"\u003E";
;pug_debug_line = 6;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Fcsv.pug";
pug_html = pug_html + "\u003Ctitle\u003E";
;pug_debug_line = 6;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Fcsv.pug";
pug_html = pug_html + "Objects in Barnes Collection\u003C\u002Ftitle\u003E";
;pug_debug_line = 7;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Fcsv.pug";
pug_html = pug_html + "\u003Clink href=\"https:\u002F\u002Fcdnjs.cloudflare.com\u002Fajax\u002Flibs\u002Ftwitter-bootstrap\u002F3.3.7\u002Fcss\u002Fbootstrap.min.css\" rel=\"stylesheet\"\u003E";
;pug_debug_line = 8;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Fcsv.pug";
pug_html = pug_html + "\u003Clink href=\"https:\u002F\u002Fcdnjs.cloudflare.com\u002Fajax\u002Flibs\u002Fdatatables\u002F1.10.13\u002Fcss\u002FdataTables.bootstrap.css\" rel=\"stylesheet\"\u003E\u003C\u002Fhead\u003E";
;pug_debug_line = 9;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Fcsv.pug";
pug_html = pug_html + "\u003Cbody\u003E";
;pug_debug_line = 10;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Fcsv.pug";
pug_html = pug_html + "\u003Cdiv class=\"container-fluid\"\u003E";
;pug_debug_line = 11;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Fcsv.pug";
pug_html = pug_html + "\u003Ch2\u003E";
;pug_debug_line = 11;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Fcsv.pug";
pug_html = pug_html + "Objects in Barnes Collection, CSV\u003C\u002Fh2\u003E";
;pug_debug_line = 12;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Fcsv.pug";
pug_html = pug_html + "\u003Cdiv id=\"table-container\"\u003E\u003C\u002Fdiv\u003E\u003C\u002Fdiv\u003E";
;pug_debug_line = 14;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Fcsv.pug";
pug_html = pug_html + "\u003Cscript src=\"https:\u002F\u002Fcdnjs.cloudflare.com\u002Fajax\u002Flibs\u002Fjquery\u002F3.1.1\u002Fjquery.min.js\"\u003E\u003C\u002Fscript\u003E";
;pug_debug_line = 15;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Fcsv.pug";
pug_html = pug_html + "\u003Cscript src=\"https:\u002F\u002Fcdnjs.cloudflare.com\u002Fajax\u002Flibs\u002Ftwitter-bootstrap\u002F3.3.7\u002Fjs\u002Fbootstrap.min.js\"\u003E\u003C\u002Fscript\u003E";
;pug_debug_line = 16;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Fcsv.pug";
pug_html = pug_html + "\u003Cscript src=\"https:\u002F\u002Fcdnjs.cloudflare.com\u002Fajax\u002Flibs\u002Fjquery-csv\u002F0.71\u002Fjquery.csv-0.71.min.js\"\u003E\u003C\u002Fscript\u003E";
;pug_debug_line = 17;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Fcsv.pug";
pug_html = pug_html + "\u003Cscript src=\"https:\u002F\u002Fcdnjs.cloudflare.com\u002Fajax\u002Flibs\u002Fdatatables\u002F1.10.13\u002Fjs\u002Fjquery.dataTables.min.js\"\u003E\u003C\u002Fscript\u003E";
;pug_debug_line = 18;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Fcsv.pug";
pug_html = pug_html + "\u003Cscript src=\"https:\u002F\u002Fcdnjs.cloudflare.com\u002Fajax\u002Flibs\u002Fdatatables\u002F1.10.13\u002Fjs\u002FdataTables.bootstrap.min.js\"\u003E\u003C\u002Fscript\u003E";
;pug_debug_line = 19;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Fcsv.pug";
pug_html = pug_html + "\u003Cscript src=\"..\u002Fscripts\u002Fcsv_to_html_table.js\"\u003E\u003C\u002Fscript\u003E";
;pug_debug_line = 21;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Fcsv.pug";
pug_html = pug_html + "\u003Cscript\u003E";
;pug_debug_line = 22;
pug_html = pug_html + "var csvId = \"";
;pug_debug_line = 22;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Fcsv.pug";
pug_html = pug_html + (pug_escape(null == (pug_interp = csvId) ? "" : pug_interp));
;pug_debug_line = 22;
pug_html = pug_html + "\";";
;pug_debug_line = 23;
pug_html = pug_html + "\n";
;pug_debug_line = 23;
pug_html = pug_html + "var csvType = \"";
;pug_debug_line = 23;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Fcsv.pug";
pug_html = pug_html + (pug_escape(null == (pug_interp = csvType) ? "" : pug_interp));
;pug_debug_line = 23;
pug_html = pug_html + "\";";
;pug_debug_line = 24;
pug_html = pug_html + "\n";
;pug_debug_line = 24;
pug_html = pug_html + "function ellipses_format(text){";
;pug_debug_line = 25;
pug_html = pug_html + "\n";
;pug_debug_line = 25;
pug_html = pug_html + "\tif (typeof text !== \"string\") return text;";
;pug_debug_line = 26;
pug_html = pug_html + "\n";
;pug_debug_line = 26;
pug_html = pug_html + "\tvar maxlen = 60;";
;pug_debug_line = 27;
pug_html = pug_html + "\n";
;pug_debug_line = 27;
pug_html = pug_html + "\tif (text.length \u003C maxlen) return text;";
;pug_debug_line = 28;
pug_html = pug_html + "\n";
;pug_debug_line = 28;
pug_html = pug_html + "\treturn text.slice(0, maxlen - 3) + \"...\";";
;pug_debug_line = 29;
pug_html = pug_html + "\n";
;pug_debug_line = 29;
pug_html = pug_html + "}";
;pug_debug_line = 30;
pug_html = pug_html + "\n";
;pug_debug_line = 30;
pug_html = pug_html + "CsvToHtmlTable.init({";
;pug_debug_line = 31;
pug_html = pug_html + "\n";
;pug_debug_line = 31;
pug_html = pug_html + "\tcsv_path: '..\u002Foutput\u002F' + csvId + '\u002F' + csvType + '.csv',";
;pug_debug_line = 32;
pug_html = pug_html + "\n";
;pug_debug_line = 32;
pug_html = pug_html + "\telement: 'table-container',";
;pug_debug_line = 33;
pug_html = pug_html + "\n";
;pug_debug_line = 33;
pug_html = pug_html + "\tallow_download: true,";
;pug_debug_line = 34;
pug_html = pug_html + "\n";
;pug_debug_line = 34;
pug_html = pug_html + "\tfilter_columns: true,";
;pug_debug_line = 35;
pug_html = pug_html + "\n";
;pug_debug_line = 35;
pug_html = pug_html + "\tcsv_options: {separator: ',', delimiter: '\"'},";
;pug_debug_line = 36;
pug_html = pug_html + "\n";
;pug_debug_line = 36;
pug_html = pug_html + "\tdatatables_options: {\"paging\": true},";
;pug_debug_line = 37;
pug_html = pug_html + "\n";
;pug_debug_line = 37;
pug_html = pug_html + "\tcustom_formatting: [[\"description\", ellipses_format], [\"bibliography1\", ellipses_format]]";
;pug_debug_line = 38;
pug_html = pug_html + "\n";
;pug_debug_line = 38;
pug_html = pug_html + "});\u003C\u002Fscript\u003E\u003C\u002Fbody\u003E\u003C\u002Fhtml\u003E";}.call(this,"csvId" in locals_for_with?locals_for_with.csvId:typeof csvId!=="undefined"?csvId:undefined,"csvType" in locals_for_with?locals_for_with.csvType:typeof csvType!=="undefined"?csvType:undefined));} catch (err) {pug_rethrow(err, pug_debug_filename, pug_debug_line);};return pug_html;}function pug_attr(t,e,n,f){return e!==!1&&null!=e&&(e||"class"!==t&&"style"!==t)?e===!0?" "+(f?t:t+'="'+t+'"'):("function"==typeof e.toJSON&&(e=e.toJSON()),"string"==typeof e||(e=JSON.stringify(e),n||e.indexOf('"')===-1)?(n&&(e=pug_escape(e))," "+t+'="'+e+'"'):" "+t+"='"+e.replace(/'/g,"&#39;")+"'"):""}
function pug_escape(e){var a=""+e,t=pug_match_html.exec(a);if(!t)return e;var r,c,n,s="";for(r=t.index,c=0;r<a.length;r++){switch(a.charCodeAt(r)){case 34:n="&quot;";break;case 38:n="&amp;";break;case 60:n="&lt;";break;case 62:n="&gt;";break;default:continue}c!==r&&(s+=a.substring(c,r)),c=r+1,s+=n}return c!==r?s+a.substring(c,r):s}
var pug_match_html=/["&<>]/;
function pug_rethrow(n,e,r,t){if(!(n instanceof Error))throw n;if(!("undefined"==typeof window&&e||t))throw n.message+=" on line "+r,n;try{t=t||require("fs").readFileSync(e,"utf8")}catch(e){pug_rethrow(n,null,r)}var i=3,a=t.split("\n"),o=Math.max(r-i,0),h=Math.min(a.length,r+i),i=a.slice(o,h).map(function(n,e){var t=e+o+1;return(t==r?"  > ":"    ")+t+"| "+n}).join("\n");throw n.path=e,n.message=(e||"Pug")+":"+r+"\n"+i+"\n\n"+n.message,n}function csvFiles(locals) {var pug_html = "", pug_mixins = {}, pug_interp;var pug_debug_filename, pug_debug_line;try {;var locals_for_with = (locals || {});(function (desc, list) {;pug_debug_line = 1;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FcsvFilesMixin.pug";
pug_mixins["csvFilesMixin"] = pug_interp = function(list, desc){
var block = (this && this.block), attributes = (this && this.attributes) || {};
;pug_debug_line = 2;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FcsvFilesMixin.pug";
pug_html = pug_html + "\u003Ctable class=\"table table-striped table-condensed dataTable\" id=\"csvFiles\"\u003E";
;pug_debug_line = 3;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FcsvFilesMixin.pug";
pug_html = pug_html + "\u003Cthead\u003E";
;pug_debug_line = 4;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FcsvFilesMixin.pug";
pug_html = pug_html + "\u003Ctr\u003E";
;pug_debug_line = 5;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FcsvFilesMixin.pug";
pug_html = pug_html + "\u003Cth\u003E";
;pug_debug_line = 5;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FcsvFilesMixin.pug";
pug_html = pug_html + "name\u003C\u002Fth\u003E";
;pug_debug_line = 6;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FcsvFilesMixin.pug";
pug_html = pug_html + "\u003Cth\u003E";
;pug_debug_line = 6;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FcsvFilesMixin.pug";
pug_html = pug_html + "processed\u003C\u002Fth\u003E";
;pug_debug_line = 7;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FcsvFilesMixin.pug";
pug_html = pug_html + "\u003Cth\u003E";
;pug_debug_line = 7;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FcsvFilesMixin.pug";
pug_html = pug_html + "total\u003C\u002Fth\u003E";
;pug_debug_line = 8;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FcsvFilesMixin.pug";
pug_html = pug_html + "\u003Cth\u003E";
;pug_debug_line = 8;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FcsvFilesMixin.pug";
pug_html = pug_html + "status\u003C\u002Fth\u003E";
;pug_debug_line = 9;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FcsvFilesMixin.pug";
pug_html = pug_html + "\u003Cth\u003E";
;pug_debug_line = 9;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FcsvFilesMixin.pug";
pug_html = pug_html + "time ran\u003C\u002Fth\u003E";
;pug_debug_line = 10;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FcsvFilesMixin.pug";
pug_html = pug_html + "\u003Cth\u003E";
;pug_debug_line = 10;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FcsvFilesMixin.pug";
pug_html = pug_html + "view online\u003C\u002Fth\u003E";
;pug_debug_line = 11;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FcsvFilesMixin.pug";
pug_html = pug_html + "\u003Cth\u003E";
;pug_debug_line = 11;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FcsvFilesMixin.pug";
pug_html = pug_html + "download\u003C\u002Fth\u003E";
;pug_debug_line = 12;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FcsvFilesMixin.pug";
pug_html = pug_html + "\u003Cth\u003E";
;pug_debug_line = 12;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FcsvFilesMixin.pug";
pug_html = pug_html + "view warnings online\u003C\u002Fth\u003E";
;pug_debug_line = 13;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FcsvFilesMixin.pug";
pug_html = pug_html + "\u003Cth\u003E";
;pug_debug_line = 13;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FcsvFilesMixin.pug";
pug_html = pug_html + "download warnings\u003C\u002Fth\u003E";
;pug_debug_line = 14;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FcsvFilesMixin.pug";
pug_html = pug_html + "\u003Cth\u003E";
;pug_debug_line = 14;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FcsvFilesMixin.pug";
pug_html = pug_html + "sync\u003C\u002Fth\u003E\u003C\u002Ftr\u003E\u003C\u002Fthead\u003E";
;pug_debug_line = 15;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FcsvFilesMixin.pug";
pug_html = pug_html + "\u003Ctbody\u003E\u003C\u002Ftbody\u003E";
;pug_debug_line = 16;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FcsvFilesMixin.pug";
// iterate list.files
;(function(){
  var $$obj = list.files;
  if ('number' == typeof $$obj.length) {
      for (var pug_index0 = 0, $$l = $$obj.length; pug_index0 < $$l; pug_index0++) {
        var file = $$obj[pug_index0];
;pug_debug_line = 17;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FcsvFilesMixin.pug";
pug_html = pug_html + "\u003Ctr\u003E";
;pug_debug_line = 18;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FcsvFilesMixin.pug";
pug_html = pug_html + "\u003Ctd\u003E";
;pug_debug_line = 18;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FcsvFilesMixin.pug";
pug_html = pug_html + (pug_escape(null == (pug_interp = file.name) ? "" : pug_interp)) + "\u003C\u002Ftd\u003E";
;pug_debug_line = 19;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FcsvFilesMixin.pug";
pug_html = pug_html + "\u003Ctd\u003E";
;pug_debug_line = 19;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FcsvFilesMixin.pug";
pug_html = pug_html + (pug_escape(null == (pug_interp = file.processedObjects) ? "" : pug_interp)) + "\u003C\u002Ftd\u003E";
;pug_debug_line = 20;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FcsvFilesMixin.pug";
pug_html = pug_html + "\u003Ctd\u003E";
;pug_debug_line = 20;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FcsvFilesMixin.pug";
pug_html = pug_html + (pug_escape(null == (pug_interp = file.totalObjects) ? "" : pug_interp)) + "\u003C\u002Ftd\u003E";
;pug_debug_line = 21;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FcsvFilesMixin.pug";
pug_html = pug_html + "\u003Ctd\u003E";
;pug_debug_line = 21;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FcsvFilesMixin.pug";
pug_html = pug_html + (pug_escape(null == (pug_interp = file.status) ? "" : pug_interp)) + "\u003C\u002Ftd\u003E";
;pug_debug_line = 22;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FcsvFilesMixin.pug";
pug_html = pug_html + "\u003Ctd\u003E";
;pug_debug_line = 22;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FcsvFilesMixin.pug";
pug_html = pug_html + (pug_escape(null == (pug_interp = file.createdAt) ? "" : pug_interp)) + "\u003C\u002Ftd\u003E";
;pug_debug_line = 23;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FcsvFilesMixin.pug";
pug_html = pug_html + "\u003Ctd\u003E";
;pug_debug_line = 24;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FcsvFilesMixin.pug";
pug_html = pug_html + "\u003Ca" + (pug_attr("href", "/" + file.name + "/objects", true, false)) + "\u003E";
;pug_debug_line = 24;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FcsvFilesMixin.pug";
pug_html = pug_html + "View Online\u003C\u002Fa\u003E\u003C\u002Ftd\u003E";
;pug_debug_line = 25;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FcsvFilesMixin.pug";
pug_html = pug_html + "\u003Ctd\u003E";
;pug_debug_line = 26;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FcsvFilesMixin.pug";
pug_html = pug_html + "\u003Ca" + (pug_attr("href", "/output/" + file.name + "/objects.csv", true, false)) + "\u003E";
;pug_debug_line = 26;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FcsvFilesMixin.pug";
pug_html = pug_html + "Download\u003C\u002Fa\u003E\u003C\u002Ftd\u003E";
;pug_debug_line = 27;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FcsvFilesMixin.pug";
pug_html = pug_html + "\u003Ctd\u003E";
;pug_debug_line = 28;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FcsvFilesMixin.pug";
pug_html = pug_html + "\u003Ca" + (pug_attr("href", "/" + file.name + "/warnings", true, false)) + "\u003E";
;pug_debug_line = 28;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FcsvFilesMixin.pug";
pug_html = pug_html + "View Warnings Online\u003C\u002Fa\u003E\u003C\u002Ftd\u003E";
;pug_debug_line = 29;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FcsvFilesMixin.pug";
pug_html = pug_html + "\u003Ctd\u003E";
;pug_debug_line = 30;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FcsvFilesMixin.pug";
pug_html = pug_html + "\u003Ca" + (pug_attr("href", "/output/" + file.name + "/warnings.csv", true, false)) + "\u003E";
;pug_debug_line = 30;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FcsvFilesMixin.pug";
pug_html = pug_html + "Download Warnings\u003C\u002Fa\u003E\u003C\u002Ftd\u003E";
;pug_debug_line = 31;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FcsvFilesMixin.pug";
pug_html = pug_html + "\u003Ctd\u003E";
;pug_debug_line = 32;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FcsvFilesMixin.pug";
var completed = (file.status === "COMPLETED")
;pug_debug_line = 33;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FcsvFilesMixin.pug";
var esReady = desc.lastImportedCSV !== undefined
;pug_debug_line = 34;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FcsvFilesMixin.pug";
if (completed && esReady) {
;pug_debug_line = 35;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FcsvFilesMixin.pug";
var synced = (file.name === desc.lastImportedCSV)
;pug_debug_line = 36;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FcsvFilesMixin.pug";
if ((synced)) {
;pug_debug_line = 37;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FcsvFilesMixin.pug";
pug_html = pug_html + "\u003Cstrong\u003E";
;pug_debug_line = 37;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FcsvFilesMixin.pug";
pug_html = pug_html + (pug_escape(null == (pug_interp = "Synced") ? "" : pug_interp)) + "\u003C\u002Fstrong\u003E";
}
else {
;pug_debug_line = 39;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FcsvFilesMixin.pug";
pug_html = pug_html + "\u003Cbutton" + (" class=\"esSyncButton\""+pug_attr("name", file.name, true, false)) + "\u003E";
;pug_debug_line = 39;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FcsvFilesMixin.pug";
pug_html = pug_html + (pug_escape(null == (pug_interp = "Sync with " + file.name) ? "" : pug_interp)) + "\u003C\u002Fbutton\u003E";
}
}
pug_html = pug_html + "\u003C\u002Ftd\u003E\u003C\u002Ftr\u003E";
      }
  } else {
    var $$l = 0;
    for (var pug_index0 in $$obj) {
      $$l++;
      var file = $$obj[pug_index0];
;pug_debug_line = 17;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FcsvFilesMixin.pug";
pug_html = pug_html + "\u003Ctr\u003E";
;pug_debug_line = 18;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FcsvFilesMixin.pug";
pug_html = pug_html + "\u003Ctd\u003E";
;pug_debug_line = 18;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FcsvFilesMixin.pug";
pug_html = pug_html + (pug_escape(null == (pug_interp = file.name) ? "" : pug_interp)) + "\u003C\u002Ftd\u003E";
;pug_debug_line = 19;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FcsvFilesMixin.pug";
pug_html = pug_html + "\u003Ctd\u003E";
;pug_debug_line = 19;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FcsvFilesMixin.pug";
pug_html = pug_html + (pug_escape(null == (pug_interp = file.processedObjects) ? "" : pug_interp)) + "\u003C\u002Ftd\u003E";
;pug_debug_line = 20;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FcsvFilesMixin.pug";
pug_html = pug_html + "\u003Ctd\u003E";
;pug_debug_line = 20;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FcsvFilesMixin.pug";
pug_html = pug_html + (pug_escape(null == (pug_interp = file.totalObjects) ? "" : pug_interp)) + "\u003C\u002Ftd\u003E";
;pug_debug_line = 21;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FcsvFilesMixin.pug";
pug_html = pug_html + "\u003Ctd\u003E";
;pug_debug_line = 21;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FcsvFilesMixin.pug";
pug_html = pug_html + (pug_escape(null == (pug_interp = file.status) ? "" : pug_interp)) + "\u003C\u002Ftd\u003E";
;pug_debug_line = 22;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FcsvFilesMixin.pug";
pug_html = pug_html + "\u003Ctd\u003E";
;pug_debug_line = 22;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FcsvFilesMixin.pug";
pug_html = pug_html + (pug_escape(null == (pug_interp = file.createdAt) ? "" : pug_interp)) + "\u003C\u002Ftd\u003E";
;pug_debug_line = 23;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FcsvFilesMixin.pug";
pug_html = pug_html + "\u003Ctd\u003E";
;pug_debug_line = 24;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FcsvFilesMixin.pug";
pug_html = pug_html + "\u003Ca" + (pug_attr("href", "/" + file.name + "/objects", true, false)) + "\u003E";
;pug_debug_line = 24;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FcsvFilesMixin.pug";
pug_html = pug_html + "View Online\u003C\u002Fa\u003E\u003C\u002Ftd\u003E";
;pug_debug_line = 25;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FcsvFilesMixin.pug";
pug_html = pug_html + "\u003Ctd\u003E";
;pug_debug_line = 26;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FcsvFilesMixin.pug";
pug_html = pug_html + "\u003Ca" + (pug_attr("href", "/output/" + file.name + "/objects.csv", true, false)) + "\u003E";
;pug_debug_line = 26;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FcsvFilesMixin.pug";
pug_html = pug_html + "Download\u003C\u002Fa\u003E\u003C\u002Ftd\u003E";
;pug_debug_line = 27;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FcsvFilesMixin.pug";
pug_html = pug_html + "\u003Ctd\u003E";
;pug_debug_line = 28;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FcsvFilesMixin.pug";
pug_html = pug_html + "\u003Ca" + (pug_attr("href", "/" + file.name + "/warnings", true, false)) + "\u003E";
;pug_debug_line = 28;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FcsvFilesMixin.pug";
pug_html = pug_html + "View Warnings Online\u003C\u002Fa\u003E\u003C\u002Ftd\u003E";
;pug_debug_line = 29;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FcsvFilesMixin.pug";
pug_html = pug_html + "\u003Ctd\u003E";
;pug_debug_line = 30;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FcsvFilesMixin.pug";
pug_html = pug_html + "\u003Ca" + (pug_attr("href", "/output/" + file.name + "/warnings.csv", true, false)) + "\u003E";
;pug_debug_line = 30;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FcsvFilesMixin.pug";
pug_html = pug_html + "Download Warnings\u003C\u002Fa\u003E\u003C\u002Ftd\u003E";
;pug_debug_line = 31;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FcsvFilesMixin.pug";
pug_html = pug_html + "\u003Ctd\u003E";
;pug_debug_line = 32;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FcsvFilesMixin.pug";
var completed = (file.status === "COMPLETED")
;pug_debug_line = 33;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FcsvFilesMixin.pug";
var esReady = desc.lastImportedCSV !== undefined
;pug_debug_line = 34;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FcsvFilesMixin.pug";
if (completed && esReady) {
;pug_debug_line = 35;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FcsvFilesMixin.pug";
var synced = (file.name === desc.lastImportedCSV)
;pug_debug_line = 36;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FcsvFilesMixin.pug";
if ((synced)) {
;pug_debug_line = 37;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FcsvFilesMixin.pug";
pug_html = pug_html + "\u003Cstrong\u003E";
;pug_debug_line = 37;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FcsvFilesMixin.pug";
pug_html = pug_html + (pug_escape(null == (pug_interp = "Synced") ? "" : pug_interp)) + "\u003C\u002Fstrong\u003E";
}
else {
;pug_debug_line = 39;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FcsvFilesMixin.pug";
pug_html = pug_html + "\u003Cbutton" + (" class=\"esSyncButton\""+pug_attr("name", file.name, true, false)) + "\u003E";
;pug_debug_line = 39;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FcsvFilesMixin.pug";
pug_html = pug_html + (pug_escape(null == (pug_interp = "Sync with " + file.name) ? "" : pug_interp)) + "\u003C\u002Fbutton\u003E";
}
}
pug_html = pug_html + "\u003C\u002Ftd\u003E\u003C\u002Ftr\u003E";
    }
  }
}).call(this);

pug_html = pug_html + "\u003C\u002Ftable\u003E";
};
;pug_debug_line = 2;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FcsvFiles.pug";
pug_mixins["csvFilesMixin"](list, desc);}.call(this,"desc" in locals_for_with?locals_for_with.desc:typeof desc!=="undefined"?desc:undefined,"list" in locals_for_with?locals_for_with.list:typeof list!=="undefined"?list:undefined));} catch (err) {pug_rethrow(err, pug_debug_filename, pug_debug_line);};return pug_html;}function pug_attr(t,e,n,f){return e!==!1&&null!=e&&(e||"class"!==t&&"style"!==t)?e===!0?" "+(f?t:t+'="'+t+'"'):("function"==typeof e.toJSON&&(e=e.toJSON()),"string"==typeof e||(e=JSON.stringify(e),n||e.indexOf('"')===-1)?(n&&(e=pug_escape(e))," "+t+'="'+e+'"'):" "+t+"='"+e.replace(/'/g,"&#39;")+"'"):""}
function pug_escape(e){var a=""+e,t=pug_match_html.exec(a);if(!t)return e;var r,c,n,s="";for(r=t.index,c=0;r<a.length;r++){switch(a.charCodeAt(r)){case 34:n="&quot;";break;case 38:n="&amp;";break;case 60:n="&lt;";break;case 62:n="&gt;";break;default:continue}c!==r&&(s+=a.substring(c,r)),c=r+1,s+=n}return c!==r?s+a.substring(c,r):s}
var pug_match_html=/["&<>]/;
function pug_rethrow(n,e,r,t){if(!(n instanceof Error))throw n;if(!("undefined"==typeof window&&e||t))throw n.message+=" on line "+r,n;try{t=t||require("fs").readFileSync(e,"utf8")}catch(e){pug_rethrow(n,null,r)}var i=3,a=t.split("\n"),o=Math.max(r-i,0),h=Math.min(a.length,r+i),i=a.slice(o,h).map(function(n,e){var t=e+o+1;return(t==r?"  > ":"    ")+t+"| "+n}).join("\n");throw n.path=e,n.message=(e||"Pug")+":"+r+"\n"+i+"\n\n"+n.message,n}function csvFilesMixin(locals) {var pug_html = "", pug_mixins = {}, pug_interp;var pug_debug_filename, pug_debug_line;try {;pug_debug_line = 1;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FcsvFilesMixin.pug";








































































































































































































} catch (err) {pug_rethrow(err, pug_debug_filename, pug_debug_line);};return pug_html;}function pug_rethrow(n,e,r,t){if(!(n instanceof Error))throw n;if(!("undefined"==typeof window&&e||t))throw n.message+=" on line "+r,n;try{t=t||require("fs").readFileSync(e,"utf8")}catch(e){pug_rethrow(n,null,r)}var i=3,a=t.split("\n"),o=Math.max(r-i,0),h=Math.min(a.length,r+i),i=a.slice(o,h).map(function(n,e){var t=e+o+1;return(t==r?"  > ":"    ")+t+"| "+n}).join("\n");throw n.path=e,n.message=(e||"Pug")+":"+r+"\n"+i+"\n\n"+n.message,n}function empty(locals) {var pug_html = "", pug_mixins = {}, pug_interp;var pug_debug_filename, pug_debug_line;try {;pug_debug_line = 1;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Fempty.pug";
pug_html = pug_html + "\u003Cp\u003E";
;pug_debug_line = 2;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Fempty.pug";
pug_html = pug_html + "\u003Cspan\u003E";
;pug_debug_line = 2;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Fempty.pug";
pug_html = pug_html + "Disconnected\u003C\u002Fspan\u003E\u003C\u002Fp\u003E";} catch (err) {pug_rethrow(err, pug_debug_filename, pug_debug_line);};return pug_html;}function pug_escape(e){var a=""+e,t=pug_match_html.exec(a);if(!t)return e;var r,c,n,s="";for(r=t.index,c=0;r<a.length;r++){switch(a.charCodeAt(r)){case 34:n="&quot;";break;case 38:n="&amp;";break;case 60:n="&lt;";break;case 62:n="&gt;";break;default:continue}c!==r&&(s+=a.substring(c,r)),c=r+1,s+=n}return c!==r?s+a.substring(c,r):s}
var pug_match_html=/["&<>]/;
function pug_rethrow(n,e,r,t){if(!(n instanceof Error))throw n;if(!("undefined"==typeof window&&e||t))throw n.message+=" on line "+r,n;try{t=t||require("fs").readFileSync(e,"utf8")}catch(e){pug_rethrow(n,null,r)}var i=3,a=t.split("\n"),o=Math.max(r-i,0),h=Math.min(a.length,r+i),i=a.slice(o,h).map(function(n,e){var t=e+o+1;return(t==r?"  > ":"    ")+t+"| "+n}).join("\n");throw n.path=e,n.message=(e||"Pug")+":"+r+"\n"+i+"\n\n"+n.message,n}function error(locals) {var pug_html = "", pug_mixins = {}, pug_interp;var pug_debug_filename, pug_debug_line;try {;var locals_for_with = (locals || {});(function (desc) {;pug_debug_line = 1;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Ferror.pug";
pug_html = pug_html + "\u003Cdiv class=\"row\"\u003E";
;pug_debug_line = 2;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Ferror.pug";
pug_html = pug_html + "\u003Cdiv class=\"col-lg-6\"\u003E";
;pug_debug_line = 3;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Ferror.pug";
pug_html = pug_html + "\u003Ctext class=\"text-danger\" id=\"error_status\"\u003E";
;pug_debug_line = 3;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Ferror.pug";
pug_html = pug_html + (pug_escape(null == (pug_interp = `Error: ${desc.msg}`) ? "" : pug_interp)) + "\u003C\u002Ftext\u003E\u003C\u002Fdiv\u003E\u003C\u002Fdiv\u003E";}.call(this,"desc" in locals_for_with?locals_for_with.desc:typeof desc!=="undefined"?desc:undefined));} catch (err) {pug_rethrow(err, pug_debug_filename, pug_debug_line);};return pug_html;}function pug_escape(e){var a=""+e,t=pug_match_html.exec(a);if(!t)return e;var r,c,n,s="";for(r=t.index,c=0;r<a.length;r++){switch(a.charCodeAt(r)){case 34:n="&quot;";break;case 38:n="&amp;";break;case 60:n="&lt;";break;case 62:n="&gt;";break;default:continue}c!==r&&(s+=a.substring(c,r)),c=r+1,s+=n}return c!==r?s+a.substring(c,r):s}
var pug_match_html=/["&<>]/;
function pug_rethrow(n,e,r,t){if(!(n instanceof Error))throw n;if(!("undefined"==typeof window&&e||t))throw n.message+=" on line "+r,n;try{t=t||require("fs").readFileSync(e,"utf8")}catch(e){pug_rethrow(n,null,r)}var i=3,a=t.split("\n"),o=Math.max(r-i,0),h=Math.min(a.length,r+i),i=a.slice(o,h).map(function(n,e){var t=e+o+1;return(t==r?"  > ":"    ")+t+"| "+n}).join("\n");throw n.path=e,n.message=(e||"Pug")+":"+r+"\n"+i+"\n\n"+n.message,n}function es(locals) {var pug_html = "", pug_mixins = {}, pug_interp;var pug_debug_filename, pug_debug_line;try {;var locals_for_with = (locals || {});(function (desc) {;pug_debug_line = 1;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Fes.pug";
pug_html = pug_html + "\u003Cdiv class=\"row\"\u003E";
;pug_debug_line = 2;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Fes.pug";
pug_html = pug_html + "\u003Cdiv class=\"col-lg-6\"\u003E";
;pug_debug_line = 3;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Fes.pug";
pug_html = pug_html + "\u003Ctext id=\"es_status\"\u003E";
;pug_debug_line = 3;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Fes.pug";
pug_html = pug_html + (pug_escape(null == (pug_interp = `ES synchronized with ${desc.lastImportedCSV}`) ? "" : pug_interp)) + "\u003C\u002Ftext\u003E\u003C\u002Fdiv\u003E";
;pug_debug_line = 4;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Fes.pug";
pug_html = pug_html + "\u003Cdiv class=\"col-lg-6\"\u003E";
;pug_debug_line = 5;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Fes.pug";
pug_html = pug_html + "\u003Ctext id=\"es_count\"\u003E";
;pug_debug_line = 5;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Fes.pug";
pug_html = pug_html + (pug_escape(null == (pug_interp = `Total objects in ES: ${desc.count}`) ? "" : pug_interp)) + "\u003C\u002Ftext\u003E\u003C\u002Fdiv\u003E\u003C\u002Fdiv\u003E";
;pug_debug_line = 6;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Fes.pug";
pug_html = pug_html + "\u003Cdiv class=\"row\"\u003E";
;pug_debug_line = 7;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Fes.pug";
pug_html = pug_html + "\u003Cdiv class=\"col-lg-6\"\u003E";
;pug_debug_line = 8;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Fes.pug";
pug_html = pug_html + "\u003Cdiv class=\"input-group\"\u003E";
;pug_debug_line = 9;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Fes.pug";
pug_html = pug_html + "\u003Cinput class=\"form-control\" id=\"query\" type=\"text\" name=\"es_query\" placeholder=\"Search for...\"\u002F\u003E";
;pug_debug_line = 10;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Fes.pug";
pug_html = pug_html + "\u003Cspan class=\"input-group-btn\"\u003E";
;pug_debug_line = 11;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Fes.pug";
pug_html = pug_html + "\u003Cbutton class=\"btn btn-default\" id=\"query_button\" type=\"button\"\u003E";
;pug_debug_line = 11;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Fes.pug";
pug_html = pug_html + "Search\u003C\u002Fbutton\u003E\u003C\u002Fspan\u003E\u003C\u002Fdiv\u003E\u003C\u002Fdiv\u003E";
;pug_debug_line = 12;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Fes.pug";
pug_html = pug_html + "\u003Cdiv class=\"col-lg-6\"\u003E";
;pug_debug_line = 13;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Fes.pug";
pug_html = pug_html + "\u003Ca href=\"\u002Fapp\u002Fkibana\"\u003E";
;pug_debug_line = 13;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Fes.pug";
pug_html = pug_html + "View on Kibana\u003C\u002Fa\u003E\u003C\u002Fdiv\u003E\u003C\u002Fdiv\u003E";
;pug_debug_line = 14;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Fes.pug";
pug_html = pug_html + "\u003Cdiv class=\"row\"\u003E";
;pug_debug_line = 15;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Fes.pug";
pug_html = pug_html + "\u003Cdiv class=\"col-lg-12\"\u003E";
;pug_debug_line = 16;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Fes.pug";
pug_html = pug_html + "\u003Ctext id=\"search_results\"\u003E\u003C\u002Ftext\u003E\u003C\u002Fdiv\u003E\u003C\u002Fdiv\u003E";}.call(this,"desc" in locals_for_with?locals_for_with.desc:typeof desc!=="undefined"?desc:undefined));} catch (err) {pug_rethrow(err, pug_debug_filename, pug_debug_line);};return pug_html;}function pug_escape(e){var a=""+e,t=pug_match_html.exec(a);if(!t)return e;var r,c,n,s="";for(r=t.index,c=0;r<a.length;r++){switch(a.charCodeAt(r)){case 34:n="&quot;";break;case 38:n="&amp;";break;case 60:n="&lt;";break;case 62:n="&gt;";break;default:continue}c!==r&&(s+=a.substring(c,r)),c=r+1,s+=n}return c!==r?s+a.substring(c,r):s}
var pug_match_html=/["&<>]/;
function pug_rethrow(n,e,r,t){if(!(n instanceof Error))throw n;if(!("undefined"==typeof window&&e||t))throw n.message+=" on line "+r,n;try{t=t||require("fs").readFileSync(e,"utf8")}catch(e){pug_rethrow(n,null,r)}var i=3,a=t.split("\n"),o=Math.max(r-i,0),h=Math.min(a.length,r+i),i=a.slice(o,h).map(function(n,e){var t=e+o+1;return(t==r?"  > ":"    ")+t+"| "+n}).join("\n");throw n.path=e,n.message=(e||"Pug")+":"+r+"\n"+i+"\n\n"+n.message,n}function images(locals) {var pug_html = "", pug_mixins = {}, pug_interp;var pug_debug_filename, pug_debug_line;try {;var locals_for_with = (locals || {});(function (imageInfo) {;pug_debug_line = 1;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Fimages.pug";
pug_html = pug_html + "\u003Cbutton id=\"run-images\"\u003E";
;pug_debug_line = 1;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Fimages.pug";
pug_html = pug_html + "Run\u003C\u002Fbutton\u003E";
;pug_debug_line = 2;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Fimages.pug";
pug_html = pug_html + "\u003Cp\u003E";
;pug_debug_line = 3;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Fimages.pug";
pug_html = pug_html + "\u003Cspan\u003E";
;pug_debug_line = 3;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Fimages.pug";
pug_html = pug_html + "Status: \u003C\u002Fspan\u003E";
;pug_debug_line = 4;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Fimages.pug";
pug_html = pug_html + "\u003Cspan id=\"current-status\"\u003E\u003C\u002Fspan\u003E\u003C\u002Fp\u003E";
;pug_debug_line = 5;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Fimages.pug";
pug_html = pug_html + "\u003Cp\u003E";
;pug_debug_line = 6;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Fimages.pug";
pug_html = pug_html + "\u003Cspan\u003E";
;pug_debug_line = 6;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Fimages.pug";
pug_html = pug_html + "Running: \u003C\u002Fspan\u003E";
;pug_debug_line = 7;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Fimages.pug";
pug_html = pug_html + "\u003Cspan id=\"images-running\"\u003E";
;pug_debug_line = 7;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Fimages.pug";
pug_html = pug_html + (pug_escape(null == (pug_interp = imageInfo.isRunning) ? "" : pug_interp)) + "\u003C\u002Fspan\u003E\u003C\u002Fp\u003E";
;pug_debug_line = 8;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Fimages.pug";
pug_html = pug_html + "\u003Cp\u003E";
;pug_debug_line = 9;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Fimages.pug";
pug_html = pug_html + "\u003Cspan\u003E";
;pug_debug_line = 9;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Fimages.pug";
pug_html = pug_html + "Progress: \u003C\u002Fspan\u003E";
;pug_debug_line = 10;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Fimages.pug";
pug_html = pug_html + "\u003Cspan id=\"images-progress\"\u003E";
;pug_debug_line = 10;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Fimages.pug";
pug_html = pug_html + (pug_escape(null == (pug_interp = `${imageInfo.numImagesUploaded} of ${imageInfo.totalImagesToUpload} + images processed.`) ? "" : pug_interp)) + "\u003C\u002Fspan\u003E\u003C\u002Fp\u003E";
;pug_debug_line = 11;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Fimages.pug";
pug_html = pug_html + "\u003Cp\u003E";
;pug_debug_line = 11;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Fimages.pug";
pug_html = pug_html + " ";
;pug_debug_line = 12;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Fimages.pug";
pug_html = pug_html + "\u003Cspan\u003E";
;pug_debug_line = 12;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Fimages.pug";
pug_html = pug_html + "Images Tiled: \u003C\u002Fspan\u003E";
;pug_debug_line = 13;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Fimages.pug";
pug_html = pug_html + "\u003Cspan id=\"images-tiled\"\u003E";
;pug_debug_line = 13;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Fimages.pug";
pug_html = pug_html + (pug_escape(null == (pug_interp = imageInfo.numTiledImages) ? "" : pug_interp)) + "\u003C\u002Fspan\u003E";
;pug_debug_line = 14;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Fimages.pug";
pug_html = pug_html + "\u003Cspan\u003E";
;pug_debug_line = 14;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Fimages.pug";
pug_html = pug_html + ", Raw Images Uploaded: \u003C\u002Fspan\u003E";
;pug_debug_line = 15;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Fimages.pug";
pug_html = pug_html + "\u003Cspan id=\"images-uploaded\"\u003E";
;pug_debug_line = 15;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Fimages.pug";
pug_html = pug_html + (pug_escape(null == (pug_interp = imageInfo.numRawImages) ? "" : pug_interp)) + "\u003C\u002Fspan\u003E\u003C\u002Fp\u003E";}.call(this,"imageInfo" in locals_for_with?locals_for_with.imageInfo:typeof imageInfo!=="undefined"?imageInfo:undefined));} catch (err) {pug_rethrow(err, pug_debug_filename, pug_debug_line);};return pug_html;}function pug_rethrow(n,e,r,t){if(!(n instanceof Error))throw n;if(!("undefined"==typeof window&&e||t))throw n.message+=" on line "+r,n;try{t=t||require("fs").readFileSync(e,"utf8")}catch(e){pug_rethrow(n,null,r)}var i=3,a=t.split("\n"),o=Math.max(r-i,0),h=Math.min(a.length,r+i),i=a.slice(o,h).map(function(n,e){var t=e+o+1;return(t==r?"  > ":"    ")+t+"| "+n}).join("\n");throw n.path=e,n.message=(e||"Pug")+":"+r+"\n"+i+"\n\n"+n.message,n}function index(locals) {var pug_html = "", pug_mixins = {}, pug_interp;var pug_debug_filename, pug_debug_line;try {;pug_debug_line = 1;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Findex.pug";
pug_html = pug_html + "\u003C!DOCTYPE html\u003E";
;pug_debug_line = 2;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Findex.pug";
pug_html = pug_html + "\u003Chtml\u003E";
;pug_debug_line = 3;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Findex.pug";
pug_html = pug_html + "\u003Chead\u003E";
;pug_debug_line = 4;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Findex.pug";
pug_html = pug_html + "\u003Cmeta charset=\"UTF-8\"\u003E";
;pug_debug_line = 5;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Findex.pug";
pug_html = pug_html + "\u003Cmeta name=\"viewport\" content=\"maximum-scale=1,width=device-width,initial-scale=1,user-scalable=0\"\u003E";
;pug_debug_line = 6;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Findex.pug";
pug_html = pug_html + "\u003Ctitle\u003E";
;pug_debug_line = 6;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Findex.pug";
pug_html = pug_html + "Barnes Collection Scripts Dashboard\u003C\u002Ftitle\u003E";
;pug_debug_line = 7;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Findex.pug";
pug_html = pug_html + "\u003Clink href=\"https:\u002F\u002Fcdnjs.cloudflare.com\u002Fajax\u002Flibs\u002Ftwitter-bootstrap\u002F3.3.7\u002Fcss\u002Fbootstrap.min.css\" rel=\"stylesheet\"\u003E";
;pug_debug_line = 8;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Findex.pug";
pug_html = pug_html + "\u003Clink href=\"https:\u002F\u002Fcdnjs.cloudflare.com\u002Fajax\u002Flibs\u002Fdatatables\u002F1.10.13\u002Fcss\u002FdataTables.bootstrap.css\" rel=\"stylesheet\"\u003E";
;pug_debug_line = 9;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Findex.pug";
pug_html = pug_html + "\u003Cscript src=\"https:\u002F\u002Fcdnjs.cloudflare.com\u002Fajax\u002Flibs\u002Fjquery\u002F3.1.1\u002Fjquery.min.js\"\u003E\u003C\u002Fscript\u003E";
;pug_debug_line = 10;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Findex.pug";
pug_html = pug_html + "\u003Cscript src=\"https:\u002F\u002Fcdnjs.cloudflare.com\u002Fajax\u002Flibs\u002Fmoment.js\u002F2.17.1\u002Fmoment.min.js\"\u003E\u003C\u002Fscript\u003E";
;pug_debug_line = 11;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Findex.pug";
pug_html = pug_html + "\u003Cscript src=\"https:\u002F\u002Fcdnjs.cloudflare.com\u002Fajax\u002Flibs\u002Fsocket.io\u002F1.7.3\u002Fsocket.io.min.js\"\u003E\u003C\u002Fscript\u003E";
;pug_debug_line = 12;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Findex.pug";
pug_html = pug_html + "\u003Cscript src=\"scripts\u002Fdashboard.js\"\u003E\u003C\u002Fscript\u003E";
;pug_debug_line = 13;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Findex.pug";
pug_html = pug_html + "\u003Cscript src=\"scripts\u002Ftemplates.js\"\u003E\u003C\u002Fscript\u003E\u003C\u002Fhead\u003E";
;pug_debug_line = 14;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Findex.pug";
pug_html = pug_html + "\u003Cbody\u003E";
;pug_debug_line = 15;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Findex.pug";
pug_html = pug_html + "\u003Ch1\u003E";
;pug_debug_line = 15;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Findex.pug";
pug_html = pug_html + "Dashboard\u003C\u002Fh1\u003E";
;pug_debug_line = 16;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Findex.pug";
pug_html = pug_html + "\u003Csection\u003E";
;pug_debug_line = 17;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Findex.pug";
pug_html = pug_html + "\u003Cdiv class=\"panel panel-default\"\u003E";
;pug_debug_line = 18;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Findex.pug";
pug_html = pug_html + "\u003Cdiv class=\"panel-heading\"\u003E";
;pug_debug_line = 19;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Findex.pug";
pug_html = pug_html + "\u003Ch2 class=\"panel-title\"\u003E";
;pug_debug_line = 19;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Findex.pug";
pug_html = pug_html + "TMS to CSV Exporter\u003C\u002Fh2\u003E\u003C\u002Fdiv\u003E";
;pug_debug_line = 20;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Findex.pug";
pug_html = pug_html + "\u003Cdiv class=\"panel-body\" id=\"tmsExportPanelBody\"\u003E";
;pug_debug_line = 21;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Findex.pug";
pug_html = pug_html + "\u003Cp\u003E";
;pug_debug_line = 22;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Findex.pug";
pug_html = pug_html + "\u003Cspan\u003E";
;pug_debug_line = 22;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Findex.pug";
pug_html = pug_html + "Loading...\u003C\u002Fspan\u003E\u003C\u002Fp\u003E\u003C\u002Fdiv\u003E\u003C\u002Fdiv\u003E\u003C\u002Fsection\u003E";
;pug_debug_line = 23;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Findex.pug";
pug_html = pug_html + "\u003Csection\u003E";
;pug_debug_line = 24;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Findex.pug";
pug_html = pug_html + "\u003Cdiv class=\"panel panel-default\"\u003E";
;pug_debug_line = 25;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Findex.pug";
pug_html = pug_html + "\u003Cdiv class=\"panel-heading\"\u003E";
;pug_debug_line = 26;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Findex.pug";
pug_html = pug_html + "\u003Ch2 class=\"panel-title\"\u003E";
;pug_debug_line = 26;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Findex.pug";
pug_html = pug_html + "Exported CSV files\u003C\u002Fh2\u003E\u003C\u002Fdiv\u003E";
;pug_debug_line = 27;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Findex.pug";
pug_html = pug_html + "\u003Cdiv class=\"panel-body\" id=\"csvFilesPanelBody\"\u003E";
;pug_debug_line = 28;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Findex.pug";
pug_html = pug_html + "\u003Cp\u003E";
;pug_debug_line = 29;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Findex.pug";
pug_html = pug_html + "\u003Cspan\u003E";
;pug_debug_line = 29;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Findex.pug";
pug_html = pug_html + "Loading...\u003C\u002Fspan\u003E\u003C\u002Fp\u003E\u003C\u002Fdiv\u003E\u003C\u002Fdiv\u003E\u003C\u002Fsection\u003E";
;pug_debug_line = 30;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Findex.pug";
pug_html = pug_html + "\u003Csection\u003E";
;pug_debug_line = 31;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Findex.pug";
pug_html = pug_html + "\u003Cdiv class=\"panel panel-default\"\u003E";
;pug_debug_line = 32;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Findex.pug";
pug_html = pug_html + "\u003Cdiv class=\"panel-heading\"\u003E";
;pug_debug_line = 33;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Findex.pug";
pug_html = pug_html + "\u003Ch2 class=\"panel-title\"\u003E";
;pug_debug_line = 33;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Findex.pug";
pug_html = pug_html + "Elasticsearch\u003C\u002Fh2\u003E\u003C\u002Fdiv\u003E";
;pug_debug_line = 34;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Findex.pug";
pug_html = pug_html + "\u003Cdiv class=\"panel-body\" id=\"esPanelBody\"\u003E";
;pug_debug_line = 35;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Findex.pug";
pug_html = pug_html + "\u003Cp\u003E";
;pug_debug_line = 36;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Findex.pug";
pug_html = pug_html + "\u003Cspan\u003E";
;pug_debug_line = 36;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Findex.pug";
pug_html = pug_html + "Loading...\u003C\u002Fspan\u003E\u003C\u002Fp\u003E\u003C\u002Fdiv\u003E\u003C\u002Fdiv\u003E\u003C\u002Fsection\u003E";
;pug_debug_line = 37;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Findex.pug";
pug_html = pug_html + "\u003Csection\u003E";
;pug_debug_line = 38;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Findex.pug";
pug_html = pug_html + "\u003Cdiv class=\"panel panel-default\"\u003E";
;pug_debug_line = 39;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Findex.pug";
pug_html = pug_html + "\u003Cdiv class=\"panel-heading\"\u003E";
;pug_debug_line = 40;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Findex.pug";
pug_html = pug_html + "\u003Ch2 class=\"panel-title\"\u003E";
;pug_debug_line = 40;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Findex.pug";
pug_html = pug_html + "Image Processing\u003C\u002Fh2\u003E\u003C\u002Fdiv\u003E";
;pug_debug_line = 41;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Findex.pug";
pug_html = pug_html + "\u003Cdiv class=\"panel-body\" id=\"imageProcessingPanelBody\"\u003E";
;pug_debug_line = 42;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Findex.pug";
pug_html = pug_html + "\u003Cp\u003E";
;pug_debug_line = 43;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Findex.pug";
pug_html = pug_html + "\u003Cspan\u003E";
;pug_debug_line = 43;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002Findex.pug";
pug_html = pug_html + "Loading...\u003C\u002Fspan\u003E\u003C\u002Fp\u003E\u003C\u002Fdiv\u003E\u003C\u002Fdiv\u003E\u003C\u002Fsection\u003E\u003C\u002Fbody\u003E\u003C\u002Fhtml\u003E";} catch (err) {pug_rethrow(err, pug_debug_filename, pug_debug_line);};return pug_html;}function pug_escape(e){var a=""+e,t=pug_match_html.exec(a);if(!t)return e;var r,c,n,s="";for(r=t.index,c=0;r<a.length;r++){switch(a.charCodeAt(r)){case 34:n="&quot;";break;case 38:n="&amp;";break;case 60:n="&lt;";break;case 62:n="&gt;";break;default:continue}c!==r&&(s+=a.substring(c,r)),c=r+1,s+=n}return c!==r?s+a.substring(c,r):s}
var pug_match_html=/["&<>]/;
function pug_rethrow(n,e,r,t){if(!(n instanceof Error))throw n;if(!("undefined"==typeof window&&e||t))throw n.message+=" on line "+r,n;try{t=t||require("fs").readFileSync(e,"utf8")}catch(e){pug_rethrow(n,null,r)}var i=3,a=t.split("\n"),o=Math.max(r-i,0),h=Math.min(a.length,r+i),i=a.slice(o,h).map(function(n,e){var t=e+o+1;return(t==r?"  > ":"    ")+t+"| "+n}).join("\n");throw n.path=e,n.message=(e||"Pug")+":"+r+"\n"+i+"\n\n"+n.message,n}function tmsToCsv(locals) {var pug_html = "", pug_mixins = {}, pug_interp;var pug_debug_filename, pug_debug_line;try {;var locals_for_with = (locals || {});(function (info, moment) {;pug_debug_line = 1;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FtmsToCsv.pug";
pug_html = pug_html + "\u003Cp\u003E";
;pug_debug_line = 2;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FtmsToCsv.pug";
pug_html = pug_html + "\u003Cspan\u003E";
;pug_debug_line = 2;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FtmsToCsv.pug";
pug_html = pug_html + "Script last ran: \u003C\u002Fspan\u003E";
;pug_debug_line = 3;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FtmsToCsv.pug";
pug_html = pug_html + "\u003Cspan id=\"lastRan\"\u003E";
;pug_debug_line = 3;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FtmsToCsv.pug";
pug_html = pug_html + (pug_escape(null == (pug_interp = moment(info.startTime).toString()) ? "" : pug_interp)) + "\u003C\u002Fspan\u003E\u003C\u002Fp\u003E";
;pug_debug_line = 4;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FtmsToCsv.pug";
pug_html = pug_html + "\u003Cp\u003E";
;pug_debug_line = 5;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FtmsToCsv.pug";
pug_html = pug_html + "\u003Cspan\u003E";
;pug_debug_line = 5;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FtmsToCsv.pug";
pug_html = pug_html + "Script last completed: \u003C\u002Fspan\u003E";
;pug_debug_line = 6;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FtmsToCsv.pug";
pug_html = pug_html + "\u003Cspan id=\"lastCompleted\"\u003E";
;pug_debug_line = 6;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FtmsToCsv.pug";
pug_html = pug_html + (pug_escape(null == (pug_interp = moment(info.completeTime).toString()) ? "" : pug_interp)) + "\u003C\u002Fspan\u003E\u003C\u002Fp\u003E";
;pug_debug_line = 7;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FtmsToCsv.pug";
pug_html = pug_html + "\u003Cp\u003E";
;pug_debug_line = 8;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FtmsToCsv.pug";
pug_html = pug_html + "\u003Cspan\u003E";
;pug_debug_line = 8;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FtmsToCsv.pug";
pug_html = pug_html + "Script running: \u003C\u002Fspan\u003E";
;pug_debug_line = 9;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FtmsToCsv.pug";
pug_html = pug_html + "\u003Cspan id=\"active\"\u003E";
;pug_debug_line = 9;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FtmsToCsv.pug";
pug_html = pug_html + (pug_escape(null == (pug_interp = info.active) ? "" : pug_interp)) + "\u003C\u002Fspan\u003E\u003C\u002Fp\u003E";
;pug_debug_line = 10;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FtmsToCsv.pug";
pug_html = pug_html + "\u003Cp\u003E";
;pug_debug_line = 11;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FtmsToCsv.pug";
pug_html = pug_html + "\u003Cspan\u003E";
;pug_debug_line = 11;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FtmsToCsv.pug";
pug_html = pug_html + "Progress: \u003C\u002Fspan\u003E";
;pug_debug_line = 12;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FtmsToCsv.pug";
pug_html = pug_html + "\u003Cspan id=\"progress\"\u003E";
;pug_debug_line = 12;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FtmsToCsv.pug";
pug_html = pug_html + (pug_escape(null == (pug_interp = `${info.processed} of ${info.total} objects processed`) ? "" : pug_interp)) + "\u003C\u002Fspan\u003E\u003C\u002Fp\u003E";
;pug_debug_line = 13;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FtmsToCsv.pug";
pug_html = pug_html + "\u003Cp\u003E";
;pug_debug_line = 14;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FtmsToCsv.pug";
pug_html = pug_html + "\u003Cspan\u003E";
;pug_debug_line = 14;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FtmsToCsv.pug";
pug_html = pug_html + "Listening for updates on port: \u003C\u002Fspan\u003E";
;pug_debug_line = 15;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FtmsToCsv.pug";
pug_html = pug_html + "\u003Cspan id=\"port\"\u003E";
;pug_debug_line = 15;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FtmsToCsv.pug";
pug_html = pug_html + (pug_escape(null == (pug_interp = 3000) ? "" : pug_interp)) + "\u003C\u002Fspan\u003E\u003C\u002Fp\u003E";
;pug_debug_line = 16;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FtmsToCsv.pug";
pug_html = pug_html + "\u003Cbutton id=\"tmsRun\"\u003E";
;pug_debug_line = 16;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FtmsToCsv.pug";
pug_html = pug_html + "Run Script\u003C\u002Fbutton\u003E";
;pug_debug_line = 17;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FtmsToCsv.pug";
pug_html = pug_html + "\u003Cbutton id=\"tmsCancel\"\u003E";
;pug_debug_line = 17;pug_debug_filename = "src\u002Fdashboard\u002Fviews\u002FtmsToCsv.pug";
pug_html = pug_html + "Cancel Script\u003C\u002Fbutton\u003E";}.call(this,"info" in locals_for_with?locals_for_with.info:typeof info!=="undefined"?info:undefined,"moment" in locals_for_with?locals_for_with.moment:typeof moment!=="undefined"?moment:undefined));} catch (err) {pug_rethrow(err, pug_debug_filename, pug_debug_line);};return pug_html;}