
var commander = require('commander');
var deepExtend = require('deep-extend');
var fs = require('fs');
var path = require('path');
var rc = require('rc-yaml');
var yaml = require('yaml-js');


module.exports = function (pkg, Runner, options) {
  if (!options) {
    commander
      .version(pkg.version)
      .usage('[options] <file ...>')
      .description('Runs the specified job files.')
      .option('-m, --merge', 'merge all files into one before running')
      .parse(process.argv);

    options = commander;
  }

  var files = options.args
    .map(function (f) {
      var file = fs.readFileSync(f, 'utf-8');
      return yaml.load(file);
    });

  var defaults = {};
  rc(pkg.name, defaults);

  if (options.merge) {
    deepExtend.apply(null, files);
    files = files.slice(1);
  }

  files.forEach(function (file, i) {
    var yarn = new Runner(
      deepExtend({}, defaults, file),
      {_: true, config: true, configs: true},
      path.dirname(options.args[i])
    )
    ;
    yarn.go();
  });
};
