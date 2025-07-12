import axios from 'axios';
import cheerio from 'cheerio';

async function searchGroups(keywords) {
  const headers = {
    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    "Referer": "https://groupda1.link/add/group/search",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept": "text/html, */*; q=0.01",
    "Host": "groupda1.link",
    "Origin": "https://groupda1.link",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
  };

  const results = [];
  const keywordList = keywords.split(',');

  for (const name of keywordList) {
    const keyword = name.trim();
    let loop_count = 0;

    while (loop_count < 10) {
      const data = {
        group_no: `${loop_count}`,
        search: true,
        keyword
      };

      try {
        const response = await axios.post(
          "https://groupda1.link/add/group/loadresult",
          new URLSearchParams(data),
          { headers, timeout: 10000 }
        );

        if (!response.data || response.data.length === 0) break;

        const $ = cheerio.load(response.data);
        let found = false;

        for (const maindiv of $('.maindiv').toArray()) {
          const tag = $(maindiv).find('a[href]');
          if (!tag.length) continue;

          const link = tag.attr('href');
          const title = tag.attr('title')?.replace('Whatsapp group invite link: ', '');
          const description_tag = $(maindiv).find('p.descri');
          const description = description_tag.text().trim() || 'Tidak ada deskripsi';
          const group_id = link.split('/').pop();
          const group_link = `https://chat.whatsapp.com/${group_id}`;

          if (!results.some(g => g.Code === group_id)) {
            results.push({
              Name: title,
              Code: group_id,
              Link: group_link,
              Description: description,
              Keyword: keyword
            });
            found = true;
          }
        }

        if (!found) break;
        loop_count++;
        await new Promise(r => setTimeout(r, 500));
      } catch {
        break;
      }
    }
  }

  return results;
}

export default async function handler(req, res) {
  const { q } = req.query;
  if (!q) {
    return res.status(400).json({
      status: false,
      message: 'Query parameter "q" wajib diisi.'
    });
  }

  try {
    const groups = await searchGroups(q);
    return res.json({
      status: true,
      total: groups.length,
      data: groups
    });
  } catch (e) {
    return res.status(500).json({
      status: false,
      message: 'Gagal scrape data.',
      error: e.message
    });
  }
}
