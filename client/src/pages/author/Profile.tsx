import React, { useState } from 'react';
import AuthorLayout from '@/components/layout/AuthorLayout';
import { useAuth } from '@/context/AuthContext';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import PageHeader from '@/components/ui/PageHeader';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { PencilIcon, UserCircle, CameraIcon, Link as LinkIcon } from 'lucide-react';

type ProfileData = {
  id: number;
  name: string;
  email: string;
  role: string;
  bio?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  socialLinks?: string;
  createdAt: string;
};

const ProfilePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Get profile data
  const { data: profile, isLoading } = useQuery<ProfileData>({
    queryKey: ['/api/author/profile'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/author/profile');
      return res.json();
    }
  });
  
  // Initial form state
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    avatarUrl: '',
    bannerUrl: '',
    socialLinks: ''
  });
  
  // Update form state when profile data is loaded
  React.useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        bio: profile.bio || '',
        avatarUrl: profile.avatarUrl || '',
        bannerUrl: profile.bannerUrl || '',
        socialLinks: profile.socialLinks || ''
      });
    }
  }, [profile]);
  
  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Profile update mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest('PATCH', '/api/author/profile', data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/author/profile'] });
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully',
      });
      setIsEditMode(false);
    },
    onError: (error: Error) => {
      toast({
        title: 'Update failed',
        description: error.message,
        variant: 'destructive'
      });
    }
  });
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };
  
  // Render placeholder when loading
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
  
  // Social links display component
  const SocialLinks = () => {
    if (!profile?.socialLinks) return null;
    
    try {
      const socialData = JSON.parse(profile.socialLinks);
      return (
        <div className="flex space-x-4 mt-2">
          {Object.entries(socialData).map(([platform, url]) => (
            url && (
              <a 
                key={platform} 
                href={url as string} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-700"
              >
                <LinkIcon className="h-5 w-5" />
                <span className="sr-only">{platform}</span>
              </a>
            )
          ))}
        </div>
      );
    } catch (e) {
      return null;
    }
  };
  
  return (
    <AuthorLayout>
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <PageHeader 
          title="My Profile" 
          buttonText={isEditMode ? "Cancel" : "Edit Profile"}
          buttonIcon={isEditMode ? undefined : PencilIcon}
          onButtonClick={() => setIsEditMode(!isEditMode)}
        />
        
        {/* Profile view and edit form */}
        <div className="mt-6">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList>
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="account">Account</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile" className="mt-6">
              {isEditMode ? (
                // Edit mode
                <Card>
                  <CardHeader>
                    <CardTitle>Edit Profile</CardTitle>
                    <CardDescription>
                      Update your profile information
                    </CardDescription>
                  </CardHeader>
                  <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Your name"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          name="bio"
                          value={formData.bio}
                          onChange={handleChange}
                          placeholder="Tell readers about yourself"
                          rows={4}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="avatarUrl">Profile Picture URL</Label>
                        <Input
                          id="avatarUrl"
                          name="avatarUrl"
                          value={formData.avatarUrl}
                          onChange={handleChange}
                          placeholder="https://example.com/profile-image.jpg"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="bannerUrl">Banner Image URL</Label>
                        <Input
                          id="bannerUrl"
                          name="bannerUrl"
                          value={formData.bannerUrl}
                          onChange={handleChange}
                          placeholder="https://example.com/banner-image.jpg"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="socialLinks">Social Links (JSON format)</Label>
                        <Textarea
                          id="socialLinks"
                          name="socialLinks"
                          value={formData.socialLinks}
                          onChange={handleChange}
                          placeholder='{"twitter": "https://twitter.com/yourusername", "github": "https://github.com/yourusername"}'
                          rows={3}
                        />
                        <p className="text-xs text-gray-500">
                          Enter your social links in JSON format, e.g. {"{"}"twitter": "https://twitter.com/yourusername"{"}"}
                        </p>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button 
                        variant="outline" 
                        onClick={() => setIsEditMode(false)}
                        type="button"
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit"
                        disabled={updateProfileMutation.isPending}
                      >
                        {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </CardFooter>
                  </form>
                </Card>
              ) : (
                // View mode
                <div className="space-y-6">
                  {/* Banner image */}
                  <div className="relative h-48 w-full rounded-lg bg-gray-100 overflow-hidden">
                    {profile?.bannerUrl ? (
                      <img 
                        src={profile.bannerUrl} 
                        alt="Profile banner" 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-blue-400 to-purple-500">
                        <span className="text-white text-lg font-medium">
                          {profile?.name || user?.name || 'Author'}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col sm:flex-row">
                    {/* Avatar and basic info */}
                    <div className="sm:w-1/3 mb-6 sm:mb-0">
                      <div className="flex flex-col items-center sm:items-start">
                        <Avatar className="h-24 w-24 mb-4 ring-4 ring-white -mt-12 relative z-10">
                          {profile?.avatarUrl ? (
                            <AvatarImage src={profile.avatarUrl} alt={profile.name} />
                          ) : (
                            <AvatarFallback>
                              <UserCircle className="h-24 w-24 text-gray-400" />
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <h2 className="text-2xl font-bold">{profile?.name}</h2>
                        <p className="text-gray-500 capitalize">{profile?.role}</p>
                        
                        <SocialLinks />
                      </div>
                    </div>
                    
                    {/* Bio and additional info */}
                    <div className="sm:w-2/3">
                      <Card>
                        <CardHeader>
                          <CardTitle>About Me</CardTitle>
                        </CardHeader>
                        <CardContent>
                          {profile?.bio ? (
                            <p className="text-gray-700">{profile.bio}</p>
                          ) : (
                            <p className="text-gray-500 italic">
                              This author hasn't added a bio yet.
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="account" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription>
                    Your account details and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1">
                    <Label>Email</Label>
                    <div className="p-2 bg-gray-50 rounded border border-gray-200">
                      {profile?.email}
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <Label>Role</Label>
                    <div className="p-2 bg-gray-50 rounded border border-gray-200 capitalize">
                      {profile?.role}
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <Label>Member Since</Label>
                    <div className="p-2 bg-gray-50 rounded border border-gray-200">
                      {profile?.createdAt && new Date(profile.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AuthorLayout>
  );
};

export default ProfilePage;