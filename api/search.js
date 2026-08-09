import https from "https";

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

  const params = new URLSearchParams({
    applicationId,
    keyword,
    format: "json",
    formatVersion: "2",
    hits: "30"
  });

  const options = {
    hostname: "openapi.rakuten.co.jp",
    path:
      "/ichibams/api/IchibaItem/Search/20260701?" +
      params.toString(),
    method: "GET",
    headers: {
  "accessKey": accessKey,
  "Referer": "https://rakuten-room-api.vercel.app/",
  "Origin": "https://rakuten-room-api.vercel.app",
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
    "AppleWebKit/537.36 (KHTML, like Gecko) " +
    "Chrome/120.0.0.0 Safari/537.36"
   }
  };

  try {
    const data = await new Promise((resolve, reject) => {
      const request = https.request(options, (response) => {
        let body = "";

        response.on("data", (chunk) => {
          body += chunk;
        });

        response.on("end", () => {
          resolve({
            statusCode: response.statusCode,
            body
          });
        });
      });

      request.on("error", reject);
      request.end();
    });

    let json;

    try {
      json = JSON.parse(data.body);
    } catch {
      return res.status(502).json({
        error: "Rakuten returned a non-JSON response.",
        status: data.statusCode,
        body: data.body.slice(0, 500)
      });
    }

    if (data.statusCode < 200 || data.statusCode >= 300) {
      return res.status(data.statusCode).json({
        error: "Rakuten API error",
        rakuten: json
      });
    }

    return res.status(200).json(json);

  } catch (error) {
    return res.status(500).json({
      error: "Failed to connect to Rakuten API.",
      message: error.message
    });
  }
}
