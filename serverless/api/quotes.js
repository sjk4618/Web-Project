// serverless/api/quotes.js
import axios from "axios";
import https from "https";

const agent = new https.Agent({ rejectUnauthorized: false });

export default async function handler(req, res) {
  try {
    // 1. 메소드 검증
    if (req.method !== "GET") {
      return res
        .status(405)
        .json({ error: "Method Not Allowed. Only GET is supported." });
    }

    // 2. 쿼리 파라미터 검증
    if (!req.query || typeof req.query !== "object") {
      return res
        .status(400)
        .json({ error: "Invalid or missing query parameters." });
    }

    // 3. 숫자 파라미터 검증 (limit 등)
    const limit = parseInt(req.query.limit || "10", 10);
    if (isNaN(limit) || limit < 1 || limit > 50) {
      return res.status(400).json({
        error: "Invalid 'limit' value. It must be a number between 1 and 50.",
      });
    }

    const params = {
      ...req.query,
      limit,
    };

    // 4. 외부 API 호출
    const response = await axios.get("https://api.quotable.io/quotes/random", {
      params,
      httpsAgent: agent,
      timeout: 5000,
    });

    // 5. 응답 데이터 검증
    if (!response.data || !Array.isArray(response.data)) {
      console.error("Unexpected API response:", response.data);
      return res.status(502).json({
        error: "Invalid response from external API",
        details: "Expected an array of quotes",
      });
    }

    return res.status(200).json(response.data);
  } catch (err) {
    console.error("Quotes API Error:", err);

    if (err.response) {
      // 외부 API에서 에러 응답
      return res.status(err.response.status).json({
        error: "External API returned an error",
        details: err.response.data,
      });
    } else if (err.code === "ECONNABORTED") {
      // 타임아웃
      return res.status(504).json({
        error: "Timeout while fetching quotes",
        details: "The request to the external API timed out",
      });
    } else if (err.request) {
      // 요청했으나 응답 없음
      return res.status(502).json({
        error: "No response from external API",
        details: "The request was made but no response was received",
      });
    } else {
      // 기타 오류
      return res.status(500).json({
        error: "Internal server error",
        details: err.message || "Unknown error",
      });
    }
  }
}
