interface LocationBadgeProps {
  latitude: number;
  longitude: number;
  compact?: boolean;
}

/**
 * Shows a pin icon with a link to Google Maps for the given coordinates.
 * `compact` renders just the icon; full renders icon + "View on map".
 */
export function LocationBadge({ latitude, longitude, compact }: LocationBadgeProps) {
  const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;

  return (
    <a
      href={mapsUrl}
      target="_blank"
      rel="noreferrer"
      className="location-badge"
      title={`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`}
      onClick={(e) => e.stopPropagation()}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
      {!compact && <span>Map</span>}
    </a>
  );
}
