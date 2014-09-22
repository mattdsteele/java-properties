/*
 * properties
 *
 * Copyright (c) 2013 Matt Steele
 * Licensed under the MIT license.
 */

'use strict';
var fs = require('fs');
var utils = require('util');

// Construct a PropertiesFile class to handle all properties of a specifice file or group of file
var PropertiesFile = function () {
    this.objs = {};
};

PropertiesFile.prototype.makeKeys = function (line) {
//    console.log('Into makeKeys this is '+utils.inspect(this));
    if (line && line.indexOf('#') !== 0) {
        var splitIndex = line.indexOf('=');
        var key = line.substring(0, splitIndex).trim();
        var value = line.substring(splitIndex + 1).trim();
        // if keys already exists ...
        if (this.objs.hasOwnProperty(key)) {
            // if it is already an Array
            if (Array.isArray(this.objs[key])) {
                // just push the new value
                this.objs[key].push(value);
            } else {
                // transform the value into Array
                var oldValue = this.objs[key];
                this.objs[key] = [oldValue, value];
            }
        } else {
            // the key does not exists
            this.objs[key] = value;
        }
    }
};

PropertiesFile.prototype.addFile = function (file) {
//    console.log('Into addFile this is '+utils.inspect(this));
    var data = fs.readFileSync(file, 'utf-8');
    var items = data.split(/\r?\n/);
    var me = this;
    items.forEach(function(line) { 
        me.makeKeys(line);
    });
};

PropertiesFile.prototype.of = function () {
//    console.log('Into of arguments is '+utils.inspect(arguments));
    for (var i = 0; i < arguments.length; i++) {
        console.log('Adding file '+utils.inspect(arguments[i]));
        this.addFile(arguments[i]);
    }
};

PropertiesFile.prototype.get = function (key) {
    if (this.objs.hasOwnProperty(key)) {
        if (Array.isArray(this.objs[key])) {
            var ret = [];
            for (var i = 0; i < this.objs[key].length; i++) {
                ret[i] = this.interpolate(this.objs[key][i]);
            }
            return ret;
        } else {
            return typeof this.objs[key] === 'undefined' ? '' : this.interpolate(this.objs[key]);
        }
    }
    return undefined;
};

PropertiesFile.prototype.set = function (key, value) {
    this.objs[key] = value;
};

PropertiesFile.prototype.interpolate = function (s) {
    var moi=this;
    return s
        .replace(/\\\\/g, '\\')
        .replace(/\$\{([A-Za-z0-9\.]*)\}/g, function (match) {
            return moi.get(match.substring(2, match.length - 1));
        });
};

PropertiesFile.prototype.getKeys = function () {
    var keys = [];
    for (var key in this.objs) {
        keys.push(key);
    }
    return keys;
};

PropertiesFile.prototype.reset = function () {
    this.objs = {};
};

// Keeped from v1 for backward compatibility
exports.of = function () {
    var globalFile = new PropertiesFile();
    for (var i = 0; i < arguments.length; i++) {
//        console.log('Adding file from of '+utils.inspect(arguments[i]));
        globalFile.addFile(arguments[i]);
    }

    return globalFile;
};

exports.PropertiesFile = PropertiesFile;
