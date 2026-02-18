import React, { useState } from 'react';
import { useAppStore } from '../store';
import { Plus, Search, Bike, Car, User, Trash2 } from 'lucide-react';
import { Courier } from '../types';

const Couriers: React.FC = () => {
  const { couriers, addCourier, deleteCourier } = useAppStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCouriers = couriers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone.includes(searchTerm)
  );

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Tem certeza que deseja remover o entregador ${name}?`)) {
      deleteCourier(id);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Entregadores</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Entregador
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Filter */}
        <div className="p-4 border-b border-slate-100">
           <div className="relative max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Buscar por nome ou telefone..." 
                className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-full transition-colors"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
        </div>

        {/* List */}
        <div className="overflow-x-auto">
           <table className="min-w-full divide-y divide-slate-200">
             <thead className="bg-slate-50">
               <tr>
                 <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Entregador</th>
                 <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Veículo</th>
                 <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Contato</th>
                 <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                 <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Ações</th>
               </tr>
             </thead>
             <tbody className="bg-white divide-y divide-slate-200">
               {filteredCouriers.map((courier) => (
                 <tr key={courier.id}>
                   <td className="px-6 py-4 whitespace-nowrap">
                     <div className="flex items-center">
                       <div className="flex-shrink-0 h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
                          <User className="w-5 h-5" />
                       </div>
                       <div className="ml-4">
                         <div className="text-sm font-medium text-slate-900">{courier.name}</div>
                       </div>
                     </div>
                   </td>
                   <td className="px-6 py-4 whitespace-nowrap">
                     <div className="flex items-center text-sm text-slate-700">
                        {courier.vehicleType === 'Moto' ? <Bike className="w-4 h-4 mr-2" /> : <Car className="w-4 h-4 mr-2" />}
                        {courier.vehicleType} <span className="text-slate-400 mx-1">|</span> {courier.vehiclePlate}
                     </div>
                   </td>
                   <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                     {courier.phone}
                   </td>
                   <td className="px-6 py-4 whitespace-nowrap">
                     <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${courier.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                       {courier.active ? 'Ativo' : 'Inativo'}
                     </span>
                   </td>
                   <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                     <button 
                        onClick={() => handleDelete(courier.id, courier.name)}
                        className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-full transition-colors"
                        title="Excluir"
                     >
                       <Trash2 className="w-4 h-4" />
                     </button>
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>
        </div>
      </div>

      {isModalOpen && <AddCourierModal onClose={() => setIsModalOpen(false)} onSave={addCourier} />}
    </div>
  );
};

const AddCourierModal: React.FC<{ onClose: () => void; onSave: (c: Omit<Courier, 'id'>) => void }> = ({ onClose, onSave }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [vehicleType, setVehicleType] = useState<'Moto'|'Carro'|'Outro'>('Moto');
  const [plate, setPlate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      phone,
      vehicleType,
      vehiclePlate: plate,
      active: true,
      notes: ''
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Novo Entregador</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Nome Completo</label>
            <input required type="text" className="w-full border rounded-lg p-2 bg-slate-50 focus:bg-white" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Telefone</label>
            <input required type="text" className="w-full border rounded-lg p-2 bg-slate-50 focus:bg-white" value={phone} onChange={e => setPhone(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-medium text-slate-700">Veículo</label>
                <select className="w-full border rounded-lg p-2 bg-slate-50 focus:bg-white" value={vehicleType} onChange={e => setVehicleType(e.target.value as any)}>
                   <option value="Moto">Moto</option>
                   <option value="Carro">Carro</option>
                   <option value="Outro">Outro</option>
                </select>
             </div>
             <div>
                <label className="block text-sm font-medium text-slate-700">Placa</label>
                <input required type="text" className="w-full border rounded-lg p-2 uppercase bg-slate-50 focus:bg-white" value={plate} onChange={e => setPlate(e.target.value)} />
             </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Salvar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Couriers;