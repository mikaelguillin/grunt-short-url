# grunt-short-url [![Build Status](https://travis-ci.org/mikaelguillin/grunt-short-url.svg?branch=master)](https://travis-ci.org/mikaelguillin/grunt-short-url)

> Simple grunt plugin for shortening URLs in HTML files

## Getting Started
This plugin requires Grunt `~0.4.5`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-short-url --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-short-url');
```

## The "shorturl" task

This grunt task uses bitly's api for shortening URLs.

### Options

#### bitly
Type: `Object`
```
{
  username: 'your username',
  password: 'your password',
  client_id: 'your client id',
  client_secret: 'your client secret'
}
```

If you know your access token, you can add `access_token: 'your access token'` and remove the username and password properties.


#### html
Type: `Object`  
Default: 
```
{
  'a[href]': 'href',
  'img[src]': 'src',
  'link[rel=stylesheet]': 'href',
  'script[src]': 'src'
}
```

Any HTML element matching these CSS selectors will have their attribute, specified in value, shortened.

### Usage Examples

```js
grunt.initConfig({
  shorturl: {
    yourTarget: {
      options:
      {
        bitly: {
          username: 'your username',
          password: 'your password',
          client_id: 'your client id',
          client_secret: 'your client secret'
        },
        html: {
          'a[href]': 'href',
          'img[src]': 'src',
        }
      },

      // HTML files
      files:
      [{
        src: 'src/*.html',
        dest: 'dest/'
      }]
    }
  }
});
```
