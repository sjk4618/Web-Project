// serverless/api/quotes.js
import axios from "axios";
import https from "https";

const agent = new https.Agent({ rejectUnauthorized: false });

export default async function handler(req, res) {
  try {
    // HTTP 메소드 검증
    if (req.method !== "GET") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    // 필수 파라미터 검증
    if (!req.query) {
      res.status(400).json({ error: "Missing query parameters" });
      return;
    }

    // 쿼리 파라미터를 모두 quotable API로 전달
    const params = {
      ...req.query,
      limit: req.query.limit || 10, // 기본값 10으로 설정
    };

    const response = await axios.get("https://api.quotable.io/quotes/random", {
      params,
      httpsAgent: agent,
      timeout: 5000, // 5초 타임아웃 설정
    });

    // 응답 데이터 검증
    if (!response.data || !Array.isArray(response.data)) {
      throw new Error("Invalid response format from quotable API");
    }

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json(response.data);
  } catch (err) {
    console.error("Quotes API Error:", err);

    // 에러 타입에 따른 적절한 상태 코드 반환
    if (err.response) {
      // API 서버에서 반환한 에러
      res.status(err.response.status).json({
        error: "Failed to fetch quotes from external API",
        details: err.response.data,
      });
    } else if (err.request) {
      // 요청은 보냈지만 응답을 받지 못한 경우
      res.status(504).json({
        error: "Timeout while fetching quotes",
        details: "The request to the quotes API timed out",
      });
    } else {
      // 기타 에러
      res.status(500).json({
        error: "Failed to fetch quotes",
        details: err.message,
      });
    }
  }
}
