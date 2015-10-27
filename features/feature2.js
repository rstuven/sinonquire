var feature1 = require('./feature1.js');

module.exports = {
  abc: function() {
    return feature1.xyz() + feature1.xyz();
  },
};
