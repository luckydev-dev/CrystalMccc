// Vercel Serverless Function: POST /api/plugin/orders/[orderId]/complete
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

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const orderId = req.query.orderId || req.body.orderId || req.body.id;
    const status = req.body.status || req.query.status || "executed"; // e.g., 'executed', 'completed' or 'given'

    if (!orderId) {
      return res.status(400).json({ error: "Missing order ID in URL path" });
    }

    console.log(`[Plugin API Vercel] Marking order ${orderId} as ${status}`);

    // Check if order exists first
    const checkResp = await fetch(`https://crystal-mc-default-rtdb.asia-southeast1.firebasedatabase.app/orders/${orderId}.json`);
    if (!checkResp.ok) {
      throw new Error(`Firebase RTDB search returned status ${checkResp.status}`);
    }
    
    const orderData = await checkResp.json();
    if (!orderData) {
      return res.status(404).json({ error: `Order ${orderId} not found` });
    }

    // Update the execution status in Firebase RTDB
    const updateResp = await fetch(`https://crystal-mc-default-rtdb.asia-southeast1.firebasedatabase.app/orders/${orderId}.json`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        commandsExecutionStatus: status,
        pluginExecutedAt: Date.now()
      }),
    });

    if (!updateResp.ok) {
      throw new Error(`Firebase RTDB update returned status ${updateResp.status}`);
    }

    return res.status(200).json({ 
      success: true, 
      message: `Order ${orderId} command execution status successfully updated to '${status}'.`,
      orderId,
      commandsExecutionStatus: status
    });
  } catch (error: any) {
    console.error("[Plugin API Vercel Dynamic Error] Failed to complete order execution:", error);
    return res.status(500).json({ error: "Failed to update order status", message: error.message });
  }
}
