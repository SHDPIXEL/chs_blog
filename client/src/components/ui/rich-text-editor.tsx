import React, { useCallback, useState, useImperativeHandle, forwardRef } from 'react';
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  Image as ImageIcon,
  X,
  MoveHorizontal,
  Minus,
  Heading1,
  Heading2,
  Quote,
  Code,
} from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { AssetPickerButton } from '@/components/assets';
import { Asset } from '@shared/schema';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  readOnly?: boolean;
}

// Resizable Image Component
const ResizableImageComponent = ({ node, updateAttributes, getPos, editor }: any) => {
  const [size, setSize] = useState({
    width: node.attrs.width || 'auto',
    height: node.attrs.height || 'auto',
  });

  const [resizeDirection, setResizeDirection] = useState<string | null>(null);
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
  const [startSize, setStartSize] = useState({ width: 0, height: 0 });
  const [imageNaturalSize, setImageNaturalSize] = useState({ width: 0, height: 0 });
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState(node.attrs.link || '');
  const imageRef = React.useRef<HTMLImageElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Get natural size of image on load
  const handleImageLoad = () => {
    if (imageRef.current) {
      setImageNaturalSize({
        width: imageRef.current.naturalWidth,
        height: imageRef.current.naturalHeight,
      });
      
      // Set initial size if not already set
      if (size.width === 'auto') {
        const initialWidth = Math.min(600, imageRef.current.naturalWidth);
        const aspectRatio = imageRef.current.naturalHeight / imageRef.current.naturalWidth;
        setSize({
          width: `${initialWidth}px`,
          height: `${initialWidth * aspectRatio}px`,
        });
        
        // Update attributes in the node
        updateAttributes({
          width: `${initialWidth}px`,
          height: `${initialWidth * aspectRatio}px`,
        });
      }
    }
  };

  // Handle image click - this will be used for following links
  const handleImageClick = (e: React.MouseEvent) => {
    console.log("Image clicked:", {
      hasLink: !!node.attrs.link,
      link: node.attrs.link,
      isResizing: !!resizeDirection,
      ctrlKey: e.ctrlKey,
      metaKey: e.metaKey
    });
    
    // If we have a link and are not in the middle of resizing, open the link
    if (node.attrs.link && !resizeDirection) {
      // Check if we should override default behavior with cmd/ctrl clicked
      if (!(e.ctrlKey || e.metaKey)) {
        // Only prevent default if we're not holding ctrl/cmd to open in new tab
        e.preventDefault();
      }
      console.log("Opening link:", node.attrs.link);
      // Open the link in a new tab
      window.open(node.attrs.link, '_blank', 'noopener,noreferrer');
    }
  };

  // Start resizing
  const handleResizeStart = (e: React.MouseEvent, direction: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const container = e.currentTarget.parentElement;
    if (!container) return;
    
    // Get the current size
    const rect = container.getBoundingClientRect();
    setStartPoint({ x: e.clientX, y: e.clientY });
    setStartSize({ width: rect.width, height: rect.height });
    setResizeDirection(direction);
    
    // Add event listeners to document
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Handle mouse movement while resizing
  const handleMouseMove = (e: MouseEvent) => {
    if (!resizeDirection) return;
    
    e.preventDefault();
    
    // Calculate how much the mouse has moved
    const deltaX = e.clientX - startPoint.x;
    const deltaY = e.clientY - startPoint.y;
    let newWidth = startSize.width;
    let newHeight = startSize.height;
    const aspectRatio = startSize.height / startSize.width;
    
    if (resizeDirection === 'right' || resizeDirection === 'bottom-right') {
      newWidth = Math.max(100, startSize.width + deltaX);
    }
    
    if (resizeDirection === 'bottom' || resizeDirection === 'bottom-right') {
      newHeight = Math.max(50, startSize.height + deltaY);
    }
    
    // Maintain aspect ratio for bottom-right corner drag
    if (resizeDirection === 'bottom-right') {
      // Use the larger of the two deltas to determine sizing
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        newHeight = newWidth * aspectRatio;
      } else {
        newWidth = newHeight / aspectRatio;
      }
    } else if (resizeDirection === 'right') {
      // For right handle, maintain aspect ratio based on width
      newHeight = newWidth * aspectRatio;
    } else if (resizeDirection === 'bottom') {
      // For bottom handle, maintain aspect ratio based on height
      newWidth = newHeight / aspectRatio;
    }
    
    setSize({
      width: `${newWidth}px`,
      height: `${newHeight}px`,
    });
  };
  
  // End resizing
  const handleMouseUp = () => {
    if (!resizeDirection) return;
    
    setResizeDirection(null);
    
    // Update the node attributes with the new size
    updateAttributes({
      width: size.width,
      height: size.height,
    });
    
    // Remove event listeners
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  // Handle setting a link on the image
  const handleSetLink = () => {
    console.log("Setting image link:", {
      linkUrl,
      isEmpty: linkUrl === '',
      existingLink: node.attrs.link
    });
    
    if (linkUrl === '') {
      // Remove link
      console.log("Removing image link");
      updateAttributes({ link: null });
    } else {
      // Add https:// if it doesn't exist
      const url = linkUrl.startsWith('http') ? linkUrl : `https://${linkUrl}`;
      console.log("Adding/updating image link to:", url);
      // Set link
      updateAttributes({ link: url });
    }
    // Close link input
    setShowLinkInput(false);
  };

  // Clean up event listeners on unmount
  React.useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <NodeViewWrapper className="relative my-4">
      <div 
        ref={containerRef}
        className={`relative inline-block ${resizeDirection ? 'select-none' : ''}`}
        style={{ width: size.width, height: size.height }}
        data-type="image"
        data-link={node.attrs.link || undefined}
      >
        {/* Image with optional link styling */}
        <div 
          className={`w-full h-full group ${node.attrs.link ? 'cursor-pointer hover:opacity-95 transition-all' : ''}`}
          onClick={handleImageClick}
        >
          <div className={`relative w-full h-full ${node.attrs.link ? 'ring-2 ring-blue-500 ring-opacity-30 hover:ring-opacity-80 rounded-md transition-all' : ''}`}>
            <img
              ref={imageRef}
              src={node.attrs.src}
              alt=""
              onLoad={handleImageLoad}
              className="max-w-full h-auto object-contain rounded-md"
              style={{ width: '100%', height: '100%' }}
            />
            
            {/* Link indicator - show when image has a link */}
            {node.attrs.link && (
              <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded-md shadow-md text-xs flex items-center">
                <LinkIcon className="h-3 w-3 mr-1" />
                <span className="hidden sm:inline">Visit Link</span>
              </div>
            )}
            
            {/* Hover overlay with link URL */}
            {node.attrs.link && (
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-md">
                <div className="bg-white px-3 py-2 rounded-md max-w-[90%] truncate text-sm">
                  <LinkIcon className="h-3 w-3 inline-block mr-1" />
                  <span>{node.attrs.link}</span>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Context menu for adding/editing links */}
        {showLinkInput && (
          <div className="absolute -top-12 left-0 z-50 bg-white border rounded-md shadow-md p-3 flex items-center gap-2">
            <Input
              type="text"
              placeholder="Enter URL..."
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className="text-sm w-60"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSetLink();
                } else if (e.key === 'Escape') {
                  setShowLinkInput(false);
                }
              }}
            />
            <Button variant="ghost" size="sm" onClick={() => setShowLinkInput(false)}>
              <X className="h-4 w-4" />
            </Button>
            <Button size="sm" onClick={handleSetLink}>
              {node.attrs.link ? 'Update' : 'Add'}
            </Button>
          </div>
        )}
        
        {/* Resize handles */}
        <div
          className="absolute top-0 right-0 w-3 h-full cursor-ew-resize opacity-0 hover:opacity-100 hover:bg-primary/20"
          onMouseDown={(e) => handleResizeStart(e, 'right')}
        />
        <div
          className="absolute bottom-0 left-0 w-full h-3 cursor-ns-resize opacity-0 hover:opacity-100 hover:bg-primary/20"
          onMouseDown={(e) => handleResizeStart(e, 'bottom')}
        />
        <div
          className="absolute bottom-0 right-0 w-6 h-6 cursor-nwse-resize opacity-0 hover:opacity-100 hover:bg-primary/20"
          onMouseDown={(e) => handleResizeStart(e, 'bottom-right')}
        />
        
        {/* Link button */}
        <div
          className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 hover:opacity-100 bg-white shadow-md rounded-md cursor-pointer transition-all transform hover:scale-105"
          onClick={() => setShowLinkInput(!showLinkInput)}
        >
          <Button 
            variant={node.attrs.link ? "default" : "outline"} 
            size="sm" 
            type="button" 
            className="h-8 px-2"
          >
            {node.attrs.link ? (
              <span className="flex items-center text-xs text-white">
                <LinkIcon className="h-3 w-3 mr-1" />
                Edit Link
              </span>
            ) : (
              <span className="flex items-center text-xs">
                <LinkIcon className="h-3 w-3 mr-1" />
                Add Link
              </span>
            )}
          </Button>
        </div>
      </div>
    </NodeViewWrapper>
  );
};

export interface RichTextEditorRef {
  getHTML: () => string;
}

export const RichTextEditor = forwardRef<RichTextEditorRef, RichTextEditorProps>((props, ref) => {
  const {
    value,
    onChange,
    placeholder = 'Start writing...',
    className,
    readOnly = false,
  } = props;
  
  const [linkUrl, setLinkUrl] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');

  // Set up custom image extension
  const CustomImage = Image.extend({
    addNodeView() {
      return ReactNodeViewRenderer(ResizableImageComponent);
    },
    addAttributes() {
      return {
        ...this.parent?.(),
        width: {
          default: 'auto',
        },
        height: {
          default: 'auto',
        },
        link: {
          default: null,
        },
      };
    },
  });

  const editor = useEditor({
    extensions: [
      StarterKit,
      CustomImage,
      Link.configure({
        openOnClick: true, // Change to true to make links clickable
        HTMLAttributes: {
          class: 'text-blue-500 hover:text-blue-700 underline cursor-pointer',
        },
      }),
      Underline,
      Placeholder.configure({
        placeholder,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: value,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });
  
  // Update content when value prop changes
  React.useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [editor, value]);
  
  // Process HTML before returning
  const processHTML = (htmlContent: string) => {
    // Use DOM parser to manipulate HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    
    // Find all image containers
    const imageContainers = doc.querySelectorAll('div[data-type="image"]');
    
    imageContainers.forEach(container => {
      const link = container.getAttribute('data-link');
      const img = container.querySelector('img');
      
      if (link && img) {
        // Create an anchor element
        const anchor = doc.createElement('a');
        anchor.href = link;
        anchor.target = "_blank";
        anchor.rel = "noopener noreferrer";
        
        // Move the img into the anchor
        const imgClone = img.cloneNode(true);
        anchor.appendChild(imgClone);
        
        // Replace the img with the anchor
        img.parentNode?.replaceChild(anchor, img);
      }
    });
    
    return doc.body.innerHTML;
  };

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    getHTML: () => {
      if (!editor) return '';
      
      // Get HTML from editor
      const html = editor.getHTML();
      
      // Process HTML to wrap linked images in anchor tags
      return processHTML(html);
    }
  }), [editor]);

  const setLink = useCallback(() => {
    if (!editor) return;
    
    if (linkUrl === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    // Add https:// if it doesn't exist
    const url = linkUrl.startsWith('http') ? linkUrl : `https://${linkUrl}`;
    
    // Update link
    editor
      .chain()
      .focus()
      .extendMarkRange('link')
      .setLink({ href: url })
      .run();
  }, [editor, linkUrl]);

  const addImage = useCallback((url: string) => {
    if (!editor || !url) return;
    
    editor
      .chain()
      .focus()
      .setImage({ src: url })
      .run();
      
    setImageUrl('');
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className={cn("border rounded-md overflow-hidden flex flex-col", className)}>
      {!readOnly && (
        <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-muted/50 sticky top-0 z-10">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.preventDefault(); // Prevent form submission
              editor.chain().focus().toggleBold().run();
            }}
            type="button" // Explicitly set button type to prevent form submission
            className={cn(editor.isActive('bold') ? 'bg-muted' : '')}
          >
            <Bold className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              editor.chain().focus().toggleItalic().run();
            }}
            type="button"
            className={cn(editor.isActive('italic') ? 'bg-muted' : '')}
          >
            <Italic className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={(e) => {
              e.preventDefault();
              editor.chain().focus().toggleUnderline().run();
            }}
            className={cn(editor.isActive('underline') ? 'bg-muted' : '')}
          >
            <UnderlineIcon className="h-4 w-4" />
          </Button>
          
          <div className="w-px h-6 bg-border mx-1"></div>
          
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={(e) => {
              e.preventDefault();
              editor.chain().focus().toggleHeading({ level: 1 }).run();
            }}
            className={cn(editor.isActive('heading', { level: 1 }) ? 'bg-muted' : '')}
          >
            <Heading1 className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={(e) => {
              e.preventDefault();
              editor.chain().focus().toggleHeading({ level: 2 }).run();
            }}
            className={cn(editor.isActive('heading', { level: 2 }) ? 'bg-muted' : '')}
          >
            <Heading2 className="h-4 w-4" />
          </Button>
          
          <div className="w-px h-6 bg-border mx-1"></div>
          
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={(e) => {
              e.preventDefault();
              editor.chain().focus().toggleBulletList().run();
            }}
            className={cn(editor.isActive('bulletList') ? 'bg-muted' : '')}
          >
            <List className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={(e) => {
              e.preventDefault();
              editor.chain().focus().toggleOrderedList().run();
            }}
            className={cn(editor.isActive('orderedList') ? 'bg-muted' : '')}
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
          
          <div className="w-px h-6 bg-border mx-1"></div>
          
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={(e) => {
              e.preventDefault();
              editor.chain().focus().setTextAlign('left').run();
            }}
            className={cn(editor.isActive({ textAlign: 'left' }) ? 'bg-muted' : '')}
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={(e) => {
              e.preventDefault();
              editor.chain().focus().setTextAlign('center').run();
            }}
            className={cn(editor.isActive({ textAlign: 'center' }) ? 'bg-muted' : '')}
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={(e) => {
              e.preventDefault();
              editor.chain().focus().setTextAlign('right').run();
            }}
            className={cn(editor.isActive({ textAlign: 'right' }) ? 'bg-muted' : '')}
          >
            <AlignRight className="h-4 w-4" />
          </Button>
          
          <div className="w-px h-6 bg-border mx-1"></div>
          
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={(e) => {
              e.preventDefault();
              editor.chain().focus().toggleBlockquote().run();
            }}
            className={cn(editor.isActive('blockquote') ? 'bg-muted' : '')}
          >
            <Quote className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={(e) => {
              e.preventDefault();
              editor.chain().focus().toggleCodeBlock().run();
            }}
            className={cn(editor.isActive('codeBlock') ? 'bg-muted' : '')}
          >
            <Code className="h-4 w-4" />
          </Button>
          
          <div className="w-px h-6 bg-border mx-1"></div>
          
          {/* Image button */}
          <AssetPickerButton
            accept="image"
            onSelect={(asset) => {
              if (Array.isArray(asset)) {
                // Just use the first asset if multiple are selected
                if (asset.length > 0) {
                  addImage(asset[0].url);
                }
              } else {
                addImage(asset.url);
              }
            }}
            variant="ghost"
            className="h-9 w-9 p-0"
          >
            <ImageIcon className="h-4 w-4" />
          </AssetPickerButton>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                type="button"
                className={cn(editor.isActive('link') ? 'bg-muted' : '')}
              >
                <LinkIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="flex flex-col gap-2">
                <h4 className="font-medium">Insert Link</h4>
                <Input
                  placeholder="Enter URL..."
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                />
                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setLinkUrl('');
                      editor.chain().focus().extendMarkRange('link').unsetLink().run();
                    }}
                    disabled={!editor.isActive('link')}
                  >
                    <X className="h-4 w-4 mr-2" /> Remove Link
                  </Button>
                  <Button 
                    size="sm"
                    onClick={setLink}
                  >
                    {editor.isActive('link') ? 'Update Link' : 'Add Link'}
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          
          <div className="w-px h-6 bg-border mx-1"></div>
          
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={(e) => {
              e.preventDefault();
              editor.chain().focus().setHorizontalRule().run();
            }}
          >
            <Minus className="h-4 w-4" />
          </Button>
        </div>
      )}

      {editor && (
        <BubbleMenu
          editor={editor}
          tippyOptions={{ duration: 150 }}
          shouldShow={({ editor, view, state }) => {
            // Log selection information for debugging
            console.log("Selection info:", {
              selection: state.selection,
              isImage: editor.isActive('image'),
              content: view.state.selection.content().size,
              nodeType: state.selection.$anchor.parent.type.name,
              hasText: view.state.doc.textBetween(
                state.selection.from,
                state.selection.to
              ).length > 0
            });
            
            // Don't show bubble menu for images - only for text selections
            // First check if image is active (selected)
            if (editor.isActive('image')) {
              console.log('Image is selected, hiding bubble menu');
              return false;
            }
            
            // Then ensure we have actual text content selected, not just a node selection
            const hasTextContent = view.state.doc.textBetween(
              state.selection.from,
              state.selection.to
            ).length > 0;
            
            // Finally, ensure standard conditions (not in code blocks)
            return !editor.isActive('code') && 
                   !editor.isActive('codeBlock') && 
                   view.state.selection.content().size > 0 &&
                   hasTextContent;
          }}
        >
          <div className="flex items-center rounded-lg bg-background border shadow-lg overflow-hidden">
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={(e) => {
                e.preventDefault();
                editor.chain().focus().toggleBold().run();
              }}
              className={cn(editor.isActive('bold') ? 'bg-muted' : '')}
            >
              <Bold className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={(e) => {
                e.preventDefault();
                editor.chain().focus().toggleItalic().run();
              }}
              className={cn(editor.isActive('italic') ? 'bg-muted' : '')}
            >
              <Italic className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={(e) => {
                e.preventDefault();
                editor.chain().focus().toggleUnderline().run();
              }}
              className={cn(editor.isActive('underline') ? 'bg-muted' : '')}
            >
              <UnderlineIcon className="h-4 w-4" />
            </Button>
            
            <div className="w-px h-6 bg-border"></div>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  className={cn(editor.isActive('link') ? 'bg-muted' : '')}
                >
                  <LinkIcon className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72">
                <div className="flex flex-col gap-2">
                  <h4 className="font-medium">Insert Link</h4>
                  <Input
                    placeholder="Enter URL..."
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                  />
                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setLinkUrl('');
                        editor.chain().focus().extendMarkRange('link').unsetLink().run();
                      }}
                      disabled={!editor.isActive('link')}
                    >
                      <X className="h-4 w-4 mr-2" /> Remove
                    </Button>
                    <Button 
                      size="sm"
                      onClick={setLink}
                    >
                      {editor.isActive('link') ? 'Update' : 'Add'}
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </BubbleMenu>
      )}
      
      <EditorContent 
        editor={editor} 
        className={cn(
          "prose max-w-none p-4 focus:outline-none min-h-[300px] max-h-[600px] overflow-y-auto flex-1",
          "prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl",
          "prose-p:my-2 prose-a:text-primary prose-blockquote:border-l-4 prose-blockquote:border-primary/30 prose-blockquote:pl-4 prose-blockquote:py-0.5 prose-blockquote:italic",
          "prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none",
          "prose-img:rounded-md prose-img:mx-auto"
        )}
      />
    </div>
  );
});

RichTextEditor.displayName = 'RichTextEditor';