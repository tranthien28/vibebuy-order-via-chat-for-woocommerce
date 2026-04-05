import React from 'react';
import { Camera } from 'lucide-react';
import ConfigStep from './ConfigStep.jsx';

const instagram = {
  id: 'instagram',
  name: 'Instagram',
  description: 'Connect with customers via Instagram Direct Messages.',
  icon: <Camera className="w-5 h-5 flex-shrink-0" />,
  color: 'bg-gradient-to-tr from-[#FFDC80] via-[#E1306C] to-[#833AB4]',
  colorHex: '#E1306C',
  pro: true,

  defaults: {
    buttonText: 'Chat via Instagram',
    bgColor: '#E1306C',
    textColor: '#ffffff',
    borderRadius: 50,
    show_as_shortcut: true,
  },

  ConfigStep,
};

export default instagram;
