import { useState, useEffect } from 'react';
import { Comment } from '@shared/schema';
import { CommentComponent } from './Comment';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Loader2 } from 'lucide-react';

interface CommentsListProps {
  articleId: number;
}

export function CommentsList({ articleId }: CommentsListProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [authorEmail, setAuthorEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Load comments on mount
  useEffect(() => {
    fetchComments();
  }, [articleId]);

  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const res = await apiRequest('GET', `/api/articles/${articleId}/comments`);
      const data = await res.json();
      setComments(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load comments',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim() || !authorName.trim() || !authorEmail.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      const res = await apiRequest('POST', `/api/articles/${articleId}/comments`, {
        content: newComment,
        authorName,
        authorEmail,
        articleId,
      });
      
      const comment = await res.json();
      
      // Add new comment to the list
      setComments([...comments, comment]);
      
      // Reset form
      setNewComment('');
      setAuthorName('');
      setAuthorEmail('');
      
      toast({
        title: 'Comment Posted',
        description: 'Your comment has been posted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to post your comment',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="my-8">
      <h3 className="text-2xl font-bold mb-6">Comments</h3>
      
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        </div>
      ) : (
        <>
          {comments.length === 0 ? (
            <p className="text-gray-500 mb-8">No comments yet. Be the first to comment!</p>
          ) : (
            <div className="space-y-4 mb-8">
              {comments.map((comment) => (
                <CommentComponent
                  key={comment.id}
                  comment={comment}
                  articleId={articleId}
                />
              ))}
            </div>
          )}
          
          <div className="bg-gray-50 p-6 rounded-lg">
            <h4 className="text-xl font-semibold mb-4">Leave a Comment</h4>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Textarea
                  placeholder="Write your comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <input
                    type="text"
                    placeholder="Your Name"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    className="w-full p-2 border rounded-md"
                    required
                  />
                </div>
                
                <div>
                  <input
                    type="email"
                    placeholder="Your Email (not published)"
                    value={authorEmail}
                    onChange={(e) => setAuthorEmail(e.target.value)}
                    className="w-full p-2 border rounded-md"
                    required
                  />
                </div>
              </div>
              
              <div>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Posting...' : 'Post Comment'}
                </Button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}