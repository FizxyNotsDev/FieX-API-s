import axios from 'axios';
import FormData from 'form-data';

async function ihancerFromUrl(imageUrl, { method = 1, size = 'low' } = {}) {
  try {
    const _size = ['low', 'medium', 'high'];

    if (!imageUrl || typeof imageUrl !== 'string') throw new Error('❌ URL gambar tidak valid.');
    if (method < 1 || method > 4) throw new Error('❌ Method hanya tersedia: 1, 2, 3, 4.');
    if (!_size.includes(size)) throw new Error(`❌ Ukuran tersedia: ${_size.join(', ')}`);

    // Ambil gambar sebagai buffer
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data);

    const form = new FormData();
    form.append('method', method.toString());
    form.append('is_pro_version', 'false');
    form.append('is_enhancing_more', 'false');
    form.append('max_image_size', size);
    form.append('file', buffer, `ihancer_${Date.now()}.jpg`);

    const { data } = await axios.post('https://ihancer.com/api/enhance', form, {
      headers: {
        ...form.getHeaders(),
        'accept-encoding': 'gzip',
        host: 'ihancer.com',
        'user-agent': 'Dart/3.5 (dart:io)'
      },
      responseType: 'arraybuffer'
    });

    return Buffer.from(data);
  } catch (err) {
    throw new Error('❌ Gagal: ' + err.message);
  }
}

export default function (app) {
  app.get('/tools/ihancer', async (req, res) => {
    try {
      const { url, size = 'medium', method = '1' } = req.query;

      if (!url) {
        return res.status(400).json({
          status: false,
          message: '❌ Parameter ?url= harus diisi.'
        });
      }

      const enhancedBuffer = await ihancerFromUrl(url, {
        method: parseInt(method),
        size: size
      });

      res.setHeader('Content-Type', 'image/jpeg');
      res.end(enhancedBuffer);
    } catch (err) {
      res.status(500).json({
        status: false,
        message: err.message
      });
    }
  });
}
