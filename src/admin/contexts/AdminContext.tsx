import { createContext, useState, useEffect, ReactNode } from 'react';

interface Admin {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'moderator';
  permissions: string[];
}

interface AdminContextType {
  admin: Admin | null;
  login: (admin: Admin) => void;
  logout: () => void;
  updateAdmin: (updates: Partial<Admin>) => void;
}

const AdminContext = createContext<AdminContextType>({
  admin: null,
  login: () => {},
  logout: () => {},
  updateAdmin: () => {},
});

interface AdminProviderProps {
  children: ReactNode;
}

export const AdminProvider = ({ children }: AdminProviderProps) => {
  const [admin, setAdmin] = useState<Admin | null>(null);

  useEffect(() => {
    // Load current admin from localStorage
    const storedAdmin = localStorage.getItem('currentAdmin');
    if (storedAdmin) {
      setAdmin(JSON.parse(storedAdmin));
    }
  }, []);

  const login = (adminData: Admin) => {
    localStorage.setItem('currentAdmin', JSON.stringify(adminData));
    setAdmin(adminData);
  };

  const logout = () => {
    localStorage.removeItem('currentAdmin');
    setAdmin(null);
  };

  const updateAdmin = (updates: Partial<Admin>) => {
    if (admin) {
      const updatedAdmin = { ...admin, ...updates };
      localStorage.setItem('currentAdmin', JSON.stringify(updatedAdmin));
      setAdmin(updatedAdmin);
    }
  };

  return (
    <AdminContext.Provider value={{ admin, login, logout, updateAdmin }}>
      {children}
    </AdminContext.Provider>
  );
};

export default AdminContext;