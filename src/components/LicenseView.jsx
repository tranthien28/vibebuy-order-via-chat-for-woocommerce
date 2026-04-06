import React, { useState } from 'react';
import { Shield, Key, CheckCircle2, AlertCircle, Loader2, Sparkles } from 'lucide-react';

const LicenseView = ({ settings, onUpdateSettings, onToast }) => {
  const [key, setKey] = useState(settings.license_key || '');
  const [activating, setActivating] = useState(false);
  const isPro = settings.is_pro || false;

  const handleActivate = async () => {
    if (!key) return;
    setActivating(true);

    try {
      const response = await fetch(`${window.vibebuyData.apiUrl}activate-license`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': window.vibebuyData.nonce
        },
        body: JSON.stringify({ license_key: key })
      });

      const data = await response.json();

      if (data.success) {
        onUpdateSettings({ ...settings, is_pro: true, license_key: key });
        onToast('Success!', 'Your VibeBuy PRO license is now active.', 'success');
      } else {
        onToast('Activation Failed', data.message || 'Invalid license key.', 'error');
      }
    } catch (err) {
      onToast('Error', 'Connection failed. Please try again.', 'error');
    } finally {
      setActivating(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="max-w-2xl">
        {isPro ? (
          <div className="vb-section-card p-10 text-center relative overflow-hidden border-green-100 bg-gradient-to-b from-white to-green-50/30">
             <div className="relative z-10">
               <div className="w-20 h-20 bg-green-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-200 animate-bounce-slow">
                  <CheckCircle2 className="w-10 h-10 text-white" />
               </div>
               <h2 className="text-2xl font-black text-gray-900 mb-2">License is Active!</h2>
               <p className="text-sm text-gray-500 mb-8 px-6 font-medium leading-relaxed">
                 You have successfully unlocked all <strong>VibeBuy PRO</strong> features. Enjoy unlimited channels, premium FX, and advanced analytics on your store.
               </p>
               <div className="inline-flex items-center gap-4 px-6 py-3 bg-white border border-green-100 rounded-2xl shadow-sm">
                  <Key className="w-5 h-5 text-green-500" />
                  <span className="text-base font-mono font-bold text-gray-700 tracking-wider">•••• •••• •••• {key.slice(-4)}</span>
               </div>
             </div>
             
             {/* Decorative Elements */}
             <div className="absolute -top-10 -right-10 w-40 h-40 bg-green-100/20 rounded-full blur-3xl" />
             <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-100/20 rounded-full blur-3xl" />
          </div>
        ) : (
          <div className="vb-section-card p-0 relative overflow-hidden">
              <div className="vb-section-header border-b border-gray-50 flex items-center gap-4">
                 <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-inner">
                    <Shield className="w-6 h-6" />
                 </div>
                 <div>
                    <h3 className="vb-section-title">Activate VibeBuy PRO</h3>
                    <p className="vb-section-subtitle">Enter your license key from Lemon Squeezy to unlock premium features.</p>
                 </div>
              </div>

              <div className="p-8 space-y-6">
                 <div className="space-y-3">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Your License Key</label>
                    <div className="relative group">
                      <input 
                        type="text"
                        value={key}
                        onChange={(e) => setKey(e.target.value)}
                        placeholder="XXXX-XXXX-XXXX-XXXX"
                        className="w-full px-6 py-5 bg-gray-50 border border-gray-100 rounded-2xl text-xl font-mono focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white outline-none transition-all shadow-inner"
                      />
                      <div className="absolute right-5 top-1/2 -translate-y-1/2">
                         <Key className="w-6 h-6 text-gray-300 group-focus-within:text-indigo-500 transition-colors" />
                      </div>
                    </div>
                 </div>

                 <button 
                   disabled={activating || !key}
                   onClick={handleActivate}
                   className="w-full py-5 bg-gray-900 hover:bg-black disabled:bg-gray-200 text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-xl shadow-gray-200 hover:shadow-gray-300 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-3"
                 >
                   {activating ? (
                     <Loader2 className="w-5 h-5 animate-spin" />
                   ) : (
                     <Sparkles className="w-5 h-5 text-amber-400" />
                   )}
                   {activating ? 'Validating Key...' : 'Activate Pro Now'}
                 </button>

                 <div className="pt-2 flex items-center gap-3 justify-center">
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                    <p className="text-[11px] text-gray-500 font-bold uppercase tracking-tight">
                      Don't have a key? <a href="https://vibebuy.io/pro" target="_blank" className="text-indigo-600 font-black hover:underline underline-offset-4">Get Pro Access</a>
                    </p>
                 </div>
              </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LicenseView;
