import React from 'react';

const SparklesIcon: React.FC<{ className?: string }> = ({ className = "h-6 w-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 1a3 3 0 00-3 3v10a3 3 0 003 3h10a3 3 0 003-3V4a3 3 0 00-3-3H5z" />
        <path d="M10.894 2.553a1 1 0 00-1.788 0l-1 1.732a1 1 0 01-1.5-.866l.293-1.011A3 3 0 017 1.732V1a1 1 0 00-2 0v.732a3 3 0 011.606 1.84l-.293 1.01a1 1 0 101.788 1l1-1.732a1 1 0 011.5.866l-.293 1.011a3 3 0 01-1.606 1.84v.732a1 1 0 002 0v-.732a3 3 0 01-1.606-1.84l.293-1.01a1 1 0 10-1.788-1z" />
    </svg>
);

export default SparklesIcon;
