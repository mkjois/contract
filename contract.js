var fs = require("fs"),
    fparse = require("./function_parser"),
    cparse = require("./contract_parser").parser;

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
  for (var i in ast) {
    var func = ast[i];
    var newDocs = []
    for (var j in func.docs) {
      var doc = func.docs[j];
      var indexOfHash = doc.text.indexOf("#");
      if (indexOfHash >= 0) {
        var directive = doc.text.slice(indexOfHash);
        directive = cparse.parse(directive);
        doc.directive = directive;
        newDocs.push(doc);
      }
    }
    func.docs = newDocs;
  }
  console.log(JSON.stringify(ast, null, 4));
});
