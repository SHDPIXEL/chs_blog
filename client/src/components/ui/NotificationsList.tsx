import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from './card';
import { Button } from './button';
import { Badge } from './badge';
import { useToast } from '@/hooks/use-toast';
import { Bell, CheckCheck, RefreshCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

// Define Notification type based on the database schema
interface Notification {
  id: number;
  userId: number;
  type: string;
  title: string;
  message: string;
  articleId: number | null;
  read: boolean;
  createdAt: string;
}

const NotificationsList: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showRead, setShowRead] = useState(false);

  // Fetch notifications
  const { data: notifications, isLoading, error } = useQuery<Notification[]>({
    queryKey: ['/api/notifications'],
  });

  // Mark notification as read
  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/notifications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: 'Could not mark notification as read.',
        variant: 'destructive',
      });
    },
  });

  // Mark all notifications as read
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) {
        throw new Error('Failed to mark all notifications as read');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      toast({
        title: 'Success',
        description: 'All notifications marked as read',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: 'Could not mark all notifications as read.',
        variant: 'destructive',
      });
    },
  });

  // Filter notifications based on read status
  const filteredNotifications = notifications?.filter(notification => 
    showRead ? true : !notification.read
  );

  // Get count of unread notifications
  const unreadCount = notifications?.filter(notification => !notification.read).length || 0;

  // Handle click on a notification
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsReadMutation.mutate(notification.id);
    }
  };

  // Get badge color based on notification type
  const getBadgeVariant = (type: string) => {
    switch (type) {
      case 'ARTICLE_APPROVED':
        return 'default'; // Using default for approved (green is not available)
      case 'ARTICLE_REJECTED':
        return 'destructive';
      case 'ARTICLE_COMMENT':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <Card className="p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Bell size={20} />
          <h3 className="text-lg font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Badge variant="secondary">{unreadCount} new</Badge>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowRead(!showRead)}
          >
            {showRead ? 'Hide Read' : 'Show All'}
          </Button>
          {unreadCount > 0 && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => markAllAsReadMutation.mutate()}
              disabled={markAllAsReadMutation.isPending}
            >
              {markAllAsReadMutation.isPending ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCheck className="h-4 w-4 mr-1" />
              )}
              Mark All Read
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="p-4 text-center">
          <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
          <p>Loading notifications...</p>
        </div>
      ) : error ? (
        <div className="p-4 text-center text-red-500">
          <p>Error loading notifications.</p>
        </div>
      ) : filteredNotifications && filteredNotifications.length > 0 ? (
        <div className="space-y-3">
          {filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-3 rounded-md border cursor-pointer transition-colors ${
                notification.read
                  ? 'bg-gray-50 border-gray-100'
                  : 'bg-white border-gray-200 hover:bg-gray-50'
              }`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="flex justify-between items-start mb-1">
                <div className="font-medium">{notification.title}</div>
                <Badge variant={getBadgeVariant(notification.type)}>
                  {notification.type.replace('_', ' ')}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mb-1">{notification.message}</p>
              <div className="text-xs text-gray-400 flex justify-between items-center">
                <span>{formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}</span>
                {notification.read && <span className="text-green-500 text-xs">Read</span>}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-4 text-center text-gray-500">
          <p>No {showRead ? '' : 'unread'} notifications.</p>
        </div>
      )}
    </Card>
  );
};

export default NotificationsList;