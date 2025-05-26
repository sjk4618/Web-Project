// serverless/api/quotes.js
import axios from "axios";
import https from "https";

const agent = new https.Agent({ rejectUnauthorized: false });

export default async function handler(req, res) {
  try {
    const response = await axios.get(
      "https://api.quotable.io/quotes?limit=30&page=1",
      { httpsAgent: agent }
    );
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json(response.data);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to fetch quotes", details: err.message });
  }
}
