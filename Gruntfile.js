/*
 * grunt-short-url
 * https://github.com/mikaelguillin/grunt-short-url
 *
 * Copyright (c) 2014 Mikael Guillin
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  require('time-grunt')(grunt);

  // Project configuration.
  grunt.initConfig({
    jshint: {
      all: [
        'Gruntfile.js',
        'tasks/*.js',
        '<%= nodeunit.tests %>'
      ],
      options: {
        jshintrc: '.jshintrc'
      }
    },

    // Before generating any new files, remove any previously-created files.
    clean: {
      tests: ['tmp']
    },

    // Configuration to be run (and then tested).
    shorturl: {
      options: {
        // Use your own keys
        bitly: {
          client_id: '824bf51216575337a41a561b28cbd30e74da7750',
          client_secret: '35b8ffe1602dbc431743fa65009d7065abe67af9',
          access_token: '673f19deaa01e0939b783b56ff783a25dc2ce72b'
        }
      },
      default_options: {
        files: {
          'tmp/default_options.html': ['test/fixtures/default_options.html']
        }
      },
      custom_options: {
        options: {
          html: {
            'a[href]': 'href',
            'img[src]': 'src'
          }
        },
        files: {
          'tmp/custom_options.html': ['test/fixtures/custom_options.html']
        }
      }
    },

    // Unit tests.
    nodeunit: {
      tests: ['test/*_test.js']
    }

  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');

  // Whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask('test', ['clean', 'shorturl', 'nodeunit']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint', 'test']);

};
