
import React, { useState, useEffect } from 'react';
import { X, Calendar, Edit3, Trash2, Plus, GripVertical } from 'lucide-react';
import { BusinessActivity, Plan, MonthlyRecord } from '../types';

interface ActivityDetailModalProps {
  activity: BusinessActivity | null | undefined; // Allow null or undefined
  accentColor: string;
  selectedMonth: number;
  onClose: () => void;
  onSave: (activity: BusinessActivity) => void;
  onDelete: () => void;
  onActivityUpdate: (activity: BusinessActivity) => void;
}

const ActivityDetailModal: React.FC<ActivityDetailModalProps> = ({ activity, accentColor, selectedMonth, onClose, onSave, onDelete, onActivityUpdate }) => {
  // If the activity is null or undefined, do not render the modal.
  // This is the ultimate safeguard against crashes.
  if (!activity) {
    return null;
  }

  const [currentActivity, setCurrentActivity] = useState(activity);
  const [newPlan, setNewPlan] = useState('');

  // This function now safely assumes `currentActivity` is valid.
  const getMonthlyRecord = (): MonthlyRecord => {
    const records = currentActivity.monthlyRecords || [];
    let record = records.find(m => m.month === selectedMonth + 1);
    if (!record) {
      record = { month: selectedMonth + 1, plans: [] };
    }
    return record;
  };

  const monthlyRecord = getMonthlyRecord();

  useEffect(() => {
    setCurrentActivity(activity);
  }, [activity]);

  const handlePlanChange = (index: number, newContent: string) => {
    const updatedPlans = [...(monthlyRecord.plans || [])];
    updatedPlans[index] = { ...updatedPlans[index], content: newContent };
    updateMonthlyRecord(updatedPlans);
  };

  const handleAddPlan = () => {
    if (!newPlan.trim()) return;
    const newPlanObject: Plan = {
      id: `plan-${Date.now()}`,
      content: newPlan,
      completed: false,
    };
    const updatedPlans = [...(monthlyRecord.plans || []), newPlanObject];
    updateMonthlyRecord(updatedPlans);
    setNewPlan('');
  };

  const handleDeletePlan = (planId: string) => {
    const updatedPlans = (monthlyRecord.plans || []).filter(p => p.id !== planId);
    updateMonthlyRecord(updatedPlans);
  };

  const togglePlanCompletion = (planId: string) => {
    const updatedPlans = (monthlyRecord.plans || []).map(p =>
      p.id === planId ? { ...p, completed: !p.completed } : p
    );
    updateMonthlyRecord(updatedPlans);
  };

  const updateMonthlyRecord = (updatedPlans: Plan[]) => {
    const updatedRecord = { ...monthlyRecord, plans: updatedPlans };
    const updatedMonthlyRecords = (currentActivity.monthlyRecords || []).map(m =>
      m.month === selectedMonth + 1 ? updatedRecord : m
    );
    if (!(currentActivity.monthlyRecords || []).some(m => m.month === selectedMonth + 1)) {
      updatedMonthlyRecords.push(updatedRecord);
    }
    const updatedActivity = { ...currentActivity, monthlyRecords: updatedMonthlyRecords };
    setCurrentActivity(updatedActivity);
    onActivityUpdate(updatedActivity);
  };
  
  const selectedMonthName = new Date(2024, selectedMonth).toLocaleString('ko-KR', { month: 'long' });

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center animate-in fade-in-50" onClick={onClose}>
      <div className="bg-[#F7F7F7] w-[90vw] max-w-2xl h-[80vh] rounded-6xl p-10 flex flex-col gap-8 shadow-2xl animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-1">
            <p className={`font-bold text-xs ${accentColor === 'orange' ? 'text-pink-500' : 'text-blue-400'}`}>
              Business Activity Performance
            </p>
            <h2 className="font-bold text-2xl text-gray-800 tracking-tight">{currentActivity.content}</h2>
          </div>
          <button onClick={onClose} className="p-2.5 bg-gray-200/50 hover:bg-gray-200 rounded-2xl text-gray-400 hover:text-black transition-all">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-4 -mr-4 space-y-5">
          <div className="p-6 bg-white rounded-4xl border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-700">{selectedMonthName} 실행 계획</h3>
              <div className="text-gray-400 text-xs font-bold uppercase tracking-wider">
                {monthlyRecord?.plans?.length ?? 0}개의 실행 계획
              </div>
            </div>
            <div className="space-y-3">
              {(monthlyRecord?.plans || []).map((plan, index) => (
                <div key={plan.id} className="flex items-center gap-3 group">
                   <GripVertical size={16} className="text-gray-300 cursor-grab" />
                   <input type="checkbox" checked={plan.completed} onChange={() => togglePlanCompletion(plan.id)} className="w-5 h-5 rounded-md accent-teal-500"/>
                   <input
                    type="text"
                    value={plan.content}
                    onChange={(e) => handlePlanChange(index, e.target.value)}
                    className={`flex-1 bg-transparent text-sm font-medium p-2 rounded-lg transition-all ${plan.completed ? 'text-gray-400 line-through' : 'text-gray-800'} focus:bg-gray-100`}
                  />
                  <button onClick={() => handleDeletePlan(plan.id)} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-pink-500 transition-all">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <input
              type="text"
              value={newPlan}
              onChange={(e) => setNewPlan(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddPlan()}
              placeholder="새로운 실행 계획 추가..."
              className="flex-1 px-6 py-4 bg-white rounded-full text-sm font-bold outline-none border border-gray-100 focus:border-gray-200 transition-all"
            />
            <button onClick={handleAddPlan} className="w-14 h-14 bg-black text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-all">
              <Plus size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityDetailModal;
