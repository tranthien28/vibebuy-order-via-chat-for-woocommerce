/**
 * WhatsApp Channel - JS Module
 * icon, name, color, defaults, ConfigStep
 */
import React from 'react';
import { Phone } from 'lucide-react';
import ConfigStep from './ConfigStep.jsx';

const whatsapp = {
  id: 'whatsapp',
  name: 'WhatsApp',
  description: 'Most popular global messaging app. ~2B users.',
  icon: <Phone className="w-5 h-5 flex-shrink-0" />,
  color: 'bg-[#25D366]',
  colorHex: '#25D366',
  pro: false,
  tutorialUrl: 'https://faq.whatsapp.com/1294841057948784',

  defaults: {
    buttonText: 'Order via WhatsApp',
    bgColor: '#25D366',
    textColor: '#ffffff',
    borderRadius: 50,
    show_as_shortcut: false,
  },

  // Step 1 component — channel-specific
  ConfigStep,
};

export default whatsapp;
