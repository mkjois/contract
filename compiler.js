/**
 * The registers.
 */
var reg = {};

/**
 * Define operators.
 */
var op = {
  'or': 
    function(o1, o2) {
      return '(' + o1.toString() + ' || ' + o2.toString() + ')';
    },
  'and':
    function(o1, o2) {
      return '(' + o1.toString() + ' && ' + o2.toString() + ')';
    },
  'not':
    function(o1) {
      return '(!(' + o1.toString() + '))';
    }
};

function handleFunc(btc) {
  var preLines = [],
      postLines = [];
  var i;
  for (i = 0; i < btc.docs.length; i++) {
    var node = btc.docs[i];
    switch (node.type) {
      case 'adjective':
        reg[node.target] = '_______contract.' + node.name + '(_______arg)';
        break;
      case 'and':
        reg[node.target] = op.and(reg[node.operand1], reg[node.operand2]);
        break;
      case 'or':
        reg[node.target] = op.or(reg[node.operand1], reg[node.operand2]);
        break;
      case 'not':
        reg[node.target] = op.not(reg[node.operand1]);
        break;
      case 'null':
        reg[node.target] = 'null';
        break;
      case 'clause':
        var nouns = [];
        var j;
        for (j = 0; j < node.subjects.length; j++) {
          var q = node.subjects[j].qualifier;
          if (q === null) {
            q = 'single'
          }
          nouns.push({'qualifier': q, 'name': node.subjects[j].name});
        }
        var subjectArray = ['function() {'];
        for (j = 0; j < nouns.length; j++) {
          if (nouns[j].name !== '@output') {
            subjectArray.push('if (!(' + nouns[j].qualifier + '(' +
                              nouns[j].name +
                              ').each(function(_______arg) {' +
                              reg[node.descriptor] + '}))) { return false; }');
          } else {
            subjectArray.push('if (!(' + nouns[j].qualifier +
                              '(o).each(function(_______arg) {' +
                              reg[node.descriptor] + '}))) { return false; }');

          }
        }
        subjectArray.push('return true; }');
        reg[node.target] = subjectArray.join("\n");
        break;
      case 'doc':
        break;
      case 'int-lit':
        reg[node.target] = '(_______arg === ' + node.value + ')';
        break;
      case 'float-lit':
        reg[node.target] = '(_______arg === ' + node.value + ')';
        break;
      case 'string-lit':
        reg[node.target] = '(_______arg === "' +
                           node.value.replace('"', '\\"') + '")';
        break;
      case 'compound':
        reg[node.target] = 'function() { if (!(' + reg[node.operand1] +
                           '())) { return false; } else { return ' +
                           reg[node.operand2] + '() }}';
        break;
      case 'contract':
        postLines.push('_______enforce(' + reg[node.clause] + ');');
        break;
    }
  }
  var params = [];
  for (i = 0; i < btc.params.length; i++) {
    params.push(btc.params[i].name);
  }
  var paramString = params.join(', ');
  var outArray = ['function ' + btc.name + '(' + paramString + ') {'];
  for (i = 0; i < preLines.length; i++) {
    outArray.push('  ' + preLines[i]);
  }
  outArray.push('  var o = _______' + btc.name + '(' + paramString + ');')
  for (i = 0; i < postLines.length; i++) {
    outArray.push('  ' + postLines[i]);
  }
  return outArray.join("\n");
}
