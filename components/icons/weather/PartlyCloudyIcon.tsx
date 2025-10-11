import React from 'react';

const PartlyCloudyIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    strokeWidth="2"
    stroke="currentColor"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
    <path d="M12 3.999a8 8 0 1 1 0 16"></path>
    <path d="M3 12h1"></path>
    <path d="M12 21v-1"></path>
    <path d="M12 3v-1"></path>
    <path d="M5.6 5.6l.7 .7"></path>
    <path d="M18.4 5.6l-.7 .7"></path>
    <path d="M6 17a4.5 4.5 0 0 0 4.5 4.5h.5a4.5 4.5 0 0 0 4.5 -4.5v-.5a4.5 4.5 0 0 0 -4.5 -4.5h-2a4.5 4.5 0 0 0 -2.5 8"></path>
  </svg>
);

export default PartlyCloudyIcon;