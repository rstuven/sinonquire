var chai = require('chai');
var sinonChai = require('sinon-chai');
chai.use(sinonChai);

var sinonquire = require('..');
sinonquire.excludePaths(
  '/node_modules/mocha/',
  '/sinonquire/test/'
);
