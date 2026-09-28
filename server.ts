import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Serve JSON payloads up to 10MB
  app.use(express.json({ limit: "10mb" }));

  // API proxy route for OneSignal to bypass client-side CORS and "Failed to fetch" errors.
  app.post("/api/onesignal/send", async (req, res) => {
    try {
      const { payload, restApiKey } = req.body;

      if (!restApiKey) {
        return res.status(400).json({ error: "Missing REST API key" });
      }

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
        data = { error: text || `HTTP ${response.status} from OneSignal` };
      }

      // Check if OneSignal indicated the user or aliases are not subscribed yet
      if (data?.errors?.invalid_aliases) {
        const missingAliases = data.errors.invalid_aliases?.external_id || [];
        console.log(`[OneSignal] Targeted user not subscribed to browser push: ${JSON.stringify(missingAliases)}`);
        return res.json({
          id: data.id || null,
          success: true,
          delivered: false,
          note: "Targeted recipient is not subscribed to push notifications in their browser."
        });
      }

      if (Array.isArray(data?.errors) && data.errors.some((e: any) => typeof e === "string" && e.toLowerCase().includes("not subscribed"))) {
        console.log("[OneSignal] No active subscribers found for target audience.");
        return res.json({
          id: data.id || null,
          success: true,
          delivered: false,
          note: "No active push subscribers currently registered."
        });
      }

      if (response.ok) {
        return res.json(data);
      } else {
        return res.status(response.status).json(data);
      }
    } catch (error: any) {
      console.warn("[OneSignal Proxy] Dispatch error:", error?.message || error);
      return res.status(500).json({ 
        error: "Failed to dispatch notification", 
        message: error.message 
      });
    }
  });

  // Minecraft Plugin API: Health & API Overview documentation
  app.get("/api/plugin", (req, res) => {
    const protocol = req.headers["x-forwarded-proto"] || req.protocol || "http";
    const host = req.get("host") || "localhost:3000";
    const baseUrl = `${protocol}://${host}`;

    res.json({
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
  });

  // Minecraft Plugin API: Get orders (e.g. pending ones)
  app.get("/api/plugin/orders", async (req, res) => {
    try {
      const pendingOnly = req.query.pending !== "false"; // defaults to true
      const serverFilter = typeof req.query.server === "string" ? req.query.server.trim().toLowerCase() : null;
      console.log(`[Plugin API] Fetching orders (pendingOnly=${pendingOnly}, server=${serverFilter || 'all'})`);

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

      // Filter by server if specified (survival, lifesteal, pvp)
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
        return res.json({ orders: pendingOrders });
      }

      return res.json({ orders: filteredOrders });
    } catch (error: any) {
      console.error("[Plugin API Error] Failed to fetch orders:", error);
      return res.status(500).json({ error: "Failed to fetch orders", message: error.message });
    }
  });

  // Minecraft Plugin API: Mark commands as executed/given (JSON body or route parameter)
  const handleCompleteOrder = async (req: express.Request, res: express.Response) => {
    try {
      const orderId = req.params.orderId || req.body.orderId || req.body.id;
      const status = req.body.status || "executed"; // e.g., 'executed', 'completed' or 'given'

      if (!orderId) {
        return res.status(400).json({ error: "Missing order ID. Provide it in the URL path or inside the JSON body" });
      }

      console.log(`[Plugin API] Marking order ${orderId} as ${status}`);

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

      return res.json({ 
        success: true, 
        message: `Order ${orderId} command execution status successfully updated to '${status}'.`,
        orderId,
        commandsExecutionStatus: status
      });
    } catch (error: any) {
      console.error("[Plugin API Error] Failed to complete order execution:", error);
      return res.status(500).json({ error: "Failed to update order status", message: error.message });
    }
  };

  app.post("/api/plugin/orders/complete", handleCompleteOrder);
  app.post("/api/plugin/orders/:orderId/complete", handleCompleteOrder);

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
