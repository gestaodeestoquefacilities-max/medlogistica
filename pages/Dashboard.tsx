import React, { useState } from 'react';
import { useAppStore } from '../store';
import { useNavigate } from 'react-router-dom';
import { RequestStatus, Priority, DeliveryRequest } from '../types';
import { StatusBadge, PriorityBadge } from '../components/Badges';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  PackageOpen, 
  Loader2, 
  Truck, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  Search, 
  Filter, 
  ChevronRight,
  Box,
  Trash2,
  FileText,
  Tag
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { requests, getDashboardStats, deleteRequest, isLoading } = useAppStore();
  const navigate = useNavigate();
  const stats = getDashboardStats();

  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterPriority, setFilterPriority] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRequests = requests.filter((req) => {
    const matchesStatus = filterStatus === 'ALL' || req.status === filterStatus;
    const matchesPriority = filterPriority === 'ALL' || req.priority === filterPriority;
    const matchesSearch =
      req.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.trackingCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (req.jiraCode && req.jiraCode.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesPriority && matchesSearch;
  });

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Tem certeza que deseja excluir este chamado?')) {
      deleteRequest(id);
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(18);
    doc.text('Relatório de Entregas - MedLogística', 14, 20);
    
    doc.setFontSize(10);
    doc.text(`Gerado em: ${new Date().toLocaleString()}`, 14, 28);
    doc.text(`Total de Registros: ${filteredRequests.length}`, 14, 33);
    
    // Stats Summary in PDF
    doc.setFontSize(12);
    doc.text('Resumo Atual:', 14, 42);
    doc.setFontSize(10);
    const summaryText = `Abertos: ${stats.open} | Separando: ${stats.inProgress} | Trânsito: ${stats.inTransit} | Entregues: ${stats.delivered} | Urgentes: ${stats.urgent}`;
    doc.text(summaryText, 14, 48);

    // Table Data
    const tableBody = filteredRequests.map(req => [
      req.trackingCode,
      req.patientName,
      req.neighborhood,
      `${req.volumes} vol`,
      req.status,
      req.priority,
      new Date(req.createdAt).toLocaleDateString()
    ]);

    // Table
    autoTable(doc, {
      startY: 55,
      head: [['Cód.', 'Paciente', 'Bairro', 'Qtd', 'Status', 'Prioridade', 'Data']],
      body: tableBody,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] }, // Blue-500
      styles: { fontSize: 8 },
    });

    doc.save(`relatorio_medlogistica_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const generateLabels = () => {
    // Filtrar apenas 'Aberto' e 'Separando'
    const requestsToPrint = requests.filter(
      r => r.status === RequestStatus.OPEN || r.status === RequestStatus.SEPARATING
    );

    if (requestsToPrint.length === 0) {
      alert("Não há pedidos com status 'Aberto' ou 'Separando' para gerar etiquetas.");
      return;
    }

    const doc = new jsPDF();
    const labelWidth = 90;
    const labelHeight = 65;
    const marginX = 10;
    const marginY = 10;
    const gapX = 10;
    const gapY = 5;

    // Configurações de fonte
    const fontSizeTitle = 14;
    const fontSizeLabel = 9;
    const fontSizeValue = 10;

    requestsToPrint.forEach((req, index) => {
      // Lógica de Paginação (8 etiquetas por página: 2 colunas x 4 linhas)
      if (index > 0 && index % 8 === 0) {
        doc.addPage();
      }

      const positionOnPage = index % 8;
      const col = positionOnPage % 2; // 0 ou 1
      const row = Math.floor(positionOnPage / 2); // 0 a 3

      const x = marginX + (col * (labelWidth + gapX));
      const y = marginY + (row * (labelHeight + gapY));

      // Desenhar Borda da Etiqueta
      doc.setDrawColor(200); // Cinza claro
      doc.setLineWidth(0.5);
      doc.roundedRect(x, y, labelWidth, labelHeight, 2, 2, 'S');

      // Conteúdo
      let currentY = y + 10;
      const leftPadding = x + 5;
      const labelValueOffset = 25; // Distância do label para o valor

      // Cabeçalho: Cód Rastreio
      doc.setFont("helvetica", "bold");
      doc.setFontSize(fontSizeTitle);
      doc.text(req.trackingCode, leftPadding, currentY);
      
      // Status (Pequeno no canto)
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100);
      doc.text(req.status.toUpperCase(), x + labelWidth - 5, currentY, { align: 'right' });
      doc.setTextColor(0); // Reset cor

      // Linha separadora
      currentY += 4;
      doc.setDrawColor(220);
      doc.line(x, currentY, x + labelWidth, currentY);
      currentY += 8;

      // Jira
      doc.setFontSize(fontSizeLabel);
      doc.setFont("helvetica", "bold");
      doc.text("Cód. Jira:", leftPadding, currentY);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(fontSizeValue);
      doc.text(req.jiraCode || '-', leftPadding + labelValueOffset, currentY);
      
      currentY += 7;

      // Destinatário
      doc.setFontSize(fontSizeLabel);
      doc.setFont("helvetica", "bold");
      doc.text("Destinatário:", leftPadding, currentY);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(fontSizeValue);
      // Truncar nome se for muito longo
      const name = req.patientName.length > 25 ? req.patientName.substring(0, 24) + '...' : req.patientName;
      doc.text(name, leftPadding + labelValueOffset, currentY);

      currentY += 7;

      // Telefone
      doc.setFontSize(fontSizeLabel);
      doc.setFont("helvetica", "bold");
      doc.text("Telefone:", leftPadding, currentY);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(fontSizeValue);
      doc.text(req.phone, leftPadding + labelValueOffset, currentY);

      currentY += 7;

      // Endereço (Multi-line)
      doc.setFontSize(fontSizeLabel);
      doc.setFont("helvetica", "bold");
      doc.text("Endereço:", leftPadding, currentY);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(fontSizeValue);
      
      const fullAddress = `${req.street}, ${req.neighborhood} ${req.complement ? '- ' + req.complement : ''}`;
      const splitAddress = doc.splitTextToSize(fullAddress, labelWidth - labelValueOffset - 5);
      doc.text(splitAddress, leftPadding + labelValueOffset, currentY);
      
      // Ajustar Y baseado na altura do endereço
      currentY += (splitAddress.length * 5) + 2;

      // Volumes (Destaque)
      doc.setFontSize(fontSizeLabel);
      doc.setFont("helvetica", "bold");
      doc.text("Volume(s):", leftPadding, currentY);
      doc.setFontSize(14); // Maior
      doc.text(`${req.volumes}`, leftPadding + labelValueOffset, currentY);

    });

    doc.save(`etiquetas_pendentes_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-100px)] flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin mb-4 text-blue-500" />
        <p>Carregando dados...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Abertos" value={stats.open} icon={<PackageOpen className="text-gray-500" />} color="gray" />
        <StatCard title="Separando" value={stats.inProgress} icon={<Loader2 className="text-blue-500" />} color="blue" />
        <StatCard title="Em Trânsito" value={stats.inTransit} icon={<Truck className="text-amber-500" />} color="amber" />
        <StatCard title="Entregues" value={stats.delivered} icon={<CheckCircle2 className="text-emerald-500" />} color="emerald" />
        <StatCard title="Urgentes" value={stats.urgent} icon={<AlertCircle className="text-red-500" />} color="red" />
      </div>

      {/* Controls & List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-slate-800">Chamados de Entrega</h2>
          <div className="flex flex-col md:flex-row gap-3 md:items-center">
             <div className="relative flex-grow md:flex-grow-0">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Buscar..." 
                  className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-48 transition-colors"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
             
             <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
               <select 
                  className="py-2 pl-3 pr-8 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
               >
                 <option value="ALL">Todos os Status</option>
                 {Object.values(RequestStatus).map(s => <option key={s} value={s}>{s}</option>)}
               </select>

               <select 
                  className="py-2 pl-3 pr-8 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
               >
                 <option value="ALL">Todas Prioridades</option>
                 {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
               </select>
             </div>

             <div className="flex gap-2">
                <button 
                  onClick={generateLabels}
                  className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors shadow-sm"
                  title="Gerar Etiquetas (Aberto/Separando)"
                >
                  <Tag className="w-4 h-4 mr-2" />
                  Etiquetas
                </button>

                <button 
                  onClick={generatePDF}
                  className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors shadow-sm"
                  title="Exportar Relatório PDF"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  PDF
                </button>

                <button 
                  onClick={() => navigate('/requests/new')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors shadow-sm whitespace-nowrap"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Novo
                </button>
             </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {filteredRequests.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              Nenhum chamado encontrado com os filtros atuais.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-6 bg-slate-50/50">
              {filteredRequests.map((req) => (
                <RequestCard 
                  key={req.id} 
                  request={req} 
                  onClick={() => navigate(`/requests/${req.id}`)} 
                  onDelete={(e) => handleDelete(e, req.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ title: string; value: number; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => {
  const colorClasses: Record<string, string> = {
    gray: 'border-l-gray-500',
    blue: 'border-l-blue-500',
    amber: 'border-l-amber-500',
    emerald: 'border-l-emerald-500',
    red: 'border-l-red-500',
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-slate-100 p-4 border-l-4 ${colorClasses[color] || 'border-l-gray-300'}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{title}</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
        </div>
        <div className="p-2 bg-slate-50 rounded-lg">{icon}</div>
      </div>
    </div>
  );
};

const RequestCard: React.FC<{ request: DeliveryRequest; onClick: () => void; onDelete: (e: React.MouseEvent) => void }> = ({ request, onClick, onDelete }) => {
  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow cursor-pointer flex flex-col justify-between"
    >
      <div>
        <div className="flex justify-between items-start mb-3">
          <div className="flex flex-col">
            <span className="text-xs font-mono font-bold text-slate-400">#{request.trackingCode}</span>
            {request.jiraCode && <span className="text-xs text-blue-600 font-medium">Jira: {request.jiraCode}</span>}
          </div>
          <StatusBadge status={request.status} />
        </div>
        
        <div className="mb-4">
          <h3 className="text-lg font-bold text-slate-800 truncate">{request.patientName}</h3>
          <p className="text-sm text-slate-500 truncate mt-1">
             {request.street}, {request.neighborhood}
          </p>
        </div>

        <div className="space-y-2 mb-4">
           <div className="flex items-center text-sm text-slate-600">
             <Box className="w-4 h-4 mr-2 text-blue-400" />
             <span>{request.volumes} volume(s)</span>
           </div>
           <div className="flex items-center text-sm">
             <span className="text-slate-500 mr-2">Prioridade:</span>
             <PriorityBadge priority={request.priority} />
           </div>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100 flex justify-between items-center mt-auto">
         <span className="text-xs text-slate-400">
           {new Date(request.createdAt).toLocaleDateString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
         </span>
         <div className="flex items-center gap-2">
            <button 
              onClick={onDelete}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
              title="Excluir Chamado"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center">
                Detalhes <ChevronRight className="w-4 h-4 ml-1" />
            </button>
         </div>
      </div>
    </div>
  );
};

export default Dashboard;