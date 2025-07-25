import { forwardRef, ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface CyberCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'muted';
  holographic?: boolean;
  scanLine?: boolean;
  children: ReactNode;
}

const CyberCard = forwardRef<HTMLDivElement, CyberCardProps>(
  ({ className, variant = 'primary', holographic = false, scanLine = false, children, ...props }, ref) => {
    
    const getVariantStyles = () => {
      switch (variant) {
        case 'primary':
          return 'bg-gradient-to-br from-primary/5 to-primary/10 border-primary/30 shadow-[0_0_20px_hsl(var(--primary)/0.1)]';
        case 'secondary':
          return 'bg-gradient-to-br from-secondary/5 to-secondary/10 border-secondary/30 shadow-[0_0_20px_hsl(var(--secondary)/0.1)]';
        case 'accent':
          return 'bg-gradient-to-br from-accent/5 to-accent/10 border-accent/30 shadow-[0_0_20px_hsl(var(--accent)/0.1)]';
        case 'muted':
          return 'bg-gradient-to-br from-muted/30 to-muted/10 border-border/50';
        default:
          return '';
      }
    };

    return (
      <Card
        ref={ref}
        className={cn(
          'relative overflow-hidden backdrop-blur-sm border-2 transition-all duration-300',
          'hover:shadow-[0_0_30px_hsl(var(--primary)/0.2)] hover:border-primary/50',
          getVariantStyles(),
          holographic && 'ai-diplomat-container',
          className
        )}
        {...props}
      >
        {/* Cyber Corner Accents */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary/40"></div>
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-secondary/40"></div>
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-accent/40"></div>
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary/40"></div>
        
        {/* Scan Line Effect */}
        {scanLine && (
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-50 scan-effect"></div>
        )}
        
        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>
        
        {/* Holographic Shimmer */}
        {holographic && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent -translate-x-full animate-[scan-line_3s_linear_infinite] pointer-events-none"></div>
        )}
      </Card>
    );
  }
);

CyberCard.displayName = 'CyberCard';

export default CyberCard;