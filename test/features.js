var expect = require('chai').expect;
var sinonquire = require('..');

describe('sinonquire', function() {

  afterEach(function() {
    sinonquire.resetStubs();
  });

  it('should stub and spy', function() {
    var module = require('../features/feature1.js');
    module.xyz.withArgs('a').returns(123);
    module.xyz.withArgs('b').returns(456);
    var xxx = module.xyz('b');
    var yyy = module.xyz('a');
    var zzz = module.xyz('d');
    expect(xxx).to.equal(456);
    expect(yyy).to.equal(123);
    expect(zzz).to.not.exist;
    expect(module.xyz.calledThrice).to.be.true;
    expect(module.xyz.withArgs('b').calledOnce).to.be.true;
    expect(module.xyz.withArgs('a').calledOnce).to.be.true;
    expect(module.xyz.withArgs('c').called).to.be.false;
  });

  it('should not stub', function() {
    sinonquire.dontStub('../features/feature2.js');
    var feature1 = require('../features/feature1.js');
    var feature2 = require('../features/feature2.js');
    feature1.xyz.returns('#');
    var result = feature2.abc();
    expect(result).to.equal('##');
    expect(feature1.xyz.calledTwice).to.be.true;
  });

});
