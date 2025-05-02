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
const ResizableImageComponent = ({ node, updateAttributes }: any) => {
  const [size, setSize] = useState({
    width: node.attrs.width || 'auto',
    height: node.attrs.height || 'auto',
  });

  const [resizeDirection, setResizeDirection] = useState<string | null>(null);
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
  const [startSize, setStartSize] = useState({ width: 0, height: 0 });
  const [imageNaturalSize, setImageNaturalSize] = useState({ width: 0, height: 0 });
  const imageRef = React.useRef<HTMLImageElement>(null);

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
        className={`relative inline-block ${resizeDirection ? 'select-none' : ''}`}
        style={{ width: size.width, height: size.height }}
      >
        <img
          ref={imageRef}
          src={node.attrs.src}
          alt=""
          onLoad={handleImageLoad}
          className="max-w-full h-auto object-contain rounded-md"
          style={{ width: '100%', height: '100%' }}
        />
        
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
  
  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    getHTML: () => editor ? editor.getHTML() : ''
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
    <div className={cn("border rounded-md overflow-hidden", className)}>
      {!readOnly && (
        <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-muted/50">
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
          shouldShow={({ editor, view }) => {
            // Show the bubble menu only if there's text selected
            return !editor.isActive('code') && !editor.isActive('codeBlock') && view.state.selection.content().size > 0;
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
          "prose max-w-none p-4 focus:outline-none min-h-[300px]",
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