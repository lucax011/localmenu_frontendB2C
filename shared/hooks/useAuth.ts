import { useState } from 'react';

type AuthResponse = {
  token: string;
  user: any;
};

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function login(email: string, password: string): Promise<AuthResponse | null> {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('https://SEU_BACKEND_URL/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) throw new Error('Credenciais inválidas');
      const data = await response.json();
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }

  async function register(email: string, password: string): Promise<AuthResponse | null> {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('https://SEU_BACKEND_URL/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) throw new Error('Erro ao cadastrar');
      const data = await response.json();
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }
  
  async function resetPassword(email: string): Promise<boolean> {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('https://SEU_BACKEND_URL/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!response.ok) throw new Error('Erro ao solicitar recuperação de senha');
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }

  return { login, register, resetPassword, loading, error };
}