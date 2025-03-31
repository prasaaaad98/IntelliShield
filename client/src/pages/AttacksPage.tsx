import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, ChevronDown, Clock, FileText, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

import AttackSimulator from "@/components/AttackSimulator";

export default function AttacksPage() {
  const [expandedLog, setExpandedLog] = useState<number | null>(null);
  
  // Fetch attack logs
  const { data: attackLogs = [], isLoading: isLoadingLogs } = useQuery<any[]>({
    queryKey: ['/api/attacks/logs'],
    retry: false,
  });
  
  const toggleLogDetails = (id: number) => {
    if (expandedLog === id) {
      setExpandedLog(null);
    } else {
      setExpandedLog(id);
    }
  };
  
  return (
    <div className="container py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Attack Simulation</h1>
        <p className="text-muted-foreground">
          Test your system resilience with controlled attack scenarios
        </p>
      </div>
      
      <Tabs defaultValue="simulator" className="space-y-4">
        <TabsList>
          <TabsTrigger value="simulator">
            <AlertTriangle className="mr-2 h-4 w-4" />
            Attack Simulator
          </TabsTrigger>
          <TabsTrigger value="history">
            <Clock className="mr-2 h-4 w-4" />
            Simulation History
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="simulator" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Attack Simulation Tool</CardTitle>
              <CardDescription>
                Simulate cybersecurity attacks on your OT infrastructure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AttackSimulator />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Simulation History</CardTitle>
              <CardDescription>
                Record of previous attack simulations ({attackLogs.length} total)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingLogs ? (
                <div className="py-8 text-center">Loading simulation history...</div>
              ) : attackLogs.length === 0 ? (
                <div className="py-8 text-center">
                  <div className="inline-flex items-center justify-center p-4 bg-muted rounded-full mb-4">
                    <FileText className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No Simulations Yet</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Use the Attack Simulator to run test scenarios and evaluate your system's security posture.
                  </p>
                </div>
              ) : (
                <ScrollArea className="h-[500px] pr-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[180px]">Timestamp</TableHead>
                        <TableHead>Attack Type</TableHead>
                        <TableHead>Result</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {attackLogs.map((log: any) => (
                        <Collapsible key={log.id} asChild open={expandedLog === log.id}>
                          <>
                            <TableRow className="cursor-pointer" onClick={() => toggleLogDetails(log.id)}>
                              <TableCell className="font-mono text-xs">
                                {new Date(log.timestamp).toLocaleString()}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center">
                                  {log.attackType}
                                  <Badge 
                                    variant={log.result === "successful" ? "destructive" : "outline"} 
                                    className="ml-2"
                                  >
                                    {log.result === "successful" ? "Successful" : "Blocked"}
                                  </Badge>
                                </div>
                              </TableCell>
                              <TableCell>{log.notes.slice(0, 40)}...</TableCell>
                              <TableCell className="text-right">
                                <Button variant="ghost" size="sm">
                                  <ChevronDown className={`h-4 w-4 transition-transform ${expandedLog === log.id ? 'rotate-180' : ''}`} />
                                </Button>
                              </TableCell>
                            </TableRow>
                            <CollapsibleContent asChild>
                              <TableRow className="bg-muted/50">
                                <TableCell colSpan={4} className="p-4">
                                  <div className="space-y-4">
                                    <div>
                                      <h4 className="font-semibold mb-1">Attack Details</h4>
                                      <p className="text-sm">{log.notes}</p>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div>
                                        <h4 className="font-semibold mb-1">Target Information</h4>
                                        <div className="text-sm space-y-1">
                                          <div className="flex">
                                            <span className="font-medium w-24">Device ID:</span>
                                            <span>{log.targetId}</span>
                                          </div>
                                          <div className="flex">
                                            <span className="font-medium w-24">Protocol:</span>
                                            <span>{log.protocol || "Unknown"}</span>
                                          </div>
                                        </div>
                                      </div>
                                      
                                      <div>
                                        <h4 className="font-semibold mb-1">Security Impact</h4>
                                        <div className="text-sm space-y-1">
                                          <div className="flex">
                                            <span className="font-medium w-24">Severity:</span>
                                            <span className="text-red-500 font-medium">
                                              {log.result === "successful" ? "High" : "Low (Prevented)"}
                                            </span>
                                          </div>
                                          <div className="flex">
                                            <span className="font-medium w-24">Mitigated:</span>
                                            <span>{log.result === "successful" ? "No" : "Yes"}</span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    <div className="flex justify-end">
                                      <Button size="sm" variant="outline" className="mr-2">
                                        <FileText className="mr-2 h-4 w-4" />
                                        Export Details
                                      </Button>
                                      <Button size="sm">
                                        <Shield className="mr-2 h-4 w-4" />
                                        View Mitigation
                                      </Button>
                                    </div>
                                  </div>
                                </TableCell>
                              </TableRow>
                            </CollapsibleContent>
                          </>
                        </Collapsible>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Card>
        <CardHeader>
          <CardTitle>Available Attack Vectors</CardTitle>
          <CardDescription>
            Description of possible attack scenarios for testing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <h3 className="text-lg font-semibold">Modbus Write Attack</h3>
              <p className="text-sm text-muted-foreground">
                Attempts to write unauthorized values to Modbus registers on PLC devices. 
                This can affect physical processes controlled by the PLC.
              </p>
            </div>
            
            <div className="space-y-1.5">
              <h3 className="text-lg font-semibold">MQTT Spoofing</h3>
              <p className="text-sm text-muted-foreground">
                Publishes falsified data to MQTT topics that ICS devices subscribe to.
                Can lead to incorrect operational decisions based on bad data.
              </p>
            </div>
            
            <div className="space-y-1.5">
              <h3 className="text-lg font-semibold">OPC UA Tampering</h3>
              <p className="text-sm text-muted-foreground">
                Manipulates OPC UA nodes to alter process variables or configuration parameters.
                May impact system behavior and operational stability.
              </p>
            </div>
            
            <div className="space-y-1.5">
              <h3 className="text-lg font-semibold">Denial of Service</h3>
              <p className="text-sm text-muted-foreground">
                Floods network interfaces with traffic to disrupt normal operations.
                Can render control systems unresponsive to legitimate commands.
              </p>
            </div>
            
            <div className="space-y-1.5">
              <h3 className="text-lg font-semibold">Man-in-the-Middle</h3>
              <p className="text-sm text-muted-foreground">
                Intercepts and potentially alters communication between ICS components.
                Can be used for reconnaissance or active manipulation.
              </p>
            </div>
            
            <div className="space-y-1.5">
              <h3 className="text-lg font-semibold">Protocol Fuzzing</h3>
              <p className="text-sm text-muted-foreground">
                Sends malformed protocol packets to test device resilience to protocol violations.
                May identify vulnerabilities in protocol implementations.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}