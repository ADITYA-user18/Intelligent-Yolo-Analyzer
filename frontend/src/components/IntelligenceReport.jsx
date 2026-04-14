import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Info, BarChart3, BoxSelect, Image as ImageIcon, Wrench } from 'lucide-react';
import { useAgent } from '../context/AgentContext';

// Memoized Score Gauge
const ScoreGauge = React.memo(({ score }) => {
  const strokeDashoffset = 440 - (440 * score) / 100;
  
  return (
    <div className="relative flex items-center justify-center w-48 h-48">
      <svg className="w-full h-full transform -rotate-90">
        <circle cx="96" cy="96" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-ui-border" />
        <motion.circle
          cx="96" cy="96" r="70" stroke="currentColor" strokeWidth="12" fill="transparent"
          strokeDasharray="440"
          initial={{ strokeDashoffset: 440 }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 2, ease: "easeOut" }}
          className="text-ui-accent"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-5xl font-black text-ui-text">{score}</span>
        <span className="text-[10px] text-ui-muted font-bold tracking-widest uppercase">Quality Score</span>
      </div>
    </div>
  );
});

const IntelligenceReport = () => {

  // ✅ Updated to use backend dataset stats
  const { datasetStats, updateProgress } = useAgent();

  // ✅ Stats from backend instead of mock
  const stats = useMemo(() => [
    { label: 'Total Images', value: datasetStats?.total_images || 0, icon: <ImageIcon size={18} /> },
    { label: 'Label Files', value: datasetStats?.total_labels || 0, icon: <BoxSelect size={18} /> },
    { label: 'Classes Found', value: Object.keys(datasetStats?.classes || {}).length, icon: <BarChart3 size={18} /> },
  ], [datasetStats]);

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
      className="w-full max-w-6xl mx-auto py-8 px-4"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN */}
        <div className="lg:col-span-4 flex flex-col gap-6">

          <div className="bg-ui-card border border-ui-border rounded-[2rem] p-8 flex flex-col items-center shadow-xl">

            {/* ✅ Score from backend */}
            <ScoreGauge score={datasetStats?.score || 0} />

            <p className="mt-6 text-sm text-ui-muted text-center leading-relaxed font-semibold">
              Your dataset is <span className="text-ui-accent font-bold">Functional</span> but requires optimization before training for high mAP.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {stats.map((stat, i) => (
              <div key={i} className="bg-ui-card border border-ui-border p-6 rounded-2xl flex justify-between items-center shadow-md">
                <div className="flex items-center gap-4">
                  <div className="text-ui-accent bg-ui-accent/10 p-2 rounded-lg">{stat.icon}</div>
                  <span className="text-ui-muted text-sm font-bold uppercase tracking-tighter">{stat.label}</span>
                </div>
                <span className="text-xl font-bold text-ui-text">{stat.value}</span>
              </div>
            ))}
          </div>

        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-8">
          <div className="bg-ui-card border border-ui-border rounded-[2rem] p-8 h-full shadow-xl">

            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-black text-ui-text tracking-tighter uppercase flex items-center gap-3">
                <AlertTriangle className="text-ui-accent" size={24} />
                Neural Audit Results
              </h3>

              {/* dynamic issue count */}
              <span className="text-[10px] font-mono text-ui-muted uppercase tracking-widest font-bold">
                {datasetStats?.issues?.length || 0} Issues Detected
              </span>
            </div>

            {/* ✅ REAL ISSUES FROM BACKEND */}
            <div className="space-y-4">
              {datasetStats?.issues?.map((issue, i) => (
                <div key={i} className="group p-6 rounded-2xl bg-ui-surface border border-ui-border hover:border-ui-accent/30 transition-all shadow-sm">
                  
                  <div className="flex justify-between items-start mb-2">
                    
                    <div className="flex items-center gap-3">
                      {issue.severity === 'critical' ? 
                        <AlertTriangle className="text-red-500" size={18} /> :
                        issue.severity === 'warning' ?
                        <Info className="text-yellow-500" size={18} /> :
                        <CheckCircle2 className="text-blue-500" size={18} />
                      }

                      <h4 className="font-bold text-ui-text">{issue.title}</h4>
                    </div>

                    {issue.impact && (
                      <span className="text-sm font-mono font-bold text-yellow-500">
                        {issue.impact} Points
                      </span>
                    )}

                  </div>

                  <p className="text-sm text-ui-muted ml-7 leading-relaxed font-medium">
                    {issue.desc}
                  </p>

                </div>
              ))}
            </div>

            {/* ACTION FOOTER */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-12 p-8 rounded-[2.5rem] bg-gradient-to-br from-ui-accent/10 to-transparent border border-ui-accent/20 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group/footer shadow-lg"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-ui-accent/5 blur-[40px] pointer-events-none group-hover/footer:bg-ui-accent/10 transition-all" />
              
              <div className="relative z-10 text-center md:text-left">
                <h4 className="text-ui-accent font-black text-sm tracking-widest uppercase mb-1">Expert Recommendation</h4>
                <p className="text-xs text-ui-muted font-bold max-w-sm leading-relaxed uppercase tracking-tight">
                  Our neural audit suggests initializing <span className="text-ui-text italic">"Auto-Fix"</span> to standardize your dataset structure and repair label orphans.
                </p>
              </div>

              <motion.button 
                whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(0,255,136,0.3)" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => updateProgress(2)}
                className="w-full md:w-auto bg-ui-accent text-black font-black px-10 py-4 rounded-2xl flex items-center justify-center gap-3 transition-all relative z-10 shadow-lg"
              >
                <Wrench size={18} className="transition-transform group-hover/footer:rotate-12" />
                <span className="tracking-tight uppercase">INITIALIZE AUTO-FIX</span>
              </motion.button>
            </motion.div>

          </div>
        </div>

      </div>
    </motion.div>
  );
};

export default IntelligenceReport;