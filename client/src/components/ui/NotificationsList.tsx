import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card } from "./card";
import { Button } from "./button";
import { Badge } from "./badge";
import { useToast } from "@/hooks/use-toast";
import { Bell, CheckCheck, RefreshCw, ExternalLink } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { getFormatDistanceToNow } from "@/utils/distanceToNow";

// Define Notification type based on the database schema
interface Notification {
  id: number;
  userId: number;
  type: string;
  title: string;
  message: string;
  articleId: number | null;
  commentId: number | null;
  read: boolean;
  createdAt: string;
  articleSlug?: string; // Added slug for blog URL
}

const NotificationsList: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showRead, setShowRead] = useState(false);

  // Fetch notifications with error handling for unauthorized requests
  const {
    data: notifications,
    isLoading,
    error,
  } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
    queryFn: async () => {
      try {
        const response = await apiRequest("GET", "/api/notifications");
        return response.json();
      } catch (error) {
        console.error("Error fetching notifications:", error);
        // Return empty array to avoid breaking the UI
        return [];
      }
    },
  });

  // Mark notification as read with improved error handling
  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      try {
        const response = await apiRequest("PATCH", `/api/notifications/${id}`);
        return response.json();
      } catch (error: any) {
        console.error("Error marking notification as read:", error);
        // Check for authentication errors
        if (error.message?.includes("401") || error.message?.includes("403")) {
          toast({
            title: "Authentication Error",
            description: "Please log in again to continue.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: "Could not mark notification as read.",
            variant: "destructive",
          });
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
    onError: (error: Error) => {
      // Additional error handling if needed
    },
  });

  // Mark all notifications as read with improved error handling
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      try {
        const response = await apiRequest("PATCH", "/api/notifications");
        return response.json();
      } catch (error: any) {
        console.error("Error marking all notifications as read:", error);
        // Check for authentication errors
        if (error.message?.includes("401") || error.message?.includes("403")) {
          toast({
            title: "Authentication Error",
            description: "Please log in again to continue.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: "Could not mark all notifications as read.",
            variant: "destructive",
          });
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      toast({
        title: "Success",
        description: "All notifications marked as read",
      });
    },
    onError: () => {
      // Additional error handling if needed - already handled in mutationFn
    },
  });

  // Filter notifications based on read status
  const filteredNotifications = notifications?.filter((notification) =>
    showRead ? true : !notification.read,
  );

  // Get count of unread notifications
  const unreadCount =
    notifications?.filter((notification) => !notification.read).length || 0;

  // Handle click on a notification
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsReadMutation.mutate(notification.id);
    }
  };

  // Get badge color based on notification type
  const getBadgeVariant = (type: string) => {
    switch (type) {
      case "ARTICLE_APPROVED":
        return "default"; // Using default for approved (green is not available)
      case "ARTICLE_REJECTED":
        return "destructive";
      case "ARTICLE_COMMENT":
        return "secondary";
      default:
        return "outline";
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
            {showRead ? "Hide Read" : "Show All"}
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
                  ? "bg-gray-50 border-gray-100"
                  : "bg-white border-gray-200 hover:bg-gray-50"
              }`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="flex justify-between items-start mb-1">
                <div className="font-medium">{notification.title}</div>
                <Badge variant={getBadgeVariant(notification.type)}>
                  {notification.type.replace("_", " ")}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mb-1">
                {notification.message}
              </p>
              <div className="flex justify-between items-center mt-2">
                <div className="text-xs text-gray-400 flex items-center">
                  <span>
                    {getFormatDistanceToNow(notification.createdAt)}
                  </span>
                  {notification.read && (
                    <span className="text-green-500 text-xs ml-2">Read</span>
                  )}
                </div>
                {notification.type === "comment_received" &&
                  notification.articleId && (
                    <Link
                      to={`/blogs/${notification.articleId}${notification.articleSlug ? `/${notification.articleSlug}` : ''}`}
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent the parent onClick from firing
                        // Mark as read when navigating
                        if (!notification.read) {
                          markAsReadMutation.mutate(notification.id);
                        }
                      }}
                      className="text-xs flex items-center text-blue-500 hover:text-blue-700"
                    >
                      <span className="mr-1">View blog</span>
                      <ExternalLink size={12} />
                    </Link>
                  )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-4 text-center text-gray-500">
          <p>No {showRead ? "" : "unread"} notifications.</p>
        </div>
      )}
    </Card>
  );
};

export default NotificationsList;
