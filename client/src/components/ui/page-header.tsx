import React from 'react';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description?: string;
  buttonText?: string;
  buttonIcon?: LucideIcon;
  onButtonClick?: () => void;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  buttonText,
  buttonIcon: Icon,
  onButtonClick,
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="text-muted-foreground">{description}</p>
        )}
      </div>
      {buttonText && onButtonClick && (
        <Button 
          onClick={onButtonClick}
          className="mt-4 md:mt-0"
        >
          {Icon && <Icon className="mr-2 h-4 w-4" />}
          {buttonText}
        </Button>
      )}
    </div>
  );
};

export default PageHeader;