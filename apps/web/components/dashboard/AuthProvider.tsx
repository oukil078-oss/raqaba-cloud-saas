'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext<any>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState({ user: null, business: null, loading: true });
  const router = useRouter();

  useEffect(() => {
    // Fake loading for now to avoid loops
    const timer = setTimeout(() => {
      setState(s => ({ ...s, loading: false }));
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  if (state.loading) {
    return <div className="p-10 text-center">Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ ...state, logout: () => {} }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
