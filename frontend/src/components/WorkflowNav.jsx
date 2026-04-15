import React from 'react';
import { motion } from 'framer-motion';
import { Check, Circle } from 'lucide-react';
import { useAgent } from '../context/AgentContext';

const WorkflowNav = () => {
  const { currentStep, setCurrentStep, sessionId, sessions } = useAgent();

  const activeSessionItem = sessions.find(s => s.session_id === sessionId);
  const highestStep = activeSessionItem ? activeSessionItem.current_step : currentStep;

  const steps = [
    { id: 0, name: "UPLOAD", desc: "Data Intake" },
    { id: 1, name: "AUDIT", desc: "Neural Report" },
    { id: 2, name: "REPAIR", desc: "Standardize" },
    { id: 3, name: "OPTIMIZE", desc: "Hyperparameters" },
    { id: 4, name: "GENERATE", desc: "Training Code" },
  ];

  const handleStepClick = (stepId) => {
    // Navigate across any step up to the highest recorded milestone
    if (stepId <= highestStep) {
      setCurrentStep(stepId); // ✅ Visual-only Nav (don't nuke backend)
    }
  };

  return (
    <div className="w-full flex items-center justify-between px-2 sm:px-10 mb-12 relative overflow-x-auto lg:overflow-visible py-2 custom-scrollbar">
      {/* Progress Track Container */}
      <div className="absolute top-[22px] left-10 right-10 h-[2px] z-0">
        {/* Background Line */}
        <div className="w-full h-full bg-ui-border" />
        
        {/* Active Progress Line */}
        <div 
          className="absolute top-0 left-0 h-full bg-ui-accent shadow-[0_0_10px_rgba(0,255,136,0.3)] transition-all duration-500 flex ease-in-out"
          style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
        />
      </div>

      {steps.map((step, index) => {
        const isActive = currentStep === step.id;
        const isCompleted = highestStep > step.id;
        const isReachable = step.id <= highestStep;

        return (
          <div key={step.id} className="relative z-10 flex flex-col items-center">
            <motion.button
              whileHover={isReachable ? { scale: 1.1 } : {}}
              whileTap={isReachable ? { scale: 0.9 } : {}}
              onClick={() => handleStepClick(step.id)}
              disabled={!isReachable}
              className={`flex-none w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all border-2 ${
                  isActive 
                    ? 'bg-ui-accent border-ui-accent text-black shadow-[0_0_20px_rgba(0,255,136,0.3)]' 
                    : isCompleted 
                    ? 'bg-ui-accent/20 border-ui-accent text-ui-accent' 
                    : 'bg-ui-surface border-ui-border text-ui-muted'
                } ${!isReachable && 'opacity-30 cursor-not-allowed'}`}
            >
              {isCompleted ? <Check size={20} strokeWidth={3} /> : <span className="text-xs font-black">{step.id + 1}</span>}
            </motion.button>
            
            <div className="mt-4 text-center">
              <p className={`text-[10px] font-black tracking-[0.2em] uppercase transition-colors ${
                isActive ? 'text-ui-accent' : isCompleted ? 'text-ui-text' : 'text-ui-muted'
              }`}>
                {step.name}
              </p>
              <p className="text-[8px] font-bold text-ui-muted tracking-widest uppercase mt-1">
                {step.desc}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default WorkflowNav;
