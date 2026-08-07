export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({
      error: "Method Not Allowed"
    });
  }

  const keyword = req.query.keyword || "扇風機";

  const applicationId = process.env.RAKUTEN_APPLICATION_ID;
  const accessKey = process.env.RAKUTEN_ACCESS_KEY;

  if (!applicationId || !accessKey) {
    return res.status(500).json({
      error: "Rakuten environment variables are not configured."
    });
  }

  const url = new URL(
    "https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20260701"
  );

  url.searchParams.set("applicationId", applicationId);
  url.searchParams.set("keyword", keyword);
  url.searchParams.set("format", "json");
  url.searchParams.set("formatVersion", "2");
  url.searchParams.set("hits", "3");

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        accessKey: accessKey
        "Referer": "https://rakuten-room-api.vercel.app/"
      }
    });

    const text = await response.text();

    let data;

    try {
      data = JSON.parse(text);
    } catch {
      return res.status(502).json({
        error: "Rakuten returned a non-JSON response.",
        status: response.status
      });
    }

    if (!response.ok) {
      return res.status(response.status).json({
        error: "Rakuten API error",
        rakuten: data
      });
    }

    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({
      error: "Failed to connect to Rakuten API.",
      message: error.message
    });
  }
}
