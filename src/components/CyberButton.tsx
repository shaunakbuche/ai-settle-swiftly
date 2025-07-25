import { forwardRef } from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface CyberButtonProps extends Omit<ButtonProps, 'variant'> {
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'outline';
  neonGlow?: boolean;
  loading?: boolean;
  glitchEffect?: boolean;
}

const CyberButton = forwardRef<HTMLButtonElement, CyberButtonProps>(
  ({ className, variant = 'primary', neonGlow = false, loading = false, glitchEffect = false, children, disabled, ...props }, ref) => {
    
    const getVariantStyles = () => {
      switch (variant) {
        case 'primary':
          return 'bg-gradient-to-r from-primary to-primary-glow text-primary-foreground border-primary/50 hover:from-primary-glow hover:to-primary shadow-[0_0_20px_hsl(var(--primary)/0.3)] hover:shadow-[0_0_30px_hsl(var(--primary)/0.5)]';
        case 'secondary':
          return 'bg-gradient-to-r from-secondary to-secondary-glow text-secondary-foreground border-secondary/50 hover:from-secondary-glow hover:to-secondary shadow-[0_0_20px_hsl(var(--secondary)/0.3)] hover:shadow-[0_0_30px_hsl(var(--secondary)/0.5)]';
        case 'accent':
          return 'bg-gradient-to-r from-accent to-accent-glow text-accent-foreground border-accent/50 hover:from-accent-glow hover:to-accent shadow-[0_0_20px_hsl(var(--accent)/0.3)] hover:shadow-[0_0_30px_hsl(var(--accent)/0.5)]';
        case 'ghost':
          return 'bg-transparent border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50';
        case 'outline':
          return 'bg-transparent border-2 border-primary text-primary hover:bg-primary/10 hover:shadow-[0_0_15px_hsl(var(--primary)/0.3)]';
        default:
          return '';
      }
    };

    return (
      <Button
        ref={ref}
        className={cn(
          'relative overflow-hidden transition-all duration-300 transform hover:scale-105 font-mono font-semibold tracking-wide',
          'border-2 rounded-lg px-6 py-3',
          'before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700',
          getVariantStyles(),
          neonGlow && 'animate-[neon-pulse_2s_ease-in-out_infinite]',
          glitchEffect && 'hover:animate-[glitch_0.3s_ease-in-out]',
          disabled && 'opacity-50 cursor-not-allowed transform-none hover:scale-100',
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {/* Cyber Corner Accents */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-white/30"></div>
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-white/30"></div>
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-white/30"></div>
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-white/30"></div>
        
        {/* Content */}
        <span className="relative z-10 flex items-center gap-2">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {children}
        </span>
        
        {/* Scan Line Effect */}
        {!disabled && (
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        )}
      </Button>
    );
  }
);

CyberButton.displayName = 'CyberButton';

export default CyberButton;