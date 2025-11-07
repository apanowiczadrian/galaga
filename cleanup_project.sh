#!/bin/bash
# ========================================
# Project Cleanup Script
# Removes unnecessary files for production
# ========================================

echo ""
echo "========================================"
echo "  PROJECT CLEANUP - REMOVING FILES"
echo "========================================"
echo ""

# Documentation files to remove (keep only README.md)
echo "[1/8] Removing documentation files..."
for file in "CLAUDE.md" "GEMINI.md" "GOOGLE_SHEETS_INTEGRATION.md" "GOOGLE_SHEETS_LEADERBOARD.md" "GOOGLE_SHEETS_QUICKSTART.md" "TODO_PRODUCTION.md" "todo.txt"; do
    if [ -f "$file" ]; then
        rm "$file" && echo "  - Deleted: $file"
    fi
done

# Google Apps Script file (server-side code, not needed in client)
echo "[2/8] Removing server-side scripts..."
if [ -f "AppsScript.gs" ]; then
    rm "AppsScript.gs" && echo "  - Deleted: AppsScript.gs"
fi

# Test files
echo "[3/8] Removing test files..."
if [ -f "test_game_over.html" ]; then
    rm "test_game_over.html" && echo "  - Deleted: test_game_over.html"
fi

# Unused UI components
echo "[4/8] Removing unused UI components..."
if [ -f "js/ui/StartMenu.js" ]; then
    rm "js/ui/StartMenu.js" && echo "  - Deleted: js/ui/StartMenu.js"
fi
if [ -f "js/ui/CanvasButton.js" ]; then
    rm "js/ui/CanvasButton.js" && echo "  - Deleted: js/ui/CanvasButton.js"
fi

# Unused systems
echo "[5/8] Removing unused systems..."
if [ -f "js/systems/SpatialGrid.js" ]; then
    rm "js/systems/SpatialGrid.js" && echo "  - Deleted: js/systems/SpatialGrid.js"
fi

# Original assets (source files, not needed in production)
echo "[6/8] Removing original asset files..."
if [ -d "assets/originals" ]; then
    rm -rf "assets/originals" && echo "  - Deleted: assets/originals/"
fi
if [ -d "assets/penguin/originals" ]; then
    rm -rf "assets/penguin/originals" && echo "  - Deleted: assets/penguin/originals/"
fi

# Claude Code settings (IDE config, not needed)
echo "[7/8] Removing IDE configuration..."
if [ -d ".claude" ]; then
    rm -rf ".claude" && echo "  - Deleted: .claude/"
fi

# Optional: Remove this cleanup script itself
echo "[8/8] Cleanup script options..."
echo ""
read -p "Remove this cleanup script? (y/n): " REMOVE_SCRIPT
if [ "$REMOVE_SCRIPT" = "y" ] || [ "$REMOVE_SCRIPT" = "Y" ]; then
    echo "  - Removing cleanup script..."
    rm -- "$0"
else
    echo "  - Cleanup script kept"
fi

echo ""
echo "========================================"
echo "  CLEANUP COMPLETE!"
echo "========================================"
echo ""
echo "Files remaining:"
echo "  - README.md (documentation)"
echo "  - manifest.json (PWA config)"
echo "  - All active game files"
echo ""
echo "Your project is now production-ready!"
echo ""
