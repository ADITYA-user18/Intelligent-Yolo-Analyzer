import React, { useState, useCallback } from 'react';
import api from '../api/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileArchive, CheckCircle2, Loader2, AlertCircle, X } from 'lucide-react';
import { useAgent } from '../context/AgentContext';
import { toast } from 'sonner';

const DatasetUpload = () => {
  const { updateStats, updateProgress, setSessionId, fetchSessions } = useAgent();
  
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('idle');
  const [analysisLogs, setAnalysisLogs] = useState([]);

  // ✅ Fixed Auth: Using Centralized API Client
  const uploadToBackend = async (file) => {
    setUploadStatus('processing');
    setAnalysisLogs(["Establishing connection to Neural Engine...", "Uploading Archive..."]);

    const formData = new FormData();
    formData.append('file', file);

    try {
      // ✅ Now using 'api' client to automatically inject token
      const response = await api.post('/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          if (percent < 100) {
            setAnalysisLogs(prev => [...prev.slice(-5), `Uploading: ${percent}%`]);
          }
        }
      });

      // ✅ SAFEGUARD CHECK
      if (response.data && response.data.status === "success") {
        setAnalysisLogs(prev => [...prev, "Extracting...", "Running Deep Audit...", "Finalizing Report..."]);
        toast.success("Intelligence Audit: Dataset ingested successfully!");

        updateStats(response.data.report);
        setSessionId(response.data.session_id);

        // ✅ Refresh Workspace Sidebar
        fetchSessions();

        setTimeout(() => {
          setUploadStatus('success');
          setTimeout(() => updateProgress(1, response.data.session_id), 1000);
        }, 1500);
      } else {
        throw new Error(response.data?.message || "Invalid response from server");
      }

    } catch (error) {
      setUploadStatus('idle');
      const msg = error.response?.data?.detail || error.message || "Neural Engine Error";
      toast.error(msg);
      // If it's a 401, the client interceptor handles the cleanup, we just show the message
    }
  };

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setIsDragging(true);
    else if (e.type === 'dragleave') setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.name.endsWith('.zip') || droppedFile.type.includes('zip'))) {
      setFile(droppedFile);
      setUploadStatus('uploading');
      uploadToBackend(droppedFile);
    } else {
      toast.error("Format mismatch: Please upload a .zip archive.");
    }
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto mt-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={uploadStatus === 'idle' ? { scale: 1.005, borderColor: "var(--ui-accent)" } : {}}
        className={`relative group rounded-[2.5rem] border-2 border-dashed transition-all duration-500 overflow-hidden shadow-2xl
          ${isDragging ? 'border-ui-accent bg-ui-accent/5' : 'border-ui-border bg-ui-card'}
          ${uploadStatus !== 'idle' ? 'border-solid border-ui-border' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <AnimatePresence mode="wait">

          {/* IDLE */}
          {uploadStatus === 'idle' && (
            <motion.div 
              key="idle"
              exit={{ opacity: 0, scale: 0.9 }}
              className="p-8 md:p-16 flex flex-col items-center text-center cursor-pointer"
            >
              <div className="w-20 h-20 bg-ui-accent/10 rounded-3xl flex items-center justify-center text-ui-accent mb-6 group-hover:scale-110 transition-transform duration-500 shadow-lg">
                <Upload size={32} />
              </div>
              <h2 className="text-2xl font-black text-ui-text mb-2 uppercase tracking-tighter">Drop your Dataset</h2>
              <p className="text-ui-muted max-w-xs mx-auto text-sm leading-relaxed font-bold uppercase tracking-tight opacity-70">
                Drag your .zip file here. Our agent will automatically structure and audit your labels.
              </p>
              <input 
                type="file" 
                className="absolute inset-0 opacity-0 cursor-pointer" 
                accept=".zip"
                onChange={(e) => {
                   if (e.target.files[0]) {
                     setFile(e.target.files[0]);
                     setUploadStatus('uploading');
                     uploadToBackend(e.target.files[0]);
                   }
                }}
              />
            </motion.div>
          )}

          {/* PROCESSING */}
          {(uploadStatus === 'uploading' || uploadStatus === 'processing') && (
            <motion.div 
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-8 md:p-16 flex flex-col items-center"
            >
              <div className="relative mb-8">
                <Loader2 className="w-16 h-16 text-ui-accent animate-spin" />
                <div className="absolute inset-0 blur-xl bg-ui-accent/20 animate-pulse" />
              </div>
              
              <h3 className="text-xl font-black text-ui-text mb-6 uppercase tracking-[0.2em]">Agent Analysis in Progress</h3>
              
              <div className="w-full max-w-md bg-ui-surface rounded-2xl p-6 font-mono text-[11px] border border-ui-border h-48 overflow-y-auto shadow-inner">
                {analysisLogs.map((log, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={i} 
                    className="flex gap-3 mb-2 text-ui-muted font-bold tracking-tight uppercase"
                  >
                    <span className="text-ui-accent select-none font-black">›</span>
                    <span>{log}</span>
                  </motion.div>
                ))}
                <div className="animate-pulse inline-block w-2 h-4 bg-ui-accent ml-2" />
              </div>
            </motion.div>
          )}

          {/* SUCCESS */}
          {uploadStatus === 'success' && (
            <motion.div 
              key="success"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="p-8 md:p-16 flex flex-col items-center text-center"
            >
              <div className="w-20 h-20 bg-ui-accent rounded-full flex items-center justify-center text-black mb-6 shadow-[0_0_40px_rgba(0,255,136,0.4)]">
                <CheckCircle2 size={40} />
              </div>
              <h2 className="text-3xl font-black text-ui-text mb-2 uppercase tracking-tighter">AUDIT COMPLETE</h2>
              <p className="text-ui-accent font-black text-xs uppercase tracking-[0.3em] font-mono">Preparing Intelligence Report...</p>
            </motion.div>
          )}

        </AnimatePresence>
      </motion.div>

      <div className="mt-8 flex items-center justify-center gap-2 text-gray-500 text-xs font-medium">
        <AlertCircle size={14} />
        <span>Datasets are processed locally. Only metadata is sent to the reasoning engine.</span>
      </div>
    </div>
  );
};

export default DatasetUpload;