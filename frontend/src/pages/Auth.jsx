import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, ShieldCheck, Mail, Lock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (isLogin) {
        await login(username, password);
        toast.success(`Welcome back, ${username.charAt(0).toUpperCase() + username.slice(1)}!`);
        navigate('/'); // ✅ Redirect to Home as requested
      } else {
        await signup(username, password);
        setIsLogin(true);
        toast.success("Identity registered! Procedural login required.");
      }
    } catch (err) {
      const msg = err.response?.data?.detail || "Authentication failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
        <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-ui-card border border-ui-border rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden"
      >
        {/* Visual Decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-ui-accent/10 blur-[60px] pointer-events-none" />
        
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-ui-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-ui-accent/20">
            {isLogin ? <LogIn className="text-ui-accent" size={28} /> : <UserPlus className="text-ui-accent" size={28} />}
          </div>
          <h2 className="text-3xl font-black text-ui-text tracking-tight italic uppercase">
            {isLogin ? "WELCOME BACK" : "CREATE ACCOUNT"}
          </h2>
          <p className="text-ui-muted text-sm mt-2 font-bold uppercase tracking-tight opacity-70">
            Secure access to AutoYOLO Expert Agent
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-ui-muted group-focus-within:text-ui-accent transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-ui-surface border border-ui-border rounded-2xl py-4 pl-12 pr-4 text-ui-text placeholder:text-ui-muted/50 focus:border-ui-accent/50 focus:outline-none transition-all font-bold"
                required
              />
            </div>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-ui-muted group-focus-within:text-ui-accent transition-colors" size={18} />
              <input 
                type="password" 
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-ui-surface border border-ui-border rounded-2xl py-4 pl-12 pr-4 text-ui-text placeholder:text-ui-muted/50 focus:border-ui-accent/50 focus:outline-none transition-all font-bold"
                required
              />
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="text-red-500 text-xs font-bold text-center italic uppercase tracking-tight"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-ui-accent text-black font-black py-4 rounded-2xl flex items-center justify-center gap-3 hover:shadow-[0_0_30px_rgba(0,255,136,0.3)] transition-all active:scale-95 disabled:opacity-50 uppercase tracking-widest"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : (isLogin ? "INITIALIZE SESSION" : "REGISTER AGENT")}
          </button>
        </form>

        <div className="mt-8 text-center pt-8 border-t border-ui-border">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-xs text-ui-muted hover:text-ui-accent transition-colors font-black tracking-widest uppercase"
          >
            {isLogin ? "New to the platform? Sign Up" : "Already registered? Log In"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
