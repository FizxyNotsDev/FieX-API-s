import axios from 'axios';
import { fromBuffer } from 'file-type';

const api_url = 'https://firebasevertexai.googleapis.com/v1beta';
const model_url = 'projects/gemmy-ai-bdc03/locations/us-central1/publishers/google/models';
const headers = {
  'content-type': 'application/json',
  'x-goog-api-client': 'gl-kotlin/2.1.0-ai fire/16.5.0',
  'x-goog-api-key': 'AIzaSyD6QwvrvnjU7j-R6fkOghfIVKwtvc7SmLk'
};

const ratio = ['1:1', '3:4', '4:3', '9:16', '16:9'];

const model = {
  search: ['gemini-2.0-flash', 'gemini-2.0-flash-001', 'gemini-2.5-flash', 'gemini-2.5-flash-lite-preview-06-17', 'gemini-2.5-pro'],
  chat: [
    'gemini-1.5-flash', 'gemini-1.5-flash-002', 'gemini-1.5-pro', 'gemini-1.5-pro-002',
    'gemini-2.0-flash', 'gemini-2.0-flash-001', 'gemini-2.0-flash-lite', 'gemini-2.0-flash-lite-001',
    'gemini-2.5-flash', 'gemini-2.5-flash-lite-preview-06-17', 'gemini-2.5-pro'
  ],
  image: [
    'imagen-3.0-generate-002', 'imagen-3.0-generate-001', 'imagen-3.0-fast-generate-001',
    'imagen-3.0-capability-001', 'imagen-4.0-generate-preview-06-06',
    'imagen-4.0-fast-generate-preview-06-06', 'imagen-4.0-ultra-generate-preview-06-06'
  ]
};

export default function(app) {

  // 🔹 Chat / Search
  app.get('/ai/gemmy/chat', async (req, res) => {
    const { q, model: mdl = 'gemini-1.5-flash', search = 'false' } = req.query;
    if (!q) return res.status(400).json({ status: false, message: 'Parameter ?q= wajib diisi' });
    if (!model.chat.includes(mdl)) return res.status(400).json({ status: false, message: `Model tidak valid. Gunakan salah satu: ${model.chat.join(', ')}` });
    if (search === 'true' && !model.search.includes(mdl)) return res.status(400).json({ status: false, message: 'Model tidak mendukung pencarian web.' });

    try {
      const parts = [{ text: q }];

      const payload = {
        model: `${model_url}/${mdl}`,
        contents: [{ role: 'user', parts }],
        ...(search === 'true' ? { tools: [{ googleSearch: {} }] } : {})
      };

      const { data } = await axios.post(`${api_url}/${model_url}/${mdl}:generateContent`, payload, { headers });
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) throw new Error('Tidak ada respons dari Gemini');
      res.json({ status: true, model: mdl, result: text });

    } catch (err) {
      res.status(500).json({ status: false, message: err.message });
    }
  });

  // 🔹 Image generation
  app.get('/ai/gemmy/image', async (req, res) => {
    const { prompt, model: mdl = 'imagen-3.0-generate-002', aspect_ratio = '1:1' } = req.query;
    if (!prompt) return res.status(400).json({ status: false, message: 'Parameter ?prompt= wajib diisi' });
    if (!model.image.includes(mdl)) return res.status(400).json({ status: false, message: `Model tidak valid. Gunakan: ${model.image.join(', ')}` });
    if (!ratio.includes(aspect_ratio)) return res.status(400).json({ status: false, message: `Rasio tidak valid. Gunakan: ${ratio.join(', ')}` });

    try {
      const payload = {
        instances: [{ prompt }],
        parameters: {
          sampleCount: 1,
          aspectRatio: aspect_ratio,
          includeRaiReason: true,
          safetySetting: 'block_only_high',
          personGeneration: 'allow_adult',
          addWatermark: false,
          imageOutputOptions: {
            mimeType: 'image/jpeg',
            compressionQuality: 100
          }
        }
      };

      const { data } = await axios.post(`${api_url}/${model_url}/${mdl}:predict`, payload, { headers });

      if (!data?.predictions?.[0]?.bytesBase64Encoded) throw new Error('Tidak ada gambar yang dihasilkan');

      const imageBuffer = Buffer.from(data.predictions[0].bytesBase64Encoded, 'base64');
      res.setHeader('Content-Type', 'image/jpeg');
      res.end(imageBuffer);

    } catch (err) {
      res.status(500).json({ status: false, message: err.message });
    }
  });

  // 🔹 Get all supported models
  app.get('/ai/gemmy-models', (_, res) => {
    res.json({
      status: true,
      available_models: model,
      available_aspect_ratios: ratio
    });
  });
}
