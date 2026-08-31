"use client";
import React from "react";

const particles = [
  { id: 1, x: 5, y: 15, size: 8, delay: 0, color: "rgba(14, 165, 233, 0.15)" },
  { id: 2, x: 85, y: 8, size: 12, delay: 1000, color: "rgba(245, 158, 11, 0.12)" },
  { id: 3, x: 12, y: 75, size: 6, delay: 2000, color: "rgba(16, 185, 129, 0.1)" },
  { id: 4, x: 90, y: 65, size: 10, delay: 3000, color: "rgba(139, 92, 246, 0.1)" },
  { id: 5, x: 3, y: 45, size: 14, delay: 4000, color: "rgba(14, 165, 233, 0.08)" },
  { id: 6, x: 95, y: 35, size: 7, delay: 5000, color: "rgba(245, 158, 11, 0.1)" },
  { id: 7, x: 25, y: 90, size: 9, delay: 6000, color: "rgba(16, 185, 129, 0.08)" },
  { id: 8, x: 75, y: 92, size: 11, delay: 7000, color: "rgba(139, 92, 246, 0.06)" },
];

export default function FloatingParticles({ className = "", count = 8 }: { className?: string; count?: number }) {
  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`} aria-hidden="true">
      {particles.slice(0, count).map((p) => (
        <div
          key={p.id}
          className="hero-particle"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: p.color,
            animationDelay: `${p.delay}ms`,
            borderRadius: p.id % 3 === 0 ? "50%" : p.id % 3 === 1 ? "30% 70% 70% 30% / 30% 30% 70% 70%" : "20% 80%",
          }}
        />
      ))}
    </div>
  );
}

export function SectionDivider({ className = "", variant = "wave" }: { className?: string; variant?: "wave" | "mountain" | "zigzag" }) {
  const waves = {
    wave: (
      <svg viewBox="0 0 1200 80" preserveAspectRatio="none" className="w-full h-full">
        <defs>
          <linearGradient id="waveGrad" x1="0" y1="0" x2="1200" y2="0">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0" />
            <stop offset="50%" stopColor="currentColor" stopOpacity="0.15" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d="M0,40 C200,0 400,80 600,40 C800,0 1000,80 1200,40 L1200,80 L0,80 Z" fill="url(#waveGrad)" />
      </svg>
    ),
    mountain: (
      <svg viewBox="0 0 1200 80" preserveAspectRatio="none" className="w-full h-full">
        <path d="M0,80 L100,30 L200,55 L300,20 L400,50 L500,15 L600,45 L700,10 L800,40 L900,20 L1000,50 L1100,25 L1200,40 L1200,80 L0,80 Z" fill="currentColor" opacity="0.1" />
      </svg>
    ),
    zigzag: (
      <svg viewBox="0 0 1200 80" preserveAspectRatio="none" className="w-full h-full">
        <path d="M0,60 L100,20 L200,60 L300,20 L400,60 L500,20 L600,60 L700,20 L800,60 L900,20 L1000,60 L1100,20 L1200,60 L1200,80 L0,80 Z" fill="currentColor" opacity="0.08" />
      </svg>
    ),
  };

  return (
    <div className={`section-wave text-navy-900 ${className}`} aria-hidden="true">
      {waves[variant]}
    </div>
  );
}