import React from 'react';
import { Lock, Check, Info, ShieldCheck, Zap } from 'lucide-react';
import MessageTemplateEditor from '../../components/MessageTemplateEditor.jsx';

const UniversalProConfig = ({ channel, settings, updateSetting, onNavigate }) => {
  const prefix = `${channel.id}_`;
  const get = (field, fallback = '') => settings[prefix + field] ?? fallback;

  const activeChannels = settings.activeChannels || [];
  const isActive = activeChannels.includes(channel.id);

  const toggleChannel = () => {
    let newActive;
    if (isActive) {
      newActive = activeChannels.filter(id => id !== channel.id);
    } else {
      newActive = [...activeChannels, channel.id];
    }
    updateSetting('activeChannels', newActive);
  };

  const isZalo = channel.id === 'zalo';
  const isMessenger = channel.id === 'messenger';

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* 1. Pro Status Banner */}
      <div className="flex items-center gap-4 p-4 rounded-3xl bg-slate-900 text-white shadow-xl shadow-slate-200">
        <div className="w-12 h-12 rounded-2xl bg-amber-400 flex items-center justify-center text-slate-900 shrink-0 shadow-lg shadow-amber-200/20">
           <ShieldCheck className="w-6 h-6" />
        </div>
        <div className="flex-1">
           <h3 className="text-sm font-black uppercase tracking-widest text-amber-400">Pro Channel Active</h3>
           <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Advanced messaging engine is fully unlocked.</p>
        </div>
        <div className="flex items-center gap-3 pr-2">
           <span className="text-[10px] font-black uppercase tracking-tighter text-slate-500">{isActive ? 'ONLINE' : 'OFFLINE'}</span>
           <button 
             onClick={toggleChannel}
             className={`vb-toggle ${isActive ? 'vb-toggle--on' : 'vb-toggle--off'} scale-90`}
           >
             <div className={`vb-toggle-thumb ${isActive ? 'vb-toggle-thumb--on' : 'vb-toggle-thumb--off'}`} />
           </button>
        </div>
      </div>

      {/* 2. Primary Connection ID */}
      <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-black uppercase text-gray-400 tracking-widest">
            {isZalo ? 'Zalo Number / ID' : isMessenger ? 'Messenger Page ID' : 'Channel ID'}
          </label>
          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-50 rounded-full border border-blue-100">
             <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
             <span className="text-[8px] font-black text-blue-600 uppercase">Verified</span>
          </div>
        </div>
        
        <div className="relative group">
           <input
             type="text"
             value={get(isZalo ? 'number' : 'id')}
             onChange={e => updateSetting(`${prefix}${isZalo ? 'number' : 'id'}`, e.target.value)}
             placeholder={isZalo ? '090xxxxxxx' : '10293xxxxxxx'}
             className="w-full h-14 px-5 bg-gray-50 border-2 border-transparent rounded-2xl text-lg font-bold group-hover:bg-gray-100 focus:bg-white focus:border-blue-500 transition-all outline-none"
           />
           <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Zap className="w-5 h-5 text-amber-400 fill-current" />
           </div>
        </div>

        <p className="text-[10px] text-gray-400 font-medium leading-relaxed italic">
           {isZalo ? '* Direct link to Zalo profile/official account.' : isMessenger ? '* Messenger Page ID or URL slug.' : '* Required for connection.'}
        </p>
      </div>

      {/* 3. Branding & Personalization */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         <div className="p-4 bg-white rounded-3xl border border-gray-100 shadow-sm space-y-3">
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block">Button Text</label>
            <input 
              type="text"
              value={get('buttonText')}
              onChange={e => updateSetting(`${prefix}buttonText`, e.target.value)}
              placeholder={`Chat qua ${channel.name}`}
              className="w-full h-10 px-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold outline-none focus:border-blue-500 transition-all"
            />
         </div>
         <div className="p-4 bg-white rounded-3xl border border-gray-100 shadow-sm space-y-3">
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block">Custom Icon</label>
            <input 
              type="text"
              value={get('iconUrl')}
              onChange={e => updateSetting(`${prefix}iconUrl`, e.target.value)}
              placeholder="https://..."
              className="w-full h-10 px-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold outline-none focus:border-blue-500 transition-all"
            />
         </div>
      </div>

      {/* 3.5 Custom Message Template (NEW) */}
      <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-[11px] font-black uppercase text-gray-900 tracking-widest">Custom Message Template</h4>
            <p className="text-[9px] text-gray-400 font-bold uppercase mt-1">Override the global message for this specific channel.</p>
          </div>
          <div className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[8px] font-black uppercase tracking-tighter">Pro Feature</div>
        </div>

        <MessageTemplateEditor 
          value={get('message_template')}
          onChange={val => updateSetting(`${prefix}message_template`, val)}
          placeholder="Hi! I want to order {{product_name}}..."
        />
      </div>

      {/* 4. Pro Exclusives (Unlocked) */}
      <div className="p-6 bg-blue-50/50 rounded-[40px] border border-blue-100/50 relative overflow-hidden group">
         <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform duration-700">
            <ShieldCheck className="w-32 h-32 text-blue-600" />
         </div>
         
         <div className="relative space-y-4">
            <div className="flex items-center gap-2">
               <h4 className="text-[11px] font-black uppercase text-blue-600 tracking-widest">Advanced Logic UNLOCKED</h4>
               <div className="h-px bg-blue-200 flex-1" />
            </div>
            
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
               {[
                  { label: 'Auto-Inquiry', desc: 'Sync with lead form' },
                  { label: 'Cloud Sync', desc: 'Real-time backup' },
                  { label: 'Multi-Agent', desc: 'Round-robin routing' },
                  { label: 'Analytics', desc: 'Detailed click maps' }
               ].map((f, i) => (
                  <div key={i} className="flex items-start gap-2">
                     <div className="mt-0.5 w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-white shadow-lg shadow-blue-200">
                        <Check className="w-2.5 h-2.5" strokeWidth={3} />
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-slate-800 leading-none">{f.label}</p>
                        <p className="text-[9px] text-blue-500/80 font-bold uppercase mt-1 leading-none">{f.desc}</p>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </div>

      {/* 5. Shortcode */}
      <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200 border-dashed text-center">
         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Direct Shortcode</p>
         <code className="px-4 py-2 bg-white rounded-xl border border-slate-200 text-sm font-black text-blue-600 inline-block shadow-sm">
            {`[vibebuy channel="${channel.id}"]`}
         </code>
      </div>
    </div>
  );
};

export default UniversalProConfig;
