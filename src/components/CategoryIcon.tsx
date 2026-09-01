import React from 'react';
import {
  UtensilsCrossed,
  Sparkles,
  ShoppingBag,
  Home,
  PiggyBank,
  Car,
  Zap,
  ShoppingBag as BagIcon,
  HeartPulse,
  Tag,
  CircleDollarSign,
  Briefcase,
  Layers,
  Coffee,
  LucideProps,
} from 'lucide-react';

interface CategoryIconProps extends LucideProps {
  name: string;
  className?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, className = 'w-5 h-5', ...props }) => {
  switch (name) {
    case 'UtensilsCrossed':
    case 'dining_out':
    case 'eating_out':
      return <UtensilsCrossed className={className} {...props} />;
    case 'Sparkles':
    case 'leisure':
      return <Sparkles className={className} {...props} />;
    case 'ShoppingBag':
    case 'groceries':
      return <ShoppingBag className={className} {...props} />;
    case 'Home':
    case 'rent_housing':
      return <Home className={className} {...props} />;
    case 'PiggyBank':
    case 'savings':
    case 'savings_invest':
      return <PiggyBank className={className} {...props} />;
    case 'Car':
    case 'transport':
      return <Car className={className} {...props} />;
    case 'Zap':
    case 'utilities':
      return <Zap className={className} {...props} />;
    case 'other':
    case 'MoreHorizontal':
      return <Tag className={className} {...props} />;
    case 'HeartPulse':
    case 'health_wellness':
      return <HeartPulse className={className} {...props} />;
    case 'Coffee':
      return <Coffee className={className} {...props} />;
    case 'Briefcase':
      return <Briefcase className={className} {...props} />;
    case 'CircleDollarSign':
      return <CircleDollarSign className={className} {...props} />;
    case 'Layers':
      return <Layers className={className} {...props} />;
    default:
      return <Tag className={className} {...props} />;
  }
};
