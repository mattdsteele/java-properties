/*
 * properties
 *
 * Copyright (c) 2013 Matt Steele
 * Licensed under the MIT license.
 */

import fs from 'fs';

class PropertiesFile {
  objs: { [key: string]: any };
  duplicateKeys: { [file: string]: ({[key: string]: number[]}) }; //For tracking if a file is corrupt with duplicate keys - records the line numbers

  constructor(...args: string[]) {
    this.objs = {};
    this.duplicateKeys = {};
    if (args.length) {
      this.of.apply(this, args);
    }
  }

  parseValue(value: string): string {
      try {
          const escapedValue = value
              .replace(/\\"/g, '"') // fix any escaped double quotes
              .replace(/\\'/g, '\'') // fix any escaped single quotes
              .replace(/"/g, '\\"') // escape "
              .replace(/\\:/g, ':') // remove \ before :
              .replace(/\\=/g, '=') // remove \ before =
              .replace(/\t/g, "\\t") // tab > \t
              .replace(/\n/g, "\\n"); // new line > \n

          return unescape(JSON.parse('"' + escapedValue + '"'));
      } catch {
          return value
              .replace(/\\"/g, '"') // fix any escaped double quotes
              .replace(/\\'/g, '\'') // fix any escaped single quotes
              .replace(/\\:/g, ':') // remove \ before :
              .replace(/\\=/g, '='); // remove \ before =
      }
  }

  makeKeys(line: string): string {
    if (line && line.indexOf('#') !== 0) {
      //let splitIndex = line.indexOf('=');
      let separatorPositions = ['=',':']
        .map((sep) => {return line.indexOf(sep);})
        .filter((index) => {return index > -1;});
      let splitIndex = Math.min(...separatorPositions);
      let key = line.substring(0, splitIndex).trim();
      let value = line.substring(splitIndex + 1).trim();
      // if keys already exists ...
      if (this.objs.hasOwnProperty(key)) {
        // if it is already an Array
        if (Array.isArray(this.objs[key])) {
          // just push the new value
          this.objs[key].push(value);
        } else {
          // transform the value into Array
          let oldValue = this.objs[key];
          this.objs[key] = [oldValue, value];
        }
      } else {
        // the key does not exists
        this.objs[key] = this.parseValue(value);
      }
      return key;
    }

    return '';
  }

  addFile(file: string) {
    this.duplicateKeys[file] = {};
    let data = fs.readFileSync(file, 'utf-8');
    let items = data.split(/\r?\n/);
    let me = this;
    let fileKeys: ({[key: string]: number}) = {};
    for (let i = 0; i < items.length; i++) {
      let line = items[i];
      while (line.substring(line.length - 1) === '\\') {
        line = line.slice(0, -1);
        let nextLine = items[i + 1];
        line = line + nextLine.trim();
        i++;
      }
      const key = me.makeKeys(line);

      //Track duplicate keys in this file
      if (key && fileKeys[key]) {
        if (!this.duplicateKeys[file][key]) {
          this.duplicateKeys[file][key] = [fileKeys[key]]; //Add the first key's line number too
        }
        this.duplicateKeys[file][key].push(i+1);
      } else if (key) {
        fileKeys[key] = i+1;
      }
    }
  }

  of(...args: string[]) {
    for (let i = 0; i < args.length; i++) {
      this.addFile(args[i]);
    }
  }

  get(key: string, defaultValue?: string) {
    if (this.objs.hasOwnProperty(key)) {
      if (Array.isArray(this.objs[key])) {
        let ret = [];
        for (let i = 0; i < this.objs[key].length; i++) {
          ret[i] = this.interpolate(this.objs[key][i]);
        }
        return ret;
      } else {
        return typeof this.objs[key] === 'undefined'
          ? ''
          : this.interpolate(this.objs[key]);
      }
    }
    return defaultValue;
  }

  getLast(key: string, defaultValue?: string) {
    if (this.objs.hasOwnProperty(key)) {
      if (Array.isArray(this.objs[key])) {
        var lg = this.objs[key].length;
        return this.interpolate(this.objs[key][lg - 1]);
      } else {
        return typeof this.objs[key] === 'undefined'
          ? ''
          : this.interpolate(this.objs[key]);
      }
    }
    return defaultValue;
  }

  getFirst(key: string, defaultValue?: string) {
    if (this.objs.hasOwnProperty(key)) {
      if (Array.isArray(this.objs[key])) {
        return this.interpolate(this.objs[key][0]);
      } else {
        return typeof this.objs[key] === 'undefined'
          ? ''
          : this.interpolate(this.objs[key]);
      }
    }
    return defaultValue;
  }

  getInt(key: string, defaultIntValue?: number) {
    let val = this.getLast(key);
    if (!val) {
      return defaultIntValue;
    } else {
      return parseInt(val, 10);
    }
  }

  getFloat(key: string, defaultFloatValue?: number) {
    let val = this.getLast(key);
    if (!val) {
      return defaultFloatValue;
    } else {
      return parseFloat(val);
    }
  }

  getBoolean(key: string, defaultBooleanValue?: boolean) {
    function parseBool(b: string) {
      return !/^(false|0)$/i.test(b) && !!b;
    }

    let val = this.getLast(key);
    if (!val) {
      return defaultBooleanValue || false;
    } else {
      return parseBool(val);
    }
  }

  set(key: string, value: string) {
    this.objs[key] = value;
  }

  interpolate(s: string): string {
    let me = this;
    return s
      .replace(/\\\\/g, '\\')
      .replace(/\$\{([A-Za-z0-9\.\-\_]*)\}/g, function(match) {
        return me.getLast(match.substring(2, match.length - 1))!;
      });
  }

  getKeys() {
    let keys = [];
    for (let key in this.objs) {
      keys.push(key);
    }
    return keys;
  }

  getMatchingKeys(matchstr: string) {
    let keys = [];
    for (let key in this.objs) {
      if (key.search(matchstr) !== -1) {
        keys.push(key);
      }
    }
    return keys;
  }

  getKeysForValue(value: string) {
    let keys = [];
    for (let key in this.objs) {
      if (this.objs[key] === value) {
        keys.push(key);
      }
    }
    return keys;
  }

  flattenFirst() {
    for (let key in this.objs) {
      if (Array.isArray(this.objs[key]) && this.objs[key].length >= 2) {
        this.objs[key] = this.objs[key][0];
      }
    }

    return this;
  }

  reset() {
    this.objs = {};
  }

  hasDuplicateKeys(): boolean {
    let hasDuplicates = false;

    Object.keys(this.duplicateKeys).forEach(file => {
      if (Object.keys(this.duplicateKeys[file]).length) {
        hasDuplicates = true;
      }
    });

    return hasDuplicates;
  }
}

// Retain 'of' from v1 for backward compatibility
let of = function(...args: any[]) {
  let globalFile = new PropertiesFile();
  globalFile.of.apply(globalFile, args);
  return globalFile;
};

export { PropertiesFile, of };
