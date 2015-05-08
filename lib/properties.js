/*
 * properties
 *
 * Copyright (c) 2013 Matt Steele
 * Licensed under the MIT license.
 */

'use strict';
var fs = require('fs');
// var utils = require('util');

// Construct a PropertiesFile class to handle all properties of a specifice file or group of file
var PropertiesFile = function () {
    this.objs = {};
    if (arguments) {
        this.of.apply(this, arguments);
    }
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
    for (var i = 0; i < arguments.length; i++) {
        this.addFile(arguments[i]);
    }
};

PropertiesFile.prototype.get = function (key, defaultValue) {
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
    return defaultValue;
};

PropertiesFile.prototype.getInt = function (key, defaultIntValue) {
    var val = this.get(key);
    if (!val) { return defaultIntValue; }
    else { return parseInt(val, 10); }
};

PropertiesFile.prototype.getFloat = function (key, defaultFloatValue) {
    var val = this.get(key);
    if (!val) { return defaultFloatValue; }
    else { return parseFloat(val); }
};

PropertiesFile.prototype.getBoolean = function (key, defaultBooleanValue) {
    function parseBool(b) {
        return !(/^(false|0)$/i).test(b) && !!b;
    }
    
    var val = this.get(key);
    if (!val) { return defaultBooleanValue || false; }
    else { return parseBool(val); }    
};

PropertiesFile.prototype.set = function (key, value) {
    this.objs[key] = value;
};

PropertiesFile.prototype.interpolate = function (s) {
    var me=this;
    return s
        .replace(/\\\\/g, '\\')
        .replace(/\$\{([A-Za-z0-9\.]*)\}/g, function (match) {
            return me.get(match.substring(2, match.length - 1));
        });
};

PropertiesFile.prototype.getKeys = function () {
    var keys = [];
    for (var key in this.objs) {
        keys.push(key);
    }
    return keys;
};

PropertiesFile.prototype.getMatchingKeys = function (matchstr) {
    var keys = [];
    for (var key in this.objs) {
        if (key.search(matchstr) != -1) {
            keys.push(key);
        }
    }
    return keys;
};

PropertiesFile.prototype.reset = function () {
    this.objs = {};
};

// Keeped from v1 for backward compatibility
exports.of = function () {
    var globalFile = new PropertiesFile();
    globalFile.of.apply(globalFile, arguments);

    return globalFile;
};

exports.PropertiesFile = PropertiesFile;
