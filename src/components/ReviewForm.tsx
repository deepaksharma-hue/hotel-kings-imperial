import React, { useState } from 'react';
import { Star, Send, ExternalLink, MessageSquareQuote } from 'lucide-react';
import { motion } from 'motion/react';

export default function ReviewForm() {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');

  const handlePostToGoogle = () => {
    // Official Google Review link for Hotel King's Imperial, Rau, Indore
    const googleReviewUrl = "https://www.google.com/search?q=Hotel+Kings+Imperial+Indore";
    window.open(googleReviewUrl, '_blank');
  };

  return (
    <div className="w-full bg-white/5 backdrop-blur-2xl rounded-[40px] border border-white/10 p-8 md:p-12 relative overflow-hidden group">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/5 blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-rose-500/5 blur-[100px] pointer-events-none"></div>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-amber-400/20 flex items-center justify-center border border-amber-400/30">
            <MessageSquareQuote className="text-amber-400" size={20} />
          </div>
          <span className="text-rose-400 text-xs font-bold tracking-[0.3em] uppercase">Feedback Loop</span>
        </div>

        <h3 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-4">
          Rate Your <span className="italic text-rose-100 font-light">Experience</span>
        </h3>
        <p className="text-white/60 font-medium mb-10 max-w-lg leading-relaxed">
          Your feedback helps us grow. Select a rating and share your thoughts. We'll help you post it to Google!
        </p>

        <div className="space-y-8">
          {/* Star Rating UI */}
          <div className="flex flex-col gap-3">
            <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Select Stars</span>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                  className="transition-all duration-300 transform hover:scale-125 focus:outline-none"
                >
                  <Star
                    size={32}
                    className={`${
                      star <= (hover || rating)
                        ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]"
                        : "text-white/20"
                    } transition-colors duration-200`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Review Text Area */}
          <div className="flex flex-col gap-3">
            <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Share Your Thoughts</span>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us what you loved about our food and ambiance..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white placeholder:text-white/20 focus:outline-none focus:border-amber-400/50 transition-colors min-h-[120px] resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              onClick={handlePostToGoogle}
              disabled={rating === 0}
              className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl font-black tracking-wide transition-all duration-300 shadow-xl ${
                rating > 0 
                ? "bg-amber-400 text-rose-950 hover:bg-amber-300 hover:shadow-amber-400/20 active:scale-95" 
                : "bg-white/5 text-white/20 cursor-not-allowed border border-white/5"
              }`}
            >
              <Send size={20} />
              Post on Google Reviews
              <ExternalLink size={16} className="opacity-50" />
            </button>
            
            <button
              className="px-8 py-4 rounded-2xl border border-white/10 text-white font-bold hover:bg-white/5 transition-all active:scale-95"
              onClick={() => {setRating(0); setComment('');}}
            >
              Reset
            </button>
          </div>
        </div>

        {/* Dynamic Tip */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: rating > 0 ? 1 : 0, y: rating > 0 ? 0 : 10 }}
          className="mt-8 flex items-center gap-3 text-amber-400/60 text-xs font-medium italic"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-amber-400/60 animate-pulse"></div>
          Clicking "Post" will take you directly to our official Google Review page!
        </motion.div>
      </div>

      {/* Decorative large icon in background */}
      <div className="absolute -bottom-10 -right-10 opacity-[0.03] rotate-12 pointer-events-none group-hover:rotate-0 transition-transform duration-1000">
        <Star size={300} className="fill-white" />
      </div>
    </div>
  );
}
