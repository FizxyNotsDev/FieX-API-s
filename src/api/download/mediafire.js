import axios from "axios"
import * as cheerio from "cheerio"; // ⬅️ ESM style for latest Cheerio
import { lookup } from "mime-types"

function atob(str) {
  return Buffer.from(str, "base64").toString("binary")
}

async function mediafireDownload(url) {
  if (!url || !url.includes("mediafire.com")) {
    throw new Error("Invalid Mediafire URL")
  }

  const { data } = await axios.get("https://api.nekorinn.my.id/tools/rynn-stuff-v2", {
    params: {
      method: "GET",
      url,
      accessKey: "3ebcf782818cfa0b7265086f112ae25c0954afec762aa05a2eac66580c7cb353"
    }
  })

  const $ = cheerio.load(data.result.response)
  const raw = $("div.dl-info")

  const filename = $(".dl-btn-label").attr("title") || raw.find("div.intro div.filename").text().trim()
  const ext = filename?.split(".").pop() || ""
  const mimetype = lookup(ext.toLowerCase()) || null
  const filesize = raw.find("ul.details li:nth-child(1) span").text().trim()
  const uploaded = raw.find("ul.details li:nth-child(2) span").text().trim()
  const dl = $("a#downloadButton").attr("data-scrambled-url")

  if (!dl) throw new Error("Download link not found")

  return {
    filename,
    filesize,
    mimetype,
    uploaded,
    download_url: atob(dl)
  }
}

export default function (app) {
  app.get("/download/mediafire", async (req, res) => {
    const { url } = req.query
    if (!url) {
      return res.status(400).json({ status: false, message: "Parameter url diperlukan" })
    }

    try {
      const result = await mediafireDownload(url)
      res.json({ status: true, result })
    } catch (e) {
      res.status(500).json({ status: false, message: e.message })
    }
  })
}
