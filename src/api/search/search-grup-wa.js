// src/api/search/whatsapp.js
import express from 'express';
import axios from 'axios';
import cheerio from 'cheerio';

export default function(app) {
  app.get('/search/whatsapp', async (req, res) => {
    const q = req.query.q;
    if (!q) return res.status(400).json({ status: false, message: 'Query q= diperlukan.' });

    try {
      const keywords = q.split(',').map(k => k.trim());
      const results = [];

      for (const keyword of keywords) {
        let page = 0;
        while (true) {
          const resp = await axios.post(
            'https://groupda1.link/add/group/loadresult',
            new URLSearchParams({ group_no: page.toString(), search: 'true', keyword }),
            {
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Referer': 'https://groupda1.link/add/group/search',
                'Origin': 'https://groupda1.link',
                'User-Agent': 'Mozilla/5.0',
              },
              timeout: 10000,
            }
          );
          const html = resp.data;
          const $ = cheerio.load(html);
          const items = $('.maindiv');
          if (!items.length) break;

          items.each((i, el) => {
            const tag = $(el).find('a[href]');
            const href = tag.attr('href');
            const title = tag.attr('title')?.replace('Whatsapp group invite link: ', '');
            const desc = $(el).find('p.descri').text().trim() || null;
            if (href && title) {
              const code = href.split('/').pop();
              const link = `https://chat.whatsapp.com/${code}`;
              if (!results.find(r => r.code === code)) {
                results.push({ name: title, code, link, description: desc, keyword });
              }
            }
          });

          page++;
          await new Promise(r => setTimeout(r, 500));
        }
      }

      res.json({ status: true, creator: 'FieX Team', result: results });
    } catch (e) {
      res.status(500).json({ status: false, message: e.message });
    }
  });
}
