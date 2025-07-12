import axios from 'axios';
import cheerio from 'cheerio';

export default function (app) {
  app.get('/search/whatsapp', async (req, res) => {
    const keyword = req.query.q;
    if (!keyword) return res.status(400).json({ status: false, message: 'Query ?q= wajib diisi' });

    const headers = {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      "Referer": "https://groupda1.link/add/group/search",
      "Accept-Language": "en-US,en;q=0.9",
      "Accept": "text/html, */*; q=0.01",
      "Host": "groupda1.link",
      "Origin": "https://groupda1.link",
      "User-Agent": "Mozilla/5.0"
    };

    const keywords = keyword.split(',');
    const results = [];

    try {
      for (const k of keywords) {
        const trimmed = k.trim();
        let page = 0;

        while (page < 10) {
          const form = new URLSearchParams({
            group_no: page.toString(),
            search: 'true',
            keyword: trimmed
          });

          const response = await axios.post(
            'https://groupda1.link/add/group/loadresult',
            form,
            { headers }
          );

          if (!response.data || response.data.length === 0) break;

          const $ = cheerio.load(response.data);
          let found = false;

          $('.maindiv').each((_, el) => {
            const tag = $(el).find('a[href]');
            const link = tag.attr('href');
            const title = tag.attr('title')?.replace('Whatsapp group invite link: ', '');
            const desc = $(el).find('p.descri').text().trim() || 'Tidak ada deskripsi';
            const code = link?.split('/').pop();
            if (!code) return;

            const group_link = `https://chat.whatsapp.com/${code}`;
            if (!results.some(r => r.Code === code)) {
              results.push({
                Name: title,
                Link: group_link,
                Code: code,
                Description: desc,
                Keyword: trimmed
              });
              found = true;
            }
          });

          if (!found) break;
          page++;
        }
      }

      return res.json({
        status: true,
        keyword,
        total: results.length,
        groups: results
      });

    } catch (e) {
      return res.status(500).json({
        status: false,
        message: 'Scraper error',
        error: e.message
      });
    }
  });
}
