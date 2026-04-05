import React from 'react';
import { X, Shield, ArrowRight, ExternalLink } from 'lucide-react';
import BenefitList from './BenefitList.jsx';
import PricingTable from './PricingTable.jsx';

const ProUpgradeModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="vb-modal-overlay" onClick={onClose}>
      <div 
        className="vb-modal-container bg-white rounded-2xl overflow-hidden shadow-2xl relative max-w-4xl w-full mx-4"
        onClick={e => e.stopPropagation()}
      >
        {/* CLOSE BUTTON */}
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-gray-100 transition-colors z-50 text-gray-400"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col md:flex-row">
          {/* LEFT SIDE: BENEFITS */}
          <div className="md:w-[320px] bg-gray-50/80 p-6 border-r border-gray-100 flex flex-col justify-between">
            <BenefitList />
            
            <div className="mt-4 flex items-center justify-center gap-3 py-2 bg-white border border-gray-100 rounded-xl shadow-sm">
                <Shield className="w-4 h-4 text-green-500" />
                <p className="text-[9px] font-bold text-gray-700 uppercase tracking-widest text-center">
                  14-Day Money Back Guarantee
                </p>
            </div>
          </div>

          {/* RIGHT SIDE: PRICING & CTA */}
          <div className="flex-1 p-6 text-center flex flex-col justify-between">
            <div>
              <div className="inline-block px-3 py-1 bg-purple-100 rounded-full mb-2">
                <p className="text-[10px] font-extrabold text-purple-600 uppercase tracking-widest">VibeBuy Pro</p>
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-1">Modernize Your Store</h2>
              <p className="text-[11px] text-gray-500 mb-4 px-6">
                Upgrade to vibeBuy PRO and start converting your social traffic into loyal customers 
                with high-end messaging automation.
              </p>

              <PricingTable />
            </div>

            <div className="mt-6">
              <button 
                onClick={() => window.open('https://vibebuy.lemonsqueezy.com/checkout/buy/pro-version', '_blank')}
                className="vb-upgrade-cta-btn group py-3 text-sm"
              >
                Get Pro Access Now <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              
              {/* SOCIAL PROOF */}
              <div className="mt-3 flex flex-col items-center gap-1.5">
                <p className="text-[10px] font-bold text-gray-400">
                  Joined by 500+ Top Sellers using VibeBuy
                </p>
                <div className="flex -space-x-1.5">
                  {[1,2,3,4,5].map(i => (
                    <img 
                      key={i} 
                      className="w-5 h-5 rounded-full border-2 border-white shadow-sm" 
                      src={`https://i.pravatar.cc/100?img=${i+10}`} 
                      alt="User avatar" 
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProUpgradeModal;
