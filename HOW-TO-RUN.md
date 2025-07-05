# 🚀 How to Run the Store Inventory Management System

## 📋 Prerequisites

Before running the project, ensure you have:

✅ **Node.js 18+** installed
✅ **MySQL 8+** installed and running
✅ **Git** installed
✅ **PowerShell/Command Prompt** access

## 🎯 Quick Start (Recommended)

### Option 1: Automated Setup Script
```bash
# Navigate to project directory
cd a:\Store_1\Inventory_Management

# Run automated setup and start
fix-login.bat
```

### Option 2: Manual Step-by-Step Setup

## 📊 Step-by-Step Manual Setup

### 1️⃣ Database Setup

**Start MySQL Service:**
```bash
# Check if MySQL is running
netstat -an | findstr :3306
```

**Create Database:**
```sql
# Connect to MySQL as root
mysql -u root -p

# Create the database
CREATE DATABASE inventory_management;
exit;
```

### 2️⃣ Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed database with demo data
npm run seed

# Start backend development server
npm run dev
```

**Backend should now be running on:** http://localhost:5000

### 3️⃣ Frontend Setup

```bash
# Open NEW terminal/command prompt
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start frontend development server
npm run dev
```

**Frontend should now be running on:** http://localhost:5173

### 4️⃣ Access the Application

🌐 **Frontend Application:** http://localhost:5173
🔌 **Backend API:** http://localhost:5000/api
💚 **Health Check:** http://localhost:5000/health

## 🔐 Demo Login Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@store.com | admin123 |
| **Manager** | manager@store.com | admin123 |
| **User** | user@store.com | admin123 |

## 🔧 Development Commands

### Backend Commands
```bash
cd backend

# Development with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Database operations
npx prisma studio          # Visual database browser
npx prisma migrate reset    # Reset database
npm run seed               # Re-seed data
npx prisma generate        # Regenerate client
```

### Frontend Commands
```bash
cd frontend

# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 🛠️ Troubleshooting Common Issues

### Issue 1: "Login Failed" Error
**Solutions:**
1. Ensure backend is running on port 5000
2. Check browser console (F12) for detailed errors
3. Verify database is seeded: `cd backend && npm run seed`
4. Test backend health: Visit http://localhost:5000/health

### Issue 2: "Connection Error" / Network Issues
**Solutions:**
1. Ensure both servers are running
2. Check ports: Backend (5000), Frontend (5173)
3. Clear browser cache
4. Check firewall/antivirus blocking ports

### Issue 3: Database Connection Failed
**Solutions:**
1. Start MySQL service
2. Verify database exists: `inventory_management`
3. Check credentials in `backend/.env`
4. Run: `cd backend && node test-db.js`

### Issue 4: "Module not found" Errors
**Solutions:**
1. Delete `node_modules` folders
2. Reinstall: `npm install` in both directories
3. Clear npm cache: `npm cache clean --force`

## 📁 Project Structure

```
📁 Store_1/Inventory_Management/
├── 🖥️ frontend/              # React 19 + TypeScript
│   ├── src/
│   │   ├── components/       # UI Components
│   │   ├── pages/            # Route Pages
│   │   ├── services/         # API Services
│   │   └── hooks/            # Custom Hooks
│   └── package.json
├── ⚙️ backend/               # Node.js + Express
│   ├── src/
│   │   ├── routes/           # API Endpoints
│   │   ├── services/         # Business Logic
│   │   └── middleware/       # Auth, Validation
│   ├── prisma/              # Database Schema
│   └── package.json
├── 🚀 fix-login.bat         # Automated setup
└── 📄 README.md             # Documentation
```

## 🎯 Key Features Available

- ✅ **Real-time Dashboard** with live updates
- ✅ **Product Management** (CRUD operations)
- ✅ **Inventory Tracking** with stock movements
- ✅ **Advanced Forecasting** with multiple algorithms
- ✅ **Smart Alerts** for low stock and reorders
- ✅ **Report Generation** (PDF/Excel exports)
- ✅ **Social Media Trends** integration
- ✅ **Role-based Authentication** (Admin/Manager/User)
- ✅ **WebSocket Real-time Updates**

## 🐛 Debug Mode

For detailed debugging, open browser Developer Tools (F12) and check:
- **Console tab** for JavaScript errors
- **Network tab** for API call failures
- **Application tab** for localStorage data

## 🎉 Success Indicators

✅ Backend health check returns: `{"status":"OK"}`
✅ Frontend loads without console errors
✅ Login works with demo credentials
✅ Dashboard displays real-time data
✅ WebSocket shows "Live" indicator

## 📞 Need Help?

If you encounter issues:
1. Run the automated `fix-login.bat` script
2. Check the browser console for detailed error messages
3. Verify both servers are running in separate terminals
4. Ensure MySQL service is active

---

**🎊 Once both servers are running, visit http://localhost:5173 and login with admin@store.com / admin123**
