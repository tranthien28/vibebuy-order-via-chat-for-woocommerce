import React, { useState } from 'react';
import { 
  Send, Hash, MessageSquare, ChevronRight, 
  ExternalLink, CheckCircle2, 
  AlertCircle, Lock, Layout, Camera, Music, Link2, Mail, MessageCircle, Target, HelpCircle
} from 'lucide-react';

const HelpView = ({ onNavigate, initialSection }) => {
  const [activeTab, setActiveTab] = useState(initialSection || 'overview');

  const tabs = [
    { id: 'overview', name: 'Plugin Overview', icon: <Target className="w-4 h-4" /> },
    { id: 'general', name: 'General Guide', icon: <Layout className="w-4 h-4" /> },
    { id: 'whatsapp', name: 'WhatsApp', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'telegram', name: 'Telegram', icon: <Send className="w-4 h-4" /> },
    { id: 'discord', name: 'Discord', icon: <Hash className="w-4 h-4" /> },
    { id: 'messenger', name: 'Messenger', icon: <MessageCircle className="w-4 h-4" />, pro: true },
    { id: 'zalo', name: 'Zalo', icon: <MessageSquare className="w-4 h-4" />, pro: true },
    { id: 'viber', name: 'Viber', icon: <MessageSquare className="w-4 h-4" />, pro: true },
    { id: 'instagram', name: 'Instagram', icon: <Camera className="w-4 h-4" />, pro: true },
    { id: 'tiktok', name: 'TikTok', icon: <Music className="w-4 h-4" />, pro: true },
    { id: 'line', name: 'LINE', icon: <MessageCircle className="w-4 h-4" />, pro: true },
    { id: 'contact', name: 'Contact Form', icon: <Mail className="w-4 h-4" />, pro: true },
    { id: 'custom', name: 'Custom Link', icon: <Link2 className="w-4 h-4" />, pro: true },
    { id: 'templates', name: 'UI Overrides', icon: <Layout className="w-4 h-4" /> },
    { id: 'faq', name: 'FAQ', icon: <HelpCircle className="w-4 h-4" /> }
  ];

    const renderTutorial = () => {
      const currentTab = tabs.find(t => t.id === activeTab);
      
      const proBadge = currentTab?.pro ? (
        <div className="mb-6 flex items-center gap-2 bg-amber-50 text-amber-600 px-4 py-2 rounded-xl border border-amber-100 w-fit">
          <Lock className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-widest">Pro Feature</span>
          <span className="text-xs">This channel is available in VibeBuy Pro.</span>
        </div>
      ) : null;

      switch (activeTab) {
        case 'overview':
          return (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Target className="w-6 h-6 text-blue-500" />
                Purpose & Feature Scope
              </h3>
              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <h4 className="font-bold text-gray-800 mb-3">Plugin Purpose</h4>
                  <p className="text-sm text-gray-600 leading-relaxed mb-4">
                    VibeBuy displays <b>a single button on the frontend</b> to help customers easily request consultation instead of going through a long 'add to cart' process. When clicked, the system opens a popup modal to <b>collect basic information (leads)</b> from the customer.
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <h4 className="font-bold text-gray-800 mb-3">Feature Scope</h4>
                  <ul className="space-y-4 text-sm text-gray-600">
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                      <span><b>Notifications Flow:</b> After the form is submitted, the system automatically sends a push notification to the administrator via the configured channels (e.g., via App or Server SDK). The frontend behavior is completely silent and just displays a Success message.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                      <span><b>WhatsApp Lite Exception:</b> Specifically for <b>WhatsApp on VibeBuy Lite</b>, after the customer successfully submits the form, a direct link popup (wa.me/number) is triggered to redirect the customer to send the message themselves. In the Pro version, WhatsApp points directly through the Business SDK API in the background, exactly like Telegram/Discord.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                      <span><b>Lite vs Pro Limitations:</b> In the <b>Lite</b> version, the plugin scope is pinned to activating only <b>1 channel</b> to receive data at a time. The <b>Pro</b> architecture allows enabling multiple channels simultaneously. Every enabled channel will receive a server-to-server push notification whenever there is a new lead.</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm border-l-4 border-l-amber-500">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] font-black bg-amber-500 text-white px-2 py-0.5 rounded shadow-sm">PRO</span>
                    <h4 className="font-bold text-gray-800">Advanced Shortcode Usage</h4>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed mb-4">
                    The <code>[vibebuy_button]</code> shortcode is entirely locked to <b>VibeBuy Pro</b>. You can use it to render a custom chat button anywhere on a page using the following attributes:
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600 font-mono bg-gray-50 p-4 rounded-xl text-[12px] border border-gray-100 shadow-inner">
                    <li><span className="text-blue-600 font-bold">channel</span>: target channel slug (e.g. "whatsapp", "zalo", "messenger", "global")</li>
                    <li><span className="text-blue-600 font-bold">text</span>: override the button text (e.g. text="Buy Now")</li>
                    <li><span className="text-blue-600 font-bold">product_name</span>: override the context name (automatic by default)</li>
                    <li><span className="text-blue-600 font-bold">width</span>: hardcode width (e.g. width="250px" or "100%")</li>
                    <li><span className="text-blue-600 font-bold">theme</span>: layout theme (e.g. "light" or "dark")</li>
                  </ul>
                  <p className="text-xs text-gray-400 leading-relaxed mt-4 italic">
                    Note: "product_id" and "quantity" aren't required as attributes since the unified popup always allows the customer to define the inquiry quantity context visually before the backend receives it.
                  </p>
                </div>
              </div>
            </div>
          );
        case 'general':
          return (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {proBadge}
            <h3 className="text-xl font-black text-gray-900 mb-6">Mastering VibeBuy Setup</h3>
            <div className="grid grid-cols-1 gap-12">
               <div className="group border-b border-gray-100 pb-8 last:border-0">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center text-xs font-bold">1</span>
                    <h4 className="font-bold text-gray-800">Connection & API</h4>
                  </div>
                  <div className="w-full h-48 bg-gray-50 rounded-2xl flex items-center justify-center mb-4 border border-dashed border-gray-200">
                    <Layout className="w-8 h-8 text-purple-200" />
                  </div>
                  <p className="text-sm text-gray-500">Choose your channels and enter tokens or webhook URLs to get started.</p>
               </div>
               <div className="group border-b border-gray-100 pb-8 last:border-0">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-xs font-bold">2</span>
                    <h4 className="font-bold text-gray-800">Design Customization</h4>
                  </div>
                  <div className="w-full h-48 bg-gray-50 rounded-2xl flex items-center justify-center mb-4 border border-dashed border-gray-200">
                    <Layout className="w-8 h-8 text-blue-200" />
                  </div>
                  <p className="text-sm text-gray-500">Customize Layout, Palette, Targets, colors, and button positions to match your branding perfectly.</p>
               </div>
               <div className="group border-b border-gray-100 pb-8 last:border-0">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="w-6 h-6 bg-green-100 text-green-600 rounded-lg flex items-center justify-center text-xs font-bold">3</span>
                    <h4 className="font-bold text-gray-800">Display Logic</h4>
                  </div>
                  <div className="w-full h-48 bg-gray-50 rounded-2xl flex items-center justify-center mb-4 border border-dashed border-gray-200">
                    <Layout className="w-8 h-8 text-green-200" />
                  </div>
                  <p className="text-sm text-gray-500">Define where buttons appear (Product Pages, Cart, or Global) and set visibility rules.</p>
               </div>
            </div>
          </div>
        );
      case 'telegram':
        return (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {proBadge}
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Send className="w-6 h-6 text-blue-500" />
              Setting up Telegram Bot
            </h3>
            
            <div className="w-full h-48 bg-blue-50/50 rounded-2xl flex items-center justify-center mb-8 border border-dashed border-blue-100">
              <Send className="w-10 h-10 text-blue-200" />
            </div>

            <div className="space-y-8">
              <div className="relative pl-10">
                <div className="absolute left-0 top-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">1</div>
                <h4 className="font-bold text-gray-800 mb-2">Create a Bot via @BotFather</h4>
                <p className="text-sm text-gray-500 leading-relaxed max-w-xl">
                  Open Telegram and search for <a href="https://t.me/BotFather" target="_blank" className="text-blue-500 hover:underline font-medium">@BotFather</a>. 
                  Send <code className="bg-gray-100 px-1.5 py-0.5 rounded text-blue-600">/newbot</code> and follow the instructions to get your <b>Bot Token</b>.
                </p>
              </div>

              <div className="relative pl-10">
                <div className="absolute left-0 top-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">2</div>
                <h4 className="font-bold text-gray-800 mb-2">Get your Personal Chat ID</h4>
                <p className="text-sm text-gray-500 leading-relaxed max-w-xl">
                  Search for <a href="https://t.me/userinfobot" target="_blank" className="text-blue-500 hover:underline font-medium">@userinfobot</a> and send any message. 
                  It will reply with your <b>Chat ID</b>.
                </p>
                <div className="mt-4 p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                  <p className="text-xs text-amber-800 italic">
                    <b>Important:</b> Start a chat with your new Bot first so it can message you!
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      case 'discord':
        return (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {proBadge}
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Hash className="w-6 h-6 text-[#5865F2]" />
              Setting up Discord Webhooks
            </h3>
            
            <div className="w-full h-48 bg-indigo-50/50 rounded-2xl flex items-center justify-center mb-8 border border-dashed border-indigo-100">
              <Hash className="w-10 h-10 text-indigo-200" />
            </div>

            <div className="space-y-8">
              <div className="relative pl-10">
                <div className="absolute left-0 top-0 w-8 h-8 bg-indigo-100 text-[#5865F2] rounded-full flex items-center justify-center font-bold text-sm">1</div>
                <h4 className="font-bold text-gray-800 mb-2">Open Server Settings</h4>
                <p className="text-sm text-gray-500 leading-relaxed max-w-xl">
                  In Discord, click the channel settings (Gear icon) where you want notifications.
                </p>
              </div>

              <div className="relative pl-10">
                <div className="absolute left-0 top-0 w-8 h-8 bg-indigo-100 text-[#5865F2] rounded-full flex items-center justify-center font-bold text-sm">2</div>
                <h4 className="font-bold text-gray-800 mb-2">Integrations & Webhooks</h4>
                <p className="text-sm text-gray-500 leading-relaxed max-w-xl">
                  Select <b>Integrations</b> &gt; <b>Webhooks</b>. Create a "New Webhook" and click <b>Copy Webhook URL</b>.
                </p>
              </div>
            </div>
          </div>
        );
      case 'whatsapp':
        return (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             {proBadge}
             <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <MessageSquare className="w-6 h-6 text-green-500" />
                    WhatsApp Number Format
                </h3>
             </div>

             <div className="w-full h-48 bg-green-50/50 rounded-2xl flex items-center justify-center mb-8 border border-dashed border-green-100">
                <MessageSquare className="w-10 h-10 text-green-200" />
             </div>
            
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 mb-8">
                <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    Use International Format
                </h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                    Always include the country code but <b>DO NOT</b> include +, spaces, or leading zeros. 
                    Correct example: <code className="bg-white px-2 py-1 rounded text-green-600 font-bold border border-green-100">15550123456</code>
                </p>
            </div>
          </div>
        );
      case 'templates':
        return (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {proBadge}
            <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
              <Layout className="w-6 h-6 text-purple-500" />
              Customizing the Order Modal
            </h3>
            
            <div className="prose prose-sm max-w-none text-gray-500 space-y-6">
              <div className="bg-purple-50 border border-purple-100 rounded-2xl p-5 text-purple-900">
                <h4 className="flex items-center gap-2 font-bold mb-2">
                  <CheckCircle2 className="w-4 h-4" /> 
                  How to Override
                </h4>
                <p className="text-sm">
                  Copy <code className="bg-white/50 px-1 rounded">plugins/vibebuy-order-connect-lite/templates/order-modal.php</code> <br/> 
                  to <code className="bg-white/50 px-1 rounded">themes/your-theme/vibebuy/order-modal.php</code>
                </p>
              </div>

              <div>
                <h4 className="font-bold text-gray-800 mb-2">Required Slot IDs</h4>
                <p className="mb-4">React injects the interface into these specific IDs. Ensure your custom template includes them:</p>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div className="bg-gray-50 p-2 rounded border border-gray-100">#vibe-slot-image</div>
                  <div className="bg-gray-50 p-2 rounded border border-gray-100">#vibe-slot-product-name</div>
                  <div className="bg-gray-50 p-2 rounded border border-gray-100">#vibe-slot-product-price</div>
                  <div className="bg-gray-50 p-2 rounded border border-gray-100">#vibe-slot-quantity</div>
                  <div className="bg-gray-50 p-2 rounded border border-gray-100">#vibe-slot-field-name</div>
                  <div className="bg-gray-50 p-2 rounded border border-gray-100">#vibe-slot-field-email</div>
                  <div className="bg-gray-50 p-2 rounded border border-gray-100">#vibe-slot-field-phone</div>
                  <div className="bg-gray-50 p-2 rounded border border-gray-100">#vibe-slot-field-message</div>
                  <div className="bg-gray-50 p-2 rounded border border-gray-100">#vibe-slot-submit</div>
                  <div className="bg-gray-50 p-2 rounded border border-gray-100">#vibe-slot-success</div>
                </div>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                <p className="text-xs text-amber-800 italic">
                  <b>Pro Tip:</b> You can rearrange the Layout, Palette, Target, but do not remove these IDs or the modal logic will break. 
                  The modal uses <b>Tailwind CSS</b> for styling.
                </p>
              </div>
            </div>
          </div>
        );
      case 'messenger':
        return (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {proBadge}
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-[#0084FF]" />
              Setting up Facebook Messenger
            </h3>
            <div className="space-y-8">
              <div className="relative pl-10">
                <div className="absolute left-0 top-0 w-8 h-8 bg-blue-100 text-[#0084FF] rounded-full flex items-center justify-center font-bold text-sm">1</div>
                <h4 className="font-bold text-gray-800 mb-2">Find Your Facebook Page ID</h4>
                <p className="text-sm text-gray-500 leading-relaxed max-w-xl">
                  Go to your Facebook Page, click on <b>About</b>, then <b>Page Transparency</b> to view your <b>Page ID</b>. You can also directly enter your Facebook Page URL (e.g. facebook.com/pagename).
                </p>
              </div>
            </div>
          </div>
        );
      case 'viber':
        return (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {proBadge}
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-[#7360F2]" />
              Setting up Viber Chat
            </h3>
            <div className="space-y-8">
              <div className="relative pl-10">
                <div className="absolute left-0 top-0 w-8 h-8 bg-[#7360F2]/10 text-[#7360F2] rounded-full flex items-center justify-center font-bold text-sm">1</div>
                <h4 className="font-bold text-gray-800 mb-2">Create a Viber Bot / Enter Number</h4>
                <p className="text-sm text-gray-500 leading-relaxed max-w-xl">
                  You can enter your personal phone number registered with Viber, or create a Viber Bot account via the <b>Viber Partner Network</b> and retrieve the Bot ID / Token.
                </p>
              </div>
            </div>
          </div>
        );
      case 'zalo':
        return (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {proBadge}
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-[#0068FF]" />
              Setting up Zalo Connect
            </h3>
            <div className="space-y-8">
               <div className="relative pl-10">
                <div className="absolute left-0 top-0 w-8 h-8 bg-blue-100 text-[#0068FF] rounded-full flex items-center justify-center font-bold text-sm">1</div>
                <h4 className="font-bold text-gray-800 mb-2">Get your Zalo Phone or OA ID</h4>
                <p className="text-sm text-gray-500 leading-relaxed max-w-xl">
                  You can use either your <b>Personal Phone Number</b> registered with Zalo (e.g. 0912345678) or your <b>Official Account ID</b>. 
                </p>
              </div>
            </div>
          </div>
        );
      case 'instagram':
        return (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {proBadge}
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Camera className="w-6 h-6 text-[#E1306C]" />
              Setting up Instagram
            </h3>
            <div className="space-y-8">
               <div className="relative pl-10">
                <div className="absolute left-0 top-0 w-8 h-8 bg-pink-100 text-[#E1306C] rounded-full flex items-center justify-center font-bold text-sm">1</div>
                <h4 className="font-bold text-gray-800 mb-2">Get your Instagram Username</h4>
                <p className="text-sm text-gray-500 leading-relaxed max-w-xl">
                  Simply enter your Instagram App username (without the @ symbol). This will redirect customers to ig.me/m/yourusername to start a direct message.
                </p>
              </div>
            </div>
          </div>
        );
      case 'tiktok':
        return (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {proBadge}
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Music className="w-6 h-6 text-black" />
              Setting up TikTok
            </h3>
            <div className="space-y-8">
               <div className="relative pl-10">
                <div className="absolute left-0 top-0 w-8 h-8 bg-gray-200 text-black rounded-full flex items-center justify-center font-bold text-sm">1</div>
                <h4 className="font-bold text-gray-800 mb-2">Get your TikTok Username</h4>
                <p className="text-sm text-gray-500 leading-relaxed max-w-xl">
                  Enter your TikTok profile username. Clicking the button will open your TikTok profile directly in the app.
                </p>
              </div>
            </div>
          </div>
        );
      case 'line':
        return (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {proBadge}
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <MessageCircle className="w-6 h-6 text-[#00C300]" />
              Setting up LINE
            </h3>
            <div className="space-y-8">
               <div className="relative pl-10">
                <div className="absolute left-0 top-0 w-8 h-8 bg-green-100 text-[#00C300] rounded-full flex items-center justify-center font-bold text-sm">1</div>
                <h4 className="font-bold text-gray-800 mb-2">Get your LINE ID</h4>
                <p className="text-sm text-gray-500 leading-relaxed max-w-xl">
                  Enter your LINE Official Account ID or personal LINE ID. The plugin uses line.me/ti/p/ to initiate a chat with your account.
                </p>
              </div>
            </div>
          </div>
        );
      case 'custom':
        return (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {proBadge}
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Link2 className="w-6 h-6 text-purple-600" />
              Setting up Custom Link
            </h3>
            <div className="space-y-8">
               <div className="relative pl-10">
                <div className="absolute left-0 top-0 w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold text-sm">1</div>
                <h4 className="font-bold text-gray-800 mb-2">Add Any Destination URL</h4>
                <p className="text-sm text-gray-500 leading-relaxed max-w-xl">
                  You can use the Custom channel to redirect users to <b>any URL</b> (e.g. your support portal, a Google Form, or another platform). Simply paste the full URL including https://.
                </p>
              </div>
            </div>
          </div>
        );
      case 'contact':
        return (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {proBadge}
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Mail className="w-6 h-6 text-gray-700" />
              Setting up Contact Form Email
            </h3>
            <div className="space-y-8">
               <div className="relative pl-10">
                <div className="absolute left-0 top-0 w-8 h-8 bg-gray-200 text-gray-700 rounded-full flex items-center justify-center font-bold text-sm">1</div>
                <h4 className="font-bold text-gray-800 mb-2">Email Notifications</h4>
                <p className="text-sm text-gray-500 leading-relaxed max-w-xl">
                  The Contact channel will send an email to the admin with the customer's inquiry details. Ensure that your WordPress mail settings are configured correctly (e.g., via an SMTP plugin).
                </p>
              </div>
            </div>
          </div>
        );
      case 'faq':
        return (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <HelpCircle className="w-6 h-6 text-purple-500" />
              Frequently Asked Questions (FAQ)
            </h3>
            <div className="space-y-4">
              
              <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                <h4 className="font-bold text-gray-800 mb-2">Can I use this plugin without WooCommerce?</h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Yes! Although heavily optimized for WooCommerce product integration, you can render connection buttons anywhere using global visibility rules or via direct overrides.
                </p>
              </div>

              <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                <h4 className="font-bold text-gray-800 mb-2">How do I test my bot/app integration?</h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  We highly recommend enabling Test Mode or viewing a Live Preview from Global Settings. Try interacting with the form itself to verify the tokens and API URLs.
                </p>
              </div>

              <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                <h4 className="font-bold text-gray-800 mb-2">Where does the "Inquiries" data go?</h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  A copy of the inquiry data from customers is saved to your WordPress database before being forwarded to your selected messaging channel. You can view them anytime via the 'Inquiries' tab on the Admin dashboard.
                </p>
              </div>

              <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                <h4 className="font-bold text-gray-800 mb-2">Why are some channels locked with a Pro badge?</h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Advanced APIs, direct server-to-server routing to certain apps (like TikTok, Messenger API), and statistical reporting are available to VibeBuy Pro users to cover advanced maintenance.
                </p>
              </div>

            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar Tabs */}
        <div className="w-full lg:w-[260px] shrink-0 space-y-1.5">
          <div className="px-2 mb-4">
             <h3 className="text-[11px] font-black uppercase text-gray-400 tracking-[0.2em] mb-1">Knowledge Hub</h3>
             <p className="text-[10px] text-gray-400 font-medium italic">Select a topic below</p>
          </div>
          
          <div className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all group
                  ${activeTab === tab.id 
                    ? 'bg-white text-blue-600 shadow-md shadow-blue-100/50 border border-blue-50' 
                    : 'text-gray-400 hover:text-gray-600 hover:bg-white/50'}
                `}
              >
                <div className={`p-2 rounded-xl transition-colors ${activeTab === tab.id ? 'bg-blue-50 text-blue-600' : 'bg-gray-100/50 text-gray-400 group-hover:bg-gray-100 group-hover:text-gray-500'}`}>
                  {React.cloneElement(tab.icon, { className: "w-4 h-4" })}
                </div>
                <span className="text-[13px] tracking-tight">{tab.name}</span>
                {tab.pro && (
                  <div className="ml-auto">
                    <Lock className="w-3 h-3 text-amber-400 opacity-60" />
                  </div>
                )}
                {!tab.pro && activeTab === tab.id && <ChevronRight className="w-4 h-4 ml-auto opacity-40" />}
              </button>
            ))}
          </div>
          
          <div className="pt-8 px-2">
             <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[24px] p-5 text-white shadow-xl shadow-indigo-100 relative overflow-hidden group/docs">
                <div className="relative z-10">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-2">Extended Docs</p>
                  <p className="text-[11px] font-bold leading-relaxed mb-4 opacity-90">Deep dive into advanced hooks and API integrations.</p>
                  <button className="w-full py-2.5 bg-white text-indigo-600 hover:bg-indigo-50 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg">
                      Open Portal <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
                {/* Decorative Circles */}
                <div className="absolute -top-10 -right-10 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover/docs:scale-150 transition-transform duration-700" />
             </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-h-[500px]">
          <div className="vb-section-card h-full p-10 lg:p-12 animate-in fade-in slide-in-from-right-4 duration-500">
            {renderTutorial()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpView;
