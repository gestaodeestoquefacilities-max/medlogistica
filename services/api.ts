import { Courier, DeliveryRequest, RequestStatus } from '../types';
import { supabase } from './supabase';

// --- Helper Functions to Map Data Types ---

const mapRequestFromDB = (data: any): DeliveryRequest => ({
  id: data.id,
  trackingCode: data.tracking_code,
  jiraCode: data.jira_code,
  patientName: data.patient_name,
  phone: data.phone,
  street: data.street,
  neighborhood: data.neighborhood,
  complement: data.complement,
  volumes: data.volumes,
  priority: data.priority,
  status: data.status,
  courierId: data.courier_id,
  history: data.history || [],
  generalNotes: data.general_notes,
  createdAt: data.created_at
});

const mapRequestToDB = (req: Partial<DeliveryRequest>) => {
  const dbObj: any = {};
  if (req.trackingCode) dbObj.tracking_code = req.trackingCode;
  if (req.jiraCode) dbObj.jira_code = req.jiraCode;
  if (req.patientName) dbObj.patient_name = req.patientName;
  if (req.phone) dbObj.phone = req.phone;
  if (req.street) dbObj.street = req.street;
  if (req.neighborhood) dbObj.neighborhood = req.neighborhood;
  if (req.complement) dbObj.complement = req.complement;
  if (req.volumes) dbObj.volumes = req.volumes;
  if (req.priority) dbObj.priority = req.priority;
  if (req.status) dbObj.status = req.status;
  if (req.courierId !== undefined) dbObj.courier_id = req.courierId || null;
  if (req.history) dbObj.history = req.history;
  if (req.generalNotes) dbObj.general_notes = req.generalNotes;
  return dbObj;
};

const mapCourierFromDB = (data: any): Courier => ({
  id: data.id,
  name: data.name,
  phone: data.phone,
  vehicleType: data.vehicle_type,
  vehiclePlate: data.vehicle_plate,
  active: data.active,
  notes: data.notes
});

const mapCourierToDB = (courier: Partial<Courier>) => ({
  name: courier.name,
  phone: courier.phone,
  vehicle_type: courier.vehicleType,
  vehicle_plate: courier.vehiclePlate,
  active: courier.active,
  notes: courier.notes
});

// --- API Service ---

export const api = {
  // --- Auth ---
  
  login: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  signUp: async (email: string, password: string, name: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
      },
    });
    if (error) throw error;
    return data;
  },

  logout: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  getCurrentUser: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  // --- Requests ---
  
  getRequests: async (): Promise<DeliveryRequest[]> => {
    const { data, error } = await supabase
      .from('requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(mapRequestFromDB);
  },

  // Método seguro para busca pública via RPC
  getPublicRequest: async (trackingCode: string): Promise<DeliveryRequest | null> => {
    let normalizedCode = trackingCode.trim();
    // Se o código começar com "med-" ou "log-" (case insensitive), converte para maiúsculo
    if (normalizedCode.toLowerCase().startsWith('med-') || normalizedCode.toLowerCase().startsWith('log-')) {
      normalizedCode = normalizedCode.toUpperCase();
    }

    console.log("Chamando RPC get_request_by_tracking_code com:", normalizedCode);
    const { data, error } = await supabase
      .rpc('get_request_by_tracking_code', { code_input: normalizedCode });

    if (error) {
      console.error("Erro no RPC get_request_by_tracking_code:", error);
      // Tentar busca direta como fallback
      console.log("Tentando busca direta como fallback...");
      const { data: directData, error: directError } = await supabase
        .from('requests')
        .select('*')
        .or(`tracking_code.ilike.${normalizedCode},jira_code.ilike.${normalizedCode}`)
        .maybeSingle();
      
      if (directError) {
        console.error("Erro na busca direta:", directError);
        throw error; // Lança o erro original do RPC
      }
      
      if (directData) {
        console.log("Dados encontrados via busca direta:", directData);
        return mapRequestFromDB(directData);
      }
      
      return null;
    }

    if (!data || data.length === 0) {
      console.log("Nenhum dado retornado pelo RPC.");
      return null;
    }
    
    console.log("Dados retornados pelo RPC:", data[0]);
    // O RPC retorna um array de linhas (neste caso, 0 ou 1 linha)
    return mapRequestFromDB(data[0]);
  },

  createRequest: async (request: Partial<DeliveryRequest>): Promise<DeliveryRequest> => {
    const dbData = mapRequestToDB(request);
    
    const { data, error } = await supabase
      .from('requests')
      .insert(dbData)
      .select()
      .single();

    if (error) throw error;
    return mapRequestFromDB(data);
  },

  updateRequest: async (updatedRequest: DeliveryRequest): Promise<DeliveryRequest> => {
    const dbData = mapRequestToDB(updatedRequest);
    
    const { data, error } = await supabase
      .from('requests')
      .update(dbData)
      .eq('id', updatedRequest.id)
      .select()
      .single();

    if (error) throw error;
    return mapRequestFromDB(data);
  },

  deleteRequest: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('requests')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // --- Couriers ---
  
  getCouriers: async (): Promise<Courier[]> => {
    const { data, error } = await supabase
      .from('couriers')
      .select('*')
      .order('name');

    if (error) throw error;
    return data.map(mapCourierFromDB);
  },

  createCourier: async (courier: Partial<Courier>): Promise<Courier> => {
    const dbData = mapCourierToDB(courier);
    
    const { data, error } = await supabase
      .from('couriers')
      .insert(dbData)
      .select()
      .single();

    if (error) throw error;
    return mapCourierFromDB(data);
  },

  deleteCourier: async (id: string): Promise<void> => {
    // Primeiro remove o vínculo nos chamados
    await supabase
      .from('requests')
      .update({ courier_id: null })
      .eq('courier_id', id);

    // Depois deleta o entregador
    const { error } = await supabase
      .from('couriers')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};