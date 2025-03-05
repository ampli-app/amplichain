
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

interface NavItemProps {
  icon?: LucideIcon;
  text: string;
  to?: string;
  active?: boolean;
  isNew?: boolean;
  onClick?: () => void;
}

export function NavItem({ icon: Icon, text, to, active, isNew, onClick }: NavItemProps) {
  const content = (
    <>
      {Icon && (
        <span
          className={`flex items-center justify-center ${
            active ? "text-foreground" : "text-muted-foreground"
          }`}
        >
          <Icon className="h-4 w-4" />
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
    </>
  );

  if (to) {
    return (
      <Button
        asChild
        variant="ghost"
        className={`w-full justify-start gap-3 px-3 ${
          active ? "bg-accent" : ""
        }`}
      >
        <Link to={to}>{content}</Link>
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      className={`w-full justify-start gap-3 px-3 ${
        active ? "bg-accent" : ""
      }`}
      onClick={onClick}
    >
      {content}
    </Button>
  );
}
