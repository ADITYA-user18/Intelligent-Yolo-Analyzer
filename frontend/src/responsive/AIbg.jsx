import React from "react";

const AIbg = () => {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden">

      {/* Base dark */}
      <div className="absolute inset-0 bg-ui-black" />

      {/* Soft gradient glow */}
      <div className="absolute w-[500px] h-[500px] bg-ui-accent/20 rounded-full blur-[120px] top-[-100px] left-[-100px] animate-blob" />

      <div className="absolute w-[400px] h-[400px] bg-ui-purple/20 rounded-full blur-[120px] bottom-[-100px] right-[-100px] animate-blob" />

      {/* Simple grid (safe version) */}
      <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:50px_50px]" />

    </div>
  );
};

export default AIbg;