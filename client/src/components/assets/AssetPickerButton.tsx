import React, { useCallback } from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { useAssetManager, AssetSearchParams } from '@/context/AssetManagerContext';
import { Asset } from '@shared/schema';
import { ImageIcon } from 'lucide-react';

interface AssetPickerButtonProps extends Omit<ButtonProps, 'onClick'> {
  onSelect: (asset: Asset) => void;
  children?: React.ReactNode;
  accept?: 'image' | 'document' | 'video' | 'audio' | 'all';
}

const AssetPickerButton: React.FC<AssetPickerButtonProps> = ({
  onSelect,
  children,
  accept = 'image',
  ...props
}) => {
  const { openAssetManager } = useAssetManager();

  // Map accept type to mimetype filter
  const getMimeType = useCallback(() => {
    switch (accept) {
      case 'image': return 'image/';
      case 'document': return 'application/';
      case 'video': return 'video/';
      case 'audio': return 'audio/';
      default: return undefined;
    }
  }, [accept]);

  const handleClick = () => {
    // Custom filter function to apply before opening asset manager
    const filterCallback = (searchParams: AssetSearchParams) => {
      return {
        ...searchParams,
        mimetype: getMimeType()
      };
    };
    
    openAssetManager(onSelect, filterCallback);
  };

  return (
    <Button onClick={handleClick} {...props}>
      {children || (
        <>
          <ImageIcon className="mr-2 h-4 w-4" />
          Choose {accept.charAt(0).toUpperCase() + accept.slice(1)}
        </>
      )}
    </Button>
  );
};

export default AssetPickerButton;