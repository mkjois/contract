var fs = require("fs");

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
  var lines = data.split("\n").slice(0, -1);
  for (var i in lines) {
    console.log(lines[i]);
  }
});
