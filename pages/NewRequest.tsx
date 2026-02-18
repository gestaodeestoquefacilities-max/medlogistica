import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { Priority } from '../types';
import { ArrowLeft, Box } from 'lucide-react';

const NewRequest: React.FC = () => {
  const navigate = useNavigate();
  const { addRequest } = useAppStore();

  const [jiraCode, setJiraCode] = useState('');
  const [patientName, setPatientName] = useState('');
  const [phone, setPhone] = useState('');
  const [priority, setPriority] = useState<Priority>(Priority.MEDIUM);
  
  // Address Split
  const [street, setStreet] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [complement, setComplement] = useState('');

  const [volumes, setVolumes] = useState<number>(1);
  const [generalNotes, setGeneralNotes] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName || !phone || !street || !neighborhood || !volumes) {
      alert("Preencha todos os campos obrigatórios.");
      return;
    }

    addRequest({
      jiraCode,
      patientName,
      phone,
      street,
      neighborhood,
      complement,
      priority,
      volumes,
      generalNotes: generalNotes || undefined
    });

    navigate('/');
  };

  return (
    <div className="max-w-3xl mx-auto">
      <button 
        onClick={() => navigate('/')}
        className="mb-6 text-slate-500 hover:text-slate-800 flex items-center text-sm font-medium"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Cancelar e Voltar
      </button>

      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="bg-blue-600 px-6 py-4">
          <h1 className="text-xl font-bold text-white">Novo Chamado de Entrega</h1>
          <p className="text-blue-100 text-sm">Preencha os dados de entrega.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          
          {/* Main Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Cód. Jira</label>
                <input 
                  type="text" 
                  className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-slate-50 focus:bg-white"
                  value={jiraCode}
                  onChange={e => setJiraCode(e.target.value)}
                  placeholder="Ex: LOG-1234"
                />
             </div>
             <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Prioridade</label>
                <select 
                  className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-slate-50 focus:bg-white"
                  value={priority}
                  onChange={e => setPriority(e.target.value as Priority)}
                >
                  {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
                </select>
             </div>
             
             <div className="md:col-span-2 border-t border-slate-100 pt-4 mt-2">
               <h3 className="text-sm font-bold text-slate-900 mb-4">Dados do Destinatário</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo *</label>
                    <input 
                      required
                      type="text" 
                      className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-slate-50 focus:bg-white"
                      value={patientName}
                      onChange={e => setPatientName(e.target.value)}
                      placeholder="Ex: Maria da Silva"
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Telefone *</label>
                    <input 
                      required
                      type="text" 
                      className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-slate-50 focus:bg-white"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="(00) 00000-0000"
                    />
                 </div>
               </div>
             </div>

             {/* Address */}
             <div className="md:col-span-2 border-t border-slate-100 pt-4 mt-2">
               <h3 className="text-sm font-bold text-slate-900 mb-4">Endereço de Entrega</h3>
               <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
                 <div className="md:col-span-4">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Endereço (Rua e Número) *</label>
                    <input 
                      required
                      type="text" 
                      className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-slate-50 focus:bg-white"
                      value={street}
                      onChange={e => setStreet(e.target.value)}
                      placeholder="Rua das Flores, 123"
                    />
                 </div>
                 <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Bairro *</label>
                    <input 
                      required
                      type="text" 
                      className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-slate-50 focus:bg-white"
                      value={neighborhood}
                      onChange={e => setNeighborhood(e.target.value)}
                      placeholder="Centro"
                    />
                 </div>
                 <div className="md:col-span-6">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Complemento</label>
                    <input 
                      type="text" 
                      className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-slate-50 focus:bg-white"
                      value={complement}
                      onChange={e => setComplement(e.target.value)}
                      placeholder="Apto 101, Bloco B"
                    />
                 </div>
               </div>
             </div>

             {/* Volumes */}
             <div className="md:col-span-2 border-t border-slate-100 pt-4 mt-2">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                   <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Volumes (Qtd) *</label>
                      <div className="relative">
                        <Box className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input 
                          required
                          type="number" 
                          min="1"
                          className="w-full pl-9 border-slate-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-slate-50 focus:bg-white"
                          value={volumes}
                          onChange={e => setVolumes(parseInt(e.target.value))}
                        />
                      </div>
                   </div>
                </div>
             </div>
          </div>

          {/* General Notes */}
          <div className="border-t border-slate-100 pt-4">
             <label className="block text-sm font-medium text-slate-700 mb-1">Observações Gerais (Opcional)</label>
             <textarea 
               rows={3}
               className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-slate-50 focus:bg-white"
               value={generalNotes}
               onChange={e => setGeneralNotes(e.target.value)}
               placeholder="Instruções especiais de entrega..."
             />
          </div>

          <div className="pt-4 flex justify-end">
            <button 
              type="submit"
              className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 transition-colors"
            >
              Criar Chamado
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewRequest;