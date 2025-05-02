import React, { useState } from "react";
import AdminLayout from "@/components/layouts/AdminLayout";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/ui/PageHeader";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  PencilIcon,
  UserCircle,
  CameraIcon,
  Link as LinkIcon,
  ImageIcon,
  Shield
} from "lucide-react";
import { AssetPickerButton } from "@/components/assets";
import { Helmet } from "react-helmet-async";

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

const AdminProfilePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditMode, setIsEditMode] = useState(false);

  // Get profile data
  const { data: profile, isLoading } = useQuery<ProfileData>({
    queryKey: ["/api/admin/profile"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/admin/profile");
      return res.json();
    },
  });

  // Initial form state
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    avatarUrl: "",
    bannerUrl: "",
    socialLinks: "",
  });

  // Update form state when profile data is loaded
  React.useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        bio: profile.bio || "",
        avatarUrl: profile.avatarUrl || "",
        bannerUrl: profile.bannerUrl || "",
        socialLinks: profile.socialLinks || "",
      });
    }
  }, [profile]);

  // Handle form input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Profile update mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("PATCH", "/api/admin/profile", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/profile"] });
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
      setIsEditMode(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  // Render placeholder when loading
  if (isLoading) {
    return (
      <AdminLayout>
        <div className="py-6 px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 w-1/3 bg-gray-200 rounded mb-5"></div>
            <div className="h-64 bg-gray-200 rounded mb-5"></div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Social links display component
  const SocialLinks = () => {
    if (!profile?.socialLinks) return null;

    try {
      const socialData = JSON.parse(profile.socialLinks) as Record<
        string,
        string
      >;

      const links: React.ReactNode[] = [];

      Object.entries(socialData).forEach(([platform, url]) => {
        if (!url) return;

        links.push(
          <a
            key={platform}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-700"
          >
            <LinkIcon className="h-5 w-5" />
            <span className="sr-only">{platform}</span>
          </a>,
        );
      });

      return <div className="flex space-x-4 mt-2">{links}</div>;
    } catch (e) {
      return null;
    }
  };

  // Helper function to get initials from name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <AdminLayout>
      <Helmet>
        <title>Admin Profile | BlogCMS</title>
      </Helmet>
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
                        <Label htmlFor="avatarUrl">Profile Picture</Label>
                        <div className="flex-1 flex flex-col gap-2">
                          {formData.avatarUrl && (
                            <div className="w-16 h-16 rounded-full overflow-hidden border">
                              <img
                                src={formData.avatarUrl}
                                alt="Avatar preview"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div className="flex gap-2 items-center">
                            <Input
                              type="hidden"
                              id="avatarUrl"
                              name="avatarUrl"
                              value={formData.avatarUrl || ""}
                            />
                            <AssetPickerButton
                              onSelect={(asset) => {
                                if (Array.isArray(asset)) {
                                  // Just use the first asset if somehow multiple are selected
                                  if (asset.length > 0 && asset[0].url) {
                                    setFormData((prev) => ({
                                      ...prev,
                                      avatarUrl: asset[0].url,
                                    }));
                                  }
                                } else if (asset && asset.url) {
                                  setFormData((prev) => ({
                                    ...prev,
                                    avatarUrl: asset.url,
                                  }));
                                }
                              }}
                              selectMode={true}
                              accept="image"
                              variant="outline"
                            >
                              <CameraIcon className="h-4 w-4 mr-2" />
                              {formData.avatarUrl
                                ? "Change Profile Picture"
                                : "Select Profile Picture"}
                            </AssetPickerButton>

                            {formData.avatarUrl && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-700"
                                onClick={() =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    avatarUrl: "",
                                  }))
                                }
                              >
                                Remove
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bannerUrl">Banner Image</Label>
                        <div className="flex-1 flex flex-col gap-2">
                          {formData.bannerUrl && (
                            <div className="border rounded-md overflow-hidden w-full max-w-xs h-24">
                              <img
                                src={formData.bannerUrl}
                                alt="Banner preview"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div className="flex gap-2 items-center">
                            <Input
                              type="hidden"
                              id="bannerUrl"
                              name="bannerUrl"
                              value={formData.bannerUrl || ""}
                            />
                            <AssetPickerButton
                              onSelect={(asset) => {
                                if (Array.isArray(asset)) {
                                  // Just use the first asset if somehow multiple are selected
                                  if (asset.length > 0 && asset[0].url) {
                                    setFormData((prev) => ({
                                      ...prev,
                                      bannerUrl: asset[0].url,
                                    }));
                                  }
                                } else if (asset && asset.url) {
                                  setFormData((prev) => ({
                                    ...prev,
                                    bannerUrl: asset.url,
                                  }));
                                }
                              }}
                              selectMode={true}
                              accept="all"
                              variant="outline"
                            >
                              <ImageIcon className="h-4 w-4 mr-2" />
                              {formData.bannerUrl
                                ? "Change Banner"
                                : "Select Banner (Image or Video)"}
                            </AssetPickerButton>

                            {formData.bannerUrl && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-700"
                                onClick={() =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    bannerUrl: "",
                                  }))
                                }
                              >
                                Remove
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="socialLinks">
                          Social Links (JSON format)
                        </Label>
                        <Textarea
                          id="socialLinks"
                          name="socialLinks"
                          value={formData.socialLinks}
                          onChange={handleChange}
                          placeholder='{"twitter": "https://twitter.com/yourusername", "github": "https://github.com/yourusername"}'
                          rows={3}
                        />
                        <p className="text-xs text-gray-500">
                          Enter your social links in JSON format
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
                        {updateProfileMutation.isPending
                          ? "Saving..."
                          : "Save Changes"}
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
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-rose-400 to-purple-500">
                        <span className="text-white text-lg font-medium">
                          {profile?.name || user?.name || "Admin"}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col md:flex-row gap-8">
                    {/* Avatar and basic info */}
                    <div className="md:w-1/3">
                      <div className="flex flex-col items-center md:items-start">
                        <Avatar className="h-24 w-24 mb-4 ring-4 ring-white -mt-12 relative z-10 shadow-md">
                          {profile?.avatarUrl ? (
                            <AvatarImage
                              src={profile.avatarUrl}
                              alt={profile.name}
                            />
                          ) : (
                            <AvatarFallback className="bg-rose-100 text-rose-700">
                              {profile?.name 
                                ? getInitials(profile.name) 
                                : user?.name 
                                  ? getInitials(user.name) 
                                  : "AD"}
                            </AvatarFallback>
                          )}
                        </Avatar>

                        <div className="flex items-center space-x-2 mb-2">
                          <h1 className="text-2xl font-bold">{profile?.name}</h1>
                          <Shield className="h-5 w-5 text-blue-600" />
                        </div>

                        <div className="text-rose-600 font-medium mb-4">
                          Administrator
                        </div>

                        <div className="text-gray-500 text-sm mb-4">
                          <p>Email: {profile?.email}</p>
                          <p>Member since: {profile?.createdAt && new Date(profile.createdAt).toLocaleDateString()}</p>
                        </div>

                        <SocialLinks />
                      </div>
                    </div>

                    {/* Bio and additional info */}
                    <div className="md:w-2/3">
                      <Card>
                        <CardHeader>
                          <CardTitle>Bio</CardTitle>
                        </CardHeader>
                        <CardContent>
                          {profile?.bio ? (
                            <div className="prose">
                              <p>{profile.bio}</p>
                            </div>
                          ) : (
                            <p className="text-gray-500 italic">
                              No bio information provided.
                            </p>
                          )}
                        </CardContent>
                      </Card>

                      <Card className="mt-6">
                        <CardHeader>
                          <CardTitle>System Information</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <Label>Role</Label>
                            <div className="p-2 bg-blue-50 rounded border border-blue-200 capitalize font-medium text-blue-800">
                              {profile?.role || "Administrator"}
                            </div>
                          </div>

                          <div className="space-y-1">
                            <Label>Member Since</Label>
                            <div className="p-2 bg-gray-50 rounded border border-gray-200">
                              {profile?.createdAt &&
                                new Date(profile.createdAt).toLocaleDateString()}
                            </div>
                          </div>
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
                    Manage your account details and preferences
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
                    <div className="p-2 bg-blue-50 rounded border border-blue-200 capitalize font-medium text-blue-800 flex items-center">
                      <Shield className="h-4 w-4 mr-2" />
                      {profile?.role || "Administrator"}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label>Member Since</Label>
                    <div className="p-2 bg-gray-50 rounded border border-gray-200">
                      {profile?.createdAt &&
                        new Date(profile.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminProfilePage;