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
var Cache = require('mem-cache');

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
        var elemsTagsShortened = 0;
            var cache = new Cache();
        var bitly = new Bitly({
          client_id: options.bitly.client_id,
          client_secret: options.bitly.client_secret
        });

        // Shortens for each selector
        var shortenElemTypes = function(elemType, callbackType) {

          var elemsTags = $(elemType).toArray();
          var elemsTagsNb = elemsTags.length;
          var i = 0;

          async.eachLimit(elemsTags, 5, function(elemTag, callbackTags) {

            var $elemTag = $(elemTag);
            var attrType = html[elemType];
            var attrVal = $elemTag.attr(attrType);

            // If URL is already shortened
            if(cache.get(attrVal)) {
              $elemTag.attr(attrType, cache.get(attrVal));

              elemsTagsShortened++;
              i++;

                callbackTags();

                if(i === elemsTagsNb) {
                callbackType();
              }
            }
            // Otherwise, bitly shortens URL
            else {

              bitly.shortenLink(attrVal, function(err, response) {

                  if(err) {
                    grunt.fail.fatal(err);
                  }

                  var response = JSON.parse(response);
                  var bitlyURL = response.data.url;
                  var longUrl = response.data.long_url;

                  if(bitlyURL) {
                    cache.set(longUrl, bitlyURL);
                    $elemTag.attr(attrType, bitlyURL);
                    elemsTagsShortened++;
                  }

                  i++;

                  callbackTags();

                  if(i === elemsTagsNb) {
                  callbackType();
                }
                });
              }
          });
        };

        // Init shortenings
        var initShortenings = function() {

          for(var key in html) {
            if($(key).length > 0) {
              htmlArray.push(key); 
            }
          }

          async.eachSeries(htmlArray, function(elem, callback) {

            shortenElemTypes(elem, callback);

          }, function(err) {

            if(err) {
              grunt.fail.fatal(err);
            }

            grunt.log.writeln(elemsTagsShortened + ' URLs shortened');
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
