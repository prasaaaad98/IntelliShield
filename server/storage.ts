import {
  users,
  devices,
  sensorData,
  alerts,
  attackLogs,
  mitigationGuidance,
  type User,
  type InsertUser,
  type Device,
  type InsertDevice,
  type SensorData,
  type InsertSensorData,
  type Alert,
  type InsertAlert,
  type AttackLog,
  type InsertAttackLog,
  type MitigationGuidance,
  type InsertMitigationGuidance,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Device methods
  getDevices(): Promise<Device[]>;
  getDevice(id: number): Promise<Device | undefined>;
  createDevice(device: InsertDevice): Promise<Device>;
  updateDeviceStatus(id: number, status: string): Promise<Device | undefined>;

  // Sensor data methods
  getSensorData(deviceId?: number): Promise<SensorData[]>;
  getLatestSensorData(deviceId?: number): Promise<SensorData[]>;
  createSensorData(data: InsertSensorData): Promise<SensorData>;

  // Alert methods
  getAlerts(acknowledged?: boolean): Promise<Alert[]>;
  getAlert(id: number): Promise<Alert | undefined>;
  createAlert(alert: InsertAlert): Promise<Alert>;
  acknowledgeAlert(id: number): Promise<Alert | undefined>;

  // Attack log methods
  getAttackLogs(): Promise<AttackLog[]>;
  getAttackLog(id: number): Promise<AttackLog | undefined>;
  createAttackLog(log: InsertAttackLog): Promise<AttackLog>;

  // Mitigation guidance methods
  getMitigationGuidance(alertType: string): Promise<MitigationGuidance | undefined>;
  getAllMitigationGuidance(): Promise<MitigationGuidance[]>;
  createMitigationGuidance(guidance: InsertMitigationGuidance): Promise<MitigationGuidance>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Device methods
  async getDevices(): Promise<Device[]> {
    return db.select().from(devices);
  }

  async getDevice(id: number): Promise<Device | undefined> {
    const [device] = await db.select().from(devices).where(eq(devices.id, id));
    return device;
  }

  async createDevice(insertDevice: InsertDevice): Promise<Device> {
    const now = new Date();
    const [device] = await db.insert(devices)
      .values({ ...insertDevice, lastSeen: now })
      .returning();
    return device;
  }

  async updateDeviceStatus(id: number, status: string): Promise<Device | undefined> {
    const now = new Date();
    const [device] = await db.update(devices)
      .set({ status, lastSeen: now })
      .where(eq(devices.id, id))
      .returning();
    return device;
  }

  // Sensor data methods
  async getSensorData(deviceId?: number): Promise<SensorData[]> {
    if (deviceId === undefined) {
      return db.select().from(sensorData).orderBy(desc(sensorData.timestamp));
    }
    return db.select()
      .from(sensorData)
      .where(eq(sensorData.deviceId, deviceId))
      .orderBy(desc(sensorData.timestamp));
  }

  async getLatestSensorData(deviceId?: number): Promise<SensorData[]> {
    // Get all data first
    let results: SensorData[];
    
    if (deviceId !== undefined) {
      results = await db.select().from(sensorData)
        .where(eq(sensorData.deviceId, deviceId))
        .orderBy(desc(sensorData.timestamp));
    } else {
      results = await db.select().from(sensorData)
        .orderBy(desc(sensorData.timestamp));
    }
    
    // Group by device and parameter name, get latest for each
    const groupedByDeviceAndParameter = new Map<string, SensorData>();
    
    for (const data of results) {
      const key = `${data.deviceId}-${data.parameterName}`;
      const existing = groupedByDeviceAndParameter.get(key);
      
      if (!existing) {
        groupedByDeviceAndParameter.set(key, data);
      }
    }
    
    return Array.from(groupedByDeviceAndParameter.values());
  }

  async createSensorData(insertData: InsertSensorData): Promise<SensorData> {
    const now = new Date();
    const [data] = await db.insert(sensorData)
      .values({ ...insertData, timestamp: now })
      .returning();
    return data;
  }

  // Alert methods
  async getAlerts(acknowledged?: boolean): Promise<Alert[]> {
    if (acknowledged === undefined) {
      return db.select().from(alerts).orderBy(desc(alerts.timestamp));
    }
    return db.select()
      .from(alerts)
      .where(eq(alerts.acknowledged, acknowledged))
      .orderBy(desc(alerts.timestamp));
  }

  async getAlert(id: number): Promise<Alert | undefined> {
    const [alert] = await db.select().from(alerts).where(eq(alerts.id, id));
    return alert;
  }

  async createAlert(insertAlert: InsertAlert): Promise<Alert> {
    const now = new Date();
    const [alert] = await db.insert(alerts)
      .values({ ...insertAlert, timestamp: now, acknowledged: false })
      .returning();
    return alert;
  }

  async acknowledgeAlert(id: number): Promise<Alert | undefined> {
    const [alert] = await db.update(alerts)
      .set({ acknowledged: true })
      .where(eq(alerts.id, id))
      .returning();
    return alert;
  }

  // Attack log methods
  async getAttackLogs(): Promise<AttackLog[]> {
    return db.select().from(attackLogs).orderBy(desc(attackLogs.timestamp));
  }

  async getAttackLog(id: number): Promise<AttackLog | undefined> {
    const [log] = await db.select().from(attackLogs).where(eq(attackLogs.id, id));
    return log;
  }

  async createAttackLog(insertLog: InsertAttackLog): Promise<AttackLog> {
    const now = new Date();
    const [log] = await db.insert(attackLogs)
      .values({ ...insertLog, timestamp: now })
      .returning();
    return log;
  }

  // Mitigation guidance methods
  async getMitigationGuidance(alertType: string): Promise<MitigationGuidance | undefined> {
    const [guidance] = await db.select()
      .from(mitigationGuidance)
      .where(eq(mitigationGuidance.alertType, alertType));
    return guidance;
  }

  async getAllMitigationGuidance(): Promise<MitigationGuidance[]> {
    return db.select().from(mitigationGuidance);
  }

  async createMitigationGuidance(insertGuidance: InsertMitigationGuidance): Promise<MitigationGuidance> {
    const [guidance] = await db.insert(mitigationGuidance)
      .values(insertGuidance)
      .returning();
    return guidance;
  }

  // Initialize the database with sample data
  async initializeSampleData() {
    // Check if we already have data to avoid duplicate initialization
    const existingDevices = await this.getDevices();
    if (existingDevices.length > 0) {
      return;
    }

    // Sample devices
    await db.insert(devices).values([
      {
        name: "Main Control PLC",
        type: "PLC",
        protocol: "Modbus",
        ipAddress: "192.168.1.10",
        port: 502,
        status: "online",
        lastSeen: new Date(),
        acceptableRanges: {},
        metadata: {},
      },
      {
        name: "Process Control PLC",
        type: "PLC",
        protocol: "Modbus",
        ipAddress: "192.168.1.11",
        port: 502,
        status: "online",
        lastSeen: new Date(),
        acceptableRanges: {},
        metadata: {},
      },
      {
        name: "Auxiliary Systems PLC",
        type: "PLC",
        protocol: "OPC-UA",
        ipAddress: "192.168.1.12",
        port: 4840,
        status: "warning",
        lastSeen: new Date(),
        acceptableRanges: {},
        metadata: {},
      },
      {
        name: "Safety Systems PLC",
        type: "PLC",
        protocol: "Modbus",
        ipAddress: "192.168.1.13",
        port: 502,
        status: "online",
        lastSeen: new Date(),
        acceptableRanges: {},
        metadata: {},
      },
      {
        name: "Boiler Pressure Sensor",
        type: "Sensor",
        protocol: "MQTT",
        ipAddress: "192.168.1.20",
        port: 1883,
        status: "online",
        lastSeen: new Date(),
        acceptableRanges: { min: 55, max: 85 },
        metadata: { unit: "PSI" },
      },
      {
        name: "Temperature Sensor",
        type: "Sensor",
        protocol: "MQTT",
        ipAddress: "192.168.1.21",
        port: 1883,
        status: "warning",
        lastSeen: new Date(),
        acceptableRanges: { min: 60, max: 90 },
        metadata: { unit: "°C" },
      }
    ]);

    // Add sample alerts
    await db.insert(alerts).values([
      {
        severity: "critical",
        title: "Modbus Write to Restricted Register",
        description: "Unauthorized write attempt to safety-critical register detected from 192.168.1.45.",
        source: "Suricata",
        deviceId: 1,
        timestamp: new Date(),
        acknowledged: false,
        rawData: {
          raw: "[2023-06-10T10:42:33] [**] [1:1000001:1] MODBUS: Unauthorized write to register 40001 [**] [Classification: Potentially Bad Traffic] [Priority: 1] {TCP} 192.168.1.45:49152 -> 192.168.1.10:502"
        }
      },
      {
        severity: "warning",
        title: "MQTT Topic Subscription Attempt",
        description: "Unusual MQTT subscription pattern detected from unregistered client ID.",
        source: "Suricata",
        deviceId: 5,
        timestamp: new Date(),
        acknowledged: false,
        rawData: {
          raw: "[2023-06-10T10:36:18] [**] [1:1000015:1] MQTT: Suspicious subscription to system/# topic [**] [Classification: Potentially Bad Traffic] [Priority: 2] {TCP} 192.168.1.87:56324 -> 192.168.1.20:1883"
        }
      }
    ]);

    // Add mitigation guidance
    await db.insert(mitigationGuidance).values([
      {
        alertType: "Modbus Write to Restricted Register",
        title: "Critical: Modbus Write to Restricted Register",
        description: "Immediate actions required:",
        steps: [
          "Isolate affected PLC from network (switch to manual control if necessary)",
          "Block source IP (192.168.1.45) at firewall",
          "Verify integrity of register values and restore if needed",
          "Check PLC access control settings and update if necessary"
        ],
        severity: "critical"
      },
      {
        alertType: "Temperature Above Normal Range",
        title: "Warning: Temperature Above Normal Range",
        description: "Recommended actions:",
        steps: [
          "Verify coolant system operation and flow rates",
          "Check for possible sensor miscalibration",
          "Reduce system load until temperature returns to normal range",
          "Schedule maintenance inspection if problem persists"
        ],
        severity: "warning"
      }
    ]);
  }
}

export const storage = new DatabaseStorage();
