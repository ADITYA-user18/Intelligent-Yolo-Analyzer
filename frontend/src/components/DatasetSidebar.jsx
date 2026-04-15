import { motion } from 'framer-motion';
import { Database, Plus, Clock, Box, Trash2 } from 'lucide-react';
import { useAgent } from '../context/AgentContext';
import { useState } from 'react';
import ConfirmDialog from './ConfirmDialog';

const DatasetSidebar = () => {
  const { sessions, sessionId, switchToSession, resetAgent, deleteSession } = useAgent();
  const [deleteId, setDeleteId] = useState(null);

  const handleDeleteRequest = (e, sid) => {
    e.stopPropagation();
    setDeleteId(sid);
  };

  return (
    <>
      <div className="w-full xl:w-80 flex-none h-[40vh] min-h-[300px] xl:h-[calc(100vh-120px)] bg-ui-surface backdrop-blur-xl border border-ui-border rounded-[2rem] flex flex-col p-6 overflow-hidden">
        
        {/* HEADER */}
        <div className="flex items-center justify-between mb-8 px-2">
          <h3 className="text-ui-text font-black text-xs tracking-[0.3em] uppercase flex items-center gap-2">
            <Database size={14} className="text-ui-accent" />
            WORKSPACES
          </h3>
          <motion.button 
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={resetAgent}
            className="p-2 bg-ui-accent/10 text-ui-accent rounded-xl border border-ui-accent/20 hover:bg-ui-accent hover:text-black transition-all"
            title="New Analysis"
          >
            <Plus size={16} />
          </motion.button>
        </div>

        {/* SESSION LIST */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
          {sessions.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-ui-muted text-[10px] uppercase font-bold tracking-widest leading-relaxed">
                No sessions found.<br/>Upload a dataset to begin.
              </p>
            </div>
          ) : (
            sessions.map((session, i) => (
              <motion.button
                key={session.session_id}
                whileHover={{ x: 5, backgroundColor: "var(--ui-card-hover)" }}
                onClick={() => switchToSession(session.session_id)}
                className={`w-full text-left p-4 rounded-2xl border transition-all group relative overflow-hidden ${
                  sessionId === session.session_id 
                    ? 'bg-ui-accent/10 border-ui-accent/40 shadow-[0_0_20px_rgba(0,255,136,0.1)]' 
                    : 'bg-ui-card border-ui-border hover:border-ui-accent/30'
                }`}
              >
                {/* Delete Icon Overlay */}
                <div 
                  onClick={(e) => handleDeleteRequest(e, session.session_id)}
                  className="absolute top-4 right-4 z-20 p-2 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 text-red-500/50 hover:text-red-500 rounded-lg transition-all"
                  title="Delete Experiment"
                >
                  <Trash2 size={14} />
                </div>

                <div className="flex flex-col gap-2 relative z-10">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] pr-8 font-black tracking-widest uppercase ${
                      sessionId === session.session_id ? 'text-ui-accent' : 'text-ui-muted'
                    }`}>
                      EXPERIMENT {sessions.length - i}
                    </span>
                    {sessionId === session.session_id && (
                      <motion.div 
                        layoutId="active-indicator"
                        className="w-1.5 h-1.5 bg-ui-accent rounded-full animate-pulse shadow-[0_0_10px_#00ff88]"
                      />
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3 text-ui-muted text-[9px] font-bold tracking-tighter uppercase mt-1">
                    <span className="flex items-center gap-1">
                      <Box size={10} /> {session.image_count} IMAGES
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={10} /> {new Date(session.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="mt-2 h-1 w-full bg-ui-border rounded-full overflow-hidden relative">
                    <div 
                      className="absolute top-0 left-0 h-full bg-ui-accent/50 transition-all duration-500 flex ease-in-out"
                      style={{ width: `${(session.current_step / 4) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Hover Glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-ui-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </motion.button>
            ))
          )}
        </div>

        {/* FOOTER */}
        <div className="mt-6 pt-6 border-t border-ui-border">
          <div className="p-4 rounded-2xl bg-ui-surface border border-ui-border flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-ui-purple/10 flex items-center justify-center text-ui-purple">
              <Database size={16} />
            </div>
            <div>
              <p className="text-ui-text text-[10px] font-black tracking-widest uppercase">Storage</p>
              <p className="text-ui-muted text-[9px] font-bold">{sessions.length} Models Trained</p>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog 
        isOpen={!!deleteId}
        title="Purge Experiment"
        message="This will permanently delete the dataset weights and audit results. This action cannot be undone."
        onConfirm={() => deleteSession(deleteId)}
        onCancel={() => setDeleteId(null)}
      />
    </>
  );
};

export default DatasetSidebar;
