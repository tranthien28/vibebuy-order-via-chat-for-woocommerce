import React, { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, MessageCircle, User, Mail, Calendar, ExternalLink, ShoppingCart, Download, Lock, Globe, Eye, UserCheck } from 'lucide-react';

const ConversationsView = ({ onViewDetail, settings, onUpgrade }) => {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [paged, setPaged] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const fetchConnections = async () => {
    setLoading(true);
    try {
      const resp = await fetch(`${window.vibebuyData.apiUrl}connections?paged=${paged}&search=${encodeURIComponent(search)}`, {
        headers: { 'X-WP-Nonce': window.vibebuyData.nonce }
      });
      if (resp.ok) {
        const data = await resp.json();
        setConnections(data.items || []);
        setTotalPages(data.pages || 1);
        setTotalItems(data.total || 0);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchConnections();
    }, 300);
    return () => clearTimeout(timer);
  }, [paged, search]);

  const handleExport = () => {
    if (!settings?.is_pro || connections.length === 0) return;
    
    // CSV Construction
    const headers = ['ID', 'Customer Name', 'Email', 'Phone', 'Channel', 'Product', 'Qty', 'Date', 'Message', 'IP'];
    const rows = connections.map(item => [
      item.id,
      `"${item.customer_name.replace(/"/g, '""')}"`,
      item.customer_email,
      item.customer_phone || '',
      item.channel_id,
      `"${(item.product_title || 'N/A').replace(/"/g, '""')}"`,
      item.product_qty || 1,
      item.formatted_date,
      `"${(item.customer_message || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`,
      item.customer_ip || ''
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `vibebuy-leads-${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="vb-connections-container animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="vb-section-card">
        <div className="vb-section-header flex justify-between items-center">
          <div>
            <h2 className="vb-page-title">Lead Inquiries</h2>
            <p className="vb-section-subtitle">Realtime archive of messaging connection requests.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10 pointer-events-none group-focus-within:text-blue-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Filter leads..." 
                className="vb-input !w-64 pl-12"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPaged(1); }}
              />
            </div>

            <button 
              onClick={handleExport}
              className={`h-10 px-5 flex items-center gap-2 bg-white border rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm relative group/export overflow-hidden ${
                settings?.is_pro 
                  ? 'border-gray-200 text-gray-700 hover:border-blue-500 hover:text-blue-600 hover:shadow-md active:scale-95' 
                  : 'border-gray-100 text-gray-300 opacity-60 grayscale cursor-not-allowed'
              }`}
            >
               <Download className="w-3.5 h-3.5" /> 
               <span>Export</span>
                {!settings?.is_pro && (
                  <div className="absolute top-0 right-0 vb-badge-pro !rounded-none !rounded-bl-lg !px-2 !py-1">PRO</div>
                )}
            </button>
          </div>
        </div>


        <div className="transition-all duration-300">
          {loading ? (
            <div className="p-20 text-center flex flex-col items-center justify-center gap-4">
              <div className="vb-spinner-sm" style={{ borderTopColor: '#3b82f6' }}></div>
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest animate-pulse">Syncing inquiries...</p>
            </div>
          ) : connections.length === 0 ? (
            <div className="p-20 text-center flex flex-col items-center justify-center gap-4">
              <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center border-2 border-dashed border-gray-100 mb-2">
                  <MessageCircle className="w-8 h-8 text-gray-200" />
              </div>
              <div>
                <p className="text-base font-black text-gray-900 mb-1">No results found</p>
                <p className="text-xs text-gray-400 font-medium italic">Try searching for a different name, email, or clear filters.</p>
              </div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                      <th className="vb-label border-b border-gray-50 px-6 py-3 text-left bg-gray-50/30 font-bold text-[11px] uppercase tracking-wider">Customer</th>
                      <th className="vb-label border-b border-gray-50 px-6 py-3 text-left bg-gray-50/30 font-bold text-[11px] uppercase tracking-wider">Order</th>
                      <th className="vb-label border-b border-gray-50 px-6 py-3 text-left bg-gray-50/30 font-bold text-[11px] uppercase tracking-wider">Product</th>
                      <th className="vb-label border-b border-gray-50 px-6 py-3 text-left bg-gray-50/30 font-bold text-[11px] uppercase tracking-wider">User ID</th>
                      <th className="vb-label border-b border-gray-50 px-6 py-3 text-left bg-gray-50/30 font-bold text-[11px] uppercase tracking-wider">Date</th>
                      <th className="vb-label border-b border-gray-50 px-6 py-3 text-right bg-gray-50/30 font-bold text-[11px] uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {connections.map((item) => (
                      <tr key={item.id} className="hover:bg-blue-50/20 transition-all group">
                        <td className="px-6 py-1.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center font-black text-[10px] shadow-sm group-hover:scale-105 transition-transform">
                              {item.customer_name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-[11px] font-semibold text-slate-900 leading-none mb-1.5">{item.customer_name}</p>
                              <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1"><Mail className="w-2.5 h-2.5 text-slate-300" /> {item.customer_email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-1.5">
                          {item.order_id > 0 ? (
                            <a 
                              href={`${window.vibebuyData.homeUrl}wp-admin/post.php?post=${item.order_id}&action=edit`} 
                              target="_blank" 
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-100 hover:bg-emerald-100 transition-colors shadow-xs"
                              title="View WooCommerce Order"
                            >
                              <ShoppingCart className="w-3 h-3" />
                              #{item.order_id}
                              <ExternalLink className="w-2.5 h-2.5 opacity-50" />
                            </a>
                          ) : (
                            <span className="text-[10px] font-bold text-slate-300 italic opacity-50">—</span>
                          )}
                        </td>
                        <td className="px-6 py-1.5">
                          <div className="max-w-[180px]">
                            <p className="text-[11px] font-semibold text-slate-700 truncate leading-tight group-hover:text-blue-600 transition-colors">
                              {item.product_title || `ID: #${item.product_id}`}
                            </p>
                            <p className="text-[9px] text-slate-400 font-medium mt-0.5 uppercase tracking-tight opacity-70">
                              {item.product_qty ? `${item.product_qty} unit(s)` : 'Contextual Lead'}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-1.5">
                          {item.is_user ? (
                            <a 
                              href={`${window.vibebuyData.homeUrl}wp-admin/user-edit.php?user_id=${item.user_id}`} 
                              target="_blank" 
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-blue-50 text-blue-600 text-[9px] font-black uppercase ring-1 ring-blue-100 hover:bg-blue-100 transition-colors shadow-xs"
                              title="View User Profile"
                            >
                              <User className="w-3 h-3" />
                              ID: {item.user_id}
                              <ExternalLink className="w-2 h-2 opacity-50" />
                            </a>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-slate-50 text-slate-400 text-[9px] font-black uppercase ring-1 ring-slate-200 opacity-60">
                              Guest
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-1.5">
                          <div className="max-w-[160px]">
                            <p className="text-[11px] font-semibold text-slate-500 whitespace-nowrap">
                              {item.formatted_date}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-1.5 text-right">
                          <button 
                            onClick={() => onViewDetail(item.id)}
                            className="p-2 bg-white text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-sm group-hover:shadow-md active:scale-95"
                            title="View Lead Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Footer Gated for LITE */}
              <div className={`px-6 py-4 bg-slate-50/80 flex items-center justify-between border-t border-slate-100 relative ${!settings?.is_pro ? 'opacity-60 grayscale' : ''}`}>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    Showing {connections.length} / {totalItems} Inquiries
                    {!settings?.is_pro && (
                      <span className="text-amber-500 font-black ml-1.5 flex items-center gap-1">
                        <Lock className="w-3 h-3" /> LITE LIMIT REACHED TO 10
                      </span>
                    )}
                </p>
                
                <div className="flex items-center gap-3 relative group/pagination">
                    {!settings?.is_pro && (
                      <div className="absolute inset-0 z-10 cursor-not-allowed"></div>
                    )}
                    <button 
                      disabled={paged === 1 || !settings?.is_pro}
                      onClick={() => setPaged(prev => prev - 1)}
                      className="w-10 h-10 bg-white border border-slate-200 rounded-2xl flex items-center justify-center hover:border-slate-300 hover:shadow-md transition-all disabled:opacity-40 shadow-sm"
                    >
                      <ChevronLeft className="w-4 h-4 text-slate-600" />
                    </button>
                    <div className="px-4 py-2 bg-white border border-slate-200 rounded-2xl text-[11px] font-black text-slate-800 shadow-sm">
                      {paged} <span className="text-slate-300 mx-1">of</span> {totalPages}
                    </div>
                    <button 
                      disabled={paged === totalPages || !settings?.is_pro}
                      onClick={() => setPaged(prev => prev + 1)}
                      className="w-10 h-10 bg-white border border-slate-200 rounded-2xl flex items-center justify-center hover:border-slate-300 hover:shadow-md transition-all disabled:opacity-40 shadow-sm"
                    >
                      <ChevronRight className="w-4 h-4 text-slate-600" />
                    </button>
                    
                    {!settings?.is_pro && (
                      <div className="absolute -top-10 right-0 bg-gray-900 text-white text-[10px] font-black px-3 py-1.5 rounded-xl shadow-2xl border border-gray-800 whitespace-nowrap opacity-0 group-hover/pagination:opacity-100 pointer-events-none transition-opacity">
                        Upgrade to PRO to unlock pagination
                      </div>
                    )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConversationsView;
