import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children, size = 'default' }) {
  if (!isOpen) return null;

  const sizes = {
    default: 'max-w-md',
    large: 'max-w-lg',
    small: 'max-w-sm',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`w-full ${sizes[size]} bg-white rounded-t-3xl shadow-2xl slide-in max-h-[90vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-800">{title}</h2>
            <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
