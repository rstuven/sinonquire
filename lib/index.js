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
var shouldAutoStub = true;
var explicitShouldStub = {};
var explicitlySetStubs = {};
var stubbed = [];
var excludedPaths = [];

function shouldStub(modulePath) {
  var moduleID = normalizePath(modulePath, 4);
  if (explicitShouldStub.hasOwnProperty(moduleID)) {
    return explicitShouldStub[moduleID];
  } else if (NODE_CORE_MODULES[modulePath]) {
    return false;
  } else if (isExcludedPath(moduleID)) {
    return false;
  }
  return shouldAutoStub;
}

function isExcludedPath(moduleID) {
  return isPath(moduleID, excludedPaths);
}

function isPath(moduleID, paths) {
  for (var idx = 0; idx < paths.length; idx++) {
    var thePath = paths[idx];
    if (typeof thePath === 'string') {
      if (moduleID.indexOf(thePath) !== -1) {
        return true;
      }
    } else if (thePath instanceof RegExp) {
      if (thePath.test(moduleID)) {
        return true;
      }
    }
  }
  return false;
}

var requireStack = [];

Module.prototype.require = function sinonquire(modulePath) {
  var moduleID = normalizePath(modulePath, 3);
  if (requireStack.length === 0 && shouldStub(modulePath)) {
    if (explicitlySetStubs.hasOwnProperty(moduleID)) {
      return explicitlySetStubs[moduleID];
    }
    stubbed.push(moduleID);
    var module = originalRequire.call(this, modulePath);
    if (module.__esModule && module.default) {
      module = module.default;
    }
    var stub = createStub(module);
    explicitlySetStubs[moduleID] = stub;
    return stub;
  }
  var inStack = isExcludedPath(moduleID);
  if (inStack) {
    requireStack.push(moduleID);
  }
  var mod = originalRequire.call(this, modulePath);
  if (inStack) {
    requireStack.pop(moduleID);
  }
  return mod;
};

function createStub(module) {
  if (module === null || (typeof module !== 'object' && typeof module !== 'function')) {
    return module;
  }
  if (module.isSinonProxy) {
    return module;
  }
  if (typeof module === 'function') {
    const spy = sinon.spy(function Klass() {
      if (this instanceof Klass) {
        return sinon.createStubInstance(module);
      }
      return this;
    });
    Object.keys(module).forEach(key => {
      if (spy.hasOwnProperty[key]) {
        throw new Error('Can\'t overwrite sinon.spy property ' + key);
      }
      spy[key] = module[key];
    });
    return spy;
  }

  if (!hasFunction(module)) {
    return module;
  }

  // set aside already wrapped properties
  const stash = {};
  Object.keys(module).forEach(key => {
    if (typeof module[key] === 'function' && module[key].isSinonProxy) {
      stash[key] = module[key];
      delete module[key];
    }
  });

  const stub = sinon.stub(module);

  // restore set aside properties
  Object.keys(stash).forEach(key => {
    module[key] = stash[key];
    stub[key] = stash[key];
  });

  return stub;
}

function hasFunction(value) {
  const keys = Object.keys(value);
  for (var i = 0; i < keys.length; i++) {
    if (typeof value[keys[i]] === 'function') {
      return true;
    }
  }
  return false;
}

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
    delete require.cache[moduleID];
  },
  stub: function(moduleName) {
    var moduleID = normalizePath(moduleName, 2);
    explicitShouldStub[moduleID] = true;
    delete require.cache[moduleID];
  },
  setStub: function(moduleName, moduleExports) {
    var moduleID = normalizePath(moduleName, 2);
    explicitShouldStub[moduleID] = true;
    explicitlySetStubs[moduleID] = moduleExports;
  },
  resetStubs: function() {
    stubbed.forEach(function(moduleID) {
      delete require.cache[moduleID];
    });
    stubbed = [];
    explicitlySetStubs = {};
    explicitShouldStub = {};
  },
  excludePaths: function() {
    var args = Array.prototype.slice.call(arguments);
    excludedPaths = excludedPaths.concat(args);
  },
};
