import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, LogOut, User } from 'lucide-react';

export const Header = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('billnova_user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('billnova_token');
    localStorage.removeItem('billnova_user');
    navigate('/login');
  };

  return (
    <header className="h-16 px-6 flex items-center justify-between border-b border-purple-100/60 bg-white/40 backdrop-blur-md sticky top-0 z-20">
      {/* Search Input */}
      <div className="relative w-72">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        <input 
          type="text" 
          placeholder="Search products, bills..."
          className="w-full pl-9 pr-4 py-1.5 bg-white/70 border border-purple-100 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
        />
      </div>

      {/* User Actions */}
      <div className="flex items-center gap-4">
        <button className="p-2 text-slate-600 hover:text-purple-700 hover:bg-white/60 rounded-xl transition-colors relative cursor-pointer">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-purple-600 rounded-full" />
        </button>

        <div className="flex items-center gap-3 pl-3 border-l border-purple-100">
          <div className="w-8 h-8 rounded-full bg-purple-200/60 border border-purple-300/50 flex items-center justify-center text-purple-800 font-bold text-xs">
            {user.name ? user.name.charAt(0).toUpperCase() : <User size={16} />}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-slate-800 leading-none">{user.name || 'Store Manager'}</p>
            <p className="text-[10px] font-semibold text-purple-700 mt-0.5">{user.role || 'ADMIN'}</p>
          </div>
          <button 
            onClick={handleLogout}
            title="Sign Out"
            className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50/50 rounded-xl transition-colors ml-1 cursor-pointer"
          >
            <LogOut size={17} />
          </button>
        </div>
      </div>
    </header>
  );
};