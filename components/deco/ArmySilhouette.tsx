"use client";
import React from "react";

export default function ArmySilhouette({ className = "", size = 120, color = "currentColor", ...props }: React.SVGProps<SVGSVGElement> & { size?: number; color?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      fill={color}
      className={`deco-silhouette ${className}`}
      {...props}
      aria-hidden="true"
    >
      {/* Helmet */}
      <path d="M30 14c0-7.7 6.3-14 14-14h28c7.7 0 14 6.3 14 14v6c0 5.5-4.5 10-10 10H44c-5.5 0-10-4.5-10-10v-6z" />
      {/* Camouflage pattern on helmet */}
      <path d="M44 14h32v6H44v-6z" opacity="0.3" />
      <circle cx="52" cy="20" r="3" opacity="0.3" />
      <circle cx="72" cy="18" r="2" opacity="0.3" />
      {/* Head/face */}
      <ellipse cx="60" cy="40" rx="16" ry="14" />
      {/* Eyes */}
      <circle cx="54" cy="38" r="2" />
      <circle cx="66" cy="38" r="2" />
      {/* Body - tactical vest */}
      <path d="M30 54v50h60v-50c0-8.8-7.2-16-16-16H46c-8.8 0-16 7.2-16 16z" />
      {/* Vest pockets */}
      <rect x="40" y="64" width="18" height="18" rx="2" />
      <rect x="62" y="64" width="18" height="18" rx="2" />
      <rect x="40" y="90" width="18" height="14" rx="2" />
      <rect x="62" y="90" width="18" height="14" rx="2" />
      {/* Belt */}
      <rect x="35" y="100" width="50" height="6" rx="1" />
      {/* Legs */}
      <rect x="38" y="106" width="14" height="20" rx="2" />
      <rect x="68" y="106" width="14" height="20" rx="2" />
      {/* Boots */}
      <path d="M36 124h18v8h-18zM66 124h18v8h-18z" />
      {/* Arms - holding rifle */}
      <path d="M18 54c-4 10 0 24 10 32l-4 8 8 4 4-8c10-8 14-22 10-32z" />
      {/* Rifle */}
      <path d="M12 54l6-30h4l-6 30z" />
      <rect x="10" y="28" width="8" height="4" />
      {/* Right arm */}
      <path d="M102 54c4 10 0 24-10 32l4 8 8-4-4-8c-10-8-14-22-10-32z" />
      {/* Grenade on vest */}
      <ellipse cx="50" cy="72" rx="5" ry="7" />
      <path d="M50 65v-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="50" cy="55" r="2" />
    </svg>
  );
}

export function ArmySilhouetteLarge({ className = "", ...props }: React.SVGProps<SVGSVGElement>) {
  return <ArmySilhouette className={className} size={200} {...props} />;
}