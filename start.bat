@echo off
echo Starting DiagnoSense Clinical Workbench (Backend API + React Frontend)...
start "DiagnoSense Backend API" cmd /k ".\.venv\Scripts\python.exe app.py"
start "DiagnoSense React Dev Server" cmd /k "npm run dev"
echo Backend API running at http://localhost:8000
echo React Dev Server running at http://localhost:5173
