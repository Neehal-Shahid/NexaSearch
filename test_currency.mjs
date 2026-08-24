import fs from 'fs';
import https from 'https';

const env = fs.readFileSync('.env', 'utf8');
const key = env.split('\n').find(line => line.startsWith('GEMINI_API_KEY')).split('=')[1].trim();

const payload = JSON.stringify({
  contents: [{ role: 'user', parts: [{ text: '1 United States Dollar to Egyptian Pound' }] }],
  systemInstruction: {
    parts: [{ text: `You are a currency exchange rate calculator. Return ONLY the numerical conversion rate (e.g. 30.5) from the first currency to the second currency. No currency symbols, no text, no commas.` }]
  },
  generationConfig: { temperature: 0.1 }
});

const req = https.request({
  hostname: 'generativelanguage.googleapis.com',
  path: `/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${key}`,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': payload.length
  }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    const parsed = JSON.parse(data);
    console.log('Body:', parsed.candidates?.[0]?.content?.parts?.[0]?.text);
  });
});

req.on('error', console.error);
req.write(payload);
req.end();
