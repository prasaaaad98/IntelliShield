import { useState, useEffect } from "react";
import { Switch, Route, Link, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { SocketProvider } from "./utils/socket";

// Pages
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import NetworkPage from "@/pages/NetworkPage";
import AttacksPage from "@/pages/AttacksPage";
import MonitoringPage from "@/pages/MonitoringPage";
import MitigationPage from "@/pages/MitigationPage";
import SettingsPage from "@/pages/SettingsPage";

// Components
import { 
  AlertTriangle, 
  Gauge, 
  LifeBuoy, 
  Network, 
  Settings, 
  Shield 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

// Navigation component
function Navigation() {
  const [location] = useLocation();
  const isMobile = useIsMobile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);

  // Close sidebar on mobile when changing routes
  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [location, isMobile]);

  return (
    <div className="flex h-screen">
      {/* Mobile Nav Toggle */}
      {isMobile && (
        <button
          className="fixed top-4 left-4 z-50 p-2 bg-primary text-white rounded-md shadow-md"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          >
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
      )}
      
      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-neutral-100 dark:bg-neutral-900 border-r transform transition-transform duration-300 ease-in-out",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0" // Always show on large screens
        )}
      >
        <div className="flex flex-col h-full p-4">
          <div className="py-6 px-4">
            <h1 className="text-2xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-primary to-blue-500 text-transparent bg-clip-text">
                SecureICS
              </span>
            </h1>
            <p className="text-sm text-muted-foreground">
              OT Security Platform
            </p>
          </div>
          
          <nav className="space-y-1.5 flex-1">
            <NavLink to="/" icon={<Gauge />} active={location === "/"}>
              Dashboard
            </NavLink>
            <NavLink to="/network" icon={<Network />} active={location === "/network"}>
              Network
            </NavLink>
            <NavLink to="/monitoring" icon={<Gauge />} active={location === "/monitoring"}>
              Monitoring
            </NavLink>
            <NavLink to="/attacks" icon={<AlertTriangle />} active={location === "/attacks"}>
              Attack Simulation
            </NavLink>
            <NavLink to="/mitigation" icon={<Shield />} active={location === "/mitigation"}>
              Mitigation
            </NavLink>
          </nav>
          
          <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 space-y-1.5">
            <NavLink to="/settings" icon={<Settings />} active={location === "/settings"}>
              Settings
            </NavLink>
            <a 
              href="https://example.com/docs" 
              className="flex items-center px-3 py-2 text-sm rounded-md text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-50 transition-colors"
              target="_blank" 
              rel="noopener noreferrer"
            >
              <LifeBuoy className="h-5 w-5 mr-3" />
              Help & Support
            </a>
          </div>
        </div>
      </aside>
      
      {/* Main Content */}
      <main 
        className={cn(
          "flex-1 transition-all duration-300 ease-in-out",
          isSidebarOpen ? "lg:ml-64" : "ml-0"
        )}
      >
        <div className="h-full">
          <div className="h-full pt-16 lg:pt-0">
            <div className="h-full">
              <div className="container mx-auto">
                <Route />
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Overlay for mobile */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}

// NavLink component
function NavLink({ to, icon, active, children }: { 
  to: string, 
  icon: React.ReactNode, 
  active: boolean,
  children: React.ReactNode 
}) {
  return (
    <Link href={to}>
      <div 
        className={cn(
          "flex items-center px-3 py-2 text-sm rounded-md transition-colors",
          active 
            ? "bg-primary/10 text-primary font-medium" 
            : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-50"
        )}
      >
        <span className="mr-3">{icon}</span>
        {children}
      </div>
    </Link>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/network" component={NetworkPage} />
      <Route path="/attacks" component={AttacksPage} />
      <Route path="/monitoring" component={MonitoringPage} />
      <Route path="/mitigation" component={MitigationPage} />
      <Route path="/settings" component={SettingsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SocketProvider>
        <Navigation />
        <Toaster />
      </SocketProvider>
    </QueryClientProvider>
  );
}

export default App;
