if (typeof(module) !== 'undefined') {
  var fs = require("fs"),
      fparse = require("./function_grammar"),
      cparse = require("./contract_grammar").parser,
      bytecode = require("./bytecode");
      compiler = require("./compiler");
}

var outfile = "out.js";

var args = process.argv.slice(2).filter(function(arg) {
  return arg.charAt(0) !== "-";
});

if (args.length === 0) {
  console.error("No input file specified.");
  process.exit(1);
} else {
  infile = args[0];
}

fs.readFile(infile, {encoding: "utf-8"}, function(err, data) {
  if (err) { throw err; }
  var ast = fparse.parse(data);
  var newAst = [];
  for (var i in ast) {
    var func = ast[i];
    if (func.name !== null) {
      var newDocs = []
      for (var j in func.docs) {
        var doc = func.docs[j];
        var indexOfHash = doc.text.indexOf("#");
        if (indexOfHash >= 0) {
          var directive = doc.text.slice(indexOfHash);
          try {
            directive = cparse.parse(directive);
          } catch (e) {
            if (e.message.slice(0, 11) == "Parse error") {
              e.message = e.message.replace("1", doc.line);
            }
            console.error(e.message);
            process.exit(1);
          }
          doc.directive = directive;
          newDocs.push(doc);
        }
      }
      func.docs = newDocs;
      newAst.push(func);
    } else {
      console.log("Warning: function at line " + func.line +
                  ", column " + func.column +
                  " has no name and will not be tested");
    }
  }
  //console.log(JSON.stringify(ast, null, 4));
  var btc = bytecode.compile(newAst);
  console.log(JSON.stringify(btc, null, 4));
  var jscode = compiler.processBytecode(btc);
  console.log(jscode)
});
