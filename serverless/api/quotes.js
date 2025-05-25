// serverless/api/quotes.js
import axios from 'axios';

export default async function handler(req, res) {
  try {
    const response = await axios.get('https://api.quotable.io/quotes?limit=50&page=1');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch quotes' });
  }
}