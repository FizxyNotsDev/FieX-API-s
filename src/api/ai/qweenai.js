import axios from 'axios';
import https from 'https';

function generateSessionHash(length = 11) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let hash = '';
  for (let i = 0; i < length; i++) {
    hash += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return hash;
}

async function qwenAI(input) {
  const session_hash = generateSessionHash();

  const headers = {
    "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Mobile Safari/537.36",
    "Accept": "*/*",
    "Content-Type": "application/json"
  };

  const payload = {
    data: [
      input,
      [],
      "saya adalah asisten yang baik"
    ],
    event_data: null,
    fn_index: 1,
    trigger_id: 14,
    session_hash
  };

  const requestUrl = `https://qwen-qwen2-72b-instruct.hf.space/queue/join?__theme=system`;
  const streamUrl = `https://qwen-qwen2-72b-instruct.hf.space/queue/data?session_hash=${session_hash}`;

  await axios.post(requestUrl, payload, { headers });

  return new Promise((resolve, reject) => {
    https.get(streamUrl, { headers }, (res) => {
      let buffer = '';

      res.on('data', (chunk) => {
        buffer += chunk.toString();

        const parts = buffer.split('\n\n');
        buffer = parts.pop();

        for (const part of parts) {
          if (part.startsWith('data:')) {
            const json = part.replace('data: ', '').trim();
            try {
              const parsed = JSON.parse(json);
              if (parsed.msg === 'process_completed') {
                const result = parsed.output?.data?.[1]?.[0]?.[1];
                if (result) return resolve(result);
                else return reject(new Error('output.data[1][0][1] tidak ditemukan'));
              }
            } catch (e) {
              // ignore parse error
            }
          }
        }
      });

      res.on('error', reject);
      res.on('end', () => reject(new Error('Stream selesai tanpa menerima process_completed')));
    });
  });
}

// ✅ ROUTE REST API: /ai/qwenai?text=halo
export default function (app) {
  app.get('/ai/qwenai', async (req, res) => {
    const { text } = req.query;
    if (!text) return res.status(400).json({ sukses: false, pesan: 'Parameter "text" wajib diisi' });

    try {
      const hasil = await qwenAI(text);
      res.json({ sukses: true, hasil });
    } catch (err) {
      res.status(500).json({ sukses: false, pesan: err.message });
    }
  });
}
