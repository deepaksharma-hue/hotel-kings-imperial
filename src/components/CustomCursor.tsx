import React, { useEffect, useState } from 'react';
import { motion, useSpring, useMotionValue, AnimatePresence } from 'motion/react';

type CursorState = 'default' | 'button' | 'link' | 'gallery' | 'add' | 'input' | 'call' | 'chat';

interface Ripple {
  id: number;
  x: number;
  y: number;
}

export default function CustomCursor() {
  const [cursorState, setCursorState] = useState<CursorState>('default');
  const [cursorLabel, setCursorLabel] = useState<string>('');
  const [ripples, setRipples] = useState<Ripple[]>([]);
  
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  // Organic spring config for a smooth, high-end fluid trail effect
  const springConfig = { damping: 30, stiffness: 220, mass: 0.8 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    const handleHover = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      const telLink = target.closest('a[href^="tel:"]');
      const waLink = target.closest('a[href*="wa.me"]');
      const galleryCard = target.closest('#gallery .group') || target.closest('#upload-gallery .group');
      const textInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.closest('[contenteditable]');
      const btn = target.closest('button') || target.closest('[role="button"]');
      const genericLink = target.closest('a');

      if (telLink) {
        setCursorState('call');
        setCursorLabel('CALL');
      } else if (waLink) {
        setCursorState('chat');
        setCursorLabel('CHAT');
      } else if (galleryCard) {
        setCursorState('gallery');
        setCursorLabel('VIEW');
      } else if (textInput) {
        setCursorState('input');
        setCursorLabel('TYPE');
      } else if (btn) {
        const btnText = (btn as HTMLElement).innerText || '';
        if (btnText.toUpperCase().includes('ADD') || btnText.toUpperCase().includes('ESTIMATE')) {
          setCursorState('add');
          setCursorLabel('+ ADD');
        } else {
          setCursorState('button');
          setCursorLabel('');
        }
      } else if (genericLink) {
        setCursorState('link');
        setCursorLabel('');
      } else {
        setCursorState('default');
        setCursorLabel('');
      }
    };

    const handleClick = (e: MouseEvent) => {
      const newRipple: Ripple = {
        id: Date.now() + Math.random(),
        x: e.clientX,
        y: e.clientY,
      };
      setRipples((prev) => [...prev, newRipple]);
    };

    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mouseover', handleHover);
    window.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mouseover', handleHover);
      window.removeEventListener('click', handleClick);
    };
  }, [cursorX, cursorY]);

  // Clean up ripples after their animation finishes
  useEffect(() => {
    if (ripples.length > 0) {
      const timer = setTimeout(() => {
        setRipples((prev) => prev.slice(1));
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [ripples]);

  // Define sizes, colors, and border styles for each state
  const getStylesByState = () => {
    switch (cursorState) {
      case 'gallery':
        return {
          size: 72,
          borderColor: 'rgba(251, 191, 36, 0.8)', // amber-400
          backgroundColor: 'rgba(2, 44, 34, 0.45)', // dark emerald
          boxShadow: '0 0 20px rgba(251, 191, 36, 0.3)',
          innerDotScale: 0,
        };
      case 'add':
        return {
          size: 68,
          borderColor: 'rgba(244, 63, 94, 0.8)', // rose-500
          backgroundColor: 'rgba(159, 18, 57, 0.3)', // deep rose
          boxShadow: '0 0 20px rgba(244, 63, 94, 0.3)',
          innerDotScale: 0,
        };
      case 'call':
      case 'chat':
        return {
          size: 68,
          borderColor: cursorState === 'chat' ? '#25D366' : 'rgba(251, 191, 36, 0.8)',
          backgroundColor: cursorState === 'chat' ? 'rgba(37, 211, 102, 0.15)' : 'rgba(251, 191, 36, 0.15)',
          boxShadow: cursorState === 'chat' ? '0 0 20px rgba(37, 211, 102, 0.4)' : '0 0 20px rgba(251, 191, 36, 0.4)',
          innerDotScale: 0,
        };
      case 'input':
        return {
          size: 40,
          borderColor: 'rgba(255, 255, 255, 0.6)',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          boxShadow: '0 0 10px rgba(255, 255, 255, 0.1)',
          innerDotScale: 0,
        };
      case 'button':
      case 'link':
        return {
          size: 48,
          borderColor: 'rgba(251, 191, 36, 0.9)',
          backgroundColor: 'rgba(251, 191, 36, 0.1)',
          boxShadow: '0 0 15px rgba(251, 191, 36, 0.25)',
          innerDotScale: 0.4,
        };
      case 'default':
      default:
        return {
          size: 28,
          borderColor: 'rgba(255, 255, 255, 0.5)',
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          boxShadow: '0 0 8px rgba(255, 255, 255, 0.08)',
          innerDotScale: 1,
        };
    }
  };

  const styles = getStylesByState();

  return (
    <>
      {/* Click Ripples */}
      <div className="fixed inset-0 pointer-events-none z-[10001] hidden md:block">
        <AnimatePresence>
          {ripples.map((ripple) => (
            <motion.div
              key={ripple.id}
              initial={{
                position: 'fixed',
                left: ripple.x,
                top: ripple.y,
                width: 4,
                height: 4,
                x: '-50%',
                y: '-50%',
                borderRadius: '50%',
                border: '1.5px solid rgba(251, 191, 36, 0.7)',
                backgroundColor: 'rgba(251, 191, 36, 0.1)',
                opacity: 1,
                scale: 1,
              }}
              animate={{
                scale: 15,
                opacity: 0,
                borderColor: 'rgba(244, 63, 94, 0)',
                backgroundColor: 'rgba(244, 63, 94, 0)',
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Custom Cursor Containers */}
      <div className="fixed inset-0 pointer-events-none z-[10000] hidden md:block select-none">
        
        {/* Outer Ring */}
        <motion.div
          style={{
            translateX: cursorXSpring,
            translateY: cursorYSpring,
            x: '-50%',
            y: '-50%',
          }}
          className="fixed top-0 left-0 rounded-full flex items-center justify-center backdrop-blur-[2px] transition-colors duration-200"
          animate={{
            width: styles.size,
            height: styles.size,
            borderColor: styles.borderColor,
            backgroundColor: styles.backgroundColor,
            boxShadow: styles.boxShadow,
            borderWidth: cursorState === 'input' ? '1.5px' : '1px',
          }}
          transition={{
            type: 'spring',
            damping: 25,
            stiffness: 200,
            mass: 0.5,
          }}
        >
          {/* Label text inside the expanding ring */}
          <AnimatePresence mode="wait">
            {cursorLabel && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8, y: 5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -5 }}
                transition={{ duration: 0.15 }}
                className={`text-[9px] font-black tracking-[0.2em] select-none text-center ${
                  cursorState === 'add' ? 'text-rose-200' :
                  cursorState === 'chat' ? 'text-green-300' :
                  'text-amber-300'
                }`}
              >
                {cursorLabel}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Inner Tracking Dot */}
        <motion.div
          style={{
            translateX: cursorX,
            translateY: cursorY,
            x: '-50%',
            y: '-50%',
          }}
          className={`fixed top-0 left-0 w-2 h-2 rounded-full pointer-events-none transition-colors duration-300 ${
            cursorState === 'chat' ? 'bg-green-400 shadow-[0_0_8px_#25D366]' :
            cursorState === 'add' ? 'bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.6)]' :
            'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]'
          }`}
          animate={{
            scale: styles.innerDotScale,
            opacity: cursorState === 'input' ? 0 : 1,
          }}
          transition={{ duration: 0.2 }}
        />
      </div>
    </>
  );
}

