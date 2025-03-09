
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { User, CornerDownRight, Send } from 'lucide-react';
import { convertEmoticons, convertEmoticonOnInput } from '@/utils/emoticonUtils';
import { Comment } from '@/utils/commentUtils';
import { useRef } from 'react';

interface CommentsListProps {
  comments: Comment[];
  loadingComments?: boolean;
  replyingTo: string | null;
  setReplyingTo: (id: string | null) => void;
  replyText: string;
  setReplyText: (text: string) => void;
  onAddReply: (commentId: string) => void;
  disabled?: boolean;
}

export function CommentsList({ 
  comments, 
  loadingComments,
  replyingTo, 
  setReplyingTo, 
  replyText, 
  setReplyText, 
  onAddReply,
  disabled = false
}: CommentsListProps) {
  const replyTextareaRef = useRef<HTMLTextAreaElement>(null);
  const [cursorPosition, setCursorPosition] = useState(0);

  const handleReplyTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    const currentPosition = e.target.selectionStart || 0;
    setCursorPosition(currentPosition);
    
    // Konwertuj emotikony podczas pisania
    const { text, newPosition } = convertEmoticonOnInput(newContent, currentPosition);
    
    if (text !== newContent) {
      setReplyText(text);
      // Ustaw kursor na odpowiedniej pozycji w następnym cyklu renderowania
      setTimeout(() => {
        if (replyTextareaRef.current) {
          replyTextareaRef.current.selectionStart = newPosition;
          replyTextareaRef.current.selectionEnd = newPosition;
          setCursorPosition(newPosition);
        }
      }, 0);
    } else {
      setReplyText(newContent);
    }
  };

  if (loadingComments) {
    return (
      <div className="space-y-4 text-center py-4">
        <div className="animate-pulse space-y-2">
          <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
          <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-4">
        Brak komentarzy. Bądź pierwszy!
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-4">
      {comments.map((comment) => (
        <div key={comment.id} className="pb-3">
          <div className="flex gap-3">
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
              <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                <div className="flex justify-between items-start">
                  <h4 className="font-medium text-sm">{comment.author.name}</h4>
                  <span className="text-xs text-rhythm-500">{comment.timeAgo}</span>
                </div>
                <p className="text-sm mt-1">{convertEmoticons(comment.content)}</p>
              </div>
              
              <div className="flex gap-4 mt-1 ml-1">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                >
                  Odpowiedz
                </Button>
              </div>
              
              {/* Reply input */}
              {replyingTo === comment.id && (
                <div className="mt-2 flex gap-2">
                  <div className="w-8 flex justify-center">
                    <CornerDownRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 flex gap-2">
                    <Textarea 
                      ref={replyTextareaRef}
                      placeholder="Napisz odpowiedź..." 
                      className="min-h-[36px] py-2 text-sm resize-none"
                      value={replyText}
                      onChange={handleReplyTextChange}
                      disabled={disabled}
                    />
                    <Button 
                      size="sm" 
                      className="h-9 px-3 self-end"
                      onClick={() => onAddReply(comment.id)}
                      disabled={!replyText.trim() || disabled}
                    >
                      <Send className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
              
              {/* Replies */}
              {comment.replies && comment.replies.length > 0 && (
                <CommentReplies replies={comment.replies} />
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

interface CommentRepliesProps {
  replies: Comment[];
}

function CommentReplies({ replies }: CommentRepliesProps) {
  return (
    <div className="mt-2 space-y-3 pl-4">
      {replies.map((reply) => (
        <div key={reply.id} className="flex gap-3">
          <Avatar className="h-6 w-6 flex-shrink-0">
            <AvatarImage src={reply.author.avatar} alt={reply.author.name} />
            <AvatarFallback><User className="h-3 w-3" /></AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-lg">
              <div className="flex justify-between items-start">
                <h5 className="font-medium text-xs">{reply.author.name}</h5>
                <span className="text-xs text-rhythm-500">{reply.timeAgo}</span>
              </div>
              <p className="text-xs mt-1">{convertEmoticons(reply.content)}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
