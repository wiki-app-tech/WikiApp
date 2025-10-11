import React from 'react';

const BallotIcon: React.FC<{ className?: string }> = ({ className }) => (
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
    <path d="M10 13l4 -4"></path>
    <path d="M10 9l4 4"></path>
    <path d="M12 21h-7a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v5.5"></path>
    <path d="M16 19h6"></path>
    <path d="M19 16l3 3l-3 3"></path>
  </svg>
);

// FIX: Add default export to make the component available for import.
export default BallotIcon;
