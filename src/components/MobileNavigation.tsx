import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Home, FileText, DollarSign, Info, User, BarChart3 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import logoShield from '@/assets/accordnow-logo-shield.png';

const MobileNavigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  const { isAdmin } = useUserRole();

  const navigationItems = [
    { href: '/', label: 'Dashboard', icon: Home },
    { href: '/pricing', label: 'Pricing', icon: DollarSign },
    { href: '/how-it-works', label: 'How It Works', icon: Info },
    { href: '/legal', label: 'Legal', icon: FileText },
  ];

  const userItems = user ? [
    { href: '/profile', label: 'Profile', icon: User },
    ...(isAdmin ? [{ href: '/analytics', label: 'Analytics', icon: BarChart3 }] : []),
  ] : [
    { href: '/auth', label: 'Sign In', icon: User },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="md:hidden">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon"
            aria-label="Open navigation menu"
            className="md:hidden"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[280px] sm:w-[350px]">
          <div className="flex items-center gap-3 mb-8">
            <img 
              src={logoShield} 
              alt="AccordNow" 
              className="w-8 h-8"
            />
            <span className="text-xl font-bold">AccordNow</span>
          </div>

          <nav className="space-y-2" role="navigation" aria-label="Mobile navigation">
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">
                Main
              </h3>
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive(item.href)
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                    aria-current={isActive(item.href) ? 'page' : undefined}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>

            <div className="pt-4 border-t space-y-1">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">
                Account
              </h3>
              {userItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive(item.href)
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                    aria-current={isActive(item.href) ? 'page' : undefined}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MobileNavigation;