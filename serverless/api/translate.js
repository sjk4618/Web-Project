// serverless/api/translate.js
import axios from "axios";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const { text, source = "EN", target = "KO" } = req.body || req.query;
    const apiKey = process.env.DEEPL_API_KEY;

    const response = await axios.post(
      "https://api-free.deepl.com/v2/translate",
      new URLSearchParams({
        auth_key: apiKey,
        text,
        source_lang: source,
        target_lang: target,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    res.setHeader("Access-Control-Allow-Origin", "*");
    res
      .status(200)
      .json({ translatedText: response.data.translations[0].text });
  } catch (err) {
    res.status(500).json({ error: "Translation failed", details: err.message });
  }
}
