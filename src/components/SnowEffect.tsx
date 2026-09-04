import { useMemo } from 'react';

export function SnowEffect() {
  // Generate a fixed set of snowflake properties so they don't re-randomize on re-render
  const snowflakes = useMemo(() => {
    const symbols = ['❄', '❅', '❆', '•', '✻'];
    return Array.from({ length: 24 }).map((_, i) => ({
      id: i,
      symbol: symbols[i % symbols.length],
      left: `${(i * 4.1 + 2) % 98}%`,
      animationDuration: `${5 + (i % 6) * 1.5}s`,
      animationDelay: `${(i % 5) * 0.8}s`,
      fontSize: `${12 + (i % 4) * 6}px`,
      opacity: 0.35 + (i % 3) * 0.25,
    }));
  }, []);

  return (
    <div 
      aria-hidden="true" 
      className="pointer-events-none fixed inset-0 overflow-hidden z-10 select-none"
    >
      <style>{`
        @keyframes snowfall {
          0% {
            transform: translateY(-20px) translateX(0px) rotate(0deg);
          }
          50% {
            transform: translateY(50vh) translateX(15px) rotate(180deg);
          }
          100% {
            transform: translateY(105vh) translateX(-15px) rotate(360deg);
          }
        }
        .animate-snowflake {
          position: absolute;
          top: -20px;
          animation-name: snowfall;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
      `}</style>
      {snowflakes.map((flake) => (
        <span
          key={flake.id}
          className="animate-snowflake text-white drop-shadow-[0_1px_2px_rgba(14,165,233,0.4)]"
          style={{
            left: flake.left,
            animationDuration: flake.animationDuration,
            animationDelay: flake.animationDelay,
            fontSize: flake.fontSize,
            opacity: flake.opacity,
          }}
        >
          {flake.symbol}
        </span>
      ))}
    </div>
  );
}
