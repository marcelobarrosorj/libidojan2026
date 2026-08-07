import React, { useState, useRef } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ProtectedImage } from './ProtectedImage';

interface PhotoGalleryProps {
  photos: string[];
  initialIndex?: number;
  onClose: () => void;
}

export function PhotoGallery({ photos, initialIndex = 0, onClose, currentUser }: PhotoGalleryProps & { currentUser?: import('../types').User | null }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [dragStart, setDragStart] = useState<number | null>(null);

  const prevSlide = () => {
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : photos.length - 1));
  };

  const nextSlide = () => {
    setCurrentIndex(prev => (prev < photos.length - 1 ? prev + 1 : 0));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setDragStart(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (dragStart === null) return;
    const dragEnd = e.changedTouches[0].clientX;
    const distance = dragStart - dragEnd;

    // Minimum drag distance to trigger slide
    if (Math.abs(distance) > 50) {
      if (distance > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
    setDragStart(null);
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center overscroll-none touch-none"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-2 text-[var(--libido-muted)] opacity-70 hover:text-[var(--libido-text)] transition-colors bg-black/20 rounded-full"
        >
          <X className="w-6 h-6" />
        </button>

        {photos.length > 1 && (
          <div className="absolute top-6 left-0 right-0 flex justify-center gap-2 z-50">
             {photos.map((_, i) => (
               <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i === currentIndex ? 'w-8 bg-[var(--libido-accent)]' : 'w-2 bg-white/30'}`} />
             ))}
          </div>
        )}

        <div 
          className="relative w-full h-full flex items-center justify-center overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={currentIndex}
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="max-w-full max-h-full flex items-center justify-center w-full h-full"
            >
              <ProtectedImage
                currentUser={currentUser}
                src={photos[currentIndex]}
                className="max-w-full max-h-full"
                style={{ objectFit: 'contain' }}
              />
            </motion.div>
          </AnimatePresence>

          {photos.length > 1 && (
            <>
               <button 
                  onClick={(e) => { e.stopPropagation(); prevSlide(); }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/30 text-[var(--libido-text)] hover:bg-black/50 hover:text-[var(--libido-accent)] transition-colors hidden sm:block"
               >
                 <ChevronLeft className="w-6 h-6" />
               </button>
               <button 
                  onClick={(e) => { e.stopPropagation(); nextSlide(); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/30 text-[var(--libido-text)] hover:bg-black/50 hover:text-[var(--libido-accent)] transition-colors hidden sm:block"
               >
                 <ChevronRight className="w-6 h-6" />
               </button>

               {/* Invisible click targets for mobile explicit clicks on sides */}
               <div className="sm:hidden absolute left-0 top-1/4 bottom-1/4 w-1/4 z-40" onClick={(e) => { e.stopPropagation(); prevSlide(); }}></div>
               <div className="sm:hidden absolute right-0 top-1/4 bottom-1/4 w-1/4 z-40" onClick={(e) => { e.stopPropagation(); nextSlide(); }}></div>
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
