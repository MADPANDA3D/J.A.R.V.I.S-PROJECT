#!/bin/bash

# JARVIS Build Analysis Script
# Analyzes bundle size and provides optimization recommendations

echo "🔍 JARVIS Build Analysis"
echo "======================="

# Clean previous build
echo "🧹 Cleaning previous build..."
rm -rf dist

# Build with analysis
echo "🔨 Building with analysis..."
npm run build

echo ""
echo "📊 Build Analysis Results:"
echo "========================="

# Check if dist directory exists
if [ -d "dist" ]; then
    echo "📁 Build output:"
    ls -lah dist/
    echo ""
    
    echo "📦 Asset sizes:"
    find dist -name "*.js" -o -name "*.css" | while read file; do
        size=$(du -h "$file" | cut -f1)
        echo "  $size - $(basename "$file")"
    done
    echo ""
    
    echo "🎯 Bundle Analysis:"
    total_js_size=$(find dist -name "*.js" -exec du -c {} + | tail -1 | cut -f1)
    total_css_size=$(find dist -name "*.css" -exec du -c {} + | tail -1 | cut -f1)
    
    echo "  Total JS: ${total_js_size}K"
    echo "  Total CSS: ${total_css_size}K"
    
    # Recommendations
    echo ""
    echo "💡 Optimization Recommendations:"
    echo "================================"
    
    if [ "$total_js_size" -gt 500 ]; then
        echo "⚠️  JS bundle is large (${total_js_size}K). Consider:"
        echo "   - More aggressive code splitting"
        echo "   - Tree shaking unused code"
        echo "   - Analyzing with bundle analyzer"
    else
        echo "✅ JS bundle size is good (${total_js_size}K)"
    fi
    
    if [ "$total_css_size" -gt 100 ]; then
        echo "⚠️  CSS bundle is large (${total_css_size}K). Consider:"
        echo "   - Purging unused CSS"
        echo "   - Using CSS modules"
    else
        echo "✅ CSS bundle size is good (${total_css_size}K)"
    fi
    
    echo ""
    echo "🚀 Build completed successfully!"
    echo "   Files ready for deployment in dist/"
    
else
    echo "❌ Build failed - no dist directory found"
    exit 1
fi