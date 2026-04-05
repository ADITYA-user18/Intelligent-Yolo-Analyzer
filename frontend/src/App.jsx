import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';

// Performance Optimization: Code Splitting / Lazy Loading
// This creates separate chunks for every major section
const Hero = lazy(() => import('./components/Hero'));
// Future components will go here:
// const Analyzer = lazy(() => import('./components/Analyzer'));

function App() {
  return (
    <div className="min-h-screen selection:bg-ui-accent selection:text-black">
      {/* Persistent Navbar */}
      <Navbar />

      {/* Routes define which "Page" to show */}
      <main className="relative pt-24">
        <Routes>
          <Route path="/" element={
            <Suspense fallback={<div className="h-20" />}>
               {/* We will build this Hero next */}
               <Hero /> 
            </Suspense>
          } />
          
          {/* Example of how other routes will look */}
          {/* <Route path="/analyzer" element={<Analyzer />} /> */}
        </Routes>
      </main>
    </div>
  );
}

export default App;