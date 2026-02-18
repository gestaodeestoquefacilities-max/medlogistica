import { Courier, DeliveryRequest, Priority, RequestStatus } from './types';

export const INITIAL_COURIERS: Courier[] = [
  {
    id: 'c1',
    name: 'João Silva',
    phone: '(11) 99999-1234',
    vehicleType: 'Moto',
    vehiclePlate: 'ABC-1234',
    active: true,
  },
  {
    id: 'c2',
    name: 'Maria Oliveira',
    phone: '(11) 98888-5678',
    vehicleType: 'Carro',
    vehiclePlate: 'XYZ-9876',
    active: true,
  },
];

export const INITIAL_REQUESTS: DeliveryRequest[] = [
  {
    id: 'r1',
    trackingCode: 'MED-8291',
    jiraCode: 'LOG-1001',
    patientName: 'Carlos Souza',
    phone: '(11) 97777-1111',
    street: 'Rua das Flores, 123',
    neighborhood: 'Centro',
    complement: 'Apto 101',
    volumes: 2,
    priority: Priority.HIGH,
    status: RequestStatus.OPEN,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    history: [
      { id: 'h1', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), status: RequestStatus.OPEN, description: 'Chamado criado' }
    ],
  },
  {
    id: 'r2',
    trackingCode: 'MED-9921',
    jiraCode: 'LOG-1042',
    patientName: 'Ana Beatriz',
    phone: '(11) 96666-2222',
    street: 'Av. Paulista, 1000',
    neighborhood: 'Bela Vista',
    volumes: 1,
    priority: Priority.MEDIUM,
    status: RequestStatus.TRANSIT,
    courierId: 'c1',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    history: [
      { id: 'h2', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), status: RequestStatus.OPEN, description: 'Chamado criado' },
      { id: 'h3', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(), status: RequestStatus.SEPARATING, description: 'Separando pedido' },
      { id: 'h4', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), status: RequestStatus.TRANSIT, description: 'Saiu para entrega com João Silva' },
    ],
  },
  {
    id: 'r3',
    trackingCode: 'MED-1029',
    jiraCode: 'LOG-1155',
    patientName: 'Roberto Mendes',
    phone: '(11) 95555-3333',
    street: 'Rua Augusta, 500',
    neighborhood: 'Consolação',
    complement: 'Fundos',
    volumes: 5,
    priority: Priority.HIGH,
    status: RequestStatus.SEPARATING,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    generalNotes: 'Manter refrigerado',
    history: [
      { id: 'h5', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), status: RequestStatus.OPEN, description: 'Chamado criado' },
      { id: 'h6', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(), status: RequestStatus.SEPARATING, description: 'Separando itens no estoque' },
    ],
  }
];