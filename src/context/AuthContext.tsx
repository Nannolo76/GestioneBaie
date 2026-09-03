/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types';


interface AuthContextType {
  currentRole: 'ADMIN' | 'GUARDIA' | 'VETTORE' | 'PREPOSTO' | null;
  currentUser: User | null;
  currentCarrierId: string;
  simulatedEmails: { userId: string; userName: string; userEmail: string; confirmLink: string }[];
  setCurrentRole: (role: 'ADMIN' | 'GUARDIA' | 'VETTORE' | 'PREPOSTO' | null) => void;
  setCurrentUser: (user: User | null) => void;
  setCurrentCarrierId: (carrierId: string) => void;
  clearSimulatedEmail: (userId: string) => void;
  setSimulatedEmails: React.Dispatch<React.SetStateAction<any[]>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'yard_management_system_state_v6';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<'ADMIN' | 'GUARDIA' | 'VETTORE' | 'PREPOSTO' | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentCarrierId, setCurrentCarrierId] = useState<string>('');
  const [simulatedEmails, setSimulatedEmails] = useState<{ userId: string; userName: string; userEmail: string; confirmLink: string }[]>([]);

  // Caricamento preferenze locali
  useEffect(() => {
    const savedState = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        if (parsed.currentRole !== undefined) setCurrentRole(parsed.currentRole);
        if (parsed.currentUser !== undefined) setCurrentUser(parsed.currentUser);
        if (parsed.currentCarrierId !== undefined) setCurrentCarrierId(parsed.currentCarrierId);
      } catch {
        console.error('Errore nel caricamento delle preferenze locali (Auth)', e);
      }
    }
  }, []);

  // Salvataggio preferenze locali
  useEffect(() => {
    const stateToSave = { currentRole, currentUser, currentCarrierId };
    const savedState = localStorage.getItem(LOCAL_STORAGE_KEY);
    let parsed = {};
    if (savedState) {
       try { parsed = JSON.parse(savedState); } catch {}
    }
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ ...parsed, ...stateToSave }));
  }, [currentRole, currentUser, currentCarrierId]);

  const clearSimulatedEmail = (userId: string) => {
    setSimulatedEmails((prev) => prev.filter((e) => e.userId !== userId));
  };

  return (
    <AuthContext.Provider value={{
      currentRole, currentUser, currentCarrierId, simulatedEmails,
      setCurrentRole, setCurrentUser, setCurrentCarrierId, clearSimulatedEmail, setSimulatedEmails
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
