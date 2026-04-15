@echo off
REM Backend Server Startup Script
REM This script automatically uses Python 3.11 and starts the FastAPI server

cd /d "D:\DYP_vibeathon\vibethon-CodeSparks-t132\backend"

echo Starting AIML Playground Backend Server...
echo Location: %cd%

"C:\Users\ayush\AppData\Local\Programs\Python\Python311\python.exe" -m uvicorn app.main:app --reload

pause
