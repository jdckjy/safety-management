
import React, { useState } from 'react';
import { TaskKPI } from '../types';
import { MOCK_KPI_DATA } from '../constants';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Filter,
  CheckCircle2,
  AlertCircle,
  Users,
  CalendarDays,
  Target
} from 'lucide-react';

const PerformanceManagement: React.FC = () => {
  const [kpiList, setKpiList] = useState<TaskKPI[]>(MOCK_KPI_DATA);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSub, setFilterSub] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<TaskKPI>>({
    mainCategory: '의료서비스센터',
    subCategory: '입주유치',
    unitTask: '',
    kpi: '',
    criteria: '',
    cycle: '월',
    manager: ''
  });

  const subCategories = ['All', ...new Set(kpiList.map(k => k.subCategory))];

  const filteredList = kpiList.filter(k => {
    const matchesSearch = k.unitTask.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         k.kpi.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         k.manager.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterSub === 'All' || k.subCategory === filterSub;
    return matchesSearch && matchesFilter;
  });

  const handleDelete = (id: string) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      setKpiList(prev => prev.filter(k => k.id !== id));
    }
  };

  const handleEdit = (kpi: TaskKPI) => {
    setFormData(kpi);
    setEditingId(kpi.id);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setFormData({
      mainCategory: '의료서비스센터',
      subCategory: '입주유치',
      unitTask: '',
      kpi: '',
      criteria: '',
      cycle: '월',
      manager: ''
    });
    setEditingId(null);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      setKpiList(prev => prev.map(k => k.id === editingId ? { ...k, ...formData } as TaskKPI : k));
    } else {
      const newItem: TaskKPI = {
        ...formData as TaskKPI,
        id: `K${Date.now()}`
      };
      setKpiList(prev => [newItem, ...prev]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <Target className="w-6 h-6 text-indigo-600" />
            2026 성과관리 및 KPI 체계
          </h2>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">팀 업무분장 및 R&R 최적화 인터페이스</p>
        </div>
        <button 
          onClick={handleAddNew}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-black text-sm shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-2 active:scale-95"
        >
          <Plus className="w-5 h-5" /> 신규 업무 지표 등록
        </button>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50 bg-slate-50/30 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="업무, KPI, 담당자 검색..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-11 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select 
              value={filterSub}
              onChange={e => setFilterSub(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-600 focus:ring-2 focus:ring-indigo-500"
            >
              {subCategories.map(cat => <option key={cat} value={cat}>{cat === 'All' ? '전체 카테고리' : cat}</option>)}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">분류 체계</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">단위 업무(소분류)</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">핵심 지표(KPI)</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">측정 기준</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">주기/담당</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">작업</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredList.map((kpi) => (
                <tr key={kpi.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-5">
                    <span className="block text-[11px] font-black text-indigo-600 mb-1">{kpi.mainCategory}</span>
                    <span className="inline-block bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-[10px] font-bold">{kpi.subCategory}</span>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-sm font-bold text-slate-800 leading-tight">{kpi.unitTask}</p>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-sm font-black text-slate-700">{kpi.kpi}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 max-w-xs">
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">{kpi.criteria}</p>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400">
                        <CalendarDays className="w-3 h-3" /> {kpi.cycle}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] font-black text-indigo-500">
                        <Users className="w-3 h-3" /> {kpi.manager}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleEdit(kpi)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(kpi.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredList.length === 0 && (
            <div className="py-20 flex flex-col items-center justify-center text-slate-300">
              <AlertCircle className="w-16 h-16 stroke-[1] mb-4" />
              <p className="font-black uppercase tracking-widest text-xs">검색 결과가 없습니다</p>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-xl font-black text-slate-800">{editingId ? '업무 지표 수정' : '신규 업무 지표 등록'}</h3>
                <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mt-1">성과관리 시스템 v1.0</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
                <Plus className="w-6 h-6 rotate-45" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase mb-2 ml-1">대분류</label>
                  <select 
                    value={formData.mainCategory}
                    onChange={e => setFormData({...formData, mainCategory: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="의료서비스센터">의료서비스센터</option>
                    <option value="단지전반">단지전반</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase mb-2 ml-1">중분류</label>
                  <input 
                    type="text"
                    value={formData.subCategory}
                    onChange={e => setFormData({...formData, subCategory: e.target.value})}
                    placeholder="예: 입주유치, 단지관리"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase mb-2 ml-1">단위 업무 (소분류)</label>
                <input 
                  type="text"
                  value={formData.unitTask}
                  onChange={e => setFormData({...formData, unitTask: e.target.value})}
                  placeholder="구체적인 단위 업무명을 입력하세요"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase mb-2 ml-1">핵심 성과 지표 (KPI)</label>
                  <input 
                    type="text"
                    value={formData.kpi}
                    onChange={e => setFormData({...formData, kpi: e.target.value})}
                    placeholder="지표 명칭"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase mb-2 ml-1">관리 주기</label>
                  <select 
                    value={formData.cycle}
                    onChange={e => setFormData({...formData, cycle: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="월">월</option>
                    <option value="분기">분기</option>
                    <option value="반기">반기</option>
                    <option value="연">연</option>
                    <option value="발생 시">발생 시</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase mb-2 ml-1">측정 기준 또는 산식</label>
                <textarea 
                  rows={3}
                  value={formData.criteria}
                  onChange={e => setFormData({...formData, criteria: e.target.value})}
                  placeholder="데이터 측정 방식 및 산술식을 입력하세요"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase mb-2 ml-1">업무 담당자</label>
                <input 
                  type="text"
                  value={formData.manager}
                  onChange={e => setFormData({...formData, manager: e.target.value})}
                  placeholder="담당자 성명 (쉼표로 구분 가능)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="flex gap-4 pt-2">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black rounded-2xl transition-all"
                >
                  취소
                </button>
                <button 
                  type="submit"
                  className="flex-[2] py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-2"
                >
                  {editingId ? '지표 업데이트 완료' : '신규 지표 등록 완료'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceManagement;
