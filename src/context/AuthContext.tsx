import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../services/api';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  supplierId: string | null;
  telefone?: string;
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
  const [user, setUser]       = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSession() {
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          const { data } = await api.get('/api/v1/auth/me');
          setUser(data);
          await AsyncStorage.setItem('user', JSON.stringify(data));
        }
      } catch {
        await AsyncStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    }
    loadSession();
  }, []);

  const login = useCallback(async (email: string, senha: string) => {
    setLoading(true);
    try {
      const { data } = await api.post('/api/v1/auth/login', { email, password: senha });
      await AsyncStorage.setItem('token', data.accessToken);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
    } catch {
      throw new Error('Email ou senha incorretos');
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (dados: any) => {
    setLoading(true);
    try {
      const { data } = await api.post('/api/v1/auth/register', {
        email: dados.email,
        name: dados.nome,
        password: dados.senha,
      });
      await AsyncStorage.setItem('token', data.accessToken);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
    } catch {
      throw new Error('Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/api/v1/auth/logout');
    } catch {
      // ignora erros no servidor
    } finally {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      setUser(null);
    }
  }, []);

  const recoverPassword = useCallback(async (email: string) => {
    setLoading(true);
    try {
      await api.post('/api/v1/auth/forgot-password', { email });
      return true;
    } catch {
      return false;
    } finally {
      setLoading(false);
    }
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
