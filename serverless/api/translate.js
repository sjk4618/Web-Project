// serverless/api/translate.js
import axios from "axios";

export default async function handler(req, res) {
  try {
    // 1. 메소드 검증
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method Not Allowed. Use POST." });
    }

    // 2. 요청 본문 파싱
    const { text, source = "EN", target = "KO" } = req.body || req.query;

    // 3. 필수 파라미터 및 타입 유효성 검증
    if (typeof text !== "string" || text.trim() === "") {
      return res.status(400).json({
        error:
          "Invalid or missing 'text' parameter. Must be a non-empty string.",
      });
    }

    if (typeof source !== "string" || typeof target !== "string") {
      return res.status(400).json({
        error: "Invalid 'source' or 'target' language code. Must be strings.",
      });
    }

    // 4. API 키 검증
    const apiKey = process.env.DEEPL_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: "Translation service configuration error",
        details: "Missing DEEPL_API_KEY in environment",
      });
    }

    // 5. DeepL API 요청
    const response = await axios.post(
      "https://api-free.deepl.com/v2/translate",
      new URLSearchParams({
        auth_key: apiKey,
        text: text.trim(),
        source_lang: source.toUpperCase(),
        target_lang: target.toUpperCase(),
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        timeout: 10000,
      }
    );

    // 6. 응답 검증
    const translations = response?.data?.translations;
    if (!Array.isArray(translations) || !translations[0]?.text) {
      console.error("Unexpected DeepL API response:", response?.data);
      return res.status(502).json({
        error: "Invalid response format from translation service",
        details: "Missing 'translations[0].text' in response",
      });
    }

    return res.status(200).json({ translatedText: translations[0].text });
  } catch (err) {
    console.error("Translation API Error:", err);

    // 7. 에러 유형별 처리
    if (err.response) {
      return res.status(err.response.status).json({
        error: "Translation service error",
        details: err.response.data,
      });
    } else if (err.code === "ECONNABORTED") {
      return res.status(504).json({
        error: "Translation service timeout",
        details: "Request to DeepL timed out",
      });
    } else if (err.request) {
      return res.status(502).json({
        error: "No response from translation service",
        details: "Request sent but no response received",
      });
    } else {
      return res.status(500).json({
        error: "Translation failed",
        details: err.message || "Unknown error",
      });
    }
  }
}
