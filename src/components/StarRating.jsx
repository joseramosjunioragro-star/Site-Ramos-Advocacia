import { Star } from 'lucide-react';

export default function StarRating({ value = 0, max = 5, size = 16, showValue = true }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          size={size}
          className={i < Math.floor(value) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200 fill-gray-200'}
        />
      ))}
      {showValue && (
        <span className="text-sm text-gray-600 ml-1 font-medium">{value.toFixed(1)}</span>
      )}
    </div>
  );
}
