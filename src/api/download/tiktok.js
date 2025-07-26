import axios from 'axios'
import qs from 'qs'
import cheerio from 'cheerio'

async function tikDownloader(urlss) {
  const data = qs.stringify({ q: urlss, lang: 'id' })
  const headers = {
    'X-Requested-With': 'XMLHttpRequest',
    'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Mobile Safari/537.36',
    'Accept': '*/*',
    'Accept-Language': 'id,en-US;q=0.9,en;q=0.8',
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    'Referer': 'https://tikdownloader.io/id',
    'Origin': 'https://tikdownloader.io'
  }

  try {
    const response = await axios.post('https://tikdownloader.io/api/ajaxSearch', data, { headers })
    const $ = cheerio.load(response.data.data)

    const links = {}
    $('a.tik-button-dl').each((i, el) => {
      const text = $(el).text().trim()
      const href = $(el).attr('href')

      if (text.includes('Unduh MP4 [1]')) links.mp4_1 = href
      else if (text.includes('Unduh MP4 [2]')) links.mp4_2 = href
      else if (text.includes('Unduh MP4 HD')) links.mp4_hd = href
      else if (text.includes('Unduh MP3')) links.mp3 = href
    })

    return links
  } catch (error) {
    return { error: true, message: error.message }
  }
}

export default function(app) {
  app.get('/download/tiktok', async (req, res) => {
    const { url } = req.query
    if (!url) return res.status(400).json({ error: true, message: 'Masukkan parameter ?url=' })

    const result = await tikDownloader(url)
    res.json(result)
  })
}
