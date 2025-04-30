import React from 'react';
import { Asset } from '@shared/schema';
import { Loader2, Image, FileText, Video, Music, File } from 'lucide-react';
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
  selectedAsset 
}) => {
  // Display loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Display empty state
  if (assets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <File className="h-10 w-10 mb-2" />
        <p className="text-center">No assets found</p>
        <p className="text-sm text-gray-400">Upload assets or adjust your search criteria</p>
      </div>
    );
  }

  // Get appropriate icon based on mimetype
  const getAssetIcon = (mimetype: string) => {
    if (mimetype.startsWith('image/')) {
      return <Image className="h-6 w-6 text-blue-500" />;
    } else if (mimetype.startsWith('video/')) {
      return <Video className="h-6 w-6 text-purple-500" />;
    } else if (mimetype.startsWith('audio/')) {
      return <Music className="h-6 w-6 text-green-500" />;
    } else {
      return <FileText className="h-6 w-6 text-gray-500" />;
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {assets.map((asset) => (
        <div
          key={asset.id}
          className={cn(
            "relative border rounded-md overflow-hidden hover:border-primary cursor-pointer transition-all group",
            selectedAsset?.id === asset.id && "ring-2 ring-primary"
          )}
          onClick={() => onSelect(asset)}
        >
          {asset.mimetype.startsWith('image/') ? (
            <div className="aspect-square bg-gray-100 overflow-hidden">
              <img
                src={asset.url}
                alt={asset.title || asset.originalName}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
            </div>
          ) : (
            <div className="aspect-square bg-gray-100 flex items-center justify-center">
              {getAssetIcon(asset.mimetype)}
            </div>
          )}
          
          <div className="p-2 bg-white">
            <h4 className="text-sm font-medium truncate">
              {asset.title || asset.originalName}
            </h4>
            <p className="text-xs text-gray-500 truncate">
              {new Date(asset.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AssetGrid;