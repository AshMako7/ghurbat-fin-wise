import { Home, PlusCircle, Target, TrendingUp } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';

export default function BottomNav() {
  const navItems = [
    { to: '/home', icon: Home, label: 'Home' },
    { to: '/entries', icon: TrendingUp, label: 'Entries' },
    { to: '/goals', icon: Target, label: 'Goals' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50">
      <div className="flex items-center justify-around h-20 max-w-lg mx-auto px-6 relative">
        {navItems.slice(0, 2).map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center gap-1 flex-1',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )
            }
          >
            <Icon className="w-6 h-6" />
            <span className="text-xs font-medium">{label}</span>
          </NavLink>
        ))}

        <NavLink
          to="/add"
          className="flex flex-col items-center justify-center -mt-8"
        >
          <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-lg">
            <PlusCircle className="w-7 h-7 text-primary-foreground" />
          </div>
        </NavLink>

        {navItems.slice(2).map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center gap-1 flex-1',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )
            }
          >
            <Icon className="w-6 h-6" />
            <span className="text-xs font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}