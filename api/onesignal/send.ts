import { IncomingMessage, ServerResponse } from "http";

// This is the Vercel Serverless Function entry point.
// It will proxy the OneSignal API requests for Vercel/production deployments.
export default async function handler(req: any, res: any) {
  // CORS support
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization"
  );

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { payload, restApiKey } = req.body || {};

    if (!payload) {
      return res.status(400).json({ error: "Missing notification payload" });
    }

    if (!restApiKey) {
      return res.status(400).json({ error: "Missing OneSignal REST API key" });
    }

    // Call the OneSignal API
    const response = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${restApiKey}`,
      },
      body: JSON.stringify(payload),
    });

    const contentType = response.headers.get("content-type");
    let data: any = {};

    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = { errors: [text || `HTTP ${response.status} Error from OneSignal`] };
    }

    return res.status(response.status).json(data);
  } catch (error: any) {
    console.error("[OneSignal Vercel Proxy Error] Unexpected exception:", error);
    return res.status(500).json({
      error: "Unexpected exception proxying to OneSignal",
      message: error.message,
    });
  }
}
