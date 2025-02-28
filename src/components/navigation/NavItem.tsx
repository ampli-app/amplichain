
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface NavItemProps {
  to: string;
  label: string;
  icon?: React.ReactNode;
  active: boolean;
}

export function NavItem({ to, label, icon, active }: NavItemProps) {
  return (
    <Button 
      asChild 
      variant={active ? "default" : "ghost"} 
      className={`gap-1.5 h-10 ${active ? '' : 'hover:bg-accent/50'}`}
    >
      <Link to={to}>
        {icon}
        {label}
      </Link>
    </Button>
  );
}
