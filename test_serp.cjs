const https = require('https');

const API_KEY = 'b256a7fc3fa835e2baaf5d9d2e68a8bde0c63d6c267ff5def3ff5199e4e32845';
const queries = ['translate hello to urdu', 'urdu translation for hello'];

queries.forEach(q => {
  const url = `https://serpapi.com/search.json?q=${encodeURIComponent(q)}&api_key=${API_KEY}`;
  https.get(url, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      const json = JSON.parse(data);
      console.log(`\n\n=== RESULT FOR: ${q} ===`);
      console.log("KEYS:", Object.keys(json));
      if (json.answer_box) console.log("ANSWER_BOX:", JSON.stringify(json.answer_box, null, 2));
    });
  });
});
