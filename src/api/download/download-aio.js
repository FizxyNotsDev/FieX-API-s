import axios from "axios";

export default (app) => {
  async function aioDownloader(url) {
    if (!url || !url.startsWith("https://")) {
      throw new Error("URL tidak valid atau kosong");
    }

    try {
      const { data } = await axios.post(
        "https://auto-download-all-in-one.p.rapidapi.com/v1/social/autolink",
        { url },
        {
          headers: {
            "accept-encoding": "gzip",
            "cache-control": "no-cache",
            "content-type": "application/json; charset=utf-8",
            referer: "https://auto-download-all-in-one.p.rapidapi.com/",
            "user-agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36 OPR/78.0.4093.184",
            "x-rapidapi-host": "auto-download-all-in-one.p.rapidapi.com",
            "x-rapidapi-key": "1dda0d29d3mshc5f2aacec619c44p16f219jsn99a62a516f98",
          },
        }
      );

      return data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message);
    }
  }

  app.get("/download/aio", async (req, res) => {
    try {
      const { url } = req.query;
      if (!url) return res.status(400).json({ status: false, error: "Parameter url wajib diisi" });

      const result = await aioDownloader(url);

      // Kembalikan seluruh data response tanpa modifikasi
      res.status(200).json({
        status: true,
        ...result,
      });
    } catch (error) {
      res.status(500).json({ status: false, error: error.message });
    }
  });
};
