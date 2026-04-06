import React, { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, MessageCircle, User, Mail, Calendar, ExternalLink, ShoppingCart, Download, Lock } from 'lucide-react';

const ConversationsView = ({ onViewDetail, settings }) => {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [paged, setPaged] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [viewingItem, setViewingItem] = useState(null);

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
    const headers = ['ID', 'Customer Name', 'Email', 'Phone', 'Channel', 'Product', 'Qty', 'Date', 'Message'];
    const rows = connections.map(item => [
      item.id,
      `"${item.customer_name.replace(/"/g, '""')}"`,
      item.customer_email,
      item.customer_phone || '',
      item.channel_id,
      `"${(item.product_title || 'N/A').replace(/"/g, '""')}"`,
      item.product_qty || 1,
      item.formatted_date,
      `"${(item.customer_message || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`
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
    <div className="vb-connections-container">
      <div className="vb-section-header flex justify-between items-center mb-6">
        <div>
          <h2 className="vb-section-title">Inquiries</h2>
          <p className="vb-section-subtitle">Manage inquiries and leads from your chat buttons.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="vb-search-wrap relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              className="vb-search-input pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 w-64"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPaged(1); }}
            />
          </div>
          <button 
            onClick={handleExport}
            className={`flex items-center gap-2 px-4 py-2 bg-white border rounded-lg text-xs font-black uppercase transition-all shadow-sm relative group/export overflow-hidden ${
              settings?.is_pro 
                ? 'border-gray-200 text-gray-700 hover:border-blue-500 hover:text-blue-600' 
                : 'border-gray-100 text-gray-300 opacity-60 grayscale cursor-not-allowed'
            }`}
          >
             <Download className="w-4 h-4" /> Export Leads
             {!settings?.is_pro && (
               <>
                 <div className="absolute top-0 right-0 py-0.5 px-1.5 bg-amber-400 text-white text-[7px] font-black uppercase rounded-bl shadow-sm">PRO</div>
                 <div className="absolute bottom-full mb-3 right-0 bg-gray-900 text-white text-[10px] px-3 py-1.5 rounded-lg opacity-0 group-hover/export:opacity-100 whitespace-nowrap pointer-events-none transition-all scale-95 group-hover/export:scale-100 shadow-xl border border-gray-800 z-50">
                   <Lock className="w-3.5 h-3.5 inline mr-1 text-amber-400" /> CSV/Excel Export (PRO)
                 </div>
               </>
             )}
          </button>
        </div>
      </div>

      <div className="vb-connections-list bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="vb-spinner-sm mx-auto mb-4" />
            <p className="text-gray-400 text-sm">Loading connections...</p>
          </div>
        ) : connections.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
               <MessageCircle className="w-8 h-8" />
            </div>
            <p className="text-gray-900 font-medium">No inquiries found</p>
            <p className="text-gray-400 text-sm mt-1">Start collecting inquiries by enabling the Order Modal.</p>
          </div>
        ) : (
          <>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-bottom border-gray-100">
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Channel</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Message</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {connections.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-black text-sm shadow-sm border border-blue-100">
                          {item.customer_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-black text-gray-900 leading-tight flex items-center gap-1.5">
                             {item.customer_name}
                             {item.is_user ? (
                               <a href={item.user_url} target="_blank" className="px-1.5 py-0.5 bg-blue-600 text-white text-[8px] font-black uppercase rounded shadow-sm hover:bg-blue-700 transition-colors">#{item.user_id} USER</a>
                             ) : (
                               <span className="px-1.5 py-0.5 bg-gray-200 text-gray-500 text-[8px] font-black uppercase rounded">GUEST</span>
                             )}
                          </p>
                          <p className="text-xs text-gray-400 font-medium flex items-center gap-1"><Mail className="w-3 h-3" /> {item.customer_email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex flex-col max-w-[180px]">
                          <a href={item.product_url} target="_blank" className="text-sm font-bold text-gray-800 hover:text-blue-600 truncate underline decoration-gray-200 underline-offset-4" title={item.product_title}>
                             {item.product_title}
                          </a>
                          <span className="text-[10px] font-bold text-gray-400">ID: #{item.product_id}</span>
                       </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm
                        ${item.channel_id === 'whatsapp' ? 'bg-green-100/50 text-green-700 border border-green-200' : 'bg-blue-100/50 text-blue-700 border border-blue-200'}`}>
                        {item.channel_id}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p 
                        className="text-sm text-gray-500 font-medium truncate max-w-[200px] italic leading-relaxed" 
                        title={item.customer_message}
                      >
                        {item.customer_message ? `"${item.customer_message}"` : <span className="italic text-gray-300">No message provided...</span>}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-[11px] font-black text-gray-500 flex items-center gap-1.5 whitespace-nowrap">
                         <Calendar className="w-3.5 h-3.5 opacity-50" /> {item.formatted_date}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => onViewDetail(item.id)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-1.5"
                      >
                         <ExternalLink className="w-3.5 h-3.5" />
                         View
                      </button>
                      <button className="p-2.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all group/btn relative">
                        <ShoppingCart className="w-4 h-4" />
                        <span className="absolute bottom-full mb-3 right-0 bg-gray-900 text-white text-[10px] px-3 py-1.5 rounded-lg opacity-0 group-hover/btn:opacity-100 whitespace-nowrap pointer-events-none transition-all scale-95 group-hover/btn:scale-100 shadow-xl border border-gray-800">
                          <Lock className="w-3.5 h-3.5 inline mr-1 text-amber-400" /> Create Order (PRO)
                        </span>
                      </button>
                    </div>
                  </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="px-6 py-4 bg-gray-50/30 flex items-center justify-between border-t border-gray-100">
               <p className="text-xs text-gray-500">Showing {connections.length} of {totalItems} connections</p>
               <div className="flex items-center gap-2">
                  <button 
                    disabled={paged === 1}
                    onClick={() => setPaged(prev => prev - 1)}
                    className="p-1.5 rounded-md border border-gray-200 bg-white text-gray-600 disabled:opacity-50 hover:bg-gray-50 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-medium text-gray-900 px-3">Page {paged} of {totalPages}</span>
                  <button 
                    disabled={paged === totalPages}
                    onClick={() => setPaged(prev => prev + 1)}
                    className="p-1.5 rounded-md border border-gray-200 bg-white text-gray-600 disabled:opacity-50 hover:bg-gray-50 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
               </div>
            </div>
          </>
        )}
      </div>

      {/* Message Inspector Modal */}
      {viewingItem && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setViewingItem(null)}>
           <div className="bg-white w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
              <div className="p-8 border-b border-gray-100 bg-gray-50/50">
                 <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-[10px] font-black uppercase tracking-widest rounded-full">Inquiry Details</span>
                    <button onClick={() => setViewingItem(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                       <ChevronRight className="w-6 h-6 rotate-90" strokeWidth={3} />
                    </button>
                 </div>
                 <h3 className="text-2xl font-black text-gray-900 mb-1">{viewingItem.customer_name}</h3>
                 <p className="text-sm text-gray-500 flex items-center gap-2">
                    <Mail className="w-4 h-4" /> {viewingItem.customer_email}
                 </p>
              </div>
              <div className="p-8 space-y-6">
                 <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Message</p>
                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-sm text-gray-700 leading-relaxed italic">
                       "{viewingItem.customer_message || 'No message provided.'}"
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Channel</p>
                       <p className="text-sm font-bold text-gray-900 capitalize">{viewingItem.channel_id}</p>
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Date</p>
                       <p className="text-sm font-bold text-gray-900">{new Date(viewingItem.created_at).toLocaleString()}</p>
                    </div>
                 </div>
                 {viewingItem.product_id && (
                    <div className="pt-4 border-t border-gray-50">
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Interested Product ID</p>
                       <div className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:underline cursor-pointer">
                          <ShoppingCart className="w-4 h-4" /> #{viewingItem.product_id}
                       </div>
                    </div>
                 )}
              </div>
              <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
                 <button 
                  onClick={() => setViewingItem(null)}
                  className="px-8 py-3 bg-gray-900 text-white font-bold rounded-2xl hover:bg-gray-800 transition-all shadow-lg shadow-gray-200"
                 >
                  Close Detail
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default ConversationsView;
