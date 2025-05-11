import React from 'react';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  showText?: boolean;
  onClick?: () => void;
}

export function Logo({ className, showText = true, onClick }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-3 group cursor-pointer", className)} onClick={onClick}>
      <div className="relative flex items-center justify-center">
        {/* Main logo shape */}
        <div className="w-10 h-10 bg-gradient-to-br from-primary via-primary/90 to-primary/80 rounded-xl transform rotate-45 overflow-hidden transition-transform duration-300 group-hover:rotate-[135deg]">
          {/* Inner geometric patterns */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-gradient-to-tr from-background/20 to-background/5 rounded-lg transform -rotate-45 flex items-center justify-center backdrop-blur-sm transition-transform duration-300 group-hover:scale-110">
              <div className="w-6 h-6 bg-primary-foreground/90 rounded-md transform rotate-45 flex items-center justify-center shadow-inner transition-all duration-300 group-hover:shadow-lg">
                <span className="text-lg font-bold text-primary transform -rotate-45 transition-transform duration-300 group-hover:scale-110">S</span>
              </div>
            </div>
          </div>
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-4 h-4 bg-gradient-to-br from-primary-foreground/20 to-transparent rounded-bl-xl transform -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-4 h-4 bg-gradient-to-tr from-primary-foreground/20 to-transparent rounded-tr-xl transform translate-y-1/2 -translate-x-1/2" />
        </div>
        {/* Rising particles */}
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full shadow-lg transition-transform duration-300 group-hover:translate-y-[-2px]" />
        <div className="absolute -top-2 -right-2 w-1.5 h-1.5 bg-primary/70 rounded-full transition-transform duration-300 group-hover:translate-y-[-3px]" />
        <div className="absolute -top-3 -right-3 w-1 h-1 bg-primary/50 rounded-full transition-transform duration-300 group-hover:translate-y-[-4px]" />
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className="text-xl font-bold tracking-tight leading-none transition-colors duration-300">
            Stake<span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/90 to-primary/80">Rise</span>
          </span>
          <span className="text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground font-medium transition-opacity duration-300 group-hover:opacity-80">
            STR Token
          </span>
        </div>
      )}
    </div>
  );
}