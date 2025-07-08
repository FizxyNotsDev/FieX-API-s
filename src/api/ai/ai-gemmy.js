import axios from 'axios';

export default function (app) {
  app.get('/ai/gemmy/chat', async (req, res) => {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        status: false,
        message: '❌ Parameter ?q= harus diisi.'
      });
    }

    const api_url = 'https://firebasevertexai.googleapis.com/v1beta';
    const model = 'gemini-2.0-flash';
    const model_url = `projects/gemmy-ai-bdc03/locations/us-central1/publishers/google/models/${model}`;

    const headers = {
      'content-type': 'application/json',
      'x-goog-api-client': 'gl-kotlin/2.1.0-ai fire/16.5.0',
      'x-goog-api-key': 'AIzaSyD6QwvrvnjU7j-R6fkOghfIVKwtvc7SmLk'
    };

    const body = {
      model: model_url,
      contents: [
        {
          role: 'user',
          parts: [{ text: q }]
        }
      ],
      tools: [{ googleSearch: {} }]
    };

    try {
      const response = await axios.post(`${api_url}/${model_url}:generateContent`, body, { headers });
      const result = response?.data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!result) throw new Error('❌ Tidak ada respon dari model.');

      res.json({
        status: true,
        creator: 'FieX',
        result
      });
    } catch (err) {
      res.status(500).json({
        status: false,
        message: '❌ Error: ' + err.message
      });
    }
  });
}
