module.exports = {
  'enforce': function(f, msg) {
    if (!f()) {
      console.error("\u001b[31m" + msg + "\u001b[0m");
    }
  },

  'odd': function(x) {
    try {
      if ((x % 2) == 1) {
        return true;
      }
      return false;
    } catch {e} {
      return false;
    }
  },

  'single': function(x) {
    return {'each': function(f) { 
      try {
        return f(x); 
      } catch(e) {
        return false;
      }
    }};
  },

  'below': function(x) {
    return function(y) { 
      try {
        return y < x; 
      catch (e) {
        return false;
      }
    };
  },

  'above': function(x) {
    return function(y) { 
      try {
        return y > x; 
      catch (e) {
        return false;
      }
    };
  },

  'equal': function(x) {
    return function(y) { 
      try {
        return y === x; 
      } catch (e) {
        return false;
      }
    };
  },

  // Check if an array is sorted in ascending order
  'sorted': function(arr) {
    try {
      var i = 0;
      for (i = 0; i < arr.length-1; i++) {
        if (arr[i] > arr[i+1]) {
          return false;
        }
      }
      return true;
    } catch (e) { return false; }
  },

  'all': function(arr) {
    return {'each': function(f) {
      try {
    	 return arr.every(f);
      } catch (e) {
        return false;
      }
    }};
  },

  'number': function(x) {
    try {
  	  return typeof x === 'number';
    } catch (e) {
      return false;
    }
  },

  'string': function(x) {
    try {
  	  return typeof x === 'string';
    } catch (e) {
      return false;
    }
  },

  'array': function(x) {
    try {
  	  return x.constructor === Array;
    } catch (e) {
      return false;
    }
  },

  'object': function(x) {
    try {
  	  return typeof x === 'object';
    } catch (e) {
      return false;
    }
  },

  'function': function(x) {
    try {
  	  return typeof x === 'function';
    } catch (e) {
      return false;
    }
  },

  'in': function(arr) {
    return function(x) {
      try {
        if (arr.constructor === Array) {
    	    return arr.indexOf(x) !== -1;
        } else if (typeof arr === 'object') {
          return arr.hasOwnProperty(x);
        }
      } catch (e) {
        return false;
      }
    };
  }
}
