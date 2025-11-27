
import React, { useState, useEffect } from 'react';
import { IeltsTest, StaticDrillModule } from '../../types';
import AddTestForm from './AddTestForm';
import DrillEditor from './DrillEditor';
import Button from '../common/Button';
import { fetchDrills, saveDrill, deleteDrill } from '../../services/firebase';
import Spinner from '../common/Spinner';

interface AdminDashboardScreenProps {
  tests: IeltsTest[];
  onAddNewTest: (test: Omit<IeltsTest, 'id'>) => void;
  onUpdateTest: (test: IeltsTest) => void;
}

type AdminView = 'tests' | 'drills';

const AdminDashboardScreen: React.FC<AdminDashboardScreenProps> = ({ tests, onAddNewTest, onUpdateTest }) => {
  const [activeView, setActiveView] = useState<AdminView>('tests');
  
  // Test Management State
  const [isTestFormVisible, setIsTestFormVisible] = useState(false);
  const [testToEdit, setTestToEdit] = useState<IeltsTest | null>(null);

  // Drill Management State
  const [drills, setDrills] = useState<StaticDrillModule[]>([]);
  const [isDrillEditorVisible, setIsDrillEditorVisible] = useState(false);
  const [drillToEdit, setDrillToEdit] = useState<StaticDrillModule | null>(null);
  const [isLoadingDrills, setIsLoadingDrills] = useState(false);

  // Load Drills on mount or when view changes
  useEffect(() => {
    if (activeView === 'drills') {
        loadDrills();
    }
  }, [activeView]);

  const loadDrills = async () => {
      setIsLoadingDrills(true);
      try {
          const loadedDrills = await fetchDrills();
          setDrills(loadedDrills);
      } catch (error) {
          console.error("Failed to load drills", error);
      } finally {
          setIsLoadingDrills(false);
      }
  };

  // --- Test Handlers ---
  const handleShowAddTestForm = () => {
    setTestToEdit(null);
    setIsTestFormVisible(true);
  };

  const handleShowEditTestForm = (test: IeltsTest) => {
    setTestToEdit(test);
    setIsTestFormVisible(true);
  };
  
  const handleCancelTestForm = () => {
    setIsTestFormVisible(false);
    setTestToEdit(null);
  };

  const handleTestFormSubmit = (testData: Omit<IeltsTest, 'id'>, id?: number) => {
    if (id !== undefined) {
      onUpdateTest({ ...testData, id });
    } else {
      onAddNewTest(testData);
    }
    handleCancelTestForm();
  };

  // --- Drill Handlers ---
  const handleShowAddDrill = () => {
      setDrillToEdit(null);
      setIsDrillEditorVisible(true);
  };

  const handleShowEditDrill = (drill: StaticDrillModule) => {
      setDrillToEdit(drill);
      setIsDrillEditorVisible(true);
  };

  const handleCancelDrillEditor = () => {
      setIsDrillEditorVisible(false);
      setDrillToEdit(null);
  };

  const handleDrillSave = async (drill: StaticDrillModule) => {
      try {
          await saveDrill(drill);
          // Refresh list locally
          setDrills(prev => {
              const exists = prev.find(d => d.id === drill.id);
              if (exists) {
                  return prev.map(d => d.id === drill.id ? drill : d);
              }
              return [...prev, drill];
          });
          setIsDrillEditorVisible(false);
          setDrillToEdit(null);
      } catch (e) {
          console.error("Failed to save drill", e);
          alert("Failed to save drill. See console.");
      }
  };

  const handleDrillDelete = async (drillId: string) => {
      try {
          await deleteDrill(drillId);
          setDrills(prev => prev.filter(d => d.id !== drillId));
          setIsDrillEditorVisible(false);
          setDrillToEdit(null);
      } catch (e) {
          console.error("Failed to delete drill", e);
          alert("Failed to delete drill. See console.");
      }
  };

  return (
    <div className="space-y-8">
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h2 className="text-3xl font-extrabold text-slate-900">Admin Portal</h2>
            <p className="mt-1 text-lg text-slate-500">Manage Content</p>
        </div>
        
        <div className="bg-white p-1 rounded-lg border border-slate-200 shadow-sm flex">
            <button
                onClick={() => setActiveView('tests')}
                className={`px-4 py-2 text-sm font-bold rounded-md transition-colors ${activeView === 'tests' ? 'bg-orange-100 text-orange-700' : 'text-slate-600 hover:bg-slate-50'}`}
            >
                Practice Tests
            </button>
            <button
                onClick={() => setActiveView('drills')}
                className={`px-4 py-2 text-sm font-bold rounded-md transition-colors ${activeView === 'drills' ? 'bg-orange-100 text-orange-700' : 'text-slate-600 hover:bg-slate-50'}`}
            >
                Drill Library
            </button>
        </div>
      </div>

      {/* --- TESTS VIEW --- */}
      {activeView === 'tests' && (
          <>
            <div className="flex justify-end">
                <Button variant="primary" onClick={handleShowAddTestForm} disabled={isTestFormVisible}>
                    Add New Test
                </Button>
            </div>

            {isTestFormVisible && (
                <AddTestForm 
                initialData={testToEdit}
                onSubmit={handleTestFormSubmit} 
                onCancel={handleCancelTestForm} 
                />
            )}

            <div className="bg-white shadow-md rounded-lg overflow-hidden border border-slate-200">
                <div className="px-6 py-4 border-b border-slate-200">
                    <h3 className="text-xl font-semibold text-slate-800">Test Library ({tests.length})</h3>
                </div>
                <ul className="divide-y divide-slate-200">
                {tests.map((test) => (
                    <li key={test.id} className="p-6 hover:bg-slate-50 flex justify-between items-center">
                    <div>
                        <h4 className="font-bold text-lg text-slate-800">{test.title}</h4>
                        <p className="text-sm text-slate-500">{test.tags?.join(', ')}</p>
                    </div>
                    <div className="flex-shrink-0 ml-4">
                        <Button variant="secondary" onClick={() => handleShowEditTestForm(test)}>
                            Edit
                        </Button>
                    </div>
                    </li>
                ))}
                </ul>
            </div>
        </>
      )}

      {/* --- DRILLS VIEW --- */}
      {activeView === 'drills' && (
          <>
             <div className="flex justify-end gap-2">
                <Button variant="primary" onClick={handleShowAddDrill} disabled={isDrillEditorVisible}>
                    Create New Drill
                </Button>
            </div>

            {isDrillEditorVisible && (
                <DrillEditor
                    initialData={drillToEdit}
                    onSave={handleDrillSave}
                    onCancel={handleCancelDrillEditor}
                    onDelete={handleDrillDelete}
                />
            )}

            <div className="bg-white shadow-md rounded-lg overflow-hidden border border-slate-200">
                <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-slate-800">Drill Library ({drills.length})</h3>
                    {isLoadingDrills && <span className="text-sm text-slate-400">Loading...</span>}
                </div>
                 {drills.length === 0 && !isLoadingDrills && (
                    <div className="p-8 text-center text-slate-500">No drills found. Click 'Create New Drill' to get started.</div>
                 )}
                <ul className="divide-y divide-slate-200">
                    {drills.map((drill) => (
                        <li key={drill.id} className="p-6 hover:bg-slate-50 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="px-2 py-0.5 text-xs font-bold rounded uppercase bg-orange-100 text-orange-800">
                                        {drill.category}
                                    </span>
                                    <span className="px-2 py-0.5 text-xs font-bold rounded uppercase bg-orange-100 text-orange-800">
                                        {drill.difficulty}
                                    </span>
                                </div>
                                <h4 className="font-bold text-lg text-slate-800">{drill.title}</h4>
                                <p className="text-sm text-slate-500 line-clamp-1">{drill.description}</p>
                                <p className="text-xs text-slate-400 mt-1 font-mono">{drill.id}</p>
                            </div>
                            <div className="flex-shrink-0">
                                <Button variant="secondary" onClick={() => handleShowEditDrill(drill)}>
                                    Edit
                                </Button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
          </>
      )}

    </div>
  );
};

export default AdminDashboardScreen;
