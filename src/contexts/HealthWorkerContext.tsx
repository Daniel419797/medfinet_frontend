import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface HealthWorker {
  id: string;
  name: string;
  facility_name: string;
  email: string;
  walletAddress: string;
  clinic: string;
  licenseNumber: string;
  verified: boolean;
  role: 'nurse' | 'doctor' | 'administrator';
}

interface HealthWorkerContextType {
  healthWorker: HealthWorker | null;
  login: (worker: HealthWorker) => void;
  logout: () => void;
  updateHealthWorker: (updates: Partial<HealthWorker>) => void;
  isAuthenticated: boolean;
}

const HealthWorkerContext = createContext<HealthWorkerContextType>({
  healthWorker: null,
  login: () => {},
  logout: () => {},
  updateHealthWorker: () => {},
  isAuthenticated: false,
});

export const useHealthWorker = () => {
  const context = useContext(HealthWorkerContext);
  if (!context) {
    throw new Error('useHealthWorker must be used within a HealthWorkerProvider');
  }
  return context;
};

interface HealthWorkerProviderProps {
  children: ReactNode;
}

export const HealthWorkerProvider = ({ children }: HealthWorkerProviderProps) => {
  const [healthWorker, setHealthWorker] = useState<HealthWorker | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('currentHealthWorker');
    if (stored) {
      try {
        setHealthWorker(JSON.parse(stored));
      } catch { /* ignore */ }
    }
  }, []);

  const login = (worker: HealthWorker) => {
    localStorage.setItem('currentHealthWorker', JSON.stringify(worker));
    setHealthWorker(worker);
  };

  const logout = () => {
    localStorage.removeItem('currentHealthWorker');
    localStorage.removeItem('connectedWallet');
    setHealthWorker(null);
  };

  const updateHealthWorker = (updates: Partial<HealthWorker>) => {
    if (healthWorker) {
      const updated = { ...healthWorker, ...updates };
      localStorage.setItem('currentHealthWorker', JSON.stringify(updated));
      setHealthWorker(updated);
    }
  };

  const isAuthenticated = healthWorker !== null && healthWorker.verified;

  return (
    <HealthWorkerContext.Provider value={{
      healthWorker, login, logout, updateHealthWorker, isAuthenticated,
    }}>
      {children}
    </HealthWorkerContext.Provider>
  );
};

export default HealthWorkerContext;