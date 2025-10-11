import React from 'react';

const SparkleIcon: React.FC<{ className?: string }> = ({ className }) => (
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
    <path d="M12 2l2.5 5.5l5.5 2.5l-5.5 2.5l-2.5 5.5l-2.5 -5.5l-5.5 -2.5l5.5 -2.5z"></path>
  </svg>
);

export default SparkleIcon;