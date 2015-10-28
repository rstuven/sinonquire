function User() {
  this.name = null;
}

User.prototype.setName = function(name) {
  this.name = name;
  return 42;
};

User.prototype.getName = function() {
  return this.name;
};

module.exports = User;
