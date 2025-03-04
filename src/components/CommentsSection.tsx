
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useSocial } from '@/contexts/SocialContext';
import { Comment } from '@/types/social';
import { CommentItem } from './comments/CommentItem';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '@/components/ui/use-toast';

interface CommentsSectionProps {
  postId: string;
  onClose?: () => void;
  embedded?: boolean;
}

export function CommentsSection({ postId, onClose, embedded = false }: CommentsSectionProps) {
  const { getPostComments, loading } = useSocial();
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
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
  
  return (
    <div className={`bg-background w-full overflow-hidden flex flex-col ${embedded ? '' : 'rounded-lg'}`}>
      {!embedded && (
        <div className="px-4 py-3 border-b flex justify-between items-center">
          <h3 className="font-semibold text-sm">Komentarze</h3>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose} type="button" className="h-7 w-7 p-0 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
              <X className="h-4 w-4" />
              <span className="sr-only">Zamknij</span>
            </Button>
          )}
        </div>
      )}
      
      <div className={`overflow-y-auto ${embedded ? 'max-h-[400px]' : 'max-h-[300px]'} ${embedded ? '' : 'px-4'} py-2 space-y-2`}>
        {isLoading ? (
          <div className="flex justify-center p-2 text-sm">Ładowanie komentarzy...</div>
        ) : comments.length === 0 ? (
          <div className="text-center py-4 text-rhythm-500 text-sm">
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
                transition={{ duration: 0.2 }}
              >
                <CommentItem comment={comment} />
                <Separator className="my-1" />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
