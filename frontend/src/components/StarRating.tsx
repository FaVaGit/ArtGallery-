import { useState } from "react";

interface StarRatingProps {
  averageRating: number;
  userRating: number | null;
  onRate: (score: number) => void;
  canRate: boolean;
  labels: {
    rating: string;
    yourRating: string;
    averageRating: string;
    loginToRate: string;
  };
}

export function StarRating({ averageRating, userRating, onRate, canRate, labels }: StarRatingProps) {
  const [hover, setHover] = useState(0);

  return (
    <div className="star-rating">
      <div className="star-rating-stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={(hover || userRating || 0) >= star ? "filled" : ""}
            onMouseEnter={() => canRate && setHover(star)}
            onMouseLeave={() => setHover(0)}
            onClick={() => canRate && onRate(star)}
            disabled={!canRate}
            aria-label={`${star} star${star > 1 ? "s" : ""}`}
          >
            ★
          </button>
        ))}
      </div>
      <span className="star-rating-info">
        {averageRating > 0 && `${labels.averageRating}: ${averageRating.toFixed(1)}`}
        {userRating && ` · ${labels.yourRating}: ${userRating}`}
        {!canRate && <em> — {labels.loginToRate}</em>}
      </span>
    </div>
  );
}
