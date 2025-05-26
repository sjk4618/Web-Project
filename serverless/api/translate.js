// serverless/api/translate.js
import axios from "axios";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    let { text, source = "EN", target = "KO" } = req.body || req.query;
    const apiKey = process.env.DEEPL_API_KEY;

    // text가 배열이 아니면 배열로 변환
    if (!Array.isArray(text)) {
      text = [text];
    }

    const params = new URLSearchParams({
      auth_key: apiKey,
      source_lang: source,
      target_lang: target,
    });
    // 여러 문장 추가
    text.forEach((t) => params.append("text", t));

    const response = await axios.post(
      "https://api-free.deepl.com/v2/translate",
      params,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json({
      translatedTexts: response.data.translations.map((tr) => tr.text),
    });
  } catch (err) {
    res.status(500).json({ error: "Translation failed", details: err.message });
  }
}
