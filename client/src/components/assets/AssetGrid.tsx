import React, { useState } from 'react';
import { Asset } from '@shared/schema';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Loader2, Image, FileText, Video, Music, File } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface AssetGridProps {
  assets: Asset[];
  isLoading: boolean;
  onSelect: (asset: Asset) => void;
  selectedAsset: Asset | null;
}

const AssetGrid: React.FC<AssetGridProps> = ({
  assets,
  isLoading,
  onSelect,
  selectedAsset,
}) => {
  const [filter, setFilter] = useState('');

  // Filter assets based on search query
  const filteredAssets = filter
    ? assets.filter(
        (asset) =>
          asset.title?.toLowerCase().includes(filter.toLowerCase()) ||
          asset.originalName.toLowerCase().includes(filter.toLowerCase()) ||
          asset.description?.toLowerCase().includes(filter.toLowerCase()) ||
          (Array.isArray(asset.tags) && 
            asset.tags.some((tag: string) => 
              tag.toLowerCase().includes(filter.toLowerCase())
            )
          )
      )
    : assets;

  // Get appropriate icon for file type
  const getAssetIcon = (mimetype: string) => {
    if (mimetype.startsWith('image/')) {
      return <Image className="h-6 w-6" />;
    } else if (mimetype.startsWith('application/pdf') || mimetype.startsWith('text/')) {
      return <FileText className="h-6 w-6" />;
    } else if (mimetype.startsWith('video/')) {
      return <Video className="h-6 w-6" />;
    } else if (mimetype.startsWith('audio/')) {
      return <Music className="h-6 w-6" />;
    } else {
      return <File className="h-6 w-6" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400 mb-4" />
        <p className="text-gray-500">Loading assets...</p>
      </div>
    );
  }

  if (filteredAssets.length === 0) {
    return (
      <div className="space-y-4">
        <div className="mb-4">
          <Input
            placeholder="Search assets..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="flex flex-col items-center justify-center h-64 py-12 border-2 border-dashed rounded-md">
          <File className="h-12 w-12 text-gray-300 mb-4" />
          <p className="text-gray-500 text-center mb-2">
            {filter ? 'No assets match your search.' : 'No assets yet.'}
          </p>
          {filter && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setFilter('')}
              className="mt-2"
            >
              Clear search
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <Input
          placeholder="Search assets..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAssets.map((asset) => (
          <Card 
            key={asset.id} 
            className={cn(
              "overflow-hidden cursor-pointer transition-all hover:ring-2 hover:ring-primary/50",
              selectedAsset?.id === asset.id && "ring-2 ring-primary"
            )}
            onClick={() => onSelect(asset)}
          >
            <div className="relative aspect-square w-full overflow-hidden bg-gray-100">
              {asset.mimetype.startsWith('image/') ? (
                <img
                  src={asset.url}
                  alt={asset.title || asset.originalName}
                  className="h-full w-full object-cover transition-all"
                />
              ) : (
                <div className="h-full w-full flex flex-col items-center justify-center p-4">
                  {getAssetIcon(asset.mimetype)}
                  <span className="mt-2 text-sm text-gray-500 truncate max-w-full">
                    {asset.originalName}
                  </span>
                </div>
              )}
            </div>
            
            <CardContent className="p-3">
              <h3 className="font-medium truncate">
                {asset.title || asset.originalName}
              </h3>
              <p className="text-xs text-gray-500 truncate mt-1">
                {new Date(asset.createdAt).toLocaleDateString()}
              </p>
            </CardContent>
            
            <CardFooter className="p-3 pt-0 flex flex-wrap gap-2">
              {Array.isArray(asset.tags) && asset.tags.length > 0 && 
                asset.tags.slice(0, 2).map((tag: string, index: number) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))
              }
              {Array.isArray(asset.tags) && asset.tags.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{asset.tags.length - 2}
                </Badge>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AssetGrid;