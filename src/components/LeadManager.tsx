
// src/components/LeadManager.tsx
import React, { useState } from 'react';
import { useAppData } from '../providers/AppDataContext';
import { Unit, Lead, LeadStatus } from '../types';
import { Plus, ChevronDown } from 'lucide-react';
import { LEAD_STATUS, LEAD_STATUS_DISPLAY_NAMES } from '../constants';

// 모달 컴포넌트 (파일 하단에서 전체 구현)
const AddLeadModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (leadData: Omit<Lead, 'id'>) => void;
  unitId: string;
}> = ({ isOpen, onClose, onSave, unitId }) => {
  const [customerName, setCustomerName] = useState('');
  const [customerTel, setCustomerTel] = useState('');

  const handleSave = () => {
    if (!customerName || !customerTel) {
      alert('고객 이름과 연락처를 모두 입력해주세요.');
      return;
    }
    onSave({
      target_unit_id: unitId,
      customer_info: {
        name: customerName,
        tel: customerTel,
      },
      status: LEAD_STATUS.NEW,
      created_at: new Date().toISOString(),
    });
    setCustomerName('');
    setCustomerTel('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h3 className="text-lg font-bold mb-4">신규 리드 추가</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">고객 이름</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">연락처</label>
            <input
              type="text"
              value={customerTel}
              onChange={(e) => setCustomerTel(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">취소</button>
          <button onClick={handleSave} className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">저장</button>
        </div>
      </div>
    </div>
  );
};

interface LeadManagerProps {
  selectedUnit: Unit | null;
}

const getStatusStyle = (status: LeadStatus) => {
  switch (status) {
    case LEAD_STATUS.NEW: return 'bg-blue-100 text-blue-800';
    case LEAD_STATUS.CONTACTED: return 'bg-yellow-100 text-yellow-800';
    case LEAD_STATUS.TOUR_SCHEDULED: return 'bg-purple-100 text-purple-800';
    case LEAD_STATUS.NEGOTIATING: return 'bg-indigo-100 text-indigo-800';
    case LEAD_STATUS.WON: return 'bg-green-100 text-green-800';
    case LEAD_STATUS.LOST: return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const LeadManager: React.FC<LeadManagerProps> = ({ selectedUnit }) => {
  const { leads, addLead, updateLead } = useAppData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const handleAddLead = async (leadData: Omit<Lead, 'id'>) => {
    await addLead(leadData);
  };

  const handleStatusChange = async (lead: Lead, newStatus: LeadStatus) => {
    const oldStatus = lead.status;
    await updateLead({ ...lead, status: newStatus }, oldStatus);
    setActiveDropdown(null);
  };

  if (!selectedUnit) return null;

  const unitLeads = leads.filter(lead => lead.target_unit_id === selectedUnit.id);

  return (
    <>
      <div className="mt-8 p-6 bg-white rounded-lg shadow-lg border border-gray-200">
        {/* 헤더: 유닛 정보와 리드 추가 버튼 */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">
            영업 기회 관리: <span className="font-normal text-blue-600">{selectedUnit.id}호</span>
          </h3>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Plus size={18} />
            리드 추가
          </button>
        </div>

        {unitLeads.length > 0 ? (
          <ul className="space-y-4 mt-4">
            {unitLeads.map(lead => (
              <li key={lead.id} className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-gray-900">{lead.customer_info.name}</p>
                    <p className="text-sm text-gray-500">{lead.customer_info.tel}</p>
                  </div>
                  <div className="relative">
                    <button 
                      onClick={() => setActiveDropdown(activeDropdown === lead.id ? null : lead.id)}
                      className={`flex items-center gap-2 text-xs font-bold px-3 py-1 rounded-full ${getStatusStyle(lead.status)}`}
                    >
                      {LEAD_STATUS_DISPLAY_NAMES[lead.status]}
                      <ChevronDown size={14} />
                    </button>
                    {activeDropdown === lead.id && (
                      <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-xl z-10 border">
                        {Object.entries(LEAD_STATUS_DISPLAY_NAMES).map(([statusKey, statusName]) => (
                          <button 
                            key={statusKey} 
                            onClick={() => handleStatusChange(lead, statusKey as LeadStatus)}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            {statusName}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          // [수정] 리드가 없을 때 표시될 UI
          <div className="text-center py-12 px-6 bg-gray-50/50 rounded-lg">
            <p className="font-bold text-gray-600">이 유닛에 대한 영업 기회(리드)가 아직 없습니다.</p>
            <p className="mt-2 text-sm text-gray-500">
              우측 상단의 '리드 추가' 버튼을 눌러 첫 영업 활동을 시작하세요.
            </p>
          </div>
        )}
      </div>
      <AddLeadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleAddLead} unitId={selectedUnit.id} />
    </>
  );
};

export default LeadManager;
