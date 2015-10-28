var expect = require('chai').expect;
var sinonquire = require('..');

describe('createCouple', function() {

  var createCouple;

  beforeEach(function() {
    sinonquire.dontStub('../features/createCouple.js');
    createCouple = require('../features/createCouple.js');
  });

  afterEach(function() {
    sinonquire.resetStubs();
  });

  it('should spy instance methods', function() {
    var couple = createCouple('userA', 'userB');
    expect(couple[0].setName).to.have.been.calledWith('userA');
    expect(couple[1].setName).to.have.been.calledWith('userB');
  });

  it('should stub instance methods', function() {
    var couple = createCouple('userA', 'userB');
    couple[0].getName.returns('something new');
    expect(couple[0].getName()).to.equal('something new');
  });

  it('should spy class instantiation', function() {
    createCouple('userA', 'userB');
    var User = require('../features/User.js');
    expect(User).to.have.been.calledTwice;
    expect(User).to.have.been.calledWithNew;
  });

});
