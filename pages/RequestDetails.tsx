import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { RequestStatus, Priority, Courier } from '../types';
import { StatusBadge, PriorityBadge } from '../components/Badges';
import { 
  ArrowLeft, 
  MapPin, 
  Phone, 
  Box, 
  User, 
  Truck, 
  Calendar, 
  ExternalLink,
  Copy,
  Check,
  Trash2
} from 'lucide-react';

const RequestDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { requests, couriers, updateRequestStatus, deleteRequest, assignCourier } = useAppStore();
  const request = requests.find((r) => r.id === id);

  const [selectedCourierId, setSelectedCourierId] = useState<string>('');
  const [copied, setCopied] = useState(false);

  if (!request) {
    return <div className="text-center p-12">Chamado não encontrado.</div>;
  }

  const assignedCourier = couriers.find((c) => c.id === request.courierId);

  const statusOrder = [
    RequestStatus.OPEN,
    RequestStatus.SEPARATING,
    RequestStatus.TRANSIT,
    RequestStatus.DELIVERED,
  ];

  const currentStatusIndex = statusOrder.indexOf(request.status);
  const nextStatus = statusOrder[currentStatusIndex + 1];

  const handleAdvanceStatus = () => {
    if (!nextStatus) return;

    if (nextStatus === RequestStatus.TRANSIT && !request.courierId) {
      alert("É necessário atribuir um entregador antes de iniciar o trânsito.");
      return;
    }

    let description = `Status alterado para ${nextStatus}`;
    if (nextStatus === RequestStatus.DELIVERED) {
      description = "Entrega realizada com sucesso";
    }

    updateRequestStatus(request.id, nextStatus, description);
  };

  const handleAssignCourier = () => {
    if (selectedCourierId) {
      assignCourier(request.id, selectedCourierId);
    }
  };

  const handleDelete = () => {
    if (window.confirm('Tem certeza que deseja excluir este chamado? Esta ação não pode ser desfeita.')) {
      deleteRequest(request.id);
      navigate('/');
    }
  };

  const copyTrackingLink = () => {
    const url = `${window.location.origin}/#/tracking/${request.trackingCode}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <button 
          onClick={() => navigate('/')}
          className="text-slate-500 hover:text-slate-800 flex items-center text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Voltar para o Dashboard
        </button>

        <button 
          onClick={handleDelete}
          className="text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg flex items-center text-sm font-medium transition-colors"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Excluir Chamado
        </button>
      </div>

      {/* Header Info */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-800">Chamado #{request.trackingCode}</h1>
              <StatusBadge status={request.status} />
            </div>
            <div className="flex gap-4 mt-2 text-sm">
                <p className="text-slate-500 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {new Date(request.createdAt).toLocaleString()}
                </p>
                {request.jiraCode && (
                   <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 font-medium">
                      Jira: {request.jiraCode}
                   </span>
                )}
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
             <button 
               onClick={copyTrackingLink}
               className="flex items-center justify-center px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
             >
               {copied ? <Check className="w-4 h-4 mr-2 text-green-500" /> : <Copy className="w-4 h-4 mr-2" />}
               {copied ? "Link Copiado" : "Copiar Link de Rastreio"}
             </button>
             <button 
               onClick={() => window.open(`#/tracking/${request.trackingCode}`, '_blank')}
               className="flex items-center justify-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
             >
               <ExternalLink className="w-4 h-4 mr-2" />
               Rastreamento Público
             </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative py-4 px-2 hidden sm:block">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 rounded-full z-0" />
          <div 
             className="absolute top-1/2 left-0 h-1 bg-blue-500 -translate-y-1/2 rounded-full transition-all duration-500 z-0" 
             style={{ width: `${(currentStatusIndex / (statusOrder.length - 1)) * 100}%` }}
          />
          <div className="relative z-10 flex justify-between w-full">
            {statusOrder.map((step, idx) => {
              const isCompleted = idx <= currentStatusIndex;
              const isCurrent = idx === currentStatusIndex;
              return (
                <div key={step} className="flex flex-col items-center">
                  <div className={`w-4 h-4 rounded-full border-2 ${isCompleted ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-300'}`} />
                  <span className={`text-xs mt-2 font-medium ${isCurrent ? 'text-blue-700 font-bold' : 'text-slate-500'}`}>{step}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile Progress (Text) */}
        <div className="sm:hidden mb-4 p-4 bg-slate-50 rounded-lg">
           <span className="text-xs text-slate-500 uppercase font-bold">Status Atual</span>
           <p className="text-lg font-bold text-blue-700">{request.status}</p>
        </div>

        {/* Action Button */}
        {nextStatus && (
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleAdvanceStatus}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-sm shadow-blue-200 transition-all"
            >
              Avançar para: {nextStatus}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Patient Data */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-500" />
              Dados do Paciente
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase">Nome</label>
                <p className="text-slate-800 font-medium">{request.patientName}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase">Telefone</label>
                <p className="text-slate-800 flex items-center gap-2">
                   <Phone className="w-3 h-3 text-slate-400" />
                   {request.phone}
                </p>
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-slate-400 uppercase">Endereço de Entrega</label>
                <p className="text-slate-800 flex items-center gap-2">
                   <MapPin className="w-3 h-3 text-slate-400" />
                   {request.street}, {request.neighborhood}
                </p>
                {request.complement && (
                   <p className="text-slate-600 text-sm mt-1 ml-5">
                      Comp: {request.complement}
                   </p>
                )}
              </div>
            </div>
          </div>

          {/* Volumes/Items */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Box className="w-5 h-5 text-blue-500" />
              Volumes
            </h3>
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
               <div>
                  <p className="font-semibold text-slate-800">Quantidade de Volumes</p>
                  <p className="text-sm text-slate-500">Caixas/Pacotes para entrega</p>
               </div>
               <span className="text-2xl font-bold text-blue-600">{request.volumes}</span>
            </div>
            
            {request.generalNotes && (
              <div className="mt-4 p-3 bg-amber-50 rounded border border-amber-100 text-sm text-amber-800">
                <strong>Observações:</strong> {request.generalNotes}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Courier & History */}
        <div className="space-y-6">
          {/* Courier Assignment */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Truck className="w-5 h-5 text-blue-500" />
              Entregador
            </h3>
            
            {assignedCourier ? (
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                <p className="font-bold text-slate-800">{assignedCourier.name}</p>
                <p className="text-sm text-slate-500 mb-2">{assignedCourier.vehicleType} - {assignedCourier.vehiclePlate}</p>
                <p className="text-sm text-slate-500 flex items-center gap-1">
                  <Phone className="w-3 h-3" /> {assignedCourier.phone}
                </p>
                {request.status !== RequestStatus.DELIVERED && (
                  <button 
                    onClick={() => assignCourier(request.id, '')}
                    className="mt-3 text-xs text-red-600 hover:text-red-700 font-medium"
                  >
                    Trocar Entregador
                  </button>
                )}
              </div>
            ) : (
              request.status !== RequestStatus.DELIVERED ? (
                <div className="space-y-3">
                  <p className="text-sm text-slate-500">Nenhum entregador atribuído.</p>
                  <select
                    className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                    value={selectedCourierId}
                    onChange={(e) => setSelectedCourierId(e.target.value)}
                  >
                    <option value="">Selecione...</option>
                    {couriers.filter(c => c.active).map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.vehicleType})</option>
                    ))}
                  </select>
                  <button 
                    onClick={handleAssignCourier}
                    disabled={!selectedCourierId}
                    className="w-full bg-slate-800 hover:bg-slate-900 text-white text-sm py-2 rounded-lg font-medium disabled:opacity-50"
                  >
                    Atribuir
                  </button>
                </div>
              ) : (
                 <p className="text-sm text-slate-500">Entregue sem registro de entregador.</p>
              )
            )}
          </div>

          {/* History */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Histórico</h3>
            <div className="space-y-6 relative border-l border-slate-200 ml-2">
               {request.history.slice().reverse().map((log) => (
                 <div key={log.id} className="ml-6 relative">
                   <div className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-blue-500 border-2 border-white ring-1 ring-blue-100"></div>
                   <p className="text-sm font-semibold text-slate-800">{log.status}</p>
                   <p className="text-xs text-slate-500 mb-1">{new Date(log.timestamp).toLocaleString()}</p>
                   <p className="text-sm text-slate-600">{log.description}</p>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestDetails;