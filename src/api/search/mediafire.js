import axios from 'axios'
import cheerio from 'cheerio'

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

async function mfsearch(query) {
  if (!query) throw new Error('Query is required')

  const { data: html } = await axios.get(`https://mediafiretrend.com/?q=${encodeURIComponent(query)}&search=Search`)
  const $ = cheerio.load(html)

  const links = shuffle(
    $('tbody tr a[href*="/f/"]')
      .map((_, el) => $(el).attr('href'))
      .get()
  ).slice(0, 5)

  const result = await Promise.all(
    links.map(async link => {
      const { data } = await axios.get(`https://mediafiretrend.com${link}`)
      const $ = cheerio.load(data)

      const raw = $('div.info tbody tr:nth-child(4) td:nth-child(2) script').text()
      const match = raw.match(/unescape\(['"`]([^'"`]+)['"`]\)/)
      if (!match) throw new Error('Download URL not found')

      const decoded = cheerio.load(decodeURIComponent(match[1]))

      return {
        filename: $('tr:nth-child(2) td:nth-child(2) b').text().trim(),
        filesize: $('tr:nth-child(3) td:nth-child(2)').text().trim(),
        url: decoded('a').attr('href'),
        source_url: $('tr:nth-child(5) td:nth-child(2)').text().trim(),
        source_title: $('tr:nth-child(6) td:nth-child(2)').text().trim()
      }
    })
  )

  return result
}

export default function (app) {
  app.get('/search/mediafire', async (req, res) => {
    const { q } = req.query
    if (!q) return res.status(400).json({ status: false, message: 'Missing query ?q=' })

    try {
      const results = await mfsearch(q)
      res.json({
        status: true,
        creator: 'FieX API',
        results
      })
    } catch (err) {
      res.status(500).json({ status: false, message: err.message })
    }
  })
}
