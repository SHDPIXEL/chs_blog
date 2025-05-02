import React, { useState, useEffect } from 'react';
import { Label } from './label';
import { Input } from './input';
import { Button } from './button';
import { Card, CardContent } from './card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';
import { 
  FaTwitter, FaFacebook, FaLinkedin, FaGithub, FaInstagram, 
  FaYoutube, FaTiktok, FaMedium, FaPinterest, FaReddit, 
  FaDiscord, FaSlack, FaTwitch, FaTelegram, FaPlus, FaTrash 
} from 'react-icons/fa';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { PlusCircleIcon } from 'lucide-react';

// Define social platform options
const socialPlatforms = [
  { id: 'twitter', name: 'Twitter', icon: FaTwitter, urlPrefix: 'https://twitter.com/' },
  { id: 'facebook', name: 'Facebook', icon: FaFacebook, urlPrefix: 'https://facebook.com/' },
  { id: 'linkedin', name: 'LinkedIn', icon: FaLinkedin, urlPrefix: 'https://linkedin.com/in/' },
  { id: 'github', name: 'GitHub', icon: FaGithub, urlPrefix: 'https://github.com/' },
  { id: 'instagram', name: 'Instagram', icon: FaInstagram, urlPrefix: 'https://instagram.com/' },
  { id: 'youtube', name: 'YouTube', icon: FaYoutube, urlPrefix: 'https://youtube.com/' },
  { id: 'tiktok', name: 'TikTok', icon: FaTiktok, urlPrefix: 'https://tiktok.com/@' },
  { id: 'medium', name: 'Medium', icon: FaMedium, urlPrefix: 'https://medium.com/@' },
  { id: 'pinterest', name: 'Pinterest', icon: FaPinterest, urlPrefix: 'https://pinterest.com/' },
  { id: 'reddit', name: 'Reddit', icon: FaReddit, urlPrefix: 'https://reddit.com/user/' },
  { id: 'discord', name: 'Discord', icon: FaDiscord, urlPrefix: '' },
  { id: 'slack', name: 'Slack', icon: FaSlack, urlPrefix: '' },
  { id: 'twitch', name: 'Twitch', icon: FaTwitch, urlPrefix: 'https://twitch.tv/' },
  { id: 'telegram', name: 'Telegram', icon: FaTelegram, urlPrefix: 'https://t.me/' },
];

// Get icon for platform
const getPlatformIcon = (platformId: string) => {
  const platform = socialPlatforms.find(p => p.id === platformId);
  if (!platform) return null;
  
  const IconComponent = platform.icon;
  return <IconComponent className="h-5 w-5" />;
};

// Get platform name
const getPlatformName = (platformId: string) => {
  const platform = socialPlatforms.find(p => p.id === platformId);
  return platform ? platform.name : platformId;
};

// Get platform URL prefix
const getPlatformUrlPrefix = (platformId: string) => {
  const platform = socialPlatforms.find(p => p.id === platformId);
  return platform ? platform.urlPrefix : 'https://';
};

interface SocialLinksEditorProps {
  value: string;
  onChange: (value: string) => void;
}

interface SocialLink {
  platform: string;
  url: string;
}

const SocialLinksEditor: React.FC<SocialLinksEditorProps> = ({ value, onChange }) => {
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newPlatform, setNewPlatform] = useState(socialPlatforms[0].id);
  const [newUrl, setNewUrl] = useState('');
  const [selectedPrefix, setSelectedPrefix] = useState(socialPlatforms[0].urlPrefix);

  // Parse JSON string to links array
  useEffect(() => {
    if (value) {
      try {
        const socialData = JSON.parse(value) as Record<string, string>;
        const linksArray = Object.entries(socialData).map(([platform, url]) => ({
          platform,
          url
        }));
        setLinks(linksArray);
      } catch (e) {
        // If parsing fails, start with empty array
        setLinks([]);
      }
    } else {
      setLinks([]);
    }
  }, [value]);

  // Update JSON string when links change
  const updateValue = (newLinks: SocialLink[]) => {
    const socialData = newLinks.reduce((acc, { platform, url }) => {
      if (platform && url) {
        acc[platform] = url;
      }
      return acc;
    }, {} as Record<string, string>);
    
    onChange(JSON.stringify(socialData));
  };

  // Handle adding a new link
  const handleAddLink = () => {
    // Check if URL is valid
    let finalUrl = newUrl;
    if (!finalUrl.startsWith('http://') && 
        !finalUrl.startsWith('https://') && 
        selectedPrefix) {
      finalUrl = selectedPrefix + newUrl;
    }

    const updatedLinks = [...links, { platform: newPlatform, url: finalUrl }];
    setLinks(updatedLinks);
    updateValue(updatedLinks);
    setDialogOpen(false);
    setNewUrl('');
  };

  // Handle removing a link
  const handleRemoveLink = (index: number) => {
    const updatedLinks = links.filter((_, i) => i !== index);
    setLinks(updatedLinks);
    updateValue(updatedLinks);
  };

  // Handle platform change in add dialog
  const handlePlatformChange = (platformId: string) => {
    setNewPlatform(platformId);
    setSelectedPrefix(getPlatformUrlPrefix(platformId));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Social Links</Label>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              type="button" 
              onClick={(e) => e.preventDefault()}
            >
              <PlusCircleIcon className="h-4 w-4 mr-2" />
              Add Link
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Social Link</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="platform">Platform</Label>
                <Select 
                  value={newPlatform} 
                  onValueChange={handlePlatformChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Platform" />
                  </SelectTrigger>
                  <SelectContent>
                    {socialPlatforms.map(platform => (
                      <SelectItem key={platform.id} value={platform.id}>
                        <div className="flex items-center">
                          <platform.icon className="h-4 w-4 mr-2" />
                          {platform.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="url">URL or Username</Label>
                <div className="flex items-center space-x-2">
                  {selectedPrefix && (
                    <div className="text-sm text-gray-500 whitespace-nowrap">
                      {selectedPrefix}
                    </div>
                  )}
                  <Input
                    id="url"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    placeholder={selectedPrefix ? "username" : "https://..."}
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  {selectedPrefix 
                    ? "Enter your username or handle without the URL prefix" 
                    : "Enter the complete URL"}
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddLink} disabled={!newUrl.trim()}>
                Add
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {links.length > 0 ? (
        <Card>
          <CardContent className="p-4">
            <ul className="space-y-3">
              {links.map((link, index) => (
                <li key={index} className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50">
                  <div className="flex items-center">
                    <div className="text-gray-800 mr-2">
                      {getPlatformIcon(link.platform) || <span className="text-gray-400">•</span>}
                    </div>
                    <div>
                      <div className="font-medium">{getPlatformName(link.platform)}</div>
                      <a 
                        href={link.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-500 hover:underline"
                      >
                        {link.url}
                      </a>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleRemoveLink(index)}
                    className="text-gray-500 hover:text-red-500"
                  >
                    <FaTrash className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : (
        <div className="text-center p-6 border border-dashed rounded-lg">
          <p className="text-gray-500 mb-2">No social links added yet</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={(e) => {
              e.preventDefault(); // Prevent form submission
              setDialogOpen(true);
            }}
            type="button" // Explicitly set button type to prevent form submission
          >
            <FaPlus className="h-3 w-3 mr-2" /> Add Your First Link
          </Button>
        </div>
      )}

      <input 
        type="hidden" 
        id="socialLinks" 
        name="socialLinks" 
        value={value || ""}
      />
    </div>
  );
};

// Display component for social links with icons
interface SocialLinksDisplayProps {
  value?: string;
  className?: string;
}

export const SocialLinksDisplay: React.FC<SocialLinksDisplayProps> = ({ value, className = "" }) => {
  if (!value) return null;

  try {
    const socialData = JSON.parse(value) as Record<string, string>;
    
    return (
      <div className={`flex flex-wrap gap-3 ${className}`}>
        {Object.entries(socialData).map(([platform, url]) => {
          if (!url) return null;
          
          const icon = getPlatformIcon(platform);
          const name = getPlatformName(platform);
          
          return (
            <TooltipProvider key={platform}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                  >
                    {icon}
                    <span className="sr-only">{name}</span>
                  </a>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{name}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>
    );
  } catch (e) {
    return null;
  }
};

export default SocialLinksEditor;