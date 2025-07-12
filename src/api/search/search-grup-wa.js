import axios from 'axios';
import cheerio from 'cheerio';

export default function (app) {
  app.get('/search/whatsapp', async (req, res) => {
    const keyword = req.query.q || 'termux';
    const headers = {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      "Referer": "https://groupda1.link/add/group/search",
      "User-Agent": "Mozilla/5.0"
    };

    const results = [];

    try {
      for (let page = 0; page < 5; page++) {
        const form = new URLSearchParams({
          group_no: page.toString(),
          search: 'true',
          keyword
        });

        const response = await axios.post(
          'https://groupda1.link/add/group/loadresult',
          form,
          { headers }
        );

        const $ = cheerio.load(response.data);
        const maindivs = $('.maindiv');

        if (!maindivs.length) break;

        maindivs.each((_, el) => {
          const tag = $(el).find('a[href]');
          const link = tag.attr('href');
          const title = tag.attr('title')?.replace('Whatsapp group invite link: ', '');
          const desc = $(el).find('p.descri').text().trim();
          const code = link.split('/').pop();

          if (!results.find(r => r.code === code)) {
            results.push({
              name: title,
              link,
              code,
              description: desc || 'Tidak ada deskripsi',
              keyword
            });
          }
        });
      }

      res.json({
        status: true,
        total: results.length,
        results
      });

    } catch (err) {
      res.status(500).json({
        status: false,
        message: 'Terjadi kesalahan saat mengambil data.',
        error: err.message
      });
    }
  });
}
