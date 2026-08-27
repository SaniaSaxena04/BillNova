import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Receipt, 
  Package, 
  TrendingUp, 
  FileText, 
  Settings, 
  Sparkles, 
  LogOut 
} from 'lucide-react';

export const Sidebar = () => {
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <aside className="w-64 border-r border-purple-100/60 bg-white/40 backdrop-blur-md p-4 flex flex-col justify-between shrink-0 min-h-screen">
      <div className="space-y-6">
        {/* App Logo & Branding */}
        <div className="px-3 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              BillNova
              <span className="p-1 rounded-md bg-purple-600 text-white text-[10px] font-black">AI</span>
            </h2>
            <p className="text-[10px] text-purple-700 font-bold mt-0.5">Smart POS & Analytics</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          <NavLink 
            to="/" 
            end
            className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
              isActive ? 'bg-purple-600 text-white shadow-md' : 'text-slate-600 hover:bg-white/60 hover:text-purple-700'
            }`}
          >
            <LayoutDashboard size={18} /> Dashboard
          </NavLink>

          <NavLink 
            to="/billing" 
            className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
              isActive ? 'bg-purple-600 text-white shadow-md' : 'text-slate-600 hover:bg-white/60 hover:text-purple-700'
            }`}
          >
            <Receipt size={18} /> POS Billing
          </NavLink>

          <NavLink 
            to="/inventory" 
            className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
              isActive ? 'bg-purple-600 text-white shadow-md' : 'text-slate-600 hover:bg-white/60 hover:text-purple-700'
            }`}
          >
            <Package size={18} /> Inventory
          </NavLink>

          <NavLink 
            to="/analytics" 
            className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
              isActive ? 'bg-purple-600 text-white shadow-md' : 'text-slate-600 hover:bg-white/60 hover:text-purple-700'
            }`}
          >
            <TrendingUp size={18} /> AI Analytics
          </NavLink>

          <NavLink 
            to="/invoices" 
            className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
              isActive ? 'bg-purple-600 text-white shadow-md' : 'text-slate-600 hover:bg-white/60 hover:text-purple-700'
            }`}
          >
            <FileText size={18} /> Invoices & History
          </NavLink>

          <NavLink 
            to="/settings" 
            className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
              isActive ? 'bg-purple-600 text-white shadow-md' : 'text-slate-600 hover:bg-white/60 hover:text-purple-700'
            }`}
          >
            <Settings size={18} /> Settings
          </NavLink>
        </nav>
      </div>

      {/* Footer / User Profile & Logout */}
      <div className="pt-4 border-t border-purple-100/60 space-y-3">
        <div className="px-3 py-2 rounded-xl bg-purple-50/50 border border-purple-100 flex items-center gap-2">
          <div className="p-1.5 bg-purple-600 text-white rounded-lg">
            <Sparkles size={14} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-purple-950">AI Engine Active</p>
            <p className="text-[10px] text-purple-700 font-medium">Predictive sync live</p>
          </div>
        </div>

        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
        >
          <LogOut size={16} /> Logout
        </button>
      </div>
    </aside>
  );
};