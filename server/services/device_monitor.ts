import { InsertSensorData } from "@shared/schema";
import { storage } from "../storage";

// Type for the callback function when new sensor data is collected
type SensorDataCallback = (data: InsertSensorData) => Promise<void>;

// Poll interval in milliseconds
const POLL_INTERVAL_MS = parseInt(process.env.DEVICE_POLL_INTERVAL_MS || '5000');

// Initialize device monitor
export function initDeviceMonitor(callback: SensorDataCallback): void {
  // Log configuration
  console.log(`Device monitor starting with polling interval: ${POLL_INTERVAL_MS}ms`);

  // Start polling devices
  startPollingDevices(callback);
}

// Start polling devices for sensor data
async function startPollingDevices(callback: SensorDataCallback): Promise<void> {
  // Get all devices from storage
  const devices = await storage.getDevices();

  // Set up polling for each device
  setInterval(async () => {
    for (const device of devices) {
      try {
        // Skip devices that aren't sensors
        if (device.type !== "Sensor" && device.type !== "PLC") {
          continue;
        }

        // In a real implementation, this would connect to the actual device using the
        // appropriate protocol (Modbus, MQTT, OPC-UA) and read values
        // Instead, we'll simulate by generating random values

        // Generate sensor data based on device type and acceptable ranges
        if (device.name === "Boiler Pressure Sensor") {
          const min = device.acceptableRanges?.min || 55;
          const max = device.acceptableRanges?.max || 85;
          const value = Math.floor(min + Math.random() * (max - min + 15));
          const status = value > max || value < min ? "warning" : "normal";
          
          await callback({
            deviceId: device.id,
            parameterName: "pressure",
            value: value.toString(),
            unit: "PSI",
            status,
          });
        } 
        else if (device.name === "Temperature Sensor") {
          const min = device.acceptableRanges?.min || 60;
          const max = device.acceptableRanges?.max || 90;
          // Sometimes exceed the max for demo purposes
          const value = Math.floor(min + Math.random() * (max - min + 10));
          const status = value > max ? "warning" : value > max + 5 ? "critical" : "normal";
          
          await callback({
            deviceId: device.id,
            parameterName: "temperature",
            value: value.toString(),
            unit: "°C",
            status,
          });
        }
        else if (device.name === "Main Control PLC") {
          // Simulate flow rate from PLC
          const value = Math.floor(30 + Math.random() * 40);
          const status = value < 35 || value > 65 ? "warning" : "normal";
          
          await callback({
            deviceId: device.id,
            parameterName: "flow_rate",
            value: value.toString(),
            unit: "L/min",
            status,
          });

          // Simulate tank level from PLC
          const tankLevel = Math.floor(20 + Math.random() * 70);
          const tankStatus = tankLevel < 25 || tankLevel > 85 ? "warning" : "normal";
          
          await callback({
            deviceId: device.id,
            parameterName: "tank_level",
            value: tankLevel.toString(),
            unit: "%",
            status: tankStatus,
          });
        }
        else if (device.name === "Process Control PLC") {
          // Simulate vibration from PLC
          // Occasionally generate critical values
          const makeItCritical = Math.random() < 0.1;
          const value = makeItCritical ? 9 + Math.random() : Math.random() * 8;
          const status = value > 8 ? "critical" : value > 7 ? "warning" : "normal";
          
          await callback({
            deviceId: device.id,
            parameterName: "vibration",
            value: value.toFixed(1),
            unit: "Hz",
            status,
          });
        }

        // Update device status based on the latest data
        updateDeviceStatus(device.id);
      } catch (error) {
        console.error(`Error polling device ${device.name}:`, error);
      }
    }
  }, POLL_INTERVAL_MS);
}

// Update device status based on the latest sensor data
async function updateDeviceStatus(deviceId: number): Promise<void> {
  try {
    // Get the latest sensor data for this device
    const latestData = await storage.getLatestSensorData(deviceId);
    
    // No data, nothing to update
    if (latestData.length === 0) {
      return;
    }
    
    // Check if any sensors are in critical or warning state
    const hasCritical = latestData.some(data => data.status === "critical");
    const hasWarning = latestData.some(data => data.status === "warning");
    
    // Update device status
    let newStatus = "online";
    if (hasCritical) {
      newStatus = "critical";
    } else if (hasWarning) {
      newStatus = "warning";
    }
    
    // Update the device status in storage
    await storage.updateDeviceStatus(deviceId, newStatus);
  } catch (error) {
    console.error(`Error updating device status for ${deviceId}:`, error);
  }
}
