import { useState } from 'react';

export default function Tooltip({ children, content, side = 'top' }) {
  const [isVisible, setIsVisible] = useState(false);

  const sideClasses = {
    top: 'bottom-full mb-2 left-1/2 -translate-x-1/2',
    bottom: 'top-full mt-2 left-1/2 -translate-x-1/2',
    left: 'right-full mr-2 top-1/2 -translate-y-1/2',
    right: 'left-full ml-2 top-1/2 -translate-y-1/2',
  };

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>
      {isVisible && (
        <div
          className={`absolute ${sideClasses[side]} bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-50`}
        >
          {content}
          <div className="absolute w-2 h-2 bg-gray-800 transform rotate-45" />
        </div>
      )}
    </div>
  );
}