import React, { useState } from 'react';
import { 
  User, 
  Key, 
  Bell, 
  Palette, 
  Send, 
  Mail, 
  Save, 
  Copy, 
  Check, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Store,
  Sparkles
} from 'lucide-react';

export const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [copiedKey, setCopiedKey] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Profile Form State
  const [profile, setProfile] = useState({
    fullName: 'Alex Morgan',
    storeName: 'Nova Retail Mart',
    email: 'alex@novamart.com',
    phone: '+91 98765 43210',
    currency: 'INR (₹)',
    taxRate: '18',
  });

  // API Key State
  const [apiKey] = useState('bn_live_98a7f6e5d4c3b2a100987654');

  // Notification Toggles
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    emailDailyReport: true,
    telegramAlerts: true,
    telegramBotToken: '6892019482:AAH9f2...',
    telegramChatId: '-10098273641',
    lowStockThreshold: 10,
  });

  // Theme Settings
  const [theme, setTheme] = useState({
    mode: 'system',
    accentColor: 'purple',
    compactMode: false,
  });

  const handleSave = (e) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Store Settings
          </h1>
          <p className="text-xs text-slate-500 mt-1">Configure profile, API integrations, alerts & theme options</p>
        </div>

        {savedSuccess && (
          <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-700 flex items-center gap-1.5 animate-fade-in">
            <Check size={16} /> Changes saved successfully!
          </div>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-purple-100/80 gap-2">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'profile'
              ? 'border-purple-600 text-purple-700 bg-purple-50/30'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <User size={16} /> Profile & Store
        </button>

        <button
          onClick={() => setActiveTab('api')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'api'
              ? 'border-purple-600 text-purple-700 bg-purple-50/30'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Key size={16} /> API Keys
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'notifications'
              ? 'border-purple-600 text-purple-700 bg-purple-50/30'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Bell size={16} /> Telegram & Email Alerts
        </button>

        <button
          onClick={() => setActiveTab('theme')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'theme'
              ? 'border-purple-600 text-purple-700 bg-purple-50/30'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Palette size={16} /> Theme & Preferences
        </button>
      </div>

      {/* TAB 1: PROFILE & STORE SETTINGS */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSave} className="bg-white/80 backdrop-blur-md rounded-2xl border border-purple-100/60 p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm border-b border-slate-100 pb-3">
            <Store size={18} className="text-purple-600" /> Store Profile Details
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Owner Name</label>
              <input
                type="text"
                value={profile.fullName}
                onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Store Name</label>
              <input
                type="text"
                value={profile.storeName}
                onChange={(e) => setProfile({ ...profile, storeName: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Email Address</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Phone Number</label>
              <input
                type="text"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Base Currency</label>
              <select
                value={profile.currency}
                onChange={(e) => setProfile({ ...profile, currency: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option>INR (₹)</option>
                <option>USD ($)</option>
                <option>EUR (€)</option>
                <option>GBP (£)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Default Tax Rate (%)</label>
              <input
                type="number"
                value={profile.taxRate}
                onChange={(e) => setProfile({ ...profile, taxRate: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Save size={15} /> Save Profile Changes
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: API KEYS */}
      {activeTab === 'api' && (
        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-purple-100/60 p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm border-b border-slate-100 pb-3">
            <ShieldCheck size={18} className="text-purple-600" /> Developer API Keys
          </div>

          <p className="text-xs text-slate-600">
            Use this API key to authorize request calls from your external e-commerce website or FastAPI backend.
          </p>

          <div className="p-4 bg-purple-50/50 border border-purple-100 rounded-2xl space-y-3">
            <label className="text-[11px] font-bold text-purple-900 uppercase tracking-wider">Live Production Key</label>
            <div className="flex items-center gap-2">
              <input
                type={showApiKey ? 'text' : 'password'}
                readOnly
                value={apiKey}
                className="flex-1 px-3.5 py-2 bg-white border border-purple-200 rounded-xl text-xs font-mono font-bold text-slate-800"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
              <button
                type="button"
                onClick={() => copyToClipboard(apiKey)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
              >
                {copiedKey ? <Check size={15} /> : <Copy size={15} />}
                {copiedKey ? 'Copied' : 'Copy Key'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: NOTIFICATIONS */}
      {activeTab === 'notifications' && (
        <form onSubmit={handleSave} className="bg-white/80 backdrop-blur-md rounded-2xl border border-purple-100/60 p-6 shadow-sm space-y-6">
          
          {/* Telegram Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm border-b border-slate-100 pb-3">
              <Send size={18} className="text-sky-500" /> Telegram Bot Notifications
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <p className="text-xs font-bold text-slate-800">Enable Low Stock Telegram Alerts</p>
                <p className="text-[11px] text-slate-500">Receive instant messages on Telegram when products run out.</p>
              </div>
              <input
                type="checkbox"
                checked={notifications.telegramAlerts}
                onChange={(e) => setNotifications({ ...notifications, telegramAlerts: e.target.checked })}
                className="w-4 h-4 accent-purple-600 cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Telegram Bot Token</label>
                <input
                  type="text"
                  value={notifications.telegramBotToken}
                  onChange={(e) => setNotifications({ ...notifications, telegramBotToken: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-semibold text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Telegram Chat ID</label>
                <input
                  type="text"
                  value={notifications.telegramChatId}
                  onChange={(e) => setNotifications({ ...notifications, telegramChatId: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-semibold text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Email Section */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm border-b border-slate-100 pb-3">
              <Mail size={18} className="text-purple-600" /> Email Notifications
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <p className="text-xs font-bold text-slate-800">Send Daily Sales Summary</p>
                <p className="text-[11px] text-slate-500">Get a PDF sales report delivered every evening at 9 PM.</p>
              </div>
              <input
                type="checkbox"
                checked={notifications.emailDailyReport}
                onChange={(e) => setNotifications({ ...notifications, emailDailyReport: e.target.checked })}
                className="w-4 h-4 accent-purple-600 cursor-pointer"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Save size={15} /> Save Notification Settings
            </button>
          </div>
        </form>
      )}

      {/* TAB 4: THEME & PREFERENCES */}
      {activeTab === 'theme' && (
        <form onSubmit={handleSave} className="bg-white/80 backdrop-blur-md rounded-2xl border border-purple-100/60 p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm border-b border-slate-100 pb-3">
            <Palette size={18} className="text-purple-600" /> Appearance & Theme
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Interface Color Mode</label>
            <div className="grid grid-cols-3 gap-3">
              {['light', 'dark', 'system'].map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setTheme({ ...theme, mode })}
                  className={`py-3 rounded-xl border text-xs font-bold capitalize transition-all cursor-pointer ${
                    theme.mode === mode
                      ? 'border-purple-600 bg-purple-50/50 text-purple-700 shadow-sm'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {mode} Mode
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Save size={15} /> Apply Theme Preferences
            </button>
          </div>
        </form>
      )}
    </div>
  );
};