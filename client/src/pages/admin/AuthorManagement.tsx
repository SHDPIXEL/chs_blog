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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import {
  MoreHorizontal,
  Pencil,
  Eye,
  UserCog,
  Ban,
  FileText,
  Search,
  Check,
  X,
  Plus,
  UserPlus,
} from 'lucide-react';
import { User, UserRole } from '@shared/schema';

interface ExtendedUser extends User {
  postCount: number;
  activeStatus: boolean;
}

const AuthorManagement: React.FC = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<ExtendedUser | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [permissionsModalOpen, setPermissionsModalOpen] = useState(false);

  // Fetch authors with extended info (post count, status)
  const { data: authors, isLoading } = useQuery<ExtendedUser[]>({
    queryKey: ['/api/admin/authors'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/admin/authors');
      return res.json();
    }
  });

  // Toggle author status (active/inactive)
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ userId, active }: { userId: number; active: boolean }) => {
      const res = await apiRequest('PATCH', `/api/admin/authors/${userId}/status`, {
        active
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/authors'] });
      toast({
        title: 'Status updated',
        description: 'Author status has been updated successfully',
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

  // Update author publishing rights
  const updatePermissionsMutation = useMutation({
    mutationFn: async ({ userId, canPublish }: { userId: number; canPublish: boolean }) => {
      const res = await apiRequest('PATCH', `/api/admin/authors/${userId}/permissions`, {
        canPublish
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/authors'] });
      setPermissionsModalOpen(false);
      toast({
        title: 'Permissions updated',
        description: 'Author permissions have been updated successfully',
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

  // Filter authors based on search query
  const filteredAuthors = authors?.filter(author => 
    author.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    author.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleStatus = (userId: number, currentStatus: boolean) => {
    toggleStatusMutation.mutate({ userId, active: !currentStatus });
  };

  const handleUpdatePermissions = () => {
    if (selectedUser) {
      updatePermissionsMutation.mutate({
        userId: selectedUser.id,
        canPublish: !selectedUser.canPublish
      });
    }
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

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Authors</CardTitle>
              <CardDescription>
                Manage authors, their permissions, and status.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center mb-4">
                <Search className="mr-2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search authors by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-sm"
                />
              </div>

              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Post Count</TableHead>
                      <TableHead>Join Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAuthors?.map((author) => (
                      <TableRow key={author.id}>
                        <TableCell>
                          <div className="flex items-center">
                            <Avatar className="h-8 w-8 mr-2">
                              <AvatarImage src={author.avatarUrl || ''} />
                              <AvatarFallback>{author.name[0]}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{author.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{author.email}</TableCell>
                        <TableCell>
                          <Badge variant={author.role === UserRole.ADMIN ? "default" : "secondary"}>
                            {author.role}
                          </Badge>
                        </TableCell>
                        <TableCell>{author.postCount}</TableCell>
                        <TableCell>
                          {new Date(author.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant={author.activeStatus ? "success" : "destructive"}>
                            {author.activeStatus ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
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
                                onClick={() => {
                                  setSelectedUser(author);
                                  setEditModalOpen(true);
                                }}
                              >
                                <Pencil className="mr-2 h-4 w-4" /> Edit Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedUser(author);
                                  setPermissionsModalOpen(true);
                                }}
                              >
                                <UserCog className="mr-2 h-4 w-4" /> Manage Permissions
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <FileText className="mr-2 h-4 w-4" /> View Posts
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleToggleStatus(author.id, author.activeStatus)}
                              >
                                {author.activeStatus ? (
                                  <>
                                    <Ban className="mr-2 h-4 w-4 text-destructive" /> Disable Account
                                  </>
                                ) : (
                                  <>
                                    <Check className="mr-2 h-4 w-4 text-green-500" /> Enable Account
                                  </>
                                )}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredAuthors?.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          No authors found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Permissions Dialog */}
      <Dialog open={permissionsModalOpen} onOpenChange={setPermissionsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Author Permissions</DialogTitle>
            <DialogDescription>
              Update publishing rights for {selectedUser?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="publish-rights" className="text-base">
                  Publishing Rights
                </Label>
                <p className="text-sm text-muted-foreground">
                  Allow author to publish content without approval
                </p>
              </div>
              <Switch
                id="publish-rights"
                checked={selectedUser?.canPublish || false}
                onCheckedChange={() => {}}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPermissionsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdatePermissions}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AuthorManagement;