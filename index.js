
var Promise = require('bluebird');
var reqFrom = require('req-from');
var util = require('util');


function YamlRunner(config, allowedKeys, cwd) {
  this.config = config;
  this.plugins = {};
  this.allowedKeys = allowedKeys || {};
  this.allowedKeys.plugins = true;
  this.cwd = cwd || process.cwd();
  this.listeners = {};
}


YamlRunner.prototype.go = function () {
  var _this = this;
  this.loadPlugins();
  this.process();

  if (!this.error) {
    this.emit('beginning')
      .then(function () {
        return _this.emit('middle');
      })
      .then(function () {
        return _this.emit('end');
      })
      .catch(console.error);
  }
};


YamlRunner.prototype.on = function (event, handler) {
  if (!this.listeners[event]) {
    this.listeners[event] = [handler];
  } else {
    this.listeners[event].push(handler);
  }
};


YamlRunner.prototype.emit = function (event, result) {
  if (this.listeners[event]) {
    return Promise.all(this.listeners[event].map(function (fn) { return fn(result); }));
  } else {
    return Promise.resolve();
  }
};


YamlRunner.prototype.loadPlugins = function () {
  if (Array.isArray(this.config.plugins)) {
    for (var i = 0; i < this.config.plugins.length; i++) {
      reqFrom(this.cwd, this.config.plugins[i])(this);
    }
  }
};


YamlRunner.prototype.define = function (name, fnOrKeys) {
  if (fnOrKeys instanceof Function) {
    this.plugins[name] = fnOrKeys;

  } else {
    var keys;

    if (!fnOrKeys) {
      keys = Array.isArray(name) ? name : [name];

    } else {
      keys = (Array.isArray(fnOrKeys) ? fnOrKeys : [fnOrKeys]).map(function (k) {
        return name + '.' + k;
      });
    }

    for (var i in keys) {
      this.allowedKeys[keys[i]] = true;
    }
  }
};


YamlRunner.prototype.process = function (section, parent, context) {
  var plugin, name, child;
  section = section || this.config;
  parent = parent ? parent + '.' : '';
  context = context || this;

  for (var k in section) {
    child = section[k];
    name = parent + k;
    plugin = this.plugins[name];

    if (plugin) {
      context = plugin.call(context, child, k, name) || this;

    } else if (!this.allowedKeys[name]) {
      console.error('Unrecognised key: ' + name);
      this.error = true;
    }

    if (typeof child === 'object' && !Array.isArray(child)) {
      this.process(child, name, context);
    }
  }
};

module.exports = YamlRunner;
