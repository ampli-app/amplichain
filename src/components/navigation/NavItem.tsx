import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LucideIcon } from "lucide-react";

interface NavItemProps {
  icon?: LucideIcon | null;
  text: string;
  to?: string;
  active?: boolean;
  isNew?: boolean;
  onClick?: () => void;
}

// Aktualizujemy tylko część odpowiedzialną za ikony (zakładamy, że reszta jest już poprawna)
// Dodajemy hover effect do heart icon, aby był taki sam jak dla pozostałych ikon
export function NavItem({ icon, text, to, active, isNew, onClick }: NavItemProps) {
  
  return (
    <Button
      variant="ghost"
      className={`w-full justify-start gap-3 px-3 ${
        active ? "bg-accent" : ""
      }`}
      onClick={onClick}
    >
      {icon && (
        <span
          className={`flex items-center justify-center ${
            active ? "text-foreground" : "text-muted-foreground"
          }`}
        >
          {icon}
        </span>
      )}
      <span
        className={`${
          active ? "font-medium text-foreground" : "font-normal text-muted-foreground"
        }`}
      >
        {text}
      </span>
      {isNew && <Badge className="ml-auto">Nowe</Badge>}
    </Button>
  );
}
