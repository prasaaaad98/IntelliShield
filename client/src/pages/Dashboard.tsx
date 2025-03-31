import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useSocket } from "@/utils/socket";
import { useToast } from "@/hooks/use-toast";

import StatusCard from "@/components/StatusCard";
import { Shield, AlertTriangle, Activity, Database, Zap, ArrowRight, RefreshCw } from "lucide-react";

export default function Dashboard() {
  const { isConnected, lastMessage } = useSocket();
  const { toast } = useToast();
  
  const { data: devices = [] } = useQuery<any[]>({
    queryKey: ['/api/devices'],
    retry: false
  });
  
  const { data: alerts = [] } = useQuery<any[]>({
    queryKey: ['/api/alerts'],
    retry: false
  });
  
  const { data: attackLogs = [] } = useQuery<any[]>({
    queryKey: ['/api/attacks/logs'],
    retry: false
  });
  
  const { data: sensorData = [] } = useQuery<any[]>({
    queryKey: ['/api/sensor-data'],
    retry: false
  });
  
  // Calculate device statistics
  const deviceStats = {
    total: devices.length,
    online: devices.filter((d) => d.status === 'online').length,
    warning: devices.filter((d) => d.status === 'warning').length,
    critical: devices.filter((d) => d.status === 'critical').length,
  };
  
  // Calculate alert statistics
  const alertStats = {
    total: alerts.length,
    unacknowledged: alerts.filter((a) => !a.acknowledged).length,
    warning: alerts.filter((a) => a.severity === 'warning' && !a.acknowledged).length,
    critical: alerts.filter((a) => a.severity === 'critical' && !a.acknowledged).length,
  };
  
  const attacksSimulated = attackLogs.length;
  const lastAttackTime = attackLogs.length > 0 
    ? new Date(attackLogs[0].timestamp).toLocaleTimeString() 
    : 'No attacks logged';
  
  // Calculate security score based on current system state
  const securityScore = alertStats.critical === 0 
    ? 85 + (deviceStats.online === deviceStats.total ? 15 : 0) 
    : alertStats.critical === 1 
    ? 65 
    : 40;
  
  // Handle network scan
  const handleNetworkScan = () => {
    toast({
      title: "Network Scan Initiated",
      description: "Scanning network for devices..."
    });
    
    // This would typically trigger an API call to scan the network
    // For demonstration purposes, we're just showing the toast
  };
  
  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-primary to-blue-500 text-transparent bg-clip-text">
              SecureICS Dashboard
            </span>
          </h1>
          <p className="text-muted-foreground">
            OT Security Monitoring and Attack Simulation Platform
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className={`inline-block w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
            <span className="text-sm text-muted-foreground">{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
          <Button variant="outline" size="sm" onClick={handleNetworkScan}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Scan Network
          </Button>
        </div>
      </div>
      
      {alertStats.critical > 0 && (
        <Alert variant="destructive" className="border border-red-200">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Critical Security Alert</AlertTitle>
          <AlertDescription>
            {alertStats.critical} critical security {alertStats.critical === 1 ? 'alert requires' : 'alerts require'} your immediate attention.
            <Button variant="link" className="p-0 h-auto" asChild>
              <Link to="/mitigation">View mitigation plans</Link>
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatusCard 
          title="Devices Monitored" 
          value={`${deviceStats.online}/${deviceStats.total}`} 
          status={deviceStats.online === deviceStats.total ? "success" : "warning"} 
          icon="server"
          footerText={deviceStats.online === deviceStats.total ? "All devices online" : `${deviceStats.total - deviceStats.online} offline`}
          footerLink="/network"
        />
        <StatusCard 
          title="Active Alerts" 
          value={alertStats.unacknowledged.toString()} 
          status={alertStats.unacknowledged === 0 ? "success" : alertStats.critical > 0 ? "danger" : "warning"} 
          icon="alert-triangle"
          footerText={alertStats.critical > 0 ? `${alertStats.critical} critical alerts` : "No critical alerts"}
          footerLink="/monitoring"
        />
        <StatusCard 
          title="Attack Simulations" 
          value={attacksSimulated.toString()} 
          status="neutral" 
          icon="shield"
          footerText={`Last: ${lastAttackTime}`}
          footerLink="/attacks"
        />
        <StatusCard 
          title="Security Score" 
          value={`${securityScore}%`} 
          status={securityScore > 80 ? "success" : securityScore > 60 ? "warning" : "danger"} 
          icon="shield-check"
          footerText="Based on current threats"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-8">
          <CardHeader>
            <CardTitle>System Overview</CardTitle>
            <CardDescription>
              Quick access to key system components
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/network">
                  <Database className="mr-2 h-4 w-4" />
                  Network Status & Visualization
                  <ArrowRight className="ml-auto h-4 w-4" />
                </Link>
              </Button>
              
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/monitoring">
                  <Activity className="mr-2 h-4 w-4" />
                  Sensor Monitoring & Alerts
                  <ArrowRight className="ml-auto h-4 w-4" />
                </Link>
              </Button>
              
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/attacks">
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Attack Simulation
                  <ArrowRight className="ml-auto h-4 w-4" />
                </Link>
              </Button>
            </div>
            
            <div className="space-y-4">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/mitigation">
                  <Shield className="mr-2 h-4 w-4" />
                  Security Mitigation
                  <ArrowRight className="ml-auto h-4 w-4" />
                </Link>
              </Button>
              
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/monitoring?tab=activity">
                  <Zap className="mr-2 h-4 w-4" />
                  Activity Timeline
                  <ArrowRight className="ml-auto h-4 w-4" />
                </Link>
              </Button>
              
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/settings">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  System Settings
                  <ArrowRight className="ml-auto h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Security Status</CardTitle>
            <CardDescription>
              Current security posture
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Security Score</span>
                <span className="text-sm font-medium">{securityScore}%</span>
              </div>
              <Progress value={securityScore} className="h-2" />
            </div>
            
            <div>
              <div className="rounded-md border px-4 py-3 font-mono text-sm mb-2">
                <div className="flex items-center justify-between">
                  <p>Devices Secured</p>
                  <p className="text-right">{deviceStats.online}/{deviceStats.total}</p>
                </div>
              </div>
              
              <div className="rounded-md border px-4 py-3 font-mono text-sm mb-2">
                <div className="flex items-center justify-between">
                  <p>Active Threats</p>
                  <p className="text-right">{alertStats.unacknowledged}</p>
                </div>
              </div>
              
              <div className="rounded-md border px-4 py-3 font-mono text-sm">
                <div className="flex items-center justify-between">
                  <p>Last Activity</p>
                  <p className="text-right">{lastMessage ? new Date(lastMessage.data.timestamp).toLocaleTimeString() : "N/A"}</p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" asChild>
              <Link to="/mitigation">
                <Shield className="mr-2 h-4 w-4" />
                View Security Recommendations
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
