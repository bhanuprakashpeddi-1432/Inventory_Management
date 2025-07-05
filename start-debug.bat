@echo off
echo 🚀 Starting Store Inventory Management System...
echo.

echo 📋 Checking Node.js installation...
node --version
if %errorlevel% neq 0 (
    echo ❌ Node.js not found! Please install Node.js 18+
    pause
    exit /b 1
)

echo 📋 Checking if MySQL is running...
netstat -an | findstr :3306 >nul
if %errorlevel% neq 0 (
    echo ⚠️  MySQL might not be running on port 3306
    echo Please ensure MySQL is installed and running
)

echo.
echo 🔧 Starting Backend Server...
cd backend
start "Backend Server" cmd /k "npm run dev"

echo ⏳ Waiting for backend to start...
timeout /t 5 /nobreak >nul

echo.
echo 🎨 Starting Frontend Server...
cd ..\frontend
start "Frontend Server" cmd /k "npm run dev"

echo.
echo ✅ Both servers starting...
echo 📱 Frontend: http://localhost:5173
echo 🔌 Backend: http://localhost:5000
echo.
echo Check the server windows for any errors.
echo Demo credentials: admin@store.com / admin123
echo.
pause
