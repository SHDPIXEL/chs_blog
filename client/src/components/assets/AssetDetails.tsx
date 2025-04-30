import React, { useState } from 'react';
import { Asset } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAssetManager, AssetMetadata } from '@/context/AssetManagerContext';
import { 
  Calendar, Edit, Trash2, Save, X, Tag, Plus,
  FileIcon, Image, FileText, Video, Music, Copy
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AssetDetailsProps {
  asset: Asset;
}

const AssetDetails: React.FC<AssetDetailsProps> = ({ asset }) => {
  const { deleteAsset, updateAssetMetadata } = useAssetManager();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [metadata, setMetadata] = useState<AssetMetadata>({
    title: asset.title || '',
    description: asset.description || '',
    tags: asset.tags as string[] || [],
  });
  const [newTag, setNewTag] = useState('');

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // Get appropriate icon based on mimetype
  const getAssetIcon = () => {
    if (asset.mimetype.startsWith('image/')) {
      return <Image className="h-6 w-6 text-blue-500" />;
    } else if (asset.mimetype.startsWith('video/')) {
      return <Video className="h-6 w-6 text-purple-500" />;
    } else if (asset.mimetype.startsWith('audio/')) {
      return <Music className="h-6 w-6 text-green-500" />;
    } else {
      return <FileText className="h-6 w-6 text-gray-500" />;
    }
  };

  // Handle delete confirmation
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this asset? This action cannot be undone.')) {
      await deleteAsset(asset.id);
    }
  };

  // Handle save metadata
  const handleSave = async () => {
    await updateAssetMetadata(asset.id, metadata);
    setIsEditing(false);
  };

  // Copy asset URL to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(asset.url);
    toast({
      title: 'URL Copied',
      description: 'Asset URL has been copied to clipboard',
    });
  };

  // Handle adding a tag
  const handleAddTag = () => {
    if (!newTag.trim()) return;
    setMetadata(prev => ({
      ...prev,
      tags: [...(prev.tags || []), newTag.trim()]
    }));
    setNewTag('');
  };

  // Handle removing a tag
  const handleRemoveTag = (tag: string) => {
    setMetadata(prev => ({
      ...prev,
      tags: prev.tags ? prev.tags.filter(t => t !== tag) : []
    }));
  };

  return (
    <div className="flex flex-col h-full">
      {/* Preview */}
      <div className="mb-4">
        {asset.mimetype.startsWith('image/') ? (
          <div className="rounded-md overflow-hidden bg-gray-100 border">
            <img
              src={asset.url}
              alt={asset.title || asset.originalName}
              className="w-full object-contain max-h-[200px]"
            />
          </div>
        ) : (
          <div className="rounded-md overflow-hidden bg-gray-100 border h-[200px] flex items-center justify-center">
            {getAssetIcon()}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-between mb-4">
        {isEditing ? (
          <>
            <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
              <X className="h-4 w-4 mr-1" /> Cancel
            </Button>
            <Button size="sm" onClick={handleSave}>
              <Save className="h-4 w-4 mr-1" /> Save
            </Button>
          </>
        ) : (
          <>
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-1" /> Edit
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={copyToClipboard}>
                <Copy className="h-4 w-4" />
              </Button>
              <Button variant="destructive" size="sm" onClick={handleDelete}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 overflow-y-auto">
        {isEditing ? (
          // Edit mode
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <Input
                value={metadata.title}
                onChange={(e) => setMetadata(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Asset title"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={metadata.description}
                onChange={(e) => setMetadata(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of the asset"
                className="w-full rounded-md border p-2 min-h-[100px] text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Tags</label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag"
                  className="flex-1"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddTag}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {metadata.tags?.map((tag) => (
                  <Badge key={tag} variant="secondary" className="px-3 py-1">
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                    <button 
                      className="ml-1"
                      onClick={() => handleRemoveTag(tag)}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        ) : (
          // View mode
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">{asset.title || asset.originalName}</h3>
              <p className="text-sm text-gray-500">
                Original name: {asset.originalName}
              </p>
            </div>
            
            {asset.description && (
              <div>
                <h4 className="text-sm font-medium mb-1">Description</h4>
                <p className="text-sm text-gray-600">{asset.description}</p>
              </div>
            )}
            
            <div>
              <h4 className="text-sm font-medium mb-1">File Details</h4>
              <div className="text-sm space-y-1">
                <p className="flex items-center text-gray-600">
                  <FileIcon className="h-4 w-4 mr-1" />
                  {asset.mimetype} ({formatFileSize(asset.size)})
                </p>
                <p className="flex items-center text-gray-600">
                  <Calendar className="h-4 w-4 mr-1" />
                  Uploaded on {new Date(asset.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            {asset.tags && asset.tags.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-1">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {(asset.tags as string[]).map((tag, index) => (
                    <Badge key={index} variant="secondary" className="px-3 py-1">
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AssetDetails;