# 🔧 Login Issue Troubleshooting Guide

## Quick Diagnosis Steps

### 1. Check Backend Server Status
```bash
# Navigate to backend directory
cd backend

# Test database connection
node test-db.js

# Start backend server
npm run dev
```

### 2. Check Frontend Configuration
- Frontend should be running on: http://localhost:5173
- Backend should be running on: http://localhost:5000
- API calls should go to: http://localhost:5000/api

### 3. Test API Connection
Open browser developer tools (F12) and try logging in with:
- Email: admin@store.com
- Password: admin123

Check Console and Network tabs for errors.

## Common Issues & Solutions

### Issue 1: "Connection Error" / Network Request Failed
**Cause**: Backend server not running or wrong port
**Solution**: 
1. Ensure MySQL is running
2. Start backend: `cd backend && npm run dev`
3. Verify backend is on port 5000

### Issue 2: "Database Connection Failed"
**Cause**: MySQL not running or wrong credentials
**Solution**:
1. Start MySQL service
2. Check `.env` file in backend directory
3. Create database: `CREATE DATABASE inventory_management;`
4. Run migrations: `npx prisma migrate dev`
5. Seed database: `npm run seed`

### Issue 3: "Invalid Credentials" (but credentials are correct)
**Cause**: Database not seeded or users don't exist
**Solution**:
1. Run: `cd backend && npm run seed`
2. Verify users exist: `node test-db.js`

### Issue 4: CORS Error
**Cause**: Frontend and backend on different origins
**Solution**:
1. Check CORS_ORIGIN in backend `.env`
2. Should be: `CORS_ORIGIN=http://localhost:5173`

## Debug Information

Current Configuration:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- API Base: http://localhost:5000/api
- Database: MySQL on localhost:3306

Demo Credentials:
- Admin: admin@store.com / admin123
- Manager: manager@store.com / admin123

## Step-by-Step Fix

1. **Ensure MySQL is running**
2. **Start backend server**: `cd backend && npm run dev`
3. **Verify backend health**: Visit http://localhost:5000/health
4. **Start frontend**: `cd frontend && npm run dev`
5. **Clear browser cache** and try logging in
6. **Check browser console** for detailed error messages

If issues persist, check the detailed error logs in the console!
