import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet-async";
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
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import {
  MoreHorizontal,
  Pencil,
  Eye,
  Trash2,
  FileText,
  Search,
  Calendar as CalendarIcon,
  Filter,
  Star,
  CheckCircle2,
  XCircle,
  SlidersHorizontal,
} from "lucide-react";
import { Article, ArticleStatus, Category } from "@shared/schema";

interface ExtendedArticle extends Article {
  author: string;
  authorId: number;
  categories: string[];
  viewCount: number;
  featured: boolean;
}

interface BlogFilters {
  status: string | null;
  author: number | null;
  category: number | null;
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
  viewCountRange: {
    min: number | null;
    max: number | null;
  };
}

const DEFAULT_FILTERS: BlogFilters = {
  status: null,
  author: null,
  category: null,
  dateRange: {
    from: null,
    to: null,
  },
  viewCountRange: {
    min: null,
    max: null,
  },
};

const BlogManagement: React.FC = () => {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<BlogFilters>(DEFAULT_FILTERS);
  const [selectedBlogs, setSelectedBlogs] = useState<number[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState<number | null>(null);
  const [bulkActionDialogOpen, setBulkActionDialogOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Fetch blog posts with extended info
  const { data: blogs, isLoading } = useQuery<ExtendedArticle[]>({
    queryKey: ["/api/admin/articles"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/admin/articles");
      return res.json();
    },
  });

  // Fetch authors for filter
  const { data: authors } = useQuery({
    queryKey: ["/api/users/authors"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/users/authors");
      return res.json();
    },
  });

  // Fetch categories for filter
  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/categories");
      return res.json();
    },
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

  // Bulk update status
  const bulkUpdateStatusMutation = useMutation({
    mutationFn: async ({
      blogIds,
      status,
    }: {
      blogIds: number[];
      status: string;
    }) => {
      console.log("Sending bulk update with IDs:", blogIds, "status:", status);

      try {
        // Ensure all IDs are valid numbers
        const numericIds = blogIds
          .map((id) => {
            if (typeof id === "string") {
              return parseInt(id.trim());
            }
            return Number(id);
          })
          .filter((id) => !isNaN(id) && id > 0);

        console.log("Filtered numeric IDs for update:", numericIds);

        // Make sure we have valid IDs to update
        if (numericIds.length === 0) {
          throw new Error("No valid article IDs to update");
        }

        const res = await apiRequest("PATCH", "/api/admin/articles/bulk/status/update", {
          ids: numericIds,
          status,
        });


        // Handle the response - clone it to prevent "body stream already read" errors
        const clonedRes = res.clone();
        let resultData;

        try {
          resultData = await res.json();
          console.log("Bulk update response:", resultData);
        } catch (err) {
          console.error("Error parsing JSON response:", err);
          // If JSON parsing fails, try text
          const textResponse = await clonedRes.text();
          console.log("Response as text:", textResponse);
          return { success: false, message: textResponse };
        }

        return resultData;
      } catch (error) {
        console.error("Bulk update error caught in mutation:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log("Bulk update succeeded with data:", data);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/articles"] });
      setBulkActionDialogOpen(false);
      setBulkAction(null);
      setSelectedBlogs([]);
      toast({
        title: "Bulk update successful",
        description: data.message || "Selected blog posts have been updated",
      });
    },
    onError: (error: Error) => {
      console.error("Bulk update error in onError handler:", error);
      toast({
        title: "Bulk update failed",
        description: error.message || "An error occurred during bulk update",
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

  // Bulk toggle featured status
  const bulkToggleFeaturedMutation = useMutation({
    mutationFn: async ({
      blogIds,
      featured,
    }: {
      blogIds: number[];
      featured: boolean;
    }) => {
      console.log(
        "Sending bulk featured toggle with IDs:",
        blogIds,
        "featured:",
        featured
      );

      try {
        // First, ensure all IDs are valid numbers and log them
        const numericIds = blogIds.map((id) => {
          const numId = Number(id);
          console.log(`Converting ID ${id} (${typeof id}) to number: ${numId}`);
          return numId;
        });

        console.log("After conversion, sending IDs:", numericIds);

        const res = await apiRequest(
          "PATCH",
          "/api/admin/articles/bulk/featured",
          {
            ids: numericIds,
            featured,
          }
        );

        // Handle the response - clone it to prevent "body stream already read" errors
        const clonedRes = res.clone();
        let resultData;

        try {
          resultData = await res.json();
          console.log("Bulk featured toggle response:", resultData);
        } catch (err) {
          console.error("Error parsing JSON response:", err);
          // If JSON parsing fails, try text
          const textResponse = await clonedRes.text();
          console.log("Response as text:", textResponse);
          return { success: false, message: textResponse };
        }

        return resultData;
      } catch (error) {
        console.error("Bulk featured toggle error caught in mutation:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log("Bulk featured toggle succeeded with data:", data);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/articles"] });
      setBulkActionDialogOpen(false);
      setBulkAction(null);
      setSelectedBlogs([]);
      toast({
        title: "Bulk update successful",
        description:
          data.message ||
          "Featured status of selected blog posts has been updated",
      });
    },
    onError: (error: Error) => {
      console.error("Bulk featured toggle error in onError handler:", error);
      toast({
        title: "Bulk update failed",
        description: error.message || "An error occurred during bulk update",
        variant: "destructive",
      });
    },
  });

  // Bulk delete blogs
  const bulkDeleteMutation = useMutation({
    mutationFn: async (blogIds: number[]) => {
      console.log("Sending bulk delete with IDs:", blogIds);

      try {
        // First, ensure all IDs are valid numbers and log them
        const numericIds = blogIds.map((id) => {
          const numId = Number(id);
          console.log(`Converting ID ${id} (${typeof id}) to number: ${numId}`);
          return numId;
        });

        console.log("After conversion, sending IDs:", numericIds);

        const res = await apiRequest("DELETE", "/api/admin/articles/bulk", {
          ids: numericIds,
        });

        // Handle the response - clone it to prevent "body stream already read" errors
        const clonedRes = res.clone();
        let resultData;

        try {
          resultData = await res.json();
          console.log("Bulk delete response:", resultData);
        } catch (err) {
          console.error("Error parsing JSON response:", err);
          // If JSON parsing fails, try text
          const textResponse = await clonedRes.text();
          console.log("Response as text:", textResponse);
          return { success: false, message: textResponse };
        }

        return resultData;
      } catch (error) {
        console.error("Bulk delete error caught in mutation:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log("Bulk delete succeeded with data:", data);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/articles"] });
      setBulkActionDialogOpen(false);
      setBulkAction(null);
      setSelectedBlogs([]);
      toast({
        title: "Bulk delete successful",
        description:
          data.message ||
          `${selectedBlogs.length} blog posts have been deleted`,
      });
    },
    onError: (error: Error) => {
      console.error("Bulk delete error in onError handler:", error);
      toast({
        title: "Bulk delete failed",
        description: error.message || "An error occurred during bulk deletion",
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

  // Select/deselect all blogs
  const handleSelectAll = (checked: boolean) => {
    if (checked && filteredBlogs) {
      // Make sure all IDs are numbers
      const numericIds = filteredBlogs.map((blog) => Number(blog.id));
      console.log("Selecting all blogs with IDs:", numericIds);
      setSelectedBlogs(numericIds);
    } else {
      console.log("Clearing all selected blogs");
      setSelectedBlogs([]);
    }
  };

  // Toggle selection of a single blog
  const handleToggleSelect = (blogId: number) => {
    // Ensure blogId is a number
    const numericBlogId = Number(blogId);
    console.log(
      "Toggling selection for blog ID:",
      numericBlogId,
      "type:",
      typeof numericBlogId
    );

    setSelectedBlogs((prev) => {
      // Check if it's already selected
      const isSelected = prev.some((id) => Number(id) === numericBlogId);

      if (isSelected) {
        // Remove this ID
        console.log("Removing blog ID from selection:", numericBlogId);
        return prev.filter((id) => Number(id) !== numericBlogId);
      } else {
        // Add this ID
        console.log("Adding blog ID to selection:", numericBlogId);
        return [...prev, numericBlogId];
      }
    });
  };

  // Handle bulk actions
  const executeBulkAction = () => {
    if (!bulkAction || selectedBlogs.length === 0) return;

    // Debug info about selected blogs
    console.log("Selected blog IDs:", selectedBlogs);
    console.log(
      "Types of selected blogs:",
      selectedBlogs.map((id) => typeof id)
    );
    console.log("Status information:", bulkAction);

    switch (bulkAction) {
      case "publish":
        console.log("Executing bulk publish with IDs:", selectedBlogs);
        bulkUpdateStatusMutation.mutate({
          blogIds: selectedBlogs,
          status: ArticleStatus.PUBLISHED,
        });
        break;
      case "draft":
        console.log("Executing bulk draft with IDs:", selectedBlogs);
        bulkUpdateStatusMutation.mutate({
          blogIds: selectedBlogs,
          status: ArticleStatus.DRAFT,
        });
        break;
      case "feature":
        bulkToggleFeaturedMutation.mutate({
          blogIds: selectedBlogs,
          featured: true,
        });
        break;
      case "unfeature":
        bulkToggleFeaturedMutation.mutate({
          blogIds: selectedBlogs,
          featured: false,
        });
        break;
      case "delete":
        bulkDeleteMutation.mutate(selectedBlogs);
        break;
      default:
        break;
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <Helmet>
          <title>
            Blog Management | Centre for Human Sciences | Rishihood University
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

  return (
    <AdminLayout>
      <Helmet>
        <title>
          Blog Management | Centre for Human Sciences | Rishihood University
        </title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="p-6">
        <div className="flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Blog Management</h1>
            <Button onClick={() => navigate("/admin/blogs/new")}>
              <FileText className="mr-2 h-4 w-4" />
              Create New Blog
            </Button>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>All Blog Posts</CardTitle>
              <CardDescription>
                Manage, filter, and update blog posts.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-4">
                {/* Search and filter UI */}
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div className="flex items-center flex-1">
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

                {/* Bulk actions */}
                {selectedBlogs.length > 0 && (
                  <div className="flex items-center justify-between bg-muted p-2 rounded-md">
                    <div className="text-sm">
                      <span className="font-medium">
                        {selectedBlogs.length}
                      </span>{" "}
                      blogs selected
                    </div>
                    <div className="flex space-x-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <SlidersHorizontal className="mr-2 h-4 w-4" />
                            Bulk Actions
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Choose action</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              setBulkAction("publish");
                              setBulkActionDialogOpen(true);
                            }}
                          >
                            <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                            Publish
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setBulkAction("draft");
                              setBulkActionDialogOpen(true);
                            }}
                          >
                            <FileText className="mr-2 h-4 w-4" />
                            Move to Draft
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              setBulkAction("delete");
                              setBulkActionDialogOpen(true);
                            }}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Selected
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedBlogs([])}
                      >
                        Clear Selection
                      </Button>
                    </div>
                  </div>
                )}

                {/* Blog posts table */}
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={
                              filteredBlogs &&
                              filteredBlogs.length > 0 &&
                              selectedBlogs.length === filteredBlogs.length
                            }
                            onCheckedChange={handleSelectAll}
                            aria-label="Select all blogs"
                          />
                        </TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Author</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Views</TableHead>
                        <TableHead>Date</TableHead>

                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredBlogs?.map((blog) => (
                        <TableRow key={blog.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedBlogs.some(
                                (id) => Number(id) === Number(blog.id)
                              )}
                              onCheckedChange={() =>
                                handleToggleSelect(blog.id)
                              }
                              aria-label={`Select ${blog.title}`}
                            />
                          </TableCell>
                          <TableCell className="font-medium">
                            {blog.title}
                          </TableCell>
                          <TableCell>{blog.author}</TableCell>
                          <TableCell>
                            {blog.categories.length > 0 ? (
                              blog.categories.join(", ")
                            ) : (
                              <span className="text-muted-foreground italic">
                                Uncategorized
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            {blog.published ? (
                              <Badge>Published</Badge>
                            ) : blog.status === ArticleStatus.REVIEW ? (
                              <Badge variant="outline">In Review</Badge>
                            ) : (
                              <Badge variant="secondary">Draft</Badge>
                            )}
                          </TableCell>
                          <TableCell>{blog.viewCount}</TableCell>
                          <TableCell>
                            {new Date(blog.createdAt).toLocaleDateString()}
                          </TableCell>

                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Open menu</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() =>
                                    navigate(`/preview/blogs/${blog.id}`)
                                  }
                                >
                                  <Eye className="mr-2 h-4 w-4" /> Preview
                                </DropdownMenuItem>
                                {blog.published ? (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      window.open(
                                        `/blogs/${blog.id}/${blog.slug}`,
                                        "_blank"
                                      )
                                    }
                                  >
                                    <Eye className="mr-2 h-4 w-4" /> View
                                    Published
                                  </DropdownMenuItem>
                                ) : null}
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
                          <TableCell colSpan={9} className="h-24 text-center">
                            No blog posts found.
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

      {/* Bulk Action Confirmation Dialog */}
      <Dialog
        open={bulkActionDialogOpen}
        onOpenChange={setBulkActionDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Bulk Action</DialogTitle>
            <DialogDescription>
              {bulkAction === "publish" && "Publish all selected blog posts?"}
              {bulkAction === "draft" &&
                "Move all selected blog posts to draft?"}
              {bulkAction === "feature" && "Feature all selected blog posts?"}
              {bulkAction === "unfeature" &&
                "Unfeature all selected blog posts?"}
              {bulkAction === "delete" &&
                `Are you sure you want to delete ${selectedBlogs.length} selected blog posts? This action cannot be undone.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setBulkActionDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant={bulkAction === "delete" ? "destructive" : "default"}
              onClick={executeBulkAction}
              disabled={
                bulkUpdateStatusMutation.isPending ||
                bulkToggleFeaturedMutation.isPending ||
                bulkDeleteMutation.isPending
              }
            >
              {bulkDeleteMutation.isPending && bulkAction === "delete"
                ? "Deleting..."
                : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default BlogManagement;
