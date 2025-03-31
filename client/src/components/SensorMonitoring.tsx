import { useQuery } from '@tanstack/react-query';
import { useSocket } from '@/utils/socket';

interface SensorData {
  id: number;
  deviceId: number;
  parameterName: string;
  value: string;
  unit: string;
  status: string;
  timestamp: string;
}

export default function SensorMonitoring() {
  const { lastMessage } = useSocket();
  
  // Fetch sensor data
  const { data: sensorData, refetch } = useQuery<SensorData[]>({
    queryKey: ['/api/sensor-data'],
  });
  
  // Listen for socket updates
  if (lastMessage && lastMessage.type === 'sensorData') {
    refetch();
  }
  
  const getSensorNameFromParam = (param: string): string => {
    switch (param) {
      case 'pressure':
        return 'Boiler Pressure';
      case 'temperature':
        return 'Temperature';
      case 'flow_rate':
        return 'Flow Rate';
      case 'tank_level':
        return 'Tank Level';
      case 'vibration':
        return 'Vibration';
      default:
        return param.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };
  
  const getAcceptableRange = (param: string, unit: string): string => {
    switch (param) {
      case 'pressure':
        return `55-85 ${unit}`;
      case 'temperature':
        return `60-90 ${unit}`;
      case 'flow_rate':
        return `30-70 ${unit}`;
      case 'tank_level':
        return `20-90 ${unit}`;
      case 'vibration':
        return `0-8 ${unit}`;
      default:
        return 'Not defined';
    }
  };
  
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'normal':
        return 'bg-success text-success';
      case 'warning':
        return 'bg-warning text-warning';
      case 'critical':
        return 'bg-danger text-danger';
      default:
        return 'bg-neutral-500 text-neutral-500';
    }
  };

  const getProgressBarColor = (status: string): string => {
    switch (status) {
      case 'normal':
        return 'bg-success';
      case 'warning':
        return 'bg-warning';
      case 'critical':
        return 'bg-danger';
      default:
        return 'bg-neutral-500';
    }
  };
  
  const calculateProgress = (param: string, value: string): number => {
    const numValue = parseFloat(value);
    
    switch (param) {
      case 'pressure':
        return (numValue / 100) * 100; // Assuming max is 100 PSI
      case 'temperature':
        return (numValue / 100) * 100; // Assuming max is 100°C
      case 'flow_rate':
        return (numValue / 100) * 100; // Assuming max is 100 L/min
      case 'tank_level':
        return numValue; // Already a percentage
      case 'vibration':
        return (numValue / 10) * 100; // Assuming max is 10 Hz
      default:
        return 50;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b border-neutral-200 flex justify-between items-center">
        <h3 className="text-lg font-medium text-neutral-800">Live Sensor Data</h3>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-light text-success">
          Live
        </span>
      </div>
      <div className="p-4 space-y-4">
        {!sensorData || sensorData.length === 0 ? (
          <div className="text-center py-4 text-neutral-500">
            No sensor data available
          </div>
        ) : (
          sensorData.map((sensor, idx) => (
            <div key={sensor.id} className={idx < sensorData.length - 1 ? "border-b border-neutral-100 pb-3" : ""}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-neutral-700">
                  {getSensorNameFromParam(sensor.parameterName)}
                </span>
                <span className={`text-sm font-medium ${getStatusColor(sensor.status)}`}>
                  {sensor.status.charAt(0).toUpperCase() + sensor.status.slice(1)}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-neutral-100 rounded-full h-2">
                  <div 
                    className={`${getProgressBarColor(sensor.status)} rounded-full h-2`} 
                    style={{ width: `${calculateProgress(sensor.parameterName, sensor.value)}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-neutral-700">
                  {sensor.value}{sensor.unit}
                </span>
              </div>
              <div className="text-xs text-neutral-500 mt-1">
                Acceptable range: {getAcceptableRange(sensor.parameterName, sensor.unit)}
              </div>
            </div>
          ))
        )}
      </div>
      <div className="bg-neutral-50 p-4 border-t border-neutral-200">
        <button className="w-full flex justify-center items-center px-4 py-2 border border-neutral-300 shadow-sm text-sm font-medium rounded-md text-neutral-700 bg-white hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
          View All Sensors
        </button>
      </div>
    </div>
  );
}
