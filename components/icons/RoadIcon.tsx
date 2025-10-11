import React from 'react';

const RoadIcon: React.FC<{ className?: string }> = ({ className }) => (
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
    <path d="M4 19l4 -14"></path>
    <path d="M16 5l4 14"></path>
    <path d="M12 8v-2"></path>
    <path d="M12 13v-2"></path>
    <path d="M12 18v-2"></path>
  </svg>
);

export default RoadIcon;