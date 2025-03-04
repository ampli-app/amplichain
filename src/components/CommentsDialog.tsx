
import { Button } from "@/components/ui/button";
import { CommentsSection } from "./CommentsSection";
import { MessageCircle } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CommentsDialogProps {
  postId: string;
  commentsCount: number;
}

export function CommentsDialog({ postId, commentsCount }: CommentsDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <Button 
        variant="ghost" 
        size="sm" 
        className="flex items-center gap-1.5 h-8 px-2.5"
        type="button"
        onClick={(e) => {
          e.preventDefault();
          setIsOpen(!isOpen);
        }}
      >
        <MessageCircle className="h-4 w-4" />
        <span>{commentsCount}</span>
      </Button>
      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 bg-black/20 z-50" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[calc(100vw-2rem)] max-w-lg bg-background rounded-lg shadow-lg overflow-hidden"
            >
              <CommentsSection 
                postId={postId} 
                onClose={() => setIsOpen(false)} 
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
