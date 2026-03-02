import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../services/api';
import { RequestStatus, DeliveryRequest } from '../types';
import { Package, MapPin, Clock, CheckCircle2, Box, Loader2, AlertCircle } from 'lucide-react';

const PublicTracking: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const [request, setRequest] = useState<DeliveryRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchTrackingData = async () => {
      if (!code) {
        setLoading(false);
        setError(true);
        return;
      }
      
      setLoading(true);
      setError(false);
      
      try {
        const data = await api.getPublicRequest(code);
        if (data) {
          setRequest(data);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error("Erro ao buscar rastreamento:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchTrackingData();
  }, [code]);

  if (loading) {
     return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
           <div className="flex flex-col items-center">
             <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
             <p className="text-slate-500 font-medium">Buscando informações...</p>
           </div>
        </div>
     );
  }

  if (!request || error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
         <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md w-full border border-slate-100">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-red-400" />
            </div>
            <h1 className="text-xl font-bold text-slate-800">Chamado não encontrado</h1>
            <p className="text-slate-500 mt-2">
              O código <span className="font-mono font-bold">{code || "(vazio)"}</span> não foi localizado em nosso sistema.
            </p>
            <p className="text-sm text-slate-400 mt-4">Verifique se o link está correto ou digite o código novamente.</p>
            
            <div className="mt-6 pt-6 border-t border-slate-100">
               <p className="text-xs text-slate-400 mb-3 uppercase font-bold tracking-wider">Tentar outro código</p>
               <form onSubmit={(e) => {
                 e.preventDefault();
                 const val = (e.currentTarget.elements.namedItem('newCode') as HTMLInputElement).value;
                 if (val) window.location.hash = `/tracking/${val}`;
               }} className="flex gap-2">
                  <input 
                    name="newCode"
                    type="text" 
                    placeholder="Ex: MED-1234"
                    className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors">
                    Buscar
                  </button>
               </form>
            </div>
         </div>
      </div>
    );
  }

  const statusOrder = [
    RequestStatus.OPEN,
    RequestStatus.SEPARATING,
    RequestStatus.TRANSIT,
    RequestStatus.DELIVERED,
  ];

  const currentStatusIndex = statusOrder.indexOf(request.status);

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6">
       <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
             <div className="inline-flex items-center justify-center p-3 bg-blue-600 rounded-xl shadow-lg mb-4">
                <Box className="w-8 h-8 text-white" />
             </div>
             <h1 className="text-3xl font-bold text-slate-900">Rastreamento de Entrega</h1>
             <p className="text-slate-500 mt-2">Código: <span className="font-mono font-bold text-slate-700">{request.trackingCode}</span></p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
             {/* Status Banner */}
             <div className="bg-blue-600 p-6 text-white text-center">
                <p className="text-blue-100 text-sm uppercase tracking-wide font-semibold">Status Atual</p>
                <p className="text-2xl font-bold mt-1">{request.status}</p>
             </div>

             {/* Visual Timeline */}
             <div className="p-8 border-b border-slate-100">
                <div className="relative">
                   <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-100"></div>
                   <div className="space-y-8">
                      {statusOrder.map((step, idx) => {
                         const isCompleted = idx <= currentStatusIndex;
                         const isCurrent = idx === currentStatusIndex;
                         return (
                            <div key={step} className="relative flex items-center">
                               <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 border-4 transition-colors ${isCompleted ? 'bg-blue-600 border-blue-50' : 'bg-white border-slate-200'}`}>
                                  {isCompleted && <CheckCircle2 className="w-4 h-4 text-white" />}
                               </div>
                               <div className={`ml-4 flex-1 ${isCurrent ? 'opacity-100' : isCompleted ? 'opacity-70' : 'opacity-40'}`}>
                                  <p className={`font-semibold ${isCurrent ? 'text-blue-600 text-lg' : 'text-slate-700'}`}>{step}</p>
                               </div>
                            </div>
                         );
                      })}
                   </div>
                </div>
             </div>

             {/* Details */}
             <div className="p-8 bg-slate-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div>
                      <h3 className="text-sm font-bold text-slate-400 uppercase mb-2">Destinatário</h3>
                      <p className="font-medium text-slate-800">{request.patientName}</p>
                      <div className="flex items-start mt-2 text-slate-600 text-sm">
                         <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                         <div>
                            <p>{request.street}</p>
                            <p>{request.neighborhood}</p>
                            {request.complement && <p className="text-slate-400 text-xs">Obs: {request.complement}</p>}
                         </div>
                      </div>
                   </div>
                   <div>
                      <h3 className="text-sm font-bold text-slate-400 uppercase mb-2">Volumes</h3>
                      <div className="flex items-center">
                         <Box className="w-5 h-5 text-slate-600 mr-2" />
                         <span className="text-xl font-bold text-slate-800">{request.volumes}</span>
                         <span className="ml-1 text-sm text-slate-500">unidade(s)</span>
                      </div>
                   </div>
                </div>
             </div>

             {/* History Log */}
             <div className="p-8">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Histórico de Movimentações</h3>
                <div className="space-y-4">
                   {request.history.slice().reverse().map(log => (
                      <div key={log.id} className="flex gap-4">
                         <div className="text-xs font-mono text-slate-400 w-24 pt-1">
                            {new Date(log.timestamp).toLocaleDateString()} <br/>
                            {new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                         </div>
                         <div>
                            <p className="font-semibold text-slate-800 text-sm">{log.status}</p>
                            <p className="text-slate-500 text-sm">{log.description}</p>
                         </div>
                      </div>
                   ))}
                </div>
             </div>
          </div>
          
          <div className="text-center mt-8 text-slate-400 text-sm">
             &copy; {new Date().getFullYear()} MedLogística - Saúde em movimento
          </div>
       </div>
    </div>
  );
};

export default PublicTracking;