import React from 'react';
import { Badge } from '@/components/ui/badge';
import { User, FileText, Clock } from 'lucide-react';
import { ActivityItem as ActivityItemType } from '@/types/auth';
import { getFormatDistanceToNow } from '@/utils/distanceToNow';

interface ActivityItemProps {
  activity: ActivityItemType;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ activity }) => {
  // Determine appropriate badge color based on activity type
  const getBadgeVariant = () => {
    if (activity.type === 'userRegistered') {
      return 'green';
    } else if (activity.type === 'postPublished') {
      return 'blue';
    } else {
      return 'secondary';
    }
  };

  // Get appropriate label based on activity type
  const getActivityTitle = () => {
    if (activity.type === 'userRegistered') {
      return 'New user registered';
    } else if (activity.type === 'postPublished') {
      return 'New post published';
    } else {
      return activity.type;
    }
  };

  // Format the timestamp
  const getFormattedTime = () => {
    try {
      return getFormatDistanceToNow(activity.timestamp);
    } catch (error) {
      return 'recently';
    }
  };

  return (
    <li>
      <div className="block hover:bg-gray-50">
        <div className="px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-primary truncate">
              {getActivityTitle()}
            </p>
            <div className="ml-2 flex-shrink-0 flex">
              {activity.role && (
                <Badge variant={getBadgeVariant() as any}>
                  {activity.role}
                </Badge>
              )}
            </div>
          </div>
          <div className="mt-2 sm:flex sm:justify-between">
            <div className="sm:flex">
              {activity.user && (
                <p className="flex items-center text-sm text-gray-500">
                  <User className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                  {activity.user}
                </p>
              )}
              {activity.title && (
                <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                  <FileText className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                  {activity.title}
                </p>
              )}
            </div>
            <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
              <Clock className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
              <p>{getFormattedTime()}</p>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
};

export default ActivityItem;
