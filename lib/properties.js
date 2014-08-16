/*
 * properties
 *
 * Copyright (c) 2013 Matt Steele
 * Licensed under the MIT license.
 */

 'use strict';
 var fs = require('fs');

 exports.of = function() {
    var objs = {};
    var makeKeys = function(j) {
    if(j && j.indexOf('#') !== 0) {
        var splitIndex = j.indexOf('=');
        var key = j.substring(0, splitIndex);
        var value = j.substring(splitIndex + 1);
        objs[key.trim()] = value.trim();
    }
  };
  
  /* adds a file to the properties */
  var addFile = function(file) {
    var data = fs.readFileSync(file, 'utf-8');
    var items = data.split(/\r?\n/);
    items.forEach(makeKeys);
  };
     
  for (var i=0; i < arguments.length; i++) {
    addFile(arguments[i]);
  }
  
  var get = function(key) {
      if (objs.hasOwnProperty(key)) {
          return typeof objs[key] === 'undefined' ? '' : interpolate(objs[key]);
      }
      return undefined;
  };
  var set = function(key, value) {
    objs[key] = value;
  };
  var interpolate = function(s) {
    return s
    .replace(/\\\\/g, '\\')
    .replace(/\$\{([A-Za-z0-9\.]*)\}/g, function(match) {
      return get(match.substring(2, match.length - 1));
    });
  };
     
  /* gets all the keys of the property file */
  var getKeys = function () {
    var keys = [];
    for (var key in objs) {
      keys.push(key);
    }
    return keys;
  };
     
  /* reset the properties */
  var reset = function() {
    objs = {};
  };
     
  return {
    get: get,
    set: set,
    interpolate: interpolate,
    getKeys : getKeys,
    reset : reset,
    addFile : addFile
  };
};