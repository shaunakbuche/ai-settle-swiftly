import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Zap, Brain, Shield } from 'lucide-react';

interface AIDiplomatProps {
  message: string;
  isActive?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const AIDiplomat = ({ message, isActive = false, size = 'md' }: AIDiplomatProps) => {
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (message) {
      setIsTyping(true);
      setCurrentMessage('');
      
      let i = 0;
      const typeWriter = setInterval(() => {
        if (i < message.length) {
          setCurrentMessage(prev => prev + message.charAt(i));
          i++;
        } else {
          clearInterval(typeWriter);
          setIsTyping(false);
        }
      }, 30);

      return () => clearInterval(typeWriter);
    }
  }, [message]);

  const avatarSize = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  }[size];

  const iconSize = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  }[size];

  return (
    <div className="flex items-start gap-4 group">
      <div className="relative">
        <Avatar className={`${avatarSize} neon-border bg-gradient-to-br from-primary/20 to-accent/20 ${isActive ? 'animate-pulse' : ''}`}>
          <AvatarFallback className="bg-transparent">
            <div className="relative">
              <Brain className={`${iconSize} text-primary`} />
              {isActive && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Zap className={`${iconSize} text-accent animate-pulse`} />
                </div>
              )}
            </div>
          </AvatarFallback>
        </Avatar>
        
        {/* Holographic Effect */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 animate-pulse"></div>
        
        {/* Status Indicators */}
        <div className="absolute -bottom-1 -right-1">
          <div className="h-3 w-3 rounded-full bg-primary shadow-[0_0_10px_hsl(var(--primary))] animate-pulse"></div>
        </div>
      </div>

      <Card className="flex-1 cyber-glass border-primary/30 p-4 relative overflow-hidden">
        {/* AI Diplomat Header */}
        <div className="flex items-center gap-2 mb-2">
          <Shield className="h-4 w-4 text-accent" />
          <span className="text-sm font-semibold text-accent font-mono">ACCORD AI DIPLOMAT</span>
          <div className="flex-1 h-px bg-gradient-to-r from-accent/50 to-transparent"></div>
        </div>

        {/* Message Content */}
        <div className="space-y-2">
          <p className="text-foreground/90 leading-relaxed">
            {currentMessage}
            {isTyping && <span className="inline-block w-2 h-4 bg-primary ml-1 animate-pulse"></span>}
          </p>
        </div>

        {/* Scan Line Effect */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-50 scan-effect"></div>
        
        {/* Corner Accent */}
        <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-accent/50"></div>
        <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-secondary/50"></div>
      </Card>
    </div>
  );
};

export default AIDiplomat;