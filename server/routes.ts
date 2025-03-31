import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertDeviceSchema, 
  insertSensorDataSchema, 
  insertAlertSchema, 
  insertAttackLogSchema,
  insertMitigationGuidanceSchema
} from "@shared/schema";
import { executeAttack } from "./services/attack_simulator";
import { initSuricataMonitor } from "./services/suricata_monitor";
import { initDeviceMonitor } from "./services/device_monitor";
import { analyzeBehavior } from "./services/behavior_analyzer";
import { scanNetwork } from "./utils/network_scanner";

// Active WebSocket clients
let clients: WebSocket[] = [];

// Broadcast to all connected clients
function broadcast(message: any) {
  const data = JSON.stringify(message);
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Setup WebSocket server for real-time updates
  const wss = new WebSocketServer({ 
    server: httpServer,
    path: '/ws'
  });
  
  wss.on("connection", (ws) => {
    console.log("WebSocket client connected");
    clients.push(ws);
    
    ws.on("close", () => {
      console.log("WebSocket client disconnected");
      clients = clients.filter((client) => client !== ws);
    });
  });

  // Initialize monitoring services
  initSuricataMonitor(async (alert) => {
    const savedAlert = await storage.createAlert(alert);
    broadcast({ type: "alert", data: savedAlert });
  });

  initDeviceMonitor(async (sensorData) => {
    const savedData = await storage.createSensorData(sensorData);
    broadcast({ type: "sensorData", data: savedData });
    
    // Analyze for behavioral anomalies
    const anomaly = await analyzeBehavior(savedData);
    if (anomaly) {
      const savedAlert = await storage.createAlert(anomaly);
      broadcast({ type: "alert", data: savedAlert });
    }
  });

  // API Routes
  // Prefix all routes with /api
  
  // Get all devices
  app.get("/api/devices", async (req: Request, res: Response) => {
    const devices = await storage.getDevices();
    res.json(devices);
  });

  // Get a specific device
  app.get("/api/devices/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid device ID" });
    }
    
    const device = await storage.getDevice(id);
    if (!device) {
      return res.status(404).json({ message: "Device not found" });
    }
    
    res.json(device);
  });

  // Update device status
  app.patch("/api/devices/:id/status", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid device ID" });
    }
    
    const statusSchema = z.object({
      status: z.string(),
    });
    
    try {
      const { status } = statusSchema.parse(req.body);
      const device = await storage.updateDeviceStatus(id, status);
      
      if (!device) {
        return res.status(404).json({ message: "Device not found" });
      }
      
      res.json(device);
    } catch (error) {
      res.status(400).json({ message: "Invalid input data" });
    }
  });

  // Get latest sensor data
  app.get("/api/sensor-data", async (req: Request, res: Response) => {
    const deviceId = req.query.deviceId ? parseInt(req.query.deviceId as string) : undefined;
    const latestData = await storage.getLatestSensorData(deviceId);
    res.json(latestData);
  });

  // Get alerts
  app.get("/api/alerts", async (req: Request, res: Response) => {
    const acknowledged = req.query.acknowledged === "true" ? true : 
                         req.query.acknowledged === "false" ? false : 
                         undefined;
    
    const alerts = await storage.getAlerts(acknowledged);
    res.json(alerts);
  });

  // Acknowledge an alert
  app.post("/api/alerts/:id/acknowledge", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid alert ID" });
    }
    
    const updatedAlert = await storage.acknowledgeAlert(id);
    if (!updatedAlert) {
      return res.status(404).json({ message: "Alert not found" });
    }
    
    res.json(updatedAlert);
  });

  // Get mitigation guidance
  app.get("/api/mitigation-guidance", async (req: Request, res: Response) => {
    const alertType = req.query.alertType as string;
    
    if (alertType) {
      const guidance = await storage.getMitigationGuidance(alertType);
      
      if (!guidance) {
        return res.status(404).json({ message: "Mitigation guidance not found" });
      }
      
      return res.json(guidance);
    }
    
    const allGuidance = await storage.getAllMitigationGuidance();
    res.json(allGuidance);
  });

  // Execute attack simulation
  app.post("/api/attacks/simulate", async (req: Request, res: Response) => {
    try {
      const attackParams = z.object({
        attackType: z.string(),
        targetId: z.number(),
        parameters: z.record(z.any()).optional(),
      }).parse(req.body);
      
      const target = await storage.getDevice(attackParams.targetId);
      if (!target) {
        return res.status(404).json({ message: "Target device not found" });
      }
      
      const result = await executeAttack(attackParams.attackType, target, attackParams.parameters || {});
      
      // Log the attack
      const attackLog = await storage.createAttackLog({
        attackType: attackParams.attackType,
        targetId: attackParams.targetId,
        parameters: attackParams.parameters || {},
        result: result.success ? "success" : "failure",
        notes: result.message,
      });
      
      // Broadcast the attack log
      broadcast({ type: "attackLog", data: attackLog });
      
      res.json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.format() });
      }
      
      res.status(500).json({ message: "Failed to execute attack simulation" });
    }
  });

  // Get attack logs
  app.get("/api/attacks/logs", async (req: Request, res: Response) => {
    const logs = await storage.getAttackLogs();
    res.json(logs);
  });

  // Scan network for devices
  app.post("/api/network/scan", async (req: Request, res: Response) => {
    try {
      const result = await scanNetwork();
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Failed to scan network" });
    }
  });

  return httpServer;
}
