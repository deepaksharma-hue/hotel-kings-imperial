import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import logo from '../../assets/logo.png';

export default function Preloader() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 1;
      });
    }, 20);

    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ y: '-100%', transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } }}
      className="fixed inset-0 z-[9999] bg-rose-950 flex flex-col items-center justify-center"
    >
      <div className="relative flex flex-col items-center">
        {/* Animated Logo / Text */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="mb-12 flex flex-col items-center"
        >
          {/* Logo added here */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="w-20 h-20 bg-amber-400 rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(163,230,53,0.3)] overflow-hidden mb-6"
          >
            <img src={logo} alt="Logo" className="w-full h-full object-cover scale-110" />
          </motion.div>

          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter flex items-center gap-2">
            HOTEL KING'S <span className="text-amber-400 italic">IMPERIAL</span>
          </h1>
          <div className="h-[1px] w-full bg-white/20 mt-4 relative overflow-hidden">
             <motion.div 
               className="absolute inset-0 bg-amber-400"
               style={{ width: `${progress}%` }}
             />
          </div>
        </motion.div>

        {/* Counter */}
        <div className="overflow-hidden h-20">
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: '0%' }}
            className="text-8xl md:text-[120px] font-black text-white/5 tabular-nums"
          >
            {progress}%
          </motion.div>
        </div>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-amber-400/60 text-xs font-bold uppercase tracking-[0.5em] mt-8"
        >
          Preparing your feast
        </motion.p>
      </div>

      {/* Background Decorative Circles */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-400/5 rounded-full blur-[100px]" />
    </motion.div>
  );
}
