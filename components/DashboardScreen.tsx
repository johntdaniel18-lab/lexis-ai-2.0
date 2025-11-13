import React, { useState, useMemo } from 'react';
import { IeltsTest, TestMode } from '../types';
import Card from './common/Card';
import DocumentTextIcon from './icons/DocumentTextIcon';
import DocumentDuplicateIcon from './icons/DocumentDuplicateIcon';
import CollectionIcon from './icons/CollectionIcon';
import SearchIcon from './icons/SearchIcon';
import Button from './common/Button';

interface DashboardScreenProps {
  tests: IeltsTest[];
  onSelectTest: (test: IeltsTest, mode: TestMode) => void;
}

const ModeCard: React.FC<{ title: string; description: string; icon: React.ReactNode; onClick: () => void }> = ({ title, description, icon, onClick }) => (
    <button onClick={onClick} className="text-left w-full p-6 bg-white rounded-lg shadow-md border border-slate-200 hover:border-orange-400 hover:shadow-lg transition-all transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500">
        <div className="flex items-start gap-4">
            <div className="flex-shrink-0 h-12 w-12 flex items-center justify-center rounded-lg bg-orange-100 text-orange-600">
                {icon}
            </div>
            <div>
                <h3 className="text-lg font-bold text-slate-800">{title}</h3>
                <p className="mt-1 text-sm text-slate-500">{description}</p>
            </div>
        </div>
    </button>
);

const filterTags = (tags: string[] = [], mode: TestMode): string[] => {
    if (mode === 'MOCK_TEST' || tags.length < 3) {
        return tags;
    }

    const task2TypeKeywords = ['Discussion', 'Problem', 'Solution', 'Agree', 'Disagree', 'Advantages', 'Disadvantages', 'Question', 'Opinion'];
    
    const splitIndex = tags.findIndex(tag => 
        task2TypeKeywords.some(keyword => tag.toLowerCase().includes(keyword.toLowerCase()))
    );

    if (splitIndex === -1) {
        return tags; // Fallback if no Task 2 type tag is found
    }
    
    if (mode === 'TASK_1') {
        return tags.slice(0, splitIndex);
    }
    if (mode === 'TASK_2') {
        return tags.slice(splitIndex);
    }

    return tags;
};


const DashboardScreen: React.FC<DashboardScreenProps> = ({ tests, onSelectTest }) => {
  const [selectedMode, setSelectedMode] = useState<TestMode | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('');

  const handleModeSelect = (mode: TestMode) => {
    setSelectedMode(mode);
    setSearchQuery('');
    setSelectedTag('');
  };

  const modeTitles: Record<TestMode, string> = {
    'TASK_1': 'Practice Task 1',
    'TASK_2': 'Practice Task 2',
    'MOCK_TEST': 'Full Mock Test'
  };

  const availableTags = useMemo(() => {
    if (!selectedMode) return [];
    const allRelevantTags = tests.flatMap(test => filterTags(test.tags, selectedMode));
    return [...new Set(allRelevantTags)].sort();
  }, [tests, selectedMode]);

  const filteredTests = useMemo(() => {
    if (!selectedMode) return [];

    return tests.filter(test => {
      const relevantTags = filterTags(test.tags, selectedMode);
      
      const tagMatch = selectedTag ? relevantTags.includes(selectedTag) : true;

      const queryMatch = searchQuery ? 
        test.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        relevantTags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
        : true;
      
      return tagMatch && queryMatch;
    });
  }, [tests, selectedMode, searchQuery, selectedTag]);

  if (!selectedMode) {
      return (
        <div className="space-y-12">
            <div className="text-center">
                <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
                    Choose Your Practice Mode
                </h2>
                <p className="mt-4 text-lg text-slate-500">
                    Select how you want to practice today.
                </p>
            </div>
            <div className="max-w-3xl mx-auto grid grid-cols-1 gap-6">
                <ModeCard 
                    title="Practice Task 1"
                    description="Focus on describing visual data. Includes AI-guided prep, a 20-minute timer, and detailed feedback."
                    icon={<DocumentTextIcon />}
                    onClick={() => handleModeSelect('TASK_1')}
                />
                 <ModeCard 
                    title="Practice Task 2"
                    description="Hone your essay writing skills. Includes AI-guided prep, a 40-minute timer, and detailed feedback."
                    icon={<DocumentDuplicateIcon />}
                    onClick={() => handleModeSelect('TASK_2')}
                />
                 <ModeCard 
                    title="Full Mock Test"
                    description="A realistic 60-minute exam simulation with both tasks. No AI prep, just timed writing and a final score."
                    icon={<CollectionIcon />}
                    onClick={() => handleModeSelect('MOCK_TEST')}
                />
            </div>
        </div>
      );
  }

  return (
    <div className="space-y-12 pb-24">
       <div>
            <div className="text-center mb-10">
                <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
                    {modeTitles[selectedMode]}
                </h2>
                <p className="mt-4 text-lg text-slate-500">
                    Select a test to begin your session.
                </p>
            </div>
            
            <div className="max-w-3xl mx-auto mb-10 p-4 bg-slate-100 rounded-lg border border-slate-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="relative">
                        <label htmlFor="search-test" className="sr-only">Search tests</label>
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                           <SearchIcon className="h-5 w-5 text-slate-400" />
                        </div>
                        <input
                            type="search"
                            id="search-test"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Search by title or tag..."
                            className="block w-full rounded-md border-slate-300 bg-white pl-10 py-2 shadow-sm focus:border-orange-500 focus:ring-orange-500 text-sm"
                        />
                    </div>
                    <div className="relative">
                        <label htmlFor="filter-tag" className="sr-only">Filter by tag</label>
                         <select
                            id="filter-tag"
                            value={selectedTag}
                            onChange={e => setSelectedTag(e.target.value)}
                            className="block w-full appearance-none rounded-md border-slate-300 bg-white py-2 pl-3 pr-10 shadow-sm focus:border-orange-500 focus:ring-orange-500 text-sm"
                        >
                            <option value="">All Topics</option>
                            {availableTags.map(tag => (
                                <option key={tag} value={tag}>{tag}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>


            {filteredTests.length > 0 ? (
                <div className="mt-12 max-w-lg mx-auto grid gap-8 lg:grid-cols-2 lg:max-w-none">
                {filteredTests.map((test) => (
                    <Card 
                    key={test.id}
                    title={test.title}
                    tags={filterTags(test.tags, selectedMode)}
                    buttonText="Start Practice"
                    onClick={() => onSelectTest(test, selectedMode)}
                    />
                ))}
                </div>
            ) : (
                 <div className="text-center py-10 px-4 bg-white rounded-lg border border-slate-200">
                    <h3 className="text-lg font-semibold text-slate-800">No Tests Found</h3>
                    <p className="mt-2 text-slate-500">Your search did not match any tests. Try adjusting your filters.</p>
                </div>
            )}
        </div>

        <footer className="fixed bottom-0 left-0 w-full bg-white/80 backdrop-blur-sm border-t border-slate-200 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-center">
                <Button variant="secondary" onClick={() => setSelectedMode(null)}>
                    &larr; Back to Practice Modes
                </Button>
            </div>
        </footer>
    </div>
  );
};

export default DashboardScreen;