import React from 'react';

const LayoutGridIcon: React.FC<{ className?: string }> = ({ className }) => (
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
    <rect x="4" y="4" width="6" height="6" rx="1"></rect>
    <rect x="14" y="4" width="6" height="6" rx="1"></rect>
    <rect x="4" y="14" width="6" height="6" rx="1"></rect>
    <rect x="14" y="14" width="6" height="6" rx="1"></rect>
  </svg>
);

export default LayoutGridIcon;
