# java-properties

Read Java .properties files. Supports adding dynamically some files and array key value (same key multiple times)

## Getting Started
Install the module with: `npm install java-properties`

## Documentation
```javascript
    var properties = require('java-properties');

    var values = properties.of('values.properties');

    //Read a value from the properties file
    values.get('a.key'); //returns value of a.key

    //Add an additional file's properties
    values.add('anotherfile.properties');

    //Clear out all values
    values.reset();
    ...
    // returns the value of a.key of 'defaultValue' if key is not found
    values.get('a.key', 'defaultValue');
    ...
    // returns the value of the a.int.key as an int or 18
    values.getInt('a.int.key', 18);
    ...
    // returns the value of the a.float.key as a float or 18.23
    values.getFloat('a.float.key', 18.23);
    ...
    // returns all the keys
    values.getKeys();
    ...
    // adds another file the properties list
    values.addFile('anotherFile.properties');
    ...
    // empty the keys previously loaded
    values.reset();
    ...
    [ -- .properties file
    an.array.key=value1
    an.array.key=value2
    ]
    values.get('an.array.key'); // returns [value1, value2]
    
    // Multiple contexts
    var myFile = new PropertiesFile(
        'example.properties',
        'arrayExample.properties');
    myFile.get('arrayKey');
    
    var myOtherFile = new PropertiesFile();
    myOtherFile.addFile('example.properties');
    myOtherFile.addFile('example2.properties');
```
## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
0.1.0 Initial commit
0.1.5: Support empty strings
0.1.6 New API: `getKeys`
0.1.7 New APIs: `addFile` and `reset`
0.1.8 Add array key (the same key many time in files)

0.2.0 Wrap features into a class to be able to have multiple running contexts

0.2.1 Add default value to get method. Add getInt and getFloat to get an integer or float value

## License
Licensed under the MIT license.
