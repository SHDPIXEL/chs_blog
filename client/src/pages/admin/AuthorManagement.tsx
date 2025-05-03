import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import AdminLayout from '@/components/layouts/AdminLayout';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/hooks/use-auth';
import { usePermissions } from '@/hooks/use-permissions';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import {
  MoreHorizontal,
  Search,
  UserCog,
  FileText,
  UserCheck,
  UserX,
  UserPlus,
  UserMinus,
  Pencil,
  Key,
} from 'lucide-react';
import { User } from '@/types/auth';

interface ExtendedUser extends User {
  postCount: number;
  activeStatus: boolean;
}

const AuthorManagement: React.FC = () => {
  const { toast } = useToast();
  const { user, refreshUserData } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [permissionDialogOpen, setPermissionDialogOpen] = useState(false);
  const [selectedAuthor, setSelectedAuthor] = useState<ExtendedUser | null>(null);
  const [canPublish, setCanPublish] = useState(false);
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  // Fetch authors
  const { data: authors, isLoading } = useQuery<ExtendedUser[]>({
    queryKey: ['/api/admin/authors'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/admin/authors');
      return res.json();
    }
  });

  // Update author status
  const statusMutation = useMutation({
    mutationFn: async ({ id, active }: { id: number; active: boolean }) => {
      const res = await apiRequest('PATCH', `/api/admin/authors/${id}/status`, { active });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/authors'] });
      toast({
        title: 'Status updated',
        description: 'Author status has been updated successfully',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Update failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Use the permissions hook for up-to-date permission data
  const { refreshPermissions } = usePermissions();
  
  // Update publishing permissions
  const permissionsMutation = useMutation({
    mutationFn: async ({ id, canPublish }: { id: number; canPublish: boolean }) => {
      const res = await apiRequest('PATCH', `/api/admin/authors/${id}/permissions`, { canPublish });
      return res.json();
    },
    onSuccess: async () => {
      setPermissionDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/authors'] });
      
      // If the current user had their permissions updated, refresh their data
      if (user && selectedAuthor && user.id === selectedAuthor.id) {
        // Refresh both the user data and permissions data
        await refreshUserData();
        await refreshPermissions();
        
        toast({
          title: 'Your permissions updated',
          description: 'Your publishing rights have been updated. Changes are now reflected in your account.',
          variant: 'default',
        });
        
        // Also invalidate the permissions cache
        queryClient.invalidateQueries({ queryKey: ['/api/auth/permissions'] });
      } else {
        toast({
          title: 'Permissions updated',
          description: 'Author publishing rights have been updated',
          variant: 'default',
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Update failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Handle permissions dialog open
  const handleOpenPermissionsDialog = (author: ExtendedUser) => {
    setSelectedAuthor(author);
    setCanPublish(author.canPublish || false);
    setPermissionDialogOpen(true);
  };

  // Handle permissions update
  const handleUpdatePermissions = () => {
    if (selectedAuthor) {
      permissionsMutation.mutate({
        id: selectedAuthor.id,
        canPublish,
      });
    }
  };

  // Handle status toggle
  const handleToggleStatus = (author: ExtendedUser) => {
    statusMutation.mutate({
      id: author.id,
      active: !author.activeStatus,
    });
  };

  // Filter authors based on search query and filters
  const filteredAuthors = authors?.filter(author => {
    // Text search filter
    const matchesSearch = !searchQuery || 
      author.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      author.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Role filter
    const matchesRole = !roleFilter || author.role === roleFilter;
    
    // Status filter
    const matchesStatus = 
      !statusFilter || 
      (statusFilter === 'active' && author.activeStatus) ||
      (statusFilter === 'inactive' && !author.activeStatus);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

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
            <h1 className="text-3xl font-bold">Author Management</h1>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Add New Author
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Authors</CardTitle>
              <CardDescription>
                Manage authors, their permissions, and publications.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-4">
                {/* Search and filter UI */}
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div className="flex items-center flex-1">
                    <Search className="mr-2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search authors..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="max-w-sm"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Select
                      value={roleFilter || 'all_roles'}
                      onValueChange={(value) => setRoleFilter(value === 'all_roles' ? null : value)}
                    >
                      <SelectTrigger className="w-[130px]">
                        <SelectValue placeholder="Filter Role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all_roles">All Roles</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="author">Author</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select
                      value={statusFilter || 'all_status'}
                      onValueChange={(value) => setStatusFilter(value === 'all_status' ? null : value)}
                    >
                      <SelectTrigger className="w-[130px]">
                        <SelectValue placeholder="Filter Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all_status">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Authors table */}
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[250px]">Author</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Posts</TableHead>
                        <TableHead>Join Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Publishing Rights</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAuthors?.map((author) => (
                        <TableRow key={author.id}>
                          <TableCell className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarImage
                                src={author.avatarUrl || ''}
                                alt={author.name}
                              />
                              <AvatarFallback>{getUserInitials(author.name)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{author.name}</div>
                              <div className="text-xs text-muted-foreground">{author.email}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={author.role === 'admin' ? 'default' : 'outline'}
                            >
                              {author.role === 'admin' ? 'Admin' : 'Author'}
                            </Badge>
                          </TableCell>
                          <TableCell>{author.postCount}</TableCell>
                          <TableCell>{new Date(author.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Badge
                              variant={author.activeStatus ? 'default' : 'secondary'}
                              className={author.activeStatus ? 'bg-green-500' : ''}
                            >
                              {author.activeStatus ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={author.canPublish ? 'default' : 'outline'}
                              className={author.canPublish ? 'bg-blue-500' : ''}
                            >
                              {author.canPublish ? 'Can publish' : 'Requires approval'}
                            </Badge>
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
                                <DropdownMenuItem>
                                  <Pencil className="mr-2 h-4 w-4" /> Edit Profile
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleOpenPermissionsDialog(author)}>
                                  <Key className="mr-2 h-4 w-4" /> Manage Permissions
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <FileText className="mr-2 h-4 w-4" /> View Posts
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleToggleStatus(author)}>
                                  {author.activeStatus ? (
                                    <>
                                      <UserX className="mr-2 h-4 w-4" /> Disable Account
                                    </>
                                  ) : (
                                    <>
                                      <UserCheck className="mr-2 h-4 w-4" /> Enable Account
                                    </>
                                  )}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                      {(!filteredAuthors || filteredAuthors.length === 0) && (
                        <TableRow>
                          <TableCell colSpan={7} className="h-24 text-center">
                            No authors found.
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

      {/* Publishing Permissions Dialog */}
      <Dialog open={permissionDialogOpen} onOpenChange={setPermissionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Publishing Rights</DialogTitle>
            <DialogDescription>
              Set whether {selectedAuthor?.name} can publish posts directly or requires approval.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="canPublish">Allow Direct Publishing</Label>
                <p className="text-sm text-muted-foreground">
                  When enabled, this author can publish posts without admin approval.
                </p>
              </div>
              <Switch
                id="canPublish"
                checked={canPublish}
                onCheckedChange={setCanPublish}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPermissionDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdatePermissions}
              disabled={permissionsMutation.isPending}
            >
              {permissionsMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AuthorManagement;