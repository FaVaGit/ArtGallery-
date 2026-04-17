interface LocationMapProps {
  latitude: number;
  longitude: number;
  title?: string;
}

/**
 * Embeds an OpenStreetMap view for the given coordinates.
 * Uses no API key — free and lightweight.
 */
export function LocationMap({ latitude, longitude, title }: LocationMapProps) {
  const bbox = `${longitude - 0.01},${latitude - 0.01},${longitude + 0.01},${latitude + 0.01}`;
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${latitude},${longitude}`;

  return (
    <div className="location-map">
      {title && <p className="location-map-title">{title}</p>}
      <iframe
        title="Location map"
        src={src}
        className="location-map-frame"
        loading="lazy"
      />
      <a
        href={`https://www.google.com/maps?q=${latitude},${longitude}`}
        target="_blank"
        rel="noreferrer"
        className="location-map-link"
      >
        Open in Google Maps ↗
      </a>
    </div>
  );
}
