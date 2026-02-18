import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { DeliveryRequest, Courier, RequestStatus, Priority, HistoryLog } from './types';
import { api } from './services/api';
import { supabase } from './services/supabase';

interface AppContextType {
  // Data
  requests: DeliveryRequest[];
  couriers: Courier[];
  isLoading: boolean;
  
  // Auth
  isAuthenticated: boolean;
  user: { name: string; email: string } | null;
  login: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  
  // Actions
  addRequest: (request: Omit<DeliveryRequest, 'id' | 'trackingCode' | 'status' | 'createdAt' | 'history'>) => Promise<void>;
  updateRequestStatus: (id: string, newStatus: RequestStatus, description: string) => Promise<void>;
  deleteRequest: (id: string) => Promise<void>;
  assignCourier: (requestId: string, courierId: string) => Promise<void>;
  addCourier: (courier: Omit<Courier, 'id'>) => Promise<void>;
  deleteCourier: (id: string) => Promise<void>;
  getDashboardStats: () => any;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [requests, setRequests] = useState<DeliveryRequest[]>([]);
  const [couriers, setCouriers] = useState<Courier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  // Initialize App & Auth Listener
  useEffect(() => {
    // 1. Setup Auth Listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        setIsAuthenticated(true);
        setUser({
          email: session.user.email || '',
          name: session.user.user_metadata?.full_name || 'Usuário',
        });
        // Fetch data when authenticated
        fetchData();
      } else {
        setIsAuthenticated(false);
        setUser(null);
        setRequests([]);
        setCouriers([]);
        setIsLoading(false);
      }
    });

    // 2. Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
       if (!session) {
         setIsLoading(false);
       }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [reqData, courData] = await Promise.all([
        api.getRequests(),
        api.getCouriers()
      ]);
      setRequests(reqData);
      setCouriers(courData);
    } catch (error) {
      console.error("Failed to fetch initial data", error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    // State is handled by onAuthStateChange
    await api.login(email, password);
  };

  const signUp = async (email: string, password: string, name: string) => {
    await api.signUp(email, password, name);
    // Note: If email confirmation is enabled in Supabase, the user won't be logged in immediately.
    // Assuming default settings where sign-up auto logs in or requires confirmation.
  };

  const logout = async () => {
    await api.logout();
    // State is handled by onAuthStateChange
  };

  const addRequest = async (data: Omit<DeliveryRequest, 'id' | 'trackingCode' | 'status' | 'createdAt' | 'history'>) => {
    const newRequestData: Partial<DeliveryRequest> = {
      ...data,
      trackingCode: `MED-${Math.floor(1000 + Math.random() * 9000)}`,
      status: RequestStatus.OPEN,
      history: [
        {
          id: Math.random().toString(36).substr(2, 9),
          timestamp: new Date().toISOString(),
          status: RequestStatus.OPEN,
          description: 'Chamado criado no sistema',
        },
      ],
    };

    try {
      const createdRequest = await api.createRequest(newRequestData);
      setRequests((prev) => [createdRequest, ...prev]);
    } catch (error) {
      console.error("Failed to add request", error);
      alert("Erro ao criar chamado.");
    }
  };

  const updateRequestStatus = async (id: string, newStatus: RequestStatus, description: string) => {
    const request = requests.find(r => r.id === id);
    if (!request) return;

    const newHistory: HistoryLog = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      status: newStatus,
      description,
    };

    const updatedRequest = { 
      ...request, 
      status: newStatus, 
      history: [...request.history, newHistory] 
    };

    try {
      await api.updateRequest(updatedRequest);
      setRequests((prev) => prev.map((req) => (req.id === id ? updatedRequest : req)));
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  const deleteRequest = async (id: string) => {
    try {
      await api.deleteRequest(id);
      setRequests((prev) => prev.filter((req) => req.id !== id));
    } catch (error) {
      console.error("Failed to delete request", error);
    }
  };

  const assignCourier = async (requestId: string, courierId: string) => {
    const request = requests.find(r => r.id === requestId);
    if (!request) return;

    // If courierId is empty string, we convert to undefined so API sends null
    const updatedRequest = { ...request, courierId: courierId || undefined };

    try {
      await api.updateRequest(updatedRequest);
      setRequests((prev) =>
        prev.map((req) => (req.id === requestId ? updatedRequest : req))
      );
    } catch (error) {
      console.error("Failed to assign courier", error);
    }
  };

  const addCourier = async (data: Omit<Courier, 'id'>) => {
    try {
      const createdCourier = await api.createCourier(data);
      setCouriers((prev) => [...prev, createdCourier]);
    } catch (error) {
      console.error("Failed to add courier", error);
    }
  };

  const deleteCourier = async (id: string) => {
    try {
      await api.deleteCourier(id);
      setCouriers((prev) => prev.filter((c) => c.id !== id));
      setRequests((prev) => 
        prev.map(req => req.courierId === id ? { ...req, courierId: undefined } : req)
      );
    } catch (error) {
      console.error("Failed to delete courier", error);
    }
  };

  const getDashboardStats = () => {
    return {
      open: requests.filter((r) => r.status === RequestStatus.OPEN).length,
      inProgress: requests.filter((r) => r.status === RequestStatus.SEPARATING).length,
      inTransit: requests.filter((r) => r.status === RequestStatus.TRANSIT).length,
      delivered: requests.filter((r) => r.status === RequestStatus.DELIVERED).length,
      urgent: requests.filter((r) => r.priority === Priority.HIGH && r.status !== RequestStatus.DELIVERED).length,
    };
  };

  return (
    <AppContext.Provider
      value={{
        requests,
        couriers,
        isLoading,
        isAuthenticated,
        user,
        login,
        signUp,
        logout,
        addRequest,
        updateRequestStatus,
        deleteRequest,
        assignCourier,
        addCourier,
        deleteCourier,
        getDashboardStats,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppStore = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppStore must be used within an AppProvider');
  }
  return context;
};