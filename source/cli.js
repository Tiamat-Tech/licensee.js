var docopt = require('docopt');
var Table = require('cli-table');
var fs = require('fs');
var licensee = require('..');
var path = require('path');

var meta = require('../package.json');

var usage = fs.readFileSync(path.join(__dirname, 'usage.txt'))
  .toString();

module.exports = function(stdin, stdout, stderr, env, argv, callback) {
  var options;
  try {
    options = docopt.docopt(usage, {
      argv: argv,
      help: false,
      exit: false
    });
  } catch (error) {
    stderr.write(error.message);
    callback(1);
    return;
  }

  if (options['--version'] || options['-v']) {
    stdout.write(meta.name + ' ' + meta.version + '\n');
    callback(0);
  } else if (options['--help'] || options['-h']) {
    stdout.write(usage);
    callback(0);
  } else {
    var path = options.PATH || process.cwd();
    licensee(path, {}, function(error, problems) {
      if (problems.length === 0) {
        callback(0);
      } else {
        var table = new Table({
          head: ['Package', 'License Metadata', 'Dependents']
        });
        problems.forEach(function(problem) {
          table.push([
            problem.package,
            (problem.license || 'None'),
            problem.parents.join(' -> ')
          ]);
        });
        process.stderr.write(table.toString() + '\n');
        callback(problems.length === 0 ? 0 : 1);
      }
    });
  }
};
