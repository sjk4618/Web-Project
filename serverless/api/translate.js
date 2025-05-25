// serverless/api/translate.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const { text, source = "en", target = "ko" } = req.body || req.query;

    // 실제 파파고 공식 API 사용 시 아래 clientId, clientSecret을 발급받아야 합니다.
    const clientId = process.env.PAPAGO_CLIENT_ID;
    const clientSecret = process.env.PAPAGO_CLIENT_SECRET;

    const response = await fetch("https://openapi.naver.com/v1/papago/n2mt", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "X-Naver-Client-Id": clientId,
        "X-Naver-Client-Secret": clientSecret,
      },
      body: new URLSearchParams({
        source,
        target,
        text,
      }),
    });

    const data = await response.json();
    if (
      data.message &&
      data.message.result &&
      data.message.result.translatedText
    ) {
      res
        .status(200)
        .json({ translatedText: data.message.result.translatedText });
    } else {
      res.status(500).json({ error: "Translation failed", data });
    }
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
}
