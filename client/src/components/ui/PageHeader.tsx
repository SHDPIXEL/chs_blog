import React from 'react';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  buttonText?: string;
  buttonIcon?: LucideIcon;
  onButtonClick?: () => void;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  buttonText,
  buttonIcon: Icon,
  onButtonClick,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-2">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
        
        {buttonText && (
          <Button
            onClick={onButtonClick}
            className="inline-flex items-center px-4 py-2"
          >
            {Icon && <Icon className="mr-2 h-4 w-4" />}
            {buttonText}
          </Button>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
