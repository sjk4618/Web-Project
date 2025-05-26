// serverless/api/quotes.js
import axios from "axios";
import https from "https";

const agent = new https.Agent({ rejectUnauthorized: false });

export default async function handler(req, res) {
  try {
    // 쿼리 파라미터를 모두 quotable API로 전달
    const params = { ...req.query, page: 1 };
    params.limit = 10;

    const response = await axios.get("https://api.quotable.io/quotes", {
      params,
      httpsAgent: agent,
    });
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json(response.data);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to fetch quotes", details: err.message });
  }
}
