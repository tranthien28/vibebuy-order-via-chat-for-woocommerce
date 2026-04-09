import React, { useState, useEffect } from 'react';
import { ChevronLeft, User, Mail, Calendar, ExternalLink, ShoppingCart, Tag, Hash, Archive, Info, DollarSign, Package, MessageCircle, Lock, ShoppingBag } from 'lucide-react';

const ConversationDetailView = ({ id, onBack, isPro }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const resp = await fetch(`${window.vibebuyData.apiUrl}connection-detail?id=${id}`, {
          headers: { 'X-WP-Nonce': window.vibebuyData.nonce }
        });
        if (resp.ok) {
          const json = await resp.json();
          setData(json);
        }
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchDetail();
  }, [id]);

  if (loading) return (
    <div className="p-12 text-center bg-white rounded-3xl border border-gray-100 shadow-sm font-sans mx-6 mt-6">
       <div className="vb-spinner-sm mx-auto mb-4 border-t-blue-500" />
       <p className="text-gray-400 font-semibold uppercase tracking-widest text-[10px]">Fetching connection lifecycle...</p>
    </div>
  );

  if (!data) return (
    <div className="p-12 text-center bg-white rounded-3xl border border-gray-100 shadow-sm font-sans mx-6 mt-6">
       <p className="text-red-500 font-bold">Inquiry not found or deleted.</p>
       <button onClick={onBack} className="mt-4 text-blue-600 font-bold hover:underline">← Go Back</button>
    </div>
  );

  return (
    <div className="p-8 font-sans max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
       {/* Header */}
        <div className="flex items-center justify-between bg-white p-5 rounded-[2rem] shadow-sm border border-gray-100">
          <div className="flex items-center gap-5">
             <button 
                onClick={onBack}
                className="w-10 h-10 flex items-center justify-center bg-gray-50 border border-gray-100 rounded-2xl text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-all group"
             >
                <ChevronLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
             </button>
             <div>
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">Inquiry # {id}</h1>
                <p className="text-[11px] text-gray-400 font-medium leading-none mt-1">Detailed lifecycle overview of the customer request.</p>
             </div>
          </div>
          <div className="flex items-center gap-3">
             <span className={`px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest bg-gray-900 text-white shadow-lg shadow-gray-200`}>
                {data.channel_id}
             </span>
          </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Customer & Product */}
          <div className="lg:col-span-1 space-y-8">
             {/* Customer Card */}
             <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden group">
                <div className="p-7 bg-gradient-to-br from-blue-50 to-indigo-50 border-b border-gray-100">
                   <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-blue-600 ring-4 ring-white/50">
                         <User className="w-6 h-6" />
                      </div>
                      {data.user_meta ? (
                         <span className="px-3 py-1 bg-blue-600 text-white text-[9px] font-bold uppercase tracking-tighter rounded-full shadow-md shadow-blue-200">Registered User</span>
                      ) : (
                         <span className="px-3 py-1 bg-white text-gray-400 text-[9px] font-bold uppercase tracking-tighter rounded-full border border-gray-200">Guest Visitor</span>
                      )}
                   </div>
                   <h3 className="text-lg font-bold text-gray-900 mb-1">{data.customer_name}</h3>
                   <div className="flex items-center gap-2 text-gray-500 text-xs font-semibold">
                      <Mail className="w-3.5 h-3.5" /> {data.customer_email}
                   </div>
                </div>
                <div className="p-7 space-y-4">
                   {data.user_meta && (
                      <div className="flex items-center justify-between text-xs">
                         <span className="text-gray-400 font-bold uppercase tracking-widest text-[9px]">User Link</span>
                         <a href={data.user_meta.url} target="_blank" className="text-blue-600 font-semibold hover:underline flex items-center gap-1">
                            Profile #{data.user_meta.id} <ExternalLink className="w-3 h-3" />
                         </a>
                      </div>
                   )}
                   <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400 font-bold uppercase tracking-widest text-[9px]">Phone</span>
                      <span className="text-gray-900 font-semibold">{data.customer_phone || 'N/A'}</span>
                   </div>
                   <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400 font-bold uppercase tracking-widest text-[9px]">Role</span>
                      <span className="text-gray-900 font-semibold uppercase text-[10px] tracking-tight">{data.user_meta?.role || 'Guest'}</span>
                   </div>
                </div>
             </div>

             {/* Timestamp Card */}
             <div className="bg-white p-7 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400">
                   <Calendar className="w-5 h-5" />
                </div>
                <div>
                   <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Precise Datetime</p>
                   <p className="text-xs font-semibold text-gray-900 tracking-tight uppercase">{data.formatted_date}</p>
                </div>
             </div>
          </div>

          {/* Right Column: Message & Full Product Details */}
          <div className="lg:col-span-2 space-y-8">
             {/* Message Section */}
             <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6">
                   <MessageCircle className="w-12 h-12 text-gray-50/50 -rotate-12 transform scale-150" />
                </div>
                <h4 className="text-[9px] font-bold text-blue-600 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                   <Info className="w-4 h-4" /> Inquiry Message Context
                </h4>
                <div className="bg-gray-50/50 p-6 rounded-3xl border border-gray-100 text-base text-gray-800 leading-relaxed font-semibold italic relative z-10">
                   "{data.customer_message || 'The customer did not provide a message note.'}"
                </div>
             </div>

             {/* Product Specifications Section */}
             <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-7 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                   <h4 className="text-[11px] font-bold text-gray-900 uppercase tracking-widest flex items-center gap-3">
                      <ShoppingCart className="w-4 h-4 text-blue-600" /> Full Product Specifications
                   </h4>
                   <div className="flex items-center gap-4">
                      {data.product_details?.url && (
                         <a href={data.product_details.url} target="_blank" className="text-[9px] font-bold text-gray-400 hover:text-blue-600 uppercase tracking-tight flex items-center gap-1 transition-colors">
                            View Product <ExternalLink className="w-3 h-3" />
                         </a>
                      )}
                      
                      <button 
                         disabled={!isPro}
                         className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all ${
                           isPro 
                             ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-100' 
                             : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200 opacity-70'
                         }`}
                      >
                         <ShoppingBag className="w-3.5 h-3.5" />
                         Create Order
                         {!isPro && <span className="bg-amber-400 text-white text-[7px] px-1.5 py-0.5 rounded shadow-sm ml-1">PRO</span>}
                      </button>
                   </div>
                </div>
                {data.product_details ? (
                    <div className="p-9">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                          {/* Product Name */}
                          <div className="space-y-1.5">
                             <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Package className="w-3 h-3" /> Product Display Name
                             </span>
                             <p className="text-lg font-bold text-gray-900 leading-tight">{data.product_details.name}</p>
                          </div>

                          {/* Price */}
                          <div className="space-y-1.5">
                             <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <DollarSign className="w-3 h-3" /> Retail Price
                             </span>
                             <p className="text-lg font-bold text-green-600">{data.product_details.price}</p>
                          </div>

                          {/* Quantity */}
                          <div className="space-y-1.5">
                             <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Package className="w-3 h-3" /> Quantity Requested
                             </span>
                             <p className="text-lg font-bold text-gray-900">{data.product_qty || 1} Units</p>
                          </div>

                          {/* SKU & ID */}
                          <div className="space-y-1.5">
                             <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Archive className="w-3 h-3" /> Stock Keeping Unit (SKU)
                             </span>
                             {isPro ? (
                               <p className="text-base font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-lg inline-block">{data.product_details.sku}</p>
                             ) : (
                               <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 w-fit">
                                  <Lock className="w-3.5 h-3.5 text-amber-500" />
                                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-tight">Locked in Lite</p>
                               </div>
                             )}
                             <span className="block text-[10px] text-gray-400 font-semibold mt-1">Universal ID: #{data.product_details.id}</span>
                          </div>

                          {/* Inventory */}
                          <div className="space-y-1.5">
                             <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Archive className="w-3 h-3" /> Inventory Status
                             </span>
                             <div className="flex items-center gap-3">
                                <span className={`w-2.5 h-2.5 rounded-full ${typeof data.product_details.inventory === 'number' && data.product_details.inventory > 0 ? 'bg-green-500' : 'bg-amber-500'}`} />
                                <p className="text-base font-bold text-gray-900">
                                   {typeof data.product_details.inventory === 'number' ? `${data.product_details.inventory} Units Available` : data.product_details.inventory}
                                </p>
                             </div>
                          </div>

                          {/* Slug */}
                          <div className="md:col-span-2 space-y-1.5">
                             <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Tag className="w-3 h-3" /> Permalink URL Slug
                             </span>
                             <p className="text-[11px] font-mono font-semibold text-gray-500 bg-gray-50 p-3 rounded-xl border border-gray-100 break-all leading-relaxed">
                                {data.product_details.slug}
                             </p>
                          </div>
                       </div>
                    </div>
                ) : (
                   <div className="p-20 text-center text-gray-400 space-y-3">
                      <ShoppingCart className="w-12 h-12 mx-auto opacity-20" />
                      <p className="font-black text-sm uppercase tracking-widest">No detailed product metadata was recorded.</p>
                   </div>
                )}
             </div>
          </div>
       </div>
    </div>
  );
};

export default ConversationDetailView;
