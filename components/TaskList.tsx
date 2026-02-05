
import React, { useState } from 'react';
import { Trash2, Check, X, Clock, User, ChevronRight } from 'lucide-react';
import { TaskItem, StateUpdater } from '../types';
import { db } from '../src/firebase';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import ActivityDetailModal from './ActivityDetailModal'; // Assuming this is the correct modal

interface TaskListProps {
  tasks: TaskItem[];
  onUpdate: () => void;
  selectedMonth: number;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, onUpdate, selectedMonth }) => {
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);

  const handleStatusChange = async (task: TaskItem) => {
    const taskRef = doc(db, 'tasks', task.id);
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    await updateDoc(taskRef, { status: newStatus });
    onUpdate();
  };

  const confirmDelete = async (id: string) => {
    const taskRef = doc(db, 'tasks', id);
    await deleteDoc(taskRef);
    setDeleteConfirmId(null);
    onUpdate();
  };

  const openModal = (task: TaskItem) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleSaveChanges = (updatedTask: any) => {
      // This is a placeholder. You'd likely want to save the `BusinessActivity` data
      // which might involve fetching, merging, and then updating a different Firestore document.
      console.log("Saving changes for", updatedTask);
      // For now, just refetch tasks if any sub-task status changed.
      onUpdate();
      setIsModalOpen(false);
  };

  return (
    <>
      <div className="flex flex-col h-full space-y-4">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <div key={task.id} className="flex items-center justify-between p-4 rounded-3xl bg-gray-50/50 border border-transparent hover:border-gray-100 hover:bg-white transition-all group">
              {/* ... same as before ... */}
              <div className="flex items-center gap-4 flex-1">
                <button 
                  className={`w-10 h-10 rounded-2xl border-2 flex items-center justify-center transition-all ${
                    task.status === 'completed' 
                      ? 'bg-pink-500 border-pink-500 text-white shadow-lg shadow-pink-100' 
                      : 'bg-white border-gray-100 text-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleStatusChange(task)}
                >
                  {task.status === 'completed' ? <Check size={18} strokeWidth={4} /> : <div className="w-2 h-2 rounded-full bg-gray-200" />}
                </button>
                
                <div className="min-w-0">
                  <p className={`text-sm font-bold truncate ${task.status === 'completed' ? 'text-gray-300 line-through' : 'text-gray-800'}`}>
                    {task.subject}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1 uppercase tracking-widest">
                      <Clock size={10} /> {task.time}
                    </span>
                    <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1 uppercase tracking-widest">
                      <User size={10} /> {task.assignee.split(' ')[0]}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 ml-4">
                 <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                    task.status === 'completed' ? 'bg-emerald-50 text-emerald-500' : 'bg-pink-50 text-pink-500'
                 }`}>
                   {task.status === 'completed' ? 'Success' : 'Active'}
                 </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {/* ... delete buttons ... */}
                    {deleteConfirmId === task.id ? (
                      <div className="flex gap-1">
                        <button onClick={() => confirmDelete(task.id)} className="p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"><Check size={12}/></button>
                        <button onClick={() => setDeleteConfirmId(null)} className="p-1.5 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 transition-colors"><X size={12}/></button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => setDeleteConfirmId(task.id)}
                        className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  <button onClick={() => openModal(task)} className="p-2 text-gray-300 hover:text-black rounded-xl transition-all">
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-gray-50/50 rounded-4xl border-2 border-dashed border-gray-100">
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No activities recorded</p>
          </div>
        )}
      </div>
      {isModalOpen && selectedTask && (
        <ActivityDetailModal
          activity={{ 
              id: selectedTask.id,
              type: 'safety', // Defaulting, you might need a way to determine this
              content: selectedTask.subject,
              monthlyRecords: [], // This would need to be fetched or passed in
              status: 'ongoing'
          }}
          accentColor="blue" // Defaulting
          selectedMonth={selectedMonth}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveChanges} // Placeholder save handler
          onDelete={() => { confirmDelete(selectedTask.id); setIsModalOpen(false); }} // Example delete
        />
      )}
    </>
  );
};

export default TaskList;
