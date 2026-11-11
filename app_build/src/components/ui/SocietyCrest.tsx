import { useId, type CSSProperties } from 'react';

interface SocietyCrestProps {
  accentColor: string;
  className?: string;
}

/**
 * Stamped gold-foil geometric emblem representing the Computing Society,
 * Department of Computer Science, GANK(S) Degree College, KTS, Haripur.
 */
export function SocietyCrest({ accentColor, className = 'w-14 h-14' }: SocietyCrestProps) {
  const gradId = useId();
  const style: CSSProperties = { color: accentColor };

  return (
    <svg
      viewBox="0 0 96 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradId} x1="12" y1="12" x2="84" y2="84" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#D6B56A" />
          <stop offset="50%" stopColor={accentColor} />
          <stop offset="100%" stopColor="#7C5B15" />
        </linearGradient>
      </defs>
      <circle
        cx="48"
        cy="48"
        r="42"
        stroke={`url(#${gradId})`}
        strokeOpacity="0.45"
        strokeWidth="1"
        strokeDasharray="3 4"
      />
      <circle cx="48" cy="48" r="32" stroke={`url(#${gradId})`} strokeOpacity="0.8" strokeWidth="1.3" />
      <polygon
        points="48,18 74,33 74,63 48,78 22,63 22,33"
        stroke={`url(#${gradId})`}
        strokeWidth="1.6"
        fill={`url(#${gradId})`}
        fillOpacity="0.1"
      />
      <path
        d="M36 42L29 48L36 54M60 42L67 48L60 54M51 36L45 60"
        stroke="#7A5812"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="48" cy="18" r="2.6" fill={`url(#${gradId})`} />
      <circle cx="48" cy="78" r="2.6" fill={`url(#${gradId})`} />
    </svg>
  );
}
