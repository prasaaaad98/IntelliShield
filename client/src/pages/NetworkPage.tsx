import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Network, Database, RefreshCw } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

import PlcStatus from "@/components/PlcStatus";
import NetworkVisualization from "@/components/NetworkVisualization";

export default function NetworkPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isScanning, setIsScanning] = useState(false);
  
  // Fetch devices
  const { data: devices = [], isLoading: isLoadingDevices } = useQuery<any[]>({
    queryKey: ['/api/devices'],
    retry: false,
  });
  
  // Network scan mutation
  const scanMutation = useMutation({
    mutationFn: () => {
      return apiRequest('POST', '/api/network/scan');
    },
    onMutate: () => {
      setIsScanning(true);
      toast({
        title: "Network Scan Started",
        description: "Scanning for devices. This may take a few moments...",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/devices'] });
      toast({
        title: "Network Scan Complete",
        description: "Device inventory has been updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Scan Failed",
        description: "An error occurred while scanning the network.",
        variant: "destructive",
      });
      console.error("Network scan error:", error);
    },
    onSettled: () => {
      setIsScanning(false);
    }
  });
  
  const handleScan = () => {
    scanMutation.mutate();
  };
  
  // Calculate device statistics
  const deviceCount = devices.length || 0;
  const secureDevices = devices.filter(d => d.status === 'online').length || 0;
  const vulnerableDevices = devices.filter(d => d.status === 'warning' || d.status === 'critical').length || 0;
  
  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Network Management</h1>
          <p className="text-muted-foreground">
            Monitor and manage OT devices and network infrastructure
          </p>
        </div>
        <Button 
          onClick={handleScan} 
          disabled={isScanning}
          className="sm:self-start"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isScanning ? 'animate-spin' : ''}`} />
          {isScanning ? 'Scanning...' : 'Scan Network'}
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Database className="h-5 w-5 mr-2 text-blue-500" />
              Total Devices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {isLoadingDevices ? '...' : deviceCount}
            </div>
            <p className="text-sm text-muted-foreground">
              Monitored OT devices
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 mr-2 text-green-500"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
              Secure Devices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {isLoadingDevices ? '...' : secureDevices}
            </div>
            <p className="text-sm text-muted-foreground">
              Properly secured devices
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 mr-2 text-amber-500"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
              Vulnerable Devices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {isLoadingDevices ? '...' : vulnerableDevices}
            </div>
            <p className="text-sm text-muted-foreground">
              Need security attention
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="devices" className="space-y-4">
        <TabsList>
          <TabsTrigger value="devices">
            <Database className="mr-2 h-4 w-4" />
            Device Inventory
          </TabsTrigger>
          <TabsTrigger value="topology">
            <Network className="mr-2 h-4 w-4" />
            Network Topology
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="devices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Device Status</CardTitle>
              <CardDescription>
                Status of all OT devices on the network
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PlcStatus />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="topology" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Network Visualization</CardTitle>
              <CardDescription>
                Visual representation of network connectivity
              </CardDescription>
            </CardHeader>
            <CardContent className="min-h-[400px]">
              <NetworkVisualization />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}