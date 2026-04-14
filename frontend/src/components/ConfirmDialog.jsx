import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X } from 'lucide-react';

const ConfirmDialog = ({ isOpen, title, message, onConfirm, onCancel }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />
          
          {/* Modal Content */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-md bg-ui-card border border-ui-border rounded-[2.5rem] p-10 shadow-2xl overflow-hidden glass"
          >
            {/* Decoration Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 blur-[50px] pointer-events-none" />
            
            <div className="absolute top-6 right-6">
              <button 
                onClick={onCancel} 
                className="p-2 text-ui-muted hover:text-ui-text hover:bg-ui-surface rounded-xl transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center text-red-500 mb-8 border border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.1)]">
                <AlertCircle size={40} />
              </div>
              
              <h3 className="text-2xl font-black text-ui-text tracking-tighter uppercase mb-3 italic">
                {title}
              </h3>
              <p className="text-ui-muted text-xs font-bold leading-relaxed uppercase tracking-widest opacity-60 mb-10 max-w-[280px]">
                {message}
              </p>

              <div className="flex gap-4 w-full">
                <button 
                  onClick={onCancel}
                  className="flex-1 px-6 py-4 rounded-2xl border border-ui-border text-ui-muted text-[10px] font-black tracking-widest uppercase hover:bg-ui-surface hover:text-ui-text transition-all"
                >
                  ABORT
                </button>
                <button 
                  onClick={() => {
                    onConfirm();
                    onCancel();
                  }}
                  className="flex-1 px-6 py-4 rounded-2xl bg-red-500 text-white text-[10px] font-black tracking-widest uppercase shadow-[0_10px_30px_rgba(239,68,68,0.3)] hover:brightness-110 active:scale-95 transition-all"
                >
                  PURGE DATA
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmDialog;
