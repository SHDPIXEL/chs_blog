import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import AuthorLayout from '@/components/layout/AuthorLayout';
import PageHeader from '@/components/ui/PageHeader';
import StatsCard from '@/components/ui/StatsCard';
import { Card } from '@/components/ui/card';
import { 
  FileText, 
  FilePlus,
  FileSpreadsheet, 
  Eye, 
  Clock,
  MessageSquare,
  Edit
} from 'lucide-react';
import { AuthorDashboardData, Article } from '@/types/auth';
import { Helmet } from 'react-helmet';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';

const AuthorDashboard: React.FC = () => {
  const [_, setLocation] = useLocation();
  const { data, isLoading, error } = useQuery<AuthorDashboardData>({
    queryKey: ['/api/author/dashboard'],
  });

  const handleNewArticle = () => {
    setLocation('/author/articles/new');
  };

  return (
    <AuthorLayout>
      <Helmet>
        <title>Author Dashboard | BlogCMS</title>
      </Helmet>
      <div className="py-6">
        <PageHeader 
          title="Author Dashboard" 
          buttonText="New Article" 
          buttonIcon={FilePlus} 
          onButtonClick={handleNewArticle}
        />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="py-4">
            {/* Dashboard content */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {isLoading ? (
                // Skeleton loaders for stats cards
                Array(3).fill(null).map((_, i) => (
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

            {/* Recent Articles */}
            <div className="mt-8">
              <h2 className="text-lg leading-6 font-medium text-gray-900 mb-4">Your Recent Articles</h2>
              <Card>
                {isLoading ? (
                  // Skeleton loader for articles list
                  <div className="divide-y divide-gray-200">
                    {Array(3).fill(null).map((_, i) => (
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
                    <p>No articles yet. Create your first article to get started!</p>
                  </div>
                )}
              </Card>
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
  return (
    <li>
      <a href={`/author/articles/${article.id}`} className="block hover:bg-gray-50">
        <div className="px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-primary truncate">
              {article.title}
            </p>
            <div className="ml-2 flex-shrink-0 flex">
              <Badge variant={article.published ? "success" : "secondary"}>
                {article.published ? 'Published' : 'Draft'}
              </Badge>
            </div>
          </div>
          <div className="mt-2 sm:flex sm:justify-between">
            <div className="sm:flex">
              {article.published && (
                <p className="flex items-center text-sm text-gray-500">
                  <Eye className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                  243 views
                </p>
              )}
              {article.published && (
                <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                  <MessageSquare className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                  5 comments
                </p>
              )}
              {!article.published && (
                <p className="flex items-center text-sm text-gray-500">
                  <Edit className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                  Last edited {formatDistanceToNow(new Date(article.updatedAt), { addSuffix: true })}
                </p>
              )}
            </div>
            <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
              <Clock className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
              <p>
                {article.published 
                  ? `Published ${formatDistanceToNow(new Date(article.createdAt), { addSuffix: true })}` 
                  : `Created ${formatDistanceToNow(new Date(article.createdAt), { addSuffix: true })}`}
              </p>
            </div>
          </div>
        </div>
      </a>
    </li>
  );
};

export default AuthorDashboard;
