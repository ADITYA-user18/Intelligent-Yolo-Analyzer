import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, BrainCircuit, Activity, Layers, User, LogOut, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ THEME TOGGLE LOGIC
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const navItems = [
    { name: 'DOCS', icon: <Layers size={14} />, path: '/docs' },
    { name: 'ANALYZER', icon: <Activity size={14} />, path: '/agent' },
  ];

  const handleLogout = () => {
    logout();
    
    // Explicitly wipe Agent context keys to prevent cross-user leakage
    const agentKeys = ['sessionId', 'currentStep', 'datasetStats', 'strategy', 'includeTestSplit'];
    agentKeys.forEach(k => localStorage.removeItem(k));
    
    toast.success("Identity disconnected. Neural session terminated.", { duration: 3000 });
    navigate('/login'); // ✅ Replaced hard redirect to preserve toast
  };

  return (
    <nav className="fixed top-8 left-1/2 -translate-x-1/2 w-[90%] max-w-7xl z-[100]">
      <motion.div 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="glass rounded-[2rem] px-4 md:px-8 py-3 md:py-4 flex items-center justify-between shadow-2xl overflow-hidden"
      >
        {/* LOGO */}
        <div 
          onClick={() => navigate('/')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <img 
            src="/logo.gif" 
            alt="AutoYOLO" 
            className="w-10 h-10 object-contain rounded-xl dark-blend-white group-hover:scale-110 transition-transform" 
          />
          <span className="text-ui-text font-black text-xl italic tracking-tighter group-hover:text-ui-accent transition-colors">
            AUTOYOLO
          </span>
        </div>

        {/* LINKS */}
        <div className="flex items-center gap-4 md:gap-8 overflow-hidden">
          {navItems.map((item) => (
            <button
              key={item.name}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-2 text-[10px] font-black tracking-[0.2em] transition-all hover:text-ui-accent ${
                location.pathname === item.path ? 'text-ui-accent' : 'text-ui-muted'
              }`}
            >
              {item.icon} {item.name}
            </button>
          ))}
        </div>

        {/* ACTIONS & PROFILE */}
        <div className="flex items-center gap-6">
          
          {/* ✅ THEME SWITCHER */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            className="w-14 h-14 p-1.5 rounded-2xl aperture-toggle flex items-center justify-center group/theme shadow-[0_0_30px_rgba(0,255,136,0.1)]"
            title="Toggle Neural Theme"
          >
            <img 
              src="/brightness.gif" 
              alt="Toggle Theme" 
              className="w-full h-full object-cover rounded-xl dark-blend-white group-hover:brightness-125 transition-all" 
            />
          </motion.button>

          <AnimatePresence>
            {user ? (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-4"
              >
                <div className="flex items-center gap-3 bg-ui-accent/10 border border-ui-accent/20 px-4 py-2 rounded-xl">
                  <User size={14} className="text-ui-accent" />
                  <span className="text-[10px] font-black tracking-widest text-ui-text uppercase">
                    {user.username}
                  </span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="p-2 text-ui-muted hover:text-red-500 transition-colors"
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
              </motion.div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/login')}
                className="bg-ui-accent text-black px-4 md:px-6 py-2 md:py-2.5 rounded-xl text-[10px] font-black tracking-widest uppercase shadow-xl"
              >
                Enter Platform
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* GLOW DECORATION */}
        <div className="absolute -bottom-px left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-ui-accent/30 to-transparent" />
      </motion.div>
    </nav>
  );
};

export default Navbar;