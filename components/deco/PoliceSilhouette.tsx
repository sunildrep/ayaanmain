"use client";
import React from "react";

export default function PoliceSilhouette({ className = "", size = 120, color = "currentColor", ...props }: React.SVGProps<SVGSVGElement> & { size?: number; color?: string }) {
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
      {/* Police officer silhouette */}
      <path d="M60 8c-4.4 0-8 3.6-8 8v8c0 2.2 1.8 4 4 4h8c2.2 0 4-1.8 4-4V16c0-4.4-3.6-8-8-8zm0 4c2.2 0 4 1.8 4 4v8c0 2.2-1.8 4-4 4h-8c-2.2 0-4-1.8-4-4V16c0-2.2 1.8-4 4-4h8z" />
      {/* Body */}
      <path d="M60 24c-11 0-20 9-20 20v48h40V44c0-11-9-20-20-20z" />
      {/* Hat brim */}
      <path d="M30 16h60v4c0 2.2-1.8 4-4 4H34c-2.2 0-4-1.8-4-4v-4z" />
      {/* Hat crown */}
      <ellipse cx="60" cy="8" rx="22" ry="10" />
      {/* Badge */}
      <circle cx="60" cy="38" r="6" />
      {/* Belt */}
      <rect x="40" y="58" width="40" height="4" rx="1" />
      {/* Legs */}
      <rect x="44" y="92" width="10" height="22" rx="2" />
      <rect x="66" y="92" width="10" height="22" rx="2" />
      {/* Boots */}
      <path d="M42 112h14v6h-14zM64 112h14v6h-14z" />
      {/* Arms */}
      <rect x="24" y="40" width="10" height="36" rx="3" transform="rotate(-20 24 40)" />
      <rect x="86" y="40" width="10" height="36" rx="3" transform="rotate(20 96 40)" />
      {/* Radio on shoulder */}
      <rect x="22" y="30" width="12" height="18" rx="2" />
      <rect x="25" y="32" width="6" height="6" rx="1" />
    </svg>
  );
}

export function PoliceSilhouetteLarge({ className = "", ...props }: React.SVGProps<SVGSVGElement>) {
  return <PoliceSilhouette className={className} size={200} {...props} />;
}