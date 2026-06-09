import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight, Eye, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// 🔹 User requested specific images from assets
import entrance from '../../assets/entrance.png';
import entrancee from '../../assets/entrancee.png';
import gallery from '../../assets/gallery.png';
import hall from '../../assets/hall.png';
import imageCopy9 from '../../assets/image copy 9.png';
import imageCopy from '../../assets/image copy.png';
import imageMain from '../../assets/image.png';
import outsideview from '../../assets/outersideview.png';
import outerside from '../../assets/outerside.png';
import rooftop from '../../assets/rooftop.png';
import sideGallery from '../../assets/side gallery .png';
import uperview from '../../assets/uperview.jpeg';

export const DEFAULT_AMBIANCE_IMAGES = [
  outerside,
  entrance,
  entrancee,
  gallery,
  hall,
  imageCopy9,
  imageCopy,
  imageMain,
  outsideview,
  rooftop,
  sideGallery,
  uperview
];

export default function Gallery({ images = DEFAULT_AMBIANCE_IMAGES }: { images?: string[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const openModal = (index: number) => {
    setCurrentIndex(index);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  const nextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <section id="gallery" className="py-32 bg-rose-950/20 scroll-mt-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="text-center mb-20">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-2 mb-4"
          >
            <span className="w-8 h-[1px] bg-amber-400"></span>
            <span className="text-amber-400 text-[10px] font-black uppercase tracking-[0.4em]">Visual Journey</span>
            <span className="w-8 h-[1px] bg-amber-400"></span>
          </motion.div>
          <h2 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight">
            Our <span className="text-rose-400 italic font-light">Ambiance</span>
          </h2>
          <p className="text-rose-100/40 max-w-xl mx-auto font-medium text-lg italic">
            "A glance into our beautifully designed heritage space and culinary creations."
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {images.map((src, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: (index % 3) * 0.15 }}
              className="relative overflow-hidden rounded-[32px] group cursor-pointer h-[450px] shadow-2xl border border-white/10 hover:border-amber-400/30 transition-colors duration-500"
              onClick={() => openModal(index)}
            >
              {/* Image Container */}
              <div className="w-full h-full overflow-hidden">
                <img
                  src={src}
                  alt={`Hotel King's Imperial Gallery ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />
              </div>

              {/* Shine Effect Overlay */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
                 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shine_1.5s_ease-in-out_infinite]"></div>
              </div>

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-rose-950/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center pointer-events-none">
                <motion.div 
                  initial={{ scale: 0.5, opacity: 0, rotate: -45 }}
                  whileHover={{ scale: 1, opacity: 1, rotate: 0 }}
                  className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-2xl"
                >
                  <Eye className="text-amber-400" size={32} />
                </motion.div>
                
                {/* Floating Label */}
                <div className="absolute bottom-10 left-0 right-0 text-center transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                   <div className="text-white font-black text-xs tracking-[0.3em] uppercase">Expand View</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] bg-rose-950/98 backdrop-blur-xl flex items-center justify-center p-4 md:p-10" 
              onClick={closeModal}
            >
              <button 
                className="absolute top-8 right-8 text-white/50 hover:text-white transition-all z-[10000] bg-white/5 p-4 rounded-full hover:rotate-90 border border-white/10" 
                onClick={closeModal}
              >
                <X size={32} />
              </button>
  
              <button 
                className="absolute left-6 md:left-12 w-16 h-16 md:w-24 md:h-24 rounded-full bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-all z-[10000] backdrop-blur-md border border-white/10 group" 
                onClick={prevImage}
              >
                <ChevronLeft size={48} className="group-hover:-translate-x-2 transition-transform" />
              </button>
  
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative max-w-7xl w-full flex items-center justify-center" 
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src={images[currentIndex]}
                  alt="Preview"
                  className="max-h-[80vh] w-auto object-contain rounded-[40px] shadow-[0_0_100px_rgba(0,0,0,0.8)] border border-white/10"
                />
                
                <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 text-white/40 text-xs font-black tracking-[0.5em] uppercase">
                  {currentIndex + 1} / {images.length}
                </div>
              </motion.div>
  
              <button 
                className="absolute right-6 md:right-12 w-16 h-16 md:w-24 md:h-24 rounded-full bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-all z-[10000] backdrop-blur-md border border-white/10 group" 
                onClick={nextImage}
              >
                <ChevronRight size={48} className="group-hover:translate-x-2 transition-transform" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </section>
  );
}
