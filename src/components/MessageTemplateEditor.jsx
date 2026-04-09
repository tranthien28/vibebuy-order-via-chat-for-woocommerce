import React, { useRef, useState } from 'react';
import { MessageSquare, Hash, Search, RotateCcw } from 'lucide-react';

// ─── Available Tags ────────────────────────────────────────────
const TAGS = {
  '📦 Product': [
    { tag: '{{product_name}}',      desc: 'Name' },
    { tag: '{{product_id}}',        desc: 'Product ID' },
    { tag: '{{product_price}}',     desc: 'Price' },
    { tag: '{{product_sale_price}}',desc: 'Sale Price' },
    { tag: '{{product_qty}}',       desc: 'Qty requested' },
    { tag: '{{product_url}}',       desc: 'Link' },
    { tag: '{{product_sku}}',       desc: 'SKU (PRO)' },
    { tag: '{{product_variation}}', desc: 'Variation (PRO)' },
  ],
  '👤 Customer': [
    { tag: '{{full_name}}',      desc: 'Full Name' },
    { tag: '{{first_name}}',     desc: 'First Name' },
    { tag: '{{phone}}',          desc: 'Phone' },
    { tag: '{{email}}',          desc: 'Email' },
    { tag: '{{customer_country}}', desc: 'Country (PRO)' },
    { tag: '{{customer_device}}',  desc: 'Device/OS (PRO)' },
  ],
  '🏢 Store & Order': [
    { tag: '{{site_name}}',  desc: 'Name' },
    { tag: '{{site_url}}',   desc: 'URL' },
    { tag: '{{order_id}}',   desc: 'Order ID' },
    { tag: '{{order_url}}',  desc: 'Order URL' },
    { tag: '{{order_total}}',desc: 'Order Total' },
    { tag: '{{message}}',    desc: 'Customer Message' },
  ],
  '💎 Custom Fields (PRO)': [
    { tag: '{{custom_address}}', desc: 'Address (PRO)' },
    { tag: '{{custom_size}}',    desc: 'Size (PRO)' },
    { tag: '{{custom_color}}',   desc: 'Color (PRO)' },
    { tag: '{{custom_image}}',   desc: 'Uploaded Image (PRO)' },
  ],
};

const DEFAULT_TEMPLATE = `Admin! 🛒 New Product Inquiry!
Customer: {{full_name}}
Phone: {{phone}}
Product: {{product_name}}
ID: {{product_id}}
SKU: {{product_sku}}
Quantity: {{product_qty}}
Price: {{product_price}}
Link: {{product_url}}
---
VibeBuy connect
---`;

// ─── Component ─────────────────────────────────────────────────
const MessageTemplateEditor = ({ value, onChange, isPro }) => {
  const textareaRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState('');

  const templateValue = value ?? DEFAULT_TEMPLATE;

  const insertTag = (tag) => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const newVal = templateValue.slice(0, start) + tag + templateValue.slice(end);
    onChange(newVal);
    requestAnimationFrame(() => {
      el.focus();
      el.selectionStart = el.selectionEnd = start + tag.length;
    });
  };

  // Filter tags based on search
  const filteredTags = Object.entries(TAGS).map(([group, tags]) => {
    const matched = tags.filter(t => 
      t.tag.toLowerCase().includes(searchTerm.toLowerCase()) || 
      t.desc.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return [group, matched];
  }).filter(([_, tags]) => tags.length > 0);

  return (
    <div className="vb-template-editor-pro">
      {/* 1. Left Section: Message Content (60%) */}
      <div className="vb-template-editor-main">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-gray-400" />
            <label className="text-sm font-bold text-gray-700">Compose Message</label>
          </div>
          <button
            type="button"
            onClick={() => onChange(DEFAULT_TEMPLATE)}
            className="flex items-center gap-1.5 text-xs text-blue-500 hover:text-blue-700 font-bold transition-colors"
          >
            <RotateCcw className="w-3 h-3" /> Reset Template
          </button>
        </div>

        <div className="vb-template-luxury-card">
          <textarea
            ref={textareaRef}
            value={templateValue}
            onChange={e => onChange(e.target.value)}
            className="vb-template-textarea-luxury"
            placeholder="Type your admin notification here..."
            spellCheck={false}
          />
          <div className="vb-template-luxury-footer">
            <div className="flex items-center gap-4">
              <span className="text-[11px] font-bold text-gray-400 uppercase letter-spacing-wider">
                {templateValue.length} characters
              </span>
              <div className="h-3 w-px bg-gray-200" />
              <span className="text-[10px] text-gray-400 italic">Formatting: WhatsApp/Telegram bold (*text*) supported</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Right Section: Search & Tags (40%) */}
      <div className="vb-template-sidebar">
        <div className="vb-tag-section-luxury">
          <div className="flex items-center gap-2 mb-4">
            <Hash className="w-5 h-5 text-blue-500" />
            <h3 className="text-sm font-bold text-gray-800">Available Tags</h3>
            <span className="ml-auto text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">ADMIN</span>
          </div>

          {/* Search */}
          <div className="vb-tag-search-container">
            <Search className="vb-tag-search-icon w-4 h-4" />
            <input
              type="text"
              className="vb-tag-search-input"
              placeholder="Filter tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Tag List (Scrollable) */}
          <div className="vb-tag-grid-scroll">
            {filteredTags.map(([group, tags]) => (
              <div key={group} className="vb-tag-group-luxury">
                <div className="vb-tag-group-label">{group}</div>
                <div className="vb-tag-list-luxury">
                  {tags.map(({ tag, desc }) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => insertTag(tag)}
                      className="vb-tag-chip-luxury group"
                    >
                      <code className="vb-tag-chip-code">{tag}</code>
                      <span className="vb-tag-chip-desc">
                        {desc.replace('(PRO)', '').trim()}
                        {(desc.includes('(PRO)') && !isPro) && (
                          <span className="ml-1.5 bg-amber-400 text-white text-[8px] font-black px-1.5 py-0.5 rounded shadow-sm">PRO</span>
                        )}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
            {filteredTags.length === 0 && (
              <div className="text-center py-12 text-gray-400 text-sm italic">
                No tags match your search.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageTemplateEditor;
