import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiClient, User, AuthResponse } from '../api/api';

interface UserStats {
  totalProjects: number;
  completed: number;
  inProgress: number;
  avgRating: number;
}

interface AuthContextType {
  user: User | null;
  userStats: UserStats | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role?: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  refreshStats: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const userData = await apiClient.getMe();
          // Restore profilePicture from localStorage if present
          const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
          if (storedUser && storedUser.profilePicture) {
            userData.profilePicture = storedUser.profilePicture;
          }
          setUser(userData);
          await fetchUserStats();
        } catch (error) {
          console.error('Failed to get user data:', error);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const fetchUserStats = async () => {
    try {
      // Fetch projects to calculate stats
      const projectsData = await apiClient.getProjects();
      const projects = projectsData.projects || [];
      
      const totalProjects = projects.length;
      const completed = projects.filter(p => p.status === 'completed').length;
      const inProgress = projects.filter(p => p.status === 'in-progress').length;
      
      // Calculate average rating (mock for now, you can implement actual ratings)
      const avgRating = projects.length > 0 ? 4.5 + Math.random() * 0.5 : 0;
      
      setUserStats({
        totalProjects,
        completed,
        inProgress,
        avgRating: Math.round(avgRating * 10) / 10
      });
    } catch (error) {
      console.error('Failed to fetch user stats:', error);
      // Set default stats if fetch fails
      setUserStats({
        totalProjects: 0,
        completed: 0,
        inProgress: 0,
        avgRating: 0
      });
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response: AuthResponse = await apiClient.login(email, password);
      localStorage.setItem('token', response.token);
      // Get full user data
      const userData = await apiClient.getMe();
      // Restore profilePicture from localStorage if present
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      if (storedUser && storedUser.profilePicture) {
        userData.profilePicture = storedUser.profilePicture;
      }
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      await fetchUserStats();
    } catch (error) {
      console.error('Login failed:', error);
      // Log more detailed error information
      if (error.response) {
        console.error('Error status:', error.response.status);
        console.error('Error data:', error.response.data);
      }
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string, role?: string) => {
    try {
      const response: AuthResponse = await apiClient.register(name, email, password, role);
      localStorage.setItem('token', response.token);
      // Get full user data
      const userData = await apiClient.getMe();
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      await fetchUserStats();
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setUserStats(null);
  };

  const refreshStats = async () => {
    await fetchUserStats();
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const value: AuthContextType = {
    user,
    userStats,
    loading,
    login,
    register,
    logout,
    updateUser,
    refreshStats,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
