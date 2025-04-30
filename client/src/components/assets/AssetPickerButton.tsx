import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { useAssetManager } from '@/context/AssetManagerContext';
import { Asset } from '@shared/schema';
import { ImageIcon } from 'lucide-react';

interface AssetPickerButtonProps extends Omit<ButtonProps, 'onClick'> {
  onSelect: (asset: Asset) => void;
  children?: React.ReactNode;
}

const AssetPickerButton: React.FC<AssetPickerButtonProps> = ({
  onSelect,
  children,
  ...props
}) => {
  const { openAssetManager } = useAssetManager();

  const handleClick = () => {
    openAssetManager(onSelect);
  };

  return (
    <Button onClick={handleClick} {...props}>
      {children || (
        <>
          <ImageIcon className="mr-2 h-4 w-4" />
          Choose Image
        </>
      )}
    </Button>
  );
};

export default AssetPickerButton;