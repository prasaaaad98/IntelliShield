import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, AlertCircle, TrendingUp } from "lucide-react";
import SensorMonitoring from "@/components/SensorMonitoring";
import ActivityTimeline from "@/components/ActivityTimeline";
import SuricataAlerts from "@/components/SuricataAlerts";
import { useSocket } from "@/utils/socket";

export default function MonitoringPage() {
  const { isConnected } = useSocket();
  
  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Monitoring</h1>
          <p className="text-muted-foreground">
            Real-time monitoring and alerts for OT/ICS systems
          </p>
        </div>
        <div>
          <Badge 
            variant={isConnected ? "default" : "destructive"}
            className="ml-2"
          >
            {isConnected ? "Connected" : "Disconnected"}
          </Badge>
        </div>
      </div>
      
      <Tabs defaultValue="sensors" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sensors">
            <TrendingUp className="mr-2 h-4 w-4" />
            Sensor Data
          </TabsTrigger>
          <TabsTrigger value="alerts">
            <AlertCircle className="mr-2 h-4 w-4" />
            Security Alerts
          </TabsTrigger>
          <TabsTrigger value="activity">
            <Activity className="mr-2 h-4 w-4" />
            Activity Timeline
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="sensors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Operational Parameters Monitoring</CardTitle>
              <CardDescription>
                Real-time sensor data from industrial control systems
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SensorMonitoring />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Alerts</CardTitle>
              <CardDescription>
                Intrusion detection alerts from Suricata
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SuricataAlerts />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Activity</CardTitle>
              <CardDescription>
                Chronological timeline of system events and alerts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ActivityTimeline />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}