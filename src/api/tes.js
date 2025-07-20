import fs from 'fs';
import path from 'path';

const startTime = Date.now();
let totalRequest = 0;

export default function(app) {
  // Middleware counter request
  app.use((req, res, next) => {
    totalRequest++;
    next();
  });

  // Route: /api/status
  app.get('/api/status', async (req, res) => {
    try {
      const filePath = path.resolve('src/setting.json');
      const settingRaw = fs.readFileSync(filePath, 'utf-8');
      const settingData = JSON.parse(settingRaw);

      // Hitung total fitur
      let totalfitur = 0;
      if (Array.isArray(settingData)) {
        for (const kategori of settingData) {
          if (Array.isArray(kategori.items)) {
            totalfitur += kategori.items.length;
          }
        }
      }

      // Hitung runtime
      const runtimeMs = Date.now() - startTime;
      const minutes = Math.floor(runtimeMs / 60000);
      const seconds = Math.floor((runtimeMs % 60000) / 1000);
      const runtime = `${minutes}m ${seconds}s`;

      // Kirim respon
      res.json({
        status: true,
        creator: "FieX Team",
        result: {
          status: "Aktif",
          totalrequest: totalRequest.toString(),
          totalfitur,
          runtime,
          domain: "restapis.flex.biz.id"
        }
      });

    } catch (err) {
      console.error('[STATUS API ERROR]', err);
      res.status(500).json({
        status: false,
        message: "Gagal mengambil data status"
      });
    }
  });
}
