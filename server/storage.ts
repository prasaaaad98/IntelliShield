import {
  users,
  devices,
  sensorData,
  alerts,
  attackLogs,
  mitigationGuidance,
  supportedProtocols,
  deviceTypes,
  type User,
  type InsertUser,
  type Protocol,
  type InsertProtocol,
  type DeviceType,
  type InsertDeviceType,
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

  // Protocol methods
  getProtocols(): Promise<Protocol[]>;
  getProtocol(id: number): Promise<Protocol | undefined>;
  getProtocolByName(name: string): Promise<Protocol | undefined>;
  createProtocol(protocol: InsertProtocol): Promise<Protocol>;
  updateProtocol(id: number, protocol: Partial<InsertProtocol>): Promise<Protocol | undefined>;
  deleteProtocol(id: number): Promise<boolean>;

  // Device type methods
  getDeviceTypes(): Promise<DeviceType[]>;
  getDeviceType(id: number): Promise<DeviceType | undefined>;
  getDeviceTypeByName(name: string): Promise<DeviceType | undefined>;
  createDeviceType(deviceType: InsertDeviceType): Promise<DeviceType>;
  updateDeviceType(id: number, deviceType: Partial<InsertDeviceType>): Promise<DeviceType | undefined>;
  deleteDeviceType(id: number): Promise<boolean>;

  // Device methods
  getDevices(): Promise<Device[]>;
  getDevice(id: number): Promise<Device | undefined>;
  createDevice(device: InsertDevice): Promise<Device>;
  updateDevice(id: number, device: Partial<InsertDevice>): Promise<Device | undefined>;
  updateDeviceStatus(id: number, status: string): Promise<Device | undefined>;
  deleteDevice(id: number): Promise<boolean>;

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
  updateMitigationGuidance(id: number, guidance: Partial<InsertMitigationGuidance>): Promise<MitigationGuidance | undefined>;
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
  
  // Protocol methods
  async getProtocols(): Promise<Protocol[]> {
    return db.select().from(supportedProtocols);
  }
  
  async getProtocol(id: number): Promise<Protocol | undefined> {
    const [protocol] = await db.select().from(supportedProtocols).where(eq(supportedProtocols.id, id));
    return protocol;
  }
  
  async getProtocolByName(name: string): Promise<Protocol | undefined> {
    const [protocol] = await db.select().from(supportedProtocols).where(eq(supportedProtocols.name, name));
    return protocol;
  }
  
  async createProtocol(protocol: InsertProtocol): Promise<Protocol> {
    const [createdProtocol] = await db.insert(supportedProtocols).values(protocol).returning();
    return createdProtocol;
  }
  
  async updateProtocol(id: number, protocol: Partial<InsertProtocol>): Promise<Protocol | undefined> {
    const [updatedProtocol] = await db.update(supportedProtocols)
      .set(protocol)
      .where(eq(supportedProtocols.id, id))
      .returning();
    return updatedProtocol;
  }
  
  async deleteProtocol(id: number): Promise<boolean> {
    try {
      await db.delete(supportedProtocols).where(eq(supportedProtocols.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting protocol:", error);
      return false;
    }
  }
  
  // Device type methods
  async getDeviceTypes(): Promise<DeviceType[]> {
    return db.select().from(deviceTypes);
  }
  
  async getDeviceType(id: number): Promise<DeviceType | undefined> {
    const [deviceType] = await db.select().from(deviceTypes).where(eq(deviceTypes.id, id));
    return deviceType;
  }
  
  async getDeviceTypeByName(name: string): Promise<DeviceType | undefined> {
    const [deviceType] = await db.select().from(deviceTypes).where(eq(deviceTypes.name, name));
    return deviceType;
  }
  
  async createDeviceType(deviceType: InsertDeviceType): Promise<DeviceType> {
    const [createdDeviceType] = await db.insert(deviceTypes).values(deviceType).returning();
    return createdDeviceType;
  }
  
  async updateDeviceType(id: number, deviceType: Partial<InsertDeviceType>): Promise<DeviceType | undefined> {
    const [updatedDeviceType] = await db.update(deviceTypes)
      .set(deviceType)
      .where(eq(deviceTypes.id, id))
      .returning();
    return updatedDeviceType;
  }
  
  async deleteDeviceType(id: number): Promise<boolean> {
    try {
      await db.delete(deviceTypes).where(eq(deviceTypes.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting device type:", error);
      return false;
    }
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
  
  async updateDevice(id: number, device: Partial<InsertDevice>): Promise<Device | undefined> {
    const [updatedDevice] = await db.update(devices)
      .set(device)
      .where(eq(devices.id, id))
      .returning();
    return updatedDevice;
  }
  
  async deleteDevice(id: number): Promise<boolean> {
    try {
      await db.delete(devices).where(eq(devices.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting device:", error);
      return false;
    }
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
  
  async updateMitigationGuidance(id: number, guidance: Partial<InsertMitigationGuidance>): Promise<MitigationGuidance | undefined> {
    const [updatedGuidance] = await db.update(mitigationGuidance)
      .set(guidance)
      .where(eq(mitigationGuidance.id, id))
      .returning();
    return updatedGuidance;
  }

  // Initialize the database with sample data
  async initializeSampleData() {
    // Check if we already have data to avoid duplicate initialization
    const existingDevices = await this.getDevices();
    if (existingDevices.length > 0) {
      return;
    }
    
    // Initialize supported protocols
    await db.insert(supportedProtocols).values([
      {
        name: "modbus_tcp",
        displayName: "Modbus TCP/IP",
        description: "Industry standard protocol for connecting industrial electronic devices.",
        defaultPort: 502,
        capabilities: {
          read: true,
          write: true,
          subscribe: false
        },
        parameters: {
          registerTypes: ["Coil", "Discrete Input", "Input Register", "Holding Register"],
          functions: ["Read Coils", "Read Discrete Inputs", "Read Holding Registers", "Read Input Registers", "Write Single Coil", "Write Single Register"]
        },
        isEnabled: true
      },
      {
        name: "modbus_rtu",
        displayName: "Modbus RTU",
        description: "Serial version of the Modbus protocol, typically over RS485 or RS232.",
        defaultPort: 0,
        capabilities: {
          read: true,
          write: true,
          subscribe: false
        },
        parameters: {
          registerTypes: ["Coil", "Discrete Input", "Input Register", "Holding Register"],
          baudRate: [9600, 19200, 38400, 57600, 115200]
        },
        isEnabled: true
      },
      {
        name: "mqtt",
        displayName: "MQTT",
        description: "Lightweight messaging protocol for small sensors and mobile devices.",
        defaultPort: 1883,
        capabilities: {
          read: true,
          write: true,
          subscribe: true
        },
        parameters: {
          qos: [0, 1, 2],
          retain: [true, false]
        },
        isEnabled: true
      },
      {
        name: "opc_ua",
        displayName: "OPC Unified Architecture",
        description: "Platform-independent service-oriented architecture for industrial automation.",
        defaultPort: 4840,
        capabilities: {
          read: true,
          write: true,
          subscribe: true,
          methods: true
        },
        parameters: {
          security: ["None", "Sign", "SignAndEncrypt"],
          authentication: ["Anonymous", "Username", "Certificate"]
        },
        isEnabled: true
      },
      {
        name: "ethernet_ip",
        displayName: "EtherNet/IP",
        description: "Common industrial protocol adaptation for Ethernet networks.",
        defaultPort: 44818,
        capabilities: {
          read: true,
          write: true,
          subscribe: false
        },
        parameters: {
          cip: ["Explicit Messaging", "Implicit Messaging"]
        },
        isEnabled: true
      },
      {
        name: "dnp3",
        displayName: "DNP3",
        description: "Distributed Network Protocol used in utility automation systems.",
        defaultPort: 20000,
        capabilities: {
          read: true,
          write: true,
          subscribe: false,
          events: true
        },
        parameters: {
          points: ["Binary Input", "Binary Output", "Analog Input", "Analog Output", "Counter"]
        },
        isEnabled: true
      }
    ]);
    
    // Initialize device types
    await db.insert(deviceTypes).values([
      {
        name: "plc",
        displayName: "Programmable Logic Controller",
        description: "Industrial digital computer for control of manufacturing processes.",
        category: "Controller",
        compatibleProtocols: ["modbus_tcp", "modbus_rtu", "ethernet_ip", "opc_ua"],
        parameterTemplates: {
          safetyParameters: ["Maximum Process Value", "Minimum Process Value", "Emergency Stop Trigger"]
        },
        icon: "cpu"
      },
      {
        name: "rtu",
        displayName: "Remote Terminal Unit",
        description: "Microprocessor-controlled device that interfaces with physical objects in the environment.",
        category: "Controller",
        compatibleProtocols: ["modbus_tcp", "modbus_rtu", "dnp3"],
        parameterTemplates: {
          remoteConfig: ["Polling Rate", "Timeout", "Retry Count"]
        },
        icon: "server"
      },
      {
        name: "sensor",
        displayName: "Sensor/Transmitter",
        description: "Device that detects and responds to input from the physical environment.",
        category: "Field Device",
        compatibleProtocols: ["modbus_tcp", "mqtt", "opc_ua"],
        parameterTemplates: {
          calibration: ["Zero Offset", "Span", "Units"],
          limits: ["Low Alarm", "High Alarm", "Rate of Change Alarm"]
        },
        icon: "activity"
      },
      {
        name: "vfd",
        displayName: "Variable Frequency Drive",
        description: "Type of motor controller that drives an electric motor by varying the frequency of the power supplied.",
        category: "Power Equipment",
        compatibleProtocols: ["modbus_tcp", "ethernet_ip"],
        parameterTemplates: {
          motorParams: ["Current Limit", "Acceleration Time", "Deceleration Time"]
        },
        icon: "zap"
      },
      {
        name: "hmi",
        displayName: "Human Machine Interface",
        description: "User interface that connects operators to controllers in manufacturing environments.",
        category: "Operator Interface",
        compatibleProtocols: ["modbus_tcp", "opc_ua"],
        parameterTemplates: {},
        icon: "monitor"
      },
      {
        name: "gateway",
        displayName: "Protocol Gateway",
        description: "Converts between different industrial protocols for seamless communication.",
        category: "Network",
        compatibleProtocols: ["modbus_tcp", "modbus_rtu", "mqtt", "opc_ua", "ethernet_ip", "dnp3"],
        parameterTemplates: {
          network: ["Conversion Mode", "Buffering"]
        },
        icon: "shuffle"
      }
    ]);

    // Sample devices
    await db.insert(devices).values([
      {
        name: "Main Control PLC",
        type: "plc",
        protocol: "modbus_tcp",
        ipAddress: "192.168.1.10",
        port: 502,
        status: "online",
        lastSeen: new Date(),
        acceptableRanges: {},
        metadata: {
          registers: {
            "40001": { description: "Process setpoint", unit: "°C", readOnly: false },
            "40002": { description: "Current temperature", unit: "°C", readOnly: true },
            "00001": { description: "Emergency stop", readOnly: false }
          }
        },
      },
      {
        name: "Process Control PLC",
        type: "plc",
        protocol: "modbus_tcp",
        ipAddress: "192.168.1.11",
        port: 502,
        status: "online",
        lastSeen: new Date(),
        acceptableRanges: {},
        metadata: {
          registers: {
            "40001": { description: "Pressure setpoint", unit: "PSI", readOnly: false },
            "40002": { description: "Current pressure", unit: "PSI", readOnly: true },
            "00002": { description: "Valve control", readOnly: false }
          }
        },
      },
      {
        name: "Auxiliary Systems PLC",
        type: "plc",
        protocol: "opc_ua",
        ipAddress: "192.168.1.12",
        port: 4840,
        status: "warning",
        lastSeen: new Date(),
        acceptableRanges: {},
        metadata: {
          nodes: {
            "ns=1;s=Temperature": { description: "Ambient temperature", unit: "°C" },
            "ns=1;s=Humidity": { description: "Ambient humidity", unit: "%" },
            "ns=1;s=Pressure": { description: "Ambient pressure", unit: "hPa" }
          }
        },
      },
      {
        name: "Safety Systems PLC",
        type: "plc",
        protocol: "modbus_tcp",
        ipAddress: "192.168.1.13",
        port: 502,
        status: "online",
        lastSeen: new Date(),
        acceptableRanges: {},
        metadata: {
          registers: {
            "40001": { description: "Safety limit high", unit: "°C", readOnly: false },
            "40002": { description: "Safety limit low", unit: "°C", readOnly: false },
            "00001": { description: "Emergency shutdown", readOnly: false }
          }
        },
      },
      {
        name: "Boiler Pressure Sensor",
        type: "sensor",
        protocol: "mqtt",
        ipAddress: "192.168.1.20",
        port: 1883,
        status: "online",
        lastSeen: new Date(),
        acceptableRanges: { min: 55, max: 85 },
        metadata: { 
          unit: "PSI",
          topics: {
            "sensors/boiler/pressure": { description: "Current pressure reading", qos: 1 },
            "sensors/boiler/status": { description: "Sensor status", qos: 1 },
            "sensors/boiler/command": { description: "Control commands", qos: 2 }
          }
        },
      },
      {
        name: "Temperature Sensor",
        type: "sensor",
        protocol: "mqtt",
        ipAddress: "192.168.1.21",
        port: 1883,
        status: "warning",
        lastSeen: new Date(),
        acceptableRanges: { min: 60, max: 90 },
        metadata: { 
          unit: "°C",
          topics: {
            "sensors/temperature/zone1": { description: "Zone 1 temperature", qos: 0 },
            "sensors/temperature/zone2": { description: "Zone 2 temperature", qos: 0 },
            "sensors/temperature/command": { description: "Control commands", qos: 1 }
          }
        },
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
