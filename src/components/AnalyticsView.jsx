import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, MousePointer2, ShoppingBag, Globe, Share2, ChevronRight, Zap, Lock, MapPin, Clock } from 'lucide-react';

const AnalyticsView = ({ settings }) => {
  const isLite = !settings.is_pro;

  const decodeHTMLEntities = (text) => {
    const textArea = document.createElement('textarea');
    textArea.innerHTML = text;
    return textArea.value;
  };

  // Coordinate mapping for top countries (Percentage-based x, y on 1000x500 map)
  const countryCoords = {
    'VN': { x: 770, y: 260 },
    'US': { x: 180, y: 190 },
    'GB': { x: 480, y: 130 },
    'FR': { x: 490, y: 150 },
    'DE': { x: 510, y: 140 },
    'JP': { x: 860, y: 180 },
    'KR': { x: 840, y: 190 },
    'SG': { x: 780, y: 340 },
    'TH': { x: 760, y: 280 },
    'CN': { x: 780, y: 210 },
    'IN': { x: 710, y: 250 },
    'AU': { x: 860, y: 400 },
    'BR': { x: 330, y: 350 },
    'CA': { x: 180, y: 110 },
  };

  const MOCK_DATA = {
    total_clicks: 1248,
    total_views: 8540,
    cr: 14.6,
    active_channels_count: settings.activeChannels?.length || 1,
    trends: {
      clicks: '+12.5%',
      views: '+8.2%',
      cr: '+2.1%',
      channels: '+0%',
      inquiries: '+5.4%'
    },
    chart_data: [12, 18, 15, 25, 22, 30, 28],
    top_products: [
      { name: 'Ultra-Comfort Mesh Sneakers', url: '/shop/sneakers', count: 452 },
      { name: 'Classic Leather Messenger Bag', url: '/shop/bag', count: 321 },
      { name: 'Minimalist Quartz Watch', url: '/shop/watch', count: 215 },
    ],
    top_locations: [
      { country: 'United States', code: 'US', count: 450, percentage: 45 },
      { country: 'United Kingdom', code: 'GB', count: 250, percentage: 25 },
      { country: 'Vietnam', code: 'VN', count: 150, percentage: 15 },
      { country: 'Singapore', code: 'SG', count: 100, percentage: 10 },
      { country: 'Germany', code: 'DE', count: 50, percentage: 5 },
    ],
    top_referrers: [
      { referrer: "Google Search", count: 530 },
      { referrer: "Facebook Ads", count: 420 },
      { referrer: "Direct Traffic", count: 290 },
    ],
    hourly_data: [
      { label: 'Morning', count: 120, color: '#3b82f6' },
      { label: 'Afternoon', count: 350, color: '#2563eb' },
      { label: 'Evening', count: 580, color: '#1d4ed8' },
      { label: 'Night', count: 190, color: '#1e3a8a' },
    ]
  };

  const [data, setData] = useState(isLite ? MOCK_DATA : null);
  const [loading, setLoading] = useState(!isLite);

  const fetchData = async () => {
    if (isLite) {
      setLoading(true);
      await new Promise(r => setTimeout(r, 600));
      setData(MOCK_DATA);
      setLoading(false);
      return;
    }

    const payload = window.vibebuyData || {};
    fetch(`${payload.apiUrl}analytics`, {
      headers: { 'X-WP-Nonce': payload.nonce }
    })
      .then(r => r.json())
      .then(res => {
        if (res.hourly_raw) {
          const segments = [
            { label: 'Morning', count: 0, hours: [5, 6, 7, 8, 9, 10, 11], color: '#3b82f6' },
            { label: 'Afternoon', count: 0, hours: [12, 13, 14, 15, 16, 17], color: '#2563eb' },
            { label: 'Evening', count: 0, hours: [18, 19, 20, 21, 22, 23], color: '#1d4ed8' },
            { label: 'Night', count: 0, hours: [0, 1, 2, 3, 4], color: '#1e3a8a' },
          ];
          res.hourly_raw.forEach(h => {
             const hr = parseInt(h.hr);
             const segment = segments.find(s => s.hours.includes(hr));
             if (segment) segment.count += parseInt(h.count);
          });
          res.hourly_data = segments.map(({ label, count, color }) => ({ label, count, color }));
        }
        setData(res);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, [settings.is_pro]);

  if (loading && !data) return (
    <div className="flex flex-col items-center justify-center py-20 vb-section-card">
      <div className="vb-spinner mb-4" />
      <p className="vb-section-subtitle text-center">Analyzing Data...</p>
    </div>
  );

  if (!data) return null;

  const MiniTrendChart = ({ points }) => {
    if (!points || points.length === 0) return null;
    const max = Math.max(...points, 1);
    const width = 100;
    const height = 40;
    const step = width / (points.length - 1);
    const pathData = points.map((p, i) => `${i * step},${height - (p / max) * height}`).join(' L ');
    const areaData = `${pathData} L ${width},${height} L 0,${height} Z`;

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-12 mt-4 opacity-100 transition-opacity" preserveAspectRatio="none">
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={`M ${areaData}`} fill="url(#chartGradient)" />
        <path d={`M ${pathData}`} fill="none" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  };

  const DonutChart = ({ points }) => {
    const total = (points || []).reduce((acc, p) => acc + (p.count || 0), 0);
    return (
      <div className="relative w-32 h-32 transition-transform duration-500 hover:scale-110">
        <svg viewBox="-1.1 -1.1 2.2 2.2" className="w-full h-full transform -rotate-90">
          {total === 0 ? (
            <circle cx="0" cy="0" r="1.0" fill="none" stroke="#f1f5f9" strokeWidth="0.25" />
          ) : (
            <>
              {(() => {
                let cumulativePercent = 0;
                const getCoordinatesForPercent = (percent) => {
                  const x = Math.cos(2 * Math.PI * percent);
                  const y = Math.sin(2 * Math.PI * percent);
                  return [x, y];
                };
                return points.map((p, i) => {
                  const count = p.count || 0;
                  if (count === 0) return null;
                  
                  if (count === total) {
                    return <circle key={i} cx="0" cy="0" r="1.0" fill={p.color} className="transition-all duration-300 hover:opacity-80" />;
                  }

                  const startPercent = cumulativePercent;
                  const endPercent = cumulativePercent + (count / total);
                  cumulativePercent = endPercent;
                  const [startX, startY] = getCoordinatesForPercent(startPercent);
                  const [endX, endY] = getCoordinatesForPercent(endPercent);
                  const largeArcFlag = (count / total) > 0.5 ? 1 : 0;
                  const pathData = [
                    `M ${startX} ${startY}`,
                    `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`,
                    `L 0 0`,
                  ].join(' ');
                  return <path key={i} d={pathData} fill={p.color} className="transition-all duration-300 hover:opacity-80" />;
                });
              })()}
            </>
          )}
          <circle cx="0" cy="0" r="0.75" fill="white" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xl font-black text-slate-900 leading-none">
            {total > 0 ? Math.round(Math.max(...points.map(p => p.count || 0)) / total * 100) : 0}%
          </span>
          <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Peak</span>
        </div>
      </div>
    );
  };

  const ProBadge = ({ text = "PRO", className = "" }) => (
    <span className={`text-[9px] font-black bg-amber-400 text-white px-2 py-0.5 rounded shadow-sm flex items-center gap-1 leading-none uppercase ${className}`}>
      <Lock className="w-2.5 h-2.5" /> {text}
    </span>
  );

  const CHECKOUT_URL = window.vibebuyData?.proLink || '#';

  return (
    <div className="relative space-y-6">
      <div className="flex justify-between items-end mb-2 px-2">
         <div>
            <h2 className="vb-page-title">Store Analytics</h2>
            <p className="vb-section-subtitle">
              {settings.is_pro 
                ? 'Detailed insights into customer interactions and conversion performance.' 
                : 'Previewing professional analytics dashboard with sample data.'}
            </p>
         </div>
         <div className="flex items-center gap-4">
           {!settings.is_pro && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-100 rounded-full animate-pulse">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span className="text-[9px] font-black text-amber-700 uppercase tracking-widest">PRO DEMO MODE</span>
              </div>
           )}
           <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-2xl shadow-inner border border-gray-200">
            <button className="px-6 py-2 bg-white shadow-md rounded-xl text-[10px] font-black text-gray-900 border border-gray-100 transition-all cursor-default uppercase">REALTIME</button>
            <button className="px-6 py-2 text-[10px] font-bold text-gray-400 cursor-default uppercase">30 DAYS</button>
          </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Channels', value: data.active_channels_count || 0, icon: <Zap className="w-5 h-5" />, color: 'bg-blue-400', trend: data.trends?.channels || '+0%', sub: 'Total messaging endpoints', gated: false },
          { label: 'Total Inquiries', value: settings.totalConnections || 0, icon: <ShoppingBag className="w-5 h-5" />, color: 'bg-blue-500', trend: data.trends?.inquiries || '+0%', sub: 'Success leads collected', gated: false },
          { label: 'Total Clicks', value: data.total_clicks || 0, icon: <MousePointer2 className="w-5 h-5" />, color: 'bg-blue-600', trend: data.trends?.clicks || '+0%', sub: 'Total button interactions', gated: true },
          { label: 'Conv. Rate', value: `${data.cr || 0}%`, icon: <TrendingUp className="w-5 h-5" />, color: 'bg-blue-700', trend: data.trends?.cr || '+0%', sub: '(Inquiries / Clicks) × 100', gated: true },
        ].map((stat, i) => (
          <div key={i} className="vb-section-card p-5 relative overflow-hidden group">
            {!settings.is_pro && stat.gated && (
              <div className="absolute top-3 right-3 z-10">
                <ProBadge />
              </div>
            )}
            <div className="flex items-center justify-between mb-4">
               <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center text-white shadow-md transition-transform group-hover:scale-110 duration-300 ${!settings.is_pro && stat.gated ? 'opacity-40 grayscale-[0.5]' : ''}`}>
                 {stat.icon}
               </div>
               <div className="text-right">
                  <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${stat.trend.startsWith('+') ? 'bg-green-50 text-green-600' : 'bg-rose-50 text-rose-600'}`}>{stat.trend}</span>
               </div>
            </div>
            <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">{stat.label}</p>
            <div className="flex items-baseline gap-2 mb-1">
               <p className={`text-3xl font-black text-gray-900 tracking-tight ${!settings.is_pro && stat.gated ? 'blur-[3px] opacity-40' : ''}`}>{stat.value}</p>
            </div>
            <p className="text-[9px] text-gray-400 font-medium italic">{stat.sub}</p>
            {data.chart_data && <MiniTrendChart points={data.chart_data} />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <div className="vb-section-card relative overflow-hidden flex flex-col h-full cursor-default">
            {!settings.is_pro && (
              <div className="absolute top-4 right-4 z-20">
                <ProBadge />
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
               {(!data.top_referrers || data.top_referrers.length === 0) ? (
                 <div className="p-10 text-center flex flex-col items-center justify-center opacity-40 italic">
                   <Globe className="w-10 h-10 text-gray-200 mb-2" />
                   <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No data available</p>
                 </div>
               ) : (
                 data.top_referrers.map((r, i) => (
                    <div key={i} className="flex items-center gap-4 p-3 rounded-xl border border-transparent">
                       <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-[10px] font-black text-gray-400">#{i+1}</div>
                       <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-800 truncate">{r.referrer || 'Direct Traffic'}</p>
                       </div>
                       <div className="text-right">
                          <p className="text-sm font-black text-blue-600 leading-none mb-1">{r.count}</p>
                          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tight">Leads</p>
                       </div>
                    </div>
                 ))
               )}
            </div>
         </div>

         <div className="vb-section-card h-full relative overflow-hidden flex flex-col cursor-default">
            {!settings.is_pro && (
              <div className="absolute top-4 right-4 z-20">
                <ProBadge />
              </div>
            )}
            <div className="vb-section-header border-b border-gray-50 flex items-center justify-between">
               <div>
                  <h2 className="vb-section-title">Peak Engagement</h2>
                  <p className="vb-section-subtitle">Hourly distribution of store interactions.</p>
               </div>
               <Clock className="w-5 h-5 text-blue-500" />
            </div>
            <div className={`p-8 flex items-center gap-12 flex-1 justify-center ${!settings.is_pro ? 'opacity-40 grayscale-[0.5]' : ''}`}>
               <DonutChart points={data.hourly_data} />
               <div className="flex-1 grid grid-cols-2 gap-x-8 gap-y-4 max-w-[200px]">
                  {(data.hourly_data || []).map((h, i) => (
                     <div key={i} className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: h.color }} />
                        <div className="min-w-0">
                           <p className="text-[9px] font-black text-slate-400 uppercase leading-none mb-1 truncate">{h.label}</p>
                           <p className="text-[7.5px] font-bold text-slate-300 uppercase leading-none mb-1">{h.label === 'Morning' ? '06:00 - 11:59' : h.label === 'Afternoon' ? '12:00 - 17:59' : h.label === 'Evening' ? '18:00 - 23:59' : '00:00 - 05:59'}</p>
                           <p className="text-sm font-bold text-slate-900 leading-none">{h.count}</p>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </div>
      </div>

      <div className="vb-section-card relative overflow-hidden cursor-default transition-all duration-700">
        {!settings.is_pro && (
          <div className="absolute top-4 right-4 z-20">
            <ProBadge />
          </div>
        )}
        <div className="vb-section-header border-b border-gray-50 bg-gray-50/20">
          <h2 className="vb-section-title">Product Interaction Rankings</h2>
          <p className="vb-section-subtitle">Catalog items generating the highest inquiry volume.</p>
        </div>
        <div className={`p-4 space-y-1 ${!settings.is_pro ? 'opacity-40 grayscale-[0.5]' : ''}`}>
          {(!data.top_products || data.top_products.length === 0) ? (
            <div className="p-16 text-center opacity-40 italic">Awaiting data</div>
          ) : (
            data.top_products.map((p, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-xl border border-transparent truncate hover:bg-gray-50/50">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-[10px] font-black text-gray-400">#{i+1}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-slate-800 truncate leading-none mb-1">{decodeHTMLEntities(p.name)}</p>
                  <p className="text-[10px] text-slate-400 font-bold truncate tracking-tight">{p.url}</p>
                </div>
                <div className="text-right pr-4">
                  <p className="text-base font-black text-slate-900 leading-none mb-0.5">{p.count}</p>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Interactions</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="vb-section-card relative overflow-hidden cursor-default">
        {!settings.is_pro && (
          <div className="absolute top-4 right-4 z-20">
             <ProBadge className="shadow-lg animate-pulse" />
          </div>
        )}
        <div className="vb-section-header border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
          <div>
            <h2 className="vb-section-title">Customer Distribution Map</h2>
            <p className="vb-section-subtitle">Detailed geographical breakdown of current lead acquisition.</p>
          </div>
          <Globe className="w-6 h-6 text-blue-500" />
        </div>
        <div className={`p-8 ${!settings.is_pro ? 'opacity-30 grayscale-[0.8]' : ''}`}>
           {(!data.top_locations || data.top_locations.length === 0) ? (
              <div className="p-16 text-center opacity-40 italic">Awaiting data</div>
           ) : (
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-center">
              <div className="lg:col-span-1 space-y-5">
                 <h5 className="vb-label">Top Performing Regions</h5>
                 {(data.top_locations || []).map((loc, i) => (
                    <div key={i} className="space-y-2">
                       <div className="flex justify-between text-xs font-black text-slate-800">
                          <div className="flex items-center gap-2">
                             <span className="text-sm">{loc.country}</span>
                          </div>
                          <span className="text-blue-600">{loc.percentage}%</span>
                       </div>
                       <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-600 rounded-full transition-all duration-[1500ms]" style={{ width: `${loc.percentage}%` }} />
                       </div>
                    </div>
                 ))}
              </div>
              <div className="lg:col-span-2 relative h-96 bg-slate-50 rounded-[24px] border border-slate-100 shadow-inner flex items-center justify-center overflow-hidden">
                 <svg className="absolute inset-0 w-full h-full p-6 text-blue-200" viewBox="0 0 1000 500" fill="currentColor">
                    <path d="M110,120 L150,110 L250,110 L280,140 L260,200 L240,240 L180,300 L120,200 Z" opacity="0.6" />
                    <path d="M260,300 L320,300 L380,350 L350,450 L280,420 L250,340 Z" opacity="0.6" />
                    <path d="M440,220 L510,210 L580,240 L580,320 L530,420 L480,410 L440,320 Z" opacity="0.6" />
                    <path d="M430,200 L450,110 L550,100 L750,100 L900,150 L920,250 L850,350 L750,340 L650,300 L550,220 Z" opacity="0.7" />
                    <path d="M820,380 L900,380 L920,440 L840,460 Z" opacity="0.6" />
                 </svg>
                 {(data.top_locations || []).map((loc, i) => {
                    const coord = countryCoords[loc.code];
                    if (!coord) return null;
                    return (
                      <div key={i} className="absolute overflow-visible" style={{ left: `${(coord.x / 1000) * 100}%`, top: `${(coord.y / 500) * 100}%` }}>
                         <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse relative">
                           <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-75" />
                         </div>
                      </div>
                    );
                 })}
              </div>
           </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsView;
