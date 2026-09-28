// Vercel Serverless Function: GET /api/plugin/orders
export default async function handler(req: any, res: any) {
  // Support CORS
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

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    // req.query is parsed automatically by Vercel
    const pendingOnly = req.query.pending !== "false"; // defaults to true
    const serverFilter = typeof req.query.server === "string" ? req.query.server.trim().toLowerCase() : null;
    console.log(`[Plugin API Vercel] Fetching orders (pendingOnly=${pendingOnly}, server=${serverFilter || 'all'})`);

    const dbResponse = await fetch("https://crystal-mc-default-rtdb.asia-southeast1.firebasedatabase.app/orders.json");
    if (!dbResponse.ok) {
      throw new Error(`Firebase RTDB returned status ${dbResponse.status} ${dbResponse.statusText}`);
    }

    const data = await dbResponse.json() as Record<string, any>;
    const ordersList: any[] = [];
    
    if (data) {
      Object.keys(data).forEach((id) => {
        const rawOrder = data[id];
        const detectedServer = (rawOrder.server || (rawOrder.items && rawOrder.items[0]?.gameMode) || 'survival').toLowerCase();
        ordersList.push({
          id,
          ...rawOrder,
          server: detectedServer
        });
      });
    }

    let filteredOrders = ordersList;

    if (serverFilter) {
      filteredOrders = filteredOrders.filter((o) => o.server === serverFilter);
    }

    // If pendingOnly, return orders where:
    // Status is 'adminap' or legacy 'approved' AND commands are present AND executionStatus is 'pending'
    if (pendingOnly) {
      const pendingOrders = filteredOrders.filter((o) => 
        (o.status === "adminap" || o.status === "approved") &&
        Array.isArray(o.commands) && 
        o.commands.length > 0 &&
        (o.commandsExecutionStatus === "pending" || !o.commandsExecutionStatus)
      );
      return res.status(200).json({ orders: pendingOrders });
    }

    return res.status(200).json({ orders: filteredOrders });
  } catch (error: any) {
    console.error("[Plugin API Vercel Error] Failed to fetch orders:", error);
    return res.status(500).json({ error: "Failed to fetch orders", message: error.message });
  }
}
