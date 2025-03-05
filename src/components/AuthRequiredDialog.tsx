
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { LogIn, UserPlus } from 'lucide-react';

interface AuthRequiredDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  redirectAfterClose?: string;
}

export function AuthRequiredDialog({
  open,
  onOpenChange,
  title = "Wymagane logowanie",
  description = "Aby skorzystać z tej funkcji, musisz być zalogowany.",
  redirectAfterClose
}: AuthRequiredDialogProps) {
  const navigate = useNavigate();
  
  const handleClose = () => {
    onOpenChange(false);
    if (redirectAfterClose) {
      setTimeout(() => {
        navigate(redirectAfterClose);
      }, 100);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={redirectAfterClose ? handleClose : onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex flex-col gap-4">
            <Button asChild className="w-full gap-2">
              <Link to="/login">
                <LogIn className="h-4 w-4" />
                Zaloguj się
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full gap-2">
              <Link to="/signup">
                <UserPlus className="h-4 w-4" />
                Zarejestruj się
              </Link>
            </Button>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={handleClose}>
            Zamknij
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
