
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function PaginationControls({ currentPage, totalPages, onPageChange }: PaginationControlsProps) {
  if (totalPages <= 1) return null;
  
  const pagesToShow = Math.min(5, totalPages);
  let startPage = Math.max(1, currentPage - Math.floor(pagesToShow / 2));
  let endPage = startPage + pagesToShow - 1;
  
  if (endPage > totalPages) {
    endPage = totalPages;
    startPage = Math.max(1, endPage - pagesToShow + 1);
  }
  
  const pages = Array.from({length: endPage - startPage + 1}, (_, i) => startPage + i);
  
  return (
    <div className="flex justify-center mt-10">
      <div className="flex">
        <Button 
          variant="outline" 
          size="sm" 
          className="rounded-l-md rounded-r-none border-r-0"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Poprzednia
        </Button>
        
        {pages.map((page) => (
          <Button 
            key={page} 
            variant={page === currentPage ? "default" : "outline"} 
            size="sm" 
            className={`rounded-none ${page > startPage && page < endPage ? 'border-r-0' : ''}`}
            onClick={() => onPageChange(page)}
          >
            {page}
          </Button>
        ))}
        
        <Button 
          variant="outline" 
          size="sm" 
          className="rounded-r-md rounded-l-none"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
        >
          Następna <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
