import React from 'react';
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';

interface AlertProps {
  type?: 'success' | 'error' | 'warning' | 'info';
  children: React.ReactNode;
  className?: string;
}

const Alert: React.FC<AlertProps> = ({ type = 'info', children, className = '' }) => {
  const styles = {
    success: {
      container: 'bg-green-50 border-green-200 text-green-800',
      icon: <CheckCircle className="h-5 w-5 text-green-600" />,
    },
    error: {
      container: 'bg-red-50 border-red-200 text-red-800',
      icon: <XCircle className="h-5 w-5 text-red-600" />,
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      icon: <AlertCircle className="h-5 w-5 text-yellow-600" />,
    },
    info: {
      container: 'bg-blue-50 border-blue-200 text-blue-800',
      icon: <Info className="h-5 w-5 text-blue-600" />,
    },
  };

  const { container, icon } = styles[type];

  return (
    <div className={`flex items-start gap-3 p-4 border rounded-lg ${container} ${className}`}>
      <div className="flex-shrink-0 mt-0.5">{icon}</div>
      <div className="flex-1 text-sm">{children}</div>
    </div>
  );
};

export default Alert;
