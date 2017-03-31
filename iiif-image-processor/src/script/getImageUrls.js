const page = require('webpage').create();
const fs = require('fs');
const system = require('system');
const args = system.args;
const url = system.args[1];
const outputPath = system.args[2];

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
      var retVal = [];
      $('tr').each(function(idx) {
        if (idx > 0) {
          try {
            var tds = $(this).children('td');
            if (tds.length === 3) {
              var data = {
                name: $($(tds[0]).children('a')).children('tt').text().trim(),
                size: $(tds[1]).children('tt').text().trim(),
                modified: $(tds[2]).children('tt').text().trim()
              };
              retVal.push(data);
            }
          } catch (e) { }
        }
      });
      return retVal;
    });

    var data = {
      images: imageNames
    };
    fs.write(outputPath, JSON.stringify(data));
    phantom.exit();
  });
});