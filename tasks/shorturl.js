/*
 * grunt-short-url
 * https://github.com/mikaelguillin/grunt-short-url
 *
 * Copyright (c) 2014 Mikael Guillin
 * Licensed under the MIT license.
 */

'use strict';

var async = require('async');
var cheerio = require('cheerio');
var Bitly = require('node-bitlyapi');

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

  grunt.registerMultiTask('shorturl', 'URLs shortener', function() {

    var done = this.async();
    var options = this.options(defaults);

    if(!options.bitly) {
      grunt.fail.warn('Please specify bitly params.');
    }

    if(!options.bitly.access_token && (!options.bitly.username || !options.bitly.password)) {
      grunt.fail.warn('Please specify an access token or username and password.');
    }

    if(!options.bitly.client_id || !options.bitly.client_secret) {
      grunt.fail.warn('Please specify a client id and client secret.');
    }

    this.files.forEach(function(file) {

      var srcFile = file.src;
      var destFile = file.dest;

      if(typeof srcFile !== 'string') {
        if (srcFile.length > 1) {
          grunt.log.warn('Multiple source files supplied for single destination, only the first will be used.');
        }
        srcFile = srcFile[0];
      }
      if(!grunt.file.exists(srcFile)) {
        return grunt.log.warn("Source file " + srcFile + " not found.");
      }
      else {

        var $ = cheerio.load(grunt.file.read(srcFile));
        var html = options.html;
        var htmlArray = [];
        var urlsShortened = 0;
        var bitly = new Bitly({
          client_id: options.bitly.client_id,
          client_secret: options.bitly.client_secret
        });

        // Shortens for each selector
        var shortenSelector = function(selector, callbackSelector) {

          var $selector = $(selector);
          var attrType = html[selector];
          var urls = [];

          // Fetches urls to shorten
          $selector.each(function() {

            var elem = $(this);
            var attrVal = elem.attr(attrType);

            if(urls.indexOf(attrVal) === -1) {
              urls.push(attrVal);
            }
          });

          // Shortens each urls
          async.eachLimit(urls, 5, function(url, callbackLoop) {

            bitly.shortenLink(url, function(err, response) {

              if(err) {
                grunt.fail.fatal(err);
              }

              var response = JSON.parse(response);
              var bitlyURL = response.data.url;
              var longUrl = response.data.long_url;

              if(bitlyURL) {
                urlsShortened++;

                // Filters elements by their long url
                $selector.filter(function() {

                  return $(this).attr(attrType) === longUrl;
                
                })
                // and replaces it by short url
                .attr(attrType, bitlyURL);
              }

              callbackLoop();
            });

          }, function(err) {

            if(err) {
              grunt.fail.fatal(err);
            }

            callbackSelector();
          });
        };

        // Init shortenings
        var initShortenings = function() {

          // Stores only existing elements in htmlArray
          for(var key in html) {
            if($(key).length > 0) {
              htmlArray.push(key);
            }
          }

          // Shortening for each selector
          async.eachSeries(htmlArray, function(selector, callback) {

            shortenSelector(selector, callback);

          },function(err) {

            if(err) {
              grunt.fail.fatal(err);
            }

            grunt.log.writeln(urlsShortened + ' URLs shortened');
            grunt.file.write(destFile, $.html());
            grunt.log.writeln('File "' + destFile + '" created.');
            done();
          });
        };

        // Bitly authentication
        if(options.bitly.access_token) {

          bitly.setAccessToken(options.bitly.access_token);

          initShortenings();

        } else {

          bitly.authenticate(options.bitly.username, options.bitly.password, function(err, access_token) {

            if(err) {
              grunt.fail.fatal(err);
            }

            bitly.setAccessToken(access_token);

            initShortenings();
          });
        }
      }
    });
  });
};
