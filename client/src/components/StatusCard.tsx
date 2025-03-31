import { CheckCircle, AlertTriangle, AlertCircle, ServerIcon, Shield, Activity } from "lucide-react";
import { Link } from "wouter";

interface StatusCardProps {
  title: string;
  value: string;
  status: 'success' | 'warning' | 'danger' | 'neutral';
  icon: string;
  footerText: string;
  footerLink?: string;
}

export default function StatusCard({ 
  title, 
  value, 
  status, 
  icon, 
  footerText, 
  footerLink 
}: StatusCardProps) {
  
  const getBgColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-50';
      case 'warning': return 'bg-yellow-50';
      case 'danger': return 'bg-red-50';
      default: return 'bg-gray-100';
    }
  };
  
  const getTextColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'danger': return 'text-red-600';
      default: return 'text-neutral-500';
    }
  };
  
  const renderIcon = () => {
    const className = `h-6 w-6 ${getTextColor(status)}`;
    
    switch(icon) {
      case 'check-circle':
      case 'shield-check':
        return <CheckCircle className={className} />;
      case 'alert-triangle':
        return <AlertTriangle className={className} />;
      case 'alert-circle':
        return <AlertCircle className={className} />;
      case 'server':
        return <ServerIcon className={className} />;
      case 'shield':
        return <Shield className={className} />;
      case 'activity':
        return <Activity className={className} />;
      default:
        return <AlertCircle className={className} />;
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center">
          <div className={`flex-shrink-0 ${getBgColor(status)} rounded-md p-3`}>
            {renderIcon()}
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-neutral-500 truncate">
                {title}
              </dt>
              <dd>
                <div className={`text-lg font-medium ${getTextColor(status)}`}>
                  {value}
                </div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
      <div className="bg-neutral-50 px-4 py-4 sm:px-6">
        {footerLink ? (
          <Link href={footerLink} className="font-medium text-blue-600 hover:text-blue-800">
            {footerText}
            <span aria-hidden="true"> &rarr;</span>
          </Link>
        ) : (
          <div className="text-sm">
            <span className="font-medium text-neutral-600">{footerText.split(' ')[0]}</span>
            <span className="text-neutral-500"> {footerText.split(' ').slice(1).join(' ')}</span>
          </div>
        )}
      </div>
    </div>
  );
}
