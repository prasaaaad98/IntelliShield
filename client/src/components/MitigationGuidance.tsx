import { useQuery } from '@tanstack/react-query';
import { useSocket } from '@/utils/socket';

interface MitigationGuidance {
  id: number;
  alertType: string;
  title: string;
  description: string;
  steps: string[];
  severity: string;
}

export default function MitigationGuidance() {
  const { lastMessage } = useSocket();
  
  // Fetch mitigation guidance
  const { data: guidances, refetch } = useQuery<MitigationGuidance[]>({
    queryKey: ['/api/mitigation-guidance'],
  });
  
  // Listen for socket updates
  if (lastMessage && lastMessage.type === 'alert') {
    refetch();
  }
  
  const getSeverityClass = (severity: string) => {
    if (severity === 'critical') {
      return 'bg-danger-light bg-opacity-10';
    } else if (severity === 'warning') {
      return 'bg-warning-light bg-opacity-10';
    } else {
      return 'bg-secondary-light bg-opacity-10';
    }
  };
  
  const getTextClass = (severity: string) => {
    if (severity === 'critical') {
      return 'text-danger';
    } else if (severity === 'warning') {
      return 'text-warning';
    } else {
      return 'text-secondary';
    }
  };
  
  const getIcon = (severity: string) => {
    if (severity === 'critical') {
      return (
        <svg className={`h-5 w-5 ${getTextClass(severity)}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z" clipRule="evenodd" />
        </svg>
      );
    } else if (severity === 'warning') {
      return (
        <svg className={`h-5 w-5 ${getTextClass(severity)}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      );
    } else {
      return (
        <svg className={`h-5 w-5 ${getTextClass(severity)}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
      );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b border-neutral-200">
        <h3 className="text-lg font-medium text-neutral-800">Mitigation Guidance</h3>
      </div>
      <div className="p-4">
        {!guidances || guidances.length === 0 ? (
          <div className="text-center py-4 text-neutral-500">
            No mitigation guidance available
          </div>
        ) : (
          <>
            {guidances.map((guidance, index) => (
              <div 
                key={guidance.id} 
                className={`${getSeverityClass(guidance.severity)} rounded-md p-4 ${index > 0 ? 'mt-4' : ''}`}
              >
                <div className="flex">
                  <div className="flex-shrink-0">
                    {getIcon(guidance.severity)}
                  </div>
                  <div className="ml-3">
                    <h3 className={`text-sm font-medium ${getTextClass(guidance.severity)}`}>
                      {guidance.title}
                    </h3>
                    <div className="mt-2 text-sm text-neutral-700">
                      <p>{guidance.description}</p>
                      <ul className="list-disc pl-5 mt-1 space-y-1">
                        {guidance.steps.map((step, stepIndex) => (
                          <li key={stepIndex}>{step}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
      <div className="bg-neutral-50 p-4 border-t border-neutral-200">
        <button className="w-full flex justify-center items-center px-4 py-2 border border-neutral-300 shadow-sm text-sm font-medium rounded-md text-neutral-700 bg-white hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
          Generate Incident Report
        </button>
      </div>
    </div>
  );
}
