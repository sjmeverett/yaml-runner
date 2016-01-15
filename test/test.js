
module.exports = function (yaci) {
  var machine = {};

  yaci.define('machine', function (cfg) {
    machine = {
      image: cfg.image || 'default image',
      run: []
    };

    return machine;
  });

  yaci.define('machine', 'image');

  yaci.define('machine.node', function (cfg) {
    this.run.push('install node v' + cfg.version);
  });

  yaci.define('machine.node', 'version')

  yaci.on('start', function () {
    console.log(machine);
    yaci.emit('done:machine');
  });
};
