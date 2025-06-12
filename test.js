const fs = require('fs');
const assert = require('assert');
function loadList(file) {
  return fs.readFileSync(file, 'utf8').trim().split(/\r?\n/).filter(Boolean);
}
assert.strictEqual(loadList('districts.csv').length, 3);
assert.strictEqual(loadList('zipcodes.csv').length, 3);
console.log('All tests passed');
