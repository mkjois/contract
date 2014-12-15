function f(x, y, z) {
  /**
   * #contract: all y, x are number; z is below(4, "abc", null, +7.3e-1)
   * #contract: y is 4 or "word" and not -23.7e-2
   * #setup: my_z = ["a", {one: 1}]
   * #example: f(5, null, my_z) => 120
   */
  if (x < 2) {
    return 1;
  }
  return x * f(x-1);
}

function (a,b) {
  // yolo
  // swag
  // money
  return 5;
}

function g  (x, y) {
  /**
   * #contract: x is sorted and not null
   * #contract: if x is sorted then y is sorted else x is not sorted
   */
}
