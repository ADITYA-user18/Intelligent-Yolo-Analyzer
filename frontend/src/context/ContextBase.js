import { createContext } from 'react';

// ✅ PURE CONTEXT DECOUPLING
// By moving createContext to a .js file, we satisfy Vite's Fast Refresh (hmr) 
// plugin which often conflicts when a Context and Provider/Hook share a .jsx file.

export const AuthContext = createContext(null);
export const AgentContext = createContext(null);
