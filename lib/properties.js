/*
 * properties
 * http://www.up.com
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
        var splitVal = j.split('=');
        objs[splitVal[0].trim()] = splitVal[1].trim();
    }
  };
  
  for (var i=0; i < arguments.length; i++) {
      var data = fs.readFileSync(arguments[i], 'utf-8');
      var items = data.split('\r\n');
      items.forEach(makeKeys);
  }

  return {
    get: function(key) {
        var self = this;
        var rawValue = objs[key];
        if (rawValue) {
            return rawValue
              .replace(/\\\\/g, '\\')
              .replace(/\$\{([A-Za-z0-9\.]*)\}/g, function(match) {
                  return self.get(match.substring(2, match.length - 1));
            });
        }
    },
    set: function(key, value) {
      objs[key] = value;
    }
  };
};
