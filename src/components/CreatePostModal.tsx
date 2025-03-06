
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { FeedPostCreate } from './social/FeedPostCreate';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreatePostModal({ isOpen, onClose }: CreatePostModalProps) {
  const [open, setOpen] = useState(isOpen);
  
  useEffect(() => {
    setOpen(isOpen);
  }, [isOpen]);
  
  const handleClose = () => {
    setOpen(false);
    onClose();
  };
  
  const handlePostCreated = () => {
    // Automatycznie zamknij modal po pomyślnym utworzeniu posta
    handleClose();
    // Odśwież stronę, aby pokazać nowy post
    window.location.reload();
  };
  
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md md:max-w-lg">
        <DialogTitle className="text-xl mb-4">Utwórz nowy post</DialogTitle>
        <FeedPostCreate onPostCreated={handlePostCreated} />
      </DialogContent>
    </Dialog>
  );
}
