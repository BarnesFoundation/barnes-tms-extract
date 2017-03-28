const page = require('webpage').create();
const credentials = require('../credentials.json');
const url = credentials.barnesImagesUrl;
const fs = require('fs');
var cwd = fs.absolute(".");

phantom.onError = function(msg, trace) {
  var msgStack = ['PHANTOM ERROR: ' + msg];
  if (trace && trace.length) {
    msgStack.push('TRACE:');
    trace.forEach(function(t) {
      msgStack.push(' -> ' + (t.file || t.sourceURL) + ': ' + t.line + (t.function ? ' (in function ' + t.function +')' : ''));
    });
  }
  console.error(msgStack.join('\n'));
  phantom.exit(1);
}

page.onError = function(msg, trace) {

  var msgStack = ['ERROR: ' + msg];

  if (trace && trace.length) {
    msgStack.push('TRACE:');
    trace.forEach(function(t) {
      msgStack.push(' -> ' + t.file + ': ' + t.line + (t.function ? ' (in function "' + t.function +'")' : ''));
    });
  }

  console.error(msgStack.join('\n'));

};

page.onConsoleMessage = function(msg, lineNum, sourceId) {
  console.log('CONSOLE: ' + msg + ' (from line #' + lineNum + ' in "' + sourceId + '")');
};

page.open(url, function (status) {
  page.includeJs("https://ajax.googleapis.com/ajax/libs/jquery/3.1.0/jquery.min.js", function() {
    var imageNames = page.evaluate(function() {
      var imageNames = [];
      $('a').each(function() {
        // console.log($(this).text());
        var data = {
          name: $(this).children('tt').text()
        }
        imageNames.push(data);
      });
      return imageNames;
    });
    var data = {
      images: imageNames
    };
    fs.write('../names.json', JSON.stringify(data));
    phantom.exit();
  });
  // imageNames = Array.prototype.slice.call(imageNames);
  // imageNames.forEach(function(img) {
  //   console.log(img);
  // });
});