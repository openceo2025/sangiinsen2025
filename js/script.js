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

  const table = document.getElementById('candidate-table');
  if (table) {
    const tbody = table.querySelector('tbody');
    const candidates = [
      { name: '候補者A', party: '党A', district: '選挙区1' },
      { name: '候補者B', party: '党B', district: '選挙区2' }
    ];
    candidates.forEach(c => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${c.name}</td>
        <td>${c.party}</td>
        <td>${c.district}</td>
        <td><a href="candidate_detail.html">詳細</a></td>
      `;
      tbody.appendChild(tr);
    });
  }
});
