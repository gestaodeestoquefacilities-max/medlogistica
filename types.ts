export enum RequestStatus {
  OPEN = 'Aberto',
  SEPARATING = 'Separando',
  TRANSIT = 'Em Trânsito',
  DELIVERED = 'Entregue',
}

export enum Priority {
  LOW = 'Baixa',
  MEDIUM = 'Média',
  HIGH = 'Alta',
}

export interface HistoryLog {
  id: string;
  timestamp: string;
  status: RequestStatus;
  description: string;
}

export interface DeliveryRequest {
  id: string;
  trackingCode: string; // Internal system code
  jiraCode: string;     // External reference
  patientName: string;
  phone: string;
  
  // Address breakdown
  street: string;
  neighborhood: string;
  complement?: string;

  volumes: number;      // Quantity only
  priority: Priority;
  status: RequestStatus;
  createdAt: string;
  courierId?: string;
  history: HistoryLog[];
  generalNotes?: string;
}

export interface Courier {
  id: string;
  name: string;
  phone: string;
  vehicleType: 'Moto' | 'Carro' | 'Outro';
  vehiclePlate: string;
  active: boolean;
  notes?: string;
}

export interface DashboardStats {
  open: number;
  inProgress: number; 
  inTransit: number;
  delivered: number;
  urgent: number;
}