import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Shield, Activity, AlertTriangle, Database, Settings, Home } from "lucide-react";

const AppName = "SecureICS - OT Security Monitor";

export function Navbar() {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Dashboard", icon: Home },
    { href: "/network", label: "Network", icon: Database },
    { href: "/attacks", label: "Attack Simulator", icon: AlertTriangle },
    { href: "/monitoring", label: "Monitoring", icon: Activity },
    { href: "/mitigation", label: "Mitigation", icon: Shield },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="bg-card border-b">
      <div className="container flex h-16 items-center px-4">
        <div className="mr-8 flex items-center space-x-2">
          <Shield className="h-6 w-6 text-primary" />
          <span className="hidden font-bold text-lg sm:inline-block bg-gradient-to-r from-primary to-blue-500 text-transparent bg-clip-text">
            {AppName}
          </span>
        </div>
        <nav className="flex items-center space-x-4 lg:space-x-6 mx-6 overflow-x-auto">
          {navItems.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            
            return (
              <Button
                key={item.href}
                asChild
                variant={isActive ? "secondary" : "ghost"}
                size="sm"
                className={cn(
                  "text-sm font-medium transition-colors",
                  isActive 
                    ? "text-foreground" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Link href={item.href}>
                  <div className="flex items-center space-x-2">
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </div>
                </Link>
              </Button>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center space-x-4">
          <Button variant="outline" size="sm">
            <Shield className="mr-2 h-4 w-4" />
            Security Scan
          </Button>
        </div>
      </div>
    </div>
  );
}