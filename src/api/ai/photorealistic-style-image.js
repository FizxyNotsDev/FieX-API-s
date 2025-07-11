import axios from 'axios';
import FormData from 'form-data';

const styleMap = {
  photorealistic: 'photorealistic style image',
  cinematic: 'cinematic style image',
  hyperreal: 'hyperrealistic style image',
  portrait: 'portrait style image'
};

const resolutionMap = {
  '512x512': { width: 512, height: 512 },
  '768x768': { width: 768, height: 768 },
  '1024x1024': { width: 1024, height: 1024 },
  '1920x1080': { width: 1920, height: 1080 }
};

async function RealisticImage({ prompt, style = 'photorealistic', resolution = '768x768', seed = null }) {
  const selectedStyle = styleMap[style.toLowerCase()];
  const selectedRes = resolutionMap[resolution];

  if (!selectedStyle || !selectedRes) {
    return { success: false, error: 'Style atau resolusi tidak tersedia' };
  }

  const fullPrompt = `${selectedStyle}: ${prompt}`;
  const form = new FormData();
  form.append('action', 'generate_realistic_ai_image');
  form.append('prompt', fullPrompt);
  form.append('seed', (seed || Math.floor(Math.random() * 100000)).toString());
  form.append('width', selectedRes.width.toString());
  form.append('height', selectedRes.height.toString());

  try {
    const res = await axios.post('https://realisticaiimagegenerator.com/wp-admin/admin-ajax.php', form, {
      headers: {
        ...form.getHeaders(),
        origin: 'https://realisticaiimagegenerator.com',
        referer: 'https://realisticaiimagegenerator.com/',
        'user-agent': 'Mozilla/5.0 (X11; Linux x86_64)',
        accept: '*/*'
      }
    });

    const json = res.data;
    if (json?.success && json.data?.imageUrl) {
      return { success: true, url: json.data.imageUrl };
    } else {
      return { success: false, error: 'Tidak ada hasil dari server' };
    }
  } catch (e) {
    return { success: false, error: e.message };
  }
}

// ✅ Ekspor fungsi router Express
export default function (app) {
  app.get('/ai/realistic', async (req, res) => {
    const { prompt, style = 'cinematic', resolution = '768x768', seed } = req.query;

    if (!prompt) {
      return res.status(400).json({ status: false, message: 'Parameter "prompt" wajib diisi' });
    }

    try {
      const result = await RealisticImage({ prompt, style, resolution, seed });

      if (result.success) {
        res.json({
          status: true,
          prompt,
          image: result.url
        });
      } else {
        res.status(500).json({ status: false, message: result.error });
      }
    } catch (err) {
      res.status(500).json({ status: false, message: err.message });
    }
  });
}
