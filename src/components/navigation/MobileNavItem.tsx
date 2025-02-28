
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface MobileNavItemProps {
  to: string;
  label: string;
  icon?: React.ReactNode;
  active: boolean;
}

export function MobileNavItem({ to, label, icon, active }: MobileNavItemProps) {
  return (
    <Button 
      asChild 
      variant={active ? "default" : "ghost"} 
      className={`w-full justify-start gap-1.5 h-12 ${active ? '' : ''}`}
    >
      <Link to={to}>
        {icon}
        {label}
      </Link>
    </Button>
  );
}
