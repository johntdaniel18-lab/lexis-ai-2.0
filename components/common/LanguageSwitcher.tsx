import React from 'react';

interface LanguageSwitcherProps {
  language: 'en' | 'vi';
  onLanguageChange: (lang: 'en' | 'vi') => void;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ language, onLanguageChange }) => {
  const getButtonClass = (lang: 'en' | 'vi') => {
    const base = 'px-3 py-1 text-xs font-bold rounded-md focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-orange-500 transition-colors';
    if (language === lang) {
      return `${base} bg-orange-500 text-white shadow-inner`;
    }
    return `${base} bg-slate-200 text-slate-600 hover:bg-slate-300`;
  };

  return (
    <div className="flex items-center p-0.5 bg-slate-200/80 rounded-lg space-x-1">
      <button type="button" onClick={() => onLanguageChange('en')} className={getButtonClass('en')}>
        EN
      </button>
      <button type="button" onClick={() => onLanguageChange('vi')} className={getButtonClass('vi')}>
        VI
      </button>
    </div>
  );
};

export default LanguageSwitcher;