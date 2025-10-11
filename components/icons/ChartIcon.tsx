import React from 'react';

const ChartIcon: React.FC<{ className?: string }> = ({ className }) => (
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
    <path d="M3 12m0 1l0 -4" />
    <path d="M9 8m0 1l0 8" />
    <path d="M15 4m0 1l0 12" />
    <path d="M21 12m0 1l0 -4" />
  </svg>
);

// FIX: Add default export to make the component available for import.
export default ChartIcon;
