import React, { useState, useEffect } from 'react';
import { IeltsTest, TestTask } from '../../types';
import Button from '../common/Button';

interface AddTestFormProps {
  initialData?: IeltsTest | null;
  onSubmit: (test: Omit<IeltsTest, 'id'>, id?: number) => void;
  onCancel: () => void;
}

const AddTestForm: React.FC<AddTestFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const [title, setTitle] = useState('');
  const [task1Prompt, setTask1Prompt] = useState('');
  const [task1ImageUrl, setTask1ImageUrl] = useState('');
  const [task1KeyInformation, setTask1KeyInformation] = useState('');
  const [task2Prompt, setTask2Prompt] = useState('');
  const [tags, setTags] = useState('');

  const isEditing = !!initialData;

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setTask1Prompt(initialData.tasks[0].prompt);
      setTask1ImageUrl(initialData.tasks[0].imageUrl || '');
      setTask1KeyInformation(initialData.tasks[0].keyInformation || '');
      setTask2Prompt(initialData.tasks[1].prompt);
      setTags(initialData.tags?.join(', ') || '');
    } else {
        setTitle('');
        setTask1Prompt('');
        setTask1ImageUrl('');
        setTask1KeyInformation('');
        setTask2Prompt('');
        setTags('');
    }
  }, [initialData]);
  
  const canSubmit = title && task1Prompt && task2Prompt;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    const newTest: Omit<IeltsTest, 'id'> = {
      title,
      tasks: [
        { 
          prompt: task1Prompt, 
          imageUrl: task1ImageUrl || undefined,
          keyInformation: task1KeyInformation || undefined,
        },
        { prompt: task2Prompt },
      ],
      tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
    };
    onSubmit(newTest, initialData?.id);
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg border border-slate-200">
      <form onSubmit={handleSubmit} className="space-y-6">
        <h3 className="text-xl font-semibold text-slate-800 border-b border-slate-200 pb-2">
          {isEditing ? `Editing: ${initialData.title}` : 'Create New Test'}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="test-title" className="block text-sm font-medium text-slate-600">Test Title</label>
              <input type="text" id="test-title" value={title} onChange={(e) => setTitle(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-slate-300 bg-slate-50 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-slate-900"
                required />
            </div>
            <div>
              <label htmlFor="test-tags" className="block text-sm font-medium text-slate-600">Test Tags (comma-separated)</label>
              <input type="text" id="test-tags" value={tags} onChange={(e) => setTags(e.target.value)}
                placeholder="e.g. Line Graph, Technology, Agree or Disagree"
                className="mt-1 block w-full px-3 py-2 border border-slate-300 bg-slate-50 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-slate-900" />
            </div>
        </div>


        <div className="space-y-4 rounded-md border border-slate-200 p-4 bg-slate-50/50">
            <h4 className="font-medium text-slate-800">Task 1 Details</h4>
            <div>
              <label htmlFor="task1-image-url" className="block text-sm font-medium text-slate-600">Task 1 Image URL (e.g., from Postimage)</label>
              <input type="url" id="task1-image-url" value={task1ImageUrl} onChange={(e) => setTask1ImageUrl(e.target.value)}
                placeholder="https://i.postimg.cc/..."
                className="mt-1 block w-full px-3 py-2 border border-slate-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-slate-900" />
            </div>
            {task1ImageUrl && (
              <div className="mt-2 text-center">
                <img src={task1ImageUrl} alt="Task 1 preview" className="max-w-xs mx-auto rounded-md border p-1 border-slate-300 bg-white" />
                <button type="button" onClick={() => setTask1ImageUrl('')} className="mt-2 text-xs text-red-600 hover:underline">Remove Image</button>
              </div>
            )}
            <div>
                <label htmlFor="task1-prompt" className="block text-sm font-medium text-slate-600">Task 1 Prompt</label>
                <textarea id="task1-prompt" value={task1Prompt} onChange={(e) => setTask1Prompt(e.target.value)} rows={3}
                className="mt-1 block w-full px-3 py-2 border border-slate-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-slate-900"
                required />
            </div>
             <div>
                <label htmlFor="task1-key-information" className="block text-sm font-medium text-slate-600">Task 1 Key Information & Statistics (Optional)</label>
                <textarea id="task1-key-information" value={task1KeyInformation} onChange={(e) => setTask1KeyInformation(e.target.value)} rows={5}
                className="mt-1 block w-full px-3 py-2 border border-slate-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-slate-900 font-mono text-xs"
                placeholder="- Fact 1 from the chart...&#10;- Fact 2 from the chart..." />
                <p className="mt-1 text-xs text-slate-400">Provide a bulleted list of key data points to ensure AI accuracy.</p>
            </div>
        </div>
        
        <div className="space-y-4 rounded-md border border-slate-200 p-4 bg-slate-50/50">
            <h4 className="font-medium text-slate-800">Task 2 Details</h4>
            <div>
                <label htmlFor="task2-prompt" className="block text-sm font-medium text-slate-600">Task 2 Prompt</label>
                <textarea id="task2-prompt" value={task2Prompt} onChange={(e) => setTask2Prompt(e.target.value)} rows={3}
                className="mt-1 block w-full px-3 py-2 border border-slate-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-slate-900"
                required />
            </div>
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
          <Button type="submit" variant="primary" disabled={!canSubmit}>
            {isEditing ? 'Update Test' : 'Save Test'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddTestForm;