@echo off
echo 🚀 Setting up Store Inventory Management System...
echo.

echo 📦 Installing Backend Dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Backend installation failed!
    pause
    exit /b 1
)

echo.
echo 📦 Installing Frontend Dependencies...
cd ..\frontend  
call npm install
if %errorlevel% neq 0 (
    echo ❌ Frontend installation failed!
    pause
    exit /b 1
)

echo.
echo 🗄️ Setting up Database...
cd ..\backend

echo Generating Prisma Client...
call npx prisma generate
if %errorlevel% neq 0 (
    echo ❌ Prisma client generation failed!
    pause
    exit /b 1
)

echo Running Database Migrations...
call npx prisma migrate dev --name init
if %errorlevel% neq 0 (
    echo ❌ Database migration failed!
    echo Make sure MySQL is running and the database exists.
    pause
    exit /b 1
)

echo Seeding Database with Sample Data...
call npm run seed
if %errorlevel% neq 0 (
    echo ❌ Database seeding failed!
    pause
    exit /b 1
)

echo.
echo ✅ Installation completed successfully!
echo.
echo 📋 Next steps:
echo 1. Make sure MySQL is running
echo 2. Update backend/.env with your database credentials
echo 3. Run 'start-dev.bat' to start both servers
echo.
pause
