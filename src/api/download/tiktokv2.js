import axios from 'axios'
import * as cheerio from 'cheerio'
import FormData from 'form-data'
import moment from 'moment-timezone'

async function tiktokV1(url) {
  const params = new URLSearchParams()
  params.set('url', url)
  params.set('hd', '1')

  const { data } = await axios.post('https://tikwm.com/api/', params, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      Cookie: 'current_language=en',
      'User-Agent': 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 Chrome/116 Mobile Safari/537.36'
    }
  })
  return data
}

async function tiktokV2(url) {
  const form = new FormData()
  form.append('q', url)

  const { data } = await axios.post('https://savetik.co/api/ajaxSearch', form, {
    headers: {
      ...form.getHeaders(),
      Accept: '*/*',
      Origin: 'https://savetik.co',
      Referer: 'https://savetik.co/en2',
      'User-Agent': 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 Chrome/137 Mobile Safari/537.36',
      'X-Requested-With': 'XMLHttpRequest'
    }
  })

  const $ = cheerio.load(data.data)
  const video_url = $('video#vid').attr('data-src')
  const slide_images = []

  $('.photo-list .download-box li').each((_, el) => {
    const img = $(el).find('.download-items__thumb img').attr('src')
    if (img) slide_images.push(img)
  })

  return {
    title: $('.thumbnail .content h3').text().trim(),
    thumbnail: $('.thumbnail .image-tik img').attr('src'),
    video_url,
    slide_images
  }
}

export default function (app) {
  app.get('/download/tiktok2', async (req, res) => {
    const { url } = req.query
    if (!url) {
      return res.status(400).json({ status: false, message: 'Parameter url tidak ditemukan' })
    }

    try {
      let result = {}
      let images = []

      const dataV1 = await tiktokV1(url)
      if (dataV1?.data) {
        const d = dataV1.data
        result = {
          title: d.title,
          region: d.region,
          duration: d.duration,
          upload_time: d.create_time
            ? moment.unix(d.create_time).tz('Asia/Jakarta').format('dddd, D MMMM YYYY [pukul] HH:mm:ss')
            : '-',
          stats: {
            views: d.play_count,
            likes: d.digg_count,
            comments: d.comment_count,
            shares: d.share_count,
            downloads: d.download_count
          },
          author: {
            username: d.author?.unique_id,
            nickname: d.author?.nickname
          },
          music: {
            title: d.music_info?.title,
            author: d.music_info?.author
          },
          cover: d.cover,
          video: d.play || d.hdplay || d.wmplay
        }

        if (Array.isArray(d.images) && d.images.length > 0) {
          images = d.images
        } else if (Array.isArray(d.image_post) && d.image_post.length > 0) {
          images = d.image_post
        }
      }

      const dataV2 = await tiktokV2(url)
      if (!result.video && dataV2.video_url) {
        result.video = dataV2.video_url
      }
      if (!images.length && dataV2.slide_images.length) {
        images = dataV2.slide_images
      }

      return res.json({
        status: true,
        ...result,
        images
      })
    } catch (err) {
      res.status(500).json({ status: false, message: err.message })
    }
  })
}
