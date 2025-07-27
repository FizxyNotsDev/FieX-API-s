import axios from 'axios'
import cheerio from 'cheerio'
import { lookup } from 'mime-types'

function atob(str) {
  return Buffer.from(str, 'base64').toString('binary')
}

async function mediafire(url) {
  try {
    if (!url.includes('www.mediafire.com')) throw new Error('Invalid Mediafire URL')

    const { data } = await axios.get('https://api.nekorinn.my.id/tools/rynn-stuff-v2', {
      params: {
        method: 'GET',
        url: url,
        accessKey: '3ebcf782818cfa0b7265086f112ae25c0954afec762aa05a2eac66580c7cb353'
      }
    })

    const $ = cheerio.load(data.result.response)
    const raw = $('div.dl-info')

    const filename = $('.dl-btn-label').attr('title') || raw.find('div.intro div.filename').text().trim() || null
    const ext = filename?.split('.').pop() || ''
    const mimetype = lookup(ext.toLowerCase()) || null

    const filesize = raw.find('ul.details li:nth-child(1) span').text().trim()
    const uploaded = raw.find('ul.details li:nth-child(2) span').text().trim()

    const dl = $('a#downloadButton').attr('data-scrambled-url')
    if (!dl) throw new Error('Download link not found')

    return {
      filename,
      filesize,
      mimetype,
      uploaded,
      download_url: atob(dl)
    }
  } catch (error) {
    throw new Error(error.message)
  }
}

export default function (app) {
  app.get('/download/mediafire', async (req, res) => {
    const url = req.query.url
    if (!url) return res.status(400).json({ error: 'Missing url parameter' })

    try {
      const result = await mediafire(url)
      res.json(result)
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  })
}
