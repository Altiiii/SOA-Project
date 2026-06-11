@echo off
title AI Study Coach PRO - Backend Launcher
color 0B

echo.
echo  ============================================================
echo    AI Study Coach PRO  --  Backend Services Launcher
echo  ============================================================
echo.

REM Base path = folder where this script lives (AIStudyCoachPRO subfolder)
set "BASE=%~dp0AIStudyCoachPRO"

echo  [1/5] Starting UserService on port 5150...
start "UserService :5150" /D "%BASE%\UserService" cmd /k ^
  "echo. && echo  ======================================= && echo   UserService  --  http://localhost:5150 && echo  ======================================= && echo. && dotnet run --launch-profile http"

timeout /t 2 /nobreak >nul

echo  [2/5] Starting SubjectService on port 5151...
start "SubjectService :5151" /D "%BASE%\SubjectService" cmd /k ^
  "echo. && echo  ========================================== && echo   SubjectService  --  http://localhost:5151 && echo  ========================================== && echo. && dotnet run --launch-profile http"

timeout /t 2 /nobreak >nul

echo  [3/5] Starting StudyService on port 5152...
start "StudyService :5152" /D "%BASE%\StudyService" cmd /k ^
  "echo. && echo  ======================================== && echo   StudyService  --  http://localhost:5152 && echo  ======================================== && echo. && dotnet run --launch-profile http"

timeout /t 2 /nobreak >nul

echo  [4/5] Starting RecommendationService on port 5153...
start "RecommendationService :5153" /D "%BASE%\RecommendationService" cmd /k ^
  "echo. && echo  ================================================== && echo   RecommendationService  --  http://localhost:5153 && echo  ================================================== && echo. && dotnet run --launch-profile http"

timeout /t 2 /nobreak >nul

echo  [5/5] Starting ApiGateway on port 5000...
start "ApiGateway :5000" /D "%BASE%\ApiGateway" cmd /k ^
  "echo. && echo  ======================================= && echo   ApiGateway (Ocelot)  --  http://localhost:5000 && echo  ======================================= && echo. && dotnet run --launch-profile http"

echo.
echo  ============================================================
echo    All 5 services are starting.
echo    Wait ~15 seconds for full initialization.
echo  ============================================================
echo.
echo    UserService           -^>  http://localhost:5150/swagger
echo    SubjectService        -^>  http://localhost:5151/swagger
echo    StudyService          -^>  http://localhost:5152/swagger
echo    RecommendationService -^>  http://localhost:5153/swagger
echo    ApiGateway            -^>  http://localhost:5000/gateway
echo.
echo    Frontend: cd AIStudyCoachFrontend ^&^& npm run dev
echo              -^>  http://localhost:5173
echo.
echo  ============================================================
echo    Press any key to close this launcher window.
echo  ============================================================
pause >nul
