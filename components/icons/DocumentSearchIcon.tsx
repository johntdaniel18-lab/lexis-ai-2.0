import React from 'react';

const DocumentSearchIcon: React.FC<{ className?: string }> = ({ className = "h-6 w-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25l3.38-3.38a.75.75 0 00-1.06-1.06l-3.38 3.38a.75.75 0 001.06 1.06zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 14.25h6.75m-6.75-3.75h6.75M9 6.75h3.75" />
    </svg>
);

export default DocumentSearchIcon;