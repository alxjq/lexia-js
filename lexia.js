#!/usr/bin/env bun


const readline = require('readline');
const https = require('https');

const API_KEY = process.env.api;
const MODEL = process.env.model;
const PROMPT = 'you>';
const DOGRU_SIFRE = process.env.passw;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});


function sifreKontrol() {
  rl.question('Şifreyi girin: ', (sifre) => {
    if (sifre === DOGRU_SIFRE) {
      console.log('Giriş başarılı. Lexia başlatılıyor...');
      baslatBot();
    } else {
      console.log('Erişim reddedildi.');
      sifreKontrol(); 
    }
  });
}


function baslatBot() {
  rl.setPrompt(PROMPT);
  console.log('Lexia başlatıldı. Çıkmak için "exit" yaz.');
  rl.prompt();

  rl.on('line', async (line) => {
    const input = line.trim();
    if (input === 'exit') {
      console.log('Bye!');
      rl.close();
      return;
    }

    try {
      const response = await sendToGroq(input);
      console.log(`cevap: ${response}`);
    } catch (err) {
      console.error('hata:', err.message);
    }

    rl.prompt();
  });
}


async function sendToGroq(promptText) {
  const data = JSON.stringify({
    messages: [
    { role: 'system',
     content:  `your_ai_personality`
     },
    {role: 'user', content: promptText
    }
    ],
    model: MODEL
  });

  const options = {
    hostname: 'api.groq.com',
    path: '/openai/v1/chat/completions',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Length': Buffer.byteLength(data)
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          const reply = parsed.choices?.[0]?.message?.content || 'yanıt alınamadı';
          resolve(reply);
        } catch (e) {
          reject(new Error('Yanıt çözümleme hatası'));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}


sifreKontrol();
