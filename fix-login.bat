@echo off
echo 🔧 STORE INVENTORY - LOGIN TROUBLESHOOTING SCRIPT
echo ================================================
echo.

echo 📋 Step 1: Checking Node.js...
node --version
if %errorlevel% neq 0 (
    echo ❌ Node.js not found! Please install Node.js 18+
    pause
    exit /b 1
)

echo.
echo 📋 Step 2: Checking MySQL...
netstat -an | findstr :3306 >nul
if %errorlevel% neq 0 (
    echo ⚠️  MySQL might not be running on port 3306
    echo Please start MySQL service
) else (
    echo ✅ MySQL appears to be running
)

echo.
echo 📋 Step 3: Testing Backend Database Connection...
cd backend
node test-db.js

echo.
echo 📋 Step 4: Running Simple Database Seed...
npm run seed
if %errorlevel% neq 0 (
    echo ❌ Database seeding failed!
    echo Please check your MySQL connection and database
    pause
    exit /b 1
)

echo.
echo 📋 Step 5: Starting Backend Server...
echo Opening backend server window...
start "Inventory Backend" cmd /c "npm run dev & pause"

echo ⏳ Waiting 10 seconds for backend to start...
timeout /t 10 /nobreak >nul

echo.
echo 📋 Step 6: Testing Backend Health...
curl -s http://localhost:5000/health
if %errorlevel% neq 0 (
    echo ❌ Backend health check failed!
    echo Make sure the backend server started successfully
)

echo.
echo 📋 Step 7: Starting Frontend...
cd ..\frontend
echo Opening frontend window...
start "Inventory Frontend" cmd /c "npm run dev & pause"

echo.
echo ✅ TROUBLESHOOTING COMPLETE!
echo.
echo 🌐 Frontend: http://localhost:5173
echo 🔌 Backend: http://localhost:5000
echo 💡 Health Check: http://localhost:5000/health
echo.
echo 🔐 Demo Credentials:
echo   Email: admin@store.com
echo   Password: admin123
echo.
echo 🔍 If login still fails:
echo 1. Check browser console (F12) for error messages
echo 2. Check Network tab for failed API calls
echo 3. Verify both servers are running in their windows
echo.
pause
