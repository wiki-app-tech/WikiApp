import React from 'react';

const ThunderIcon: React.FC<{ className?: string }> = ({ className }) => (
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
    <path d="M18.887 11.887a3.5 3.5 0 1 0 -2.887 5.113h-6a4.5 4.5 0 1 0 -4.083 6"></path>
    <path d="M13 14l-2 4l3 0l-2 4"></path>
  </svg>
);

export default ThunderIcon;