import React, { useState, useMemo } from 'react';
import { useAppStore } from '../store';
import { RequestStatus, Priority } from '../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  AreaChart,
  Area,
  Legend
} from 'recharts';
import { TrendingUp, Clock, CheckCircle, Package, MapPin, Calendar, Box, Presentation, Loader2 } from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const Analytics: React.FC = () => {
  const { requests } = useAppStore();
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Initialize filters with current date
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // --- Dynamic Year Logic ---
  const availableYears = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const yearsSet = new Set<number>([currentYear]);
    
    requests.forEach(req => {
      if (req.createdAt) {
        const y = new Date(req.createdAt).getFullYear();
        if (!isNaN(y)) {
           yearsSet.add(y);
        }
      }
    });

    return Array.from(yearsSet).sort((a, b) => a - b);
  }, [requests]);

  // --- Filter Logic ---
  const filteredRequests = useMemo(() => {
    return requests.filter(r => {
      const d = new Date(r.createdAt);
      return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
    });
  }, [requests, selectedMonth, selectedYear]);

  // --- KPIs Calculations based on Filtered Data ---

  // 1. Total Requests in Period
  const totalRequests = filteredRequests.length;

  // 2. Delivery Rate & Delivered Count
  const deliveredRequests = filteredRequests.filter(r => r.status === RequestStatus.DELIVERED);
  const deliveredCount = deliveredRequests.length;
  const deliveryRate = totalRequests > 0 ? Math.round((deliveredCount / totalRequests) * 100) : 0;

  // 3. Total Volumes Delivered (New KPI)
  const totalVolumesDelivered = deliveredRequests.reduce((acc, curr) => acc + curr.volumes, 0);

  // 4. Average Time (Contextual to the filtered delivered items)
  let avgTime = "-"; 
  if (deliveredCount > 0) {
    const totalDurationMs = deliveredRequests.reduce((acc, req) => {
      const created = new Date(req.createdAt).getTime();
      const deliveryLog = req.history
        .filter(h => h.status === RequestStatus.DELIVERED)
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())[0];
        
      const delivered = deliveryLog 
        ? new Date(deliveryLog.timestamp).getTime() 
        : new Date().getTime();
      
      return acc + (delivered - created);
    }, 0);
    
    const avgMinutes = Math.round(totalDurationMs / deliveredCount / 60000);
    
    if (avgMinutes < 60) {
      avgTime = `${avgMinutes} min`;
    } else {
      const h = Math.floor(avgMinutes / 60);
      const m = avgMinutes % 60;
      avgTime = `${h}h ${m}m`;
    }
  }

  // --- Chart Data Preparation ---

  // Neighborhood Analysis (New Chart)
  // Counts delivered requests per neighborhood
  const neighborhoodData = useMemo(() => {
    const map: Record<string, number> = {};
    deliveredRequests.forEach(r => {
      const hood = r.neighborhood || 'Não Informado';
      map[hood] = (map[hood] || 0) + 1;
    });

    return Object.entries(map)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 neighborhoods
  }, [deliveredRequests]);

  // Status Pie Chart
  const statusData = [
    { name: 'Aberto', value: filteredRequests.filter(r => r.status === RequestStatus.OPEN).length, color: '#94a3b8' },
    { name: 'Separando', value: filteredRequests.filter(r => r.status === RequestStatus.SEPARATING).length, color: '#3b82f6' },
    { name: 'Em Trânsito', value: filteredRequests.filter(r => r.status === RequestStatus.TRANSIT).length, color: '#f59e0b' },
    { name: 'Entregue', value: filteredRequests.filter(r => r.status === RequestStatus.DELIVERED).length, color: '#10b981' },
  ];

  // Daily Evolution (Area Chart) - Shows evolution throughout the selected month
  const dailyData = useMemo(() => {
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const data = [];
    
    for (let i = 1; i <= daysInMonth; i++) {
      const count = filteredRequests.filter(r => {
        const d = new Date(r.createdAt);
        return d.getDate() === i;
      }).length;
      data.push({ day: i, requests: count });
    }
    return data;
  }, [filteredRequests, selectedMonth, selectedYear]);

  // --- Presentation Generation Logic ---
  const generatePresentation = async () => {
    setIsGenerating(true);
    try {
      // Create landscape PDF (A4 landscape is approx 297mm x 210mm)
      // Using 'px' with hotfixes, but 'mm' is standard for A4.
      // Let's use 'mm' and calculate ratios.
      const doc = new jsPDF('l', 'mm', 'a4'); 
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // --- Slide 1: Cover ---
      // Background
      doc.setFillColor(37, 99, 235); // Blue-600
      doc.rect(0, 0, pageWidth, pageHeight, 'F');
      
      // Content
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(36);
      doc.text("Relatório de Resultados", pageWidth / 2, pageHeight / 2 - 10, { align: 'center' });
      
      doc.setFontSize(18);
      doc.text("MedLogística Analytics", pageWidth / 2, pageHeight / 2 + 10, { align: 'center' });
      
      doc.setFontSize(14);
      doc.text(`Período de Referência: ${MONTHS[selectedMonth]} de ${selectedYear}`, pageWidth / 2, pageHeight / 2 + 25, { align: 'center' });
      
      doc.setFontSize(10);
      doc.text(`Gerado em: ${new Date().toLocaleDateString()}`, pageWidth / 2, pageHeight - 10, { align: 'center' });

      // --- Helper to add charts ---
      const addChartSlide = async (elementId: string, title: string) => {
        const element = document.getElementById(elementId);
        if (element) {
          doc.addPage();
          
          // Header
          doc.setFillColor(248, 250, 252); // Slate-50
          doc.rect(0, 0, pageWidth, 25, 'F');
          doc.setTextColor(30, 41, 59); // Slate-800
          doc.setFontSize(18);
          doc.text(title, 15, 17);
          
          // Capture Chart
          const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#ffffff' });
          const imgData = canvas.toDataURL('image/png');
          
          // Fit image to slide (preserving aspect ratio, with margins)
          const margin = 15;
          const maxImgWidth = pageWidth - (margin * 2);
          const maxImgHeight = pageHeight - 35 - margin;
          
          const imgProps = doc.getImageProperties(imgData);
          const ratio = Math.min(maxImgWidth / imgProps.width, maxImgHeight / imgProps.height);
          
          const w = imgProps.width * ratio;
          const h = imgProps.height * ratio;
          
          const x = (pageWidth - w) / 2;
          const y = 35 + ((maxImgHeight - h) / 2); // Vertically centered in remaining space

          doc.addImage(imgData, 'PNG', x, y, w, h);
          
          // Footer
          doc.setFontSize(8);
          doc.setTextColor(148, 163, 184);
          doc.text("MedLogística - Confidencial", pageWidth - 15, pageHeight - 5, { align: 'right' });
        }
      };

      // --- Slide 2: KPIs ---
      await addChartSlide('kpi-section', 'Principais Indicadores');

      // --- Slide 3: Evolution ---
      await addChartSlide('chart-evolution', 'Evolução Diária de Chamados');

      // --- Slide 4: Neighborhood & Status (Grouped in UI, captured individually if needed, or capturing the row) ---
      // For simplicity in this layout, we capture the grid row.
      // However, html2canvas works best on specific containers.
      // Let's modify the UI slightly to allow capturing the bottom section easily.
      await addChartSlide('chart-bottom-row', 'Distribuição Geográfica e Status');

      doc.save(`Apresentacao_MedLogistica_${MONTHS[selectedMonth]}_${selectedYear}.pdf`);

    } catch (error) {
      console.error("Error generating presentation:", error);
      alert("Houve um erro ao gerar a apresentação. Tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8">
       {/* Header & Filters */}
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
         <h1 className="text-2xl font-bold text-slate-800">Indicadores de Performance</h1>
         
         <div className="flex flex-col sm:flex-row gap-3">
           <div className="flex items-center gap-3 bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
              <div className="flex items-center text-slate-500 px-2">
                <Calendar className="w-4 h-4 mr-2" />
                <span className="text-sm font-medium">Período:</span>
              </div>
              <select 
                value={selectedMonth} 
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="bg-slate-50 border-none text-sm font-medium text-slate-700 rounded focus:ring-2 focus:ring-blue-500 py-1"
              >
                {MONTHS.map((m, idx) => (
                  <option key={idx} value={idx}>{m}</option>
                ))}
              </select>
              <select 
                value={selectedYear} 
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="bg-slate-50 border-none text-sm font-medium text-slate-700 rounded focus:ring-2 focus:ring-blue-500 py-1"
              >
                {availableYears.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
           </div>

           <button 
             onClick={generatePresentation}
             disabled={isGenerating}
             className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center shadow-sm disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
           >
             {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Presentation className="w-4 h-4 mr-2" />}
             Gerar Apresentação
           </button>
         </div>
       </div>

       {/* Top KPI Cards */}
       <div id="kpi-section" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-2 rounded-xl bg-slate-50/50">
          <KpiCard 
             title="Total de Chamados" 
             value={totalRequests} 
             subtext="No período selecionado"
             subtextClass="text-slate-500"
             icon={<Package className="text-blue-600" />}
             bgClass="bg-blue-50"
          />
          <KpiCard 
             title="Volumes Entregues" 
             value={totalVolumesDelivered} 
             subtext="Caixas/Pacotes"
             subtextClass="text-purple-600"
             icon={<Box className="text-purple-600" />}
             bgClass="bg-purple-50"
          />
          <KpiCard 
             title="Taxa de Entrega" 
             value={`${deliveryRate}%`} 
             subtext={`${deliveredCount} concluídas`}
             subtextClass="text-emerald-600"
             icon={<CheckCircle className="text-emerald-600" />}
             bgClass="bg-emerald-50"
          />
          <KpiCard 
             title="Tempo Médio" 
             value={avgTime} 
             subtext="Do pedido à entrega"
             subtextClass="text-amber-600"
             icon={<Clock className="text-amber-600" />}
             bgClass="bg-amber-50"
          />
       </div>

       {/* Charts Grid */}
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Daily Evolution */}
          <div id="chart-evolution" className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 lg:col-span-2">
             <h3 className="text-lg font-semibold text-slate-800 mb-6">Evolução Diária - {MONTHS[selectedMonth]}/{selectedYear}</h3>
             <div className="h-72">
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={dailyData}>
                   <defs>
                     <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                       <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                     </linearGradient>
                   </defs>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} />
                   <XAxis dataKey="day" axisLine={false} tickLine={false} tickFormatter={(val) => `Dia ${val}`} />
                   <YAxis axisLine={false} tickLine={false} allowDecimals={false} />
                   <Tooltip 
                     contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                     cursor={{ stroke: '#94a3b8', strokeWidth: 1 }}
                     labelFormatter={(label) => `Dia ${label}`}
                   />
                   <Area type="monotone" dataKey="requests" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRequests)" name="Chamados" />
                 </AreaChart>
               </ResponsiveContainer>
             </div>
          </div>

          {/* Container for bottom row capture */}
          <div id="chart-bottom-row" className="lg:col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Neighborhood Analysis (New) */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
               <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-red-500" />
                  Top Bairros (Entregas Realizadas)
               </h3>
               <div className="h-80">
                 {neighborhoodData.length > 0 ? (
                   <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={neighborhoodData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                       <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                       <XAxis type="number" hide />
                       <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12}} />
                       <Tooltip 
                          contentStyle={{ borderRadius: '8px' }} 
                          cursor={{fill: '#f8fafc'}}
                       />
                       <Bar dataKey="count" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={20} name="Entregas">
                          {neighborhoodData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={`rgba(239, 68, 68, ${1 - (index * 0.08)})`} />
                          ))}
                       </Bar>
                     </BarChart>
                   </ResponsiveContainer>
                 ) : (
                   <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                     Nenhuma entrega realizada neste período.
                   </div>
                 )}
               </div>
            </div>

            {/* Status Distribution */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
               <h3 className="text-lg font-semibold text-slate-800 mb-4">Status dos Pedidos</h3>
               <div className="h-64">
                 {totalRequests > 0 ? (
                   <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                        <Pie
                          data={statusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {statusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: '8px' }} />
                     </PieChart>
                   </ResponsiveContainer>
                 ) : (
                   <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                     Sem dados para exibir.
                   </div>
                 )}
               </div>
               <div className="flex justify-center gap-4 mt-4 flex-wrap">
                  {statusData.map((entry) => (
                    <div key={entry.name} className="flex items-center text-xs text-slate-500">
                      <div className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: entry.color }}></div>
                      {entry.name} ({entry.value})
                    </div>
                  ))}
               </div>
            </div>
          </div>
       </div>
    </div>
  );
};

const KpiCard: React.FC<{ 
  title: string; 
  value: string | number; 
  subtext: string; 
  subtextClass?: string;
  icon: React.ReactNode;
  bgClass: string;
}> = ({ title, value, subtext, subtextClass, icon, bgClass }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between hover:shadow-md transition-shadow">
       <div className="flex justify-between items-start mb-4">
          <div className={`p-3 rounded-lg ${bgClass}`}>
             {icon}
          </div>
       </div>
       <div>
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-1">{title}</p>
          <h4 className="text-3xl font-bold text-slate-800">{value}</h4>
          <p className={`text-sm mt-2 font-medium ${subtextClass}`}>{subtext}</p>
       </div>
    </div>
  );
};

export default Analytics;