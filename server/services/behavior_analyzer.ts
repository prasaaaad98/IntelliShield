import { SensorData, InsertAlert } from "@shared/schema";
import { storage } from "../storage";

// Function to analyze sensor data for behavioral anomalies
export async function analyzeBehavior(data: SensorData): Promise<InsertAlert | null> {
  try {
    // Get the device to check its acceptable ranges
    const device = await storage.getDevice(data.deviceId);
    if (!device) {
      console.error(`Device not found for sensor data: ${data.deviceId}`);
      return null;
    }

    // Get previous readings for this parameter to detect rapid changes
    const previousReadings = await storage.getSensorData(data.deviceId);
    const sameParameterReadings = previousReadings
      .filter(reading => reading.parameterName === data.parameterName)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Skip if there's no previous data for comparison
    if (sameParameterReadings.length < 2) {
      return null;
    }

    // Analyze based on parameter type
    switch (data.parameterName) {
      case "temperature":
        return analyzeTemperature(data, sameParameterReadings, device.acceptableRanges);
      
      case "pressure":
        return analyzePressure(data, sameParameterReadings, device.acceptableRanges);
      
      case "flow_rate":
        return analyzeFlowRate(data, sameParameterReadings, device.acceptableRanges);
      
      case "tank_level":
        return analyzeTankLevel(data, sameParameterReadings, device.acceptableRanges);
      
      case "vibration":
        return analyzeVibration(data, sameParameterReadings, device.acceptableRanges);
      
      default:
        return null;
    }
  } catch (error) {
    console.error("Error analyzing behavior:", error);
    return null;
  }
}

// Analyze temperature readings
function analyzeTemperature(
  current: SensorData,
  history: SensorData[],
  acceptableRanges: any
): InsertAlert | null {
  const currentValue = parseFloat(current.value);
  const max = acceptableRanges?.max || 90;
  
  // Check if temperature is above acceptable range
  if (currentValue > max) {
    return {
      severity: currentValue > max + 5 ? "critical" : "warning",
      title: "Temperature Above Normal Range",
      description: `Temperature reading (${currentValue}${current.unit}) exceeds normal operating range (${max}${current.unit})`,
      source: "Behavior Analyzer",
      deviceId: current.deviceId,
      rawData: { current, acceptableRanges },
    };
  }
  
  // Check for rapid increase
  if (history.length >= 2) {
    const previousValue = parseFloat(history[1].value);
    const increase = currentValue - previousValue;
    
    if (increase > 10) {
      return {
        severity: "warning",
        title: "Rapid Temperature Increase",
        description: `Temperature increased by ${increase.toFixed(1)}${current.unit} in a short period`,
        source: "Behavior Analyzer",
        deviceId: current.deviceId,
        rawData: { current, previous: history[1], increase },
      };
    }
  }
  
  return null;
}

// Analyze pressure readings
function analyzePressure(
  current: SensorData,
  history: SensorData[],
  acceptableRanges: any
): InsertAlert | null {
  const currentValue = parseFloat(current.value);
  const min = acceptableRanges?.min || 55;
  const max = acceptableRanges?.max || 85;
  
  // Check if pressure is outside acceptable range
  if (currentValue > max) {
    return {
      severity: currentValue > max + 10 ? "critical" : "warning",
      title: "Pressure Above Normal Range",
      description: `Pressure reading (${currentValue}${current.unit}) exceeds normal operating range (${max}${current.unit})`,
      source: "Behavior Analyzer",
      deviceId: current.deviceId,
      rawData: { current, acceptableRanges },
    };
  }
  
  if (currentValue < min) {
    return {
      severity: currentValue < min - 10 ? "critical" : "warning",
      title: "Pressure Below Normal Range",
      description: `Pressure reading (${currentValue}${current.unit}) is below normal operating range (${min}${current.unit})`,
      source: "Behavior Analyzer",
      deviceId: current.deviceId,
      rawData: { current, acceptableRanges },
    };
  }
  
  // Check for rapid change
  if (history.length >= 2) {
    const previousValue = parseFloat(history[1].value);
    const change = Math.abs(currentValue - previousValue);
    
    if (change > 15) {
      return {
        severity: "warning",
        title: "Rapid Pressure Change",
        description: `Pressure changed by ${change.toFixed(1)}${current.unit} in a short period`,
        source: "Behavior Analyzer",
        deviceId: current.deviceId,
        rawData: { current, previous: history[1], change },
      };
    }
  }
  
  return null;
}

// Analyze flow rate readings
function analyzeFlowRate(
  current: SensorData,
  history: SensorData[],
  acceptableRanges: any
): InsertAlert | null {
  const currentValue = parseFloat(current.value);
  const min = acceptableRanges?.min || 30;
  const max = acceptableRanges?.max || 70;
  
  // Check if flow rate is outside acceptable range
  if (currentValue > max) {
    return {
      severity: "warning",
      title: "Flow Rate Above Normal Range",
      description: `Flow rate (${currentValue}${current.unit}) exceeds normal operating range (${max}${current.unit})`,
      source: "Behavior Analyzer",
      deviceId: current.deviceId,
      rawData: { current, acceptableRanges },
    };
  }
  
  if (currentValue < min) {
    return {
      severity: currentValue < min - 10 ? "critical" : "warning",
      title: "Flow Rate Below Normal Range",
      description: `Flow rate (${currentValue}${current.unit}) is below normal operating range (${min}${current.unit})`,
      source: "Behavior Analyzer",
      deviceId: current.deviceId,
      rawData: { current, acceptableRanges },
    };
  }
  
  // Check for flow loss
  if (history.length >= 3) {
    const previous = parseFloat(history[1].value);
    const beforePrevious = parseFloat(history[2].value);
    
    if (previous > 40 && beforePrevious > 40 && currentValue < 10) {
      return {
        severity: "critical",
        title: "Sudden Flow Loss",
        description: `Flow rate dropped suddenly from ${previous}${current.unit} to ${currentValue}${current.unit}`,
        source: "Behavior Analyzer",
        deviceId: current.deviceId,
        rawData: { current, previous: history[1], beforePrevious: history[2] },
      };
    }
  }
  
  return null;
}

// Analyze tank level readings
function analyzeTankLevel(
  current: SensorData,
  history: SensorData[],
  acceptableRanges: any
): InsertAlert | null {
  const currentValue = parseFloat(current.value);
  const min = acceptableRanges?.min || 20;
  const max = acceptableRanges?.max || 90;
  
  // Check if tank level is outside acceptable range
  if (currentValue > max) {
    return {
      severity: currentValue > 95 ? "critical" : "warning",
      title: "Tank Level Above Normal Range",
      description: `Tank level (${currentValue}${current.unit}) exceeds normal operating range (${max}${current.unit})`,
      source: "Behavior Analyzer",
      deviceId: current.deviceId,
      rawData: { current, acceptableRanges },
    };
  }
  
  if (currentValue < min) {
    return {
      severity: currentValue < 10 ? "critical" : "warning",
      title: "Tank Level Below Normal Range",
      description: `Tank level (${currentValue}${current.unit}) is below normal operating range (${min}${current.unit})`,
      source: "Behavior Analyzer",
      deviceId: current.deviceId,
      rawData: { current, acceptableRanges },
    };
  }
  
  // Check for rapid decrease
  if (history.length >= 2) {
    const previousValue = parseFloat(history[1].value);
    const decrease = previousValue - currentValue;
    
    if (decrease > 15) {
      return {
        severity: "warning",
        title: "Rapid Tank Level Decrease",
        description: `Tank level decreased by ${decrease.toFixed(1)}${current.unit} in a short period`,
        source: "Behavior Analyzer",
        deviceId: current.deviceId,
        rawData: { current, previous: history[1], decrease },
      };
    }
  }
  
  return null;
}

// Analyze vibration readings
function analyzeVibration(
  current: SensorData,
  history: SensorData[],
  acceptableRanges: any
): InsertAlert | null {
  const currentValue = parseFloat(current.value);
  const max = acceptableRanges?.max || 8;
  
  // Check if vibration is above acceptable range
  if (currentValue > max) {
    return {
      severity: currentValue > max + 1 ? "critical" : "warning",
      title: "Vibration Above Normal Range",
      description: `Vibration reading (${currentValue}${current.unit}) exceeds normal operating range (${max}${current.unit})`,
      source: "Behavior Analyzer",
      deviceId: current.deviceId,
      rawData: { current, acceptableRanges },
    };
  }
  
  // Check for increasing trend
  if (history.length >= 3) {
    const values = [currentValue, parseFloat(history[1].value), parseFloat(history[2].value)];
    
    if (values[0] > values[1] && values[1] > values[2] && values[0] - values[2] > 2) {
      return {
        severity: "warning",
        title: "Increasing Vibration Trend",
        description: `Vibration has been steadily increasing over the last readings`,
        source: "Behavior Analyzer",
        deviceId: current.deviceId,
        rawData: { current, history: [history[1], history[2]] },
      };
    }
  }
  
  return null;
}
