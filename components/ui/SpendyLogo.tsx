import React from 'react';
import Image from 'next/image';

interface LogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  variant?: 'full' | 'icon-only' | 'stacked';
}

export function SpendyLogo({
  className = '',
  size = 'md',
  showTagline = false,
  variant = 'full',
}: LogoProps) {
  const iconDimensions =
    size === 'xs' ? 24 : size === 'sm' ? 32 : size === 'md' ? 42 : size === 'lg' ? 56 : 72;

  const titleSize =
    size === 'xs'
      ? 'text-base font-black'
      : size === 'sm'
      ? 'text-lg font-black'
      : size === 'md'
      ? 'text-2xl font-black'
      : size === 'lg'
      ? 'text-3xl font-black'
      : 'text-4xl font-black';

  return (
    <div
      className={`flex items-center ${
        variant === 'stacked' ? 'flex-col text-center gap-3' : 'gap-3'
      } ${className}`}
    >
      {/* Brand Icon SVG from user logo */}
      <div
        className="relative shrink-0 rounded-2xl overflow-hidden shadow-lg shadow-emerald-500/25 ring-1 ring-white/20 transition-transform duration-200 group-hover:scale-105"
        style={{ width: iconDimensions, height: iconDimensions }}
      >
        <Image
          src="/logo.svg"
          alt="Spendy Brand Logo"
          width={iconDimensions}
          height={iconDimensions}
          priority
          className="w-full h-full object-contain"
        />
      </div>

      {variant !== 'icon-only' && (
        <div className={`flex flex-col ${variant === 'stacked' ? 'items-center' : 'items-start'}`}>
          <div className="flex items-center gap-1 leading-none">
            <span
              className={`${titleSize} tracking-tight text-gray-900 dark:text-white flex items-center`}
            >
              <span className="bg-gradient-to-r from-emerald-500 via-emerald-400 to-green-500 bg-clip-text text-transparent drop-shadow-sm">
                Spend
              </span>
              <span className="relative text-gray-900 dark:text-white">
                y
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-emerald-500/40 shadow-sm shadow-amber-500/80 animate-pulse" />
              </span>
            </span>
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 ml-1.5">
              UGX
            </span>
          </div>
          {showTagline && (
            <p className="text-[11px] sm:text-xs font-bold text-emerald-600 dark:text-emerald-400 tracking-wide mt-1">
              Track • Plan • Prosper
            </p>
          )}
        </div>
      )}
    </div>
  );
}

