import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export async function checkBackendHealth() {
  try {
    console.log('🔍 Checking backend health at:', API_BASE_URL.replace('/api', ''));
    
    const response = await axios.get(API_BASE_URL.replace('/api', '/health'), {
      timeout: 5000
    });
    
    console.log('✅ Backend is healthy:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Backend health check failed:', error);
    
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNREFUSED') {
        console.error('🔌 Backend server is not running on port 5000');
        console.error('💡 Start it with: cd backend && npm run dev');
      } else if (error.code === 'TIMEOUT') {
        console.error('⏰ Backend server is not responding (timeout)');
      } else {
        console.error('🌐 Network error:', error.message);
      }
    }
    
    return false;
  }
}

export async function testDatabaseConnection() {
  try {
    console.log('🗄️ Testing database connection...');
    
    // Try to hit a simple auth endpoint that requires DB
    const response = await axios.post(API_BASE_URL + '/auth/login', {
      email: 'test@test.com',  // This will fail but shows if DB is connected
      password: 'test'
    });
    
    return true;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      console.log('✅ Database connection is working (got expected 401)');
      return true;
    } else {
      console.error('❌ Database connection test failed:', error);
      return false;
    }
  }
}
