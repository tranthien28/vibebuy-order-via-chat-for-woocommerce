import React from 'react';
import { Check, Zap, BarChart3, MousePointer2, Sparkles } from 'lucide-react';

const BENEFITS = [
  { 
    icon: <Sparkles className="w-4 h-4 text-amber-500" />, 
    title: '11+ Premium Channels', 
    desc: 'Unlock Zalo, Messenger, TikTok, Instagram, and more.' 
  },
  { 
    icon: <BarChart3 className="w-4 h-4 text-blue-500" />, 
    title: 'Advanced Analytics', 
    desc: 'Track every click, view, and conversion rate.' 
  },
  { 
    icon: <MousePointer2 className="w-4 h-4 text-purple-500" />, 
    title: 'Export & Order Tools', 
    desc: 'Export leads to CSV and create WooCommerce orders.' 
  },
  { 
    icon: <Sparkles className="w-4 h-4 text-pink-500" />, 
    title: 'Pro Customization', 
    desc: 'Custom icons, premium themes, and no branding.' 
  },
  { 
    icon: <Zap className="w-4 h-4 text-green-500" />, 
    title: 'Priority Support', 
    desc: '24/7 dedicated assistance with < 2h response.' 
  },
];

const BenefitList = () => {
  return (
    <div className="vb-benefit-list">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-5 h-5 text-amber-500 fill-amber-500" />
        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Pro Features</h3>
      </div>
      
      <div className="space-y-2">
        {BENEFITS.map((b, i) => (
          <div key={i} className="vb-benefit-item group">
            <div className="vb-benefit-icon-wrap">
              {b.icon}
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-gray-700 group-hover:text-purple-600 transition-colors">
                {b.title}
              </p>
              <p className="text-[10px] text-gray-400">
                {b.desc}
              </p>
            </div>
            <div className="vb-benefit-check">
              <Check className="w-3 h-3 text-green-500" strokeWidth={3} />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-purple-50 rounded-xl border border-purple-100">
        <p className="text-[10px] text-purple-600 font-medium leading-tight">
          Unlock the full potential of your store with VibeBuy Pro.
        </p>
      </div>
    </div>
  );
};

export default BenefitList;
