@echo off
title Breast Cancer CDSS Launcher
echo ============================================================
echo   BREAST CANCER CLINICAL DECISION SUPPORT SYSTEM (CDSS)
echo ============================================================
echo.
echo [1/2] Starting Backend FastAPI Server (Python 3.10, Port 8000)...
start "CDSS Backend API - Port 8000" cmd /k "cd /d ""%~dp0"" && py -3.10 -m uvicorn src.api.main:app --host 127.0.0.1 --port 8000 --reload"

echo [2/2] Waiting 4 seconds for backend initialization...
timeout /t 4 /nobreak >nul

echo Starting Next.js Frontend UI (Node, Port 3000)...
start "CDSS Frontend UI - Port 3000" cmd /k "cd /d ""%~dp0frontend"" && npm run dev"

echo Waiting 3 seconds for UI server to start...
timeout /t 3 /nobreak >nul

echo Opening browser at http://localhost:3000 ...
start http://localhost:3000

echo.
echo ============================================================
echo System running!
echo Frontend:    http://localhost:3000
echo Backend API: http://localhost:8000
echo API Docs:    http://localhost:8000/docs
echo ============================================================
echo.
pause
