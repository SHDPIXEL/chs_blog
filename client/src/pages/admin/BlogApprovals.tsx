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
import { format, formatDistanceToNow } from 'date-fns';
import {
  MoreHorizontal,
  Eye,
  CheckCircle,
  XCircle,
  Search,
  MessageSquare,
  AlertCircle,
  Calendar,
  Clock,
} from 'lucide-react';
import { Article, ArticleStatus } from '@shared/schema';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';

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
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject' | 'schedule' | null>(null);
  const [useScheduling, setUseScheduling] = useState(false);
  const [scheduledPublishAt, setScheduledPublishAt] = useState<string | undefined>(undefined);

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

  // Schedule blog mutation
  const scheduleBlogMutation = useMutation({
    mutationFn: async ({ 
      blogId, 
      remarks, 
      scheduledPublishAt 
    }: { 
      blogId: number; 
      remarks: string;
      scheduledPublishAt: string;
    }) => {
      const res = await apiRequest('PATCH', `/api/admin/articles/${blogId}/status`, {
        status: ArticleStatus.PUBLISHED,
        remarks,
        scheduledPublishAt,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/articles', 'review'] });
      closeReviewDialog();
      toast({
        title: 'Blog scheduled',
        description: 'The blog has been approved and scheduled for publication',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Scheduling failed',
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
  const openReviewDialog = (blogId: number, action: 'approve' | 'reject' | 'schedule') => {
    setSelectedBlogId(blogId);
    setApprovalAction(action);
    setReviewRemarks('');
    setUseScheduling(action === 'schedule');
    
    // Set default scheduled time for scheduling (tomorrow at noon)
    if (action === 'schedule') {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(12, 0, 0, 0);
      setScheduledPublishAt(tomorrow.toISOString());
    } else {
      setScheduledPublishAt(undefined);
    }
    
    setReviewDialog(true);
  };

  // Close review dialog
  const closeReviewDialog = () => {
    setReviewDialog(false);
    setSelectedBlogId(null);
    setApprovalAction(null);
    setReviewRemarks('');
    setUseScheduling(false);
    setScheduledPublishAt(undefined);
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

    // For scheduling, scheduledPublishAt is required
    if (approvalAction === 'schedule' && !scheduledPublishAt) {
      toast({
        title: 'Schedule date required',
        description: 'Please select a date and time for publishing the blog.',
        variant: 'destructive',
      });
      return;
    }

    if (approvalAction === 'approve') {
      approveBlogMutation.mutate({ blogId: selectedBlogId, remarks: reviewRemarks });
    } else if (approvalAction === 'schedule') {
      if (scheduledPublishAt) {
        scheduleBlogMutation.mutate({ 
          blogId: selectedBlogId, 
          remarks: reviewRemarks,
          scheduledPublishAt
        });
      }
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
                                  onClick={() => openReviewDialog(blog.id, 'schedule')}
                                  className="text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                                >
                                  <Calendar className="h-4 w-4" />
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
                                    <DropdownMenuItem onClick={() => openReviewDialog(blog.id, 'schedule')}>
                                      <Calendar className="mr-2 h-4 w-4 text-blue-500" /> Accept & Schedule Publish
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {approvalAction === 'approve' ? 'Approve Blog' : 
               approvalAction === 'schedule' ? 'Schedule Blog Publication' : 
               'Reject Blog'}
            </DialogTitle>
            <DialogDescription>
              {approvalAction === 'approve' 
                ? 'The blog will be published and available to readers immediately.' 
                : approvalAction === 'schedule'
                ? 'The blog will be published automatically at the scheduled date and time.'
                : 'The blog will be moved back to draft status for the author to revise.'}
            </DialogDescription>
          </DialogHeader>
          
          {/* Scheduling controls */}
          {approvalAction === 'schedule' && (
            <div className="py-4 space-y-4 border-b border-border">
              <div className="flex flex-col space-y-2">
                <label htmlFor="scheduled-date" className="text-sm font-medium flex items-center">
                  <Calendar className="mr-2 h-4 w-4" />
                  Publication Date & Time <span className="text-red-500 ml-1">*</span>
                </label>
                
                <div className="grid gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className="text-left font-normal justify-start h-10"
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {scheduledPublishAt ? (
                          format(new Date(scheduledPublishAt), "PPP 'at' p")
                        ) : (
                          <span>Pick a date and time</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        initialFocus
                        selected={scheduledPublishAt ? new Date(scheduledPublishAt) : undefined}
                        onSelect={(date) => {
                          if (date) {
                            // Keep the time from the existing date if we have one
                            const currentDate = scheduledPublishAt ? new Date(scheduledPublishAt) : new Date();
                            date.setHours(
                              currentDate.getHours(),
                              currentDate.getMinutes(),
                              0,
                              0
                            );
                            setScheduledPublishAt(date.toISOString());
                          }
                        }}
                      />
                      {/* Time picker */}
                      <div className="p-3 border-t border-border">
                        <div className="flex items-center justify-between">
                          <label className="text-sm">Time:</label>
                          <div className="flex items-center space-x-2">
                            <Input
                              type="time"
                              className="w-32"
                              value={scheduledPublishAt ? 
                                format(new Date(scheduledPublishAt), "HH:mm") : 
                                "12:00"
                              }
                              onChange={(e) => {
                                if (e.target.value) {
                                  const [hours, minutes] = e.target.value.split(':').map(Number);
                                  const newDate = scheduledPublishAt ? 
                                    new Date(scheduledPublishAt) : 
                                    new Date();
                                  newDate.setHours(hours, minutes, 0, 0);
                                  setScheduledPublishAt(newDate.toISOString());
                                }
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                
                <p className="text-xs text-muted-foreground">
                  The blog will remain hidden from readers until this date and time.
                </p>
              </div>
            </div>
          )}
          
          {/* Feedback field */}
          <div className="py-4">
            <label htmlFor="remarks" className="text-sm font-medium flex items-center mb-2">
              <MessageSquare className="mr-2 h-4 w-4" />
              Feedback to author {approvalAction === 'reject' && <span className="text-red-500 ml-1">*</span>}
            </label>
            <Textarea
              id="remarks"
              placeholder={approvalAction === 'reject' 
                ? "Required: Please explain why this blog is being rejected..."
                : "Optional: Enter any feedback or comments for the author..."}
              value={reviewRemarks}
              onChange={(e) => setReviewRemarks(e.target.value)}
              rows={4}
              className={approvalAction === 'reject' ? 'border-red-200 focus-visible:ring-red-500' : ''}
            />
            {approvalAction === 'reject' && (
              <p className="text-xs text-red-500 mt-1">
                * Feedback is required when rejecting a blog to help the author understand what needs improvement.
              </p>
            )}
            {(approvalAction === 'approve' || approvalAction === 'schedule') && (
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
              variant={approvalAction === 'reject' ? 'destructive' : 'default'}
              onClick={handleReviewSubmit}
            >
              {approvalAction === 'approve' ? 'Approve & Publish' : 
               approvalAction === 'schedule' ? 'Schedule Publication' : 
               'Reject Blog'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default BlogApprovals;