import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRoute, Link } from 'wouter';
import { Helmet } from 'react-helmet-async';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MessageSquare, ThumbsUp, Share2, Bookmark, ChevronDown, ChevronUp, MoreHorizontal } from 'lucide-react';
import PublicLayout from '@/components/layout/PublicLayout';

// Demo images for placeholder
const demoImages = [
  '/uploads/96af7ed8-cd23-4f38-b2ed-9e03a54bc72b.png',
  '/uploads/08a69f11-51da-491a-a8d4-cedebb5f3d90.png',
  '/uploads/d03cc5f2-2997-4bde-9ebe-80894b10adbd.png',
  '/uploads/e51dde8b-a72e-4c15-b668-d0e6d9aae7ec.png',
];

// Mock comment type for demo
interface Comment {
  id: number;
  text: string;
  author: {
    name: string;
    avatarUrl?: string;
  };
  date: string;
  likes: number;
  replies?: Comment[];
}

const BlogDetail: React.FC = () => {
  const [, params] = useRoute('/blogs/:id');
  const articleId = params?.id;
  
  // State for comment form
  const [commentText, setCommentText] = useState('');
  const [expandedComments, setExpandedComments] = useState<number[]>([]);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');

  // Fetch article details
  const { data: article, isLoading, error } = useQuery({
    queryKey: [`/api/articles/${articleId}/public`],
    queryFn: async () => {
      try {
        const res = await fetch(`/api/articles/${articleId}/public`);
        if (!res.ok) throw new Error('Failed to fetch article');
        return await res.json();
      } catch (error) {
        console.error('Error fetching article:', error);
        return null;
      }
    }
  });

  // Mock comments for demo
  const comments: Comment[] = [
    {
      id: 1,
      text: "This is a fascinating exploration of Indian ethical traditions. I particularly appreciated the analysis of how dharma differs from Western deontological approaches.",
      author: { name: "Sarah Johnson" },
      date: "2 days ago",
      likes: 12,
      replies: [
        {
          id: 101,
          text: "I agree! The contextual nature of dharma offers a more flexible ethical framework than Kantian universalism.",
          author: { name: "David Chen" },
          date: "1 day ago",
          likes: 4,
          replies: [
            {
              id: 1001,
              text: "That's a great point. The situational ethics in Indian philosophy feels more practical for real-world dilemmas.",
              author: { name: "Aisha Patel" },
              date: "1 day ago",
              likes: 2
            }
          ]
        },
        {
          id: 102,
          text: "Could you recommend any accessible introductory texts on Indian ethics for someone coming from a Western philosophical background?",
          author: { name: "Michael Thompson" },
          date: "1 day ago",
          likes: 3
        }
      ]
    },
    {
      id: 2,
      text: "I would have liked to see more discussion of how these ethical frameworks operate in contemporary Indian society. Has there been research on this?",
      author: { name: "Priya Sharma" },
      date: "3 days ago",
      likes: 8,
      replies: [
        {
          id: 201,
          text: "There's actually fascinating work being done on this by scholars like Chakravarthi Ram-Prasad and Arindam Chakrabarti. They examine how traditional ethical concepts are being applied to modern issues like environmental ethics and bioethics.",
          author: { name: "James Wilson" },
          date: "2 days ago",
          likes: 6
        }
      ]
    },
    {
      id: 3,
      text: "The section on Buddhist ethics was particularly illuminating. I hadn't considered how the psychological dimension of Buddhist moral thought could contribute to contemporary discussions in moral psychology.",
      author: { name: "Emily Rodriguez" },
      date: "4 days ago",
      likes: 15
    }
  ];

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long', 
      day: 'numeric'
    });
  }

  function getInitials(name: string) {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  }

  const toggleExpandComment = (commentId: number) => {
    setExpandedComments(prev => 
      prev.includes(commentId) 
        ? prev.filter(id => id !== commentId)
        : [...prev, commentId]
    );
  };

  const toggleReplyForm = (commentId: number | null) => {
    if (replyingTo === commentId) {
      setReplyingTo(null);
      setReplyText('');
    } else {
      setReplyingTo(commentId);
      setReplyText('');
    }
  };

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    // This would normally send to a server
    console.log('New comment:', commentText);
    setCommentText('');
    // Show success message or update UI accordingly
  };

  const handleSubmitReply = (e: React.FormEvent, parentId: number) => {
    e.preventDefault();
    // This would normally send to a server
    console.log(`New reply to comment ${parentId}:`, replyText);
    setReplyingTo(null);
    setReplyText('');
    // Show success message or update UI accordingly
  };

  // Recursive component for comments and their replies
  const CommentComponent = ({ comment, level = 0 }: { comment: Comment, level?: number }) => {
    const isExpanded = expandedComments.includes(comment.id);
    const hasReplies = comment.replies && comment.replies.length > 0;
    
    return (
      <div className={`${level > 0 ? 'ml-8 mt-4 border-l-2 border-gray-200 pl-4' : 'mt-6'}`}>
        <div className="flex gap-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={comment.author.avatarUrl} alt={comment.author.name} />
            <AvatarFallback>{getInitials(comment.author.name)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex justify-between">
              <div>
                <h4 className="font-semibold">{comment.author.name}</h4>
                <p className="text-sm text-gray-500">{comment.date}</p>
              </div>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
            <p className="mt-2 text-gray-700">{comment.text}</p>
            <div className="mt-2 flex items-center gap-4">
              <Button variant="ghost" size="sm" className="flex items-center gap-1">
                <ThumbsUp className="h-4 w-4" />
                <span>{comment.likes}</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex items-center gap-1"
                onClick={() => toggleReplyForm(comment.id)}
              >
                <MessageSquare className="h-4 w-4" />
                <span>Reply</span>
              </Button>
            </div>
            
            {/* Reply form */}
            {replyingTo === comment.id && (
              <form onSubmit={(e) => handleSubmitReply(e, comment.id)} className="mt-3">
                <Textarea
                  placeholder="Write a reply..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="min-h-[80px]"
                />
                <div className="mt-2 flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => toggleReplyForm(null)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={!replyText.trim()}>
                    Reply
                  </Button>
                </div>
              </form>
            )}
            
            {/* Show/hide replies button */}
            {hasReplies && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 flex items-center gap-1 text-primary"
                onClick={() => toggleExpandComment(comment.id)}
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="h-4 w-4" />
                    <span>Hide replies ({comment.replies!.length})</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    <span>Show replies ({comment.replies!.length})</span>
                  </>
                )}
              </Button>
            )}
            
            {/* Replies */}
            {isExpanded && hasReplies && (
              <div className="mt-2">
                {comment.replies!.map(reply => (
                  <CommentComponent key={reply.id} comment={reply} level={level + 1} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // If loading or error
  if (isLoading) {
    return (
      <PublicLayout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
          <div className="flex justify-center items-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-600"></div>
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (error || !article) {
    return (
      <PublicLayout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Article not found</h1>
            <p className="mt-4 text-gray-600">The article you're looking for does not exist or has been removed.</p>
            <Link href="/blogs">
              <Button className="mt-8 bg-rose-600 hover:bg-rose-700">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Blogs
              </Button>
            </Link>
          </div>
        </div>
      </PublicLayout>
    );
  }

  const { article: articleData, categories = [], tags = [] } = article;

  return (
    <PublicLayout>
      <Helmet>
        <title>{articleData.title} | BlogCMS</title>
        <meta name="description" content={articleData.excerpt} />
      </Helmet>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back button */}
        <div className="mb-8">
          <Link href="/blogs">
            <Button variant="outline" className="flex items-center gap-1">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Blogs</span>
            </Button>
          </Link>
        </div>
        
        {/* Article header */}
        <div className="max-w-4xl mx-auto mb-10">
          <div className="flex items-center gap-3 mb-4">
            {categories.map((category: any) => (
              <Badge key={category.id} variant="outline" className="bg-gray-100">
                {category.name}
              </Badge>
            ))}
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            {articleData.title}
          </h1>
          
          <div className="flex items-center mb-8">
            <Avatar className="h-12 w-12 mr-4">
              <AvatarImage src={articleData.author?.avatarUrl} alt={articleData.author?.name} />
              <AvatarFallback>{articleData.author?.name ? getInitials(articleData.author.name) : 'A'}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{articleData.author?.name || 'Anonymous'}</p>
              <p className="text-sm text-gray-500">
                {formatDate(articleData.createdAt.toString())} • {Math.ceil(articleData.content.length / 1000)} min read
              </p>
            </div>
          </div>
        </div>
        
        {/* Featured image */}
        {articleData.featuredImage && (
          <div className="max-w-5xl mx-auto mb-12 rounded-lg overflow-hidden">
            <img 
              src={articleData.featuredImage} 
              alt={articleData.title} 
              className="w-full h-[400px] object-cover"
            />
          </div>
        )}
        
        {/* Article content */}
        <div className="max-w-4xl mx-auto">
          <div 
            className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700"
            dangerouslySetInnerHTML={{ __html: articleData.content }}
          />
          
          {/* Tags */}
          {tags.length > 0 && (
            <div className="mt-12 flex flex-wrap gap-2">
              {tags.map((tag: any) => (
                <Badge key={tag.id} variant="secondary">
                  #{tag.name}
                </Badge>
              ))}
            </div>
          )}
          
          {/* Article actions */}
          <div className="mt-12 flex justify-between items-center py-4 border-t border-b">
            <div className="flex gap-6">
              <Button variant="ghost" className="flex items-center gap-1">
                <ThumbsUp className="h-5 w-5" />
                <span>Like</span>
              </Button>
              <Button 
                variant="ghost" 
                className="flex items-center gap-1"
                onClick={() => document.getElementById('comments-section')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <MessageSquare className="h-5 w-5" />
                <span>Comment</span>
              </Button>
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" size="icon">
                <Share2 className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Bookmark className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          {/* Author info */}
          <div className="mt-12">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-6">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={articleData.author?.avatarUrl} alt={articleData.author?.name} />
                    <AvatarFallback className="text-lg">{articleData.author?.name ? getInitials(articleData.author.name) : 'A'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-bold mb-2">{articleData.author?.name || 'Anonymous'}</h3>
                    <p className="text-gray-700 mb-4">
                      {articleData.author?.bio || 'Academic researcher and writer specializing in philosophy and ethics.'}
                    </p>
                    <Button variant="outline">View Profile</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Related articles would go here */}
          
          {/* Comments section */}
          <div id="comments-section" className="mt-16">
            <h2 className="text-2xl font-bold mb-6">Comments</h2>
            
            {/* Comment form */}
            <form onSubmit={handleSubmitComment}>
              <Textarea
                placeholder="Write your comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="min-h-[120px]"
              />
              <div className="mt-3 flex justify-end">
                <Button type="submit" className="bg-rose-600 hover:bg-rose-700" disabled={!commentText.trim()}>
                  Post Comment
                </Button>
              </div>
            </form>
            
            <Separator className="my-8" />
            
            {/* Comments */}
            <div>
              {comments.map(comment => (
                <CommentComponent key={comment.id} comment={comment} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default BlogDetail;