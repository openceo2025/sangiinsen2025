document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const condition = document.getElementById('condition');
  if (condition) {
    const condText = ['party', 'district', 'relation', 'secret']
      .map(k => {
        if (!params.get(k)) return null;
        if (k === 'relation') return '統一教会との関わり報道あり';
        if (k === 'secret') return '裏金不記載報道あり';
        return `${k}: ${params.get(k)}`;
      })
      .filter(Boolean)
      .join(', ');
    condition.textContent = condText || '指定なし';
  }

  const seatCounts = {
    '自由民主党': 309,
    '立憲': 186,
    '維新': 55,
    '公明': 51,
    '国民': 39,
    '共産': 19,
    'れいわ': 14,
    '社会民主党': 4,
    '無所属': 3,
    'N国': 1,
    '参政': 1,
    '日本保守党（代表者：百田尚樹）': 1,
    '日本保守党（代表者：石濱哲信）': 1
  };

  const prefectureOrder = [
    '北海道', '青森', '岩手', '宮城', '秋田', '山形', '福島',
    '茨城', '栃木', '群馬', '埼玉', '千葉', '東京', '神奈川',
    '新潟', '富山', '石川', '福井', '山梨', '長野', '岐阜',
    '静岡', '愛知', '三重', '滋賀', '京都', '大阪', '兵庫',
    '奈良', '和歌山', '鳥取・島根', '岡山', '広島', '山口',
    '徳島・高知', '香川', '愛媛', '福岡', '佐賀', '長崎',
    '熊本', '大分', '宮崎', '鹿児島', '沖縄'
  ];

  function compareBySeat(a, b) {
    const diff = (seatCounts[b] || 0) - (seatCounts[a] || 0);
    if (diff !== 0) return diff;
    return a.localeCompare(b, 'ja');
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
      if (window.candidatesData) {
        return window.candidatesData.map(raw => {
          const obj = {
            name: raw['name'] || raw['氏名'] || '',
            age: raw['age'] || raw['年齢'] || '',
            party: raw['party'] || raw['所属政党'] || '',
            recommendation: raw['recommendation'] || raw['推薦'] || '',
            district: raw['district'] || raw['選挙区'] || '',
            proportionalRank: raw['proportional_rank'] || raw['順位'] || '',
            relation: raw['relation'] || raw['統一教会との関わり'] || '',
            reference: raw['reference'] || raw['出展'] || '',
            secretMoney: raw['secret_money'] || raw['裏金不記載額'] || '',
          };
          obj.id = simpleHash(obj.name + obj.party + obj.age);
          return obj;
        });
      }

      const res = await fetch('candidates.csv');
      const text = await res.text();
      const lines = text.trim().split(/\r?\n/);
      const headers = lines.shift().split(',');
      return lines.filter(Boolean).map(line => {
        const values = line.split(',');
        const raw = {};
        headers.forEach((h, idx) => {
          raw[h.trim()] = values[idx] ? values[idx].trim() : '';
        });
        const obj = {
          name: raw['name'] || raw['氏名'] || '',
          age: raw['age'] || raw['年齢'] || '',
          party: raw['party'] || raw['所属政党'] || '',
          recommendation: raw['recommendation'] || raw['推薦'] || '',
          district: raw['district'] || raw['選挙区'] || '',
          proportionalRank: raw['proportional_rank'] || raw['順位'] || '',
          relation: raw['relation'] || raw['統一教会との関わり'] || '',
          reference: raw['reference'] || raw['出展'] || '',
          secretMoney: raw['secret_money'] || raw['裏金不記載額'] || '',
        };
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
    const districts = (await loadCandidates())
      .map(c => c.district.trim())
      .filter(d => d && !d.includes('比例'));
    const unique = Array.from(new Set(districts)).sort((a, b) => {
      const ia = prefectureOrder.indexOf(a);
      const ib = prefectureOrder.indexOf(b);
      if (ia === -1 && ib === -1) return a.localeCompare(b, 'ja');
      if (ia === -1) return 1;
      if (ib === -1) return -1;
      return ia - ib;
    });
    loadDistrictData.cache = unique;
    return unique;
  }

  async function loadPartyList() {
    if (loadPartyList.cache) return loadPartyList.cache;
    const parties = (await loadCandidates())
      .map(c => c.party.trim())
      .filter(Boolean);
    const unique = Array.from(new Set(parties)).sort(compareBySeat);
    loadPartyList.cache = unique;
    return unique;
  }

  async function loadPrPartyList() {
    if (loadPrPartyList.cache) return loadPrPartyList.cache;
    const parties = (await loadProportionalData())
      .map(c => c.party.trim())
      .filter(Boolean);
    const unique = Array.from(new Set(parties)).sort(compareBySeat);
    loadPrPartyList.cache = unique;
    return unique;
  }

  async function loadProportionalData() {
    if (loadProportionalData.cache) return loadProportionalData.cache;
    const data = (await loadCandidates()).filter(c => c.district && c.district.includes('比例'));
    loadProportionalData.cache = data;
    return data;
  }

  async function populatePartyList() {
    const partySelect = document.getElementById('party-select');
    if (partySelect) {
      const parties = await loadPartyList();
      parties.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p;
        opt.textContent = p;
        partySelect.appendChild(opt);
      });
    }

    const prSelect = document.getElementById('pr-party-select');
    if (prSelect) {
      const prParties = await loadPrPartyList();
      prParties.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p;
        opt.textContent = p;
        prSelect.appendChild(opt);
      });
    }
  }

  async function populateDistrictList() {
    const select = document.getElementById('district-select');
    if (!select) return;
    const districts = await loadDistrictData();
    districts.forEach(district => {
      const opt = document.createElement('option');
      opt.value = district;
      opt.textContent = district;
      select.appendChild(opt);
    });
  }


  async function showCandidateList() {
    const list = document.getElementById('candidate-list');
    if (!list) return;

    const candidates = (await loadCandidates()).filter(c => {
      if (params.get('party') && c.party !== params.get('party')) return false;
      if (params.get('district') && c.district !== params.get('district')) return false;
      if (params.get('relation') === 'true' && !c.relation) return false;
      if (params.get('secret') === 'true' && !c.secretMoney) return false;
      return true;
    });
    candidates.forEach(c => {
      const div = document.createElement('div');
      div.className = 'card';
      div.innerHTML = `
        <h3>${c.name}</h3>
        <p>政党: ${c.party}</p>
        ${c.recommendation ? `<p>推薦: ${c.recommendation}</p>` : ''}
        <p>選挙区: ${c.district}</p>
        <p>年齢: ${c.age}</p>
        ${c.relation ? `<p class="relation has-relation">統一教会との関わり報道: あり</p>` : ''}
        ${c.secretMoney ? `<p class="secret-money has-secret">裏金不記載額: ${c.secretMoney}</p>` : ''}
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
        ${candidate.recommendation ? `<p>推薦: ${candidate.recommendation}</p>` : ''}
        <p>選挙区: ${candidate.district}</p>
        <p>年齢: ${candidate.age}</p>
        ${candidate.relation ? `<p>統一教会との関わり: ${candidate.relation}</p>` : ''}
        ${candidate.secretMoney ? `<p class="secret-money has-secret">裏金不記載額: ${candidate.secretMoney}</p>` : ''}
        ${candidate.reference ? `<p>出展: ${candidate.reference}</p>` : ''}
      `;
    } else {
      detail.textContent = '候補者情報が見つかりません。';
    }
  }

  async function showProportionalList() {
    const list = document.getElementById('pr-list');
    if (!list) return;
    const party = params.get('pr_party');
    const data = (await loadProportionalData()).filter(p => !party || p.party === party);
    const nameEl = document.getElementById('pr-party-name');
    if (nameEl && party) nameEl.textContent = party;
    data.forEach(row => {
      const div = document.createElement('div');
      div.className = 'card';
      const rank = row.proportionalRank ? `${row.proportionalRank}位 ` : '';
      div.innerHTML = `<p>${rank}${row.name}</p>`;
      list.appendChild(div);
    });
  }

  populatePartyList();
  populateDistrictList();
  showCandidateList();
  showCandidateDetail();
  showProportionalList();
});
