var sinon = require('sinon');
var path = require('path');

// Copied from jest/src/HasteModuleLoader/HasteModuleLoader.js
var NODE_CORE_MODULES = {
  assert: true,
  buffer: true,
  child_process: true,
  cluster: true,
  console: true,
  constants: true,
  crypto: true,
  dgram: true,
  dns: true,
  domain: true,
  events: true,
  freelist: true,
  fs: true,
  http: true,
  https: true,
  module: true,
  net: true,
  os: true,
  path: true,
  punycode: true,
  querystring: true,
  readline: true,
  repl: true,
  smalloc: true,
  stream: true,
  string_decoder: true,
  sys: true,
  timers: true,
  tls: true,
  tty: true,
  url: true,
  util: true,
  vm: true,
  zlib: true,
};

var Module = require('module');
var originalRequire = Module.prototype.require;
var shouldAutoStub = false;
var explicitShouldStub = {};
var explicitlySetStubs = {};
var stubbed = [];

function shouldStub(modulePath) {
  var moduleID = normalizePath(modulePath, 4);
  if (explicitShouldStub.hasOwnProperty(moduleID)) {
    return explicitShouldStub[moduleID];
  } else if (NODE_CORE_MODULES[modulePath]) {
    return false;
  }
  return shouldAutoStub;
}

Module.prototype.require = function sinonquire(modulePath) {
  var moduleID = normalizePath(modulePath, 3);
  if (shouldStub(modulePath)) {
    if (explicitlySetStubs.hasOwnProperty(moduleID)) {
      return explicitlySetStubs[moduleID];
    }
    stubbed.push(moduleID);
    var module = originalRequire.call(this, modulePath);
    var stub = sinon.stub(module);
    explicitlySetStubs[moduleID] = stub;
    return stub;
  }
  return originalRequire.call(this, modulePath);
};

function normalizePath(moduleName, index) {
  var stack = getStack();
  var callsite = path.dirname(stack[index].getFileName());
  if (moduleName[0] === '.') {
    return path.resolve(callsite, moduleName);
  }
  return moduleName;
}

function getStack() {
  var originalPrepareStackTrace = Error.prepareStackTrace;
  Error.prepareStackTrace = function(error, stack) {
    return stack;
  };
  var err = new Error();
  var stack = err.stack;
  Error.prepareStackTrace = originalPrepareStackTrace;
  stack.shift();
  return stack;
}

module.exports = {
  autoStubOn: function() {
    shouldAutoStub = true;
  },
  autoStubOff: function() {
    shouldAutoStub = false;
  },
  dontStub: function(moduleName) {
    var moduleID = normalizePath(moduleName, 2);
    explicitShouldStub[moduleID] = false;
  },
  stub: function(moduleName) {
    var moduleID = normalizePath(moduleName, 2);
    explicitShouldStub[moduleID] = true;
  },
  setStub: function(moduleName, moduleExports) {
    var moduleID = normalizePath(moduleName, 2);
    explicitShouldStub[moduleID] = true;
    explicitlySetStubs[moduleID] = moduleExports;
  },
  reset: function() {
    stubbed.forEach(function(moduleID) {
      delete require.cache[moduleID];
    });
    stubbed = [];
    explicitlySetStubs = {};
    explicitShouldStub = {};
  },
};
