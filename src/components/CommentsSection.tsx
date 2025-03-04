
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useSocial } from '@/contexts/SocialContext';
import { Comment } from '@/types/social';
import { CommentItem } from './CommentItem';
import { Send } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from '@/components/ui/use-toast';
import { DialogTitle } from '@/components/ui/dialog';

interface CommentsSectionProps {
  postId: string;
  onClose?: () => void;
}

export function CommentsSection({ postId, onClose }: CommentsSectionProps) {
  const { commentOnPost, getPostComments, loading } = useSocial();
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [commentContent, setCommentContent] = useState('');
  
  useEffect(() => {
    loadComments();
  }, [postId]);
  
  const loadComments = async () => {
    setIsLoading(true);
    try {
      console.log("Ładowanie komentarzy dla posta:", postId);
      const fetchedComments = await getPostComments(postId);
      console.log("Pobrane komentarze:", fetchedComments);
      setComments(fetchedComments);
    } catch (err) {
      console.error("Błąd podczas ładowania komentarzy:", err);
      toast({
        title: "Błąd",
        description: "Nie można załadować komentarzy. Spróbuj ponownie później.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSubmitComment = async () => {
    if (!commentContent.trim() || loading) return;
    
    try {
      await commentOnPost(postId, commentContent);
      setCommentContent('');
      // Odśwież komentarze
      await loadComments();
      toast({
        title: "Sukces",
        description: "Komentarz został dodany",
      });
    } catch (err) {
      console.error("Błąd podczas dodawania komentarza:", err);
      toast({
        title: "Błąd",
        description: "Nie udało się dodać komentarza",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="bg-background rounded-lg max-w-lg w-full mx-auto overflow-hidden flex flex-col">
      <div className="p-4 border-b flex justify-between items-center">
        <DialogTitle className="font-semibold text-lg">Komentarze</DialogTitle>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            Zamknij
          </Button>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto max-h-[400px] p-4 space-y-2">
        {isLoading ? (
          <div className="flex justify-center p-4">Ładowanie komentarzy...</div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-rhythm-500">
            Brak komentarzy. Napisz pierwszy komentarz!
          </div>
        ) : (
          comments.map((comment) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <CommentItem comment={comment} />
              <Separator className="my-2" />
            </motion.div>
          ))
        )}
      </div>
      
      <div className="p-4 border-t bg-background">
        <div className="flex items-end gap-2">
          <Textarea
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
            placeholder="Napisz komentarz..."
            className="flex-1 min-h-[60px]"
            disabled={loading}
          />
          <Button
            onClick={handleSubmitComment}
            disabled={!commentContent.trim() || loading}
            size="icon"
            className="h-10 w-10 flex-shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
