/*
 * grunt-short-url
 * https://github.com/mikaelguillin/grunt-short-url
 *
 * Copyright (c) 2014 Mikael Guillin
 * Licensed under the MIT license.
 */

 'use strict';

 var url = require('short-url');
 var cheerio = require('cheerio');

 var htmlDefaults = {
  'img[src]': 'src',
  'link[rel=stylesheet]': 'href',
  'script[src]': 'src',
  'a[href]': 'href'
 };

 var defaults = {
  html: htmlDefaults
 };

module.exports = function(grunt) {

  grunt.registerMultiTask('shorturl', 'URL shortener', function() {

    var done = this.async();
    var options = this.options(defaults);

    this.files.forEach(function(file) {

      var srcFile = file.src;
      var destFile = file.dest;

      if (typeof srcFile !== 'string') {
        if (srcFile.length > 1) {
          grunt.log.warn('Multiple source files supplied for single destination, only the first will be used.');
        }
        srcFile = srcFile[0];
      }
      if (!grunt.file.exists(srcFile)) {
        return grunt.log.warn("Source file \"" + (path.resolve(srcFile)) + "\" not found.");
      }
      else {

        var $ = cheerio.load(grunt.file.read(srcFile));
        var html = options.html;
        var elemsNb = $(Object.keys(html).toString()).length;
        var elemsShortened = 0;

        for(var key in html) {
          $(key).each(function() {

            var elem = $(this);
            var attrVal = html[key];
            var attribute = elem.attr(attrVal);

            // Shortening of URLs
            url.shorten(attribute, function(err, url) {

              elemsShortened++;
              elem.attr(attrVal, url);

              if(elemsShortened === elemsNb) {
                grunt.log.writeln(elemsShortened + ' URLs shortened.');
                grunt.file.write(destFile, $.html());
                grunt.log.writeln('File "' + destFile + '" created.');
                done();
              }
            });
          });
        }
      }
    });
  });
};
