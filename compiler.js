if (typeof(module) !== 'undefined') {
  module.exports = {
    'processBytecode': processBytecode,
    'processFile': processFile
  };
}

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

function makeExample(input, output) {
  if (output === "Error") {
    return "function() {\n      var verdict = false;\n      try{\n        " +
      input + ";\n      } catch (e) {\n        verdict = true;\n      }\n" +
      "      return verdict;\n    }";
  } else {
    return "function() {\n      var verdict = " +
      input + " === " + output +
      ";\n      return verdict;\n    }";
  }
}

function handleFunc(btc, lines) {
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
        reg[node.target] = '(_______arg === null)';
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
            subjectArray.push('    if (!(_______contract.' + nouns[j].qualifier +
                              '(' + nouns[j].name +
                              ').each(function(_______arg) {');
            subjectArray.push('      return ' + reg[node.descriptor] + ';');
            subjectArray.push('    }))) {');
            subjectArray.push('      return false;');
            subjectArray.push('    }');
          } else {
            subjectArray.push('    if (!(_______contract.' + nouns[j].qualifier +
                              '(_______out).each(function(_______arg) {');
            subjectArray.push('      return ' + reg[node.descriptor] + ';');
            subjectArray.push('    }))) {');
            subjectArray.push('      return false;');
            subjectArray.push('    }');
          }
        }
        subjectArray.push('    return true;');
        subjectArray.push('  }');
        reg[node.target] = subjectArray.join("\n");
        break;
      case 'doc':
        if (reg[node.directive] !== undefined &&
            reg[node.directive].type == 'contract') {
          var msg = 'Violation in function ' + btc.name + ' for ' +
                    lines[node.line-1].replace(new RegExp(' *\\* *#', 'g'),
                                               '#');
          msg = '"' + msg.replace(new RegExp('\\"', 'g'), '\\"') + '"';
          postLines.push('_______contract.enforce(' + reg[node.directive].clause +
                         ', ' + msg + ');');
        }
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
      case 'pass-lit':
        reg[node.target] = 'function() { return true; }';
        break;
      case 'fail-lit':
        reg[node.target] = 'function() { return false; }';
        break;
      case 'ite':
        reg[node.target] = 'function() {\n  if (' + reg[node.cond] + '()) {\n' +
                           '    return ' + reg[node.true] + '();\n  } else {\n' +
                           '    return ' + reg[node.false] + '();\n  }\n}'
        break;
      case 'compound':
        reg[node.target] = 'function() {\n  if (!(' + reg[node.operand1] +
                           '())) {\n    return false;\n  } else {\n    return ' +
                           reg[node.operand2] + '()\n  }\n}';
        break;
      case 'setup':
        preLines.push('if (_______first_' + btc.name + ') {\n    ' + node.code +
                      '\n  }');
        break;
      case 'example':
        var msg = 'Failure in function ' + btc.name + ' for input ' +
                  node.input + ' and output ' + node.output;
        msg = '"' + msg.replace(new RegExp('\\"', 'g'), '\\"') + '"';
        var newInput = node.input.replace(
                         new RegExp(' *' + btc.name + ' *\\(', 'g'),
                         ' _______' + btc.name + '(');
        var newOutput = node.output.replace(
                         new RegExp(' *' + btc.name + ' *\\('),
                         ' _______' + btc.name + '(', 'g');
        preLines.push('if (_______first_' + btc.name + ') {\n' +
                      '  _______contract.enforce(' + makeExample(newInput, newOutput) +
                      ', ' + msg + ');\n}');
        break;
      case 'contract':
        reg[node.target] = {'type': 'contract', 'clause': reg[node.clause]};
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
  outArray.push('  _______first_' + btc.name + ' = false;')
  outArray.push('  var _______out = _______' + btc.name + '(' + paramString + ');')
  for (i = 0; i < postLines.length; i++) {
    outArray.push('  ' + postLines[i]);
  }
  outArray.push('}');
  if (outArray.length > 0) {
    outArray.push('');
  }
  return outArray.join("\n");
}

function processBytecode(btc, text) {
  var results = [];
  var names = [];
  var i;
  for (i = 0; i < btc.length; i++) {
    if (btc[i].type == 'function') {
      results.push(handleFunc(btc[i], text.split("\n")));
      names.push(btc[i].name);
    }
  }
  return {'result': results.join("\n"),
          'names': names};
}

function processFile(btc, text, depth) {
  var outJS = processBytecode(btc, text);
  var outString = "var _______contract = require('" +
                  new Array(depth + 1).join('../') +
                  ".contract.js');\n" +
                  "var _______enforce = _______contract.enforce;\n\n";
  var cleanedText = text;
  var i;
  var declarations = [];
  for (i = 0; i < outJS.names.length; i++) {
    cleanedText = cleanedText.replace(new RegExp('function ' +
                                      outJS.names[i] + ' *\\('),
                                      'function _______' + outJS.names[i] +
                                      '(', 'g');
    declarations.push('var _______first_' + outJS.names[i] + ' = true;');
  }
  outString += declarations.join("\n") + "\n\n" + cleanedText +
               "\n\n" + outJS.result;
  return outString;
}
