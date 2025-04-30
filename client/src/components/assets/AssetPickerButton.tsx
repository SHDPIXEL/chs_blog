import React, { useCallback } from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { useAssetManager, AssetSearchParams } from '@/context/AssetManagerContext';
import { Asset } from '@shared/schema';
import { ImageIcon } from 'lucide-react';

interface AssetPickerButtonProps {
  onSelect: (asset: Asset | Asset[]) => void;
  selectMode?: boolean; // Added selectMode prop
  children?: React.ReactNode;
  accept?: 'image' | 'document' | 'video' | 'audio' | 'all';
  variant?: ButtonProps['variant'];
  className?: string;
  disabled?: boolean;
  multiSelect?: boolean;
}

const AssetPickerButton: React.FC<AssetPickerButtonProps> = ({
  onSelect,
  selectMode = true, // Default selectMode to false
  children,
  accept = 'image',
  multiSelect = false,
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

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Prevent form submission if button is inside a form
    e.preventDefault();
    e.stopPropagation();

    // Custom filter function to apply before opening asset manager
    const filterCallback = (searchParams: AssetSearchParams) => {
      return {
        ...searchParams,
        mimetype: getMimeType()
      };
    };

    openAssetManager(onSelect, filterCallback, multiSelect, selectMode); // Pass selectMode

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