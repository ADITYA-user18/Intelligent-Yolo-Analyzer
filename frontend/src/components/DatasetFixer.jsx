import React, { useState, useCallback, useMemo } from 'react';
import api from '../api/client'; // ✅ Use Centralized API Client
import { motion, AnimatePresence } from 'framer-motion';
import { Wrench, ShieldCheck, FolderTree, Zap, Settings, Download, ArrowRight, Loader2 } from 'lucide-react';
import { useAgent } from '../context/AgentContext';
import { toast } from 'sonner';

const DatasetFixer = () => {
  const { updateProgress, sessionId, includeTestSplit, setIncludeTestSplit } = useAgent();
  const [isFixing, setIsFixing] = useState(false);
  const [fixComplete, setFixComplete] = useState(false);
  const [fixLogs, setFixLogs] = useState([]);

  // ✅ BACKEND CALL (Fixed 401 via centralized client)
  const startNeuralRepair = async () => {
    setIsFixing(true);
    setFixLogs(["Connecting to Neural Engine...", "Preparing dataset conversion..."]);

    try {
      const response = await api.post(
        `/convert/${sessionId}`,
        null,
        {
          params: { include_test: includeTestSplit }
        }
      );

      if (response.data?.status === "success") {
        setFixLogs(prev => [...prev, "Applying fixes...", "Finalizing dataset...", "Conversion complete"]);
        setFixComplete(true);
        toast.success("Intelligence Audit: Dataset repaired and standardized.");
      } else {
        toast.error("Repair Protocol Failed: " + (response.data?.message || "Internal error"));
      }

    } catch (error) {
      console.error(error);
      const msg = error.response?.status === 401 ? "Session Expired: Please Login again." : "Connection Interrupted: Neural Engine is offline.";
      toast.error(msg);
    } finally {
      setIsFixing(false);
    }
  };

  const handleDownload = async () => {
    try {
      toast.info("Preparing Neural Download...");
      const response = await api.get(`/download/${sessionId}`, {
        responseType: 'blob'
      });

      // Create local URL for the blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'yolo_expert_dataset.zip');
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success("Download Initiated.");
    } catch (error) {
      console.error(error);
      toast.error("Download Failed: Session expired or file missing.");
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8">
        <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-ui-card border border-ui-border rounded-[2.5rem] overflow-hidden shadow-2xl"
      >
        {/* HEADER */}
        <div className="p-10 border-b border-ui-border bg-gradient-to-r from-ui-accent/5 to-transparent">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-ui-accent/10 rounded-2xl text-ui-accent">
              <Wrench size={28} />
            </div>
            <div>
              <h2 className="text-3xl font-black text-ui-text tracking-tight uppercase">DATASET REPAIR</h2>
              <p className="text-ui-muted text-sm font-bold uppercase tracking-tight opacity-70">Neural standardization & format alignment</p>
            </div>
          </div>
        </div>

        <div className="p-10 grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* LEFT */}
          <div className="space-y-8">
            <div className="p-8 rounded-3xl bg-ui-surface border border-ui-border shadow-inner">
              <h3 className="text-ui-text font-black text-sm mb-6 flex items-center gap-2 uppercase tracking-widest">
                <Settings size={18} className="text-ui-accent" />
                Standardization Settings
              </h3>
              
              <div className="flex items-center justify-between p-4 rounded-2xl bg-ui-card border border-ui-border mb-4">
                <div>
                  <p className="text-ui-text text-sm font-black uppercase tracking-tight">Include Test Split?</p>
                  <p className="text-[10px] text-ui-muted uppercase tracking-widest mt-1 font-bold">Recommended for production</p>
                </div>
                <button 
                  onClick={() => setIncludeTestSplit(!includeTestSplit)}
                  className={`w-14 h-7 rounded-full transition-all relative ${includeTestSplit ? 'bg-ui-accent shadow-[0_0_15px_rgba(0,255,136,0.3)]' : 'bg-ui-card-hover'}`}
                >
                  <motion.div 
                    layout
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    animate={{ x: includeTestSplit ? 32 : 4 }}
                    className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-lg"
                  />
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-ui-accent/5 border border-ui-accent/10">
                <p className="text-[11px] text-ui-accent leading-relaxed italic font-bold">
                  "The agent will automatically move images into /images/train and /labels/train directories to ensure 100% compatibility with Ultralytics YOLO."
                </p>
              </div>
            </div>

            {!fixComplete && !isFixing && (
              <motion.button 
                whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(0,255,136,0.3)" }}
                whileTap={{ scale: 0.98 }}
                onClick={startNeuralRepair}
                className="w-full bg-ui-accent text-black font-black py-5 rounded-2xl flex items-center justify-center gap-3 transition-all uppercase tracking-widest"
              >
                <Zap size={20} fill="currentColor" />
                START NEURAL REPAIR
              </motion.button>
            )}
          </div>

          {/* RIGHT */}
          <div className="relative min-h-[300px] rounded-3xl bg-ui-surface border border-ui-border p-8 overflow-hidden shadow-inner">
            <AnimatePresence mode="wait">
              
              {!isFixing && !fixComplete ? (
                <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-full">
                  <span className="text-[10px] font-black text-ui-muted tracking-[0.2em] uppercase mb-6">Target Structure</span>
                  <div className="space-y-4 font-mono text-xs text-ui-muted">
                    <div className="flex items-center gap-2 text-ui-accent font-bold uppercase"><FolderTree size={14}/> dataset_standardized/</div>
                    <div className="ml-4 border-l border-ui-border pl-4 py-1 flex items-center gap-2 font-bold uppercase">├── images/ <span className="text-[8px] bg-ui-accent/10 text-ui-accent px-2 rounded">train, val{includeTestSplit && ', test'}</span></div>
                    <div className="ml-4 border-l border-ui-border pl-4 py-1 flex items-center gap-2 font-bold uppercase">├── labels/ <span className="text-[8px] bg-ui-accent/10 text-ui-accent px-2 rounded">train, val{includeTestSplit && ', test'}</span></div>
                    
                    <AnimatePresence>
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="ml-4 border-l border-ui-border pl-4 py-1 text-ui-purple font-black uppercase"
                      >
                        └── data.yaml
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </motion.div>

              ) : isFixing ? (
                <motion.div key="fixing" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <Loader2 className="animate-spin text-ui-accent mb-4" />
                  {fixLogs.map((log, i) => (
                    <div key={i} className="text-ui-muted text-xs font-bold uppercase tracking-tight mb-1">{log}</div>
                  ))}
                </motion.div>

              ) : (
                <motion.div key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                  <Download className="mx-auto mb-4 text-ui-accent" size={28} />
                  <h4 className="text-ui-text font-black mb-2 uppercase">Dataset Standardized</h4>

                  <motion.button 
                    whileHover={{ scale: 1.05, backgroundColor: "var(--ui-card-hover)" }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleDownload}
                    className="w-full py-4 border border-ui-border rounded-xl text-xs font-black uppercase transition-all text-ui-text"
                  >
                    DOWNLOAD CORRECTED ZIP
                  </motion.button>

                  <motion.button 
                    whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(168, 85, 247, 0.4)" }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => updateProgress(3)}
                    className="w-full py-4 bg-ui-purple text-white rounded-xl text-xs font-black mt-3 uppercase"
                  >
                    PROCEED TO OPTIMIZATION
                  </motion.button>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DatasetFixer;