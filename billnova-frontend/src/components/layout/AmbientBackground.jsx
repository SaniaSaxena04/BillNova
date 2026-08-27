import React from 'react';

export const AmbientBackground = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#F8FAFC]">
      {/* Top Right Radial Gradient */}
      <div 
        className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full opacity-70 blur-[100px] animate-ambient-slow"
        style={{ background: 'radial-gradient(circle, #E0E7FF 0%, rgba(224,231,255,0) 70%)' }}
      />
      {/* Bottom Left Radial Gradient */}
      <div 
        className="absolute -bottom-32 -left-32 w-[600px] h-[600px] rounded-full opacity-70 blur-[100px] animate-ambient-slow"
        style={{ 
          background: 'radial-gradient(circle, #D1FAE5 0%, rgba(209,250,229,0) 70%)',
          animationDelay: '-9s'
        }}
      />
    </div>
  );
};