document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const condition = document.getElementById('condition');
  if (condition) {
    const condText = ['party', 'district', 'zipcode']
      .map(k => params.get(k) ? `${k}: ${params.get(k)}` : null)
      .filter(Boolean)
      .join(', ');
    condition.textContent = condText || '指定なし';
  }

  function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return 'c' + Math.abs(hash);
  }

  async function loadCandidates() {
    try {
      const res = await fetch('candidates.csv');
      const text = await res.text();
      const lines = text.trim().split(/\r?\n/);
      const headers = lines.shift().split(',');
      return lines.filter(Boolean).map(line => {
        const values = line.split(',');
        const obj = {};
        headers.forEach((h, idx) => {
          obj[h.trim()] = values[idx] ? values[idx].trim() : '';
        });
        obj.id = simpleHash(obj.name + obj.party + obj.age);
        return obj;
      });
    } catch (e) {
      console.error('CSV読み込みエラー', e);
      return [];
    }
  }

  async function loadList(file) {
    try {
      const res = await fetch(file);
      const text = await res.text();
      return text.trim().split(/\r?\n/).filter(Boolean);
    } catch (e) {
      console.error('CSV読み込みエラー', e);
      return [];
    }
  }

  async function loadDistrictData() {
    if (loadDistrictData.cache) return loadDistrictData.cache;
    const lines = await loadList('districts.csv');
    const data = lines.map(l => l.split(',').map(s => s.trim()).filter(Boolean));
    loadDistrictData.cache = data;
    return data;
  }

  async function loadZipMap() {
    if (loadZipMap.cache) return loadZipMap.cache;
    const res = await fetch('13TOKYO.CSV');
    const text = await res.text();
    const lines = text.trim().split(/\r?\n/);
    const map = {};
    lines.forEach(line => {
      const cols = line.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/);
      const zip = cols[2].replace(/"/g, '');
      const city = cols[7].replace(/"/g, '');
      map[zip] = city;
    });
    loadZipMap.cache = map;
    return map;
  }

  async function populatePartyList() {
    const select = document.getElementById('party-select');
    if (!select) return;
    const candidates = await loadCandidates();
    const parties = [...new Set(candidates.map(c => c.party))];
    parties.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p;
      opt.textContent = p;
      select.appendChild(opt);
    });
  }

  async function populateDistrictList() {
    const select = document.getElementById('district-select');
    if (!select) return;
    const data = await loadDistrictData();
    data.forEach(row => {
      const district = row[0];
      const opt = document.createElement('option');
      opt.value = district;
      opt.textContent = district;
      select.appendChild(opt);
    });
  }

  async function populateZipcodeInput() {
    // テキスト入力なので特に初期化処理は不要
  }

  async function showCandidateList() {
    const list = document.getElementById('candidate-list');
    if (!list) return;
    const districtData = await loadDistrictData();
    const zipMap = await loadZipMap();
    let districtFromZip = null;
    const zip = params.get('zipcode');
    if (zip) {
      const place = zipMap[zip];
      if (place) {
        for (const row of districtData) {
          if (row.slice(1).includes(place)) {
            districtFromZip = row[0];
            break;
          }
        }
      }
    }

    const candidates = (await loadCandidates()).filter(c => {
      if (params.get('party') && c.party !== params.get('party')) return false;
      if (params.get('district') && c.district !== params.get('district')) return false;
      if (districtFromZip && c.district !== districtFromZip) return false;
      return true;
    });
    candidates.forEach(c => {
      const div = document.createElement('div');
      div.className = 'card';
      div.innerHTML = `
        <h3>${c.name}</h3>
        <p>政党: ${c.party}</p>
        <p>選挙区: ${c.district}</p>
        <p>年齢: ${c.age}</p>
        <p><a href="candidate_detail.html?id=${c.id}">詳細</a></p>
      `;
      list.appendChild(div);
    });
  }

  async function showCandidateDetail() {
    const detail = document.getElementById('candidate-detail');
    if (!detail) return;
    const id = params.get('id');
    const candidate = (await loadCandidates()).find(c => c.id === id);

    if (candidate) {
      detail.innerHTML = `
        <h2>${candidate.name}</h2>
        <p>政党: ${candidate.party}</p>
        <p>選挙区: ${candidate.district}</p>
        <p>年齢: ${candidate.age}</p>
      `;
    } else {
      detail.textContent = '候補者情報が見つかりません。';
    }
  }

  populatePartyList();
  populateDistrictList();
  populateZipcodeInput();
  showCandidateList();
  showCandidateDetail();
});
