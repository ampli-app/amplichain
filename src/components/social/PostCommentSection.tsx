
import { CommentInput } from '@/components/groups/comments/CommentInput';
import { CommentsList } from '@/components/groups/comments/CommentsList';
import { Comment } from '@/utils/commentUtils';

interface PostCommentSectionProps {
  showComments: boolean;
  commentText: string;
  setCommentText: (text: string) => void;
  onAddComment: () => void;
  comments: Comment[];
  loadingComments: boolean;
  replyingTo: string | null;
  setReplyingTo: (id: string | null) => void;
  replyText: string;
  setReplyText: (text: string) => void;
  onAddReply: (commentId: string) => void;
  disabled: boolean;
}

export function PostCommentSection({
  showComments,
  commentText,
  setCommentText,
  onAddComment,
  comments,
  loadingComments,
  replyingTo,
  setReplyingTo,
  replyText,
  setReplyText,
  onAddReply,
  disabled
}: PostCommentSectionProps) {
  
  // Funkcja do dodawania komentarza z konwersją emotikon
  const handleAddComment = () => {
    // Wywołanie oryginalnej funkcji dodawania komentarza
    onAddComment();
  };
  
  // Funkcja do dodawania odpowiedzi z konwersją emotikon
  const handleAddReply = (commentId: string) => {
    // Wywołanie oryginalnej funkcji dodawania odpowiedzi
    onAddReply(commentId);
  };
  
  return (
    <div className="mt-4 pt-3 border-t">
      <CommentInput 
        onAddComment={handleAddComment}
        commentText={commentText}
        setCommentText={setCommentText}
        disabled={disabled}
      />
      
      {/* Comments section - expandable */}
      {(showComments) && (
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
          ) : comments.length > 0 ? (
            <CommentsList 
              comments={comments}
              replyingTo={replyingTo}
              setReplyingTo={setReplyingTo}
              replyText={replyText}
              setReplyText={setReplyText}
              onAddReply={handleAddReply}
              disabled={disabled}
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
