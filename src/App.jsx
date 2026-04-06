import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Save, Monitor, Smartphone, ArrowLeft, ChevronRight, ChevronLeft, Check,
  Lock, AlertCircle, LayoutDashboard, Settings, HelpCircle, Zap, BarChart3,
  ExternalLink, MessageSquare, Shield, Share2, MousePointer2
} from 'lucide-react';

import { CHANNELS, getChannel } from './channels/registry.jsx';
import PreviewWidget from './components/PreviewWidget.jsx';
import MessageTemplateEditor from './components/MessageTemplateEditor.jsx';
import HelpView from './components/HelpView.jsx';
import ConversationsView from './components/ConversationsView.jsx';
import ConversationDetailView from './components/ConversationDetailView.jsx';
import LicenseView from './components/LicenseView.jsx';
import ProUpgradeModal from './components/upgrade/ProUpgradeModal.jsx';
import GlobalSettingsView from './components/GlobalSettingsView.jsx';
import AnalyticsView from './components/AnalyticsView.jsx';

// ─── Constants ──────────────────────────────────────────────────
const i18n = (typeof window !== 'undefined' && window.vibebuyData?.i18n) || {};
const __ = (key, fallback) => i18n[key] || fallback;
const STEP_LABELS = ['Connection'];
const VERSION = 'v1.0.3';

// ─── Helpers ───────────────────────────────────────────────────
const getUrlParam = (name, fallback) => {
  if (typeof window === 'undefined') return fallback;
  return new URLSearchParams(window.location.search).get(name) || fallback;
};

const calcProgress = (channelId, settings) => {
  let done = 0;
  if (!settings) return 0;
  if (settings[`${channelId}_number`] || settings[`${channelId}_botToken`] || settings[`${channelId}_botUsername`]) done++;
  if (settings[`${channelId}_buttonText`] || settings[`${channelId}_bgColor`] || settings[`${channelId}_iconUrl`]) done++;
  if (settings[`${channelId}_wooAutoInject`] !== undefined) done++;
  return done;
};

// ─── Sub-Components ───────────────────────────────────────────

const Sidebar = ({ activeTab, onNavigate, onUpgrade, settings }) => (
  <aside className="vb-sidebar">
    <div className="vb-sidebar-logo flex flex-col items-start gap-1">
      <div className="flex items-center gap-3">
        <div className="vb-logo-icon"><Zap className="w-4 h-4" /></div>
        <span className="vb-logo-text">VibeBuy</span>
      </div>
      <div className="flex items-center gap-2 ml-[54px] -mt-1">
        <span className="text-[10px] font-bold text-gray-400 opacity-60 uppercase tracking-tight">{VERSION}</span>
        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded shadow-sm ${settings.is_pro ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-400'}`}>
          {settings.is_pro ? 'PRO' : 'LITE'}
        </span>
      </div>
    </div>
    <nav className="vb-sidebar-nav">
      <button onClick={() => onNavigate('dashboard')} className={`vb-nav-item ${activeTab === 'dashboard' ? 'vb-nav-item--active' : ''}`}>
        <LayoutDashboard className="w-4 h-4 shrink-0" /> Dashboard
      </button>
      <button onClick={() => onNavigate('conversations')} className={`vb-nav-item ${activeTab === 'conversations' ? 'vb-nav-item--active' : ''}`}>
        <MessageSquare className="w-4 h-4 shrink-0" /> Inquiries
      </button>
      <button 
        onClick={() => onNavigate('analytics')} 
        className={`vb-nav-item ${activeTab === 'analytics' ? 'vb-nav-item--active' : ''}`}
      >
        <BarChart3 className="w-4 h-4 shrink-0" /> Statistics
      </button>
      <button onClick={() => onNavigate('templates')} className={`vb-nav-item ${activeTab === 'templates' ? 'vb-nav-item--active' : ''}`}>
        <MessageSquare className="w-4 h-4 shrink-0" /> Message Templates
      </button>
      <button onClick={() => onNavigate('settings')} className={`vb-nav-item ${activeTab === 'settings' ? 'vb-nav-item--active' : ''}`}>
        <Settings className="w-4 h-4 shrink-0" /> Global Settings
      </button>
      <button onClick={() => onNavigate('license')} className={`vb-nav-item ${activeTab === 'license' ? 'vb-nav-item--active' : ''}`}>
        <Shield className="w-4 h-4 shrink-0" /> License
      </button>
      <button onClick={() => onNavigate('help')} className={`vb-nav-item ${activeTab === 'help' ? 'vb-nav-item--active' : ''}`}>
        <HelpCircle className="w-4 h-4 shrink-0" /> Help
      </button>
    </nav>
    <div className="vb-sidebar-bottom">
      {!settings.is_pro && (
        <div className="vb-upgrade-box text-center">
          <p className="vb-upgrade-title">Go Pro</p>
          <p className="vb-upgrade-desc">Unlock all channels & analytics</p>
          <button onClick={onUpgrade} className="vb-upgrade-btn">Upgrade Now <ExternalLink className="w-3 h-3" /></button>
        </div>
      )}
    </div>
</aside>
);

const Toast = ({ message, desc }) => (
  <div className="vb-toast-wrap">
    <div className="vb-toast">
      <div className="vb-toast-icon"><Check className="w-4 h-4 text-green-500" strokeWidth={3} /></div>
      <div><p className="vb-toast-title">{message}</p><p className="vb-toast-desc">{desc}</p></div>
    </div>
  </div>
);

const DashboardContent = ({ activeTab, settings, updateSetting, setSettings, startConfig, handleSave, saving, onUpgrade, onNavigate, onViewDetail, detailId, helpContext, setToast }) => {
  const toggleChannel = (channelId) => {
    const activeChannels = settings.activeChannels || [];
    const isNowActive = !activeChannels.includes(channelId);
    
    let newActive;
    if (settings.is_pro) {
      newActive = isNowActive
        ? [...activeChannels, channelId]
        : activeChannels.filter(id => id !== channelId);
    } else {
      newActive = isNowActive ? [channelId] : [];
    }
    
    const updatedSettings = { ...settings, activeChannels: newActive };
    updateSetting('activeChannels', newActive);
    
    // Autosave
    handleSave(updatedSettings);
  };

  return (
    <>
      <div className="vb-page-header">
        <h1 className="vb-page-title">
          {activeTab === 'dashboard' && 'Dashboard'}
          {activeTab === 'templates' && 'Message Templates'}
          {activeTab === 'conversations' && 'Leads & Inquiries'}
          {activeTab === 'analytics' && 'Performance Analytics'}
          {activeTab === 'settings' && 'Global Settings'}
          {activeTab === 'help' && 'Help & Tutorials'}
          {activeTab === 'license' && 'License & Activation'}
        </h1>
        <div className="flex items-center gap-3">
           {/* Header is now clean, version/badge moved to Sidebar Logo */}
        </div>
      </div>
      <div className="vb-content">
        {activeTab === 'dashboard' && (
          <>
            <div className="vb-cards-grid">
              <div className="vb-card">
                <div className="vb-card-icon vb-card-icon--green"><Zap className="w-4 h-4 text-green-500" /></div>
                <p className="vb-card-label">Active Channels</p>
                <p className="vb-card-value">{settings.activeChannels?.length || 0} / {CHANNELS.length}</p>
              </div>
              <div className="vb-card cursor-pointer border border-blue-50 hover:border-blue-100 transition-colors" onClick={() => onNavigate('conversations')}>
                <div className="vb-card-icon vb-card-icon--blue"><MessageSquare className="w-4 h-4 text-blue-500" /></div>
                <div className="flex-1">
                  <p className="vb-card-label">Inquiries</p>
                  <p className="vb-card-value text-blue-600">{settings.totalConnections || 0}</p>
                </div>
              </div>
              <div className="vb-card">
                <div className="vb-card-icon vb-card-icon--red"><AlertCircle className="w-4 h-4 text-red-500" /></div>
                <p className="vb-card-label">Inactive</p>
                <p className="vb-card-value vb-card-value--red">{CHANNELS.length - (settings.activeChannels?.length || 0)}</p>
              </div>
              {!settings.is_pro && (
                <div className="vb-card vb-card--pro cursor-pointer group" onClick={onUpgrade}>
                  <div className="vb-card-pro-circle" />
                  <div className="relative z-10">
                    <p className="vb-card-label vb-card-label--white">Unlock All Features</p>
                    <p className="vb-card-value vb-card-value--white">GO PRO</p>
                  </div>
                </div>
              )}
            </div>
            <div className="vb-section-card">
              <div className="vb-section-header"><h2 className="vb-section-title">Messaging Engines</h2><p className="vb-section-subtitle">Configure and manage your messaging channels</p></div>
              <div className="vb-channel-list">
                {CHANNELS.map(ch => {
                  const isActive = (settings.activeChannels || []).includes(ch.id);
                  const isLocked = ch.pro && !settings.is_pro;
                  const progress = ch.pro ? 0 : calcProgress(ch.id, settings);
                  return (
                    <div key={ch.id} className={`vb-channel-row ${isLocked ? 'opacity-70 grayscale' : ''}`}>
                      <div className={`vb-channel-icon ${ch.color}`}>{ch.icon}</div>
                      <div className="vb-channel-info">
                        <div className="flex items-center gap-2">
                          <span className="vb-channel-name">{ch.name}</span>
                          {(!ch.pro || settings.is_pro) ? (
                            <button 
                              onClick={() => toggleChannel(ch.id)}
                              className={`vb-toggle ${isActive ? 'vb-toggle--on' : 'vb-toggle--off'} scale-75 origin-left`}
                            >
                              <div className={`vb-toggle-thumb ${isActive ? 'vb-toggle-thumb--on' : 'vb-toggle-thumb--off'}`} />
                            </button>
                          ) : (
                            <Lock className="w-3 h-3 text-gray-300" />
                          )}
                          <span className={`vb-status-badge ${isActive ? 'vb-status-badge--active' : 'vb-status-badge--inactive'}`}>
                            {isActive ? 'ACTIVE' : 'IN-ACTIVE'}
                          </span>
                        </div>
                        <p className="vb-channel-desc">{ch.desc || ch.description}</p>
                        <div className="flex gap-2 mt-1">
                          {settings[`${ch.id}_show_as_shortcut`] ? (
                            <span className="text-[9px] font-black bg-blue-50 text-blue-500 px-1.5 py-0.5 rounded border border-blue-100 flex items-center gap-1">
                              <Share2 className="w-2.5 h-2.5" /> DIRECT SHORTCUT
                            </span>
                          ) : (
                            <span className="text-[9px] font-black bg-green-50 text-green-500 px-1.5 py-0.5 rounded border border-green-100 flex items-center gap-1">
                              <MousePointer2 className="w-2.5 h-2.5" /> LEAD INQUIRY
                            </span>
                          )}
                        </div>
                      </div>
                      {(!ch.pro || settings.is_pro) ? (
                          <div className="flex gap-2">
                            <button className="vb-configure-btn" onClick={() => startConfig(ch.id)}>Configure</button>
                          </div>
                      ) : (
                        <div className="flex items-center gap-2 px-4 cursor-pointer" onClick={onUpgrade}><span className="text-xs text-gray-400 font-medium whitespace-nowrap hover:text-purple-500 transition-colors">Pro Feature</span></div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
        {activeTab === 'templates' && (
          <div className="vb-section-card mb-20">
            <div className="vb-section-header"><h2 className="vb-section-title">Global Message Template</h2><p className="vb-section-subtitle">Used by all channels by default.</p></div>
            <div className="p-6">
              <MessageTemplateEditor 
                value={settings.global_message_template} 
                onChange={(val) => updateSetting('global_message_template', val)} 
                isPro={settings.is_pro}
              />
              
              {/* Floating Footer */}
              <div className="vb-floating-footer">
                <button onClick={() => handleSave()} disabled={saving} className="vb-footer-save">
                  {saving ? <div className="vb-spinner-sm" /> : <Save className="w-4 h-4" />} Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'conversations' && (
          <ConversationsView settings={settings} onViewDetail={onViewDetail} />
        )}
        {activeTab === 'analytics' && (
          <AnalyticsView settings={settings} />
        )}
        {activeTab === 'conversation-detail' && (
          <ConversationDetailView id={detailId} onBack={() => onNavigate('conversations')} isPro={settings.is_pro} />
        )}
        {activeTab === 'help' && (
          <HelpView onNavigate={onNavigate} initialSection={helpContext} />
        )}
        {activeTab === 'settings' && (
          <GlobalSettingsView 
            settings={settings} 
            updateSetting={updateSetting} 
            handleSave={handleSave} 
            saving={saving} 
          />
        )}
        {activeTab === 'license' && (
          <LicenseView 
            settings={settings} 
            onUpdateSettings={setSettings}
            onToast={(title, desc, type) => setToast({ message: title, desc, type })}
          />
        )}
      </div>
    </>
  );
};

// ConversationDetailView is already imported at the top.

// ─── Main App ──────────────────────────────────────────────────

const App = () => {
  const [activeTab, setActiveTab] = useState(() => getUrlParam('tab', 'dashboard'));
  const [currentStep, setCurrentStep] = useState(() => parseInt(getUrlParam('step', '0'), 10) || 0);
  const [editChannel, setEditChannel] = useState(() => getUrlParam('channel', 'whatsapp'));
  const [previewMode, setPreviewMode] = useState('mobile');
  const [detailId, setDetailId] = useState(() => getUrlParam('id', null));
  const [settings, setSettings] = useState({ 
    activeChannels: [],
    global_message_template: '' 
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [helpContext, setHelpContext] = useState(null);

  const navigateToHelp = (section = null) => {
    setHelpContext(section);
    setActiveTab('help');
    setCurrentStep(0);
  };

  useEffect(() => {
    if (!window.vibebuyData) { setLoading(false); return; }
    fetch(`${window.vibebuyData.apiUrl}settings`, { headers: { 'X-WP-Nonce': window.vibebuyData.nonce } })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setSettings(prev => ({ ...prev, ...data })); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location);
    
    // Always keep page=vibebuy for WP stability
    url.searchParams.set('page', 'vibebuy');
    url.searchParams.set('tab', activeTab);
    
    if (activeTab === 'dashboard' && currentStep > 0) {
      url.searchParams.set('channel', editChannel);
      url.searchParams.set('step', currentStep);
    } else {
      url.searchParams.delete('channel');
      url.searchParams.delete('step');
    }

    if (activeTab === 'conversation-detail' && detailId) {
      url.searchParams.set('id', detailId);
    } else {
      url.searchParams.delete('id');
    }
    
    window.history.pushState({}, '', url);
  }, [activeTab, currentStep, editChannel, detailId]);

  useEffect(() => {
    const root = document.getElementById('vibebuy-admin-root');
    if (root) {
      const parent = root.closest('#wpbody-content');
      if (parent) { parent.style.padding = '0'; parent.style.backgroundColor = '#f5f6fa'; }
      const wrap = root.closest('.wrap');
      if (wrap) wrap.style.margin = '0';
    }
  }, []);

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleNavigate = (tab) => {
    setActiveTab(tab);
    setCurrentStep(0);
  };

  const startConfig = (id) => {
    setEditChannel(id);
    setCurrentStep(1);
    setActiveTab('dashboard');
  };

  const handleSave = async (manualSettings = null) => {
    const settingsToSave = manualSettings || settings;
    setSaving(true);
    try {
      const res = await fetch(`${window.vibebuyData.apiUrl}settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': window.vibebuyData.nonce },
        body: JSON.stringify(settingsToSave),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setSettings(prev => ({ ...prev, ...json.data }));
        }
        setToast({ message: 'Settings Saved', desc: 'Success!' });
        setTimeout(() => { 
            setToast(null); 
            // Close wizard after save ONLY if they are on Step 3
            if (currentStep === 3) setCurrentStep(0);
        }, 2000);
      }
    } catch (e) {
      console.error('Save error:', e);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="vb-loading">
      <div className="vb-spinner" />
      <p>Loading Dashboard...</p>
    </div>
  );

  const channel = getChannel(editChannel);
  const StepComponent = {
    1: channel.ConfigStep,
  }[currentStep];

  return (
    <div className="vb-shell">
      <Sidebar activeTab={activeTab} onNavigate={handleNavigate} onUpgrade={() => setShowUpgradeModal(true)} settings={settings} />
      <div className="vb-main">
        {currentStep === 0 ? (
          <DashboardContent
            activeTab={activeTab}
            settings={settings}
            updateSetting={updateSetting}
            setSettings={setSettings}
            startConfig={startConfig}
            handleSave={handleSave}
            saving={saving}
            onUpgrade={() => setShowUpgradeModal(true)}
            onHelp={navigateToHelp}
            onNavigate={handleNavigate}
            onViewDetail={(id) => {
              setDetailId(id);
              setActiveTab('conversation-detail');
            }}
            detailId={detailId}
            helpContext={helpContext}
            setToast={setToast} />
        ) : (
          <div className="vb-wizard-inner">
            <header className="vb-wizard-header">
              <div className="flex items-center gap-3">
                <button onClick={() => setCurrentStep(0)} className="vb-back-btn">
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <div className="w-px h-5 bg-gray-200" />
                <div className="vb-wizard-title-group">
                  <div className={`vb-channel-icon-sm ${channel.color} mr-2`}>{channel.icon}</div>
                  <h1 className="vb-wizard-title">{channel.name} Connection</h1>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={settings.is_pro ? 'vb-header-version-green' : 'vb-header-version-gray'}>
                  {settings.is_pro ? 'VibeBuy Pro' : 'VibeBuy Lite'}
                </span>
                <span className="vb-header-version-gray">{VERSION}</span>
              </div>
            </header>

            <div className="vb-step-bar pb-8 border-b border-gray-100 mb-8">
               <p className="text-xs font-medium text-gray-400">Branding and display settings have been moved to the <span className="text-blue-500 font-bold">Global Settings</span> tab for a unified experience.</p>
            </div>

            <main className="p-8">
              <div className="flex flex-col lg:flex-row gap-8">
                
                {/* Left: Configuration Form */}
                <div className="flex-1 space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
                  <div className="vb-section-card p-0 overflow-visible">
                    <div className="p-8">
                      {StepComponent ? (
                        <StepComponent
                          channel={channel}
                          settings={settings}
                          updateSetting={updateSetting}
                          setCurrentStep={setCurrentStep}
                          onNavigate={handleNavigate}
                          onHelp={navigateToHelp}
                        />
                      ) : (
                        <div className="text-center py-20">
                          <div className="vb-spinner-sm mx-auto mb-4" />
                          <p className="text-gray-400 text-xs font-black uppercase tracking-widest">Loading configuration...</p>
                        </div>
                      )}
                    </div>

                    {/* ─── Placement Settings Section (PRO Locked) ─── */}
                    <div className={`p-8 border-t border-dashed transition-all ${!settings.is_pro ? 'bg-gray-50/30' : 'bg-blue-50/5'}`}>
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${settings.is_pro ? 'bg-blue-50 text-blue-500' : 'bg-gray-100 text-gray-400'}`}>
                            <Share2 className="w-4 h-4" />
                          </div>
                          <div>
                            <h3 className="text-xs font-black uppercase text-gray-900 tracking-widest">Placement Setting</h3>
                            <p className="text-[10px] text-gray-400 font-medium italic">Define how this channel interacts with the widget</p>
                          </div>
                        </div>
                        {!settings.is_pro && (
                          <div className="bg-amber-400 text-white px-2 py-0.5 rounded text-[8px] font-black shadow-sm uppercase tracking-tighter">
                             PRO ONLY
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
                          <div className="flex-1">
                            <p className="text-sm font-bold text-gray-800 mb-1">Show as Floating Shortcut</p>
                            <p className="text-[11px] text-gray-500 leading-relaxed font-medium">
                              { (editChannel === 'tiktok' || editChannel === 'instagram') 
                                  ? 'TikTok and Instagram always use this mode to ensure compatibility.'
                                  : 'Enable this to show the icon as a secondary shortcut floating bar, skipping the lead form.'
                              }
                            </p>
                          </div>
                          <button 
                            disabled={!settings.is_pro}
                            onClick={() => updateSetting(`${editChannel}_show_as_shortcut`, !settings[`${editChannel}_show_as_shortcut`])}
                            className={`vb-toggle ${ (settings[`${editChannel}_show_as_shortcut`] || editChannel === 'tiktok' || editChannel === 'instagram') ? 'vb-toggle--on' : 'vb-toggle--off'} ${!settings.is_pro ? 'grayscale opacity-50' : ''}`}
                          >
                            <div className={`vb-toggle-thumb ${ (settings[`${editChannel}_show_as_shortcut`] || editChannel === 'tiktok' || editChannel === 'instagram') ? 'vb-toggle-thumb--on' : 'vb-toggle-thumb--off'}`} />
                          </button>
                        </div>
                        
                        {!settings.is_pro && (
                          <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-xl border border-amber-100">
                             <Lock className="w-3.5 h-3.5 text-amber-500" />
                             <p className="text-[10px] text-amber-800 font-bold italic">
                               Upgrade to PRO to unlock shortcut bars and custom placement logic.
                             </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Live Preview (Sticky) */}
                <div className="lg:w-[320px] shrink-0">
                  <div className="sticky top-8 space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="flex items-center justify-between px-1">
                       <h3 className="text-[11px] font-black uppercase text-gray-400 tracking-[0.2em]">Live Preview</h3>
                       <div className="bg-gray-100 p-1 rounded-xl shadow-inner flex items-center gap-1">
                          <button 
                            onClick={() => setPreviewMode('mobile')}
                            className={`p-1.5 rounded-lg transition-all ${previewMode === 'mobile' ? 'bg-white shadow-sm text-blue-600 border border-gray-100' : 'text-gray-400 opacity-40'}`}
                          >
                            <Smartphone className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => setPreviewMode('desktop')}
                            className={`p-1.5 rounded-lg transition-all ${previewMode === 'desktop' ? 'bg-white shadow-sm text-blue-600 border border-gray-100' : 'text-gray-400 opacity-40'}`}
                          >
                            <Monitor className="w-3.5 h-3.5" />
                          </button>
                       </div>
                    </div>
                    
                    <div className="bg-slate-50 rounded-[2rem] p-3 border border-slate-100 flex items-center justify-center relative overflow-hidden shadow-inner">
                      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5" />
                      <div className="relative z-10 w-full flex justify-center">
                        <PreviewWidget settings={settings} previewMode={previewMode} editChannel={editChannel} />
                      </div>
                    </div>

                    <div className="p-5 bg-white border border-gray-100 rounded-3xl shadow-sm">
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                          <Eye className="w-3 h-3 text-blue-500" /> Visual Context
                       </p>
                       <p className="text-[11px] text-gray-500 leading-relaxed font-medium">
                          The preview reflects your current <strong>{channel.name}</strong> configuration alongside global branding settings.
                       </p>
                    </div>
                  </div>
                </div>
              </div>
            </main>

            <footer className="vb-wizard-footer">
              <button
                onClick={() => setCurrentStep(0)}
                className="vb-footer-back"
              >
                <ChevronLeft className="w-4 h-4" /> Exit
              </button>
              
              <div className="flex items-center gap-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSave()}
                    disabled={saving}
                    className="vb-footer-save"
                  >
                    {saving ? <div className="vb-spinner-sm" /> : <Save className="w-4 h-4" />}
                    Save Connection
                  </button>
                </div>
              </div>
            </footer>
          </div>
        )}
      </div>

      <ProUpgradeModal 
        isOpen={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)} 
      />
      
      {toast && <Toast {...toast} />}
    </div>
  );
};

const root = document.getElementById('vibebuy-admin-root');
if (root) createRoot(root).render(<App />);

export default App;
