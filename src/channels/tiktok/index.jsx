import React from 'react';
import { Music } from 'lucide-react';
import ConfigStep from './ConfigStep.jsx';

const tiktok = {
  id: 'tiktok',
  name: 'TikTok',
  description: 'Direct users to your TikTok profile or chat.',
  icon: <Music className="w-5 h-5 flex-shrink-0" />,
  color: 'bg-black',
  colorHex: '#000000',
  pro: true,

  defaults: {
    buttonText: 'Visit our TikTok',
    bgColor: '#000000',
    textColor: '#ffffff',
    borderRadius: 50,
    show_as_shortcut: true,
  },

  ConfigStep,
};

export default tiktok;
