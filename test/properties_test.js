'use strict';

var properties = require('../lib/properties.js');
var props;

/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/

exports['properties'] = {
  setUp: function(done) {
    props = properties.of('test/fixtures/example.properties');
    done();
  },
  'basic read from a file': function(test) {
    test.expect(2);
    test.equal('2.5', props.get('ricola.version.major'));
    test.equal('7', props.get('ricola.version.minor'));
    test.done();
  },
  'nested values': function(test) {
    test.expect(1);
    test.equal('2.5', props.get('ricola.version.symlink'));
    test.done();
  },
  'complicated nest': function(test) {
    test.expect(2);
    test.equal('ricola-2.5', props.get('ricola.version.prefixed'));
    test.equal('ricola-2.5-tothemax', props.get('ricola.version.postfixed'));
    test.done();
  },
  'recursive nest': function(test) {
    test.expect(1);
    test.equal('ricola-2.5-recursive', props.get('ricola.recursive'));
    test.done();
  },
  'double nest': function(test) {
    test.expect(1);
    test.equal('2.5.7', props.get('ricola.version'));
    test.done();
  },
  'with spaces' : function(test) {
    test.expect(1);
    test.equal('hello', props.get('ricola.withSpaces'));
    test.done();
  },
  'second file': function(test) {
    test.expect(3);
    props = properties.of('test/fixtures/example.properties', 'test/fixtures/example2.properties');
    test.equal('14.47', props.get('extra.property'));
    test.equal('444', props.get('another.property'));
    test.equal('7', props.get('referenced.property'));
    test.done();
  },
  'not found property': function(test) {
    test.expect(1);
    test.equal(undefined, props.get('undefinedValue'));
    test.done();
  },
  'additional property': function(test) {
    test.expect(2);
    test.equal(undefined, props.get('undefinedValue'));
    props.set('undefinedValue', '14.8');
    test.equal('14.8', props.get('undefinedValue'));
    test.done();
  },
  'with backslashes': function(test) {
    var key = "^(0?[1-9]|1[012])\\/?(0?[1-9]|[12][0-9]|3[01])$";
    test.expect(1);
    test.equal(key, props.get('regex.format.date'));
    test.done();
  },
  'interpolating' : function(test) {
    test.expect(1);
    test.equal('version 7 is the best!', props.interpolate('version ${ricola.version.minor} is the best!'));
    test.done();
  },
  'unix line endings' : function(test) {
    test.expect(2);
    props = properties.of('test/fixtures/unix.properties');
    test.equal('value 1', props.get('value.1'));
    test.equal('Another Value', props.get('value.2'));
    test.done();
  },
  'includes multiple equals' : function(test) {
    test.expect(1);
    test.equal('some=value',props.get('property.with.equals'));
    test.done();
  },
  'empty string' : function (test) {
    test.expect(1);
    test.equal('', props.get('property.emptyString'));
    test.done();
  },
  'get keys' : function(test) {
      test.expect(1);
      // check that properties are well loaded
      test.deepEqual(props.getKeys(), [ 'ricola.version',
         'ricola.version.major',
         'ricola.version.minor',
         'ricola.version.symlink',
         'ricola.withSpaces',
         'ricola.version.prefixed',
         'ricola.version.postfixed',
         'ricola.recursive',
         'regex.format.date',
         'property.with.equals',
         'property.emptyString' ]);
      test.done();
  },
  'reset' : function(test) {
      test.expect(1);
      props.reset();
      test.equals(0, props.getKeys());
      test.done();
  },
  'addFile' : function(test) {
      test.expect(6);
      // Reset and add manually the 2 first files
      props.reset();
      props.addFile('test/fixtures/example.properties');
      props.addFile('test/fixtures/example2.properties');
      test.equal('14.47', props.get('extra.property'));
      test.equal('444', props.get('another.property'));
      test.equal('7', props.get('referenced.property'));
      
      // 'value.1' must not be defined cause it is unix.properties file
      test.equal(undefined, props.get('value.1'));
      // add the unix.properties file
      props.addFile('test/fixtures/unix.properties');
      // check that value.1 is now defined
      test.equal('value 1', props.get('value.1'));
      // and that old values are still there
      test.equal('444', props.get('another.property'));
      
      test.done();
  }
};
