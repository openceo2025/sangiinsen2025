const fs = require('fs');
const assert = require('assert');

function loadDistrictData() {
  return fs.readFileSync('districts.csv', 'utf8')
    .trim()
    .split(/\r?\n/)
    .filter(Boolean)
    .map(line => line.split(',').map(v => v.trim()));
}

const data = loadDistrictData();
assert.strictEqual(data.length, 3);
const map = {};
data.forEach(row => {
  const [district, ...zips] = row;
  zips.forEach(z => { map[z] = district; });
});
assert.strictEqual(map['1000001'], '選挙区1');
console.log('All tests passed');

