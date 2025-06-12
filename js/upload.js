document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('csvfile');
  const result = document.getElementById('upload-result');

  function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return 'c' + Math.abs(hash);
  }

  if (input) {
    input.addEventListener('change', () => {
      const file = input.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const text = reader.result.trim();
        const lines = text.split(/\r?\n/);
        const headers = lines.shift().split(',');
        const candidates = lines.filter(Boolean).map(line => {
          const values = line.split(',');
          const obj = {};
          headers.forEach((h, idx) => {
            obj[h.trim()] = values[idx] ? values[idx].trim() : '';
          });
          obj.id = simpleHash(obj.name + obj.party + obj.age);
          return obj;
        });
        localStorage.setItem('candidates', JSON.stringify(candidates));
        if (result) {
          result.textContent = `${candidates.length}件の候補者データを読み込みました。`;
        }
      };
      reader.readAsText(file);
    });
  }
});
