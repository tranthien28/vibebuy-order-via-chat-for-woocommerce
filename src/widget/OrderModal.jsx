import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Send, User, Mail, MessageSquare, CheckCircle2, ShoppingCart, Phone } from 'lucide-react';

const OrderModal = ({ isOpen, onClose, onSubmit, channel, product, userData, settings }) => {
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_message: ''
  });
  const [quantity, setQuantity] = useState(product?.qty || 1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (isOpen && settings.orderModal_autoFill !== false && userData?.isLoggedIn) {
      setFormData(prev => ({
        ...prev,
        customer_name: `${userData.firstName} ${userData.lastName}`.trim(),
      }));
    }
  }, [isOpen, userData, settings.orderModal_autoFill]);

  // Sync quantity when modal opens or product changes
  useEffect(() => {
    if (isOpen && product?.qty) {
      setQuantity(product.qty);
    }
  }, [isOpen, product?.qty]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const success = await onSubmit({
      customer_name: formData.customer_name,
      customer_phone: formData.customer_phone,
      customer_message: formData.customer_message,
      channel_id: channel.id,
      product_id: product?.id || 0,
      product_qty: quantity,
      product_url: product?.url || window.location.href
    });

    if (success) {
      setIsSuccess(true);
      // Wait a bit longer for the user to read the success message
      setTimeout(() => {
        setIsSuccess(false);
        // Only WhatsApp in Lite opens a direct link. Other integrations use server-side push notifications.
        const activeChannels = settings.activeChannels || [];
        const isWhatsappActive = activeChannels.includes('whatsapp') || channel?.id === 'whatsapp';
        const shouldRedirect = !settings.is_pro && isWhatsappActive;
        onClose(shouldRedirect);
      }, 2000);
    } else {
      setIsSubmitting(false);
    }
  };

  const widgetData = window.vibebuyWidgetData || {};
  const strings = widgetData.strings || {};
  const templateHtml = widgetData.orderModalTemplate || '';

  // Return Portals into the Template Slots
  const renderSlots = () => {
    const slots = [];
    
    // Close Button Slot
    const closeEl = document.getElementById('vibe-slot-close');
    if (closeEl) {
      slots.push(createPortal(
        <button 
          className="absolute top-3 right-3 z-50 p-1.5 bg-white/80 hover:bg-white rounded-full shadow-sm transition-all text-gray-400 hover:text-gray-900 border border-gray-100" 
          onClick={(e) => { e.stopPropagation(); onClose(false); }}
        >
          <X className="w-4 h-4" />
        </button>,
        closeEl
      ));
    }

    const imgEl = document.getElementById('vibe-slot-image');
    if (imgEl) {
      slots.push(createPortal(
        <div className="w-full h-full relative group bg-gray-50 flex items-center justify-center">
          {product?.image && product.image !== 'false' ? (
            <img 
              src={product.image} 
              alt={product.name} 
              className="w-full h-full object-contain mix-blend-multiply transition-opacity duration-300"
              onLoad={(e) => e.target.style.opacity = 1}
              onError={(e) => { e.target.src = ''; e.target.style.display = 'none'; }}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-4 text-gray-300">
               <ShoppingCart className="w-10 h-10 mb-2 opacity-20" />
               <span className="text-[9px] font-black uppercase tracking-widest opacity-40">No Photo</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent pointer-events-none"></div>
          <div className="absolute bottom-3 left-3">
             <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg border border-white/20 shadow-sm">
                <div className={`vibebuy-modal-icon-xs ${channel.id}`}>{channel.icon}</div>
                <span className="text-[9px] font-black uppercase text-gray-700 tracking-tighter">{channel.name}</span>
             </div>
          </div>
        </div>,
        imgEl
      ));
    }

    // Product Header Slots
    const nameEl = document.getElementById('vibe-slot-product-name');
    if (nameEl) {
      slots.push(createPortal(
        <h3 className="text-base font-black text-gray-900 leading-tight truncate">{product?.name || 'Inquiry'}</h3>,
        nameEl
      ));
    }

    const priceEl = document.getElementById('vibe-slot-product-price');
    if (priceEl) {
      slots.push(createPortal(
        <span className="text-sm font-black text-blue-600">
          {product?.currency && <span dangerouslySetInnerHTML={{ __html: product.currency }} />}
          {product?.price || ''}
        </span>,
        priceEl
      ));
    }

    const skuEl = document.getElementById('vibe-slot-product-sku');
    if (skuEl) {
      slots.push(createPortal(
        <div className="flex flex-col mt-1">
          <div className="flex flex-wrap gap-1.5">
            {product?.sku && (
              <span className="text-[9px] bg-gray-50 text-gray-400 px-1.5 py-0.5 rounded border border-gray-100 font-bold uppercase tracking-wider">SKU: {product.sku}</span>
            )}
            {product?.variation && (
              <span className="text-[9px] bg-blue-50 text-blue-500 px-1.5 py-0.5 rounded border border-blue-100 font-bold uppercase tracking-wider">{product.variation}</span>
            )}
          </div>
          {(product?.sku || product?.variation) && (
            <p className="text-[8px] text-gray-400 font-medium mt-1 italic leading-tight">Variation & SKU details are optimized for <b>VibeBuy Pro</b>.</p>
          )}
        </div>,
        skuEl
      ));
    }

    // Quantity Selector Slot
    const qtyEl = document.getElementById('vibe-slot-quantity');
    if (qtyEl) {
      slots.push(createPortal(
        <div className="flex items-center gap-2.5 bg-white px-2 py-1 rounded-lg border border-gray-200">
          <button 
            type="button" 
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-6 h-6 flex items-center justify-center bg-gray-50 rounded hover:bg-gray-100 text-gray-500 font-black text-xs transition-colors"
          >-</button>
          <span className="w-5 text-center text-xs font-black text-gray-900">{quantity}</span>
          <button 
            type="button" 
            onClick={() => setQuantity(quantity + 1)}
            className="w-6 h-6 flex items-center justify-center bg-gray-50 rounded hover:bg-gray-100 text-gray-500 font-black text-xs transition-colors"
          >+</button>
        </div>,
        qtyEl
      ));
    }

    const bRadius = settings.borderRadius !== undefined ? `${settings.borderRadius}px` : '10px';

    // Field Slots
    const nameFieldEl = document.getElementById('vibe-slot-field-name');
    if (nameFieldEl) {
      slots.push(createPortal(
        <div className="vibebuy-form-group">
          <label className="text-[9px] font-black uppercase text-gray-400 mb-1 flex items-center gap-1.5"><User className="w-2.5 h-2.5" /> Full Name</label>
          <input
            type="text"
            style={{ borderRadius: bRadius }}
            className="h-9 px-3 w-full bg-gray-50 border border-gray-200 text-[13px] text-gray-700 focus:bg-white focus:ring-1 focus:ring-blue-500 transition-all outline-none"
            required
            placeholder="Your name"
            value={formData.customer_name}
            onChange={e => setFormData({ ...formData, customer_name: e.target.value })}
          />
        </div>,
        nameFieldEl
      ));
    }

    const phoneFieldEl = document.getElementById('vibe-slot-field-phone');
    if (phoneFieldEl) {
      slots.push(createPortal(
        <div className="vibebuy-form-group">
          <label className="text-[9px] font-black uppercase text-gray-400 mb-1 flex items-center gap-1.5"><Phone className="w-2.5 h-2.5" /> Phone Number</label>
          <input
            type="tel"
            style={{ borderRadius: bRadius }}
            className="h-9 px-3 w-full bg-gray-50 border border-gray-200 text-[13px] text-gray-700 focus:bg-white focus:ring-1 focus:ring-blue-500 transition-all outline-none"
            placeholder="090xxxxxxx"
            required
            value={formData.customer_phone}
            onChange={e => setFormData({ ...formData, customer_phone: e.target.value })}
          />
        </div>,
        phoneFieldEl
      ));
    }

    const msgFieldEl = document.getElementById('vibe-slot-field-message');
    if (msgFieldEl) {
      slots.push(createPortal(
        <div className="vibebuy-form-group">
          <label className="text-[9px] font-black uppercase text-gray-400 mb-1 flex items-center gap-1.5"><MessageSquare className="w-2.5 h-2.5" /> Note</label>
          <textarea
            style={{ borderRadius: bRadius }}
            className="p-3 w-full bg-gray-50 border border-gray-200 text-[13px] text-gray-700 focus:bg-white focus:ring-1 focus:ring-blue-500 transition-all outline-none min-h-[50px] resize-none"
            placeholder="I'm interested..."
            rows={2}
            value={formData.customer_message}
            onChange={e => setFormData({ ...formData, customer_message: e.target.value })}
          />
        </div>,
        msgFieldEl
      ));
    }

    const submitEl = document.getElementById('vibe-slot-submit');
    if (submitEl) {
      slots.push(createPortal(
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`h-11 w-full text-white text-[13px] font-black tracking-wide shadow-md flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 vibebuy-bg-global`}
          style={{ backgroundColor: settings.backgroundColor || '#22c55e', borderRadius: bRadius }}
        >
          {isSubmitting ? (
            <div className="vibebuy-spinner-sm" />
          ) : (
            <>Gửi yêu cầu <Send className="w-3.5 h-3.5" /></>
          )}
        </button>,
        submitEl
      ));
    }

    const successEl = document.getElementById('vibe-slot-success');
    if (successEl && isSuccess) {
      slots.push(createPortal(
        <div className="absolute inset-0 bg-white z-[60] flex flex-col items-center justify-center text-center p-6 animate-in fade-in duration-300">
           <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
           </div>
           <p className="text-base font-black text-gray-900">Thành công!</p>
           <p className="text-[11px] text-gray-400 font-bold mt-1">Yêu cầu của bạn đã được gửi đi.</p>
        </div>,
        successEl
      ));
    }

    return slots;
  };

  const modalContainer = (
    <div 
      className="vibebuy-modal-system font-sans"
      dangerouslySetInnerHTML={{ __html: templateHtml }}
    />
  );

  return (
    <>
      {createPortal(modalContainer, document.body)}
      {renderSlots()}
    </>
  );
};

export default OrderModal;
