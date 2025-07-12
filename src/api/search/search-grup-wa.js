// /api/search/whatsapp.js
import axios from 'axios';
import cheerio from 'cheerio';

export default function (app) {
  app.get('/search/whatsapp', async (req, res) => {
    const q = req.query.q;
    if (!q) {
      return res.status(400).json({
        status: false,
        message: 'Parameter "q" (keyword) wajib diisi. Contoh: /search/whatsapp?q=belajar,programming'
      });
    }

    const headers = {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      "Referer": "https://groupda1.link/add/group/search",
      "Accept-Language": "en-US,en;q=0.9",
      "Accept": "text/html, */*; q=0.01",
      "Origin": "https://groupda1.link",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/91.0.4472.124 Safari/537.36"
    };

    const results = [];
    const keywordList = q.split(',');

    for (const name of keywordList) {
      const keyword = name.trim();
      for (let page = 0; page < 10; page++) {
        const data = new URLSearchParams({
          group_no: `${page}`,
          search: 'true',
          keyword
        });

        try {
          const response = await axios.post(
            'https://groupda1.link/add/group/loadresult',
            data,
            { headers }
          );

          const $ = cheerio.load(response.data);
          let found = false;

          $('.maindiv').each((_, el) => {
            const tag = $(el).find('a[href]');
            if (!tag.length) return;

            const href = tag.attr('href');
            const title = tag.attr('title')?.replace('Whatsapp group invite link: ', '') ?? 'Tanpa Nama';
            const description = $(el).find('p.descri').text().trim() || 'Tidak ada deskripsi';
            const code = href?.split('/').pop();
            const link = `https://chat.whatsapp.com/${code}`;

            if (!results.some(r => r.Code === code)) {
              results.push({
                Name: title,
                Link: link,
                Code: code,
                Description: description,
                Keyword: keyword
              });
              found = true;
            }
          });

          if (!found) break;
        } catch (err) {
          break;
        }
      }
    }

    res.json({
      status: true,
      keyword: keywordList,
      found: results.length,
      results
    });
  });
}
