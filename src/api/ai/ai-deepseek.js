import axios from "axios"
import { EventSource } from "eventsource"

export default function (app) {
  app.get("/ai/deepseek", async (req, res) => {
    const { text, websearch } = req.query
    if (!text) {
      return res.status(400).json({ status: false, error: "Parameter 'text' wajib diisi" })
    }

    const useWebSearch = websearch === "true"
    const session_hash = Math.random().toString(36).substring(2)

    const payload = {
      data: [text, [], useWebSearch],
      event_data: null,
      fn_index: 2,
      session_hash
    }

    try {
      await axios.post(
        "https://ginigen-deepseek-r1-0528-api.hf.space/gradio_api/queue/join",
        payload,
        { headers: { "Content-Type": "application/json" } }
      )

      const es = new EventSource(
        `https://ginigen-deepseek-r1-0528-api.hf.space/gradio_api/queue/data?session_hash=${session_hash}`
      )

      es.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (data.msg === "process_completed") {
            es.close()
            return res.json({
              status: true,
              result: data.output
            })
          }
        } catch (e) {
          es.close()
          return res.status(500).json({ status: false, error: "Gagal parse response" })
        }
      }

      es.onerror = () => {
        es.close()
        return res.status(500).json({ status: false, error: "EventSource gagal terhubung" })
      }
    } catch (err) {
      return res.status(500).json({ status: false, error: err.message })
    }
  })
}
