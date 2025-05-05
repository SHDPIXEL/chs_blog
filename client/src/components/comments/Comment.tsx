import { useState, useEffect } from "react";
import { Comment } from "@shared/schema";
import { createInitialsAvatar } from "@/lib/avatarUtils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { MessageSquare } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { UserRole } from "@shared/schema";
import { getFormatDistanceToNow } from "@/utils/distanceToNow";

// Comment already has an optional replyCount property from schema.ts
interface CommentProps {
  comment: Comment;
  articleId: number;
  isReply?: boolean;
}

export function CommentComponent({
  comment,
  articleId,
  isReply = false,
}: CommentProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [replyAuthorName, setReplyAuthorName] = useState("");
  const [replyAuthorEmail, setReplyAuthorEmail] = useState("");
  const [replies, setReplies] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingReplies, setIsLoadingReplies] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();

  // Format the date nicely
  const formattedDate = comment.createdAt
    ? getFormatDistanceToNow(comment.createdAt)
    : "";

  // Generate avatar from author name
  const avatarUrl = createInitialsAvatar(comment.authorName);

  // Check for replies on initial render for reply comments
  useEffect(() => {
    // For replies that might have their own replies, we need to check if they have replies
    if (
      isReply &&
      (comment.replyCount === undefined || comment.replyCount === null)
    ) {
      const checkForReplies = async () => {
        try {
          const res = await apiRequest(
            "GET",
            `/api/comments/${comment.id}/replies`,
          );
          const fetchedReplies = await res.json();
          if (fetchedReplies.length > 0) {
            // If we found replies, store them
            setReplies(fetchedReplies);
          }
        } catch (error) {
          console.error("Error checking for replies", error);
        }
      };

      checkForReplies();
    }
  }, [comment.id, isReply, comment.replyCount]);

  // Auto-fill name and email fields if user is authenticated and reply form shown
  useEffect(() => {
    if (showReplyForm && isAuthenticated && user) {
      // Add role label for admins and authors
      const roleLabel =
        user.role === UserRole.ADMIN
          ? "[Admin] "
          : user.role === UserRole.AUTHOR
            ? "[Author] "
            : "";

      setReplyAuthorName(`${roleLabel}${user.name}`);
      setReplyAuthorEmail(user.email);
    }
  }, [showReplyForm, isAuthenticated, user]);

  // Load replies when user clicks to show them
  const loadReplies = async () => {
    if (!showReplies) {
      setIsLoadingReplies(true);
      try {
        const res = await apiRequest(
          "GET",
          `/api/comments/${comment.id}/replies`,
        );
        const fetchedReplies = await res.json();
        setReplies(fetchedReplies);
        setShowReplies(true);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load replies",
          variant: "destructive",
        });
      } finally {
        setIsLoadingReplies(false);
      }
    } else {
      // If replies are already shown, just toggle visibility
      setShowReplies(false);
    }
  };

  // Submit a reply to this comment
  const submitReply = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !replyContent.trim() ||
      !replyAuthorName.trim() ||
      !replyAuthorEmail.trim()
    ) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const res = await apiRequest(
        "POST",
        `/api/articles/${articleId}/comments`,
        {
          content: replyContent,
          authorName: replyAuthorName,
          authorEmail: replyAuthorEmail,
          articleId: articleId,
          parentId: comment.id,
        },
      );

      const newReply = await res.json();

      // Explicitly reload all replies to ensure correct nesting structure
      const repliesRes = await apiRequest(
        "GET",
        `/api/comments/${comment.id}/replies`,
      );
      const updatedReplies = await repliesRes.json();
      setReplies(updatedReplies);

      // Make sure replies are visible
      setShowReplies(true);

      // Reset the reply content
      setReplyContent("");

      // Only clear author fields if not authenticated
      if (!isAuthenticated) {
        setReplyAuthorName("");
        setReplyAuthorEmail("");
      }

      // Close the reply form
      setShowReplyForm(false);

      toast({
        title: "Reply Posted",
        description: "Your reply has been posted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to post your reply",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`border rounded-lg p-4 mb-4 ${isReply ? "ml-12" : ""}`}>
      <div className="flex items-start gap-3">
        <div
          className="rounded-full w-10 h-10 flex items-center justify-center bg-no-repeat bg-cover bg-center"
          style={{ backgroundImage: `url(${avatarUrl})` }}
        />

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-bold">{comment.authorName}</h4>
            <span className="text-sm text-gray-500">{formattedDate}</span>
          </div>

          <div className="mt-2">{comment.content}</div>

          <div className="mt-4 flex gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowReplyForm(!showReplyForm)}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Reply
            </Button>

            {/* Show replies button - regardless of whether this is a reply or top-level comment */}
            {((comment.replyCount ?? 0) > 0 || replies.length > 0) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={loadReplies}
                disabled={isLoadingReplies}
              >
                {isLoadingReplies
                  ? "Loading..."
                  : showReplies
                    ? `Hide Replies (${replies.length})`
                    : `Show Replies (${comment.replyCount ?? replies.length})`}
              </Button>
            )}
          </div>

          {showReplyForm && (
            <form onSubmit={submitReply} className="mt-4 space-y-4">
              {isAuthenticated && user && (
                <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded-md">
                  <p>
                    Replying as <strong>{user.name}</strong> ({user.role})
                  </p>
                </div>
              )}
              <div>
                <Textarea
                  placeholder="Write your reply..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  className="w-full p-2 border bg-white rounded-md  focus:outline-none focus:ring-2 focus:ring-[#CC0033] text-base leading-relaxed font-sans placeholder:text-base placeholder:font-sans

                  "
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <input
                    type="text"
                    placeholder="Your Name"
                    value={replyAuthorName}
                    onChange={(e) => setReplyAuthorName(e.target.value)}
                    className="w-full p-2 border bg-white rounded-md  focus:outline-none focus:ring-2 focus:ring-[#CC0033] text-base leading-relaxed font-sans placeholder:text-base placeholder:font-sans

                    "
                    required
                  />
                </div>

                <div>
                  <input
                    type="email"
                    placeholder="Your Email"
                    value={replyAuthorEmail}
                    onChange={(e) => setReplyAuthorEmail(e.target.value)}
                    className="w-full p-2 border bg-white rounded-md  focus:outline-none focus:ring-2 focus:ring-[#CC0033] text-base leading-relaxed font-sans placeholder:text-base placeholder:font-sans

                    "
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Posting..." : "Post Reply"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowReplyForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}

          {showReplies && replies.length > 0 && (
            <div className="mt-4 space-y-4">
              {replies.map((reply) => (
                <CommentComponent
                  key={reply.id}
                  comment={reply}
                  articleId={articleId}
                  isReply={true}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
