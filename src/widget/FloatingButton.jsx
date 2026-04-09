import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { MessageCircle, Phone, Send, X } from 'lucide-react';
import OrderModal from './OrderModal';

const getChannelLink = (channelId, settings, product, manualData) => {
  const data = product || manualData || {};
  let text = settings.global_message_template || "Hello, I'm interested in {{product_name}}";
  
  // Basic template replacement - matching the {{tag}} format used in admin
  text = text.replace('{{product_name}}', data.name || 'this product')
             .replace('{{product_price}}', data.price || '')
             .replace('{{product_url}}', data.url || window.location.href)
             .replace('{{full_name}}', data.customer_name || '')
             .replace('{{phone}}', data.customer_phone || '')
             .replace('{{product_qty}}', data.qty || '1');

  if (channelId === 'whatsapp') {
    const phone = manualData?.phone || settings.whatsapp_number;
    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  } else if (channelId === 'telegram') {
    const username = settings.telegram_botUsername;
    return username ? `https://t.me/${username}` : '#';
  } else if (channelId === 'zalo') {
    const number = manualData?.phone || settings.zalo_number;
    return `https://zalo.me/${number}`;
  } else if (channelId === 'messenger') {
    const id = settings.messenger_id;
    return `https://m.me/${id}`;
  } else if (channelId === 'tiktok') {
    const user = settings.tiktok_username;
    return user ? `https://www.tiktok.com/@${user.replace('@', '')}` : '#';
  } else if (channelId === 'instagram') {
    const user = settings.instagram_username;
    return user ? `https://instagram.com/${user.replace('@', '')}` : '#';
  } else if (channelId === 'line') {
    const id = settings.line_id;
    return id ? `https://line.me/R/ti/p/~${id}` : '#';
  } else if (channelId === 'viber') {
    const number = settings.viber_number;
    return number ? `viber://chat?number=${number}` : '#';
  } else if (channelId === 'custom') {
    return settings.custom_url || '#';
  }

  return '#';
};

const trackEvent = async (eventType, channelId, productId) => {
  // Exclude admin pages from analytics
  if (window.location.pathname.includes('wp-admin')) {
    return;
  }

  const payload = window.vibebuyWidgetData || {};
  if (!payload.settings?.is_pro) return;

  try {
    await fetch(`${payload.apiUrl}track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-WP-Nonce': payload.nonce
      },
      body: JSON.stringify({
        event_type: eventType,
        channel: channelId,
        product_id: productId,
        referrer: document.referrer
      })
    });
  } catch (err) {
    // Silent fail for tracking
  }
};

const checkVisibility = (settings, productData) => {
   if (!settings.is_pro) return true;
 
   // 1. Device Check
   const isMobile = window.innerWidth < 768;
   if (isMobile && settings.hide_on_mobile) return false;
   if (!isMobile && settings.hide_on_desktop) return false;
 
   // Advanced Platform Detection (PRO)
   const ua = navigator.userAgent.toLowerCase();
   
   // OS Targeting (PRO-HIDE)
   if (settings.os_ios && /iphone|ipad|ipod/.test(ua)) return false;
   if (settings.os_android && /android/.test(ua)) return false;
   if (settings.os_windows && /windows/.test(ua)) return false;
   if (settings.os_mac && /macintosh/.test(ua) && !(/iphone|ipad|ipod/.test(ua))) return false;
 
   // Browser Targeting (PRO-HIDE)
   if (settings.browser_chrome && ua.includes('chrome') && !ua.includes('edg') && !ua.includes('opr')) return false;
   if (settings.browser_safari && ua.includes('safari') && !ua.includes('chrome')) return false;
   if (settings.browser_firefox && ua.includes('firefox')) return false;
 
   // 2. Business Schedule Check
   if (settings.businessHours_enabled) {
     // Use synchronized Shop Time instead of visitor's local time
     let now = new Date();
     if (settings.server_time_now) {
       const serverTimeAtLoad = new Date(settings.server_time_now.replace(/-/g, '/')).getTime();
       const clientTimeAtLoad = window.vibebuy_init_time || Date.now();
       const timeDiff = serverTimeAtLoad - clientTimeAtLoad;
       now = new Date(Date.now() + timeDiff);
     }

     // a. Day check (Mon-Sun)
     const currentDay = now.getDay(); // 0 = Sun, 1 = Mon...
     const dayId = `businessHours_day_${currentDay}`;
     const isDayEnabled = settings[dayId] !== false; // Pro granular toggle
     if (!isDayEnabled) return false;

     // b. Date check (Holiday)
     const currentStrDate = `${now.getFullYear()}-${(now.getMonth()+1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
     const excludedDates = (settings.businessHours_dates || '').split(',').map(d => d.trim());
     if (excludedDates.includes(currentStrDate)) return false;

     // c. Time check (Granular)
     const currentStrTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
     const dayStart = settings[`businessHours_day_${currentDay}_start`] || '08:00';
     const dayEnd = settings[`businessHours_day_${currentDay}_end`] || '18:00';
  
     if (currentStrTime < dayStart || currentStrTime > dayEnd) return false;
   }
 
   // 3. Stock Level Check
   if (settings.stock_threshold_enabled && productData) {
      const threshold = parseInt(settings.stock_threshold || 0);
      const stock = productData.stock_qty !== null ? parseInt(productData.stock_qty) : (productData.is_in_stock ? 999 : 0);
      if (stock < threshold) return false;
   }
 
   return true;
 };
 
 const useOrderFlow = (settings, channelId, product, manualData) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const payload = window.vibebuyWidgetData || {};

  useEffect(() => {
    const productId = product?.id || 'manual';
    const variationId = product?.variation_id || 0;
    const submissionKey = `${channelId}|${productId}|${variationId}`;
    
    const submittedLocal = localStorage.getItem(`vibebuy_submitted_${submissionKey}`) === 'true';
    const submittedRemote = payload.submittedInquiries?.some(s => s === submissionKey || s === `${channelId}|${productId}`);
    
    setHasSubmitted(submittedLocal || submittedRemote);

    // Analytics: Widget View
    trackEvent('view', channelId, product?.id || 0);
  }, [channelId, product?.id, product?.variation_id, payload.submittedInquiries]);

  const triggerAction = (e) => {
    if (e) {
      if (e.stopPropagation) e.stopPropagation();
      if (e.preventDefault) e.preventDefault();
    }

    // Analytics: Click
    trackEvent('click', channelId, product?.id || 0);

    // 1. Context Check (PRO/Lite Logic)
    // If it's a product page or a listing card, we use the Order Modal
    const isProductContext = !!(product?.id || manualData?.id || (product?.name && product?.url));

    // If it's a global context (Homepage, Blog, etc.) and NOT a product/listing
    // The user wants an immediate redirect to contact - skip the modal
    if (!isProductContext) {
      // Find the best channel to redirect to
      let targetId = channelId || 'global';
      if (targetId === 'global') {
        const activeChannels = settings.activeChannels || [];
        targetId = activeChannels.find(id => id === 'whatsapp')
                || activeChannels.find(id => id === 'zalo')
                || activeChannels.find(id => id === 'messenger')
                || activeChannels[0];
      }

      if (targetId) {
        const link = getChannelLink(targetId, settings, product, manualData);
        if (link !== '#') window.open(link, '_blank');
      }
      return;
    }

    const modalEnabled = settings.orderModal_enabled !== false;
    const allowRepeat = !!settings.orderModal_allowRepeat && String(settings.orderModal_allowRepeat) !== 'false';

    // Standard product/listing context below - use modal if enabled
    if (!modalEnabled || (hasSubmitted && !allowRepeat)) {
      const link = getChannelLink(channelId === 'global' ? 'whatsapp' : channelId, settings, product, manualData);
      if (link !== '#') window.open(link, '_blank');
      return;
    }

    setIsModalOpen(true);
  };

  const handleModalSubmit = async (formData) => {
    try {
      const response = await fetch(`${payload.apiUrl}connections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': payload.nonce
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const productId = product?.id || 'manual';
        const variationId = product?.variation_id || 0;
        const submissionKey = `${channelId}|${productId}|${variationId}`;
        
        localStorage.setItem(`vibebuy_submitted_${submissionKey}`, 'true');
        setHasSubmitted(true);
        return true;
      }
    } catch (error) {
      console.error('Failed to submit connection:', error);
    }
    return false;
  };

  const handleModalClose = (proceedToChat) => {
    setIsModalOpen(false);
    
    if (!proceedToChat) return;

    // Omnichannel (Pro) logic: 
    // If it's a global lead button, find the best channel to redirect to
    if (channelId === 'global' || channelId === 'whatsapp' || channelId === 'zalo' || channelId === 'messenger') {
      const activeChannels = settings.activeChannels || [];
      
      // Determine which channel to open
      let targetId = channelId;
      if (targetId === 'global') {
        // Priority: whatsapp > zalo > messenger > others
        targetId = activeChannels.find(id => id === 'whatsapp')
                || activeChannels.find(id => id === 'zalo')
                || activeChannels.find(id => id === 'messenger')
                || activeChannels[0];
      }

      if (targetId) {
        const link = getChannelLink(targetId, settings, product, manualData);
        if (link !== '#') window.open(link, '_blank');
      }
    }
  };

  return { isModalOpen, triggerAction, handleModalSubmit, handleModalClose, hasSubmitted };
};

const SocialShortcutBar = ({ settings, channels, position, productData }) => {
  if (!channels || channels.length === 0) return null;

  const isLeft = position === 'bottom-left';
  
  return (
    <div 
      className={`fixed z-[9998] flex flex-col gap-3 transition-all duration-300 ${isLeft ? 'bottom-24 left-6 slide-in-from-left-4' : 'bottom-24 right-6 slide-in-from-right-4'}`}
    >
      {channels.map(id => {
        const ch = window.vibebuyWidgetData?.channels?.find(c => c.id === id);
        if (!ch) return null;
        
        const link = getChannelLink(id, settings, productData);
        if (link === '#') return null;

        return (
          <a
            key={id}
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent('click_shortcut', id, productData?.id || 0)}
            className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all text-white border-2 border-white"
            style={{ backgroundColor: ch.colorHex || '#1e293b' }}
            title={ch.name}
          >
             {settings[`${id}_iconUrl`] ? (
               <img src={settings[`${id}_iconUrl`]} alt={ch.name} className="w-5 h-5 object-cover rounded-full" />
             ) : (
                <div className="w-5 h-5 flex items-center justify-center scale-90">
                  {/* We use a static mapping or just the icon from the ch object if available */}
                  <img src={window.vibebuyWidgetData?.assetsUrl + 'icons/' + id + '.svg'} alt={id} className="w-5 h-5 invert brightness-0" 
                       onError={(e) => { e.target.style.display = 'none'; }} />
                </div>
             )}
          </a>
        );
      })}
    </div>
  );
};

const LeadButton = ({ settings, productData, manualData }) => {
  const { isModalOpen, triggerAction, handleModalSubmit, handleModalClose, hasSubmitted } = useOrderFlow(settings, 'global', productData, manualData);
  const strings = window.vibebuyWidgetData?.strings || {};

  const bgColor = settings.backgroundColor || '#22c55e';
  const textColor = settings.textColor || '#ffffff';
  const bRadius = settings.borderRadius !== undefined ? settings.borderRadius : 10;
  const layout = settings.buttonLayout || 'stacked';
  const bWidth = settings.width || (layout === 'inline' ? 'auto' : '100%');
  const bHeight = settings.height || 48;
  const fSize = settings.fontSize || 14;
  
  const allowRepeat = !!settings.orderModal_allowRepeat && String(settings.orderModal_allowRepeat) !== 'false';
  const isSubmitted = hasSubmitted && !allowRepeat;
  const isOutOfStock = productData && productData.is_in_stock === false;
  const bText = isOutOfStock
    ? 'Out of Stock'
    : isSubmitted
      ? (strings.alreadyRequested || 'Already Requested')
      : (settings.buttonText || 'Chat with us');
  const bIcon = settings.buttonIconUrl;

  const style = {
    backgroundColor: isOutOfStock ? '#d1d5db' : (isSubmitted ? '#9ca3af' : bgColor),
    color: isOutOfStock ? '#6b7280' : textColor,
    borderRadius: bRadius !== undefined ? `${bRadius}px` : '10px',
    cursor: (isSubmitted || isOutOfStock) ? 'not-allowed' : 'pointer',
    opacity: (isSubmitted || isOutOfStock) ? 0.8 : 1,
    width: bWidth === 'auto' ? 'auto' : (bWidth.toString().includes('%') ? bWidth : `${bWidth}px`),
    height: `${bHeight}px`,
    fontSize: `${fSize}px`,
  };

  if (!checkVisibility(settings, productData)) return null;
 
   return (
     <div style={{ width: style.width }} className="flex-shrink-0">
       <button 
         type="button"
         disabled={isSubmitted || isOutOfStock}
         onClick={(e) => !isOutOfStock && triggerAction(e)}
         style={style}
         className="w-full font-semibold px-4 flex items-center justify-center gap-2 transition-all shadow-sm hover:opacity-90 hover:scale-[1.01]"
       >
        {bIcon ? (
           <img src={bIcon} alt="Icon" className="w-5 h-5 rounded-full object-cover" />
        ) : (
           <MessageCircle className="w-5 h-5 fill-current" />
        )}
        <span className="truncate">{bText}</span>
      </button>

      <OrderModal 
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        channel={{ 
          id: 'global', 
          name: 'VibeBuy', 
          color: 'global', 
          icon: <MessageCircle /> 
        }}
        product={productData}
        userData={window.vibebuyWidgetData?.currentUser}
        settings={settings}
      />
    </div>
  );
};

const InlineChatButtons = ({ settings, productData, manualData }) => {
  return (
    <div className="vibebuy-inline-container font-sans mb-4">
      <LeadButton 
        settings={settings}
        productData={productData}
        manualData={manualData}
      />
    </div>
  );
};

const FloatingBubble = ({ settings, productData }) => {
  const { isModalOpen, triggerAction, handleModalSubmit, handleModalClose, hasSubmitted } = useOrderFlow(settings, 'global', productData, null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const activeChannels = settings.activeChannels || [];
  
  // Channels that should open directly (Social)
  const socialChannels = activeChannels.filter(id => 
    id === 'zalo' || id === 'tiktok' || id === 'instagram' || id === 'messenger' || id === 'viber' || id === 'line' || id === 'custom' || id === 'contact'
  );
  
  // Channels that follow the Order Flow (WhatsApp, Telegram, Discord)
  const orderChannels = activeChannels.filter(id => !socialChannels.includes(id));

  // Determine if we should show site-wide
  const isProductPage = !!productData;
  const isGlobalEnabled = settings.floatingSocial_enabled && settings.is_pro;
  
  // If not a product page and global contact is disabled, hide everything
  if (!isProductPage && !isGlobalEnabled) return null;
  if (!checkVisibility(settings, productData)) return null;

  const position = settings.floatingSocial_position || 'bottom-right';
  const isLeft = position === 'bottom-left';
  const customBgColor = settings.backgroundColor || '#6366f1';
  const customRadius = settings.borderRadius !== undefined ? `${settings.borderRadius}px` : '999px';

  const handleMainClick = (e) => {
    if (isGlobalEnabled && settings.floatingSocial_style === 'expanded') {
      setIsMenuOpen(!isMenuOpen);
    } else {
      triggerAction(e);
    }
  };

  return (
    <>
      {(isMenuOpen || (isGlobalEnabled && settings.floatingSocial_style === 'expanded' && !isProductPage)) && (
        <SocialShortcutBar 
          settings={settings} 
          channels={socialChannels} 
          position={position}
          productData={productData}
        />
      )}

      <div 
        className={`fixed bottom-6 z-[9999] flex flex-col items-end font-sans transition-all duration-300 ${isLeft ? 'left-6' : 'right-6'}`}
      >
        <div 
          className={`flex items-center justify-center shadow-xl cursor-pointer transform hover:scale-105 active:scale-95 transition-all text-white ${isProductPage && settings.buttonText ? 'px-5 py-3 gap-3' : 'w-14 h-14'}`}
          style={{ 
            backgroundColor: isProductPage ? customBgColor : (settings.floatingSocial_color || '#6366f1'),
            borderRadius: customRadius,
          }}
          onClick={handleMainClick}
        >
           {isMenuOpen ? <X className="w-6 h-6" /> : (
             settings.buttonIconUrl ? (
                <img src={settings.buttonIconUrl} alt="Icon" className="w-6 h-6 object-cover rounded-full shadow-sm" />
             ) : (
                <MessageCircle className="w-6 h-6 fill-current" />
             )
           )}

           {isProductPage && settings.buttonText && !isMenuOpen && (
              <span className="font-bold whitespace-nowrap">{settings.buttonText}</span>
           )}
        </div>
      </div>

      <OrderModal 
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        channel={{ id: 'global', name: 'VibeBuy', color: 'global', icon: <MessageCircle /> }}
        product={productData}
        userData={window.vibebuyWidgetData?.currentUser}
        settings={settings}
      />
    </>
  );
};

// Global Bootstrapper
const bootstrapWidget = () => {
  const payload = window.vibebuyWidgetData || {};
  const settings = payload.settings || { activeChannels: [] };
  const product = payload.product || null;
  
  if (!settings.activeChannels || settings.activeChannels.length === 0) return;

  // 1. Single Re-bootstrapper for WooCommerce context
  const scrapeWooBaseData = () => {
    const qtyInput = document.querySelector('input[name="quantity"], input.qty, .qty');
    const qty = qtyInput ? parseInt(qtyInput.value) : 1;

    const imgElement = document.querySelector('.woocommerce-product-gallery__image img, .wp-post-image, .attachment-shop_single');
    const image = imgElement ? imgElement.src : (product?.image || '');

    // Scrape selected variation attributes from dropdown
    let variationName = '';
    const variationForm = document.querySelector('.variations_form');
    if (variationForm) {
      const selectedAttrs = [];
      variationForm.querySelectorAll('select').forEach(select => {
        const val = select.value;
        if (val) {
          const label = document.querySelector(`label[for="${select.id}"]`)?.textContent || '';
          selectedAttrs.push(`${label.replace(':', '').trim()}: ${val}`);
        }
      });
      variationName = selectedAttrs.join(', ');
    }

    return { 
      ...product,
      qty: qty > 0 ? qty : 1,
      variation: variationName,
      image: image
    };
  };

  const currentProductRef = { current: product ? scrapeWooBaseData() : null };

  // Render all mounted roots with updated product data
  const rerenderAllWithProduct = (updatedProduct) => {
    currentProductRef.current = updatedProduct;
    mountedRoots.forEach(({ root, type, props, node }) => {
      if (type === 'inline') {
        root.render(<InlineChatButtons settings={settings} productData={updatedProduct} manualData={props.manualData} />);
      } else if (type === 'group') {
        root.render(
          <div className="vibebuy-inline-container font-sans mb-4">
            <LeadButton settings={settings} productData={updatedProduct} />
          </div>
        );
      } else if (type === 'floating') {
        root.render(<FloatingBubble settings={settings} productData={updatedProduct} />);
      }
    });
  };

  const mountedRoots = [];

  // Listen to WooCommerce variation events on the page
  const variationForm = document.querySelector('.variations_form');
  if (variationForm) {
    const handleFoundVariation = (variation) => {
      const varData = variation || {};

      // Match against our preloaded variation data from PHP
      const selectedVariationId = varData.variation_id || 0;
      const preloaded = (product?.variations || []).find(v => v.id === selectedVariationId);

      const updatedProduct = {
        ...currentProductRef.current,
        price: varData.display_price || preloaded?.price || product?.price,
        sku: varData.sku || preloaded?.sku || product?.sku,
        is_in_stock: varData.is_in_stock !== undefined ? varData.is_in_stock : (preloaded?.is_in_stock !== undefined ? preloaded.is_in_stock : true),
        stock_qty: preloaded?.stock_qty || null,
        variation_id: selectedVariationId,
        image: varData.image?.src || currentProductRef.current?.image || product?.image,
      };

      // Rebuild variation name from current selects
      const attrs = [];
      variationForm.querySelectorAll('select').forEach(sel => {
        if (sel.value) {
          const lbl = document.querySelector(`label[for="${sel.id}"]`)?.textContent?.replace(':', '').trim() || '';
          const opt = sel.options[sel.selectedIndex]?.textContent?.trim() || sel.value;
          attrs.push(`${lbl}: ${opt}`);
        }
      });
      updatedProduct.variation = attrs.join(', ');

      rerenderAllWithProduct(updatedProduct);
    };

    const handleResetData = () => {
      rerenderAllWithProduct({ ...scrapeWooBaseData(), is_in_stock: product?.is_in_stock, variation_id: 0 });
    };

    if (window.jQuery) {
      window.jQuery(variationForm).on('found_variation', (e, variation) => handleFoundVariation(variation));
      window.jQuery(variationForm).on('reset_data', handleResetData);
    } else {
      variationForm.addEventListener('found_variation', (e) => {
        const variation = e.detail || (e.originalEvent && e.originalEvent.detail);
        handleFoundVariation(variation);
      });
      variationForm.addEventListener('reset_data', handleResetData);
    }
  }

  // Listen to Quantity changes on the page
  const qtyInput = document.querySelector('input[name="quantity"]');
  if (qtyInput) {
    qtyInput.addEventListener('change', () => {
      const updated = { ...currentProductRef.current, qty: parseInt(qtyInput.value) || 1 };
      rerenderAllWithProduct(updated);
    });
    // Also listen for input event for real-time sync if user types
    qtyInput.addEventListener('input', () => {
      const updated = { ...currentProductRef.current, qty: parseInt(qtyInput.value) || 1 };
      rerenderAllWithProduct(updated);
    });
  }

  const currentProduct = currentProductRef.current;

  // 1. Single widget items
  const singleNodes = document.querySelectorAll('.vibebuy-inline-widget');
  singleNodes.forEach(node => {
    const isWoo = node.dataset.woo === 'true';
    const channelId = node.dataset.channel;
    const displayMode = node.dataset.display;

    const manualData = isWoo ? null : {
       name: node.dataset.name,
       price: node.dataset.price,
       phone: node.dataset.phone,
       channel: node.dataset.channel,
       qty: 1
    };

    const root = createRoot(node);
    root.render(
      <InlineChatButtons 
        settings={settings} 
        productData={isWoo ? currentProduct : null} 
        manualData={manualData} 
        channelId={channelId}
        displayMode={displayMode}
      />
    );
    if (isWoo) mountedRoots.push({ root, type: 'inline', props: { manualData } });
  });

  // 2. Grouped widget items (Simplified to one lead button)
  const groupNodes = document.querySelectorAll('.vibebuy-inline-widget-group');
  groupNodes.forEach(node => {
     const isWoo = node.dataset.woo === 'true';
     const root = createRoot(node);
     root.render(
        <div className="vibebuy-inline-container font-sans mb-4">
           <LeadButton 
              settings={settings}
              productData={isWoo ? currentProduct : null}
           />
        </div>
     );
     if (isWoo) mountedRoots.push({ root, type: 'group', props: {} });
  });

  // 3. New Loop Integration (PRO)
  const loopNodes = document.querySelectorAll('.vibebuy-loop-widget-root');
  loopNodes.forEach(node => {
     const loopProductData = {
        id: parseInt(node.dataset.productId || 0),
        name: node.dataset.productName || '',
        image: node.dataset.productImage || '',
        price: node.dataset.productPrice || '',
        url: node.dataset.productUrl || '',
        currency: product?.currency || '$'
     };
     
     const root = createRoot(node);
     root.render(
        <div className="vibebuy-loop-button-wrapper font-sans">
           <LeadButton 
              settings={settings}
              productData={loopProductData}
           />
        </div>
     );
  });

  // 4. Floating Bubble
  const floatingContainer = document.getElementById('vibebuy-widget-root');
  if (floatingContainer) {
    const root = createRoot(floatingContainer);
    mountedRoots.push({ root, type: 'floating', props: {} });
    
    const allInlineNodes = document.querySelectorAll('.vibebuy-inline-widget, .vibebuy-inline-widget-group');
    if (allInlineNodes.length > 0) {
      const observer = new IntersectionObserver((entries) => {
        const isSomeInlineVisible = entries.some(entry => entry.isIntersecting);
        if (isSomeInlineVisible) {
          root.render(<div />);
        } else {
          root.render(<FloatingBubble settings={settings} productData={currentProductRef.current} />);
        }
      });
      
      allInlineNodes.forEach(node => observer.observe(node));
    } else {
      root.render(<FloatingBubble settings={settings} productData={currentProductRef.current} />);
    }
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrapWidget);
} else {
  bootstrapWidget();
}
