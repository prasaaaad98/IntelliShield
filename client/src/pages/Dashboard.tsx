import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import StatusCard from "@/components/StatusCard";
import SensorMonitoring from "@/components/SensorMonitoring";
import PlcStatus from "@/components/PlcStatus";
import AttackSimulator from "@/components/AttackSimulator";
import SuricataAlerts from "@/components/SuricataAlerts";
import MitigationGuidance from "@/components/MitigationGuidance";
import NetworkVisualization from "@/components/NetworkVisualization";
import ActivityTimeline from "@/components/ActivityTimeline";
import Footer from "@/components/Footer";
import { useSocket } from "@/utils/socket";

export default function Dashboard() {
  const { lastMessage } = useSocket();
  const [selectedFilter, setSelectedFilter] = useState<string>("All Devices");
  
  // Fetch system status data
  const { data: devices } = useQuery({
    queryKey: ['/api/devices'],
  });
  
  // Fetch alerts
  const { data: alerts } = useQuery({
    queryKey: ['/api/alerts'],
  });
  
  // Count devices by status
  const deviceStats = {
    total: devices?.length || 0,
    online: devices?.filter((d: any) => d.status === 'online').length || 0,
    warning: devices?.filter((d: any) => d.status === 'warning').length || 0,
    critical: devices?.filter((d: any) => d.status === 'critical').length || 0,
  };
  
  // Count alerts by severity
  const alertStats = {
    total: alerts?.length || 0,
    warning: alerts?.filter((a: any) => a.severity === 'warning').length || 0,
    critical: alerts?.filter((a: any) => a.severity === 'critical').length || 0,
  };
  
  // Get last attack time
  const { data: attackLogs } = useQuery({
    queryKey: ['/api/attacks/logs'],
  });
  
  const lastAttackTime = attackLogs && attackLogs.length > 0 
    ? new Date(attackLogs[0].timestamp).toLocaleTimeString() 
    : 'No attacks logged';

  return (
    <div className="min-h-screen flex flex-col">
      <Header lastScan={new Date().toLocaleString()} />
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Dashboard Header */}
        <div className="mb-6 flex flex-wrap justify-between items-center">
          <div className="mb-2 md:mb-0">
            <h2 className="text-2xl font-semibold text-neutral-800">Security Dashboard</h2>
            <p className="text-neutral-500">
              Monitor and simulate attacks on your OT infrastructure
            </p>
          </div>
          <div className="flex space-x-3">
            <select 
              className="bg-white border border-neutral-300 text-neutral-700 py-2 px-3 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
            >
              <option>All Devices</option>
              <option>PLC Devices</option>
              <option>SCADA Systems</option>
              <option>HMI Interfaces</option>
            </select>
            <button className="flex items-center px-4 py-2 bg-primary text-white rounded-md shadow hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
              <svg className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h14a1 1 0 001-1V4a1 1 0 00-1-1H3zm2 3a1 1 0 011-1h8a1 1 0 010 2H6a1 1 0 01-1-1zm0 4a1 1 0 011-1h8a1 1 0 010 2H6a1 1 0 01-1-1zm0 4a1 1 0 011-1h4a1 1 0 010 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
              View Reports
            </button>
          </div>
        </div>
        
        {/* Status Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <StatusCard 
            title="System Status"
            value={deviceStats.online > 0 ? "Operational" : "Offline"}
            status={deviceStats.online > 0 ? "success" : "critical"}
            icon="check-circle"
            footerText={`${deviceStats.online} devices online and protected`}
          />
          
          <StatusCard 
            title="Active Alerts"
            value={alertStats.warning > 0 ? `${alertStats.warning} Warnings` : "No Warnings"}
            status={alertStats.warning > 0 ? "warning" : "success"}
            icon="alert-triangle"
            footerText="View all alerts"
            footerLink="#alerts"
          />
          
          <StatusCard 
            title="Attack Attempts"
            value={alertStats.critical > 0 ? `${alertStats.critical} Critical` : "No Attacks"}
            status={alertStats.critical > 0 ? "danger" : "success"}
            icon="alert-circle"
            footerText={`Last attempt: ${lastAttackTime}`}
          />
        </div>
        
        {/* Main Dashboard Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Live Sensor Data */}
          <div className="lg:col-span-1 space-y-6">
            <SensorMonitoring />
            <PlcStatus />
          </div>
          
          {/* Middle Column: Attack Simulator & Alerts */}
          <div className="lg:col-span-1 space-y-6">
            <AttackSimulator />
            <SuricataAlerts />
          </div>
          
          {/* Right Column: Mitigation & Visualization */}
          <div className="lg:col-span-1 space-y-6">
            <MitigationGuidance />
            <NetworkVisualization />
            <ActivityTimeline />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
