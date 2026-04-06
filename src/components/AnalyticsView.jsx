import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, MousePointer2, ShoppingBag, Globe, Share2, ChevronRight, Zap, Lock, MapPin, Clock } from 'lucide-react';

const AnalyticsView = ({ settings }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!settings.is_pro) {
      // Mock data for Lite version
      const clicks = 1240;
      const inquiries = settings.totalConnections || 45;
      const calculatedCR = ((inquiries / clicks) * 100).toFixed(1);

      setData({
        total_clicks: clicks,
        total_views: 4500,
        cr: calculatedCR,
        chart_data: [12, 18, 15, 25, 22, 30, 28],
        top_products: [
          { name: "Premium Coffee Mug", url: "/shop/premium-mug", count: 85 },
          { name: "Stainless Steel Bottle", url: "/shop/bottle", count: 62 },
          { name: "Eco-Friendly Tote Bag", url: "/shop/tote", count: 41 },
        ],
        top_locations: [
          { country: "Vietnam", code: "VN", count: 1250, percentage: 65 },
          { country: "United States", code: "US", count: 410, percentage: 15 },
          { country: "Singapore", code: "SG", count: 220, percentage: 10 },
          { country: "Other", code: "UN", count: 180, percentage: 10 },
        ],
        top_referrers: [
          { referrer: "Google Search", count: 530 },
          { referrer: "Facebook Ads", count: 420 },
          { referrer: "Direct Traffic", count: 290 },
        ],
        hourly_data: [
          { label: 'Morning', count: 120, color: '#3b82f6' },
          { label: 'Afternoon', count: 350, color: '#10b981' },
          { label: 'Evening', count: 580, color: '#f59e0b' },
          { label: 'Night', count: 190, color: '#6366f1' },
        ]
      });
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
  }, [settings.is_pro, settings.totalConnections]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[20px] border border-gray-100 shadow-sm">
      <div className="vb-spinner mb-4" />
      <p className="text-gray-400 font-black uppercase text-[10px] tracking-widest leading-none">Analyzing Data...</p>
    </div>
  );

  if (!data) return null;

  // Simple SVG Line Chart Component
  const MiniTrendChart = ({ points }) => {
    const max = Math.max(...points, 1);
    const width = 100;
    const height = 40;
    const step = width / (points.length - 1);
    const pathData = points.map((p, i) => `${i * step},${height - (p / max) * height}`).join(' L ');
    const areaData = `${pathData} L ${width},${height} L 0,${height} Z`;

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-12 mt-4 opacity-50 transition-opacity">
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={`M ${areaData}`} fill="url(#chartGradient)" />
        <path d={`M ${pathData}`} fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  };

  // Simple SVG Donut Chart
  const DonutChart = ({ points }) => {
    const total = points.reduce((acc, p) => acc + p.count, 0);
    let cumulativePercent = 0;

    const getCoordinatesForPercent = (percent) => {
      const x = Math.cos(2 * Math.PI * percent);
      const y = Math.sin(2 * Math.PI * percent);
      return [x, y];
    };

    return (
      <div className="relative w-32 h-32 transition-transform duration-500">
        <svg viewBox="-1 -1 2 2" className="w-full h-full transform -rotate-90">
          {points.map((p, i) => {
            const startPercent = cumulativePercent;
            const endPercent = cumulativePercent + (p.count / total);
            cumulativePercent = endPercent;

            const [startX, startY] = getCoordinatesForPercent(startPercent);
            const [endX, endY] = getCoordinatesForPercent(endPercent);
            const largeArcFlag = (p.count / total) > 0.5 ? 1 : 0;
            const pathData = [
              `M ${startX} ${startY}`,
              `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`,
              `L 0 0`,
            ].join(' ');

            return <path key={i} d={pathData} fill={p.color} className="transition-opacity" />;
          })}
          <circle cx="0" cy="0" r="0.75" fill="white" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xl font-black text-slate-900 leading-none">46%</span>
          <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Evening</span>
        </div>
      </div>
    );
  };

  const ProBadge = ({ text = "PRO", className = "" }) => (
    <span className={`text-[10px] font-black bg-amber-400 text-white px-2.5 py-1 rounded shadow-sm flex items-center gap-1.5 leading-none uppercase ${className}`}>
      <Lock className="w-3 h-3" /> {text}
    </span>
  );

  return (
    <div className="relative space-y-6">
      
      {/* 1. Header & Controls */}
      <div className="flex justify-between items-end mb-2 px-2">
         <div>
            <h2 className="vb-section-title">Store Analytics</h2>
            <p className="vb-section-subtitle">Detailed insights into customer interactions and conversion performance.</p>
         </div>
         <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-2xl shadow-inner">
            <button className="px-6 py-2 bg-white shadow-md rounded-xl text-[10px] font-black text-gray-900 border border-gray-100 transition-all cursor-default">REALTIME</button>
            <button className="px-6 py-2 text-[10px] font-bold text-gray-400 cursor-default">30 DAYS</button>
         </div>
      </div>

      {/* 2. Primary Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Client Clicks', value: data.total_clicks, icon: <MousePointer2 className="w-5 h-5" />, color: 'bg-blue-500', trend: '+12%', sub: 'Total button interactions' },
          { label: 'Store Views', value: data.total_views, icon: <Zap className="w-5 h-5" />, color: 'bg-amber-500', trend: '+5.4%', sub: 'Website traffic reach' },
          { label: 'Conv. Rate', value: `${data.cr}%`, icon: <TrendingUp className="w-5 h-5" />, color: 'bg-green-500', trend: '+2.1%', sub: '(Inquiries / Clicks) × 100' },
          { label: 'Total Inquiries', value: settings.totalConnections || 0, icon: <ShoppingBag className="w-5 h-5" />, color: 'bg-purple-500', trend: '+8.3%', sub: 'Success leads collected' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-[20px] border border-[#eef0f5] shadow-sm relative overflow-hidden">
            {!settings.is_pro && (
              <div className="absolute top-3 right-3 z-10">
                <ProBadge text="PRO" className="text-[8px] px-2 py-0.5" />
              </div>
            )}
            <div className="flex items-center justify-between mb-4">
               <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center text-white shadow-md ${!settings.is_pro ? 'opacity-50' : ''}`}>
                 {stat.icon}
               </div>
               <div className="text-right">
                  <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${stat.trend.startsWith('+') ? 'bg-green-50 text-green-600' : 'bg-rose-50 text-rose-600'}`}>{stat.trend}</span>
               </div>
            </div>
            <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">{stat.label}</p>
            <div className="flex items-baseline gap-2 mb-1">
               <p className="text-3xl font-black text-gray-900 tracking-tight">{stat.value}</p>
            </div>
            <p className="text-[9px] text-gray-400 font-medium italic">{stat.sub}</p>
            {data.chart_data && <MiniTrendChart points={data.chart_data} />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {/* 3. Traffic Origins */}
         <div className="vb-section-card relative overflow-hidden flex flex-col h-full cursor-default">
            {!settings.is_pro && (
               <div className="absolute inset-0 bg-white/5 z-20 flex items-center justify-center pointer-events-none">
                  <ProBadge text="PRO: Source Discovery" className="shadow-2xl scale-110 -rotate-1" />
               </div>
            )}
            <div className="vb-section-header border-b border-gray-50 flex items-center justify-between">
               <div>
                  <h2 className="vb-section-title">Traffic Origins</h2>
                  <p className="vb-section-subtitle">Realtime analysis of lead acquisition sources.</p>
               </div>
               <Share2 className="w-5 h-5 text-gray-400" />
            </div>
            <div className={`p-4 flex-1 ${!settings.is_pro ? 'opacity-40 grayscale-[0.5]' : ''}`}>
               {data.top_referrers.map((r, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 rounded-xl border border-transparent">
                     <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-[10px] font-black text-gray-400">#{i+1}</div>
                     <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-800 truncate">{r.referrer || 'Direct Traffic'}</p>
                        <p className="text-[9px] text-gray-400 font-black uppercase tracking-tighter">Source Identity</p>
                     </div>
                     <div className="text-right">
                        <p className="text-sm font-black text-blue-600 leading-none mb-1">{r.count}</p>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tight">Leads</p>
                     </div>
                  </div>
               ))}
            </div>
         </div>

         {/* 4. Peak Engagement Hours */}
         <div className="vb-section-card h-full relative overflow-hidden flex flex-col cursor-default">
            {!settings.is_pro && (
               <div className="absolute inset-0 bg-white/5 z-20 flex items-center justify-center pointer-events-none">
                  <ProBadge text="PRO: Activity Heatmap" className="shadow-2xl scale-110 rotate-1" />
               </div>
            )}
            <div className="vb-section-header border-b border-gray-50 flex items-center justify-between">
               <div>
                  <h2 className="vb-section-title">Peak Engagement</h2>
                  <p className="vb-section-subtitle">Hourly distribution of store interactions.</p>
               </div>
               <Clock className="w-5 h-5 text-purple-500" />
            </div>
            <div className={`p-8 flex items-center gap-12 flex-1 justify-center ${!settings.is_pro ? 'opacity-40 grayscale-[0.5]' : ''}`}>
               <DonutChart points={data.hourly_data} />
               <div className="flex-1 grid grid-cols-2 gap-x-8 gap-y-4 max-w-[200px]">
                  {data.hourly_data.map((h, i) => (
                     <div key={i} className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: h.color }} />
                        <div className="min-w-0">
                           <p className="text-[9px] font-black text-slate-400 uppercase leading-none mb-1 truncate">{h.label}</p>
                           <p className="text-sm font-bold text-slate-900 leading-none">{h.count}</p>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 5. Most Popular Products */}
        <div className="lg:col-span-2 vb-section-card relative overflow-hidden cursor-default">
          {!settings.is_pro && (
            <div className="absolute inset-0 bg-white/5 z-20 flex items-center justify-center pointer-events-none">
               <ProBadge text="Product Popularity PRO" className="shadow-2xl scale-100" />
            </div>
          )}
          <div className="vb-section-header border-b border-gray-50 flex items-center justify-between">
            <div>
              <h2 className="vb-section-title">Product Interaction Rankings</h2>
              <p className="vb-section-subtitle">Catalog items generating the highest inquiry volume.</p>
            </div>
            <BarChart3 className="w-5 h-5 text-indigo-500" />
          </div>
          <div className={`p-4 space-y-1 ${!settings.is_pro ? 'opacity-40' : ''}`}>
            {data.top_products.map((p, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-xl border border-transparent truncate">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-[10px] font-black text-gray-400">#{i+1}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-slate-800 truncate leading-none mb-1">{p.name}</p>
                  <p className="text-[10px] text-slate-400 font-bold truncate tracking-tight">{p.url}</p>
                </div>
                <div className="text-right">
                  <p className="text-base font-black text-slate-900 leading-none mb-0.5">{p.count}</p>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Interactions</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 6. Smart Recommendation */}
        <div className="lg:col-span-1 p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-[20px] border border-amber-100 flex flex-col gap-6 relative overflow-hidden shadow-sm">
            {!settings.is_pro && (
               <div className="absolute top-4 right-4">
                  <ProBadge text="PRO" className="text-[8px] px-2 py-0.5" />
               </div>
            )}
            <div className={`w-16 h-16 rounded-[20px] bg-amber-400 flex items-center justify-center text-white shrink-0 shadow-lg shadow-amber-200/50 ${!settings.is_pro ? 'opacity-50' : ''}`}>
               <TrendingUp className="w-8 h-8" />
            </div>
            <div className={!settings.is_pro ? 'opacity-60' : ''}>
               <div className="flex items-center gap-2 mb-3">
                 <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                 <h4 className="text-lg font-black text-amber-900 leading-none">Smart Insight</h4>
               </div>
               <p className="text-sm text-amber-800 font-bold leading-relaxed mb-4">
                  Engagement peaks between <strong className="text-amber-900 px-1 bg-white rounded">8 PM - 11 PM</strong>. 
                  <br/><br/>
                  Enable <strong className="underline decoration-amber-400">Business Hours</strong> to route evening inquiries and boost satisfaction.
               </p>
            </div>
            <button 
              onClick={() => !settings.is_pro && window.open('https://vibebuy.com', '_blank')}
              className="mt-auto h-12 bg-amber-900 text-white text-[11px] font-black uppercase rounded-xl hover:bg-black transition-all flex items-center justify-center gap-2 tracking-widest cursor-pointer"
            >
               ACTIVATE PRO <ChevronRight className="w-4 h-4" />
            </button>
         </div>
      </div>

      {/* 7. Global Reach */}
      <div className="vb-section-card relative overflow-hidden cursor-default">
        {!settings.is_pro && (
          <div className="absolute inset-0 bg-white/5 z-20 flex items-center justify-center pointer-events-none">
             <ProBadge text="Advanced Geolocation Locked" className="shadow-2xl animate-bounce px-6 py-3 rounded-full" />
          </div>
        )}
        <div className="vb-section-header border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
          <div>
            <h2 className="vb-section-title">Customer Distribution Map</h2>
            <p className="vb-section-subtitle">Detailed geographical breakdown of current lead acquisition.</p>
          </div>
          <Globe className="w-6 h-6 text-blue-500 animate-spin-slow" />
        </div>
        <div className={`p-8 ${!settings.is_pro ? 'opacity-30 grayscale-[0.8]' : ''}`}>
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-center">
              <div className="lg:col-span-1 space-y-5">
                 <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Top Performing Regions</h5>
                 {data.top_locations.map((loc, i) => (
                    <div key={i} className="space-y-2">
                       <div className="flex justify-between text-xs font-black text-slate-800">
                          <div className="flex items-center gap-2">
                             <span className="w-7 h-5 bg-slate-100 rounded flex items-center justify-center overflow-hidden border border-slate-200">
                                <span className="text-[9px] font-black">{loc.code}</span>
                             </span>
                             <span className="text-sm">{loc.country}</span>
                          </div>
                          <span className="text-blue-600">{loc.percentage}%</span>
                       </div>
                       <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${i === 0 ? 'bg-gradient-to-r from-blue-600 to-indigo-600' : 'bg-slate-300'} rounded-full transition-all duration-[1500ms] ease-out`} 
                            style={{ width: `${loc.percentage}%` }} 
                          />
                       </div>
                    </div>
                 ))}
              </div>
              <div className="lg:col-span-2 relative">
                 <div className="w-full h-72 bg-slate-50 rounded-[20px] border border-slate-100 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5" />
                    <MapPin className="w-14 h-14 text-blue-300 animate-bounce relative z-10" />
                    <div className="absolute top-1/2 left-1/4 w-3 h-3 bg-blue-500 rounded-full animate-ping opacity-75" />
                    <div className="absolute top-1/3 left-2/3 w-2.5 h-2.5 bg-indigo-500 rounded-full animate-ping opacity-75 delay-300" />
                    <div className="absolute top-2/3 left-1/2 w-4 h-4 bg-purple-500 rounded-full animate-ping opacity-75 delay-700" />
                    
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl shadow-md border border-white/50 z-20">
                       <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest leading-none flex items-center gap-2">
                          <Globe className="w-3 h-3 text-blue-500" /> PRO Interactive Visualization Active
                       </p>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsView;
