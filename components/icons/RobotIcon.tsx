import React from 'react';

const RobotIcon: React.FC = () => (
  <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5">
      <g stroke="#F97316" fill="none" strokeWidth="8" strokeLinecap="square" strokeLinejoin="miter">
        <circle cx="50" cy="50" r="45" />
        <path d="M40 30 V 70 H 65" />
      </g>
    </svg>
  </div>
);

export default RobotIcon;
