import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, Loader2, ChevronRight } from 'lucide-react';
import { useAgent } from '../context/AgentContext';

const HyperparameterEngine = () => {
  const { sessionId, updateProgress, strategy, getAIStrategy } = useAgent();
  const [loading, setLoading] = useState(!strategy);
  const [activeTab, setActiveTab] = useState('train'); // train | aug | val

  useEffect(() => {
    if (!strategy) {
      getAIStrategy().finally(() => setLoading(false));
    }
  }, [strategy, getAIStrategy]);

  // Prevent crash if strategy is null
  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20">
      <Loader2 className="animate-spin text-ui-accent mb-4" size={40} />
      <p className="text-ui-muted font-mono text-[10px] tracking-widest animate-pulse">Neural reasoning in progress...</p>
    </div>
  );

  if (!strategy) return <div className="text-ui-text p-20 text-center">Error loading AI strategy.</div>;

  // Combine params for display based on tab
  const displayParams = 
    activeTab === 'train' ? strategy.train_params : 
    activeTab === 'aug' ? strategy.aug_params : strategy.val_params;

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        
        {/* ✅ REFINED HEADER reasoning */}
        <div className="bg-ui-card border border-ui-border p-10 rounded-[2.5rem] mb-8 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-ui-accent/5 blur-[100px] pointer-events-none" />
          
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-ui-accent/10 rounded-2xl text-ui-accent">
              <BrainCircuit size={32} />
            </div>
            <div>
              <span className="text-[10px] font-black text-ui-accent tracking-[0.3em] uppercase block mb-1">PROPOSED ARCHITECTURE</span>
              <h2 className="text-3xl font-black text-ui-text tracking-tighter uppercase">
                {strategy.recommended_model}
              </h2>
            </div>
          </div>

          <div className="relative">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-ui-accent/30 rounded-full" />
            <p className="text-ui-text text-lg font-semibold leading-relaxed pl-8 italic">
              {(strategy?.reasoning || "Analyzing neural weights...").replace(/###.*?\n/g, '').trim()}
            </p>
          </div>
        </div>

        {/* Tab Switching */}
        <div className="flex overflow-x-auto custom-scrollbar gap-3 mb-8 bg-ui-card border border-ui-border w-full md:w-fit p-1.5 rounded-2xl shadow-xl">
          {['train', 'aug', 'val'].map(tab => (
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-none px-6 md:px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
                activeTab === tab 
                  ? 'bg-ui-accent text-black shadow-[0_0_20px_rgba(0,255,136,0.2)]' 
                  : 'text-ui-muted hover:text-ui-text'
              }`}
            >
              {tab}
            </motion.button>
          ))}
        </div>

        {/* Dynamic Parameter Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <AnimatePresence mode="popLayout">
            {Object.entries(displayParams || {}).map(([key, value], i) => (
              <motion.div 
                key={`${activeTab}-${key}`}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                transition={{ delay: i * 0.05, type: "spring", stiffness: 300, damping: 25 }}
                whileHover={{ y: -5, borderColor: "var(--ui-accent)" }}
                className="bg-ui-card border border-ui-border p-8 rounded-[2rem] transition-all shadow-lg group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <BrainCircuit size={40} className="text-ui-accent" />
                </div>
                <span className="text-[10px] text-ui-muted font-black uppercase tracking-[0.2em] block mb-3">{key}</span>
                <span className="text-3xl font-black text-ui-text tracking-tighter">
                  {value !== undefined && value !== null ? String(value) : "---"}
                </span>
                
                {/* TOOLTIP STYLE EXPLANATION */}
                {strategy?.explanations?.[key] && (
                  <p className="mt-4 text-[10px] text-ui-muted font-bold leading-tight opacity-0 group-hover:opacity-100 transition-opacity">
                    {strategy.explanations[key]}
                  </p>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <motion.button 
          whileHover={{ scale: 1.02, boxShadow: "0 0 40px rgba(0,255,136,0.3)" }}
          whileTap={{ scale: 0.98 }}
          onClick={() => updateProgress(4)}
          className="w-full bg-ui-accent text-black font-black py-6 rounded-[2rem] flex items-center justify-center gap-4 transition-all shadow-2xl text-sm tracking-[0.2em] uppercase"
        >
          CONTINUE TO CODE GENERATION <ChevronRight size={20} />
        </motion.button>

      </motion.div>
    </div>
  );
};

export default HyperparameterEngine;