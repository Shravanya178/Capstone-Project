@echo off
echo Starting Breast Cancer CDSS Backend API on Port 8000...
py -3.10 -m uvicorn src.api.main:app --host 127.0.0.1 --port 8000 --reload
pause
