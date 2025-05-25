// serverless/api/translate.js
import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const { text, source = "en", target = "ko" } = req.body || req.query;

    const clientId = process.env.PAPAGO_CLIENT_ID;
    const clientSecret = process.env.PAPAGO_CLIENT_SECRET;

    const response = await axios.post(
      "https://openapi.naver.com/v1/papago/n2mt",
      new URLSearchParams({ source, target, text }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          "X-Naver-Client-Id": clientId,
          "X-Naver-Client-Secret": clientSecret,
        },
      }
    );

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json({ translatedText: response.data.message.result.translatedText });
  } catch (err) {
    res.status(500).json({ error: "Translation failed", details: err.message });
  }
}