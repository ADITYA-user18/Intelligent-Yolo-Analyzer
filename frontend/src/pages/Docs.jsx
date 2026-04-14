import React from 'react';
import { motion } from 'framer-motion';
import { 
    Terminal, 
    Database, 
    Zap, 
    TrendingUp, 
    ShieldCheck, 
    ArrowRight,
    Search,
    BookOpen
} from 'lucide-react';

const Docs = () => {
  const sections = [
    {
      id: 'getting-started',
      icon: <Terminal className="text-ui-accent" size={24} />,
      title: "Getting Started",
      content: "AutoYOLO is an intelligent agent designed to bridge the gap between raw data and production-ready Computer Vision models. To begin, ensure you have a dataset in ZIP format containing images and their corresponding YOLO annotation files."
    },
    {
      id: 'neural-audit',
      icon: <Search className="text-ui-accent" size={24} />,
      title: "The Neural Audit",
      content: "Once uploaded, our Neural Engine performs a deep-scan of every frame. We check for corrupted labels, bounding box normalization errors, and class distribution imbalances. You will receive a 'Quality Score' out of 100, which predicts your model's baseline training stability."
    },
    {
      id: 'neural-repair',
      icon: <Zap className="text-ui-accent" size={24} />,
      title: "Neural Repair & Standardization",
      content: "Modern YOLO architectures (v8-v26) require strict directory structures. Our 'Auto-Fix' engine reconstructs your dataset into the standard /images/train, /labels/train format automatically. It can also generate a proper 80/20 or 70/20/10 train/test/val split."
    },
    {
        id: 'optimization',
        icon: <ShieldCheck className="text-ui-accent" size={24} />,
        title: "Advanced Optimization",
        content: "Stop guessing hyperparameters. The AutoYOLO Intelligence Agent analyzes your specific object density and image resolution to engineer the exact 'train_params.yaml' config needed. This includes LR0, Momentum, and specialized Augmentation settings tailored to your data."
      },
    {
      id: 'feedback-loop',
      icon: <TrendingUp className="text-ui-accent" size={24} />,
      title: "Recursive Feedback Loop",
      content: "Our work doesn't end when you download the script. After a training run, upload your 'results.csv' back to the platform. The agent will analyze the loss curves and mAP gradients to tell you exactly which hyperparameters to tweak for the next iteration."
    }
  ];

  return (
    <div className="min-h-screen bg-ui-bg text-ui-text pb-32">
      
      {/* HEADER */}
      <div className="relative pt-20 pb-20 bg-gradient-to-b from-ui-accent/5 to-transparent border-b border-ui-border overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-ui-accent/5 blur-[120px] rounded-full" />
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 mb-6"
          >
            <div className="p-3 bg-ui-accent text-black rounded-2xl shadow-[0_0_30px_rgba(0,255,136,0.3)]">
              <BookOpen size={28} />
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase">Knowledge Base</h1>
          </motion.div>
          <p className="text-ui-muted text-lg max-w-2xl leading-relaxed font-bold uppercase tracking-tight opacity-70">
            Everything you need to know about optimizing, standardizing, and deploying production-grade YOLO models using our intelligent neural agent.
          </p>
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-5xl mx-auto px-6 mt-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16">
          
          {/* NAV */}
          <div className="md:col-span-4 hidden md:block">
            <div className="sticky top-32 space-y-2">
              <span className="text-[10px] font-black text-ui-muted tracking-[0.3em] uppercase mb-4 block opacity-50">Navigation</span>
              {sections.map(s => (
                <a 
                  key={s.id} 
                  href={`#${s.id}`}
                  className="block px-4 py-3 rounded-xl hover:bg-ui-card-hover text-ui-muted hover:text-ui-accent transition-all font-black text-xs uppercase tracking-widest"
                >
                  {s.title}
                </a>
              ))}
            </div>
          </div>

          {/* MAIN */}
          <div className="md:col-span-8 space-y-24">
            {sections.map((section, idx) => (
              <motion.section 
                key={section.id} 
                id={section.id}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="scroll-mt-32 group"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-2.5 bg-ui-card border border-ui-border rounded-xl text-ui-accent group-hover:scale-110 transition-transform duration-500 shadow-lg">
                    {section.icon}
                  </div>
                  <h2 className="text-2xl font-black tracking-tighter group-hover:text-ui-accent transition-colors uppercase italic">
                    {idx + 1}. {section.title}
                  </h2>
                </div>
                <div className="p-8 rounded-[2rem] bg-ui-card border border-ui-border relative overflow-hidden shadow-2xl">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-ui-accent/5 blur-[40px] pointer-events-none" />
                  <p className="text-ui-muted leading-relaxed font-bold relative z-10 text-sm uppercase tracking-tight opacity-80">
                    {section.content}
                  </p>
                </div>
              </motion.section>
            ))}

            {/* CTA */}
            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               whileInView={{ opacity: 1, scale: 1 }}
               viewport={{ once: true }}
               className="p-12 rounded-[3rem] bg-ui-accent text-black text-center shadow-[0_0_60px_rgba(0,255,136,0.3)]"
            >
                <h3 className="text-3xl font-black mb-4 uppercase italic tracking-tighter">Ready to optimize?</h3>
                <p className="font-black mb-8 opacity-70 uppercase tracking-widest text-xs">Initialize your neural agent and start the audit.</p>
                <a 
                  href="/agent" 
                  className="inline-flex items-center gap-3 bg-black text-white px-10 py-5 rounded-2xl font-black hover:scale-105 transition-all shadow-2xl text-xs tracking-widest"
                >
                    LAUNCH ANALYZER <ArrowRight size={20} />
                </a>
            </motion.div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Docs;
