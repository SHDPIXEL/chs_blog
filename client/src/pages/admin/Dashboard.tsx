import React from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import { Helmet } from "react-helmet-async";
import AdminLayout from "@/components/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Users,
  BookOpen,
  Eye,
  FileText,
  BarChart2,
  PieChart as PieChartIcon,
  TrendingUp,
  Clock,
  AlertCircle,
  CheckSquare,
} from "lucide-react";

interface DashboardStats {
  totalUsers: number;
  totalPosts: number;
  totalViews: number;
  postsThisMonth: number;
}

interface CategoryStat {
  name: string;
  count: number;
}

interface StatusCount {
  status: string;
  count: number;
}

interface ViewData {
  date: string;
  views: number;
}

interface ActivityItem {
  id: number;
  action: string;
  user: string;
  timestamp: string;
}

interface ExtendedArticle {
  id: number;
  title: string;
  content: string;
  excerpt?: string;
  authorId: number;
  status: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  featuredImage?: string;
  author: string;
  categories: string[];
  viewCount: number;
  featured: boolean;
}

interface DashboardData {
  totalUsers: number;
  totalPosts: number;
  totalViews: number;
  postsThisMonth: number;
  popularCategories: CategoryStat[];
  recentActivity: ActivityItem[];
  postsByStatus: StatusCount[];
  viewsOverTime: ViewData[];
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const AdminDashboard: React.FC = () => {
  const { data: dashboardData, isLoading } = useQuery<DashboardData>({
    queryKey: ["/api/admin/dashboard"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/admin/dashboard");
      return res.json();
    },
  });

  // Get articles awaiting approval
  const { data: pendingApprovals, isLoading: isLoadingApprovals } = useQuery<
    any[]
  >({
    queryKey: ["/api/admin/articles", "review"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/admin/articles?status=review");
      const data = await res.json();
      return data;
    },
  });

  if (isLoading) {
    return (
      <AdminLayout>
        <Helmet>
          <title>
            Admin Dashboard | Centre for Human Sciences | Rishihood University
          </title>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
        <div className="p-6">
          <div className="flex items-center justify-center h-[50vh]">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!dashboardData) {
    return (
      <AdminLayout>
        <Helmet>
          <title>
            Admin Dashboard | Centre for Human Sciences | Rishihood University
          </title>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
        <div className="p-6">
          <div className="flex items-center justify-center h-[50vh]">
            <p className="text-muted-foreground">
              Failed to load dashboard data.
            </p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Helmet>
        <title>
          Admin Dashboard | Centre for Human Sciences | Rishihood University
        </title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to your dashboard. Here's an overview of your blog platform.
          </p>
        </div>

        {/* Pending approvals notification */}
        {!isLoadingApprovals &&
          pendingApprovals &&
          pendingApprovals.length > 0 && (
            <Alert variant="default" className="bg-amber-50 border-amber-200">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertTitle className="text-amber-800">
                Pending Blog Approvals
              </AlertTitle>
              <AlertDescription className="flex flex-row items-center justify-between">
                <span className="text-amber-700">
                  You have {pendingApprovals.length} blog post
                  {pendingApprovals.length > 1 ? "s" : ""} waiting for approval
                </span>
                <Button
                  asChild
                  variant="outline"
                  className="border-amber-500 hover:bg-amber-100 text-amber-800"
                >
                  <Link to="/admin/blog-approvals">
                    <CheckSquare className="mr-2 h-4 w-4" />
                    Review Blogs
                  </Link>
                </Button>
              </AlertDescription>
            </Alert>
          )}

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="flex flex-col items-center justify-center pt-6">
              <div className="bg-primary/10 p-3 rounded-full mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-bold text-3xl">
                {dashboardData.totalUsers || 0}
              </h3>
              <p className="text-muted-foreground">Total Authors</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col items-center justify-center pt-6">
              <div className="bg-primary/10 p-3 rounded-full mb-4">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-bold text-3xl">
                {dashboardData.totalPosts || 0}
              </h3>
              <p className="text-muted-foreground">Total Blog Posts</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col items-center justify-center pt-6">
              <div className="bg-primary/10 p-3 rounded-full mb-4">
                <Eye className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-bold text-3xl">
                {dashboardData.totalViews || 0}
              </h3>
              <p className="text-muted-foreground">Total Page Views</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col items-center justify-center pt-6">
              <div className="bg-primary/10 p-3 rounded-full mb-4">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-bold text-3xl">
                {dashboardData.postsThisMonth || 0}
              </h3>
              <p className="text-muted-foreground">Posts This Month</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts & Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Views Over Time Chart */}
          <Card className="col-span-1 lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Page Views</CardTitle>
                <CardDescription>Daily page views over time</CardDescription>
              </div>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={dashboardData.viewsOverTime || []}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="views"
                      stroke="#8884d8"
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Post Status Chart */}
{/*           <Card>
            <CardHeader>
              <CardTitle>Posts by Status</CardTitle>
              <CardDescription>
                Distribution of posts by their current status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dashboardData.postsByStatus || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="status"
                    >
                      {(dashboardData.postsByStatus || []).map(
                        (entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ),
                      )}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card> */}

          {/* Popular Categories Chart */}
{/*           <Card>
            <CardHeader>
              <CardTitle>Popular Categories</CardTitle>
              <CardDescription>
                Most used categories in blog posts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={dashboardData.popularCategories || []}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card> */}
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Latest actions on the platform
                </CardDescription>
              </div>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(dashboardData.recentActivity || []).map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell>{activity.action}</TableCell>
                    <TableCell>{activity.user}</TableCell>
                    <TableCell>
                      {new Date(activity.timestamp).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
