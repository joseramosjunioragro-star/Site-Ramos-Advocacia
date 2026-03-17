import { Star } from 'lucide-react';

export default function StarRating({ value = 0, max = 5, size = 16, showValue = true, light = false }) {
  const emptyClass = light ? 'text-white/30 fill-white/30' : 'text-gray-200 fill-gray-200';
  const valueClass = light ? 'text-white font-bold' : 'text-gray-600 font-medium';

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          size={size}
          className={i < Math.floor(value) ? 'fill-yellow-400 text-yellow-400' : emptyClass}
        />
      ))}
      {showValue && (
        <span className={`text-sm ml-1 ${valueClass}`}>{value.toFixed(1)}</span>
      )}
    </div>
  );
}
