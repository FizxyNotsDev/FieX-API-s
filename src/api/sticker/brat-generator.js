import fs from 'fs';
import path from 'path';
import { createCanvas } from 'canvas';
import Jimp from 'jimp';
import { execSync } from 'child_process';

// Color helper
function colorize(ctx, width, colors) {
  if (Array.isArray(colors)) {
    let gradient = ctx.createLinearGradient(0, 0, width, 0);
    let step = 1 / (colors.length - 1);
    colors.forEach((color, index) => {
      gradient.addColorStop(index * step, color);
    });
    return gradient;
  } else {
    return colors || 'black';
  }
}

// Render canvas to PNG buffer
async function renderTextToBuffer(text, options = {}) {
  const width = 512;
  const height = 512;
  const margin = 20;
  const wordSpacing = 25;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = colorize(ctx, width, options.background) || 'white';
  ctx.fillRect(0, 0, width, height);

  let fontSize = 150;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.font = `${fontSize}px Sans-serif`;
  const words = text.split(' ');
  const datas = words.map(() => options.color || 'black');
  let lines = [];

  function rebuildLines() {
    lines = [];
    let currentLine = '';
    for (let word of words) {
      if (ctx.measureText(word).width > width - 2 * margin) {
        fontSize -= 2;
        ctx.font = `${fontSize}px Sans-serif`;
        return rebuildLines();
      }
      let testLine = currentLine ? `${currentLine} ${word}` : word;
      let lineWidth = ctx.measureText(testLine).width + (currentLine.split(' ').length - 1) * wordSpacing;
      if (lineWidth < width - 2 * margin) {
        currentLine = testLine;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    if (currentLine) lines.push(currentLine);
  }

  rebuildLines();
  while (lines.length * fontSize * 1.3 > height - 2 * margin) {
    fontSize -= 2;
    ctx.font = `${fontSize}px Sans-serif`;
    rebuildLines();
  }

  const lineHeight = fontSize * 1.3;
  let y = margin;
  let i = 0;

  for (let line of lines) {
    const wordsInLine = line.split(' ');
    let x = margin;
    const space = (width - 2 * margin - ctx.measureText(wordsInLine.join('')).width) / (wordsInLine.length - 1);
    for (let word of wordsInLine) {
      ctx.fillStyle = colorize(ctx, ctx.measureText(word).width, datas[i]);
      ctx.fillText(word, x, y);
      x += ctx.measureText(word).width + space;
      i++;
    }
    y += lineHeight;
  }

  let buffer = canvas.toBuffer('image/png');
  if (options.blur) {
    const img = await Jimp.read(buffer);
    img.blur(Number(options.blur));
    buffer = await img.getBufferAsync(Jimp.MIME_PNG);
  }

  return buffer;
}

// Buat video dari beberapa frame teks
async function makeBratVideo(text, options = {}) {
  const tmpDir = path.join(process.cwd(), 'tmp_brat');
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

  const words = text.split(' ');
  const framePaths = [];
  for (let i = 0; i < words.length; i++) {
    const partial = words.slice(0, i + 1).join(' ');
    const buffer = await renderTextToBuffer(partial, options);
    const file = path.join(tmpDir, `frame_${i}.png`);
    fs.writeFileSync(file, buffer);
    framePaths.push(file);
  }

  const fileListPath = path.join(tmpDir, 'filelist.txt');
  const duration = { fast: 0.4, normal: 1, slow: 1.6 }[options.speed] || 1;
  let fileList = '';
  framePaths.forEach(f => {
    fileList += `file '${f}'\n`;
    fileList += `duration ${duration}\n`;
  });
  fileList += `file '${framePaths[framePaths.length - 1]}'\n`;
  fileList += `duration 2\n`;
  fs.writeFileSync(fileListPath, fileList);

  const output = path.join(tmpDir, `brat_${Date.now()}.mp4`);
  try {
    execSync(`ffmpeg -y -f concat -safe 0 -i "${fileListPath}" -vf "fps=30,format=yuv420p" "${output}"`);
  } catch (e) {
    throw new Error('ffmpeg error: ' + e.message);
  }

  framePaths.forEach(f => fs.existsSync(f) && fs.unlinkSync(f));
  fs.existsSync(fileListPath) && fs.unlinkSync(fileListPath);
  return output;
}

// ✅ EXPORT ROUTE
export default function (app) {
  app.get('/sticker/brat', async (req, res) => {
    const { text, type, color, bg, blur, speed } = req.query;

    if (!text || !type) {
      return res.status(400).json({
        status: false,
        message: 'Missing required query: text & type (image|video)'
      });
    }

    try {
      const opts = {
        color: parseColor(color),
        background: parseColor(bg),
        blur: blur ? parseInt(blur) : 1,
        speed
      };

      if (type === 'image') {
        const buffer = await renderTextToBuffer(text, opts);
        res.setHeader('Content-Type', 'image/png');
        return res.end(buffer);
      } else if (type === 'video') {
        const videoPath = await makeBratVideo(text, opts);
        res.setHeader('Content-Type', 'video/mp4');
        const stream = fs.createReadStream(videoPath);
        stream.pipe(res);
        stream.on('close', () => {
          fs.existsSync(videoPath) && fs.unlinkSync(videoPath);
        });
      } else {
        return res.status(400).json({
          status: false,
          message: 'Invalid type. Use "image" or "video".'
        });
      }
    } catch (err) {
      res.status(500).json({
        status: false,
        message: 'Error generating brat: ' + err.message
      });
    }
  });
}

// Parse warna: string atau JSON array
function parseColor(val) {
  if (!val) return null;
  try {
    return JSON.parse(val);
  } catch {
    return val;
  }
}
