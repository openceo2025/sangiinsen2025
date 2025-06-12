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

  function loadCandidates() {
    const data = localStorage.getItem('candidates');
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch (e) {
      return [];
    }
  }

  const list = document.getElementById('candidate-list');
  if (list) {
    const candidates = loadCandidates().filter(c => {
      if (params.get('party') && c.party !== params.get('party')) return false;
      if (params.get('district') && c.district !== params.get('district')) return false;
      if (params.get('zipcode') && c.zipcode !== params.get('zipcode')) return false;
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

  const detail = document.getElementById('candidate-detail');
  if (detail) {
    const id = params.get('id');
    const candidate = loadCandidates().find(c => c.id === id);
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
});
