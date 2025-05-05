import React from 'react';
import { Asset } from '@shared/schema';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Loader2, Image, FileText, Video, Music, File, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface AssetGridProps {
  assets: Asset[];
  isLoading: boolean;
  onSelect: (asset: Asset) => void;
  selectedAsset: Asset | null;
  selectedAssets?: Asset[];
  multiSelect?: boolean;
  onToggleSelect?: (asset: Asset) => void;
}

const AssetGrid: React.FC<AssetGridProps> = ({
  assets,
  isLoading,
  onSelect,
  selectedAsset,
  selectedAssets = [],
  multiSelect = false,
  onToggleSelect,
}) => {
  // No longer filtering locally - assets should already be filtered by the parent component
  const filteredAssets = assets;

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
      <div className="flex flex-col items-center justify-center h-64 py-12 border-2 border-dashed rounded-md">
        <File className="h-12 w-12 text-gray-300 mb-4" />
        <p className="text-gray-500 text-center mb-2">No assets available</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-2">
        {filteredAssets.map((asset) => (
          <Card 
            key={asset.id} 
            className={cn(
              "overflow-hidden cursor-pointer transition-all hover:ring-2 hover:ring-primary/50 shadow-sm",
              (selectedAsset?.id === asset.id || (multiSelect && selectedAssets.some(a => a.id === asset.id))) && "ring-2 ring-primary"
            )}
            onClick={() => multiSelect && onToggleSelect ? onToggleSelect(asset) : onSelect(asset)}
          >
            <div className="relative aspect-video w-full overflow-hidden bg-gray-100">
              {multiSelect && selectedAssets.some(a => a.id === asset.id) && (
                <div className="absolute top-1 right-1 z-10 bg-primary text-white rounded-full p-0.5">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
              )}
              {asset.mimetype.startsWith('image/') ? (
                <img
                  src={asset.url}
                  alt={asset.title || asset.originalName}
                  className="h-full w-full object-cover transition-all"
                />
              ) : (
                <div className="h-full w-full flex flex-col items-center justify-center p-2">
                  {getAssetIcon(asset.mimetype)}
                  <span className="mt-1 text-xs text-gray-500 truncate max-w-full">
                    {asset.originalName.length > 15 ? asset.originalName.substring(0, 15) + '...' : asset.originalName}
                  </span>
                </div>
              )}
            </div>
            
            <CardContent className="p-2">
              <h3 className="font-medium text-sm truncate">
                {asset.title || asset.originalName}
              </h3>
              {/* <p className="text-xs text-gray-500 truncate">
                {new Date(asset.createdAt).toLocaleDateString()}
              </p> */}
            </CardContent>
            
            {/* <CardFooter className="p-2 pt-0 flex flex-wrap gap-1">
              {Array.isArray(asset.tags) && asset.tags.length > 0 && 
                asset.tags.slice(0, 1).map((tag: string, index: number) => (
                  <Badge key={index} variant="secondary" className="text-xs px-1 py-0">
                    {tag}
                  </Badge>
                ))
              }
              {Array.isArray(asset.tags) && asset.tags.length > 1 && (
                <Badge variant="outline" className="text-xs px-1 py-0">
                  +{asset.tags.length - 1}
                </Badge>
              )}
            </CardFooter> */}
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AssetGrid;