const readline = require('readline');
const https = require('https');

const API_KEY = 'Api_Key';
const MODEL = 'Model_Name';
const PROMPT = 'you>';
const passw = 'your_password';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});


function passwordcontrol() {
	  rl.question('Insert password: ', (sifre) => {
    if (sifre === passw) {
      console.log('Login is successful. Lexia is launching...');
      baslatBot();
    } else {
      console.log('Access denied.');
      passwordcontrol(); 
    }
  });
}


function baslatBot() {
  rl.setPrompt(PROMPT);
  console.log('Lexia was launched. Type "exit" to exit.');
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
          const reply = parsed.choices?.[0]?.message?.content || 'No response received';
          resolve(reply);
        } catch (e) {
          reject(new Error('Response resolution error'));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}


passwordcontrol();
