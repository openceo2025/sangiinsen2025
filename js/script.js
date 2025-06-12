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

  const list = document.getElementById('candidate-list');
  if (list) {
    const candidates = [
      { name: '候補者A', party: '党A', district: '選挙区1' },
      { name: '候補者B', party: '党B', district: '選挙区2' }
    ];
    candidates.forEach(c => {
      const div = document.createElement('div');
      div.className = 'card';
      div.innerHTML = `
        <h3>${c.name}</h3>
        <p>政党: ${c.party}</p>
        <p>選挙区: ${c.district}</p>
        <p><a href="candidate_detail.html">詳細</a></p>
      `;
      list.appendChild(div);
    });
  }
});
