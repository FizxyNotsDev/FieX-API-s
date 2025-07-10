import fs from 'fs';
import path from 'path';
import { createCanvas } from 'canvas';
import Jimp from 'jimp';

function colorize(ctx, width, colors) {
  if (Array.isArray(colors)) {
    let gradient = ctx.createLinearGradient(0, 0, width, 0);
    let step = 1 / (colors.length - 1);
    colors.forEach((color, index) => {
      gradient.addColorStop(index * step, color);
    });
    return gradient;
  } else {
    return colors;
  }
}

async function renderTextToBuffer(text, options = {}) {
  const width = 512;
  const height = 512;
  const margin = 20;
  const wordSpacing = 25;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = colorize(ctx, width, options.background) || "white";
  ctx.fillRect(0, 0, width, height);

  let fontSize = 150;
  const lineHeightMultiplier = 1.3;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.font = `${fontSize}px Sans-serif`;

  const words = text.split(" ");
  const datas = words.map(() => options.color || "black");

  let lines = [];
  function rebuildLines() {
    lines = [];
    let currentLine = "";
    for (let word of words) {
      if (ctx.measureText(word).width > width - 2 * margin) {
        fontSize -= 2;
        ctx.font = `${fontSize}px Sans-serif`;
        return rebuildLines();
      }
      let testLine = currentLine ? `${currentLine} ${word}` : word;
      let lineWidth =
        ctx.measureText(testLine).width +
        (currentLine.split(" ").length - 1) * wordSpacing;
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

  while (lines.length * fontSize * lineHeightMultiplier > height - 2 * margin) {
    fontSize -= 2;
    ctx.font = `${fontSize}px Sans-serif`;
    rebuildLines();
  }

  const lineHeight = fontSize * lineHeightMultiplier;
  let y = margin;
  let i = 0;
  for (let line of lines) {
    const wordsInLine = line.split(" ");
    let x = margin;
    const space =
      (width - 2 * margin - ctx.measureText(wordsInLine.join("")).width) /
      (wordsInLine.length - 1);
    for (let word of wordsInLine) {
      ctx.fillStyle = colorize(ctx, ctx.measureText(word).width, datas[i]);
      ctx.fillText(word, x, y);
      x += ctx.measureText(word).width + space;
      i++;
    }
    y += lineHeight;
  }

  const buffer = canvas.toBuffer("image/png");

  if (options.blur) {
    const img = await Jimp.read(buffer);
    img.blur(options.blur);
    return await img.getBufferAsync(Jimp.MIME_PNG);
  }

  return buffer;
}

export default function (app) {
  app.get('/tools/brat-sticker', async (req, res) => {
    const { text, bg = 'white', color = 'black', blur = 0 } = req.query;

    if (!text) {
      return res.status(400).json({
        status: false,
        message: '❌ Parameter `text` wajib diisi.'
      });
    }

    try {
      const buffer = await renderTextToBuffer(text, {
        background: bg,
        color,
        blur: parseInt(blur)
      });

      res.setHeader('Content-Type', 'image/png');
      res.send(buffer);
    } catch (err) {
      res.status(500).json({
        status: false,
        message: '❌ Gagal membuat brat-sticker.',
        error: err.message
      });
    }
  });
}
