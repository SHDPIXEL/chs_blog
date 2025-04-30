import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  color?: 'blue' | 'green' | 'yellow' | 'indigo' | 'red' | 'purple';
}

const StatsCard: React.FC<StatsCardProps> = ({
  icon: Icon,
  label,
  value,
  color = 'blue',
}) => {
  const colorVariants = {
    blue: {
      bg: 'bg-blue-100',
      text: 'text-blue-600',
    },
    green: {
      bg: 'bg-green-100',
      text: 'text-green-600',
    },
    yellow: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-600',
    },
    indigo: {
      bg: 'bg-indigo-100',
      text: 'text-indigo-600',
    },
    red: {
      bg: 'bg-red-100',
      text: 'text-red-600',
    },
    purple: {
      bg: 'bg-purple-100',
      text: 'text-purple-600',
    },
  };

  const selectedColor = colorVariants[color];

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className={cn('flex-shrink-0 rounded-md p-3', selectedColor.bg)}>
            <Icon className={cn('h-6 w-6', selectedColor.text)} />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{label}</dt>
              <dd>
                <div className="text-lg font-medium text-gray-900">{value}</div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
