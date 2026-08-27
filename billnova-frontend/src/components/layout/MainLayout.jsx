import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export const MainLayout = () => {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/20 to-slate-100 text-slate-800">
      {/* Fixed Left Sidebar */}
      <Sidebar />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Main Right Scrollable Content Area */}
        <main className="flex-1 p-6 overflow-y-auto max-w-7xl w-full">
          <Outlet />
        </main>

        {/* Copyright Footer */}
        <footer className="py-4 px-6 border-t border-purple-100/60 bg-white/30 backdrop-blur-sm text-center text-xs text-slate-500 font-medium">
          © {new Date().getFullYear()} BillNova AI POS System. All rights reserved.
        </footer>
      </div>
    </div>
  );
};