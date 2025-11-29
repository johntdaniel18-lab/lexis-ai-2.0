import React, { useState, useMemo, useRef, useEffect } from 'react';
import { IeltsTest } from '../types';
import Card from './common/Card';
import XIcon from './icons/XIcon';

interface DashboardScreenProps {
  tests: IeltsTest[];
  onSelectTest: (test: IeltsTest) => void;
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({ tests, onSelectTest }) => {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();
    tests.forEach(test => {
      test.tags?.forEach(tag => tagsSet.add(tag));
    });
    return Array.from(tagsSet).sort();
  }, [tests]);
  
  const availableTags = useMemo(() => {
    return allTags
      .filter(tag => !selectedTags.includes(tag))
      .filter(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [allTags, selectedTags, searchTerm]);

  const filteredTests = useMemo(() => {
    if (selectedTags.length === 0) {
      return tests;
    }
    return tests.filter(test =>
      selectedTags.every(tag => test.tags?.includes(tag))
    );
  }, [tests, selectedTags]);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelectTag = (tag: string) => {
    setSelectedTags(prev => [...prev, tag]);
    setSearchTerm('');
    setIsDropdownOpen(false);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setSelectedTags(prev => prev.filter(tag => tag !== tagToRemove));
  };
  
  const handleClearFilters = () => {
    setSelectedTags([]);
  };

  return (
    <div className="space-y-16">
      <div>
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
            Select a Practice Test
          </h2>
          <p className="mt-4 text-lg text-slate-500">
            Choose a test to begin your AI-guided writing session, or filter by category below.
          </p>
        </div>
        
        {/* Smart Filter Bar */}
        <div ref={filterRef} className="mt-8 max-w-2xl mx-auto relative">
          <div className="flex flex-wrap items-center gap-2 p-2 bg-white border border-slate-300 rounded-lg shadow-sm focus-within:ring-2 focus-within:ring-orange-500 focus-within:border-orange-500">
             {selectedTags.map(tag => (
                <span key={tag} className="flex items-center gap-1.5 px-2 py-1 bg-slate-200 text-slate-700 text-sm font-semibold rounded-md">
                    {tag}
                    <button onClick={() => handleRemoveTag(tag)} className="text-slate-500 hover:text-slate-800 focus:outline-none">
                        <XIcon className="h-4 w-4" />
                    </button>
                </span>
             ))}
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setIsDropdownOpen(true)}
              placeholder={selectedTags.length > 0 ? 'Add another filter...' : 'Filter by tags (e.g. Line Graph, Technology...)'}
              className="flex-grow p-1 bg-transparent border-none focus:outline-none focus:ring-0 text-sm text-slate-800 placeholder-slate-400"
            />
             {selectedTags.length > 0 && (
                <button 
                  onClick={handleClearFilters}
                  className="text-sm font-semibold text-orange-600 hover:text-orange-800 pr-2"
                >
                    Clear
                </button>
             )}
          </div>
          {isDropdownOpen && availableTags.length > 0 && (
            <div className="absolute top-full mt-2 w-full bg-white border border-slate-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                <ul>
                    {availableTags.map(tag => (
                        <li 
                            key={tag}
                            onClick={() => handleSelectTag(tag)}
                            className="px-4 py-2 text-sm text-slate-700 cursor-pointer hover:bg-slate-100"
                        >
                            {tag}
                        </li>
                    ))}
                </ul>
            </div>
          )}
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredTests.map((test) => (
            <Card 
              key={test.id}
              title={test.title}
              tags={test.tags}
              buttonText="Start Test"
              onClick={() => onSelectTest(test)}
            />
          ))}
           {filteredTests.length === 0 && (
            <p className="text-center text-slate-500 col-span-full">
                No tests match your selected filters. Try removing a filter to broaden your search.
            </p>
           )}
        </div>
      </div>
    </div>
  );
};

export default DashboardScreen;