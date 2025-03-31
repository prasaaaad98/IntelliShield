import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface HeaderProps {
  lastScan: string;
}

export default function Header({ lastScan }: HeaderProps) {
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await apiRequest('POST', '/api/network/scan', {});
      toast({
        title: 'Network scan completed',
        description: 'All devices have been refreshed.',
      });
    } catch (error) {
      toast({
        title: 'Scan failed',
        description: 'Could not complete network scan.',
        variant: 'destructive',
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <header className="bg-primary shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <svg className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 4.75L19.25 9L12 13.25L4.75 9L12 4.75Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M4.75 14L12 18.25L19.25 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M4.75 9V14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M19.25 9V14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <h1 className="ml-3 text-xl font-bold text-white">OT Attack Simulation & Mitigation System</h1>
        </div>
        <div className="flex items-center">
          <span className="text-sm text-white mr-4">LAST SCAN: <span>{lastScan}</span></span>
          <button 
            className="px-3 py-1.5 bg-white text-primary text-sm font-medium rounded hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? 'Scanning...' : 'Refresh'}
          </button>
        </div>
      </div>
    </header>
  );
}
