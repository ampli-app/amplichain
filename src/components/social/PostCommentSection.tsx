
import { CommentInput } from '@/components/groups/comments/CommentInput';
import { CommentsList } from '@/components/groups/comments/CommentsList';
import { Comment } from '@/utils/commentUtils';
import { useState, useEffect } from 'react';
import { usePostComments } from '@/hooks/usePostComments';

interface PostCommentSectionProps {
  postId: string;
  showComments: boolean;
  newComment: string;
  setNewComment: (text: string) => void;
  commentLoading: boolean;
  replyingTo: string | null;
  setReplyingTo: (id: string | null) => void;
  replyText: string;
  setReplyText: (text: string) => void;
  onAddComment: () => Promise<void | boolean>;
  onAddReply: (commentId: string) => Promise<void | boolean>;
}

export function PostCommentSection({
  postId,
  showComments,
  newComment,
  setNewComment,
  commentLoading,
  replyingTo,
  setReplyingTo,
  replyText,
  setReplyText,
  onAddComment,
  onAddReply
}: PostCommentSectionProps) {
  // Użyj hooka do pobierania komentarzy
  const { comments, loading: loadingComments } = usePostComments(postId, showComments);
  
  // Funkcja do dodawania komentarza
  const handleAddComment = () => {
    onAddComment();
  };
  
  // Funkcja do dodawania odpowiedzi
  const handleAddReply = (commentId: string) => {
    onAddReply(commentId);
  };
  
  return (
    <div className="mt-4 pt-3 border-t">
      <CommentInput 
        onAddComment={handleAddComment}
        commentText={newComment}
        setCommentText={setNewComment}
        disabled={commentLoading}
      />
      
      {/* Comments section - expandable */}
      {showComments && (
        <>
          {loadingComments ? (
            <div className="mt-4 space-y-4">
              {[1, 2].map(i => (
                <div key={i} className="animate-pulse flex gap-3">
                  <div className="rounded-full bg-gray-200 dark:bg-gray-700 h-8 w-8"></div>
                  <div className="flex-1">
                    <div className="bg-gray-200 dark:bg-gray-700 h-24 rounded-lg mb-2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : comments && comments.length > 0 ? (
            <CommentsList 
              comments={comments}
              replyingTo={replyingTo}
              setReplyingTo={setReplyingTo}
              replyText={replyText}
              setReplyText={setReplyText}
              onAddReply={handleAddReply}
              disabled={commentLoading}
            />
          ) : (
            <div className="text-center py-4 text-sm text-muted-foreground">
              Brak komentarzy. Bądź pierwszy!
            </div>
          )}
        </>
      )}
    </div>
  );
}
