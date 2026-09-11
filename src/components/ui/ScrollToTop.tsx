import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export const ScrollToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      aria-label="Scroll to Top"
      className="fixed bottom-6 right-6 z-40 bg-[#D7FF3F] hover:bg-[#B8E638] text-[#050505] p-3 rounded-full border border-[#D7FF3F]/30 transition-all duration-200 hover:scale-105"
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  );
};
