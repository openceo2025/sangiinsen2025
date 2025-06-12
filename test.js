const fs = require('fs');
const assert = require('assert');

function loadDistrictData() {
  return fs.readFileSync('districts.csv', 'utf8')
    .trim()
    .split(/\r?\n/)
    .filter(Boolean)
    .map(line => line.split(',').map(v => v.trim()));
}

function loadZipMap() {
  const lines = fs.readFileSync('13TOKYO.CSV', 'utf8')
    .trim()
    .split(/\r?\n/);
  const map = {};
  lines.forEach(line => {
    const cols = line.split(/,(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/);
    const zip = cols[2].replace(/"/g, '');
    const city = cols[7].replace(/"/g, '');
    map[zip] = city;
  });
  return map;
}

const districtData = loadDistrictData();
const zipMap = loadZipMap();

function districtFromZip(zip) {
  const place = zipMap[zip];
  for (const row of districtData) {
    const [district, ...places] = row;
    if (places.includes(place)) return district;
  }
  return null;
}

assert.strictEqual(districtFromZip('1000001'), '選挙区1');
assert.strictEqual(districtFromZip('1030001'), '選挙区2');
assert.strictEqual(districtFromZip('1050001'), '選挙区3');
console.log('All tests passed');

