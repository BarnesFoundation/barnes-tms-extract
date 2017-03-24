const page = require('webpage').create();
const credentials = require('./credentials.json');
const url = credentials.barnesImagesUrl;
const fs = require('fs');

page.open(url, function (status) {
  page.includeJs("http://ajax.googleapis.com/ajax/libs/jquery/3.1.0/jquery.min.js", function() {
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
    fs.write('names.json', JSON.stringify(data));
    phantom.exit();
  });
  // imageNames = Array.prototype.slice.call(imageNames);
  // imageNames.forEach(function(img) {
  //   console.log(img);
  // });
});