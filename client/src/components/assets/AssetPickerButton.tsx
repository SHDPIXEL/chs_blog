import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { useAssetManager } from '@/context/AssetManagerContext';
import { Asset } from '@shared/schema';
import { Image as ImageIcon } from 'lucide-react';

interface AssetPickerButtonProps extends Omit<ButtonProps, 'onClick'> {
  onSelect: (asset: Asset) => void;
  children?: React.ReactNode;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const AssetPickerButton: React.FC<AssetPickerButtonProps> = ({
  onSelect,
  children,
  variant = 'outline',
  size = 'default',
  ...props
}) => {
  const { openAssetManager } = useAssetManager();

  const handleClick = () => {
    openAssetManager(onSelect);
  };

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={handleClick}
      {...props}
    >
      {children || (
        <>
          <ImageIcon className="h-4 w-4 mr-2" />
          Choose Asset
        </>
      )}
    </Button>
  );
};

export default AssetPickerButton;