// serverless/api/translate.js
import axios from "axios";

export default async function handler(req, res) {
  try {
    // HTTP 메소드 검증
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    // 요청 본문 검증
    const { text, source = "EN", target = "KO" } = req.body || req.query;

    if (!text) {
      res.status(400).json({ error: "Missing required text parameter" });
      return;
    }

    // API 키 검증
    const apiKey = process.env.DEEPL_API_KEY;
    if (!apiKey) {
      res
        .status(500)
        .json({ error: "Translation service configuration error" });
      return;
    }

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
        timeout: 10000, // 10초 타임아웃 설정
      }
    );

    // 응답 데이터 검증
    if (
      !response.data ||
      !response.data.translations ||
      !response.data.translations[0]
    ) {
      throw new Error("Invalid response format from DeepL API");
    }

    res.setHeader("Access-Control-Allow-Origin", "*");
    res
      .status(200)
      .json({ translatedText: response.data.translations[0].text });
  } catch (err) {
    console.error("Translation API Error:", err);

    // 에러 타입에 따른 적절한 상태 코드 반환
    if (err.response) {
      // DeepL API에서 반환한 에러
      res.status(err.response.status).json({
        error: "Translation service error",
        details: err.response.data,
      });
    } else if (err.request) {
      // 요청은 보냈지만 응답을 받지 못한 경우
      res.status(504).json({
        error: "Translation service timeout",
        details: "The request to the translation service timed out",
      });
    } else {
      // 기타 에러
      res.status(500).json({
        error: "Translation failed",
        details: err.message,
      });
    }
  }
}
