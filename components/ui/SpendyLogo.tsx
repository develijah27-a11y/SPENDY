import React from 'react';
import Image from 'next/image';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

export function SpendyLogo({ className = '', size = 'md', showTagline = false }: LogoProps) {
  const iconDimensions = size === 'sm' ? 32 : size === 'lg' ? 52 : 40;

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Brand Icon SVG */}
      <div
        className="relative shrink-0 rounded-2xl overflow-hidden shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform"
        style={{ width: iconDimensions, height: iconDimensions }}
      >
        <Image
          src="/logo.svg"
          alt="Spendy Logo"
          width={iconDimensions}
          height={iconDimensions}
          priority
          className="w-full h-full object-contain"
        />
      </div>

      {/* Brand Typography (Matching user brand sheet) */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1 leading-none">
          <span className="font-black text-xl sm:text-2xl tracking-tight text-gray-900 dark:text-white flex items-center">
            <span className="bg-gradient-to-r from-emerald-400 via-emerald-500 to-green-400 bg-clip-text text-transparent">
              Spend
            </span>
            <span className="relative">
              y
              <span className="absolute -top-1 right-0 w-1.5 h-1.5 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50" />
            </span>
          </span>
        </div>
        {showTagline && (
          <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 tracking-wider mt-0.5">
            Track. Plan. Prosper.
          </p>
        )}
      </div>
    </div>
  );
}
