import api from './api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'MANAGER' | 'ADMIN';
}

export interface AuthResponse {
  token: string;
  user: User;
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    console.log('🔐 AuthService: Attempting login to:', api.defaults.baseURL);
    console.log('🔐 AuthService: Credentials email:', credentials.email);
    
    try {
      const response = await api.post('/auth/login', credentials);
      console.log('✅ AuthService: Login response received:', response.status);
      
      const { token, user } = response.data;
      
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      console.log('✅ AuthService: Token stored, user:', user.email);
      return { token, user };
    } catch (error) {
      console.error('❌ AuthService: Login failed:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch {
      // Continue with logout even if API call fails
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
    }
  }

  async verifyToken(): Promise<User | null> {
    try {
      const token = this.getToken();
      if (!token) {
        return null;
      }
      
      const response = await api.get('/auth/verify');
      return response.data.user;
    } catch {
      // Don't call logout on verification failure to prevent loops
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      return null;
    }
  }

  getCurrentUser(): User | null {
    const userString = localStorage.getItem('user');
    if (userString) {
      try {
        return JSON.parse(userString);
      } catch {
        return null;
      }
    }
    return null;
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    const user = this.getCurrentUser();
    return !!(token && user);
  }

  hasRole(role: string | string[]): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    
    if (Array.isArray(role)) {
      return role.includes(user.role);
    }
    return user.role === role;
  }
}

export default new AuthService();
