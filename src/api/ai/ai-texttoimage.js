import axios from "axios";

export default (app) => {
  // 1. Fungsi helper untuk kirim image + instructions ke DocsBot
  async function promptImage(base64Image, instructions) {
    try {
      const response = await axios.post(
        "https://docsbot.ai/api/tools/image-prompter",
        {
          type: "prompt",
          image: base64Image,
          instructions: instructions || ""
        },
        {
          headers: { "Content-Type": "application/json" }
        }
      );
      return response.data; // { status, prompt, ... }
    } catch (error) {
      console.error("Error prompting image:", error.response?.data || error.message);
      throw error;
    }
  }

  // 2. Route baru untuk image prompter
  app.post("/ai/image-prompt", async (req, res) => {
    try {
      const { image, instructions } = req.body;
      if (!image) {
        return res.status(400).json({ status: false, error: "Field `image` (base64) is required" });
      }

      const result = await promptImage(image, instructions);
      res.status(200).json({
        status: true,
        data: result
      });
    } catch (err) {
      res.status(500).json({ status: false, error: err.message });
    }
  });
};
