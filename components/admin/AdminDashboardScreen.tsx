import React, { useState } from 'react';
import { IeltsTest } from '../../types';
import AddTestForm from './AddTestForm';
import Button from '../common/Button';

interface AdminDashboardScreenProps {
  tests: IeltsTest[];
  onAddNewTest: (test: Omit<IeltsTest, 'id'>) => void;
  onUpdateTest: (test: IeltsTest) => void;
}

const AdminDashboardScreen: React.FC<AdminDashboardScreenProps> = ({ tests, onAddNewTest, onUpdateTest }) => {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [testToEdit, setTestToEdit] = useState<IeltsTest | null>(null);

  const handleShowAddForm = () => {
    setTestToEdit(null);
    setIsFormVisible(true);
  };

  const handleShowEditForm = (test: IeltsTest) => {
    setTestToEdit(test);
    setIsFormVisible(true);
  };
  
  const handleCancelForm = () => {
    setIsFormVisible(false);
    setTestToEdit(null);
  };

  const handleFormSubmit = (testData: Omit<IeltsTest, 'id'>, id?: number) => {
    if (id !== undefined) {
      onUpdateTest({ ...testData, id });
    } else {
      onAddNewTest(testData);
    }
    handleCancelForm();
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
            <h2 className="text-3xl font-extrabold text-slate-900">Admin Portal</h2>
            <p className="mt-1 text-lg text-slate-500">Manage Practice Tests</p>
        </div>
        <Button variant="primary" onClick={handleShowAddForm} disabled={isFormVisible}>
          Add New Test
        </Button>
      </div>

      {isFormVisible && (
        <AddTestForm 
          initialData={testToEdit}
          onSubmit={handleFormSubmit} 
          onCancel={handleCancelForm} 
        />
      )}

      <div className="bg-white shadow-md rounded-lg overflow-hidden border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="text-xl font-semibold text-slate-800">Test Library ({tests.length})</h3>
        </div>
        <ul className="divide-y divide-slate-200">
          {tests.map((test) => (
            <li key={test.id} className="p-6 hover:bg-slate-50 flex justify-between items-center">
              <h4 className="font-bold text-lg text-slate-800">{test.title}</h4>
              <div className="flex-shrink-0 ml-4">
                 <Button variant="secondary" onClick={() => handleShowEditForm(test)}>
                    Edit
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AdminDashboardScreen;