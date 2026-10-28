@echo off
cd /d "%~dp0"
echo.
echo  E Walks And Tours - local preview
echo  http://localhost:5500
echo  Press Ctrl+C to stop the server.
echo.
start "" cmd /c "timeout /t 2 >nul & start http://localhost:5500"
python -m http.server 5500
