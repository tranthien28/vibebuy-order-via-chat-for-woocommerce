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
          <label 
            onClick={() => updateSetting(`${prefix}template_mode`, 'global')}
            className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all cursor-pointer ${get('template_mode', 'global') === 'global' ? 'border-blue-600 bg-blue-50/30 ring-4 ring-blue-50/20 shadow-sm' : 'border-gray-100 bg-white opacity-60'}`}
          >
            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${get('template_mode', 'global') === 'global' ? 'border-blue-600' : 'border-gray-300'}`}>
              {get('template_mode', 'global') === 'global' && <div className="w-2 h-2 rounded-full bg-blue-500" />}
            </div>
            <div className="flex-1">
              <p className={`text-[11px] font-black uppercase tracking-tight ${get('template_mode', 'global') === 'global' ? 'text-blue-700' : 'text-gray-500'}`}>Use Global Template</p>
              <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">Sync with main settings</p>
            </div>
            {get('template_mode', 'global') === 'global' && <Check className="w-5 h-5 text-blue-600" strokeWidth={3} />}
          </label>

          <div 
            onClick={() => settings.is_pro && updateSetting(`${prefix}template_mode`, 'custom')}
            className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${!settings.is_pro ? 'border-dashed border-slate-200 bg-slate-50/50 opacity-60 grayscale cursor-not-allowed' : 'cursor-pointer'} ${get('template_mode') === 'custom' ? 'border-indigo-600 bg-indigo-50/30 ring-4 ring-indigo-50/20 shadow-sm' : 'border-gray-100 bg-white opacity-60'}`}
          >
            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${get('template_mode') === 'custom' ? 'border-indigo-600' : 'border-gray-300'}`}>
              {get('template_mode') === 'custom' && <div className="w-2 h-2 rounded-full bg-indigo-500" />}
            </div>
            <div className="flex-1">
              <p className={`text-[11px] font-black uppercase tracking-tight ${get('template_mode') === 'custom' ? 'text-indigo-700' : 'text-gray-500'}`}>Channel Override</p>
              <p className="text-[10px] text-gray-400 font-black uppercase mt-0.5">Custom template for {channel.name}</p>
            </div>
            {!settings.is_pro ? (
              <span className="bg-amber-400 text-white text-[9px] font-black px-2 py-1 rounded-lg shadow-sm uppercase">PRO</span>
            ) : (
              get('template_mode') === 'custom' && <Check className="w-5 h-5 text-indigo-600" strokeWidth={3} />
            )}
          </div>
        </div>

        {settings.is_pro && get('template_mode') === 'custom' && (
          <div className="mt-4 p-4 bg-indigo-50/30 border border-indigo-100 rounded-2xl animate-in slide-in-from-top-2">
             <MessageTemplateEditor 
                value={get('message_template')}
                onChange={val => updateSetting(`${prefix}message_template`, val)}
                placeholder="Hi! I want to order {{product_name}} via WhatsApp..."
             />
          </div>
        )}
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
