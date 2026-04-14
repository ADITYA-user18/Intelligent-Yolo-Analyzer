import React, { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../api/client';
import { useAuth } from './AuthContext';
import { AgentContext } from './ContextBase';
import { toast } from 'sonner';

// ✅ Robust Storage Access
const getSafeData = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return (key === 'datasetStats' || key === 'strategy') ? JSON.parse(raw) : raw;
  } catch (err) {
    console.warn(`🔄 Neural Engine: Sync reset for key [${key}]`);
    localStorage.removeItem(key);
    return fallback;
  }
};

export const AgentProvider = ({ children }) => {
  const { token } = useAuth();

  // DASHBOARD STATE
  const [sessionId, setSessionId] = useState(() => localStorage.getItem('sessionId') || null);
  const [currentStep, setCurrentStep] = useState(() => parseInt(localStorage.getItem('currentStep')) || 0);
  const [datasetStats, setDatasetStats] = useState(() => getSafeData('datasetStats', null));
  const [includeTestSplit, setIncludeTestSplit] = useState(() => localStorage.getItem('includeTestSplit') === 'true');
  const [strategy, setStrategy] = useState(() => getSafeData('strategy', null));
  const [isProcessing, setIsProcessing] = useState(false);
  const [sessions, setSessions] = useState([]);

  // Persistence Synchronization
  useEffect(() => {
    if (sessionId) {
      localStorage.setItem('sessionId', sessionId);
      localStorage.setItem('currentStep', currentStep.toString());
      localStorage.setItem('datasetStats', JSON.stringify(datasetStats));
      localStorage.setItem('includeTestSplit', includeTestSplit.toString());
      if (strategy) localStorage.setItem('strategy', JSON.stringify(strategy));
    }
  }, [sessionId, currentStep, datasetStats, includeTestSplit, strategy]);

  const fetchSessions = useCallback(async () => {
    const actToken = token || localStorage.getItem('token');
    if (!actToken) return;
    try {
      const res = await api.get('/sessions');
      if (res.data.status === "success") {
        setSessions(res.data.sessions);
      }
    } catch (e) {
      console.error("Dashboard history sync failed", e);
    }
  }, [token]);

  useEffect(() => {
    if (token) fetchSessions();
  }, [token, fetchSessions]);

  const restoreSession = useCallback(async () => {
    const actToken = token || localStorage.getItem('token');
    if (!actToken) return;
    try {
      const res = await api.get('/sessions/latest');
      if (res.data.status === "success") {
        const s = res.data.session;
        setSessionId(s.session_id);
        setCurrentStep(s.current_step);
        setDatasetStats(s.report);
        setStrategy(s.strategy);
      }
    } catch (e) {
      console.log("No active session detected for auto-restoration");
    }
  }, [token]);

  const switchToSession = useCallback(async (sid) => {
    try {
      setIsProcessing(true);
      setStrategy(null); 
      const res = await api.get(`/sessions/${sid}`);
      if (res.data.status === "success") {
        const s = res.data.session;
        setDatasetStats(s.report);
        setStrategy(s.strategy);
        setSessionId(s.session_id);
        setCurrentStep(s.current_step);
        
        const idx = sessions.findIndex(x => x.session_id === sid);
        const expName = idx !== -1 ? `EXPERIMENT ${sessions.length - idx}` : 'DATASET';
        toast.success(`Active Workspace: ${expName}`);
      }
    } catch (err) {
      toast.error("Failed to restore neural context");
    } finally {
      setIsProcessing(false);
    }
  }, [sessions]);

  const updateStats = useCallback((s) => {
    setDatasetStats(s);
    setStrategy(null);
  }, []);

  const getAIStrategy = useCallback(async () => {
    if (strategy) return strategy;
    if (!sessionId) return null;
    try {
      const res = await api.get(`/optimize/${sessionId}`);
      if (res.data.status === "success") {
        setStrategy(res.data.strategy);
        return res.data.strategy;
      }
    } catch (e) {
      console.error("AI engine failure", e);
    }
    return null;
  }, [sessionId, strategy]);

  const resetAgent = useCallback(() => {
    setSessionId(null);
    setCurrentStep(0);
    setDatasetStats(null);
    setStrategy(null);
    
    // Safety: ONLY remove specific agent keys, keep auth token!
    const agentKeys = ['sessionId', 'currentStep', 'datasetStats', 'strategy', 'includeTestSplit'];
    agentKeys.forEach(k => localStorage.removeItem(k));
    
    sessionStorage.setItem('bypassAutoRestore', 'true');
    
    // We KEEP the sessions list so history is visible
    toast.info("Active workspace purged.");
  }, []);

  const updateProgress = useCallback(async (step, specificSessionId = null) => {
    const targetSessionId = specificSessionId || sessionId || localStorage.getItem('sessionId');
    if (!targetSessionId) return;
    try {
      setCurrentStep(step);
      await api.patch(`/sessions/${targetSessionId}/step?step=${step}`);
      // Refresh session list so sidebar updates
      setSessions(prev => prev.map(s => 
        s.session_id === targetSessionId ? { ...s, current_step: step } : s
      ));
    } catch (e) {
      console.warn("Neural Progress Sync Failed:", e);
    }
  }, [sessionId]);

  const deleteSession = useCallback(async (sid) => {
    // 🧠 OPTIMISTIC UI: Remove from list immediately
    const prevSessions = [...sessions];
    setSessions(prev => prev.filter(x => x.session_id !== sid));
    
    // If purging active workspace, reset local context
    let wasActive = false;
    if (sid === sessionId) {
      wasActive = true;
      resetAgent();
    }

    try {
      const res = await api.delete(`/sessions/${sid}`);
      if (res.data.status === "success") {
         toast.success("Workspace purged instantly.");
      } else {
         throw new Error("Server storage cleanup failure");
      }
    } catch (err) {
      // ROLLBACK on failure
      setSessions(prevSessions);
      toast.error("Purge failed. Workspace restored.");
    }
  }, [sessionId, resetAgent, sessions]);

  const value = useMemo(() => ({
    sessions,
    fetchSessions,
    switchToSession,
    deleteSession,
    datasetStats,
    updateStats,
    isProcessing,
    setIsProcessing,
    currentStep,
    sessionId,
    setSessionId,
    setCurrentStep,
    includeTestSplit,
    setIncludeTestSplit,
    strategy,
    setStrategy,
    getAIStrategy,
    resetAgent,
    restoreSession,
    updateProgress  // Exposed for workflow tracking
  }), [sessions, fetchSessions, switchToSession, deleteSession, datasetStats, isProcessing, currentStep, sessionId, includeTestSplit, strategy, getAIStrategy, resetAgent, updateStats, restoreSession, updateProgress]);

  return (
    <AgentContext.Provider value={value}>
      {children}
    </AgentContext.Provider>
  );
};

export const useAgent = () => {
  const context = React.useContext(AgentContext);
  if (!context) throw new Error("useAgent must be used within AgentProvider");
  return context;
};