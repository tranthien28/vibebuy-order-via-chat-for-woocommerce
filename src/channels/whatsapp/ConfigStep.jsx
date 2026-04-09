import React from 'react';
import { Lock, Check, Info } from 'lucide-react';
import MessageTemplateEditor from '../../components/MessageTemplateEditor.jsx';

const ConfigStep = ({ channel, settings, updateSetting, onNavigate }) => {
  const prefix = `${channel.id}_`;
  const get = (field, fallback = '') => settings[prefix + field] ?? fallback;

  // Handle global activeChannels array
  const activeChannels = settings.activeChannels || [];
  const isActive = activeChannels.includes(channel.id);

  const toggleChannel = () => {
    let newActive;
    if (isActive) {
      newActive = activeChannels.filter(id => id !== channel.id);
    } else {
      newActive = settings.is_pro ? [...activeChannels, channel.id] : [channel.id];
    }
    updateSetting('activeChannels', newActive);
  };

  return (
    <div className="space-y-6">
      {/* Channel Activation */}
      <div className="flex items-center justify-between p-4 bg-blue-50/50 rounded-2xl border border-blue-100 mb-2">
        <div>
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            {channel.name} Engine Status
            {isActive ? <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" /> : <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />}
          </h3>
          <p className="text-[10px] text-gray-500 font-medium">Toggle this to enable/disable {channel.name} notifications.</p>
        </div>
        <button 
          onClick={toggleChannel}
          className={`vb-toggle ${isActive ? 'vb-toggle--on' : 'vb-toggle--off'}`}
        >
          <div className={`vb-toggle-thumb ${isActive ? 'vb-toggle-thumb--on' : 'vb-toggle-thumb--off'}`} />
        </button>
      </div>

      {/* Phone Number */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-semibold text-gray-700">
            Phone Number
          </label>
          <button onClick={() => onNavigate('help')} className="text-[10px] font-bold text-blue-500 hover:underline">Refer to tutorial</button>
        </div>
        <input
          type="tel"
          value={get('number')}
          onChange={e => updateSetting(`${prefix}number`, e.target.value)}
          placeholder="+84 xxx xxx xxx"
          className="vibebuy-input"
        />
        <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1.5">
            <Info className="w-3 h-3 text-blue-400" />
            Lite version uses direct <b>wa.me</b> links. No API keys required.
        </p>
      </div>

      {/* Message Template Selection */}
      <div className="pt-2 border-t border-slate-100">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Message Template
        </label>
        <div className="space-y-3">
          <label className="flex items-center gap-4 p-4 rounded-2xl border-2 border-blue-600 bg-blue-50/30 ring-4 ring-blue-50/20 shadow-sm cursor-pointer transition-all active:scale-[0.98]">
            <div className={`w-4 h-4 rounded-full border-2 border-blue-600 flex items-center justify-center shadow-[0_0_8px_rgba(59,130,246,0.4)]`}>
              <div className="w-2 h-2 rounded-full bg-blue-500" />
            </div>
            <div className="flex-1">
              <p className="text-[11px] font-black text-blue-700 uppercase tracking-tight">Use Global Template</p>
              <p className="text-[10px] text-blue-600/70 font-bold uppercase mt-0.5">Sync with main settings</p>
            </div>
            <Check className="w-5 h-5 text-blue-600" strokeWidth={3} />
          </label>

          <div className="flex items-center gap-4 p-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 opacity-60 grayscale cursor-not-allowed">
            <div className="w-4 h-4 rounded-full border-2 border-slate-300" />
            <div className="flex-1">
              <p className="text-[11px] font-black text-slate-500 uppercase tracking-tight">Channel Override</p>
              <p className="text-[10px] text-slate-400 font-black uppercase mt-0.5">Custom template for {channel.name}</p>
            </div>
            <span className="bg-amber-400 text-white text-[9px] font-black px-2 py-1 rounded-lg shadow-sm">PRO</span>
          </div>
        </div>
      </div>


      {/* 📋 SHORTCODE */}
      <div className="pt-6 border-t border-gray-100">
        <label className="block text-sm font-semibold text-gray-700 mb-3">Shortcode (Manual)</label>
        <div className="flex items-center justify-between border-2 border-blue-50 rounded-2xl px-5 py-4 bg-blue-50/20 shadow-sm overflow-hidden ring-4 ring-white">
          <code className="text-sm text-blue-600 font-bold font-mono tracking-tight">{`[vibebuy channel="${channel.id}"]`}</code>
          <button 
            onClick={() => {
                navigator.clipboard.writeText(`[vibebuy channel="${channel.id}"]`);
                alert('Shortcode copied!');
            }} 
            className="text-blue-500 hover:text-blue-700 transition-all active:scale-90 p-2 bg-white rounded-lg shadow-sm border border-blue-50"
          >
            <Check className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[10px] text-gray-400 font-medium mt-3 italic px-2 text-center opacity-70">Paste this code anywhere to render the button manually.</p>
      </div>
    </div>
  );
};

export default ConfigStep;
