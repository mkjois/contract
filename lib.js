module.exports = {
  'enforce': function(f, msg) {
    if (!f()) {
      console.error("\u001b[31m" + msg + "\u001b[0m");
    }
  },

  'odd': function(x) {
    if ((x % 2) == 1) {
      return true;
    }
    return false;
  },

  'single': function(x) {
    return {'each': function(f) { return f(x); }};
  },

  'below': function(x) {
    return function(y) { return y < x; };
  }
}
