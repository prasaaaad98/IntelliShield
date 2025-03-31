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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private devices: Map<number, Device>;
  private sensorData: Map<number, SensorData>;
  private alerts: Map<number, Alert>;
  private attackLogs: Map<number, AttackLog>;
  private mitigationGuidance: Map<number, MitigationGuidance>;
  
  private currentUserIds = 1;
  private currentDeviceIds = 1;
  private currentSensorDataIds = 1;
  private currentAlertIds = 1;
  private currentAttackLogIds = 1;
  private currentMitigationGuidanceIds = 1;

  constructor() {
    this.users = new Map();
    this.devices = new Map();
    this.sensorData = new Map();
    this.alerts = new Map();
    this.attackLogs = new Map();
    this.mitigationGuidance = new Map();
    
    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Sample devices
    const devices: InsertDevice[] = [
      {
        name: "Main Control PLC",
        type: "PLC",
        protocol: "Modbus",
        ipAddress: "192.168.1.10",
        port: 502,
        status: "online",
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
        acceptableRanges: { min: 60, max: 90 },
        metadata: { unit: "°C" },
      }
    ];

    // Add devices
    devices.forEach(device => this.createDevice(device));

    // Add sample alerts
    const sampleAlerts: InsertAlert[] = [
      {
        severity: "critical",
        title: "Modbus Write to Restricted Register",
        description: "Unauthorized write attempt to safety-critical register detected from 192.168.1.45.",
        source: "Suricata",
        deviceId: 1,
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
        rawData: {
          raw: "[2023-06-10T10:36:18] [**] [1:1000015:1] MQTT: Suspicious subscription to system/# topic [**] [Classification: Potentially Bad Traffic] [Priority: 2] {TCP} 192.168.1.87:56324 -> 192.168.1.20:1883"
        }
      }
    ];
    
    sampleAlerts.forEach(alert => this.createAlert(alert));

    // Add mitigation guidance
    const mitigationGuidances: InsertMitigationGuidance[] = [
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
    ];
    
    mitigationGuidances.forEach(guidance => this.createMitigationGuidance(guidance));
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserIds++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Device methods
  async getDevices(): Promise<Device[]> {
    return Array.from(this.devices.values());
  }

  async getDevice(id: number): Promise<Device | undefined> {
    return this.devices.get(id);
  }

  async createDevice(insertDevice: InsertDevice): Promise<Device> {
    const id = this.currentDeviceIds++;
    const device: Device = { 
      ...insertDevice, 
      id, 
      lastSeen: new Date() 
    };
    this.devices.set(id, device);
    return device;
  }

  async updateDeviceStatus(id: number, status: string): Promise<Device | undefined> {
    const device = this.devices.get(id);
    if (!device) return undefined;
    
    const updatedDevice = { 
      ...device, 
      status, 
      lastSeen: new Date() 
    };
    this.devices.set(id, updatedDevice);
    return updatedDevice;
  }

  // Sensor data methods
  async getSensorData(deviceId?: number): Promise<SensorData[]> {
    const allData = Array.from(this.sensorData.values());
    if (deviceId === undefined) return allData;
    return allData.filter(data => data.deviceId === deviceId);
  }

  async getLatestSensorData(deviceId?: number): Promise<SensorData[]> {
    const allData = await this.getSensorData(deviceId);
    
    // Group by device and parameter name, then get latest for each
    const groupedByDeviceAndParameter = new Map<string, SensorData>();
    
    for (const data of allData) {
      const key = `${data.deviceId}-${data.parameterName}`;
      const existing = groupedByDeviceAndParameter.get(key);
      
      if (!existing || new Date(data.timestamp) > new Date(existing.timestamp)) {
        groupedByDeviceAndParameter.set(key, data);
      }
    }
    
    return Array.from(groupedByDeviceAndParameter.values());
  }

  async createSensorData(insertData: InsertSensorData): Promise<SensorData> {
    const id = this.currentSensorDataIds++;
    const data: SensorData = { 
      ...insertData, 
      id, 
      timestamp: new Date() 
    };
    this.sensorData.set(id, data);
    return data;
  }

  // Alert methods
  async getAlerts(acknowledged?: boolean): Promise<Alert[]> {
    const allAlerts = Array.from(this.alerts.values());
    
    if (acknowledged === undefined) return allAlerts;
    return allAlerts.filter(alert => alert.acknowledged === acknowledged);
  }

  async getAlert(id: number): Promise<Alert | undefined> {
    return this.alerts.get(id);
  }

  async createAlert(insertAlert: InsertAlert): Promise<Alert> {
    const id = this.currentAlertIds++;
    const alert: Alert = { 
      ...insertAlert, 
      id, 
      timestamp: new Date(),
      acknowledged: false
    };
    this.alerts.set(id, alert);
    return alert;
  }

  async acknowledgeAlert(id: number): Promise<Alert | undefined> {
    const alert = this.alerts.get(id);
    if (!alert) return undefined;
    
    const updatedAlert = { ...alert, acknowledged: true };
    this.alerts.set(id, updatedAlert);
    return updatedAlert;
  }

  // Attack log methods
  async getAttackLogs(): Promise<AttackLog[]> {
    return Array.from(this.attackLogs.values());
  }

  async getAttackLog(id: number): Promise<AttackLog | undefined> {
    return this.attackLogs.get(id);
  }

  async createAttackLog(insertLog: InsertAttackLog): Promise<AttackLog> {
    const id = this.currentAttackLogIds++;
    const log: AttackLog = { 
      ...insertLog, 
      id, 
      timestamp: new Date() 
    };
    this.attackLogs.set(id, log);
    return log;
  }

  // Mitigation guidance methods
  async getMitigationGuidance(alertType: string): Promise<MitigationGuidance | undefined> {
    return Array.from(this.mitigationGuidance.values()).find(
      guidance => guidance.alertType === alertType
    );
  }

  async getAllMitigationGuidance(): Promise<MitigationGuidance[]> {
    return Array.from(this.mitigationGuidance.values());
  }

  async createMitigationGuidance(insertGuidance: InsertMitigationGuidance): Promise<MitigationGuidance> {
    const id = this.currentMitigationGuidanceIds++;
    const guidance: MitigationGuidance = { 
      ...insertGuidance, 
      id 
    };
    this.mitigationGuidance.set(id, guidance);
    return guidance;
  }
}

export const storage = new MemStorage();
