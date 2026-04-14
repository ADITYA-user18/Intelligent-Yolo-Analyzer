import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AgentProvider } from './context/AgentContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import { Toaster } from 'sonner';

// Performance: Lazy loaded pages
const Home = lazy(() => import('./pages/Home'));
const Auth = lazy(() => import('./pages/Auth'));
const Docs = lazy(() => import('./pages/Docs'));

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? children : <Navigate to="/login" />;
};

const PageLoader = () => (
  <div className="h-screen w-full flex flex-col items-center justify-center bg-ui-black">
    <div className="w-12 h-12 border-2 border-ui-accent border-t-transparent rounded-full animate-spin mb-4" />
    <p className="text-ui-accent animate-pulse font-mono text-xs tracking-widest uppercase">Initializing AutoYOLO...</p>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <AgentProvider>
        <div className="min-h-screen bg-ui-black text-ui-text selection:bg-ui-accent selection:text-black">
          <div className="fixed inset-0 z-[-1] overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-ui-accent/5 blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-ui-purple/5 blur-[120px]" />
          </div>

          <Toaster richColors theme="dark" position="bottom-right" />
          <Navbar />

          <main className="relative pt-20">
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Auth />} />
                <Route path="/docs" element={<Docs />} />
                <Route path="/agent" element={
                  <ProtectedRoute>
                    <Home isAgentMode={true} />
                  </ProtectedRoute>
                } />
                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </Suspense>
          </main>
        </div>
      </AgentProvider>
    </AuthProvider>
  );
}

export default App;