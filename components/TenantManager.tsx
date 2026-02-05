
import React, { useState, useMemo } from 'react';
import { Tenant } from '../types';
import { Plus, Edit2, Trash2, Home, Briefcase, UserPlus, X, Save, Building } from 'lucide-react';

interface TenantManagerProps {
  tenants: Tenant[];
  onTenantsUpdate: React.Dispatch<React.SetStateAction<Tenant[]>>;
}

const TenantManager: React.FC<TenantManagerProps> = ({ tenants, onTenantsUpdate }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);

  const handleAddClick = () => {
    setEditingTenant(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (tenant: Tenant) => {
    setEditingTenant(tenant);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (tenantId: string) => {
    if (window.confirm('Are you sure you want to delete this tenant?')) {
      onTenantsUpdate(tenants.filter(t => t.id !== tenantId));
    }
  };

  const handleSave = (tenantData: Omit<Tenant, 'id'> | Tenant) => {
    if ('id' in tenantData) {
      onTenantsUpdate(tenants.map(t => t.id === tenantData.id ? tenantData : t));
    } else {
      const newTenant: Tenant = { ...tenantData, id: `tenant-${Date.now()}` };
      onTenantsUpdate([...tenants, newTenant]);
    }
    setIsModalOpen(false);
  };

  const tenantsByFloor = useMemo(() => {
    return tenants.reduce((acc, tenant) => {
      const floor = tenant.floor || 0;
      if (!acc[floor]) {
        acc[floor] = [];
      }
      acc[floor].push(tenant);
      return acc;
    }, {} as Record<number, Tenant[]>);
  }, [tenants]);

  const sortedFloors = useMemo(() => {
    return Object.keys(tenantsByFloor).map(Number).sort((a, b) => a - b);
  }, [tenantsByFloor]);

  const statusColors: Record<Tenant['status'], string> = {
    occupied: 'bg-emerald-100 text-emerald-600',
    vacant: 'bg-amber-100 text-amber-600',
    public: 'bg-sky-100 text-sky-600',
  };

  return (
    <div className="bg-white p-8 rounded-5xl shadow-sm border border-gray-50 h-full flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <h3 className="font-bold text-xl flex items-center gap-3"><Building size={22}/> Tenant Roster</h3>
        <button onClick={handleAddClick} className="flex items-center gap-2 px-5 py-3 bg-blue-500 text-white rounded-2xl text-sm font-bold shadow-lg hover:bg-blue-600 transition-all">
          <UserPlus size={16} />
          Add Tenant
        </button>
      </div>
      <div className="flex-grow space-y-6 overflow-y-auto -mr-4 pr-4 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-gray-50">
        {sortedFloors.map(floor => (
          <div key={floor}>
            <h4 className="font-bold text-gray-400 text-sm uppercase tracking-wider mb-3 px-2">{floor}F</h4>
            <div className="space-y-2">
              {tenantsByFloor[floor].map(tenant => (
                <div key={tenant.id} className="flex items-center justify-between p-4 bg-gray-50/80 rounded-2xl group hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${statusColors[tenant.status]} shadow-inner-white`}>
                      {tenant.status === 'public' ? <Home size={20} /> : <Briefcase size={20} />}
                    </div>
                    <div>
                      <p className="font-bold text-md text-gray-800">{tenant.name}</p>
                      <p className="text-sm text-gray-500">{tenant.usage} - {tenant.area}㎡</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEditClick(tenant)} className="p-2.5 hover:bg-gray-200 rounded-lg"><Edit2 size={16} className="text-gray-500" /></button>
                      <button onClick={() => handleDeleteClick(tenant.id)} className="p-2.5 hover:bg-red-100 rounded-lg"><Trash2 size={16} className="text-red-500"/></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
         {tenants.length === 0 && (
            <div className="text-center text-gray-400 py-16">
                <p className="font-semibold">No tenants listed.</p>
                <p className="text-sm mt-2">Click 'Add Tenant' to get started.</p>
            </div>
        )}
      </div>
      {isModalOpen && (
        <TenantModal 
          tenant={editingTenant}
          onSave={handleSave}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};


interface TenantModalProps {
    tenant: Tenant | null;
    onSave: (tenantData: Omit<Tenant, 'id'> | Tenant) => void;
    onClose: () => void;
}

const TenantModal: React.FC<TenantModalProps> = ({ tenant, onSave, onClose }) => {
    const [formData, setFormData] = useState<Omit<Tenant, 'id'>>({
        name: tenant?.name || '',
        usage: tenant?.usage || '',
        area: tenant?.area || 0,
        floor: tenant?.floor || 1, // Default to 1st floor
        status: tenant?.status || 'vacant',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'area' || name === 'floor' ? Number(value) : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (tenant) {
            onSave({ ...tenant, ...formData });
        } else {
            onSave(formData);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md animate-in zoom-in-95 duration-300">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold">{tenant ? 'Edit Tenant' : 'Add New Tenant'}</h2>
                        <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-gray-100"><X size={20}/></button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Tenant Name" className="col-span-2 p-3 bg-gray-50 border border-gray-200 rounded-lg" required />
                        <input type="text" name="usage" value={formData.usage} onChange={handleChange} placeholder="Usage Type" className="col-span-2 p-3 bg-gray-50 border border-gray-200 rounded-lg" required />
                        <input type="number" name="area" value={formData.area} onChange={handleChange} placeholder="Area (sqm)" className="p-3 bg-gray-50 border border-gray-200 rounded-lg" required />
                        <input type="number" name="floor" value={formData.floor} onChange={handleChange} placeholder="Floor" className="p-3 bg-gray-50 border border-gray-200 rounded-lg" required min="1"/>
                    </div>
                    <select name="status" value={formData.status} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg">
                        <option value="occupied">Occupied</option>
                        <option value="vacant">Vacant</option>
                        <option value="public">Public Area</option>
                    </select>
                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={onClose} className="px-6 py-3 rounded-lg font-semibold text-gray-600 hover:bg-gray-100">Cancel</button>
                        <button type="submit" className="px-6 py-3 rounded-lg font-semibold text-white bg-blue-500 hover:bg-blue-600 shadow-md flex items-center gap-2">
                          <Save size={16}/> {tenant ? 'Save Changes' : 'Create Tenant'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default TenantManager;
