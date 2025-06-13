import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

const Toast = ({ show, type, message, onClose, duration = 3000 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (show) {
      // Hiện toast với animation
      setIsVisible(true);
      setTimeout(() => {
        setIsAnimating(true);
      }, 10); // Delay nhỏ để trigger animation

      // Auto hide after duration
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    } else {
      // Ẩn toast khi show = false
      handleClose();
    }
  }, [show, duration]);

  const handleClose = () => {
    setIsAnimating(false);
    // Đợi animation kết thúc rồi mới ẩn hoàn toàn
    setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 300); // Match với duration của CSS transition
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-[60] max-w-sm w-full px-4">
      <div 
        className={`transform transition-all duration-300 ease-out ${
          isAnimating 
            ? 'translate-y-0 opacity-100 scale-100' 
            : 'translate-y-[-100%] opacity-0 scale-95'
        }`}
      >
        <div className={`rounded-lg shadow-xl border-l-4 p-4 backdrop-blur-sm ${
          type === 'success' 
            ? 'bg-green-50/95 border-green-400 shadow-green-100/50' 
            : 'bg-red-50/95 border-red-400 shadow-red-100/50'
        }`}>
          <div className="flex items-start">
            {/* Icon với animation */}
            <div className={`flex-shrink-0 transform transition-all duration-500 ${
              isAnimating ? 'scale-100 rotate-0' : 'scale-0 rotate-45'
            }`}>
              {type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-green-500 drop-shadow-sm" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500 drop-shadow-sm" />
              )}
            </div>
            
            {/* Message với slide animation */}
            <div className={`ml-3 flex-1 transform transition-all duration-400 delay-100 ${
              isAnimating ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'
            }`}>
              <p className={`text-sm font-medium leading-relaxed ${
                type === 'success' ? 'text-green-800' : 'text-red-800'
              }`}>
                {message}
              </p>
            </div>
            
            {/* Close button với hover animation */}
            <div className={`ml-auto pl-3 transform transition-all duration-300 delay-200 ${
              isAnimating ? 'translate-x-0 opacity-100' : 'translate-x-2 opacity-0'
            }`}>
              <button
                onClick={handleClose}
                className={`inline-flex rounded-full p-1.5 transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:scale-105 ${
                  type === 'success' 
                    ? 'text-green-500 hover:bg-green-100 hover:text-green-600 focus:ring-green-500' 
                    : 'text-red-500 hover:bg-red-100 hover:text-red-600 focus:ring-red-500'
                }`}
                aria-label="Close notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {/* Progress bar animation */}
          <div className={`mt-3 w-full bg-white/30 rounded-full h-1 overflow-hidden ${
            isAnimating ? 'opacity-100' : 'opacity-0'
          }`}>
            <div 
              className={`h-full rounded-full transition-all linear ${
                type === 'success' ? 'bg-green-400' : 'bg-red-400'
              }`}
              style={{
                width: isAnimating ? '0%' : '100%',
                transition: `width ${duration}ms linear`,
                transitionDelay: '500ms'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Toast;