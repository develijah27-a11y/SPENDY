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
      {/* Brand Icon SVG */}
      <div
        className="relative shrink-0 rounded-2xl overflow-hidden ring-1 ring-black/10 dark:ring-white/20 transition-transform duration-200 group-hover:scale-105"
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
          <div className="flex items-center leading-none">
            <span
              className={`${titleSize} tracking-tight text-slate-900 dark:text-white flex items-center select-none`}
            >
              <span>Spend</span>
              <span className="text-emerald-500 dark:text-emerald-400 font-black">y</span>
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
