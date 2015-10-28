var User = require('./User.js');

function createCouple(nameA, nameB) {
  var userA = new User();
  userA.setName(nameA);

  var userB = new User();
  userB.setName(nameB);

  return [userA, userB];
}

module.exports = createCouple;
