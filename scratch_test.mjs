import fs from 'fs';
import https from 'https';

const env = fs.readFileSync('.env', 'utf8');
const key = env.split('\n').find(line => line.startsWith('GEMINI_API_KEY')).split('=')[1].trim();

const payload = JSON.stringify({
  contents: [{ role: 'user', parts: [{ text: 'Context from web search for query "test":\n\nUser Question/Context: Please provide a comprehensive AI overview for my search query: "test"' }] }],
  systemInstruction: { parts: [{ text: 'You are Nexa AI, an intelligent search assistant. Use the provided search context to answer the user\\'s questions if relevant. If the context does not contain the answer, or if the user asks a general question, use your own knowledge to help them. Keep answers readable, concise, and use markdown (like **bold** and * lists).' }] },
  generationConfig: { temperature: 0.7 }
});

const req = https.request({
  hostname: 'generativelanguage.googleapis.com',
  path: '/v1beta/models/gemini-3.5-flash-lite:generateContent?key=' + key,
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) }
}, res => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => console.log('Status:', res.statusCode, 'Body:', data));
});
req.on('error', console.error);
req.write(payload);
req.end();
