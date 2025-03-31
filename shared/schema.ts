import { pgTable, text, serial, integer, boolean, json, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const devices = pgTable("devices", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // "PLC", "Sensor", "Gateway", etc.
  protocol: text("protocol").notNull(), // "Modbus", "MQTT", "OPC-UA", etc.
  ipAddress: text("ip_address").notNull(),
  port: integer("port").notNull(),
  status: text("status").notNull().default("unknown"), // "online", "offline", "warning", "critical"
  lastSeen: timestamp("last_seen").defaultNow(),
  acceptableRanges: json("acceptable_ranges").default({}), // for behavioral analysis
  metadata: json("metadata").default({}), // additional device-specific info
});

export const sensorData = pgTable("sensor_data", {
  id: serial("id").primaryKey(),
  deviceId: integer("device_id").notNull().references(() => devices.id),
  timestamp: timestamp("timestamp").defaultNow(),
  parameterName: text("parameter_name").notNull(), // "temperature", "pressure", etc.
  value: text("value").notNull(), // stored as string for flexibility, parsed in application
  unit: text("unit").notNull(), // "°C", "PSI", etc.
  status: text("status").notNull(), // "normal", "warning", "critical"
});

export const alerts = pgTable("alerts", {
  id: serial("id").primaryKey(),
  timestamp: timestamp("timestamp").defaultNow(),
  severity: text("severity").notNull(), // "info", "warning", "critical"
  title: text("title").notNull(),
  description: text("description").notNull(),
  source: text("source").notNull(), // "Suricata", "Behavior Analyzer", etc.
  deviceId: integer("device_id").references(() => devices.id),
  rawData: json("raw_data").default({}), // original alert data
  acknowledged: boolean("acknowledged").default(false),
});

export const attackLogs = pgTable("attack_logs", {
  id: serial("id").primaryKey(),
  timestamp: timestamp("timestamp").defaultNow(),
  attackType: text("attack_type").notNull(),
  targetId: integer("target_id").references(() => devices.id),
  parameters: json("parameters").default({}),
  result: text("result").notNull(), // "success", "failure"
  notes: text("notes"),
});

export const mitigationGuidance = pgTable("mitigation_guidance", {
  id: serial("id").primaryKey(),
  alertType: text("alert_type").notNull(), // Maps to types of alerts
  title: text("title").notNull(),
  description: text("description").notNull(),
  steps: json("steps").notNull(), // Array of step-by-step instructions
  severity: text("severity").notNull(), // "info", "warning", "critical"
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertDeviceSchema = createInsertSchema(devices).omit({
  id: true,
  lastSeen: true,
});

export const insertSensorDataSchema = createInsertSchema(sensorData).omit({
  id: true,
  timestamp: true,
});

export const insertAlertSchema = createInsertSchema(alerts).omit({
  id: true,
  timestamp: true,
  acknowledged: true,
});

export const insertAttackLogSchema = createInsertSchema(attackLogs).omit({
  id: true,
  timestamp: true,
});

export const insertMitigationGuidanceSchema = createInsertSchema(mitigationGuidance).omit({
  id: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Device = typeof devices.$inferSelect;
export type InsertDevice = z.infer<typeof insertDeviceSchema>;

export type SensorData = typeof sensorData.$inferSelect;
export type InsertSensorData = z.infer<typeof insertSensorDataSchema>;

export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = z.infer<typeof insertAlertSchema>;

export type AttackLog = typeof attackLogs.$inferSelect;
export type InsertAttackLog = z.infer<typeof insertAttackLogSchema>;

export type MitigationGuidance = typeof mitigationGuidance.$inferSelect;
export type InsertMitigationGuidance = z.infer<typeof insertMitigationGuidanceSchema>;
