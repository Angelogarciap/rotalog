import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface User {
  nome: string;
  email: string;
  telefone: string;
}

interface AuthContextData {
  user: User | null;
  loading: boolean;
  login: (email: string, senha: string) => Promise<void>;
  register: (dados: any) => Promise<void>;
  logout: () => void;
  recoverPassword: (email: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (email: string, _senha: string) => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setUser({ nome: 'Olga Mendes', email, telefone: '(92) 99999-0000' });
    setLoading(false);
  }, []);

  const register = useCallback(async (dados: any) => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setUser({ nome: dados.nome, email: dados.email, telefone: dados.telefone });
    setLoading(false);
  }, []);

  const logout = useCallback(() => setUser(null), []);

  const recoverPassword = useCallback(async (_email: string) => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setLoading(false);
    return true;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, recoverPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
