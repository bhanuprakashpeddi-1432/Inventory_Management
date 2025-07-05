import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    console.log('🔐 Attempting login with:', { email, password: '***' });
    console.log('🌐 API URL:', import.meta.env.VITE_API_URL || 'http://localhost:5000/api');

    try {
      await login(email, password);
      console.log('✅ Login successful');
    } catch (err: unknown) {
      console.error('❌ Login error:', err);
      
      if (err && typeof err === 'object' && 'response' in err) {
        const errorResponse = err as { 
          response?: { 
            status?: number;
            data?: { 
              error?: string 
            } 
          } 
        };
        console.log('📡 Response status:', errorResponse.response?.status);
        console.log('📡 Response data:', errorResponse.response?.data);
        
        const errorMessage = errorResponse.response?.data?.error || 
                           `Login failed (Status: ${errorResponse.response?.status || 'Unknown'})`;
        setError(errorMessage);
      } else if (err && typeof err === 'object' && 'message' in err) {
        const errorWithMessage = err as { message: string };
        setError(`Connection error: ${errorWithMessage.message}`);
        console.log('🔌 Connection error:', errorWithMessage.message);
      } else {
        setError('Login failed - Unknown error');
        console.log('❓ Unknown error type:', typeof err);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Inventory Management</h1>
          <p className="text-muted-foreground">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              required
            />
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-6 text-sm text-center text-muted-foreground">
          <p>Demo Credentials:</p>
          <p>admin@store.com / admin123</p>
          <p>manager@store.com / admin123</p>
        </div>
      </Card>
    </div>
  );
};
