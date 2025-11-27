
import React, { useState, useEffect } from 'react';
import { StaticDrillModule, DrillGroup, DrillQuestion, DrillGroupType } from '../../types';
import Button from '../common/Button';
import XIcon from '../icons/XIcon';
import { generateDrillFromRawText, validateApiKey } from '../../services/geminiService';
import Spinner from '../common/Spinner';

// Icons
const SparklesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" /></svg>
);
const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
);

interface DrillEditorProps {
  initialData: StaticDrillModule | null;
  onSave: (drill: StaticDrillModule) => void;
  onCancel: () => void;
  onDelete?: (id: string) => void;
}

const emptyModule: StaticDrillModule = {
    id: '',
    title: '',
    description: '',
    category: 'Grammar',
    difficulty: 'Intermediate',
    tags: [],
    lessonContent: '# Introduction\nWrite your lesson here...',
    groups: []
};

const DrillEditor: React.FC<DrillEditorProps> = ({ initialData, onSave, onCancel, onDelete }) => {
  const [module, setModule] = useState<StaticDrillModule>(emptyModule);
  const [tagsInput, setTagsInput] = useState('');
  const [activeTab, setActiveTab] = useState<'details' | 'lesson' | 'groups'>('details');
  
  // AI Import
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [loadingStatus, setLoadingStatus] = useState({ title: '', subtitle: '' });

  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setModule(initialData);
      setTagsInput(initialData.tags.join(', '));
    } else {
      setModule({ ...emptyModule, id: `drill-${Date.now()}` });
      setTagsInput('');
    }
  }, [initialData]);

  const updateField = (field: keyof StaticDrillModule, value: any) => {
      setModule(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const tags = tagsInput.split(',').map(t => t.trim()).filter(t => t);
    
    // FIX: Firestore cannot accept 'undefined' values. We must strip them.
    // The easiest way for simple data objects is JSON serialization.
    const drillData = { ...module, tags };
    const sanitizedDrill = JSON.parse(JSON.stringify(drillData));

    onSave(sanitizedDrill);
  };

  const handleDeleteClick = async () => {
      if (initialData && onDelete) {
          setIsDeleting(true);
          try {
            await onDelete(initialData.id);
          } catch (error) {
              console.error("Delete failed", error);
              setIsDeleting(false); // Only reset if failed, otherwise component unmounts
          }
      }
  };

  const handleAIImport = async () => {
      if (!importText.trim() || !apiKey.trim()) return;
      setIsImporting(true);
      setImportError(null);
      try {
          setLoadingStatus({ title: "Verifying API Key...", subtitle: "Checking connection..." });
          await validateApiKey(apiKey);
          setLoadingStatus({ title: "Generating Content...", subtitle: "Extracting lessons and exercises..." });
          
          const generated = await generateDrillFromRawText(importText, apiKey);
          setModule(prev => ({ ...prev, ...generated }));
          setTagsInput(generated.tags?.join(', ') || '');
          setIsImportModalOpen(false);
      } catch (err: any) {
          console.error(err);
          setImportError(err.message || "Failed to generate content");
      } finally {
          setIsImporting(false);
      }
  };

  // --- Group Management ---

  const addGroup = (type: DrillGroupType) => {
      const newGroup: DrillGroup = {
          id: `g-${Date.now()}`,
          type,
          title: 'New Question Group',
          instruction: 'Instructions here...',
          questions: [],
          content: type === 'NOTES_COMPLETION' ? 'Write text here. Use [brackets] for answers.' : undefined,
          sharedOptions: type === 'MATCHING' ? ['Option A', 'Option B'] : undefined
      };
      setModule(prev => ({ ...prev, groups: [...(prev.groups || []), newGroup] }));
  };

  const updateGroup = (index: number, updated: DrillGroup) => {
      const newGroups = [...module.groups];
      newGroups[index] = updated;
      setModule(prev => ({ ...prev, groups: newGroups }));
  };

  const removeGroup = (index: number) => {
      setModule(prev => ({ ...prev, groups: prev.groups.filter((_, i) => i !== index) }));
  };

  const addQuestionToGroup = (groupIndex: number) => {
      const newQ: DrillQuestion = {
          id: `q-${Date.now()}`,
          text: 'New Question Prompt',
          correctAnswer: '0', // Default index
          options: ['Option A', 'Option B']
      };
      const group = module.groups[groupIndex];
      updateGroup(groupIndex, { ...group, questions: [...(group.questions || []), newQ] });
  };

  const updateQuestion = (groupIndex: number, qIndex: number, updatedQ: DrillQuestion) => {
      const group = module.groups[groupIndex];
      const newQs = [...group.questions];
      newQs[qIndex] = updatedQ;
      updateGroup(groupIndex, { ...group, questions: newQs });
  };

  const removeQuestion = (groupIndex: number, qIndex: number) => {
      const group = module.groups[groupIndex];
      updateGroup(groupIndex, { ...group, questions: group.questions.filter((_, i) => i !== qIndex) });
  };

  // --- Notes Parser ---
  
  // Helper for Notes Completion: Convert [Answer] to {{id}} + Question Object
  const parseNotesText = (text: string): { content: string, questions: DrillQuestion[] } => {
      let qIndex = 0;
      const questions: DrillQuestion[] = [];
      const content = text.replace(/\[(.*?)\]/g, (_, answer) => {
          const id = `q-${Date.now()}-${qIndex++}`;
          questions.push({ id, correctAnswer: answer });
          return `{{${id}}}`;
      });
      return { content, questions };
  };

  // Renderers for specific group editors
  
  const renderMCQGroup = (group: DrillGroup, gIdx: number) => (
      <div className="space-y-4 border-l-4 border-blue-200 pl-4 ml-2">
          {(group.questions || []).map((q, qIdx) => (
              <div key={q.id} className="bg-white p-4 rounded border border-slate-200 relative group shadow-sm">
                  <button onClick={() => removeQuestion(gIdx, qIdx)} className="absolute top-2 right-2 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100"><XIcon className="h-4 w-4"/></button>
                  <div className="mb-3">
                      <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Question {qIdx + 1} Prompt</label>
                      <input 
                        className="w-full border border-slate-300 p-2 rounded bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                        value={q.text || ''}
                        onChange={e => updateQuestion(gIdx, qIdx, { ...q, text: e.target.value })}
                        placeholder="Enter question text..."
                      />
                  </div>
                  <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase block">Options (Select Correct Answer)</label>
                      {q.options?.map((opt, oIdx) => (
                          <div key={oIdx} className="flex items-center gap-2">
                              <input 
                                type="radio" 
                                name={`correct-${q.id}`}
                                checked={q.correctAnswer === oIdx.toString()}
                                onChange={() => updateQuestion(gIdx, qIdx, { ...q, correctAnswer: oIdx.toString() })}
                                className="cursor-pointer"
                              />
                              <input 
                                className="flex-grow text-sm border border-slate-300 rounded px-3 py-2 bg-white text-slate-900"
                                value={opt}
                                onChange={e => {
                                    const newOpts = [...(q.options || [])];
                                    newOpts[oIdx] = e.target.value;
                                    updateQuestion(gIdx, qIdx, { ...q, options: newOpts });
                                }}
                              />
                          </div>
                      ))}
                      <button className="text-xs text-blue-600 font-bold mt-1 hover:underline" onClick={() => updateQuestion(gIdx, qIdx, { ...q, options: [...(q.options||[]), 'New Option'] })}>+ Add Option</button>
                  </div>
                  <div className="mt-3">
                      <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Explanation</label>
                      <input 
                        className="w-full text-sm border border-slate-300 rounded px-3 py-2 bg-white text-slate-900" 
                        placeholder="Why is this correct?" 
                        value={q.explanation || ''} 
                        onChange={e => updateQuestion(gIdx, qIdx, { ...q, explanation: e.target.value })} 
                      />
                  </div>
              </div>
          ))}
          <Button variant="secondary" className="text-sm w-full border-dashed" onClick={() => addQuestionToGroup(gIdx)}>+ Add MCQ Question</Button>
      </div>
  );

  const renderMatchingGroup = (group: DrillGroup, gIdx: number) => (
      <div className="space-y-4 border-l-4 border-purple-200 pl-4 ml-2">
          <div className="bg-slate-50 p-4 rounded border border-slate-200">
              <label className="text-xs font-bold text-slate-600 uppercase mb-2 block">Shared Options (The Answer List)</label>
              <div className="space-y-2">
                {group.sharedOptions?.map((opt, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                        <span className="font-bold text-slate-500 w-6">{String.fromCharCode(65 + idx)}.</span>
                        <input 
                            className="flex-grow text-sm border border-slate-300 rounded px-3 py-2 bg-white text-slate-900"
                            value={opt}
                            onChange={e => {
                                const newOpts = [...(group.sharedOptions || [])];
                                newOpts[idx] = e.target.value;
                                updateGroup(gIdx, { ...group, sharedOptions: newOpts });
                            }}
                        />
                        <button onClick={() => updateGroup(gIdx, { ...group, sharedOptions: group.sharedOptions?.filter((_, i) => i !== idx) })} className="text-red-400 hover:text-red-600"><XIcon className="h-4 w-4"/></button>
                    </div>
                ))}
              </div>
              <button className="text-xs text-purple-600 font-bold mt-3 hover:underline" onClick={() => updateGroup(gIdx, { ...group, sharedOptions: [...(group.sharedOptions || []), 'New Option'] })}>+ Add Answer Option</button>
          </div>

          <div className="space-y-2">
            {(group.questions || []).map((q, qIdx) => (
                <div key={q.id} className="flex items-center gap-2 bg-white p-3 rounded border border-slate-200 shadow-sm">
                    <span className="text-xs font-bold text-slate-400 w-6">{qIdx + 1}.</span>
                    <input 
                        className="flex-grow text-sm border border-slate-300 rounded px-3 py-2 bg-white text-slate-900"
                        placeholder="Term to match..."
                        value={q.text || ''}
                        onChange={e => updateQuestion(gIdx, qIdx, { ...q, text: e.target.value })}
                    />
                    <span className="text-slate-400 font-bold">Matches &rarr;</span>
                    <select 
                        className="text-sm border border-slate-300 rounded px-2 py-2 bg-white text-slate-900 w-20"
                        value={q.correctAnswer as string}
                        onChange={e => updateQuestion(gIdx, qIdx, { ...q, correctAnswer: e.target.value })}
                    >
                        {group.sharedOptions?.map((_, i) => (
                            <option key={i} value={i.toString()}>{String.fromCharCode(65 + i)}</option>
                        ))}
                    </select>
                    <button onClick={() => removeQuestion(gIdx, qIdx)} className="text-red-400 hover:text-red-600 ml-2"><XIcon className="h-4 w-4"/></button>
                </div>
            ))}
          </div>
          <Button variant="secondary" className="text-sm w-full border-dashed" onClick={() => addQuestionToGroup(gIdx)}>+ Add Matching Pair</Button>
      </div>
  );
  
  const renderNotesGroup = (group: DrillGroup, gIdx: number) => {
      return (
          <div className="space-y-4 border-l-4 border-green-200 pl-4 ml-2">
              <div className="bg-yellow-50 p-3 text-sm text-yellow-800 rounded border border-yellow-200 mb-2 leading-relaxed">
                  <strong>Instructions:</strong> Type your paragraph below. Put the correct answer inside square brackets.<br/>
                  Example: <em>"The capital of [France] is Paris."</em><br/>
                  The system will automatically create blank spaces for anything in brackets.
              </div>
              <textarea 
                className="w-full h-40 p-3 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-green-500 font-mono bg-white text-slate-900"
                placeholder="Type text with [answers]..."
                defaultValue={group.content?.replace(/{{.*?}}/g, '[answer]') || ''} 
                onChange={e => {
                    const { content, questions } = parseNotesText(e.target.value);
                    updateGroup(gIdx, { ...group, content, questions });
                }}
              />
              <div className="text-sm font-bold text-green-700">
                  Detected {(group.questions || []).length} blanks.
              </div>
          </div>
      );
  };

  const renderGroupsTab = () => (
      <div className="space-y-8 pb-8">
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-center">
              <span className="text-sm font-bold text-slate-500 uppercase block mb-4">Add New Question Group</span>
              <div className="flex gap-4 justify-center">
                <Button onClick={() => addGroup('MCQ')} variant="secondary" className="border-blue-200 text-blue-700 hover:bg-blue-50">+ MCQ Group</Button>
                <Button onClick={() => addGroup('MATCHING')} variant="secondary" className="border-purple-200 text-purple-700 hover:bg-purple-50">+ Matching Group</Button>
                <Button onClick={() => addGroup('NOTES_COMPLETION')} variant="secondary" className="border-green-200 text-green-700 hover:bg-green-50">+ Notes Group</Button>
              </div>
          </div>

          <div className="space-y-8">
              {(module.groups || []).length === 0 && <p className="text-center text-slate-400 italic py-8">No question groups yet. Add one above to start building your drill.</p>}
              
              {(module.groups || []).map((group, idx) => (
                  <div key={group.id} className="bg-slate-50 p-6 rounded-lg border border-slate-200 relative shadow-sm">
                      <div className="flex justify-between items-start mb-6 border-b border-slate-200 pb-4">
                          <div className="flex-grow mr-8 space-y-3">
                              <div className="flex items-center gap-3">
                                  <span className={`text-xs font-bold uppercase px-2 py-1 rounded text-white ${group.type === 'MCQ' ? 'bg-blue-500' : group.type === 'MATCHING' ? 'bg-purple-500' : 'bg-green-500'}`}>
                                      {group.type.replace('_', ' ')}
                                  </span>
                                  <input 
                                    className="font-bold text-lg text-slate-900 bg-transparent border-b border-transparent focus:border-slate-400 outline-none flex-grow placeholder-slate-400"
                                    value={group.title}
                                    onChange={e => updateGroup(idx, { ...group, title: e.target.value })}
                                    placeholder="Group Title (e.g. Questions 1-5)"
                                  />
                              </div>
                              <input 
                                className="w-full text-sm text-slate-600 bg-white border border-slate-300 rounded px-3 py-2 focus:ring-2 focus:ring-orange-200 outline-none"
                                value={group.instruction || ''}
                                onChange={e => updateGroup(idx, { ...group, instruction: e.target.value })}
                                placeholder="Instructions (e.g. Choose the correct letter A, B or C...)"
                              />
                          </div>
                          <button onClick={() => removeGroup(idx)} className="text-slate-400 hover:text-red-600 p-2 rounded hover:bg-red-50"><XIcon className="h-6 w-6"/></button>
                      </div>

                      {group.type === 'MCQ' && renderMCQGroup(group, idx)}
                      {group.type === 'MATCHING' && renderMatchingGroup(group, idx)}
                      {group.type === 'NOTES_COMPLETION' && renderNotesGroup(group, idx)}
                  </div>
              ))}
          </div>
      </div>
  );

  const renderDetailsTab = () => (
      <div className="space-y-6 max-w-3xl mx-auto">
          <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Drill Title</label>
              <input 
                value={module.title} 
                onChange={e => updateField('title', e.target.value)} 
                className="w-full border border-slate-300 p-3 rounded-md bg-white text-slate-900 focus:ring-2 focus:ring-orange-500 outline-none font-semibold" 
                placeholder="e.g., Mastering Passive Voice" 
              />
          </div>
          
          <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
              <textarea 
                value={module.description} 
                onChange={e => updateField('description', e.target.value)} 
                rows={2}
                className="w-full border border-slate-300 p-3 rounded-md bg-white text-slate-900 focus:ring-2 focus:ring-orange-500 outline-none text-sm" 
                placeholder="Short summary of what the student will learn..." 
              />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Category</label>
                  <select 
                    value={module.category} 
                    onChange={e => updateField('category', e.target.value)}
                    className="w-full border border-slate-300 p-3 rounded-md bg-white text-slate-900 focus:ring-2 focus:ring-orange-500 outline-none"
                  >
                      <option value="Grammar">Grammar</option>
                      <option value="Vocabulary">Vocabulary</option>
                      <option value="Coherence">Coherence</option>
                      <option value="Task Response">Task Response</option>
                  </select>
              </div>
              <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Difficulty</label>
                  <select 
                    value={module.difficulty} 
                    onChange={e => updateField('difficulty', e.target.value)}
                    className="w-full border border-slate-300 p-3 rounded-md bg-white text-slate-900 focus:ring-2 focus:ring-orange-500 outline-none"
                  >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                  </select>
              </div>
          </div>

          <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Tags (comma separated)</label>
              <input 
                value={tagsInput} 
                onChange={e => setTagsInput(e.target.value)} 
                className="w-full border border-slate-300 p-3 rounded-md bg-white text-slate-900 focus:ring-2 focus:ring-orange-500 outline-none" 
                placeholder="e.g. Task 1, Grammar, Maps" 
              />
          </div>
      </div>
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border border-slate-200 h-full flex flex-col relative text-slate-900">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-200 flex-shrink-0">
          <h3 className="text-2xl font-extrabold text-slate-900">{initialData ? 'Edit Drill Module' : 'Create New Drill'}</h3>
          <div className="flex gap-3 items-center">
              {initialData && onDelete && (
                  <button 
                    onClick={() => setIsDeleteConfirmOpen(true)} 
                    className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors border border-transparent hover:border-red-100" 
                    title="Delete Drill"
                  >
                      <TrashIcon />
                  </button>
              )}
              <button 
                onClick={() => setIsImportModalOpen(true)} 
                className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-md text-sm font-bold flex items-center gap-2 hover:bg-indigo-100 border border-indigo-100 transition-colors"
              >
                  <SparklesIcon /> AI Import
              </button>
              <div className="h-6 w-px bg-slate-300 mx-2"></div>
              <Button variant="secondary" onClick={onCancel}>Cancel</Button>
              <Button variant="primary" onClick={handleSave}>Save Changes</Button>
          </div>
      </div>

      {/* Delete Confirmation Modal - FIXED POSITIONING */}
      {isDeleteConfirmOpen && initialData && onDelete && (
          <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white p-8 rounded-xl shadow-2xl max-w-sm w-full text-center transform transition-all scale-100 border border-slate-200">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                      <TrashIcon />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Drill?</h3>
                  <p className="text-sm text-slate-500 mb-6">Are you sure you want to delete "{initialData.title}"? This action cannot be undone.</p>
                  <div className="flex gap-3 justify-center">
                      <Button variant="secondary" onClick={() => setIsDeleteConfirmOpen(false)} disabled={isDeleting}>Cancel</Button>
                      <button 
                        onClick={handleDeleteClick}
                        disabled={isDeleting}
                        className="px-4 py-2 bg-red-600 text-white rounded-md font-bold text-sm hover:bg-red-700 shadow-sm disabled:bg-red-400 flex items-center gap-2"
                      >
                          {isDeleting ? <><Spinner /> Deleting...</> : "Yes, Delete"}
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* AI Import Modal */}
      {isImportModalOpen && (
          <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white p-6 rounded-xl shadow-2xl max-w-2xl w-full border border-slate-200">
                  {isImporting ? (
                      <div className="text-center py-10">
                          <Spinner />
                          <h4 className="mt-4 font-bold text-lg text-slate-800">{loadingStatus.title}</h4>
                          <p className="text-sm text-slate-500">{loadingStatus.subtitle}</p>
                      </div>
                  ) : (
                      <>
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2"><SparklesIcon /> AI Magic Import</h3>
                            <button onClick={() => setIsImportModalOpen(false)} className="text-slate-400 hover:text-slate-600"><XIcon className="h-5 w-5"/></button>
                        </div>
                        <p className="text-sm text-slate-500 mb-4">Paste raw educational text below (e.g., from a book chapter). We will extract the lesson and generate exercises automatically.</p>
                        
                        <textarea 
                            value={importText} 
                            onChange={e => setImportText(e.target.value)} 
                            className="w-full h-48 border border-slate-300 rounded-md p-3 mb-4 text-sm bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none font-mono" 
                            placeholder="Paste text here..." 
                        />
                        
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Gemini API Key (Required for Admin)</label>
                        <input 
                            type="password" 
                            value={apiKey} 
                            onChange={e => setApiKey(e.target.value)} 
                            className="w-full border border-slate-300 rounded-md p-2 mb-4 text-sm bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none" 
                            placeholder="Enter your API Key" 
                        />
                        
                        {importError && <p className="text-red-600 text-sm mb-4 bg-red-50 p-2 rounded border border-red-200">{importError}</p>}
                        
                        <div className="flex justify-end gap-2">
                            <Button variant="secondary" onClick={() => setIsImportModalOpen(false)}>Cancel</Button>
                            <Button variant="primary" onClick={handleAIImport} disabled={!importText.trim() || !apiKey.trim()}>Generate Drill Module</Button>
                        </div>
                      </>
                  )}
              </div>
          </div>
      )}

      <div className="flex mb-6 border-b border-slate-200 flex-shrink-0">
          <button onClick={() => setActiveTab('details')} className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'details' ? 'border-orange-500 text-orange-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>1. Details</button>
          <button onClick={() => setActiveTab('lesson')} className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'lesson' ? 'border-orange-500 text-orange-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>2. Lesson Content</button>
          <button onClick={() => setActiveTab('groups')} className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'groups' ? 'border-orange-500 text-orange-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>3. Question Groups</button>
      </div>

      <div className="flex-grow overflow-y-auto px-1">
          {activeTab === 'details' && renderDetailsTab()}
          
          {activeTab === 'lesson' && (
              <textarea 
                value={module.lessonContent} 
                onChange={e => updateField('lessonContent', e.target.value)} 
                className="w-full h-full border border-slate-300 p-6 rounded-md font-mono text-sm bg-white text-slate-900 focus:ring-2 focus:ring-orange-500 outline-none resize-none shadow-sm" 
                placeholder="# Lesson Title\n\nWrite your lesson content in Markdown here..."
              />
          )}
          
          {activeTab === 'groups' && renderGroupsTab()}
      </div>
    </div>
  );
};

export default DrillEditor;
