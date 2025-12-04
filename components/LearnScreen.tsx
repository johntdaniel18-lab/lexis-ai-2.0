import React, { useState, useMemo, useEffect } from 'react';
import { StaticDrillModule } from '../types';
import Spinner from './common/Spinner';

// Icons
const BookOpenIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
);

interface LearnScreenProps {
    drills: StaticDrillModule[];
    onStartDrill: (module: StaticDrillModule) => void;
    initialFilter?: string | null;
    onFilterApplied?: () => void;
}

const LearnScreen: React.FC<LearnScreenProps> = ({ drills, onStartDrill, initialFilter, onFilterApplied }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isLoading, setIsLoading] = useState(true); // Still show loading on first render

  useEffect(() => {
    if (initialFilter) {
      setSelectedCategory(initialFilter);
      if (onFilterApplied) onFilterApplied();
    }
  }, [initialFilter, onFilterApplied]);
  
  // Manage loading state based on prop
  useEffect(() => {
    setIsLoading(drills.length === 0);
  }, [drills]);

  const categories = ['All', 'Grammar', 'Vocabulary', 'Coherence', 'Task Response'];

  const filteredDrills = useMemo(() => {
    if (selectedCategory === 'All') return drills;
    return drills.filter(drill => drill.category === selectedCategory);
  }, [selectedCategory, drills]);


  if (isLoading) {
      return (
          <div className="flex justify-center items-center h-64">
              <Spinner />
          </div>
      );
  }

  return (
    <div className="space-y-12 pb-12">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">
          Learning Library
        </h2>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto">
          Access high-quality, pre-made lessons and drills designed to target specific IELTS skills.
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex justify-center">
        <div className="inline-flex bg-white p-1.5 rounded-xl shadow-sm border border-slate-200 gap-1 overflow-x-auto max-w-full">
            {categories.map(cat => (
                <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 text-sm font-bold rounded-lg transition-all whitespace-nowrap ${
                        selectedCategory === cat 
                        ? 'bg-orange-500 text-white shadow-md' 
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                >
                    {cat}
                </button>
            ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredDrills.map((drill) => (
            <div 
                key={drill.id} 
                className="group flex flex-col bg-white rounded-2xl shadow-sm hover:shadow-xl border border-slate-200 transition-all duration-300 transform hover:-translate-y-1 overflow-hidden cursor-pointer"
                onClick={() => onStartDrill(drill)}
            >
                <div className="p-6 flex-grow flex flex-col">
                    {/* NEW INTEGRATED HEADER */}
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex flex-wrap items-center gap-2">
                             <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-orange-100 text-orange-800 border border-orange-200">
                                {drill.difficulty}
                            </span>
                             <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                                {drill.category}
                            </span>
                        </div>
                        <div className="h-8 w-8 bg-slate-100 rounded-full flex items-center justify-center shadow-sm text-slate-400 group-hover:text-orange-500 transition-colors flex-shrink-0">
                            <BookOpenIcon />
                        </div>
                    </div>
                    
                    {/* MAIN CONTENT */}
                    <div className="flex-grow">
                        <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-orange-600 transition-colors">
                            {drill.title}
                        </h3>
                        <p className="text-slate-500 text-sm line-clamp-3 leading-relaxed">
                            {drill.description}
                        </p>
                    </div>
                    
                    {/* FOOTER */}
                    <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between">
                         <div className="flex gap-2">
                            {drill.tags.slice(0, 2).map(tag => (
                                <span key={tag} className="px-2 py-0.5 bg-orange-100 text-orange-800 text-[10px] font-bold uppercase rounded">
                                    {tag}
                                </span>
                            ))}
                         </div>
                         <span className="text-sm font-bold text-orange-500 group-hover:translate-x-1 transition-transform">
                             Start &rarr;
                         </span>
                    </div>
                </div>
            </div>
        ))}
      </div>
      
      {filteredDrills.length === 0 && (
          <div className="text-center py-12 text-slate-400">
              <p>No modules found for this category yet.</p>
          </div>
      )}
    </div>
  );
};

export default LearnScreen;