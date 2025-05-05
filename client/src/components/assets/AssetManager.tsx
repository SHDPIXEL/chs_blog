import React, { useState, useRef, ChangeEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAssetManager, AssetMetadata } from "@/context/AssetManagerContext";
import { AssetGrid } from "@/components/assets";
import { AssetDetails } from "@/components/assets";
import {
  Upload,
  Search,
  X,
  Tag,
  Plus,
  Image,
  FileText,
  Video,
  Music,
  FileIcon,
  Filter,
  CheckCircle,
} from "lucide-react";
import { Asset } from "@shared/schema";

const AssetManager: React.FC = () => {
  const {
    isOpen,
    closeAssetManager,
    handleConfirmSelection,
    uploadAsset,
    isUploading,
    searchAssets,
    assets,
    isLoading,
    selectedAsset,
    selectedAssets,
    setSelectedAsset,
    addSelectedAsset,
    removeSelectedAsset,
    selectMode,
    multiSelect,
    onAssetSelect,
  } = useAssetManager();

  const [activeTab, setActiveTab] = useState<string>("browse");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadMetadata, setUploadMetadata] = useState<AssetMetadata>({
    title: "",
    description: "",
    tags: [],
  });
  const [newTag, setNewTag] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setUploadFile(file);
      setUploadMetadata((prev) => ({
        ...prev,
        title: file.name.split(".")[0],
      }));
    }
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!uploadFile) return;

    try {
      await uploadAsset(uploadFile, uploadMetadata);
      // Reset form after successful upload
      setUploadFile(null);
      setUploadMetadata({ title: "", description: "", tags: [] });
      setActiveTab("browse");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  // Handle adding a new tag
  const handleAddTag = () => {
    if (!newTag.trim()) return;
    setUploadMetadata((prev) => ({
      ...prev,
      tags: [...(prev.tags || []), newTag.trim()],
    }));
    setNewTag("");
  };

  // Handle removing a tag
  const handleRemoveTag = (tag: string) => {
    setUploadMetadata((prev) => ({
      ...prev,
      tags: prev.tags ? prev.tags.filter((t) => t !== tag) : [],
    }));
  };

  // Handle search
  const handleSearch = () => {
    searchAssets({
      query: searchQuery,
      page: 1,
    });
  };

  // Handle search type filter
  const handleFilterByType = (type: string) => {
    setSelectedType(type);
    searchAssets({
      query: searchQuery,
      mimetype: type !== "all" ? getMimeTypeFilter(type) : undefined,
      page: 1,
    });
  };

  // Handle selecting an asset
  const handleSelectAsset = (asset: Asset) => {
    console.log("handleSelectAsset");
    console.log("asset : ", asset);
    setSelectedAsset(asset);

    // In multi-select mode, we don't auto-close or auto-select
    // Let user explicitly confirm with the Continue button
  };

  // Handle toggling asset selection (for multi-select mode)
  const handleToggleAsset = (asset: Asset) => {
    // Always update selected asset for detail view
    setSelectedAsset(asset);

    // Only toggle in multi-select mode
    if (multiSelect) {
      // Check if asset is already selected
      if (selectedAssets.some((a) => a.id === asset.id)) {
        removeSelectedAsset(asset.id);
      } else {
        addSelectedAsset(asset);
      }
    }
  };

  // Handle final selection confirmation for both modes is now in the context

  // Helper function to get mimetype filter
  const getMimeTypeFilter = (type: string): string => {
    switch (type) {
      case "image":
        return "image/";
      case "document":
        return "application/";
      case "video":
        return "video/";
      case "audio":
        return "audio/";
      default:
        return "";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeAssetManager()}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] h-[90vh] flex flex-col overflow-hidden p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle>Asset Manager</DialogTitle>
          <DialogDescription>
            Browse, search and manage your media assets
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col"
        >
          <TabsList className="grid grid-cols-2 mb-2 mx-6">
            <TabsTrigger value="browse">Browse Assets</TabsTrigger>
            <TabsTrigger value="upload">Upload New</TabsTrigger>
          </TabsList>

          <TabsContent
            value="browse"
            className={`flex-1 flex flex-col overflow-y-auto ${activeTab !== "browse" ? "hidden" : ""}`}
          >
            <div className="px-6 pb-4 flex flex-col h-full">
              <div className="mb-4 space-y-2 sticky top-0 bg-white z-10 py-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Search assets..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1"
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  />
                  <Button onClick={handleSearch} size="icon">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>

                {/* <div className="flex flex-wrap gap-1">
                  <Badge 
                    variant={selectedType === 'all' ? 'default' : 'outline'} 
                    className="cursor-pointer"
                    onClick={() => handleFilterByType('all')}
                  >
                    All
                  </Badge>
                  <Badge 
                    variant={selectedType === 'image' ? 'default' : 'outline'} 
                    className="cursor-pointer"
                    onClick={() => handleFilterByType('image')}
                  >
                    <Image className="h-3 w-3 mr-1" />
                    Images
                  </Badge>
                  <Badge 
                    variant={selectedType === 'document' ? 'default' : 'outline'} 
                    className="cursor-pointer"
                    onClick={() => handleFilterByType('document')}
                  >
                    <FileText className="h-3 w-3 mr-1" />
                    Documents
                  </Badge>
                  <Badge 
                    variant={selectedType === 'video' ? 'default' : 'outline'} 
                    className="cursor-pointer"
                    onClick={() => handleFilterByType('video')}
                  >
                    <Video className="h-3 w-3 mr-1" />
                    Videos
                  </Badge>
                </div>
                 */}
              </div>

              <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 min-h-0">
                <div className="col-span-2 border rounded-md p-3 overflow-y-auto">
                  <AssetGrid
                    assets={assets}
                    isLoading={isLoading}
                    onSelect={handleSelectAsset}
                    selectedAsset={selectedAsset}
                    selectedAssets={selectedAssets}
                    multiSelect={multiSelect}
                    onToggleSelect={handleToggleAsset}
                  />
                </div>

                <div className="col-span-1 border rounded-md p-3 flex flex-col h-[calc(100vh-400px)]">
                  <div className="flex-1 overflow-y-auto">
                    {selectedAsset ? (
                      <AssetDetails asset={selectedAsset} />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-gray-500 text-center">
                        <FileIcon className="h-10 w-10 mb-2" />
                        <p>Select an asset to view details</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 mt-4 flex justify-end gap-2 pt-3 border-t bg-white">
                <Button variant="outline" onClick={closeAssetManager}>
                  Cancel
                </Button>

                {selectMode &&
                  (multiSelect ? (
                    <Button
                      disabled={selectedAssets.length === 0}
                      onClick={handleConfirmSelection}
                      className="bg-primary hover:bg-primary/90"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Continue with{" "}
                      {selectedAssets.length > 0
                        ? `${selectedAssets.length} Selected`
                        : "Selection"}
                    </Button>
                  ) : (
                    <Button
                      disabled={!selectedAsset}
                      onClick={handleConfirmSelection}
                      className="bg-primary hover:bg-primary/90"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Select Asset
                    </Button>
                  ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent
            value="upload"
            className={`flex-1 flex flex-col overflow-hidden ${activeTab !== "upload" ? "hidden" : ""}`}
          >
            <div className="px-6 pb-4 flex flex-col h-full overflow-hidden">
              <div className="flex-1 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                  <div className="border rounded-md p-4">
                    <h3 className="text-lg font-medium mb-4">Upload File</h3>

                    {uploadFile ? (
                      <div className="mb-4 p-4 border rounded-md flex items-center justify-between">
                        <div className="flex items-center">
                          {uploadFile.type.startsWith("image/") ? (
                            <Image className="h-6 w-6 mr-2 text-blue-500" />
                          ) : uploadFile.type.startsWith("video/") ? (
                            <Video className="h-6 w-6 mr-2 text-purple-500" />
                          ) : uploadFile.type.startsWith("audio/") ? (
                            <Music className="h-6 w-6 mr-2 text-green-500" />
                          ) : (
                            <FileText className="h-6 w-6 mr-2 text-gray-500" />
                          )}
                          <div>
                            <p
                              className="font-medium text-sm truncate"
                              style={{ maxWidth: "200px" }}
                            >
                              {uploadFile.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {(uploadFile.size / 1024).toFixed(2)} KB
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setUploadFile(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div
                        className="border-2 border-dashed rounded-md p-6 text-center mb-4 cursor-pointer hover:bg-gray-50 transition"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="h-10 w-10 mx-auto mb-2 text-gray-400" />
                        <p className="text-gray-500 mb-1">
                          Click to select a file or drag and drop
                        </p>
                        <p className="text-xs text-gray-400">
                          Max file size: 5MB
                        </p>
                        <input
                          type="file"
                          ref={fileInputRef}
                          className="hidden"
                          onChange={handleFileChange}
                          accept="image/*,video/*"
                        />
                      </div>
                    )}

                    <Button
                      className="w-full"
                      disabled={!uploadFile || isUploading}
                      onClick={handleUpload}
                    >
                      {isUploading ? "Uploading..." : "Upload Asset"}
                    </Button>
                  </div>

                  <div className="border rounded-md p-4">
                    <h3 className="text-lg font-medium mb-4">Asset Details</h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Title
                        </label>
                        <Input
                          value={uploadMetadata.title || ""}
                          onChange={(e) =>
                            setUploadMetadata((prev) => ({
                              ...prev,
                              title: e.target.value,
                            }))
                          }
                          placeholder="Asset title"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Description
                        </label>
                        <textarea
                          value={uploadMetadata.description || ""}
                          onChange={(e) =>
                            setUploadMetadata((prev) => ({
                              ...prev,
                              description: e.target.value,
                            }))
                          }
                          placeholder="Brief description of the asset"
                          className="w-full p-2 border bg-white rounded-md  focus:outline-none focus:ring-2 focus:ring-[#CC0033] text-base leading-relaxed font-sans placeholder:text-base placeholder:font-sans

                          "
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Tags
                        </label>
                        <div className="flex gap-2 mb-2">
                          <Input
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            placeholder="Add a tag"
                            className="flex-1"
                            onKeyDown={(e) =>
                              e.key === "Enter" && handleAddTag()
                            }
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
                          {uploadMetadata.tags?.map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="px-3 py-1"
                            >
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
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 mt-4 flex justify-end gap-2 pt-3 border-t bg-white">
                <Button variant="outline" onClick={closeAssetManager}>
                  Cancel
                </Button>
              </div>
            </div>
          </TabsContent>
          
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AssetManager;
