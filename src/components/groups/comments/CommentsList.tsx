
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { User, CornerDownRight, Send } from 'lucide-react';

interface Comment {
  id: string;
  author: { id: string; name: string; avatar: string };
  content: string;
  timeAgo: string;
  replies: Array<{
    id: string;
    author: { id: string; name: string; avatar: string };
    content: string;
    timeAgo: string;
  }>;
}

interface CommentsListProps {
  comments: Comment[];
  replyingTo: string | null;
  setReplyingTo: (id: string | null) => void;
  replyText: string;
  setReplyText: (text: string) => void;
  onAddReply: (commentId: string) => void;
  disabled?: boolean;
}

export function CommentsList({ 
  comments, 
  replyingTo, 
  setReplyingTo, 
  replyText, 
  setReplyText, 
  onAddReply,
  disabled = false
}: CommentsListProps) {
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
                <p className="text-sm mt-1">{comment.content}</p>
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
                      placeholder="Napisz odpowiedź..." 
                      className="min-h-[36px] py-2 text-sm resize-none"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
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
              {comment.replies.length > 0 && (
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
  replies: Array<{
    id: string;
    author: { id: string; name: string; avatar: string };
    content: string;
    timeAgo: string;
  }>;
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
              <p className="text-xs mt-1">{reply.content}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
