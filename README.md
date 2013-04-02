# java-properties

Read Java .properties files

## Getting Started
Install the module with: `npm install java-properties`

## Documentation
```javascript
    var properties = require('java-properties');
    var values = properties.of('values.properties');
    values.get('a.key'); //returns value of a.key
```
## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
0.1.0 Initial commit

## License
Licensed under the MIT license.
