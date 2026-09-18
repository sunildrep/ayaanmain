"use client";

export default function GovtSilhouette({ className = "", size = 120, color = "currentColor", ...props }: React.SVGProps<SVGSVGElement> & { size?: number; color?: string }) {
  const officer = (
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
  );

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
      {officer}
    </svg>
  );
}

type GovtSilhouetteProps = React.SVGProps<SVGSVGElement> & { size?: number; color?: string };

export function GovtSilhouetteLarge({ className = "", ...props }: GovtSilhouetteProps) {
  return <GovtSilhouette className={className} size={220} {...props} />;
}