import axios from "axios"
import { CookieJar } from "tough-cookie"
import { wrapper } from "axios-cookiejar-support"

function formatNumber(num) {
  return num.toLocaleString("en-US")
}

function toRupiah(usd, rate = 16000) {
  return "Rp " + formatNumber(Math.round(usd * rate))
}

async function tiktokMonet(username) {
  if (typeof username !== "string") {
    throw new Error("Type username must be string.")
  }

  const jar = new CookieJar()
  const client = wrapper(axios.create({ jar, withCredentials: true }))

  await client.get("https://tikcalculator.com/")
  const { data } = await client.get(`https://tikcalculator.com/result?username=${username}`)

  const result = {
    status: data.status,
    id: data.user_id,
    username: data.username,
    fullname: data.fullname,
    verified: data.verified ? "✅ Verified" : "❌ Not Verified",
    avatar: data.avatar,
    bio: data.bio,
    followers: formatNumber(data.followers),
    totalLikes: formatNumber(data.hearts),
    totalVideos: formatNumber(data.videos),
    estimatedEarningsUSD: `$${formatNumber(data.earnings.toFixed(2))}`,
    estimatedEarningsIDR: toRupiah(data.earnings)
  }

  return result
}

export default function (app) {
  app.get("/tiktok/monet", async (req, res) => {
    const { username } = req.query
    if (!username) {
      return res.status(400).json({ status: false, error: "Parameter 'username' wajib diisi" })
    }
    try {
      const result = await tiktokMonet(username)
      res.json({ status: true, result })
    } catch (err) {
      res.status(500).json({ status: false, error: err.message })
    }
  })
}
