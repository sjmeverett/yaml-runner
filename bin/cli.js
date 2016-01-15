
var cli = require('../lib/cli.js');
var pkg = require('../package.json');
var YamlRunner = require('../index.js');

cli(pkg, YamlRunner);
