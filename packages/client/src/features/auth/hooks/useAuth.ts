import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as authApi from '../api/authApi';
import type { LoginInput, RegisterInput, PublicUser } from '@react-express-library/shared';

interface AuthState {
  user: PublicUser | null;
  isLoading: boolean;
  error: string | null;
}

export const useAuth = () => {
  const navigate = useNavigate();
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: false,
    error: null,
  });

  /**
   * Login handler
   */
  const login = async (credentials: LoginInput) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      await authApi.login(credentials);
      
      // Get user data after login
      const user = await authApi.getCurrentUser();
      setAuthState({ user, isLoading: false, error: null });
      
      // Delay navigation to show success toast
      setTimeout(() => {
        navigate('/books');
      }, 1500);
      
      return { success: true };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Invalid email or password';
      setAuthState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  };

  /**
   * Register handler
   */
  const register = async (userData: RegisterInput) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      await authApi.register(userData);
      
      // Auto login after register
      await login({ email: userData.email, password: userData.password });
      
      return { success: true };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      setAuthState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  };

  /**
   * Logout handler
   */
  const logout = () => {
    authApi.logout();
    setAuthState({ user: null, isLoading: false, error: null });
    navigate('/login');
  };

  /**
   * Load user data
   */
  const loadUser = async () => {
    if (!authApi.isAuthenticated()) {
      return;
    }

    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const user = await authApi.getCurrentUser();
      setAuthState({ user, isLoading: false, error: null });
    } catch (error: any) {
      setAuthState({ user: null, isLoading: false, error: null });
      authApi.logout();
    }
  };

  return {
    user: authState.user,
    isLoading: authState.isLoading,
    error: authState.error,
    login,
    register,
    logout,
    loadUser,
    isAuthenticated: authApi.isAuthenticated,
  };
};
