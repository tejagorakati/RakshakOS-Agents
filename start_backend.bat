@echo off
echo ========================================
echo Starting RakshakOS Backend API Server
echo ========================================
echo.

echo Activating virtual environment...
call .venv\Scripts\activate.bat

echo.
echo Starting FastAPI server on http://localhost:8000
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

python api.py

pause
