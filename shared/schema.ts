import { pgTable, text, serial, integer, boolean, json, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const supportedProtocols = pgTable("supported_protocols", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  displayName: text("display_name").notNull(),
  description: text("description").notNull(),
  defaultPort: integer("default_port"),
  capabilities: json("capabilities").default({}), // Read, Write, Subscribe, etc.
  parameters: json("parameters").default({}), // Protocol-specific parameters (register types, topics, etc.)
  isEnabled: boolean("is_enabled").default(true),
});

export const deviceTypes = pgTable("device_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  displayName: text("display_name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // Controller, Sensor, Network, etc.
  compatibleProtocols: json("compatible_protocols").default([]), // List of compatible protocol IDs
  parameterTemplates: json("parameter_templates").default({}), // Common parameters for this device type
  icon: text("icon"), // Icon identifier
});

export const devices = pgTable("devices", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // References deviceTypes.name
  protocol: text("protocol").notNull(), // References supportedProtocols.name
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

export const insertProtocolSchema = createInsertSchema(supportedProtocols).omit({
  id: true,
});

export const insertDeviceTypeSchema = createInsertSchema(deviceTypes).omit({
  id: true,
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

// Attack type schema for configuration-based attack simulation
export const attackTypeSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  applicableProtocols: z.array(z.string()),
  requiredParameters: z.array(z.object({
    name: z.string(),
    label: z.string(),
    type: z.enum(['text', 'number', 'select']),
    options: z.array(z.string()).optional(),
    defaultValue: z.string().optional(),
    description: z.string().optional(),
    isRequired: z.boolean().default(true),
  })),
  additionalParameters: z.array(z.object({
    name: z.string(),
    label: z.string(),
    type: z.enum(['text', 'number', 'select']),
    options: z.array(z.string()).optional(),
    defaultValue: z.string().optional(),
    description: z.string().optional(),
  })).optional(),
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Protocol = typeof supportedProtocols.$inferSelect;
export type InsertProtocol = z.infer<typeof insertProtocolSchema>;

export type DeviceType = typeof deviceTypes.$inferSelect;
export type InsertDeviceType = z.infer<typeof insertDeviceTypeSchema>;

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

export type AttackType = z.infer<typeof attackTypeSchema>;

console.log("✅ Schema loaded");

console.log(Object.keys({
  users,
  supportedProtocols,
  deviceTypes,
  devices,
  sensorData,
  alerts,
  attackLogs,
  mitigationGuidance,
}));
