import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Shield, CheckCircle } from "lucide-react";
import MitigationGuidance from "@/components/MitigationGuidance";

export default function MitigationPage() {
  const { data: alerts, isLoading: alertsLoading } = useQuery({
    queryKey: ['/api/alerts'],
    retry: false
  });
  
  const pendingAlerts = alerts?.filter(alert => !alert.acknowledged) || [];
  
  return (
    <div className="container py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Security Mitigation</h1>
        <p className="text-muted-foreground">
          Response actions and mitigation guidance for detected threats
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 text-red-500" />
              Active Threats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {alertsLoading ? '...' : pendingAlerts.length}
            </div>
            <p className="text-sm text-muted-foreground">
              Unresolved security issues
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Shield className="h-5 w-5 mr-2 text-amber-500" />
              Mitigation Plans
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {pendingAlerts.length === 0 && !alertsLoading ? 'All Clear' : pendingAlerts.length}
            </div>
            <p className="text-sm text-muted-foreground">
              Available response procedures
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
              Resolved Threats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {alertsLoading ? '...' : (alerts?.length || 0) - pendingAlerts.length}
            </div>
            <p className="text-sm text-muted-foreground">
              Successfully mitigated issues
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Security Mitigation Guidance</CardTitle>
          <CardDescription>
            Step-by-step procedures to mitigate detected threats
          </CardDescription>
        </CardHeader>
        <CardContent>
          {alertsLoading ? (
            <div className="py-10 text-center">Loading mitigation plans...</div>
          ) : pendingAlerts.length > 0 ? (
            <MitigationGuidance />
          ) : (
            <div className="py-10 text-center">
              <div className="inline-flex items-center justify-center p-4 bg-green-50 rounded-full mb-4">
                <CheckCircle className="h-10 w-10 text-green-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No Active Threats</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                No immediate threats require mitigation at this time. Continue monitoring for new security alerts.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Threat Response Framework</CardTitle>
          <CardDescription>
            Security best practices for OT/ICS environments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="border-l-4 border-blue-500 pl-4 py-1">
              <h3 className="font-semibold text-lg">Isolation & Containment</h3>
              <p className="mt-1 text-muted-foreground">
                Immediately isolate affected systems to prevent lateral movement of threats. Implement network segmentation.
              </p>
            </div>
            
            <div className="border-l-4 border-blue-500 pl-4 py-1">
              <h3 className="font-semibold text-lg">Evidence Collection</h3>
              <p className="mt-1 text-muted-foreground">
                Collect logs, system states, and forensic data before remediation to support investigation.
              </p>
            </div>
            
            <div className="border-l-4 border-blue-500 pl-4 py-1">
              <h3 className="font-semibold text-lg">Impact Assessment</h3>
              <p className="mt-1 text-muted-foreground">
                Evaluate the operational impact of both the threat and the proposed remediation.
              </p>
            </div>
            
            <div className="border-l-4 border-blue-500 pl-4 py-1">
              <h3 className="font-semibold text-lg">Remediation</h3>
              <p className="mt-1 text-muted-foreground">
                Follow specific mitigation guidance for each threat type, prioritizing safety and reliability.
              </p>
            </div>
            
            <div className="border-l-4 border-blue-500 pl-4 py-1">
              <h3 className="font-semibold text-lg">Recovery Verification</h3>
              <p className="mt-1 text-muted-foreground">
                Confirm that systems have been properly restored and security controls are functioning.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}