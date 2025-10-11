import React from 'react';

const SnowIcon: React.FC<{ className?: string }> = ({ className }) => (
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
    <path d="M7 18a4.6 4.4 0 0 1 0 -9a5 4.5 0 0 1 11 2h1a3.5 3.5 0 0 1 0 7"></path>
    <path d="M11 15v.01"></path>
    <path d="M15 15v.01"></path>
    <path d="M8 15v.01"></path>
    <path d="M13 17.5v.01"></path>
    <path d="M10 19.5v.01"></path>
    <path d="M17 19.5v.01"></path>
  </svg>
);

export default SnowIcon;