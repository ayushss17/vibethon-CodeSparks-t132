#!/usr/bin/env python
"""
Backend Server Launcher
Starts the FastAPI server from the correct directory
"""
import os
import subprocess
import sys

# Change to the backend directory
backend_path = r"D:\DYP_vibeathon\vibethon-CodeSparks-t132\backend"
os.chdir(backend_path)

print(f"Starting backend from: {os.getcwd()}")
print(f"Using Python: {sys.executable}")
print("-" * 60)

# Run uvicorn
subprocess.run([
    sys.executable, "-m", "uvicorn", 
    "app.main:app", 
    "--reload",
    "--host", "127.0.0.1",
    "--port", "8000"
])
