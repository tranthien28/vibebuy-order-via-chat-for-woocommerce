import React from 'react';
import { Lock, Check, ExternalLink } from 'lucide-react';

const ConfigStep = ({ channel, settings, updateSetting, onNavigate }) => {
  const prefix = `${channel.id}_`;
  const get = (field, fallback = '') => settings[prefix + field] ?? fallback;

  return (
    <div className="space-y-6">
      {/* Webhook URL */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-semibold text-gray-700">
            Discord Webhook URL
          </label>
          <button onClick={() => onNavigate('help')} className="text-[10px] font-bold text-blue-500 hover:underline">Refer to tutorial</button>
        </div>
        <input
          type="text"
          value={get('webhookUrl')}
          onChange={e => updateSetting(`${prefix}webhookUrl`, e.target.value)}
          placeholder="https://discord.com/api/webhooks/..."
          className="vibebuy-input font-mono text-xs"
        />
        <div className="flex items-start gap-2 mt-2 bg-blue-50 p-3 rounded-lg border border-blue-100">
            <div className="text-blue-500 mt-0.5"><ExternalLink className="w-3 h-3" /></div>
            <p className="text-[11px] text-blue-700 leading-relaxed">
                Go to <b>Channel Settings &gt; Integrations &gt; Webhooks</b> in Discord to create a new webhook and copy the URL here.
            </p>
        </div>
      </div>

      {/* Message Template Selection */}
      <div className="pt-2 border-t border-gray-100">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Message Template
        </label>
        <div className="space-y-3">
          <label className="flex items-center gap-3 p-3 rounded-xl border-2 border-green-500 bg-green-50 cursor-pointer">
            <div className="w-4 h-4 rounded-full border-2 border-green-500 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-green-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-green-700">Use Global Template</p>
              <p className="text-[11px] text-green-600/70">Applies the template from the Message Templates menu</p>
            </div>
            <Check className="w-4 h-4 text-green-500" />
          </label>

          <div className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-gray-200 bg-gray-50/50 grayscale opacity-60 cursor-not-allowed">
            <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
            <div className="flex-1">
              <p className="text-sm font-bold text-gray-600">Custom for Discord</p>
              <p className="text-[11px] text-gray-400">Override global template for this channel</p>
            </div>
            <span className="bg-amber-400 text-white text-[9px] font-black px-2 py-0.5 rounded-lg shadow-sm">PRO</span>
          </div>
        </div>
        <p className="text-[11px] text-gray-400 mt-3 italic">
          Go to <span className="font-bold">Message Templates</span> in the sidebar to edit the content.
        </p>
      </div>

    </div>
  );
};

export default ConfigStep;
