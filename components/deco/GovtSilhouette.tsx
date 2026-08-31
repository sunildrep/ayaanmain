"use client";
import React from "react";

export default function GovtSilhouette({ className = "", size = 120, color = "currentColor", variant = "officer", ...props }: React.SVGProps<SVGSVGElement> & { size?: number; color?: string; variant?: "officer" | "clerk" | "judge" | "engineer" }) {
  const variants = {
    officer: (
      <>
        {/* Cap */}
        <path d="M32 18c0-5.5 4.5-10 10-10h16c5.5 0 10 4.5 10 10v4c0 3.3-2.7 6-6 6H38c-3.3 0-6-2.7-6-6v-4z" />
        <circle cx="60" cy="8" r="8" />
        {/* Face */}
        <ellipse cx="60" cy="40" rx="16" ry="14" />
        <circle cx="54" cy="38" r="2" />
        <circle cx="66" cy="38" r="2" />
        {/* Uniform */}
        <path d="M28 54v50h64v-50c0-8.8-7.2-16-16-16H44c-8.8 0-16 7.2-16 16z" />
        {/* Badge */}
        <path d="M60 58l-4 6h8l-4-6z" />
        <circle cx="60" cy="58" r="3" />
        {/* Pockets */}
        <rect x="36" y="72" width="20" height="18" rx="2" />
        <rect x="64" y="72" width="20" height="18" rx="2" />
        {/* Belt */}
        <rect x="34" y="96" width="52" height="6" rx="1" />
        {/* Legs */}
        <rect x="42" y="102" width="14" height="22" rx="2" />
        <rect x="64" y="102" width="14" height="22" rx="2" />
        {/* Shoes */}
        <path d="M40 122h18v6h-18zM62 122h18v6h-18z" />
        {/* Arms */}
        <rect x="18" y="50" width="10" height="38" rx="3" transform="rotate(-15 18 50)" />
        <rect x="92" y="50" width="10" height="38" rx="3" transform="rotate(15 102 50)" />
        {/* ID card */}
        <rect x="80" y="64" width="10" height="16" rx="1" />
        <rect x="82" y="68" width="6" height="6" rx="1" />
      </>
    ),
    clerk: (
      <>
        {/* Head */}
        <ellipse cx="60" cy="28" rx="18" ry="16" />
        <circle cx="53" cy="26" r="2" />
        <circle cx="67" cy="26" r="2" />
        {/* Glasses */}
        <rect x="48" y="22" width="24" height="8" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <line x1="60" y1="22" x2="60" y2="30" stroke="currentColor" strokeWidth="1.5" />
        {/* Body - formal shirt */}
        <path d="M30 44v56h60v-56c0-6.6-5.4-12-12-12H42c-6.6 0-12 5.4-12 12z" />
        {/* Tie */}
        <path d="M60 46l-4 12h8l-4-12z" />
        {/* Pen pocket */}
        <rect x="76" y="50" width="6" height="20" rx="1" />
        <circle cx="79" cy="50" r="2" />
        {/* Pants */}
        <rect x="38" y="100" width="16" height="24" rx="2" />
        <rect x="66" y="100" width="16" height="24" rx="2" />
        {/* Shoes */}
        <path d="M36 122h20v6h-20zM64 122h20v6h-20z" />
        {/* Arms holding file */}
        <rect x="16" y="50" width="10" height="36" rx="3" transform="rotate(-10 16 50)" />
        <rect x="94" y="50" width="10" height="36" rx="3" transform="rotate(10 104 50)" />
        {/* File */}
        <rect x="20" y="42" width="28" height="32" rx="2" />
        <path d="M34 42v32M48 42v32" stroke="currentColor" strokeWidth="1" />
      </>
    ),
    judge: (
      <>
        {/* Robe */}
        <path d="M24 30v90h72v-90c0-8.8-7.2-16-16-16H40c-8.8 0-16 7.2-16 16z" />
        {/* Collar */}
        <path d="M44 30l8-10 8 10H44z" fill="white" stroke="currentColor" strokeWidth="1" />
        <path d="M60 30l8-10 8 10h-16z" fill="white" stroke="currentColor" strokeWidth="1" />
        {/* Head */}
        <ellipse cx="60" cy="20" rx="14" ry="12" />
        {/* Gavel */}
        <path d="M90 60l-12 12-8-8 12-12z" transform="rotate(-45 90 60)" />
        <rect x="84" y="58" width="4" height="30" rx="1" />
      </>
    ),
    engineer: (
      <>
        {/* Hard hat */}
        <path d="M34 16c0-6.6 5.4-12 12-12h8c6.6 0 12 5.4 12 12v4c0 3.3-2.7 6-6 6H40c-3.3 0-6-2.7-6-6v-4z" />
        <ellipse cx="60" cy="8" rx="16" ry="6" />
        {/* Stripe */}
        <rect x="40" y="18" width="40" height="2" />
        {/* Head */}
        <ellipse cx="60" cy="38" rx="15" ry="13" />
        <circle cx="54" cy="36" r="2" />
        <circle cx="66" cy="36" r="2" />
        {/* Safety vest */}
        <path d="M26 52v52h68v-52c0-8.8-7.2-16-16-16H42c-8.8 0-16 7.2-16 16z" />
        {/* Reflective strips */}
        <rect x="32" y="60" width="56" height="3" />
        <rect x="32" y="80" width="56" height="3" />
        <rect x="32" y="100" width="56" height="3" />
        {/* Tools on belt */}
        <rect x="30" y="100" width="12" height="24" rx="2" />
        <rect x="78" y="100" width="12" height="24" rx="2" />
        {/* Legs */}
        <rect x="40" y="104" width="14" height="22" rx="2" />
        <rect x="66" y="104" width="14" height="22" rx="2" />
        {/* Boots */}
        <path d="M38 124h18v8h-18zM64 124h18v8h-18z" />
        {/* Arms - holding blueprint */}
        <rect x="16" y="50" width="10" height="38" rx="3" transform="rotate(-15 16 50)" />
        <rect x="94" y="50" width="10" height="38" rx="3" transform="rotate(15 104 50)" />
        {/* Blueprint */}
        <rect x="20" y="44" width="30" height="36" rx="2" stroke="currentColor" strokeWidth="1" fill="none" />
        <path d="M35 44v36M50 44v36" stroke="currentColor" strokeWidth="0.5" />
      </>
    ),
  };

  return (
    <svg
      viewBox="0 0 120 140"
      width={size}
      height={size}
      fill={color}
      className={`deco-silhouette ${className}`}
      {...props}
      aria-hidden="true"
    >
      {variants[variant]}
    </svg>
  );
}

type GovtSilhouetteProps = React.SVGProps<SVGSVGElement> & { size?: number; color?: string; variant?: "officer" | "clerk" | "judge" | "engineer" };

export function GovtSilhouetteLarge({ className = "", variant = "officer", ...props }: GovtSilhouetteProps) {
  return <GovtSilhouette className={className} size={220} variant={variant} {...props} />;
}