import React from 'react';
import { Lock, Check, Send, AlertCircle, RefreshCw } from 'lucide-react';
import MessageTemplateEditor from '../../components/MessageTemplateEditor.jsx';

const ConfigStep = ({ channel, settings, updateSetting, onNavigate }) => {
  const [testing, setTesting] = React.useState(false);
  const [testResult, setTestResult] = React.useState(null);
  
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

  const handleSendTest = async () => {
    if (testing) return;
    setTesting(true);
    setTestResult(null);

    try {
      const response = await fetch(`${window.vibebuyData.apiUrl}test-notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': window.vibebuyData.nonce
        },
        body: JSON.stringify({ channel_id: channel.id })
      });
      const data = await response.json();
      setTestResult({
        success: data.success,
        message: data.message || (data.success ? 'Success!' : 'Failed to send test.')
      });
    } catch (error) {
      setTestResult({ success: false, message: 'Network error or restriction.' });
    } finally {
      setTesting(false);
    }
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

      {/* Bot Username */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Bot Username
        </label>
        <div className="flex gap-2">
          <div className="flex items-center px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-500 font-medium shrink-0">
            @
          </div>
          <input
            type="text"
            value={get('botUsername')}
            onChange={e => updateSetting(`${prefix}botUsername`, e.target.value.replace('@', ''))}
            placeholder="mybotname"
            className="vibebuy-input flex-1"
          />
        </div>
        <p className="text-xs text-gray-400 mt-1.5">
          Username from <a href="https://t.me/BotFather" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">@BotFather</a>
        </p>
      </div>

      {/* Bot Token */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Bot Token
          <span className="ml-1 text-gray-400 font-normal text-xs">(Optional)</span>
        </label>
        <input
          type="password"
          value={get('botToken')}
          onChange={e => updateSetting(`${prefix}botToken`, e.target.value)}
          placeholder="123456:ABC-DEF..."
          className="vibebuy-input font-mono text-xs"
        />
        <p className="text-xs text-gray-400 mt-1.5">Required for order notifications.</p>
      </div>

      {/* Chat ID */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Chat ID
          <span className="ml-1 text-gray-400 font-normal text-xs">(Required for Bot)</span>
        </label>
        <input
          type="text"
          value={get('chatId')}
          onChange={e => updateSetting(`${prefix}chatId`, e.target.value)}
          placeholder="123456789"
          className="vibebuy-input font-mono text-xs"
        />
        <p className="text-xs text-gray-400 mt-1.5">
          Get your ID from <a href="https://t.me/userinfobot" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">@userinfobot</a>
        </p>

        {/* Send Test Button */}
        <div className="mt-4">
          <button
            type="button"
            onClick={handleSendTest}
            disabled={testing || !get('botToken') || !get('chatId')}
            className={`w-full h-11 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-all border-2 ${
              testing ? 'bg-gray-50 border-gray-100 text-gray-400 cursor-not-allowed' : 
              testResult?.success ? 'bg-green-50 border-green-200 text-green-600' :
              testResult?.success === false ? 'bg-red-50 border-red-200 text-red-600' :
              'bg-blue-600 border-blue-600 text-white hover:brightness-110 active:scale-[0.98]'
            }`}
          >
            {testing ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : testResult?.success ? (
              <Check className="w-4 h-4" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            {testing ? 'Sending Test...' : testResult?.success ? 'Test Sent Successfully' : 'Send Test Notification'}
          </button>
          {testResult && !testResult.success && (
            <div className="mt-2 p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2 animate-in slide-in-from-top-1">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-[11px] text-red-600 leading-tight font-medium">{testResult.message}</p>
            </div>
          )}
        </div>
      </div>

      {/* Message Template Selection */}
      <div className="pt-2 border-t border-gray-100">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Message Template
        </label>
        <div className="space-y-3">
          <label 
            onClick={() => updateSetting(`${prefix}template_mode`, 'global')}
            className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer ${get('template_mode', 'global') === 'global' ? 'border-green-500 bg-green-50' : 'border-gray-100 bg-white opacity-60'}`}
          >
            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${get('template_mode', 'global') === 'global' ? 'border-green-500' : 'border-gray-300'}`}>
              {get('template_mode', 'global') === 'global' && <div className="w-2 h-2 rounded-full bg-green-500" />}
            </div>
            <div className="flex-1">
              <p className={`text-sm font-bold ${get('template_mode', 'global') === 'global' ? 'text-green-700' : 'text-gray-500'}`}>Use Global Template</p>
              <p className="text-[11px] text-gray-400">Applies the template from main settings</p>
            </div>
            {get('template_mode', 'global') === 'global' && <Check className="w-4 h-4 text-green-500" />}
          </label>

          <div 
            onClick={() => settings.is_pro && updateSetting(`${prefix}template_mode`, 'custom')}
            className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${!settings.is_pro ? 'border-dashed border-gray-200 bg-gray-50/50 grayscale opacity-60 cursor-not-allowed' : 'cursor-pointer'} ${get('template_mode') === 'custom' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-100 bg-white opacity-60'}`}
          >
            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${get('template_mode') === 'custom' ? 'border-indigo-500' : 'border-gray-300'}`}>
              {get('template_mode') === 'custom' && <div className="w-2 h-2 rounded-full bg-indigo-500" />}
            </div>
            <div className="flex-1">
              <p className={`text-sm font-bold ${get('template_mode') === 'custom' ? 'text-indigo-700' : 'text-gray-500'}`}>Custom for Telegram</p>
              <p className="text-[11px] text-gray-400">Override global template for this channel</p>
            </div>
            {!settings.is_pro ? (
              <span className="bg-amber-400 text-white text-[9px] font-black px-2 py-0.5 rounded-lg shadow-sm">PRO</span>
            ) : (
              get('template_mode') === 'custom' && <Check className="w-4 h-4 text-indigo-500" />
            )}
          </div>
        </div>

        {settings.is_pro && get('template_mode') === 'custom' && (
          <div className="mt-4 p-4 bg-indigo-50/30 border border-indigo-100 rounded-2xl animate-in slide-in-from-top-2">
             <MessageTemplateEditor 
                value={get('message_template')}
                onChange={val => updateSetting(`${prefix}message_template`, val)}
                placeholder="Hi! I want to order {{product_name}} via Telegram..."
             />
          </div>
        )}

        <p className="text-[11px] text-gray-400 mt-3 italic">
          Go to <span className="font-bold">Message Templates</span> in the sidebar to edit the global content.
        </p>
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
