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
  },

  'above': function(x) {
    return function(y) { return y > x; };
  },

  'equal': function(x) {
    return function(y) { return y === x; };
  },

  'sorted': function(x) {
  	return (function(direction) {
	    return this.reduce(function(prev, next, i, arr) {
	      if (direction === undefined)
	        return (direction = prev <= next ? 1 : -1) || true;
	      else
	        return (direction + 1 ?
	          (arr[i-1] <= next) : 
	          (arr[i-1] >  next));
	    }) ? Number(direction) : false;
	  }).call(this);
  },

  'all': function(x) {
    return {'each': function(f) { 
    	return x.every(f);
    }};
  },
}
