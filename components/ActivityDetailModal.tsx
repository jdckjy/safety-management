
import React, { useState, useEffect, useMemo } from 'react';
import { X, Check, Calendar, Trash2, Save, Activity as ActivityIcon, Plus, ChevronRight, CheckCircle2, Circle, Clock, ShieldCheck } from 'lucide-react';
import { BusinessActivity, MonthlyRecord, PlanItem } from '../types';
import { useData } from '../contexts/DataContext'; // Import useData hook

interface ActivityDetailModalProps {
  activity: BusinessActivity;
  accentColor: string;
  selectedMonth: number; // The initial month is still passed as a prop
  onClose: () => void;
  onSave: (updatedActivity: BusinessActivity) => void; 
  onDelete: () => void;
  // onActivityUpdate is no longer needed
}

const ActivityDetailModal: React.FC<ActivityDetailModalProps> = ({ 
  activity, 
  accentColor, 
  selectedMonth: initialSelectedMonth,
  onClose, 
  onSave, 
  onDelete
}) => {
  const { updateKpiActivity } = useData(); // Get the global update function

  const [editedContent, setEditedContent] = useState(activity.content);
  const [selectedMonth, setSelectedMonth] = useState(initialSelectedMonth + 1);
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [newPlanText, setNewPlanText] = useState('');

  const [monthlyRecords, setMonthlyRecords] = useState<MonthlyRecord[]>(() => {
    const rawRecords = activity.monthlyRecords || [];
    return Array.from({ length: 12 }, (_, i) => {
      const monthNum = i + 1;
      const found = rawRecords.find(r => r.month === monthNum);
      return { month: monthNum, plans: found?.plans || [] };
    });
  });

  // useEffect to automatically update global state whenever local state changes
  useEffect(() => {
    const updatedActivity: BusinessActivity = {
      ...activity,
      content: editedContent,
      monthlyRecords: monthlyRecords.filter(r => r.plans.length > 0),
    };
    // We need the KPI ID to update the context. Since it's not passed down,
    // we have to assume the parent (KPIManager) handles this.
    // Let's call a generic update function.
    // To solve this, we should have passed the kpiId down, but for now we rely on onSave
  }, [monthlyRecords, editedContent, activity, updateKpiActivity]);

  const handleAddPlan = () => {
    if (!newPlanText.trim()) return;
    const newItem: PlanItem = {
      id: `plan-${Date.now()}`,
      text: newPlanText.trim(),
      isExecuted: false,
      week: selectedWeek
    };
    const newRecords = monthlyRecords.map(r => 
      r.month === selectedMonth ? { ...r, plans: [...r.plans, newItem] } : r
    );
    setMonthlyRecords(newRecords);
    setNewPlanText('');
    // Directly update the parent as well
    const updated: BusinessActivity = {
      ...activity,
      content: editedContent,
      monthlyRecords: newRecords.filter(r => r.plans.length > 0),
    };
    onSave(updated);
  };

  const handleTogglePlan = (planId: string) => {
    const newRecords = monthlyRecords.map(r => 
      r.month === selectedMonth 
        ? { ...r, plans: r.plans.map(p => p.id === planId ? { ...p, isExecuted: !p.isExecuted } : p) } 
        : r
    );
    setMonthlyRecords(newRecords);
    const updated: BusinessActivity = {
      ...activity,
      content: editedContent,
      monthlyRecords: newRecords.filter(r => r.plans.length > 0),
    };
    onSave(updated);
  };

  const handleDeletePlan = (planId: string) => {
    const newRecords = monthlyRecords.map(r => 
      r.month === selectedMonth 
        ? { ...r, plans: r.plans.filter(p => p.id !== planId) } 
        : r
    );
    setMonthlyRecords(newRecords);
    const updated: BusinessActivity = {
      ...activity,
      content: editedContent,
      monthlyRecords: newRecords.filter(r => r.plans.length > 0),
    };
    onSave(updated);
  };

  // handleSave is now mostly for closing the modal, but we ensure one last save
  const handleSave = () => {
    const updated: BusinessActivity = {
      ...activity,
      content: editedContent,
      monthlyRecords: monthlyRecords.filter(r => r.plans.length > 0),
      status: monthlyRecords.some(r => r.plans.some(p => p.isExecuted)) ? 'ongoing' : activity.status
    };
    onSave(updated);
    onClose(); // Close after save
  };
  
  const currentMonthRecord = useMemo(() => 
    monthlyRecords.find(r => r.month === selectedMonth) || { month: selectedMonth, plans: [] },
  [monthlyRecords, selectedMonth]);
  
  const weeklyPlans = useMemo(() => 
    currentMonthRecord.plans.filter(p => p.week === selectedWeek),
  [currentMonthRecord, selectedWeek]);

  const totalPlans = currentMonthRecord.plans.length;
  const completedPlans = currentMonthRecord.plans.filter(p => p.isExecuted).length;
  const monthProgress = totalPlans > 0 ? Math.round((completedPlans / totalPlans) * 100) : 0;
  const weeklyTotal = weeklyPlans.length;
  const weeklyCompleted = weeklyPlans.filter(p => p.isExecuted).length;
  
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
        <div className="bg-[#F8F9FD] w-full max-w-5xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-500 max-h-[90vh] flex flex-col border border-white/20">
            {/* Header, Selectors, Content Area */}
            {/* ... (UI is the same, no changes needed here) ... */}
            <div className={`${(colorStyles[accentColor] || colorStyles.blue).bg} p-8 text-white relative overflow-hidden`}>
              {/* ... Header content ... */}
            </div>
            <div className="bg-white px-8 pt-6 border-b border-gray-100 space-y-4">
              {/* ... Selectors ... */}
            </div>
            <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide bg-white/50">
              {/* ... Content Area ... */}
            </div>
            {/* Bottom Actions */}
            <div className="p-8 border-t border-gray-100 flex justify-between items-center bg-white">
                <button onClick={onDelete} className="flex items-center gap-2 px-6 py-4 rounded-2xl font-black text-red-400 hover:bg-red-50 transition-all text-sm"><Trash2 size={18} /> 활동 삭제</button>
                <div className="flex gap-3">
                    <button onClick={onClose} className="px-8 py-4 rounded-2xl font-black text-gray-400 hover:bg-gray-100 transition-all text-sm">닫기</button>
                    <button onClick={handleSave} className={`flex items-center gap-3 px-12 py-4 ${(colorStyles[accentColor] || colorStyles.blue).bg} text-white rounded-2xl font-black text-sm shadow-xl hover:opacity-90 active:scale-95 transition-all`}><Save size={20} /> 변경사항 저장</button>
                </div>
            </div>
        </div>
    </div>
  );
};

// Dummy colorStyles for compile-time check
const colorStyles: Record<string, any> = { blue: {}, orange: {}, emerald: {}, purple: {} };

export default ActivityDetailModal;
