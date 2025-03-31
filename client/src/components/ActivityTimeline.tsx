import { useQuery } from '@tanstack/react-query';
import { useSocket } from '@/utils/socket';

interface Alert {
  id: number;
  timestamp: string;
  severity: string;
  title: string;
  description: string;
  source: string;
}

interface AttackLog {
  id: number;
  timestamp: string;
  attackType: string;
  result: string;
  notes: string;
}

type TimelineEvent = {
  id: string;
  timestamp: string;
  type: 'alert' | 'warning' | 'system';
  description: string;
};

export default function ActivityTimeline() {
  const { lastMessage } = useSocket();
  
  // Fetch alerts and attack logs
  const { data: alerts, refetch: refetchAlerts } = useQuery<Alert[]>({
    queryKey: ['/api/alerts'],
  });
  
  const { data: attackLogs, refetch: refetchLogs } = useQuery<AttackLog[]>({
    queryKey: ['/api/attacks/logs'],
  });
  
  // Listen for socket updates
  if (lastMessage && (lastMessage.type === 'alert' || lastMessage.type === 'attackLog')) {
    if (lastMessage.type === 'alert') refetchAlerts();
    if (lastMessage.type === 'attackLog') refetchLogs();
  }
  
  // Combine alerts and attack logs into a timeline
  const createTimelineEvents = (): TimelineEvent[] => {
    const events: TimelineEvent[] = [];
    
    // Add alerts to timeline
    if (alerts) {
      alerts.forEach(alert => {
        events.push({
          id: `alert-${alert.id}`,
          timestamp: alert.timestamp,
          type: alert.severity === 'critical' ? 'alert' : 'warning',
          description: alert.title,
        });
      });
    }
    
    // Add attack logs to timeline
    if (attackLogs) {
      attackLogs.forEach(log => {
        events.push({
          id: `attack-${log.id}`,
          timestamp: log.timestamp,
          type: log.result === 'success' ? 'alert' : 'warning',
          description: `${log.attackType.replace('_', ' ')} ${log.result === 'success' ? 'succeeded' : 'failed'}`,
        });
      });
    }
    
    // Add system start event if timeline would be empty
    if (events.length === 0) {
      events.push({
        id: 'system-start',
        timestamp: new Date().toISOString(),
        type: 'system',
        description: 'System monitoring started',
      });
    }
    
    // Sort by timestamp (newest first)
    return events.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  };
  
  const timelineEvents = createTimelineEvents();
  
  const getEventIcon = (type: string) => {
    if (type === 'alert') {
      return (
        <svg className="h-5 w-5 text-danger" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z" clipRule="evenodd" />
        </svg>
      );
    } else if (type === 'warning') {
      return (
        <svg className="h-5 w-5 text-warning" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      );
    } else {
      return (
        <svg className="h-5 w-5 text-neutral-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" clipRule="evenodd" />
        </svg>
      );
    }
  };
  
  const getEventIconBg = (type: string) => {
    if (type === 'alert') {
      return 'bg-danger-light';
    } else if (type === 'warning') {
      return 'bg-warning-light';
    } else {
      return 'bg-neutral-100';
    }
  };
  
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b border-neutral-200">
        <h3 className="text-lg font-medium text-neutral-800">Activity Timeline</h3>
      </div>
      <div className="p-4">
        <div className="flow-root">
          <ul className="-mb-8">
            {timelineEvents.map((event, index) => (
              <li key={event.id}>
                <div className="relative pb-8">
                  {index < timelineEvents.length - 1 && (
                    <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-neutral-200" aria-hidden="true"></span>
                  )}
                  <div className="relative flex space-x-3">
                    <div>
                      <span className={`h-8 w-8 rounded-full ${getEventIconBg(event.type)} flex items-center justify-center ring-8 ring-white`}>
                        {getEventIcon(event.type)}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                      <div>
                        <p className="text-sm text-neutral-700">{event.description}</p>
                      </div>
                      <div className="text-right text-xs text-neutral-500">
                        <span>{formatTime(event.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="bg-neutral-50 p-4 border-t border-neutral-200">
        <a href="#" className="block text-center text-sm font-medium text-secondary hover:text-secondary-dark">
          View Full History
        </a>
      </div>
    </div>
  );
}
