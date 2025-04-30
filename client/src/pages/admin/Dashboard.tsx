import React from 'react';
import { useQuery } from '@tanstack/react-query';
import AdminLayout from '@/components/layout/AdminLayout';
import PageHeader from '@/components/ui/PageHeader';
import StatsCard from '@/components/ui/StatsCard';
import ActivityItem from '@/components/ui/ActivityItem';
import { Card } from '@/components/ui/card';
import { 
  User, 
  FileText, 
  Eye, 
  MessageSquare 
} from 'lucide-react';
import { AdminDashboardData } from '@/types/auth';
import { Helmet } from 'react-helmet';

const AdminDashboard: React.FC = () => {
  const { data, isLoading, error } = useQuery<AdminDashboardData>({
    queryKey: ['/api/admin/dashboard'],
  });

  return (
    <AdminLayout>
      <Helmet>
        <title>Admin Dashboard | BlogCMS</title>
      </Helmet>
      <div className="py-6">
        <PageHeader title="Admin Dashboard" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="py-4">
            {/* Dashboard content */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {isLoading ? (
                // Skeleton loaders for stats cards
                Array(4).fill(null).map((_, i) => (
                  <div key={i} className="bg-white overflow-hidden shadow rounded-lg p-5">
                    <div className="animate-pulse flex space-x-4">
                      <div className="rounded-md bg-gray-200 h-12 w-12"></div>
                      <div className="flex-1 space-y-2 py-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                ))
              ) : error ? (
                <div className="col-span-4 p-4 bg-red-50 text-red-700 rounded-lg">
                  Error loading dashboard data
                </div>
              ) : data ? (
                <>
                  <StatsCard 
                    icon={User} 
                    label="Total Users" 
                    value={data.stats.totalUsers} 
                    color="blue"
                  />
                  <StatsCard 
                    icon={FileText} 
                    label="Total Posts" 
                    value={data.stats.totalPosts} 
                    color="indigo"
                  />
                  <StatsCard 
                    icon={Eye} 
                    label="Page Views" 
                    value={data.stats.pageViews} 
                    color="green"
                  />
                  <StatsCard 
                    icon={MessageSquare} 
                    label="Comments" 
                    value={data.stats.comments} 
                    color="yellow"
                  />
                </>
              ) : null}
            </div>

            {/* Recent Activity */}
            <div className="mt-8">
              <h2 className="text-lg leading-6 font-medium text-gray-900 mb-4">Recent Activity</h2>
              <Card>
                {isLoading ? (
                  // Skeleton loader for activity list
                  <div className="divide-y divide-gray-200">
                    {Array(3).fill(null).map((_, i) => (
                      <div key={i} className="p-4">
                        <div className="animate-pulse space-y-3">
                          <div className="flex justify-between">
                            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                          </div>
                          <div className="flex justify-between pt-2">
                            <div className="flex space-x-2">
                              <div className="h-4 bg-gray-200 rounded w-24"></div>
                              <div className="h-4 bg-gray-200 rounded w-24 hidden sm:block"></div>
                            </div>
                            <div className="h-4 bg-gray-200 rounded w-28"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : error ? (
                  <div className="p-4 text-red-700">
                    Error loading activity data
                  </div>
                ) : data ? (
                  <ul className="divide-y divide-gray-200">
                    {data.recentActivity.map((activity) => (
                      <ActivityItem key={activity.id} activity={activity} />
                    ))}
                  </ul>
                ) : null}
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
