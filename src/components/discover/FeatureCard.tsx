
import { Link } from 'react-router-dom';
import { Users, Newspaper, ShoppingBag, UserPlus, MessageCircle, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  link: string;
  linkText: string;
}

export function FeatureCard({ icon, title, description, link, linkText }: FeatureCardProps) {
  const getIcon = () => {
    switch (icon) {
      case 'users':
        return <Users className="h-12 w-12 text-primary" />;
      case 'groups':
        return <MessageCircle className="h-12 w-12 text-primary" />;
      case 'posts':
        return <Newspaper className="h-12 w-12 text-primary" />;
      case 'shopping':
        return <ShoppingBag className="h-12 w-12 text-primary" />;
      case 'connections':
        return <UserPlus className="h-12 w-12 text-primary" />;
      default:
        return <Users className="h-12 w-12 text-primary" />;
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-all">
      <CardContent className="p-6">
        <div className="mb-4">
          {getIcon()}
        </div>
        <h3 className="text-xl font-medium mb-2">{title}</h3>
        <p className="text-muted-foreground mb-4">
          {description}
        </p>
        <Link to={link} className="no-underline">
          <Button variant="outline" className="w-full group">
            {linkText}
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
