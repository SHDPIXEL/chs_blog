import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import AdminLayout from '@/components/layouts/AdminLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import {
  MoreHorizontal,
  Eye,
  CheckCircle,
  XCircle,
  Search,
  MessageSquare,
  AlertCircle,
} from 'lucide-react';
import { Article, ArticleStatus } from '@shared/schema';

interface ExtendedArticle extends Article {
  author: string;
  authorId: number;
  categories: string[];
  viewCount: number;
  featured: boolean;
}

const BlogApprovals: React.FC = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [reviewDialog, setReviewDialog] = useState(false);
  const [selectedBlogId, setSelectedBlogId] = useState<number | null>(null);
  const [reviewRemarks, setReviewRemarks] = useState('');
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject' | null>(null);

  // Fetch blogs in review status
  const { data: reviewBlogs, isLoading } = useQuery<ExtendedArticle[]>({
    queryKey: ['/api/admin/articles', 'review'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/admin/articles?status=review');
      return res.json();
    }
  });

  // Approve blog mutation
  const approveBlogMutation = useMutation({
    mutationFn: async ({ blogId, remarks }: { blogId: number; remarks: string }) => {
      const res = await apiRequest('PATCH', `/api/admin/articles/${blogId}/status`, {
        status: ArticleStatus.PUBLISHED,
        remarks
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/articles', 'review'] });
      closeReviewDialog();
      toast({
        title: 'Blog approved',
        description: 'The blog has been approved and published successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Approval failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Reject blog mutation
  const rejectBlogMutation = useMutation({
    mutationFn: async ({ blogId, remarks }: { blogId: number; remarks: string }) => {
      const res = await apiRequest('PATCH', `/api/admin/articles/${blogId}/status`, {
        status: ArticleStatus.DRAFT,
        remarks
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/articles', 'review'] });
      closeReviewDialog();
      toast({
        title: 'Blog rejected',
        description: 'The blog has been rejected and moved back to draft',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Rejection failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Open review dialog
  const openReviewDialog = (blogId: number, action: 'approve' | 'reject') => {
    setSelectedBlogId(blogId);
    setApprovalAction(action);
    setReviewRemarks('');
    setReviewDialog(true);
  };

  // Close review dialog
  const closeReviewDialog = () => {
    setReviewDialog(false);
    setSelectedBlogId(null);
    setApprovalAction(null);
    setReviewRemarks('');
  };

  // Submit review
  const handleReviewSubmit = () => {
    if (!selectedBlogId || !approvalAction) return;

    // For rejections, remarks are required
    if (approvalAction === 'reject' && !reviewRemarks.trim()) {
      toast({
        title: 'Feedback required',
        description: 'Please provide feedback to the author explaining why the blog was rejected.',
        variant: 'destructive',
      });
      return;
    }

    if (approvalAction === 'approve') {
      approveBlogMutation.mutate({ blogId: selectedBlogId, remarks: reviewRemarks });
    } else {
      rejectBlogMutation.mutate({ blogId: selectedBlogId, remarks: reviewRemarks });
    }
  };

  // Filtered blogs
  const filteredBlogs = reviewBlogs?.filter(blog => 
    searchQuery === '' || 
    blog.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="flex items-center justify-center h-[50vh]">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Blog Approvals</h1>
            <Badge className="text-lg" variant="outline">
              {filteredBlogs?.length || 0} Pending Review
            </Badge>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Blogs Awaiting Approval</CardTitle>
              <CardDescription>
                Review and approve blog submissions from authors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-4">
                {/* Search UI */}
                <div className="flex items-center">
                  <Search className="mr-2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search blogs by title..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="max-w-sm"
                  />
                </div>

                {/* Blog approvals table */}
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Author</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredBlogs && filteredBlogs.length > 0 ? (
                        filteredBlogs.map(blog => (
                          <TableRow key={blog.id}>
                            <TableCell className="font-medium">{blog.title}</TableCell>
                            <TableCell>{blog.author}</TableCell>
                            <TableCell>
                              {blog.categories && blog.categories.length > 0 
                                ? blog.categories.join(', ') 
                                : 'Uncategorized'}
                            </TableCell>
                            <TableCell>
                              {formatDistanceToNow(new Date(blog.updatedAt), { addSuffix: true })}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => window.open(`/blog/${blog.id}`, '_blank')}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => openReviewDialog(blog.id, 'approve')}
                                  className="text-green-600 hover:text-green-800 hover:bg-green-100"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => openReviewDialog(blog.id, 'reject')}
                                  className="text-red-600 hover:text-red-800 hover:bg-red-100"
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => window.open(`/blog/${blog.id}`, '_blank')}>
                                      <Eye className="mr-2 h-4 w-4" /> Preview
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => openReviewDialog(blog.id, 'approve')}>
                                      <CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Approve & Publish
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => openReviewDialog(blog.id, 'reject')}>
                                      <XCircle className="mr-2 h-4 w-4 text-red-500" /> Reject
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-6">
                            <AlertCircle className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                            <p>No blogs awaiting approval</p>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Review dialog */}
      <Dialog open={reviewDialog} onOpenChange={setReviewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {approvalAction === 'approve' ? 'Approve Blog' : 'Reject Blog'}
            </DialogTitle>
            <DialogDescription>
              {approvalAction === 'approve' 
                ? 'The blog will be published and available to readers.' 
                : 'The blog will be moved back to draft status for the author to revise.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <label htmlFor="remarks" className="text-sm font-medium flex items-center mb-2">
              <MessageSquare className="mr-2 h-4 w-4" />
              Feedback to author {approvalAction === 'reject' && <span className="text-red-500 ml-1">*</span>}
            </label>
            <Textarea
              id="remarks"
              placeholder={approvalAction === 'approve' 
                ? "Optional: Enter any feedback or comments for the author..."
                : "Required: Please explain why this blog is being rejected..."}
              value={reviewRemarks}
              onChange={(e) => setReviewRemarks(e.target.value)}
              rows={5}
              className={approvalAction === 'reject' ? 'border-red-200 focus-visible:ring-red-500' : ''}
            />
            {approvalAction === 'reject' && (
              <p className="text-xs text-red-500 mt-1">
                * Feedback is required when rejecting a blog to help the author understand what needs improvement.
              </p>
            )}
            {approvalAction === 'approve' && (
              <p className="text-xs text-muted-foreground mt-1">
                Feedback is optional when approving a blog. You can provide constructive comments if desired.
              </p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeReviewDialog}>
              Cancel
            </Button>
            <Button 
              variant={approvalAction === 'approve' ? 'default' : 'destructive'}
              onClick={handleReviewSubmit}
            >
              {approvalAction === 'approve' ? 'Approve & Publish' : 'Reject Blog'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default BlogApprovals;