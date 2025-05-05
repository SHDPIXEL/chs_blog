import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import AuthorLayout from "@/components/layout/AuthorLayout";
import PageHeader from "@/components/ui/PageHeader";
import StatsCard from "@/components/ui/StatsCard";
import NotificationsList from "@/components/ui/NotificationsList";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText,
  FilePlus,
  FileSpreadsheet,
  Eye,
  Clock,
  MessageSquare,
  Edit,
} from "lucide-react";
import { AuthorDashboardData, Article } from "@/types/auth";
import { Helmet } from "react-helmet-async";
import { Badge } from "@/components/ui/badge";
import { getFormatDistanceToNow } from "@/utils/distanceToNow";

const AuthorDashboard: React.FC = () => {
  const [_, setLocation] = useLocation();
  const { data, isLoading, error } = useQuery<AuthorDashboardData>({
    queryKey: ["/api/author/dashboard"],
  });

  const handleNewBlog = () => {
    setLocation("/author/blogs/new");
  };

  return (
    <AuthorLayout>
      <Helmet>
        <title>
          Author Dashboard | Centre for Human Sciences | Rishihood University
        </title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <PageHeader
          title="Author Dashboard"
          buttonText="New Blog"
          buttonIcon={FilePlus}
          onButtonClick={handleNewBlog}
        />

        <div className="max-w-7xl ">
          <div className="py-4">
            {/* Dashboard content */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {isLoading ? (
                // Skeleton loaders for stats cards
                Array(3)
                  .fill(null)
                  .map((_, i) => (
                    <div
                      key={i}
                      className="bg-white overflow-hidden shadow rounded-lg p-5"
                    >
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
                <div className="col-span-3 p-4 bg-red-50 text-red-700 rounded-lg">
                  Error loading dashboard data
                </div>
              ) : data ? (
                <>
                  <StatsCard
                    icon={FileText}
                    label="Published"
                    value={data.stats.published}
                    color="blue"
                  />
                  <StatsCard
                    icon={FileSpreadsheet}
                    label="Drafts"
                    value={data.stats.drafts}
                    color="yellow"
                  />
                  <StatsCard
                    icon={Eye}
                    label="Total Views"
                    value={data.stats.totalViews}
                    color="green"
                  />
                </>
              ) : null}
            </div>

            {/* Recent Blogs */}
            <div className="mt-8">
              <h2 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Your Recent Blogs
              </h2>
              <Card>
                {isLoading ? (
                  // Skeleton loader for articles list
                  <div className="divide-y divide-gray-200">
                    {Array(3)
                      .fill(null)
                      .map((_, i) => (
                        <div key={i} className="p-4">
                          <div className="animate-pulse space-y-3">
                            <div className="flex justify-between">
                              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
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
                    Error loading articles data
                  </div>
                ) : data && data.articles.length > 0 ? (
                  <ul className="divide-y divide-gray-200">
                    {data.articles.map((article: Article) => (
                      <ArticleItem key={article.id} article={article} />
                    ))}
                  </ul>
                ) : (
                  <div className="p-6 text-center text-gray-500">
                    <FileText className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                    <p>No blogs yet. Create your first blog to get started!</p>
                  </div>
                )}
              </Card>
            </div>

            {/* Notifications */}
            <div className="mt-8">
              <h2 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Notifications
              </h2>
              <NotificationsList />
            </div>
          </div>
        </div>
      </div>
    </AuthorLayout>
  );
};

// Article item component
interface ArticleItemProps {
  article: Article;
}

const ArticleItem: React.FC<ArticleItemProps> = ({ article }) => {
  const [, navigate] = useLocation();

  return (
    <li className="block hover:bg-gray-50">
      <div className="px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between">
          <p className="text-md font-bold text-primary truncate">
            {article.title}
          </p>
          <div className="ml-2 flex-shrink-0 flex items-center space-x-2">
            <Badge
              variant={
                article.published
                  ? "default"
                  : article.status === "review"
                  ? "outline"
                  : "secondary"
              }
              className="capitalize"
            >
              {article.status || (article.published ? "published" : "draft")}
            </Badge>
          </div>
        </div>
        <div className="mt-2 sm:flex sm:justify-between">
          <div className="sm:flex">
            {article.published == "true" ? (
              <p className="flex items-center text-sm text-gray-500">
                <Eye className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                {article.viewCount || "0"} views
              </p>
            ) : null}
            {article.published  == "true"  ? (
              <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                <MessageSquare className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                {article.commentCount || "0"} comments
              </p>
            ) : null}
            {!article.published  == "true"  && (
              <p className="flex items-center text-sm text-gray-500">
                <Edit className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                Last edited{" "}
                {getFormatDistanceToNow(article.updatedAt)}
              </p>
            )}
          </div>
          <div className="mt-2 flex items-center justify-between sm:mt-0">
            <div className="flex items-center text-sm text-gray-500 mr-4">
              <Clock className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
              <p>
                {article.published  == "true" 
                  ? `Published ${getFormatDistanceToNow(article.createdAt)}`
                  : `Created ${getFormatDistanceToNow(article.createdAt)}`}
              </p>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/author/blogs/${article.id}`)}
              >
                <Edit className="h-4 w-4 mr-1" /> Edit
              </Button>
              {article.published  == "true" ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    navigate(`/blogs/${article.id}/${article.slug}`)
                  }
                >
                  <Eye className="h-4 w-4 mr-1" /> View
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/preview/blogs/${article.id}`)}
                >
                  <Eye className="h-4 w-4 mr-1" /> Preview
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </li>
  );
};

export default AuthorDashboard;
