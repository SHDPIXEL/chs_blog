import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { Asset } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation, useQuery } from "@tanstack/react-query";

interface AssetManagerContextType {
  isOpen: boolean;
  openAssetManager: (
    onSelect?: (assets: Asset | Asset[]) => void,
    filterCallback?: (params: AssetSearchParams) => AssetSearchParams,
    allowMultiple?: boolean,
  ) => void;
  closeAssetManager: () => void;
  handleConfirmSelection: () => void; // New function to handle selection confirmation
  uploadAsset: (file: File, metadata?: AssetMetadata) => Promise<Asset>;
  isUploading: boolean;
  searchAssets: (params: AssetSearchParams) => void;
  currentPage: number;
  totalPages: number;
  assets: Asset[];
  isLoading: boolean;
  error: Error | null;
  selectedAsset: Asset | null;
  selectedAssets: Asset[];
  setSelectedAsset: (asset: Asset | null) => void;
  addSelectedAsset: (asset: Asset) => void;
  removeSelectedAsset: (assetId: number) => void;
  selectMode: boolean;
  multiSelect: boolean;
  onAssetSelect?: (assets: Asset | Asset[]) => void;
  deleteAsset: (assetId: number) => Promise<void>;
  updateAssetMetadata: (
    assetId: number,
    metadata: AssetMetadata,
  ) => Promise<Asset>;
}

interface AssetManagerProviderProps {
  children: ReactNode;
}

export interface AssetMetadata {
  title?: string;
  description?: string;
  tags?: string[];
}

export interface AssetSearchParams {
  query?: string;
  tags?: string[];
  mimetype?: string;
  page?: number;
  limit?: number;
}

const AssetManagerContext = createContext<AssetManagerContextType | undefined>(
  undefined,
);

export const AssetManagerProvider: React.FC<AssetManagerProviderProps> = ({
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchParams, setSearchParams] = useState<AssetSearchParams>({
    page: 1,
    limit: 20,
  });
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [selectedAssets, setSelectedAssets] = useState<Asset[]>([]);
  const [multiSelect, setMultiSelect] = useState(false);
  const [onAssetSelect, setOnAssetSelect] =
    useState<(assets: Asset | Asset[]) => void>();
  const [selectMode, setSelectMode] = useState(false);
  const { toast } = useToast();

  // Fetch assets query
  const { data, isLoading, error, refetch } = useQuery<
    { assets: Asset[]; total: number },
    Error
  >({
    queryKey: ["/api/assets/search", searchParams],
    queryFn: async () => {
      // Build query string
      const queryParams = new URLSearchParams();
      if (searchParams.query) queryParams.set("query", searchParams.query);
      if (searchParams.tags && searchParams.tags.length > 0)
        queryParams.set("tags", searchParams.tags.join(","));
      if (searchParams.mimetype)
        queryParams.set("mimetype", searchParams.mimetype);
      if (searchParams.page)
        queryParams.set("page", searchParams.page.toString());
      if (searchParams.limit)
        queryParams.set("limit", searchParams.limit.toString());

      console.log(
        "Fetching assets with params:",
        Object.fromEntries(queryParams.entries()),
      );

      const response = await apiRequest(
        "GET",
        `/api/assets/search?${queryParams.toString()}`,
      );
      return response.json();
    },
    // Only fetch when modal is open
    enabled: isOpen,
  });

  // Upload asset mutation
  const uploadMutation = useMutation({
    mutationFn: async ({
      file,
      metadata,
    }: {
      file: File;
      metadata?: AssetMetadata;
    }) => {
      const formData = new FormData();
      formData.append("file", file);

      if (metadata?.title) formData.append("title", metadata.title);
      if (metadata?.description)
        formData.append("description", metadata.description);
      if (metadata?.tags)
        formData.append("tags", JSON.stringify(metadata.tags));

      // Use token from the correct localStorage key
      const token = localStorage.getItem("blogcms_token");

      const response = await fetch("/api/assets", {
        method: "POST",
        body: formData,
        credentials: "include",
        headers: {
          // Don't set Content-Type header for FormData
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to upload asset");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assets/search"] });
      toast({
        title: "Asset uploaded",
        description: "Your file was uploaded successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete asset mutation
  const deleteMutation = useMutation({
    mutationFn: async (assetId: number) => {
      await apiRequest("DELETE", `/api/assets/${assetId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assets/search"] });
      toast({
        title: "Asset deleted",
        description: "The asset was deleted successfully",
      });
      setSelectedAsset(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update asset metadata mutation
  const updateMetadataMutation = useMutation({
    mutationFn: async ({
      assetId,
      metadata,
    }: {
      assetId: number;
      metadata: AssetMetadata;
    }) => {
      const response = await apiRequest(
        "PATCH",
        `/api/assets/${assetId}`,
        metadata,
      );
      return response.json();
    },
    onSuccess: (updatedAsset) => {
      queryClient.invalidateQueries({ queryKey: ["/api/assets/search"] });
      toast({
        title: "Asset updated",
        description: "The asset metadata was updated successfully",
      });
      setSelectedAsset(updatedAsset);
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Open asset manager with optional filtering
  const openAssetManager = useCallback(
    (
      onSelect?: (assets: Asset | Asset[]) => void,
      filterCallback?: (params: AssetSearchParams) => AssetSearchParams,
      allowMultiple: boolean = false,
      isSelectMode: boolean = false,
    ) => {
      console.log("Opening asset manager with onSelect:", onSelect);
      setIsOpen(true);
      setOnAssetSelect(() => onSelect); // Store the callback function directly
      setSelectedAsset(null);
      setSelectedAssets([]);
      setMultiSelect(allowMultiple);
      setSelectMode(isSelectMode);

      // Apply filter if provided
      if (filterCallback) {
        const filteredParams = filterCallback(searchParams);
        setSearchParams(filteredParams);
        // Don't call refetch here - the useEffect with searchParams dependency will trigger it
      } else {
        refetch(); // Only refetch if no filter was applied to prevent double fetch
      }
    },
    [refetch, searchParams],
  );

  // Close asset manager without selection
  const closeAssetManager = useCallback(() => {
    setIsOpen(false);
    setOnAssetSelect(undefined);
    setSelectedAsset(null);
    setSelectedAssets([]);
    setMultiSelect(false);
  }, []);

  // Handle confirmation of asset selection
  const handleConfirmSelection = useCallback(() => {
    console.log("Confirming selection");
    console.log("onAssetSelect:", onAssetSelect);
    console.log("selectedAsset:", selectedAsset);
    console.log("multiSelect:", multiSelect);
    console.log("selectedAssets:", selectedAssets);

    // Save the callback and selected assets before clearing state
    const callback = onAssetSelect;
    const assetToSelect = multiSelect ? selectedAssets : selectedAsset;

    // First close the manager (but we'll handle the callback separately)
    setIsOpen(false);

    // Only invoke the callback after we've captured it
    if (callback) {
      if (multiSelect) {
        // For multi-select, pass the array of selected assets
        callback(selectedAssets);
      } else if (selectedAsset) {
        // For single select, pass the selected asset
        callback(selectedAsset);
      }
    }

    // Now we can safely clear the state
    setOnAssetSelect(undefined);
    setSelectedAsset(null);
    setSelectedAssets([]);
    setMultiSelect(false);
  }, [onAssetSelect, selectedAsset, selectedAssets, multiSelect]);

  // Upload asset
  const uploadAsset = useCallback(
    async (file: File, metadata?: AssetMetadata) => {
      return uploadMutation.mutateAsync({ file, metadata });
    },
    [uploadMutation],
  );

  // Search assets
  const searchAssets = useCallback((params: AssetSearchParams) => {
    setSearchParams((prev) => ({ ...prev, ...params }));
  }, []);

  // Delete asset
  const deleteAsset = useCallback(
    async (assetId: number) => {
      await deleteMutation.mutateAsync(assetId);
    },
    [deleteMutation],
  );

  // Update asset metadata
  const updateAssetMetadata = useCallback(
    async (assetId: number, metadata: AssetMetadata) => {
      return updateMetadataMutation.mutateAsync({ assetId, metadata });
    },
    [updateMetadataMutation],
  );

  // Add asset to selection (for multi-select mode)
  const addSelectedAsset = useCallback((asset: Asset) => {
    setSelectedAssets((prev) => {
      // Check if asset already exists in array
      if (prev.some((a) => a.id === asset.id)) {
        return prev;
      }
      return [...prev, asset];
    });
  }, []);

  // Remove asset from selection (for multi-select mode)
  const removeSelectedAsset = useCallback((assetId: number) => {
    setSelectedAssets((prev) => prev.filter((asset) => asset.id !== assetId));
  }, []);

  // Calculate pagination values
  const totalItems = data?.total || 0;
  const itemsPerPage = searchParams.limit || 20;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const currentPage = searchParams.page || 1;

  const value: AssetManagerContextType = {
    isOpen,
    openAssetManager,
    closeAssetManager,
    handleConfirmSelection,
    uploadAsset,
    isUploading: uploadMutation.isPending,
    searchAssets,
    currentPage,
    totalPages,
    assets: data?.assets || [],
    isLoading,
    error,
    selectedAsset,
    selectedAssets,
    setSelectedAsset,
    addSelectedAsset,
    removeSelectedAsset,
    selectMode, //selectMode: !!onAssetSelect,
    multiSelect,
    onAssetSelect,
    deleteAsset,
    updateAssetMetadata,
  };

  return (
    <AssetManagerContext.Provider value={value}>
      {children}
    </AssetManagerContext.Provider>
  );
};

export const useAssetManager = (): AssetManagerContextType => {
  const context = useContext(AssetManagerContext);
  if (context === undefined) {
    throw new Error(
      "useAssetManager must be used within an AssetManagerProvider",
    );
  }
  return context;
};
