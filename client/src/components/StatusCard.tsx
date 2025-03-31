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
      case 'success': return 'bg-success-light';
      case 'warning': return 'bg-warning-light';
      case 'danger': return 'bg-danger-light';
      default: return 'bg-neutral-100';
    }
  };
  
  const getTextColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-success';
      case 'warning': return 'text-warning';
      case 'danger': return 'text-danger';
      default: return 'text-neutral-500';
    }
  };
  
  const renderIcon = () => {
    if (icon === 'check-circle') {
      return (
        <svg className={`h-6 w-6 ${getTextColor(status)}`} viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      );
    } else if (icon === 'alert-triangle') {
      return (
        <svg className={`h-6 w-6 ${getTextColor(status)}`} viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      );
    } else if (icon === 'alert-circle') {
      return (
        <svg className={`h-6 w-6 ${getTextColor(status)}`} viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      );
    }
    
    return null;
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
          <a href={footerLink} className="font-medium text-secondary hover:text-secondary-dark">
            {footerText}
            <span aria-hidden="true"> &rarr;</span>
          </a>
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
