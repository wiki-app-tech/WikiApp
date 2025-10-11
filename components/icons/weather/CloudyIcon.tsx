import React from 'react';

const CloudyIcon: React.FC<{ className?: string }> = ({ className }) => (
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
    <path d="M9 17a4.5 4.5 0 1 0 -4.5 -4.5a4.5 4.5 0 0 0 4.5 4.5z"></path>
    <path d="M13 17h1a3.5 3.5 0 1 0 0 -7h-1"></path>
    <path d="M11 14.5a3.5 3.5 0 1 0 0 -7h-1.5"></path>
  </svg>
);

export default CloudyIcon;