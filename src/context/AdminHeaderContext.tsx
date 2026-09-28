import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AdminHeaderContextType {
  title: string;
  setTitle: (title: string) => void;
  action: ReactNode | null;
  setAction: (action: ReactNode | null) => void;
}

const AdminHeaderContext = createContext<AdminHeaderContextType>({
  title: 'Dashboard',
  setTitle: () => {},
  action: null,
  setAction: () => {},
});

export const useAdminHeader = () => useContext(AdminHeaderContext);

export function AdminHeaderProvider({ children }: { children: ReactNode }) {
  const [title, setTitle] = useState('Dashboard');
  const [action, setAction] = useState<ReactNode | null>(null);

  return (
    <AdminHeaderContext.Provider value={{ title, setTitle, action, setAction }}>
      {children}
    </AdminHeaderContext.Provider>
  );
}
