# java-properties

Reads and interpolates Java .properties files

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
```
## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## License
Licensed under the MIT license.
