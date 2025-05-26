import axios from "axios";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { text } = req.body;
  console.log("번역 요청 텍스트:", text); // 디버깅용 로그

  if (!text) {
    return res.status(400).json({ error: "Text is required" });
  }

  try {
    console.log("DeepL API 키:", process.env.DEEPL_API_KEY ? "존재함" : "없음"); // API 키 존재 여부 확인

    const response = await axios.post(
      "https://api-free.deepl.com/v2/translate",
      {
        text: [text],
        target_lang: "KO",
      },
      {
        headers: {
          Authorization: `DeepL-Auth-Key ${process.env.DEEPL_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("DeepL API 응답:", response.data); // 디버깅용 로그
    res.status(200).json(response.data);
  } catch (error) {
    console.error("번역 오류:", error.response?.data || error.message); // 상세 오류 로깅
    res.status(500).json({
      error: "Translation failed",
      details: error.message,
      response: error.response?.data,
    });
  }
}
