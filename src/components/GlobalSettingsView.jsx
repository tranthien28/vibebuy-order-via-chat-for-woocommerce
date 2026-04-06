import React, { useState } from 'react';
import { Save, Smartphone, Monitor, Palette, Eye, Check, Layout, Target, XCircle, CheckCircle, Lock, Plus, ExternalLink, Globe, ShoppingBag, Download, Share2 } from 'lucide-react';
import PreviewWidget from './PreviewWidget.jsx';

const PRESET_COLORS = [
  '#22c55e', '#206bc4', '#ef4444', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#1f2937'
];

const GlobalSettingsView = ({ settings, updateSetting, handleSave, saving }) => {
  const [previewMode, setPreviewMode] = useState('mobile');

  const inputClass = "w-full h-9 px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium focus:border-green-500 transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed";
  const labelClass = "block text-[11px] font-bold text-gray-500 uppercase tracking-tight mb-1.5";

  return (
    <div className="vb-section-card mb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="vb-section-header">
        <h2 className="vb-section-title">Branding & Layout</h2>
        <p className="vb-section-subtitle">Configure the visual identity and display behavior of your messaging widget.</p>
      </div>

      <div className="p-6">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left: Settings */}
          <div className="flex-1 space-y-10">

            {/* 1. Visual Branding */}
            <section className="space-y-6">
              <div className="pb-2 border-b border-gray-50">
                <h3 className="text-xs font-black uppercase text-gray-900 tracking-widest">Visual Style</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Theme Color */}
                <div className="space-y-3">
                  <label className={labelClass}>Theme Color</label>
                  <div className="flex gap-2 flex-wrap">
                    {PRESET_COLORS.map(c => (
                      <button
                        key={c}
                        onClick={() => updateSetting('backgroundColor', c)}
                        className="w-8 h-8 rounded-lg transition-all hover:scale-110 border-2 border-white shadow-sm"
                        style={{
                          backgroundColor: c,
                          outline: (settings.backgroundColor || '#22c55e') === c ? `2px solid ${c}` : 'none',
                          outlineOffset: '1px'
                        }}
                      >
                        {(settings.backgroundColor || '#22c55e') === c && <Check className="w-3 h-3 text-white mx-auto" />}
                      </button>
                    ))}
                  </div>
                  <div className={`flex items-center gap-2 p-1.5 rounded-lg border border-gray-200 group relative ${!settings.is_pro ? 'opacity-60 bg-gray-100' : 'bg-white shadow-inner'}`}>
                    <input
                      type="color"
                      disabled={!settings.is_pro}
                      value={settings.backgroundColor || '#22c55e'}
                      onChange={(e) => updateSetting('backgroundColor', e.target.value)}
                      className={`w-6 h-6 rounded-md border border-gray-300 cursor-pointer ${!settings.is_pro ? 'pointer-events-none' : ''}`}
                    />
                    <input
                      type="text"
                      disabled={!settings.is_pro}
                      value={settings.backgroundColor || '#22c55e'}
                      onChange={(e) => updateSetting('backgroundColor', e.target.value)}
                      className="flex-1 bg-transparent border-none text-[10px] font-mono font-bold uppercase outline-none"
                    />
                    {!settings.is_pro ? (
                      <>
                        <Lock className="w-3 h-3 text-gray-400 mr-1" />
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[8px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none uppercase">Custom Hex (PRO)</div>
                      </>
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse" title="Pro Unlocked" />
                    )}
                  </div>
                </div>

                {/* Text Color */}
                <div className="space-y-3">
                  <label className={labelClass}>Text Color</label>
                  <div className="flex gap-2 flex-wrap">
                    {['#ffffff', '#000000', '#f3f4f6', '#111827'].map(c => (
                      <button
                        key={c}
                        onClick={() => updateSetting('textColor', c)}
                        className="w-8 h-8 rounded-lg transition-all hover:scale-110 border-2 border-white shadow-sm"
                        style={{
                          backgroundColor: c,
                          outline: (settings.textColor || '#ffffff') === c ? `2px solid #ddd` : 'none',
                          outlineOffset: '1px'
                        }}
                      >
                        {(settings.textColor || '#ffffff') === c && <Check className={`w-3 h-3 mx-auto ${c === '#ffffff' ? 'text-gray-400' : 'text-white'}`} />}
                      </button>
                    ))}
                  </div>
                  <div className={`flex items-center gap-2 p-1.5 rounded-lg border border-gray-200 group relative ${!settings.is_pro ? 'opacity-60 bg-gray-100' : 'bg-white shadow-inner'}`}>
                    <input
                      type="color"
                      disabled={!settings.is_pro}
                      value={settings.textColor || '#ffffff'}
                      onChange={(e) => updateSetting('textColor', e.target.value)}
                      className={`w-6 h-6 rounded-md border border-gray-300 cursor-pointer ${!settings.is_pro ? 'pointer-events-none' : ''}`}
                    />
                    <input
                      type="text"
                      disabled={!settings.is_pro}
                      value={settings.textColor || '#ffffff'}
                      onChange={(e) => updateSetting('textColor', e.target.value)}
                      className="flex-1 bg-transparent border-none text-[10px] font-mono font-bold uppercase outline-none"
                    />
                    {!settings.is_pro ? (
                      <>
                        <Lock className="w-3 h-3 text-gray-400 mr-1" />
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[8px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none uppercase">Custom Hex (PRO)</div>
                      </>
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse" />
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-compact">
                <div className="md:col-span-1">
                  <label className={labelClass}>Button Label</label>
                  <input
                    type="text"
                    value={settings.buttonText || 'Chat with us'}
                    onChange={e => updateSetting('buttonText', e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div className="md:col-span-1">
                  <label className={labelClass}>Icon URL</label>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={settings.iconUrl || ''}
                    onChange={e => updateSetting('iconUrl', e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Rounding (px)</label>
                  <input
                    type="number"
                    value={settings.borderRadius ?? 10}
                    onChange={e => {
                      const val = e.target.value === '' ? 0 : parseInt(e.target.value, 10);
                      updateSetting('borderRadius', isNaN(val) ? 0 : val);
                    }}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Font Size</label>
                  <input
                    type="number"
                    value={settings.fontSize ?? 14}
                    onChange={e => updateSetting('fontSize', parseInt(e.target.value, 10))}
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Button Layout */}
              <div className="pt-6 border-t border-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <label className={labelClass}>Button Layout</label>
                  <p className="text-[10px] text-gray-400 font-medium italic">How the button sits relative to the cart</p>
                </div>
                <div className="flex gap-2">
                  {[
                    { id: 'stacked', label: 'Stacked (100%)' },
                    { id: 'inline', label: 'Inline (Auto)' },
                    ...(settings.is_pro ? [{ id: 'responsive', label: 'Smart Resp.' }] : [])
                  ].map(l => (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => updateSetting('buttonLayout', l.id)}
                      className={`flex-1 py-1.5 px-3 rounded-lg border text-[10px] font-black uppercase transition-all ${(settings.buttonLayout || 'stacked') === l.id ? 'bg-green-600 border-green-600 text-white shadow-md' : 'bg-white border-gray-200 text-gray-400 hover:border-gray-300'
                        }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>

                {/* PRO Smart Responsive */}
                {!settings.is_pro && (
                  <div className="mt-3 flex items-center justify-between p-3 rounded-2xl border border-dashed border-gray-100 bg-gray-50/30 opacity-70">
                    <div className="flex items-center gap-3">
                      <Smartphone className="w-4 h-4 text-gray-300" />
                      <div>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-tight leading-none">Smart Responsive (PRO)</p>
                        <p className="text-[9px] text-gray-400 font-bold uppercase mt-1">Mobile Stacked / Desktop Inline</p>
                      </div>
                    </div>
                    <span className="bg-amber-400 text-white text-[8px] font-black px-1.5 py-0.5 rounded shadow-sm">PRO</span>
                  </div>
                )}
              </div>
            </section>

            {/* 2. Positioning */}
            <section className="space-y-6">
              <div className="pb-2 border-b border-gray-50">
                <h3 className="text-xs font-black uppercase text-gray-900 tracking-widest">Button Positioning</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className={labelClass}>In-Page Placement</label>
                    <p className="text-[10px] text-gray-400 font-medium italic">Standard WooCommerce hooks</p>
                  </div>
                  <div className="flex gap-2">
                    {[
                      { id: 'before_cart', label: 'Before Cart' },
                      { id: 'after_cart', label: 'After Cart' },
                      ...(settings.is_pro ? [
                        { id: 'sticky_right', label: 'Float Right' },
                        { id: 'sticky_left', label: 'Float Left' }
                      ] : [])
                    ].map(pos => (
                      <button
                        key={pos.id}
                        type="button"
                        onClick={() => updateSetting('buttonPosition', pos.id)}
                        className={`flex-1 py-1.5 px-3 rounded-lg border text-[10px] font-black uppercase transition-all ${settings.buttonPosition === pos.id ? 'bg-green-600 border-green-600 text-white shadow-md' : 'bg-white border-gray-200 text-gray-400 hover:border-gray-300'}`}
                      >
                        {pos.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* PRO Sticky Positioning */}
                {!settings.is_pro && (
                  <div className="mt-4 flex items-center justify-between p-3 rounded-2xl border border-dashed border-gray-100 bg-gray-50/30 opacity-70">
                    <div className="flex items-center gap-3">
                      <Monitor className="w-4 h-4 text-gray-300" />
                      <div>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-tight leading-none">Sticky Floating (PRO)</p>
                        <p className="text-[9px] text-gray-400 font-bold uppercase mt-1">Float Right/Bottom / Left/Bottom</p>
                      </div>
                    </div>
                    <span className="bg-amber-400 text-white text-[8px] font-black px-1.5 py-0.5 rounded shadow-sm">PRO</span>
                  </div>
                )}
              </div>
            </section>

            {/* 2.5 Shortcut Bar Positioning (PRO) */}
            <section className={`space-y-6 p-6 rounded-3xl border border-dashed transition-all ${!settings.is_pro ? 'border-gray-200 bg-gray-50/30' : 'border-blue-100 bg-blue-50/10'}`}>
               <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Share2 className={`w-4 h-4 ${settings.is_pro ? 'text-blue-500' : 'text-gray-400'}`} />
                  <h3 className={`text-xs font-black uppercase tracking-widest ${settings.is_pro ? 'text-gray-900' : 'text-gray-500'}`}>
                    Social Shortcut Bar {settings.is_pro ? '' : '(PRO)'}
                  </h3>
                </div>
                {!settings.is_pro && (
                  <span className="bg-amber-400 text-white text-[9px] font-black px-2 py-0.5 rounded shadow-sm uppercase">PRO</span>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-gray-800">Enable Shortcut Bar</p>
                    <p className="text-[11px] text-gray-500">Show secondary floating icons for direct social links.</p>
                  </div>
                  <button 
                    disabled={!settings.is_pro}
                    onClick={() => updateSetting('floatingSocial_enabled', !settings.floatingSocial_enabled)} 
                    className={`vb-toggle ${settings.floatingSocial_enabled ? 'vb-toggle--on' : 'vb-toggle--off'} ${!settings.is_pro ? 'grayscale opacity-50' : ''}`}
                  >
                    <div className={`vb-toggle-thumb ${settings.floatingSocial_enabled ? 'vb-toggle-thumb--on' : 'vb-toggle-thumb--off'}`} />
                  </button>
                </div>

                <div className={!settings.is_pro ? 'opacity-50 pointer-events-none' : ''}>
                  <label className={labelClass}>Shortcut Bar Position</label>
                  <div className="flex gap-2">
                    {[
                      { id: 'bottom-right', label: 'Bottom Right' },
                      { id: 'bottom-left', label: 'Bottom Left' }
                    ].map(pos => (
                      <button
                        key={pos.id}
                        type="button"
                        onClick={() => updateSetting('floatingSocial_position', pos.id)}
                        className={`flex-1 py-1.5 px-3 rounded-lg border text-[10px] font-black uppercase transition-all ${(settings.floatingSocial_position || 'bottom-right') === pos.id ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white border-gray-200 text-gray-400 hover:border-gray-300'}`}
                      >
                        {pos.label}
                      </button>
                    ))}
                  </div>
                </div>
                
                {!settings.is_pro && (
                  <p className="text-[10px] text-blue-500 font-bold italic mt-2">
                    * Floating shortcut icons for TikTok, Instagram, and more are exclusive to the PRO version.
                  </p>
                )}
              </div>
            </section>

            {/* 3. Order Modal & Form Logic */}
            <section className="space-y-6">
              <div className="pb-2 border-b border-gray-50">
                <h3 className="text-xs font-black uppercase text-gray-900 tracking-widest">Inquiry Form Logic</h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Enable Pre-Chat Form</p>
                    <p className="text-[11px] text-gray-500">Require users to fill out a quick info form before redirecting to chat.</p>
                  </div>
                  <button onClick={() => updateSetting('orderModal_enabled', settings.orderModal_enabled === undefined ? true : !settings.orderModal_enabled)} className={`vb-toggle ${settings.orderModal_enabled !== false ? 'vb-toggle--on' : 'vb-toggle--off'}`}>
                    <div className={`vb-toggle-thumb ${settings.orderModal_enabled !== false ? 'vb-toggle-thumb--on' : 'vb-toggle-thumb--off'}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Auto-fill Customer Profile</p>
                    <p className="text-[11px] text-gray-500">Automatically predict names and emails for logged-in WP users.</p>
                  </div>
                  <button onClick={() => updateSetting('orderModal_autoFill', settings.orderModal_autoFill === undefined ? true : !settings.orderModal_autoFill)} className={`vb-toggle ${settings.orderModal_autoFill !== false ? 'vb-toggle--on' : 'vb-toggle--off'}`}>
                    <div className={`vb-toggle-thumb ${settings.orderModal_autoFill !== false ? 'vb-toggle-thumb--on' : 'vb-toggle-thumb--off'}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Prevent Duplicate Submissions</p>
                    <p className="text-[11px] text-gray-500">Skip the form entirely and go straight to chat if already submitted.</p>
                  </div>
                  <button onClick={() => updateSetting('orderModal_autoOff', settings.orderModal_autoOff === undefined ? true : !settings.orderModal_autoOff)} className={`vb-toggle ${settings.orderModal_autoOff !== false ? 'vb-toggle--on' : 'vb-toggle--off'}`}>
                    <div className={`vb-toggle-thumb ${settings.orderModal_autoOff !== false ? 'vb-toggle-thumb--on' : 'vb-toggle-thumb--off'}`} />
                  </button>
                </div>

                {/* PRO Success Action */}
                <div className={`p-4 rounded-2xl border border-dashed transition-all ${!settings.is_pro
                  ? 'border-gray-200 bg-white opacity-60 grayscale cursor-not-allowed'
                  : 'border-blue-100 bg-blue-50/30'
                  } relative overflow-hidden`}>
                  {!settings.is_pro && <div className="absolute top-2 right-2 bg-amber-400 text-white text-[8px] font-black px-1.5 py-0.5 rounded shadow-sm">PRO</div>}
                  <p className="text-[11px] font-black text-gray-900 uppercase tracking-widest mb-3">After Submission Action</p>
                  <div className="flex gap-2">
                    <div className={`flex-1 p-2.5 rounded-xl flex items-center gap-2 ${settings.is_pro ? 'bg-white border border-blue-200 shadow-sm' : 'bg-blue-50 border border-blue-100'}`}>
                      <CheckCircle className={`w-3 h-3 ${settings.is_pro ? 'text-green-500' : 'text-blue-500'}`} />
                      <span className={`text-[10px] font-bold ${settings.is_pro ? 'text-gray-700' : 'text-blue-700'}`}>Show Thank You Message</span>
                    </div>
                    <div className={`flex-1 p-2.5 rounded-xl flex items-center gap-2 ${settings.is_pro ? 'bg-white border border-gray-200' : 'bg-gray-50 border border-gray-100'}`}>
                      <ExternalLink className={`w-3 h-3 ${settings.is_pro ? 'text-blue-500' : 'text-gray-400'}`} />
                      <span className={`text-[10px] font-bold ${settings.is_pro ? 'text-gray-700' : 'text-gray-400'}`}>Redirect to URL</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
            
            {/* 3.2 Order & Conversion (NEW) */}
            <section className={`space-y-6 p-6 rounded-3xl border border-dashed transition-all ${!settings.is_pro ? 'border-gray-200 bg-gray-50/30' : 'border-green-100 bg-green-50/10'}`}>
               <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingBag className={`w-4 h-4 ${settings.is_pro ? 'text-green-600' : 'text-gray-400'}`} />
                  <h3 className={`text-xs font-black uppercase tracking-widest ${settings.is_pro ? 'text-gray-900' : 'text-gray-500'}`}>
                    Order & Conversion
                  </h3>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-gray-800">Auto-create WooCommerce Order</p>
                    <p className="text-[11px] text-gray-500">Automatically generate a "Pending" order in WooCommerce when a customer submits the form.</p>
                  </div>
                  <button 
                    onClick={() => updateSetting('order_creation_enabled', settings.order_creation_enabled === undefined ? true : !settings.order_creation_enabled)} 
                    className={`vb-toggle ${settings.order_creation_enabled !== false ? 'vb-toggle--on' : 'vb-toggle--off'}`}
                  >
                    <div className={`vb-toggle-thumb ${settings.order_creation_enabled !== false ? 'vb-toggle-thumb--on' : 'vb-toggle-thumb--off'}`} />
                  </button>
                </div>

                <div className={`pt-4 border-t border-gray-100 ${!settings.is_pro ? 'opacity-60 grayscale' : ''} relative`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <label className={labelClass}>Default Order Status</label>
                      {!settings.is_pro && <Lock className="w-2.5 h-2.5 text-amber-500" />}
                    </div>
                    {!settings.is_pro && (
                      <span className="bg-amber-400 text-white text-[8px] font-black px-1.5 py-0.5 rounded shadow-sm flex items-center gap-1">
                        PRO ONLY
                      </span>
                    )}
                  </div>
                  <div className="relative group">
                    <select 
                      disabled={!settings.is_pro}
                      value={settings.order_creation_status || 'pending'}
                      onChange={(e) => updateSetting('order_creation_status', e.target.value)}
                      className={`${inputClass} ${!settings.is_pro ? 'cursor-not-allowed bg-gray-50' : ''}`}
                    >
                      {settings.availableStatuses && settings.availableStatuses.length > 0 ? (
                        settings.availableStatuses.map(status => (
                          <option key={status.id} value={status.id}>{status.label}</option>
                        ))
                      ) : (
                        <>
                          <option value="pending">Pending Payment</option>
                          <option value="processing">Processing</option>
                          <option value="on-hold">On Hold</option>
                          <option value="completed">Completed</option>
                        </>
                      )}
                    </select>
                    {!settings.is_pro && (
                      <div 
                        className="absolute inset-0 cursor-not-allowed z-10" 
                        title="Upgrading to PRO is required to change order status"
                        onClick={() => {}}
                      />
                    )}
                  </div>
                  <p className="text-[10px] text-gray-400 font-medium mt-1.5 leading-tight italic">
                    {settings.is_pro 
                      ? 'Select the status for newly created orders.' 
                      : 'Customize order status with the Pro version. All orders are currently created as "Pending Payment".'}
                  </p>
                </div>

                <div className={`pt-4 border-t border-gray-100 ${!settings.is_pro ? 'opacity-60 grayscale' : ''} relative`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <label className={labelClass}>Show Button in Product Loops</label>
                      {!settings.is_pro && <Lock className="w-2.5 h-2.5 text-amber-500" />}
                    </div>
                    <button 
                      disabled={!settings.is_pro}
                      onClick={() => updateSetting('loop_display_enabled', !settings.loop_display_enabled)} 
                      className={`vb-toggle ${settings.loop_display_enabled ? 'vb-toggle--on' : 'vb-toggle--off'} ${!settings.is_pro ? 'grayscale opacity-50' : ''}`}
                    >
                      <div className={`vb-toggle-thumb ${settings.loop_display_enabled ? 'vb-toggle-thumb--on' : 'vb-toggle-thumb--off'}`} />
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-400 font-medium mt-1.5 leading-tight italic">
                    Display the VibeBuy contact button on Shop, Category, and Tag listing pages.
                  </p>
                </div>
              </div>
            </section>

            {/* 3.5 Branding Settings (PRO) */}
            <section className={`space-y-6 p-6 rounded-3xl border border-dashed transition-all ${!settings.is_pro ? 'border-gray-200 bg-gray-50/30' : 'border-indigo-100 bg-indigo-50/10'}`}>
               <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className={`w-4 h-4 ${settings.is_pro ? 'text-indigo-500' : 'text-gray-400'}`} />
                  <h3 className={`text-xs font-black uppercase tracking-widest ${settings.is_pro ? 'text-gray-900' : 'text-gray-500'}`}>
                    Branding & Whitelabel {settings.is_pro ? '' : '(PRO)'}
                  </h3>
                </div>
                {!settings.is_pro && (
                  <span className="bg-amber-400 text-white text-[9px] font-black px-2 py-0.5 rounded shadow-sm uppercase">PRO</span>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-gray-800">Hide "Powered by VibeBuy" label</p>
                    <p className="text-[11px] text-gray-500">Remove the branding tag from the bottom of the messaging widget.</p>
                  </div>
                  <button 
                    disabled={!settings.is_pro}
                    onClick={() => updateSetting('hideBranding', !settings.hideBranding)} 
                    className={`vb-toggle ${settings.hideBranding ? 'vb-toggle--on' : 'vb-toggle--off'} ${!settings.is_pro ? 'grayscale opacity-50' : ''}`}
                  >
                    <div className={`vb-toggle-thumb ${settings.hideBranding ? 'vb-toggle-thumb--on' : 'vb-toggle-thumb--off'}`} />
                  </button>
                </div>

                {!settings.is_pro && (
                  <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl">
                    <p className="text-[10px] text-indigo-600 font-bold italic leading-tight">
                      * Whitelabeling is a PRO feature. Upgrade to remove our branding and make the plugin your own.
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* 4. Visibility & Conditions (PRO) */}
            <section className="space-y-6 bg-slate-50/50 p-6 rounded-3xl border border-gray-100 relative overflow-hidden">
              {!settings.is_pro && (
                <div className="absolute top-4 right-4 flex items-center gap-1 bg-amber-400 text-white px-2 py-0.5 rounded-full shadow-sm">
                  <Lock className="w-2.5 h-2.5" />
                  <span className="bg-amber-400 text-white text-[8px] font-black px-1.5 py-0.5 rounded shadow-sm">PRO</span>
                </div>
              )}

              <div className="pb-2 border-b border-gray-100">
                <h3 className={`text-xs font-black uppercase tracking-widest ${settings.is_pro ? 'text-blue-600' : 'text-gray-400'}`}>
                  Advanced Targeting {settings.is_pro ? '(UNLOCKED)' : '(PRO)'}
                </h3>
              </div>

              <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 transition-all ${!settings.is_pro ? 'opacity-60 grayscale cursor-not-allowed pointer-events-none' : ''}`}>
                {/* LEFT: Devices & Time */}
                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className={labelClass}>Device & Platforms</label>
                    <div className="flex gap-2">
                      <div className={`flex-1 flex items-center justify-between p-2 bg-white rounded-lg border ${settings.hide_on_mobile ? 'border-red-200 bg-red-50' : 'border-gray-200'}`}>
                        <Smartphone className={`w-3.5 h-3.5 ${settings.hide_on_mobile ? 'text-red-500' : 'text-gray-400'}`} />
                        <span className="text-[10px] font-bold text-gray-700">Hide on Mobile</span>
                        <button
                          disabled={!settings.is_pro}
                          onClick={() => updateSetting('hide_on_mobile', !settings.hide_on_mobile)}
                          className={`vb-toggle-sm ${settings.hide_on_mobile ? 'vb-toggle--on' : 'vb-toggle--off'}`}
                        >
                          <div className="vb-toggle-thumb-sm" />
                        </button>
                      </div>
                      <div className={`flex-1 flex items-center justify-between p-2 bg-white rounded-lg border ${settings.hide_on_desktop ? 'border-red-200 bg-red-50' : 'border-gray-200'}`}>
                        <Monitor className={`w-3.5 h-3.5 ${settings.hide_on_desktop ? 'text-red-500' : 'text-gray-400'}`} />
                        <span className="text-[10px] font-bold text-gray-700">Hide on Desktop</span>
                        <button
                          disabled={!settings.is_pro}
                          onClick={() => updateSetting('hide_on_desktop', !settings.hide_on_desktop)}
                          className={`vb-toggle-sm ${settings.hide_on_desktop ? 'vb-toggle--on' : 'vb-toggle--off'}`}
                        >
                          <div className="vb-toggle-thumb-sm" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className={labelClass}>Business Schedule</label>
                    <div className={`p-2.5 bg-white rounded-lg border border-gray-200 flex items-center justify-between ${settings.businessHours_enabled ? 'border-green-200 bg-green-50' : ''}`}>
                      <span className="text-[10px] font-bold text-gray-700">Show active hours only</span>
                      <button
                        disabled={!settings.is_pro}
                        onClick={() => updateSetting('businessHours_enabled', !settings.businessHours_enabled)}
                        className={`vb-toggle-sm ${settings.businessHours_enabled ? 'vb-toggle--on' : 'vb-toggle--off'}`}
                      >
                        <div className="vb-toggle-thumb-sm" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* RIGHT: Inventory & Logic */}
                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className={labelClass}>Stock & Inventory</label>
                    <div className="grid grid-cols-1 gap-2">
                      <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-gray-200">
                        <span className="text-[10px] font-bold text-gray-700">Hide if Stock &lt;</span>
                        <input
                          type="number"
                          placeholder="0"
                          disabled={!settings.is_pro}
                          value={settings.stock_threshold || ''}
                          onChange={(e) => updateSetting('stock_threshold', e.target.value)}
                          className="w-12 h-6 bg-gray-50 text-[10px] text-center border rounded border-gray-200 font-bold focus:bg-white transition-all outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className={labelClass}>Geo Targeting</label>
                    <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-gray-200">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-gray-700 w-full">
                        <Globe className="w-3.5 h-3.5 text-gray-400" />
                        <input
                          type="text"
                          disabled={!settings.is_pro}
                          value={settings.geo_countries || ''}
                          onChange={(e) => updateSetting('geo_countries', e.target.value)}
                          placeholder="VN, US, UK..."
                          className="flex-1 bg-transparent border-none text-[10px] font-bold outline-none"
                        />
                      </div>
                    </div>
                    <p className="text-[9px] text-gray-400 font-medium italic">* Country codes (VN, US...)</p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Right: Preview (Sticky) */}
          <div className="lg:w-[320px] shrink-0">
            <div className="sticky top-6">
              <div className="vb-preview-header mb-2">
                <h3 className="text-[11px] font-black uppercase text-gray-400 tracking-widest">Live Preview</h3>
                <div className="flex bg-gray-100 p-1 rounded-lg">
                  <button
                    onClick={() => setPreviewMode('mobile')}
                    className={`p-1.5 rounded-md transition-all ${previewMode === 'mobile' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400'}`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setPreviewMode('desktop')}
                    className={`p-1.5 rounded-md transition-all ${previewMode === 'desktop' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400'}`}
                  >
                    <Monitor className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 flex items-center justify-center relative overflow-hidden">
                <PreviewWidget settings={settings} previewMode={previewMode} editChannel="whatsapp" />
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="vb-floating-footer">
          <button onClick={() => handleSave()} disabled={saving} className="vb-footer-save">
            {saving ? <div className="vb-spinner-sm" /> : <Save className="w-4 h-4" />} Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default GlobalSettingsView;
