import fs from 'fs';
import https from 'https';

const env = fs.readFileSync('.env', 'utf8');
const key = env.split('\n').find(line => line.startsWith('GEMINI_API_KEY')).split('=')[1].trim();

const payload = JSON.stringify({
  contents: [{ role: 'user', parts: [{ text: 'how are you' }] }],
  systemInstruction: {
    parts: [{ text: `You are a professional translator. Translate the given text from English to Urdu. Respond ONLY with the translated text, nothing else. No quotes, no explanations.` }]
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
    console.log('Body:', data);
  });
});

req.on('error', console.error);
req.write(payload);
req.end();
