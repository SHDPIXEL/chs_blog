import React, { useState } from "react";
import { Asset } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAssetManager } from "@/context/AssetManagerContext";
import {
  Calendar,
  Download,
  FileText,
  Image,
  Info,
  Music,
  Pencil,
  Tag,
  Trash2,
  User,
  Video,
} from "lucide-react";

interface AssetDetailsProps {
  asset: Asset;
}

const AssetDetails: React.FC<AssetDetailsProps> = ({ asset }) => {
  const { toast } = useToast();
  const { deleteAsset, updateAssetMetadata } = useAssetManager();

  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [title, setTitle] = useState(asset.title || "");
  const [description, setDescription] = useState(asset.description || "");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(
    Array.isArray(asset.tags) ? [...asset.tags] : []
  );

  // Reset form values and exit edit mode when a new asset is selected
  React.useEffect(() => {
    setIsEditing(false);
    setTitle(asset.title || "");
    setDescription(asset.description || "");
    setTags(Array.isArray(asset.tags) ? [...asset.tags] : []);
  }, [asset.id]);

  // Format file size for display
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Get appropriate icon for file type
  const getAssetIcon = (mimetype: string) => {
    if (mimetype.startsWith("image/")) {
      return <Image className="h-5 w-5" />;
    } else if (
      mimetype.startsWith("application/pdf") ||
      mimetype.startsWith("text/")
    ) {
      return <FileText className="h-5 w-5" />;
    } else if (mimetype.startsWith("video/")) {
      return <Video className="h-5 w-5" />;
    } else if (mimetype.startsWith("audio/")) {
      return <Music className="h-5 w-5" />;
    } else {
      return <FileText className="h-5 w-5" />;
    }
  };

  // Add a tag to the list
  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  // Remove a tag from the list
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  // The copy URL functionality has been removed as requested

  // Handle saving metadata changes
  const handleSaveChanges = async () => {
    try {
      await updateAssetMetadata(asset.id, {
        title,
        description,
        tags,
      });

      setIsEditing(false);
      toast({
        title: "Changes Saved",
        description: "Asset information has been updated",
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description:
          error instanceof Error ? error.message : "Failed to update asset",
        variant: "destructive",
      });
    }
  };

  // Handle asset deletion
  const handleDelete = async () => {
    try {
      await deleteAsset(asset.id);
      setShowDeleteDialog(false);
      toast({
        title: "Asset Deleted",
        description: "The asset has been removed",
      });
    } catch (error) {
      toast({
        title: "Deletion Failed",
        description:
          error instanceof Error ? error.message : "Failed to delete asset",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Image preview for image assets */}
      {asset.mimetype?.startsWith("image/") && (
        <div className="border rounded-md overflow-hidden">
          <img
            src={asset.url}
            alt={asset.title || asset.originalName}
            className="w-full h-auto max-h-48 object-contain bg-gray-50"
          />
        </div>
      )}

      {isEditing ? (
        // Edit mode
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="asset-title">Title</Label>
              <Input
                id="asset-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Asset title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="asset-description">Description</Label>
              <Textarea
                id="asset-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a description"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="asset-tags">Tags</Label>
              <div className="flex space-x-2">
                <Input
                  id="asset-tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add tags"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={addTag}>
                  Add
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="px-2 py-1">
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="ml-1 text-gray-400 hover:text-gray-600"
                    >
                      &times;
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveChanges}>Save Changes</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        // View mode
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex justify-between items-start">
              <h3 className="font-medium text-lg">
                {asset.title || asset.originalName}
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsEditing(true)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </div>

            <div className="text-sm text-gray-600 space-y-1">
              <div className="flex gap-2 items-center">
                <Info className="w-4 h-4 text-gray-400" />
                <span>{asset.mimetype}</span>
              </div>

              <div className="flex gap-2 items-center">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span>{new Date(asset.createdAt).toLocaleString()}</span>
              </div>

              <div className="flex gap-2 items-center">
                <FileText className="w-4 h-4 text-gray-400" />
                <span>{formatFileSize(asset.size)}</span>
              </div>
            </div>

            {asset.description && (
              <div className="pt-2 border-t border-gray-100">
                <p className="text-sm">{asset.description}</p>
              </div>
            )}

            {Array.isArray(asset.tags) && asset.tags.length > 0 && (
              <div className="pt-2 border-t border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <Tag className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium">Tags</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {asset.tags.map((tag: string, index: number) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-gray-100 flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="text-red-500 hover:text-red-600"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete confirmation dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Asset</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this asset? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AssetDetails;
