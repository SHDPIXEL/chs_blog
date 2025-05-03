import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import AdminLayout from "@/components/layouts/AdminLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import {
  MoreHorizontal,
  Pencil,
  Eye,
  Trash2,
  FileText,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Star,
  Plus,
} from "lucide-react";
import { Article, ArticleStatus } from "@shared/schema";

interface ExtendedArticle extends Article {
  author: string;
  authorId: number;
  categories: string[];
  viewCount: number;
  featured: boolean;
}

const AdminMyBlogs: React.FC = () => {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState<number | null>(null);

  // Fetch only admin's blogs
  const { data: blogs, isLoading } = useQuery<ExtendedArticle[]>({
    queryKey: ["/api/admin/articles", "my"],
    queryFn: async () => {
      if (!user) return [];
      const res = await apiRequest("GET", "/api/admin/articles");
      const allBlogs = await res.json();
      return allBlogs.filter(
        (blog: ExtendedArticle) => blog.authorId === user.id,
      );
    },
    enabled: !!user,
  });

  // Delete blog post
  const deleteBlogMutation = useMutation({
    mutationFn: async (blogId: number) => {
      const res = await apiRequest("DELETE", `/api/articles/${blogId}`);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/articles"] });
      setDeleteDialogOpen(false);
      setBlogToDelete(null);
      toast({
        title: "Blog deleted",
        description: "The blog post has been deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update blog status
  const updateStatusMutation = useMutation({
    mutationFn: async ({
      blogId,
      status,
    }: {
      blogId: number;
      status: string;
    }) => {
      const res = await apiRequest("PATCH", `/api/articles/${blogId}/status`, {
        status,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/articles"] });
      toast({
        title: "Status updated",
        description: "Blog status has been updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Toggle featured status
  const toggleFeaturedMutation = useMutation({
    mutationFn: async ({
      blogId,
      featured,
    }: {
      blogId: number;
      featured: boolean;
    }) => {
      const res = await apiRequest("PATCH", `/api/articles/${blogId}`, {
        featured,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/articles"] });
      toast({
        title: "Featured status updated",
        description: "Blog featured status has been updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Filter blogs
  const filteredBlogs = blogs?.filter((blog) => {
    // Text search filter
    const matchesSearch =
      searchQuery === "" ||
      blog.title.toLowerCase().includes(searchQuery.toLowerCase());

    // Status filter
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "published" && blog.published) ||
      (statusFilter === "draft" &&
        !blog.published &&
        blog.status === ArticleStatus.DRAFT) ||
      (statusFilter === "review" &&
        !blog.published &&
        blog.status === ArticleStatus.REVIEW);

    return matchesSearch && matchesStatus;
  });

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
            <h1 className="text-3xl font-bold">My Blogs</h1>
            <Button onClick={() => navigate("/admin/blogs/new")}>
              <Plus className="mr-2 h-4 w-4" />
              Create New Blog
            </Button>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>My Blog Posts</CardTitle>
              <CardDescription>
                Manage and edit your own blog posts as an admin.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-4">
                {/* Search and filter UI */}
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div className="flex items-center flex-1">
                    <Search className="mr-2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search blogs by title..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="max-w-sm"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Select
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Posts</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="review">In Review</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="icon">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Blog posts table */}
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Updated</TableHead>
                        <TableHead>Featured</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredBlogs?.map((blog) => (
                        <TableRow key={blog.id}>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">{blog.title}</span>
                              <span className="text-xs text-muted-foreground mt-1 line-clamp-1">
                                {blog.excerpt || "No excerpt available"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {blog.published ? (
                              <Badge className="bg-green-100 text-green-800 border-green-300">
                                Published
                              </Badge>
                            ) : blog.status === ArticleStatus.REVIEW ? (
                              <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                                In Review
                              </Badge>
                            ) : (
                              <Badge variant="outline">Draft</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {format(new Date(blog.createdAt), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell>
                            {format(new Date(blog.updatedAt), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell>
                            {blog.featured ? (
                              <Badge className="bg-blue-100 text-blue-800 border-blue-300">
                                Featured
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => {
                                    const slug = blog.title
                                      .toLowerCase()
                                      .replace(/[^\w\s-]/g, "")
                                      .replace(/\s+/g, "-")
                                      .replace(/-+/g, "-")
                                      .trim();
                                    window.open(`/blogs/${blog.id}/${slug}`, "_blank");
                                  }}
                                >
                                  <Eye className="mr-2 h-4 w-4" /> Preview
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    navigate(`/admin/blogs/${blog.id}`)
                                  }
                                >
                                  <Pencil className="mr-2 h-4 w-4" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {!blog.published ? (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      updateStatusMutation.mutate({
                                        blogId: blog.id,
                                        status: ArticleStatus.PUBLISHED,
                                      })
                                    }
                                  >
                                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />{" "}
                                    Publish
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      updateStatusMutation.mutate({
                                        blogId: blog.id,
                                        status: ArticleStatus.DRAFT,
                                      })
                                    }
                                  >
                                    <XCircle className="mr-2 h-4 w-4" />{" "}
                                    Unpublish
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                  onClick={() =>
                                    toggleFeaturedMutation.mutate({
                                      blogId: blog.id,
                                      featured: !blog.featured,
                                    })
                                  }
                                >
                                  <Star className="mr-2 h-4 w-4" />
                                  {blog.featured ? "Unfeature" : "Feature"}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => {
                                    setBlogToDelete(blog.id);
                                    setDeleteDialogOpen(true);
                                  }}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                      {(!filteredBlogs || filteredBlogs.length === 0) && (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center">
                            No blog posts found. Create a new blog to get
                            started.
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this blog post? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                blogToDelete && deleteBlogMutation.mutate(blogToDelete)
              }
              disabled={deleteBlogMutation.isPending}
            >
              {deleteBlogMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminMyBlogs;
