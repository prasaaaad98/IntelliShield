import { useQuery } from '@tanstack/react-query';
import { useSocket } from '@/utils/socket';

interface Device {
  id: number;
  name: string;
  type: string;
  protocol: string;
  ipAddress: string;
  port: number;
  status: string;
  lastSeen: string;
}

export default function PlcStatus() {
  const { lastMessage } = useSocket();
  
  // Fetch device data
  const { data: devices, refetch } = useQuery<Device[]>({
    queryKey: ['/api/devices'],
  });
  
  // Listen for socket updates that might affect device status
  if (lastMessage && (lastMessage.type === 'sensorData' || lastMessage.type === 'alert')) {
    refetch();
  }
  
  // Filter only PLC devices
  const plcDevices = devices?.filter(device => device.type === 'PLC') || [];
  
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'online':
        return 'bg-success';
      case 'warning':
        return 'bg-warning';
      case 'critical':
        return 'bg-danger';
      case 'offline':
      default:
        return 'bg-neutral-400';
    }
  };
  
  const getTimeSince = (dateString: string): string => {
    const lastSeen = new Date(dateString);
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - lastSeen.getTime()) / 1000);
    
    if (diffSeconds < 60) {
      return `${diffSeconds}s ago`;
    } else if (diffSeconds < 3600) {
      return `${Math.floor(diffSeconds / 60)}m ago`;
    } else {
      return `${Math.floor(diffSeconds / 3600)}h ago`;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b border-neutral-200">
        <h3 className="text-lg font-medium text-neutral-800">PLC Status</h3>
      </div>
      <div className="p-4">
        <div className="space-y-4">
          {!plcDevices || plcDevices.length === 0 ? (
            <div className="text-center py-4 text-neutral-500">
              No PLC devices found
            </div>
          ) : (
            plcDevices.map((plc) => (
              <div key={plc.id} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`h-3 w-3 rounded-full ${getStatusColor(plc.status)} mr-3`}></div>
                  <span className="text-sm text-neutral-700">{plc.name}</span>
                </div>
                <span className="text-xs text-neutral-500">
                  Updated {getTimeSince(plc.lastSeen)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
