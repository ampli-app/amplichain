
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useSocial } from '@/contexts/SocialContext';
import { Comment } from '@/types/social';
import { CommentItem } from './comments/CommentItem';
import { Send, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '@/components/ui/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { pl } from 'date-fns/locale';

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
      
      // Only show info toast if there's no error and no comments
      if (!fetchedComments || fetchedComments.length === 0) {
        toast({
          title: "Informacja",
          description: "Brak komentarzy dla tego posta.",
        });
      }
    } catch (err) {
      console.error("Błąd podczas ładowania komentarzy:", err);
      toast({
        title: "Błąd",
        description: "Nie można załadować komentarzy. Spróbuj ponownie później.",
        variant: "destructive",
      });
      // Clear comments in case of error
      setComments([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSubmitComment = async () => {
    if (!commentContent.trim() || loading) return;
    
    try {
      // Dodanie optymistycznego komentarza do UI
      const optimisticComment: Comment = {
        id: 'temp-' + Date.now(),
        content: commentContent,
        postId,
        userId: 'current-user', // będzie zastąpione właściwym ID
        author: {
          name: 'Ty',
          avatar: '/placeholder.svg',
          role: ''
        },
        likes: 0,
        hasLiked: false,
        replies: 0,
        createdAt: new Date().toISOString(),
        timeAgo: formatDistanceToNow(new Date(), { addSuffix: true, locale: pl }),
        isOptimistic: true
      };
      
      setComments(prev => [optimisticComment, ...prev]);
      const content = commentContent;
      setCommentContent('');
      
      await commentOnPost(postId, content);
      // Po udanym dodaniu, odświeżamy listę komentarzy
      await loadComments();
    } catch (err) {
      console.error("Błąd podczas dodawania komentarza:", err);
      // Usuwamy optymistyczny komentarz w przypadku błędu
      setComments(prev => prev.filter(c => !c.isOptimistic));
      setCommentContent(commentContent);
      
      toast({
        title: "Błąd",
        description: "Nie udało się dodać komentarza",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="bg-background w-full overflow-hidden flex flex-col">
      <div className="p-3 border-b flex justify-between items-center">
        <h3 className="font-semibold text-lg">Komentarze</h3>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose} type="button">
            <X className="h-4 w-4" />
            <span className="sr-only">Zamknij</span>
          </Button>
        )}
      </div>
      
      <div className="p-3 border-b bg-background">
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
            type="button"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="overflow-y-auto max-h-[400px] p-3 space-y-2">
        {isLoading ? (
          <div className="flex justify-center p-4">Ładowanie komentarzy...</div>
        ) : comments.length === 0 ? (
          <div className="text-center py-6 text-rhythm-500">
            Brak komentarzy. Napisz pierwszy komentarz!
          </div>
        ) : (
          <AnimatePresence>
            {comments.map((comment) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <CommentItem comment={comment} />
                <Separator className="my-2" />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
