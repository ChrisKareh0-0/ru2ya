'use client';

interface ShootingStarsProps {
  leftOffset?: number;
  topOffset?: number;
}

export default function ShootingStars({ leftOffset = 0, topOffset = 0 }: ShootingStarsProps) {
  return (
    <div
      className="shooting-stars-container"
      style={{ left: `${leftOffset}px`, top: `${topOffset}px` }}
    >
      <div className="night">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="shooting_star"></div>
        ))}
      </div>
    </div>
  );
}
