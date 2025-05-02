import React, { useState } from "react";
import AuthorLayout from "@/components/layout/AuthorLayout";
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
} from "lucide-react";
import { AssetPickerButton } from "@/components/assets";
import SocialLinksEditor, { SocialLinksDisplay } from "@/components/ui/social-links-editor";

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
    queryKey: ["/api/author/profile"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/author/profile");
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
      const res = await apiRequest("PATCH", "/api/author/profile", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/author/profile"] });
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

  // Using the SocialLinksDisplay component from our UI kit
  const SocialLinks = () => {
    if (!profile?.socialLinks) return null;
    
    // We import and use the new SocialLinksDisplay component from our UI kit
    // This is now handled by the separate component
    return (
      <SocialLinksDisplay value={profile.socialLinks} className="mt-2" />
    );
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
                                console.log("Selected asset:");
                                console.log(asset);
                                console.log("end__");
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
                                console.log("Selected asset:");
                                console.log(asset);
                                console.log("end__");

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

                      <SocialLinksEditor
                        value={formData.socialLinks}
                        onChange={(value) => 
                          setFormData(prev => ({ ...prev, socialLinks: value }))
                        }
                      />
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
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-blue-400 to-purple-500">
                        <span className="text-white text-lg font-medium">
                          {profile?.name || user?.name || "Author"}
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
                            <AvatarImage
                              src={profile.avatarUrl}
                              alt={profile.name}
                            />
                          ) : (
                            <AvatarFallback>
                              <UserCircle className="h-24 w-24 text-gray-400" />
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <h2 className="text-2xl font-bold">{profile?.name}</h2>
                        <p className="text-gray-500 capitalize">
                          {profile?.role}
                        </p>

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
    </AuthorLayout>
  );
};

export default ProfilePage;
