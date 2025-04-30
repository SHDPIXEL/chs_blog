import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import AuthorLayout from "@/components/layout/AuthorLayout";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import PageHeader from "@/components/ui/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlusIcon, Edit, Trash2, Eye, Clock } from "lucide-react";
import { ArticleStatus, ArticleStatusType } from "@shared/schema";

// Article type from API
type Article = {
  id: number;
  title: string;
  content: string;
  excerpt?: string;
  authorId: number;
  status: ArticleStatusType;
  published: boolean;
  featuredImage?: string;
  createdAt: string;
  updatedAt: string;
};

const BlogsPage = () => {
  const [, setLocation] = useLocation();
  
  // Fetch all articles
  const { data: articles, isLoading } = useQuery<Article[]>({
    queryKey: ['/api/author/articles'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/author/articles');
      return res.json();
    }
  });
  
  // Filter articles by status
  const draftArticles = articles?.filter(article => article.status === ArticleStatus.DRAFT) || [];
  const reviewArticles = articles?.filter(article => article.status === ArticleStatus.REVIEW) || [];
  const publishedArticles = articles?.filter(article => article.status === ArticleStatus.PUBLISHED) || [];
  
  // Handle new blog creation
  const handleNewBlog = () => {
    setLocation('/author/blogs/new');
  };
  
  // Status badge component
  const StatusBadge = ({ status }: { status: ArticleStatusType }) => {
    switch (status) {
      case ArticleStatus.DRAFT:
        return <Badge variant="outline">Draft</Badge>;
      case ArticleStatus.REVIEW:
        return <Badge variant="secondary">In Review</Badge>;
      case ArticleStatus.PUBLISHED:
        return <Badge variant="default">Published</Badge>;
      default:
        return null;
    }
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Render article table
  const ArticleTable = ({ articles }: { articles: Article[] }) => {
    if (articles.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500">No articles found</p>
        </div>
      );
    }
    
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead className="w-[150px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {articles.map((article) => (
            <TableRow key={article.id}>
              <TableCell className="font-medium">{article.title}</TableCell>
              <TableCell><StatusBadge status={article.status} /></TableCell>
              <TableCell>{formatDate(article.updatedAt)}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="icon" asChild>
                    <Link to={`/author/blogs/${article.id}`}>
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">View</span>
                    </Link>
                  </Button>
                  <Button variant="ghost" size="icon" asChild>
                    <Link to={`/author/blogs/${article.id}/edit`}>
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Link>
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };
  
  // Loading skeleton
  if (isLoading) {
    return (
      <AuthorLayout>
        <div className="py-6 px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 w-1/3 bg-gray-200 rounded mb-5"></div>
            <div className="h-64 bg-gray-200 rounded mb-5"></div>
          </div>
        </div>
      </AuthorLayout>
    );
  }
  
  return (
    <AuthorLayout>
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <PageHeader 
          title="My Blogs" 
          buttonText="New Blog"
          buttonIcon={PlusIcon}
          onButtonClick={handleNewBlog}
        />
        
        <div className="mt-6">
          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Blogs</TabsTrigger>
              <TabsTrigger value="drafts">Drafts</TabsTrigger>
              <TabsTrigger value="review">In Review</TabsTrigger>
              <TabsTrigger value="published">Published</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all">
              <Card>
                <CardHeader>
                  <CardTitle>All Blogs</CardTitle>
                  <CardDescription>
                    Manage all your blog posts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ArticleTable articles={articles || []} />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="drafts">
              <Card>
                <CardHeader>
                  <CardTitle>Draft Blogs</CardTitle>
                  <CardDescription>
                    Continue working on your drafts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ArticleTable articles={draftArticles} />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="review">
              <Card>
                <CardHeader>
                  <CardTitle>Blogs In Review</CardTitle>
                  <CardDescription>
                    Blogs awaiting approval
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ArticleTable articles={reviewArticles} />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="published">
              <Card>
                <CardHeader>
                  <CardTitle>Published Blogs</CardTitle>
                  <CardDescription>
                    Your published blog posts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ArticleTable articles={publishedArticles} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AuthorLayout>
  );
};

export default BlogsPage;