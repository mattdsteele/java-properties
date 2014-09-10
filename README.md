# java-properties

Read Java .properties files. Supports adding dynamically some files and array key value (same key multiple times)

## Getting Started
Install the module with: `npm install java-properties`

## Documentation
```javascript
    var properties = require('java-properties');
    var values = properties.of('values.properties');
    values.get('a.key'); //returns value of a.key
    ...
    values.getKeys(); // returns all the keys
    ...
    values.addFile('anotherFile.properties'); // adds another file the properties list
    ...
    values.reset(); // empty the keys previously loaded
    ...
    [ -- .properties file
    an.array.key=value1
    an.array.key=value2
    ]
    values.get('an.array.key'); // returns [value1, value2]
```
## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
0.1.0 Initial commit

0.1.x Please fill this history

0.1.x Add array key (the same key many time in files)

## License
Licensed under the MIT license.
