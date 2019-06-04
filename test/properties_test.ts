import { PropertiesFile, of } from '../src/index';
import { expect } from 'chai';
import { fork } from "child_process";

let props: PropertiesFile;

// Shim for NodeUnit tests
const test = {
  equal(expected: any, actual: any) {
    expect(expected).to.eq(actual);
  }
};

describe('properties', () => {
  beforeEach(() => {
    props = of('test/fixtures/example.properties');
  });
  it('basic read from a file', () => {
    expect('2.5').to.eq(props.get('ricola.version.major'));
    expect('7').to.eq(props.get('ricola.version.minor'));
  });
  it('nested values', () => {
    expect(props.get('ricola.version.symlink')).to.eq('2.5');
  });
  it('complicated nest', () => {
    expect('ricola-2.5').to.eq(props.get('ricola.version.prefixed'));
    expect('ricola-2.5-tothemax').to.eq(props.get('ricola.version.postfixed'));
  });
  it('recursive nest', () => {
    expect('ricola-2.5-recursive').to.eq(props.get('ricola.recursive'));
  });
  it('double nest', () => {
    expect('2.5.7').to.eq(props.get('ricola.version'));
  });
  it('with spaces', () => {
    expect('hello').to.eq(props.get('ricola.withSpaces'));
  });
  it('second file', () => {
    props = of(
      'test/fixtures/example.properties',
      'test/fixtures/example2.properties'
    );
    test.equal('14.47', props.get('extra.property'));
    test.equal('444', props.get('another.property'));
    test.equal('7', props.get('referenced.property'));
  });
  it('not found property', () => {
    test.equal(undefined, props.get('undefinedValue'));
  });
  it('additional property', () => {
    test.equal(undefined, props.get('undefinedValue'));
    props.set('undefinedValue', '14.8');
    test.equal('14.8', props.get('undefinedValue'));
  });
  it('with backslashes', () => {
    var key = '^(0?[1-9]|1[012])\\/?(0?[1-9]|[12][0-9]|3[01])$';
    test.equal(key, props.get('regex.format.date'));
  });
  it('interpolating', () => {
    test.equal(
      'version 7 is the best!',
      props.interpolate('version ${ricola.version.minor} is the best!')
    );
  });
  it('unix line endings', () => {
    props = of('test/fixtures/unix.properties');
    test.equal('value 1', props.get('value.1'));
    test.equal('Another Value', props.get('value.2'));
  });
  it('includes multiple equals', () => {
    test.equal('some=value', props.get('property.with.equals'));
  });
  it('empty string', () => {
    test.equal('', props.get('property.emptyString'));
  });
  it('get keys', () => {
    // check that properties are well loaded
    expect(props.getKeys()).to.deep.eq([
      'ricola.version',
      'ricola.version.major',
      'ricola.version.minor',
      'ricola.version.symlink',
      'ricola.withSpaces',
      'ricola.version.prefixed',
      'ricola.version.postfixed',
      'ricola.recursive',
      'regex.format.date',
      'property.with.equals',
      'property.emptyString',
      'withNewline',
      'withIndentation',
      'targetCities',
      'with-dashes',
      'with_underscores'
    ]);
  });
  it('reset', () => {
    props.reset();
    expect(props.getKeys()).to.eql([]);
  });
  it('addFile', () => {
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
  });
  it('array file', () => {
    props = of(
      'test/fixtures/example.properties',
      'test/fixtures/arrayExample.properties'
    );
    var arrayKey = props.get('arrayKey')!;
    test.equal(true, Array.isArray(arrayKey));
    test.equal(3, arrayKey.length);
    test.equal('first : ricola-2.5', arrayKey[0]);
    test.equal('second', arrayKey[1]);
    test.equal('third', arrayKey[2]);
  });
  it('array file undefined', () => {
    props = of(
      'test/fixtures/example.properties',
      'test/fixtures/arrayExample.properties'
    );
    test.equal(undefined, props.get('arrayKeyUndefined'));
  });
  it('Using PropertiesFile with files provided', () => {
    props.reset();
    var myFile = new PropertiesFile(
      'test/fixtures/example.properties',
      'test/fixtures/arrayExample.properties'
    );
    test.equal(3, myFile.get('arrayKey')!.length);
    myFile.reset();
    test.equal(undefined, myFile.get('arrayKey'));
  });
  it('Using PropertiesFile with 2 different contexts', () => {
    props.reset();
    var myFile = new PropertiesFile();
    myFile.of(
      'test/fixtures/example.properties',
      'test/fixtures/arrayExample.properties'
    );

    var myOtherFile = new PropertiesFile();
    myOtherFile.addFile('test/fixtures/example.properties');
    myOtherFile.addFile('test/fixtures/example2.properties');

    test.equal(3, myFile.get('arrayKey')!.length);
    test.equal(undefined, myFile.get('referenced.property'));
    test.equal('some=value', myOtherFile.get('property.with.equals'));
    test.equal('7', myOtherFile.get('referenced.property'));
  });
  it('Using defaut value for get', () => {
    var myFile = new PropertiesFile(
      'test/fixtures/example.properties',
      'test/fixtures/arrayExample.properties'
    );
    test.equal(undefined, myFile.get('referenced.property'));
    test.equal(
      'defaultValue',
      myFile.get('referenced.property', 'defaultValue')
    );
    test.equal('hello', myFile.get('ricola.withSpaces'));
    test.equal('hello', myFile.get('ricola.withSpaces', 'defaultValue'));
  });
  it('Using int value with getInt', () => {
    var myFile = new PropertiesFile(
      'test/fixtures/example.properties',
      'test/fixtures/arrayExample.properties'
    );
    test.equal('7', myFile.get('ricola.version.minor'));
    test.equal(7, myFile.getInt('ricola.version.minor'));
    test.equal(undefined, myFile.getInt('dont.exists'));
    test.equal(12, myFile.getInt('dont.exists', 12));
    test.equal(true, isNaN(myFile.getInt('ricola.withSpaces')!));
  });
  it('Using float value with getFloat', () => {
    var myFile = new PropertiesFile(
      'test/fixtures/example.properties',
      'test/fixtures/arrayExample.properties'
    );
    test.equal('2.5', myFile.get('ricola.version.major'));
    test.equal(2.5, myFile.getFloat('ricola.version.major'));
    test.equal(undefined, myFile.getFloat('dont.exists'));
    test.equal(12.23, myFile.getFloat('dont.exists', 12.23));
    test.equal(true, isNaN(myFile.getFloat('ricola.withSpaces')!));
  });
  it('Using boolean value with getBoolean', () => {
    var myFile = new PropertiesFile('test/fixtures/boolean.properties');
    test.equal(true, myFile.getBoolean('boolean.true1'));
    test.equal(true, myFile.getBoolean('boolean.true2'));
    test.equal(true, myFile.getBoolean('boolean.true3'));
    test.equal(true, myFile.getBoolean('boolean.true4'));
    test.equal(false, myFile.getBoolean('boolean.false1'));
    test.equal(false, myFile.getBoolean('boolean.false2'));
    test.equal(false, myFile.getBoolean('boolean.false3'));
    test.equal(false, myFile.getBoolean('boolean.false4'));

    test.equal(false, myFile.getBoolean('boolean.empty', false));
    test.equal(true, myFile.getBoolean('boolean.empty', true));
    test.equal(false, myFile.getBoolean('boolean.empty'));
  });
  it('getMatchingKeys', () => {
    var myFile = new PropertiesFile('test/fixtures/example.properties');
    var props = myFile.getMatchingKeys('property');
    test.equal(2, props.length);
    expect(['property.with.equals', 'property.emptyString']).to.deep.eq(props);
  });

  it('with newline', () => {
    test.equal('Welcome to The Monkey House!', props.get('withNewline'));
  });

  it('with indentations', () => {
    test.equal('Welcome to The Rock.', props.get('withIndentation'));
  });

  it('multiple backslashes', () => {
    test.equal('Detroit,Chicago,Los Angeles', props.get('targetCities'));
  });
  it('Multivalued property in interpolation', () => {
    var myFile = new PropertiesFile('test/fixtures/multivalued.properties');
    test.equal(myFile.get('multi.value')!.length, 2);
    test.equal(myFile.get('multi.value')![0], 'value1');
    test.equal(myFile.get('multi.value')![1], 'value2');
    test.equal(myFile.getLast('multi.value'), 'value2');
    test.equal(myFile.getFirst('multi.value'), 'value1');
    test.equal('The value is value2', myFile.get('multi.interpolated.value'));
  });
  it('Multivalued boolean property', () => {
    var myFile = new PropertiesFile('test/fixtures/multivalued.properties');
    test.equal(myFile.getBoolean('multi.bool.value'), true);
  });
  it('Multivalued int property', () => {
    var myFile = new PropertiesFile('test/fixtures/multivalued.properties');
    test.equal(myFile.getInt('multi.int.value'), 1);
  });
  it('utf8 strings', () => {
    var myFile = new PropertiesFile('test/fixtures/utf8.properties');
    var str = myFile.get('utf8.string');
    if (typeof str === 'string') {
      test.equal(
        str,
        '\u2601 a string with accent : crédits seront très bientôt épuisés'
      );
      expect(str.charAt(0)).to.eq(String.fromCharCode(0x2601));
    }
  });
  it('double quoted strings', () => {
    var myFile = new PropertiesFile('test/fixtures/doublequoted.properties');
    var str = myFile.get('double.quoted.string');
    test.equal(
      str,
      'The first " and the second " should be replaced. Can we replace " in interpolation ?'
    );
  });
  it('teamcity unescaped `:` & `=`', () => {
    var myFile = new PropertiesFile('test/fixtures/teamcity.properties');
    test.equal(
      myFile.get('teamcity.agent.dotnet.agent_url'),
      'http://localhost:9090/RPC2'
    );
    test.equal(myFile.get('teamcity.auth.userId'), 'TeamCityBuildId=673');
  });
  it('works with dashes and underscores', () => {
    expect(props.get('with-dashes')).to.eq('With Dashes');
    expect(props.get('with_underscores')).to.eq('With Underscores');
  });
  it('loads properties from web url', () => {
    let httpServer = fork('test/fixtures/httpserver.ts', [], {
      execArgv: ['-r', 'ts-node/register']
    });
    httpServer.on('message', (message: any) => {
      let myFile = new PropertiesFile(`http://${message.host}:${message.port}`);
      try {
        test.equal("value 1", myFile.get('value.1'));
      } finally {
        httpServer.kill()
      }
    });
  });
});
