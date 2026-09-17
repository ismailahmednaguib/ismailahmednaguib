// components/ReviewStars.tsx : عرض نجوم التقييم
"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";

interface ReviewStarsProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  interactive?: boolean;
  onChange?: (rating: number) => void;
  defaultRating?: number;
}

export default function ReviewStars({ 
  rating, 
  maxRating = 5, 
  size = "md", 
  showValue = false,
  interactive = false,
  onChange,
  defaultRating = 0
}: ReviewStarsProps) {
  const t = useTranslations("common");
  const [hoverRating, setHoverRating] = useState(0);
  const [currentRating, setCurrentRating] = useState(defaultRating);

  const displayRating = interactive ? (hoverRating || currentRating || rating) : rating;
  const starSize = size === "sm" ? 16 : size === "lg" ? 28 : 22;

  if (interactive) {
    return (
      <div className="review-stars interactive" role="radiogroup" aria-label={t("rating")}>
        {[...Array(maxRating)].map((_, i) => {
          const starValue = i + 1;
          const filled = starValue <= displayRating;
          return (
            <button
              key={i}
              type="button"
              role="radio"
              aria-checked={filled}
              aria-label={`${starValue} ${t("stars")}`}
              onClick={() => { setCurrentRating(starValue); onChange?.(starValue); }}
              onMouseEnter={() => setHoverRating(starValue)}
              onMouseLeave={() => setHoverRating(0)}
              className={`star ${filled ? "filled" : ""}`}
              style={{ fontSize: starSize }}
            >
              ★
            </button>
          );
        })}
        {showValue && <span className="rating-value">{displayRating.toFixed(1)}</span>}
      </div>
    );
  }

  return (
    <div className="review-stars" aria-label={`${rating} ${t("outOf")} ${maxRating}`}>
      {[...Array(maxRating)].map((_, i) => (
        <span key={i} className={`star ${i + 1 <= rating ? "filled" : ""}`} style={{ fontSize: starSize }}>
          ★
        </span>
      ))}
      {showValue && <span className="rating-value">{rating.toFixed(1)}</span>}
    </div>
  );
}