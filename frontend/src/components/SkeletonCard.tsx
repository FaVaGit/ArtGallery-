export function SkeletonCard() {
  return (
    <div className="skeleton-card" aria-hidden="true">
      <div className="skeleton-thumb skeleton-shimmer" />
      <div className="skeleton-meta">
        <div className="skeleton-line skeleton-shimmer" style={{ width: "75%" }} />
        <div className="skeleton-line skeleton-shimmer" style={{ width: "50%" }} />
        <div className="skeleton-line skeleton-shimmer" style={{ width: "40%" }} />
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="gallery-grid" aria-busy="true" aria-label="Loading content">
      {Array.from({ length: count }, (_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
