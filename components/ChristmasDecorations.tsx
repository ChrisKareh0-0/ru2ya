'use client';

import { useEffect, useState } from 'react';

export default function ChristmasDecorations() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Create snowflakes
  const snowflakes = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 2,
    duration: 8 + Math.random() * 6,
    size: 15 + Math.random() * 20
  }));

  // Create ornaments - all red
  const ornaments = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 1.5,
    color: '#FF0000'
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {/* Snowflakes */}
      {snowflakes.map((snowflake) => (
        <div
          key={`snowflake-${snowflake.id}`}
          className="absolute animate-christmas-snow"
          style={{
            left: `${snowflake.left}%`,
            top: '80px',
            width: `${snowflake.size}px`,
            height: `${snowflake.size}px`,
            animationDelay: `${snowflake.delay}s`,
            animationDuration: `${snowflake.duration}s`,
            filter: 'drop-shadow(0 0 3px rgba(255, 215, 0, 0.9))'
          }}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full" style={{ display: 'block' }}>
            <g fill="#FFD700" opacity="0.95">
              <circle cx="50" cy="50" r="8" />
              {/* Snowflake arms */}
              <line x1="50" y1="10" x2="50" y2="90" stroke="#FFD700" strokeWidth="3" opacity="0.95" />
              <line x1="10" y1="50" x2="90" y2="50" stroke="#FFD700" strokeWidth="3" opacity="0.95" />
              <line x1="25" y1="25" x2="75" y2="75" stroke="#FFD700" strokeWidth="3" opacity="0.95" />
              <line x1="75" y1="25" x2="25" y2="75" stroke="#FFD700" strokeWidth="3" opacity="0.95" />
              {/* Add decorative tips */}
              <circle cx="50" cy="15" r="4" />
              <circle cx="50" cy="85" r="4" />
              <circle cx="15" cy="50" r="4" />
              <circle cx="85" cy="50" r="4" />
            </g>
          </svg>
        </div>
      ))}

      {/* Hanging Ornaments */}
      {ornaments.map((ornament) => (
        <div
          key={`ornament-${ornament.id}`}
          className="absolute animate-christmas-swing"
          style={{
            left: `${ornament.left}%`,
            top: '80px',
            animationDelay: `${ornament.delay}s`,
            width: '40px',
            textAlign: 'center'
          }}
        >
          {/* Ornament string */}
          <div
            className="w-0.5 h-12 mx-auto"
            style={{
              background: 'linear-gradient(to bottom, #888, #666)',
              boxShadow: '0 0 2px rgba(0, 0, 0, 0.5)'
            }}
          ></div>

          {/* Ornament ball */}
          <div
            className="w-8 h-8 rounded-full mx-auto relative"
            style={{
              backgroundColor: ornament.color,
              boxShadow: `
                inset -4px -4px 8px rgba(0, 0, 0, 0.6),
                inset 2px 2px 4px rgba(255, 100, 100, 0.8),
                0 4px 8px rgba(0, 0, 0, 0.4),
                0 8px 16px rgba(0, 0, 0, 0.3)
              `,
              animation: 'none'
            }}
          >
            {/* Shine effect */}
            <div
              className="absolute rounded-full"
              style={{
                top: '8%',
                left: '15%',
                width: '30%',
                height: '30%',
                backgroundColor: 'rgba(255, 255, 255, 0.6)',
                filter: 'blur(2px)'
              }}
            ></div>
          </div>

          {/* Ornament cap */}
          <div
            className="w-4 h-2 mx-auto"
            style={{
              backgroundColor: '#DAA520',
              borderRadius: '2px 2px 0 0',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.5)'
            }}
          ></div>
        </div>
      ))}

      {/* Tinsel/Garland */}
      <div className="absolute left-0 w-full h-40 overflow-hidden" style={{ top: '80px' }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={`garland-${i}`}
            className="absolute text-yellow-300 text-3xl animate-christmas-garland font-bold"
            style={{
              left: `${(i * 100) / 8}%`,
              top: `${20 + (i % 3) * 15}px`,
              animationDelay: `${i * 0.2}s`,
              textShadow: '0 0 4px rgba(255, 215, 0, 0.8)',
              filter: 'drop-shadow(0 0 3px rgba(255, 255, 0, 0.6))'
            }}
          >
            ✨
          </div>
        ))}
      </div>
    </div>
  );
}
