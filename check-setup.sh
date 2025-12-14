#!/bin/bash

# NoirBrew Cafe Finder - Quick Check Script
# This script helps verify your setup is correct

echo "🔍 NoirBrew Setup Checker"
echo "========================="
echo ""

# Check 1: .env file exists
echo "✓ Checking for .env file..."
if [ -f .env ]; then
    echo "  ✅ .env file found"
    
    # Check if API key is set
    if grep -q "GOOGLE_MAPS_API_KEY=your_actual_google_maps_api_key_here" .env; then
        echo "  ⚠️  WARNING: You need to replace the API key in .env with your real key!"
    elif grep -q "GOOGLE_MAPS_API_KEY=" .env; then
        echo "  ✅ API key is set (remember to enable required APIs in Google Cloud)"
    else
        echo "  ⚠️  No API key found in .env"
    fi
else
    echo "  ❌ .env file not found"
    echo "  → Run: cp .env.example .env"
    echo "  → Then edit .env and add your API key"
fi

echo ""

# Check 2: Python environment
echo "✓ Checking Python..."
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    echo "  ✅ $PYTHON_VERSION found"
else
    echo "  ❌ Python 3 not found"
    echo "  → Install Python 3 from python.org"
fi

echo ""

# Check 3: Virtual environment
echo "✓ Checking virtual environment..."
if [ -d .venv ]; then
    echo "  ✅ Virtual environment found"
else
    echo "  ⚠️  No virtual environment found"
    echo "  → Run: python3 -m venv .venv"
fi

echo ""

# Check 4: Required files
echo "✓ Checking required files..."
REQUIRED_FILES=("index.html" "main.js" "main.css" "pyscrpt.py")
ALL_FILES_EXIST=true

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file"
    else
        echo "  ❌ $file missing"
        ALL_FILES_EXIST=false
    fi
done

echo ""

# Check 5: Python packages
echo "✓ Checking Python packages..."
if [ -d .venv ]; then
    source .venv/bin/activate
    
    PACKAGES=("flask" "flask-cors" "googlemaps")
    for package in "${PACKAGES[@]}"; do
        if python3 -c "import $package" 2>/dev/null; then
            echo "  ✅ $package installed"
        else
            echo "  ❌ $package not installed"
            echo "  → Run: pip install $package"
        fi
    done
else
    echo "  ⚠️  Cannot check packages without virtual environment"
fi

echo ""
echo "========================="
echo "📋 Summary"
echo "========================="
echo ""

# Final instructions
if [ -f .env ] && [ "$ALL_FILES_EXIST" = true ]; then
    echo "✅ Setup looks good!"
    echo ""
    echo "🚀 To start the app:"
    echo ""
    echo "1. Backend (in terminal 1):"
    echo "   ./start.sh"
    echo ""
    echo "2. Frontend (in terminal 2):"
    echo "   ./start-frontend.sh"
    echo ""
    echo "3. Open browser:"
    echo "   http://localhost:8000"
    echo ""
else
    echo "⚠️  Some issues found. Please fix them and run this script again."
    echo ""
fi

echo "📚 Need help? Check:"
echo "  • SETUP_GUIDE.md - API setup"
echo "  • DEMO_INSTRUCTIONS.md - Testing guide"
echo "  • README.md - Full docs"
echo ""
