// Vercel Serverless Function: GET /api/plugin
export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization"
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const protocol = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers["host"] || "crystalmc.net";
  const baseUrl = `${protocol}://${host}`;

  return res.status(200).json({
    name: "CrystalMC Store Plugin API",
    status: "online",
    baseUrl,
    endpoints: {
      getPendingOrders: {
        method: "GET",
        url: `${baseUrl}/api/plugin/orders?pending=true`,
        serverFilterExample: `${baseUrl}/api/plugin/orders?pending=true&server=survival`,
        description: "Fetches orders approved by admins waiting to be executed in Minecraft. Filter by server using &server=survival, &server=lifesteal, or &server=pvp."
      },
      getAllOrders: {
        method: "GET",
        url: `${baseUrl}/api/plugin/orders?pending=false`,
        description: "Fetches all store orders"
      },
      completeOrder: {
        method: "POST",
        url: `${baseUrl}/api/plugin/orders/:orderId/complete`,
        alternateUrl: `${baseUrl}/api/plugin/orders/complete`,
        body: {
          orderId: "ORDER_ID",
          status: "executed"
        },
        description: "Marks commands as successfully executed on the Minecraft server"
      }
    },
    commandPlaceholderNotice: "In order commands, {username} or {player} represents the buyer Minecraft in-game name."
  });
}
