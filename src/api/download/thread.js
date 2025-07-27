import axios from 'axios';

async function threadDownloader(urls) {
  function getThreadIdFromUrl(url) {
    const match = url.match(/\/post\/([a-zA-Z0-9]+)/);
    return match ? match[1] : null;
  }

  const threadId = getThreadIdFromUrl(urls);
  if (!threadId) throw new Error("Thread ID tidak ditemukan dalam URL.");

  const response = await axios.get(
    `https://www.dolphinradar.com/api/threads/post_detail/${threadId}`,
    {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Mobile Safari/537.36',
        'Accept': 'application/json'
      }
    }
  );

  const data = response.data?.data;
  if (!data || !data.post_detail || !data.user) {
    throw new Error("kasian data tidak ditemukan wkwkw error tuhh");
  }

  const post = data.post_detail;
  const user = data.user;

  const mediaUrls = Array.isArray(post.media_list)
    ? post.media_list.map(media => media.url)
    : [];

  return {
    username: user.username,
    full_name: user.full_name,
    verified: user.verified || user.is_verified,
    profile: user.profile,
    follower: user.follower_count,
    caption: post.caption_text,
    like: post.like_count,
    media_urls: mediaUrls
  };
}

export default function (app) {
  app.get('/download/thread', async (req, res) => {
    const { url } = req.query;
    if (!url) {
      return res.status(400).json({
        status: false,
        message: 'Parameter "url" tidak boleh kosong.'
      });
    }

    try {
      const result = await threadDownloader(url);
      res.json({ status: true, ...result });
    } catch (err) {
      res.status(500).json({
        status: false,
        message: err.message || 'Terjadi kesalahan saat mengambil data Threads.'
      });
    }
  });
}
