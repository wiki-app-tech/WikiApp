import React from 'react';

const FogIcon: React.FC<{ className?: string }> = ({ className }) => (
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
    <path d="M7 16l10 0"></path>
    <path d="M7 20l10 0"></path>
    <path d="M12 4c-3.314 0 -6 2.686 -6 6a5.862 5.862 0 0 0 1.056 3.42l.944 1.58"></path>
    <path d="M15 10a5.998 5.998 0 0 1 3.002 8h.998"></path>
  </svg>
);

export default FogIcon;