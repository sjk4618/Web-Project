// serverless/api/quotes.js
export default async function handler(req, res) {
  try {
    const response = await fetch(
      "https://api.quotable.io/quotes?limit=50&page=1"
    );
    const data = await response.json();
    res.setHeader("Access-Control-Allow-Origin", "*"); // CORS 허용
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch quotes" });
  }
}
