import React, { useState, useCallback, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ArrowLeft, Loader2, Cpu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

// Performance Optimized Hooks & Context
import { useAgent } from "../context/AgentContext";
import { useAuth } from "../context/AuthContext";

// Specialized UI Components
import TextType from "../responsive/TextType";
import AIbg from "../responsive/AIbg";
import FloatingLines from "../responsive/FloatingLines";

// Agent Workflow Modules
import DatasetUpload from "../components/DatasetUpload";
import IntelligenceReport from "../components/IntelligenceReport";
import DatasetFixer from "../components/DatasetFixer";
import HyperparameterEngine from "../components/HyperparameterEngine";
import CodeGenerator from "../components/CodeGenerator";
import DatasetSidebar from "../components/DatasetSidebar";
import WorkflowNav from "../components/WorkflowNav";

const Home = ({ isAgentMode = false }) => {
  const [isAgentInitialized, setIsAgentInitialized] = useState(isAgentMode);
  const { currentStep, resetAgent, sessionId, restoreSession, sessions, isProcessing } = useAgent();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Restore session if user is logged in but context is empty
  useEffect(() => {
    if (user && !sessionId && sessionStorage.getItem('bypassAutoRestore') !== 'true') {
      restoreSession();
    }
  }, [user, sessionId, restoreSession]);

  const [isLightMode, setIsLightMode] = useState(false);
  useEffect(() => {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    setIsLightMode(isLight);
    
    const observer = new MutationObserver(() => {
       setIsLightMode(document.documentElement.getAttribute('data-theme') === 'light');
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  // Sync state with prop (for routing)
  useEffect(() => {
    setIsAgentInitialized(isAgentMode);
  }, [isAgentMode]);

  const animationProps = {
    initial: { opacity: 0, scale: 0.98 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.98 },
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
  };

  const containerVars = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 },
    },
    exit: {
      opacity: 0,
      scale: 0.98,
      transition: { duration: 0.4, ease: "easeInOut" },
    },
  };

  const itemVars = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
    },
  };

  const features = useMemo(() => [
    {
      gif: "/right-decision.gif",
      title: "Automated Audit",
      desc: "Detection of corrupted labels and non-normalized coordinates.",
    },
    {
      gif: "/wave-graph.gif",
      title: "Class Imbalance",
      desc: "Statistical weighting logic for small or rare object detection.",
    },
    {
      gif: "/brain.gif",
      title: "Smart HPO",
      desc: "Hyperparameter generation based on object density and resolution.",
    },
  ], []);

  const handleInitializeAgent = useCallback(() => {
    navigate('/agent');
  }, [navigate]);

  const floatingColors = isLightMode ? ["#ff0077", "#ff3399"] : ["#00ff88", "#00cc66"];

  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-ui-bg">
      <div className="absolute inset-0 z-0 pointer-events-none transition-all duration-500" style={{ mixBlendMode: isLightMode ? 'multiply' : 'screen', filter: isLightMode ? 'invert(1)' : 'none', opacity: 0.6 }}>
        <FloatingLines 
          linesGradient={floatingColors} 
          enabledWaves={['top', 'bottom']}
          interactive={false} 
          animationSpeed={0.8}
          mixBlendMode="normal"
        />
      </div>

      {/* GLOBAL NEURAL SYNC LOADER */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-ui-bg/80 backdrop-blur-2xl flex flex-col items-center justify-center"
          >
            <motion.div 
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="relative mb-8"
            >
              <div className="absolute inset-0 bg-ui-accent/20 blur-[50px] rounded-full animate-pulse" />
              <div className="w-24 h-24 bg-ui-accent/10 border-2 border-ui-accent/30 rounded-3xl flex items-center justify-center text-ui-accent relative z-10">
                <Cpu size={48} className="animate-spin-slow" />
              </div>
            </motion.div>
            <h2 className="text-ui-text font-black text-xs tracking-[0.5em] uppercase mb-2">Neural Syncing</h2>
            <p className="text-ui-accent/50 text-[10px] font-black tracking-widest uppercase animate-pulse">Switching Processing Context...</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 w-full px-6 py-12 lg:py-20">
        <AnimatePresence mode="wait">
          {!isAgentInitialized ? (
            <motion.div
              key="hero-landing"
              variants={containerVars}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="flex flex-col items-center text-center container mx-auto"
            >
              <motion.div
                variants={itemVars}
                className="px-4 py-1.5 rounded-full border border-ui-accent/20 bg-ui-accent/5 text-ui-accent text-[10px] font-bold tracking-[0.2em] uppercase mb-12"
              >
                Production-Grade AI Optimization
              </motion.div>

              <motion.div 
                variants={itemVars}
                className="flex items-center justify-center gap-6 mb-12 mix-blend-screen"
                style={{ mixBlendMode: isLightMode ? 'multiply' : 'screen' }}
              >
                <div className="w-32 h-32 flex items-center justify-center relative group rounded-[2.5rem] overflow-hidden"
                     style={{
                       maskImage: 'radial-gradient(circle at center, black 60%, transparent 85%)',
                       WebkitMaskImage: 'radial-gradient(circle at center, black 60%, transparent 85%)'
                     }}
                >
                  <img 
                    src="/logo.gif" 
                    alt="Neural Hub" 
                    className="w-[120%] h-[120%] object-cover group-hover:scale-110 transition-transform duration-700"
                    style={{ 
                      filter: isLightMode ? 'none' : 'invert(1) hue-rotate(180deg) brightness(1.2)'
                    }}
                  />
                  {/* Neural Glow Core */}
                  <div className="absolute inset-0 bg-ui-accent/30 blur-[40px] rounded-full animate-pulse -z-10" />
                </div>
              </motion.div>

              <motion.h1
                variants={itemVars}
                className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-8 flex flex-col items-center w-full"
              >
                <div className="w-full overflow-hidden">
                  <TextType
                    text="YOUR DATASET"
                    typingSpeed={50}
                    pauseDuration={999999}
                    loop={false}
                    showCursor={false}
                    className="block w-full text-center text-ui-text"
                  />
                </div>
                <div className="w-full overflow-hidden text-ui-accent">
                  <TextType
                    text="OUR INTELLIGENCE.."
                    typingSpeed={50}
                    pauseDuration={999999}
                    loop={false}
                    className="block w-full text-center"
                  />
                </div>
              </motion.h1>

              <motion.p
                variants={itemVars}
                className="max-w-2xl text-ui-muted text-lg md:text-xl font-medium leading-relaxed mb-12"
              >
                Stop guessing hyperparameters. Our agent deep-scans your YOLO
                annotations, identifies flaws, and engineers the exact
                configuration for production-level mAP.
              </motion.p>

              <motion.div variants={itemVars} className="flex flex-col sm:flex-row gap-4 mb-20">
                <button
                  onClick={handleInitializeAgent}
                  className="group relative bg-ui-accent text-black font-bold px-12 py-5 rounded-3xl flex items-center gap-4 overflow-hidden transition-all hover:pr-14 active:scale-95 shadow-[0_0_50px_rgba(0,255,136,0.3)]"
                >
                  <span className="relative z-10 tracking-tighter text-lg">START ANALYZING DATASET</span>
                  <ChevronRight className="w-6 h-6 transition-all group-hover:translate-x-2" />
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity" />
                </button>
              </motion.div>

              <motion.div variants={itemVars} className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
                {features.map((feature, i) => (
                  <div key={i} className="p-8 rounded-3xl bg-ui-card border border-ui-border text-left hover:border-ui-accent/30 transition-all group relative overflow-hidden shadow-xl">
                    <div className="w-16 h-16 mb-6 flex items-center justify-center bg-ui-surface border border-ui-border rounded-2xl group-hover:scale-110 transition-all duration-500 overflow-hidden shadow-inner">
                      <img
                        src={feature.gif}
                        alt={feature.title}
                        className="w-10 h-10 object-contain dark-blend-white transition-all duration-500"
                      />
                    </div>
                    <h3 className="text-ui-text font-black text-lg mb-2 uppercase tracking-tight">{feature.title}</h3>
                    <p className="text-ui-muted text-sm leading-relaxed font-bold uppercase tracking-tight opacity-70">{feature.desc}</p>
                  </div>
                ))}
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="agent-dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col xl:flex-row gap-6 xl:gap-8 max-w-[1600px] mx-auto w-full"
            >
              {/* SIDEBAR: History & Switching */}
              <DatasetSidebar />

              {/* MAIN CONTENT: Navigation & Workflow */}
              <div className="flex-1 flex flex-col">
                <WorkflowNav />

                <div className="flex-1">
                  <AnimatePresence mode="wait">
                    {currentStep === 0 && (
                      <motion.div key="step0" {...animationProps}>
                        <DatasetUpload />
                      </motion.div>
                    )}
                    {currentStep === 1 && (
                      <motion.div key="step1" {...animationProps}>
                        <IntelligenceReport />
                      </motion.div>
                    )}
                    {currentStep === 2 && (
                      <motion.div key="step2" {...animationProps}>
                        <DatasetFixer />
                      </motion.div>
                    )}
                    {currentStep === 3 && (
                      <motion.div key="step3" {...animationProps}>
                        <HyperparameterEngine />
                      </motion.div>
                    )}
                    {currentStep === 4 && (
                      <motion.div key="step4" {...animationProps}>
                        <CodeGenerator />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Home;