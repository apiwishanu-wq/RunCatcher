#!/bin/bash

# RunCatcher Setup Script
echo "🏃‍♂️ RunCatcher Setup"
echo "===================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js first:"
    echo ""
    echo "Option 1 - Using Homebrew (recommended):"
    echo "  /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
    echo "  brew install node"
    echo ""
    echo "Option 2 - Download from nodejs.org:"
    echo "  Visit https://nodejs.org and download the LTS version"
    echo ""
    echo "Option 3 - Using nvm:"
    echo "  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash"
    echo "  nvm install node"
    echo ""
    exit 1
fi

echo "✅ Node.js found: $(node --version)"

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "❌ npm not found. Please reinstall Node.js"
    exit 1
fi

echo "✅ npm found: $(npm --version)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully!"
    echo ""
    echo "🚀 To start the server:"
    echo "  npm start"
    echo ""
    echo "🌐 Then open: http://localhost:3000"
    echo ""
    echo "📖 For development with auto-restart:"
    echo "  npm run dev"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi
