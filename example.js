/*
# Comment
*/

function f(x) {
  return x < 2 ? 1 : x * f(x-1);
}

console.log(f(4))
