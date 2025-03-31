import { useQuery } from '@tanstack/react-query';
import { useSocket } from '@/utils/socket';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface Alert {
  id: number;
  timestamp: string;
  severity: string;
  title: string;
  description: string;
  source: string;
  deviceId: number | null;
  rawData: any;
  acknowledged: boolean;
}

export default function SuricataAlerts() {
  const { toast } = useToast();
  const { lastMessage } = useSocket();
  
  // Fetch alerts
  const { data: alerts, refetch } = useQuery<Alert[]>({
    queryKey: ['/api/alerts'],
  });
  
  // Listen for socket updates
  if (lastMessage && lastMessage.type === 'alert') {
    refetch();
  }
  
  // Filter unacknowledged alerts
  const activeAlerts = alerts?.filter(alert => !alert.acknowledged) || [];
  
  // Sort by timestamp (newest first)
  const sortedAlerts = [...(activeAlerts || [])].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  
  // Handle acknowledge
  const handleAcknowledge = async (id: number) => {
    try {
      await apiRequest('POST', `/api/alerts/${id}/acknowledge`, {});
      queryClient.invalidateQueries({ queryKey: ['/api/alerts'] });
      toast({
        title: 'Alert acknowledged',
        description: 'The alert has been marked as acknowledged.'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to acknowledge alert.',
        variant: 'destructive'
      });
    }
  };
  
  const getSeverityClass = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-danger-light text-danger';
      case 'warning':
        return 'bg-warning-light text-warning';
      case 'info':
        return 'bg-secondary-light text-secondary';
      default:
        return 'bg-neutral-100 text-neutral-500';
    }
  };
  
  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };
  
  const formatRawData = (rawData: any) => {
    if (!rawData) return '';
    
    if (rawData.raw) {
      return rawData.raw;
    }
    
    return JSON.stringify(rawData, null, 2);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden" id="alerts">
      <div className="p-4 border-b border-neutral-200 flex justify-between items-center">
        <h3 className="text-lg font-medium text-neutral-800">Suricata Alerts</h3>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-danger-light text-danger">
          {sortedAlerts.length} Active
        </span>
      </div>
      <div className="divide-y divide-neutral-100 max-h-96 overflow-y-auto">
        {sortedAlerts.length === 0 ? (
          <div className="p-4 text-center text-neutral-500">
            No active alerts
          </div>
        ) : (
          sortedAlerts.map(alert => (
            <div key={alert.id} className="p-4 hover:bg-neutral-50">
              <div className="flex justify-between">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityClass(alert.severity)}`}>
                  {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
                </span>
                <span className="text-xs text-neutral-500">{formatTimestamp(alert.timestamp)}</span>
              </div>
              <h4 className="text-sm font-medium text-neutral-900 mt-2">{alert.title}</h4>
              <p className="text-sm text-neutral-600 mt-1">{alert.description}</p>
              <div className="mt-2 font-mono text-xs text-neutral-500 bg-neutral-50 p-2 rounded overflow-x-auto">
                {formatRawData(alert.rawData)}
              </div>
              <div className="mt-2 flex justify-end">
                <button 
                  className="text-xs text-secondary hover:text-secondary-dark"
                  onClick={() => handleAcknowledge(alert.id)}
                >
                  Acknowledge
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="bg-neutral-50 p-4 border-t border-neutral-200">
        <a href="#" className="block text-center text-sm font-medium text-secondary hover:text-secondary-dark">
          View All Alerts
        </a>
      </div>
    </div>
  );
}
