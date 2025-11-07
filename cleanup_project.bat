@echo off
REM ========================================
REM Project Cleanup Script
REM Removes unnecessary files for production
REM ========================================

echo.
echo ========================================
echo   PROJECT CLEANUP - REMOVING FILES
echo ========================================
echo.

REM Documentation files to remove (keep only README.md)
echo [1/8] Removing documentation files...
if exist "CLAUDE.md" del "CLAUDE.md" && echo   - Deleted: CLAUDE.md
if exist "GEMINI.md" del "GEMINI.md" && echo   - Deleted: GEMINI.md
if exist "GOOGLE_SHEETS_INTEGRATION.md" del "GOOGLE_SHEETS_INTEGRATION.md" && echo   - Deleted: GOOGLE_SHEETS_INTEGRATION.md
if exist "GOOGLE_SHEETS_LEADERBOARD.md" del "GOOGLE_SHEETS_LEADERBOARD.md" && echo   - Deleted: GOOGLE_SHEETS_LEADERBOARD.md
if exist "GOOGLE_SHEETS_QUICKSTART.md" del "GOOGLE_SHEETS_QUICKSTART.md" && echo   - Deleted: GOOGLE_SHEETS_QUICKSTART.md
if exist "TODO_PRODUCTION.md" del "TODO_PRODUCTION.md" && echo   - Deleted: TODO_PRODUCTION.md
if exist "todo.txt" del "todo.txt" && echo   - Deleted: todo.txt

REM Google Apps Script file (server-side code, not needed in client)
echo [2/8] Removing server-side scripts...
if exist "AppsScript.gs" del "AppsScript.gs" && echo   - Deleted: AppsScript.gs

REM Test files
echo [3/8] Removing test files...
if exist "test_game_over.html" del "test_game_over.html" && echo   - Deleted: test_game_over.html

REM Unused UI components
echo [4/8] Removing unused UI components...
if exist "js\ui\StartMenu.js" del "js\ui\StartMenu.js" && echo   - Deleted: js\ui\StartMenu.js
if exist "js\ui\CanvasButton.js" del "js\ui\CanvasButton.js" && echo   - Deleted: js\ui\CanvasButton.js

REM Unused systems
echo [5/8] Removing unused systems...
if exist "js\systems\SpatialGrid.js" del "js\systems\SpatialGrid.js" && echo   - Deleted: js\systems\SpatialGrid.js

REM Original assets (source files, not needed in production)
echo [6/8] Removing original asset files...
if exist "assets\originals\" (
    rmdir /s /q "assets\originals" && echo   - Deleted: assets\originals\
)
if exist "assets\penguin\originals\" (
    rmdir /s /q "assets\penguin\originals" && echo   - Deleted: assets\penguin\originals\
)

REM Claude Code settings (IDE config, not needed)
echo [7/8] Removing IDE configuration...
if exist ".claude\" (
    rmdir /s /q ".claude" && echo   - Deleted: .claude\
)

REM Optional: Remove this cleanup script itself
echo [8/8] Cleanup script options...
echo.
set /p REMOVE_SCRIPT="Remove this cleanup script? (y/n): "
if /i "%REMOVE_SCRIPT%"=="y" (
    echo   - Scheduling cleanup script for deletion...
    (goto) 2>nul & del "%~f0"
) else (
    echo   - Cleanup script kept
)

echo.
echo ========================================
echo   CLEANUP COMPLETE!
echo ========================================
echo.
echo Files remaining:
echo   - README.md (documentation)
echo   - manifest.json (PWA config)
echo   - All active game files
echo.
echo Your project is now production-ready!
echo.
pause
