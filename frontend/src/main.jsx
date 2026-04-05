import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';

// Performance: Loading Fallback (A simple elegant spinner or bar)
const PageLoader = () => (
  <div className="h-screen w-full bg-ui-black flex items-center justify-center">
    <div className="w-10 h-10 border-2 border-ui-accent border-t-transparent rounded-full animate-spin" />
  </div>
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      {/* Suspense allows us to use React.lazy for performance */}
      <Suspense fallback={<PageLoader />}>
        <App />
      </Suspense>
    </BrowserRouter>
  </React.StrictMode>,
);