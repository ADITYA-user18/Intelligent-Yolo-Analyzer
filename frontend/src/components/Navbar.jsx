import React, { useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom'; // Using Link for SPA navigation
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Cpu, Github, ChevronRight } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Performance Optimization: Memoize the nav links so they don't re-calculate on every render
  const navLinks = useMemo(() => [
    { name: 'Analyzer', path: '/analyzer' },
    { name: 'Optimizer', path: '/optimizer' },
    { name: 'Docs', path: '/docs' },
    { name: 'Fixer', path: '/fixer' },
  ], []);

  // Performance Optimization: Use Callback for toggles to prevent function recreation
  const toggleMenu = useCallback(() => setIsOpen(prev => !prev), []);

  return (
    <nav className="fixed top-0 w-full z-[100] px-4 py-4 sm:px-6 lg:px-12">
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="max-w-7xl mx-auto glass rounded-2xl px-5 py-3 flex justify-between items-center"
      >
        {/* LOGO - Wrapped in Link */}
        <Link to="/" className="flex items-center gap-2 group cursor-pointer">
          <div className="bg-ui-accent/20 p-2 rounded-xl group-hover:rotate-12 transition-all">
            <Cpu className="text-ui-accent w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-tighter text-white">
            YOLO<span className="text-ui-accent">INTEL</span>
          </span>
        </Link>

        {/* DESKTOP NAV - Using Link */}
        <div className="hidden md:flex gap-8 items-center text-sm font-medium text-gray-400">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              to={link.path} 
              className="hover:text-ui-accent transition-all duration-300"
            >
              {link.name}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-4">
          <Github className="w-5 h-5 text-gray-500 hover:text-white cursor-pointer transition-colors" />
          <button className="bg-ui-accent text-black font-bold text-xs px-6 py-2.5 rounded-xl">
            GET STARTED
          </button>
        </div>

        <div className="md:hidden">
          <button onClick={toggleMenu} className="p-2 text-gray-400">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </motion.div>
      
      {/* Mobile Menu Logic remains similar but replaces <a> with <Link> */}
    </nav>
  );
};

export default Navbar;