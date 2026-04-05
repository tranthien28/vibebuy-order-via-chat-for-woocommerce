import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, MousePointer2, ShoppingBag, Globe, Share2, ChevronRight, Zap } from 'lucide-react';

const AnalyticsView = ({ settings }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!settings.is_pro) {
      setLoading(false);
      return;
    }
    const payload = window.vibebuyData || {};
    fetch(`${payload.apiUrl}analytics`, {
      headers: { 'X-WP-Nonce': payload.nonce }
    })
      .then(r => r.json())
      .then(res => {
        setData(res);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [settings.is_pro]);

  if (!settings.is_pro) {
    return (
      <div className="relative overflow-hidden rounded-[40px] border border-gray-100 bg-white shadow-sm animate-in fade-in zoom-in-95 duration-700">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-white to-purple-50/30 opacity-70" />
        
        <div className="relative p-12 text-center flex flex-col items-center">
          <div className="w-24 h-24 rounded-[40px] bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-2xl shadow-amber-200 mb-8 animate-bounce transition-transform">
             <span className="text-[9px] font-black bg-amber-400 text-white px-1.5 py-0.5 rounded shadow-sm">PRO</span>
          </div>
          
          <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-none mb-4">
            Powerful Analytics <br/> <span className="text-blue-600">Locked</span>
          </h2>
          
          <p className="max-w-md text-slate-500 font-medium text-lg leading-relaxed mb-10">
            Gain deep insights into your customer behavior. Track every click, view, and conversion to optimize your sales funnel.
          </p>
          
          <div className="grid grid-cols-2 gap-4 w-full max-w-xl mb-12 opacity-60 pointer-events-none grayscale">
             <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex items-center gap-4">
                <BarChart3 className="w-8 h-8 text-blue-500" />
                <div className="text-left">
                   <p className="text-[10px] font-black text-slate-400 uppercase">Conversion Rate</p>
                   <div className="h-6 w-16 bg-slate-200 rounded-lg animate-pulse" />
                </div>
             </div>
             <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex items-center gap-4">
                <TrendingUp className="w-8 h-8 text-green-500" />
                <div className="text-left">
                   <p className="text-[10px] font-black text-slate-400 uppercase">Growth</p>
                   <div className="h-6 w-20 bg-slate-200 rounded-lg animate-pulse" />
                </div>
             </div>
          </div>

          <button className="h-16 px-10 bg-slate-900 text-white rounded-3xl font-black text-lg shadow-xl shadow-slate-200 hover:scale-105 transition-all flex items-center gap-3 active:scale-95 group">
             Upgrade to VibeBuy Pro <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <p className="mt-8 text-[11px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
             <Zap className="w-3 h-3 fill-current" /> Unlock Real-Time Insights Today
          </p>
        </div>
      </div>
    );
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm animate-pulse">
      <div className="vb-spinner mb-4" />
      <p className="text-gray-400 font-medium">Crunching your numbers...</p>
    </div>
  );

  if (!data) return null;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* 1. Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Clicks', value: data.total_clicks, icon: <MousePointer2 className="w-5 h-5" />, color: 'bg-blue-500' },
          { label: 'Widget Views', value: data.total_views, icon: <Zap className="w-5 h-5" />, color: 'bg-amber-500' },
          { label: 'Conv. Rate', value: `${data.cr}%`, icon: <TrendingUp className="w-5 h-5" />, color: 'bg-green-500' },
          { label: 'Inquiries', value: settings.totalConnections || 0, icon: <ShoppingBag className="w-5 h-5" />, color: 'bg-purple-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
            <div className={`w-10 h-10 rounded-2xl ${stat.color} flex items-center justify-center text-white mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
              {stat.icon}
            </div>
            <p className="text-[11px] font-black uppercase text-gray-400 tracking-wider mb-1">{stat.label}</p>
            <p className="text-3xl font-black text-gray-900 leading-none tracking-tight">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 2. Top Products */}
        <div className="vb-section-card h-full">
          <div className="vb-section-header border-b border-gray-50 flex items-center justify-between">
            <div>
              <h2 className="vb-section-title">Most Popular Products</h2>
              <p className="vb-section-subtitle">Items capturing the most customer interest.</p>
            </div>
            <span className="text-[9px] font-black bg-amber-400 text-white px-1.5 py-0.5 rounded shadow-sm">PRO</span>
          </div>
          <div className="p-4 space-y-2">
            {data.top_products.length > 0 ? data.top_products.map((p, i) => (
              <div key={i} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-2xl transition-all group border border-transparent hover:border-gray-100">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-black text-gray-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">#{i+1}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-800 truncate">{p.name}</p>
                  <p className="text-[10px] text-gray-400 truncate">{p.url}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-gray-900">{p.count}</p>
                  <p className="text-[9px] font-bold text-gray-400 uppercase">Interactions</p>
                </div>
              </div>
            )) : (
                <div className="py-10 text-center text-gray-400 text-sm italic">No data collected yet.</div>
            )}
          </div>
        </div>

        {/* 3. Top Referrers */}
        <div className="vb-section-card h-full">
          <div className="vb-section-header border-b border-gray-50 flex items-center justify-between">
            <div>
              <h2 className="vb-section-title">Best Referrers</h2>
              <p className="vb-section-subtitle">Where your customers are coming from.</p>
            </div>
            <Share2 className="w-5 h-5 text-blue-500" />
          </div>
          <div className="p-4 space-y-2">
            {data.top_referrers.length > 0 ? data.top_referrers.map((r, i) => (
              <div key={i} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-2xl transition-all border border-transparent hover:border-gray-100">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-black text-gray-400">#{i+1}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-800 truncate">{r.referrer || 'Direct / Unknown'}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-gray-900">{r.count}</p>
                  <p className="text-[9px] font-bold text-gray-400 uppercase">Visits</p>
                </div>
              </div>
            )) : (
                <div className="py-10 text-center text-gray-400 text-sm italic">No data collected yet.</div>
            )}
          </div>
        </div>
      </div>
      
      <div className="p-6 bg-amber-50 rounded-[40px] border border-amber-100 flex items-center gap-6">
        <div className="w-16 h-16 rounded-3xl bg-amber-400 flex items-center justify-center text-white shrink-0 shadow-lg shadow-amber-200">
           <Zap className="w-8 h-8 fill-current" />
        </div>
        <div>
           <h4 className="text-lg font-black text-amber-900 leading-tight">Pro Insight</h4>
           <p className="text-sm text-amber-700/80 font-medium">Your customers are most active between <strong>8 PM - 11 PM</strong>. Consider enabling <strong>Business Hours</strong> targeting to ensure agents are available during peak times.</p>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsView;
