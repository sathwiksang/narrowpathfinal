@echo off
echo =======================================
echo Auto Commit and Push Script
echo =======================================
echo.

REM Add all changes
echo Adding all changes...
git add .

REM Commit with timestamp
echo Committing changes...
for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set mydate=%%c-%%a-%%b)
for /f "tokens=1-2 delims=/:" %%a in ('time /t') do (set mytime=%%a:%%b)
git commit -m "Auto commit: %mydate% %mytime%"

REM Push to remote
echo Pushing to remote repository...
git push

echo.
echo =======================================
echo Done!
echo =======================================
pause
