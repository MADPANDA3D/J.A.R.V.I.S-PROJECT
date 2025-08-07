#!/bin/bash

# Script to fix arrow function syntax errors in TypeScript files

echo "Fixing arrow function syntax errors..."

# Function to fix arrow syntax in a file
fix_file() {
    local file="$1"
    echo "Processing: $file"
    
    # Create a temporary file
    local temp_file=$(mktemp)
    
    # Fix various arrow function patterns
    sed -E \
        -e 's/async[[:space:]]*\([[:space:]]*\)[[:space:]]*\{/async () => {/g' \
        -e 's/async[[:space:]]*\(([^)]+)\)[[:space:]]*\{/async (\1) => {/g' \
        -e 's/([[:space:]]|^)\([[:space:]]*\)[[:space:]]*\{/\1() => {/g' \
        -e 's/([[:space:]]|^)\(([^)]+)\)[[:space:]]*\{/\1(\2) => {/g' \
        -e 's/\.map\(async[[:space:]]*\(([^)]+)\)[[:space:]]*\{/.map(async (\1) => {/g' \
        -e 's/\.filter\(async[[:space:]]*\(([^)]+)\)[[:space:]]*\{/.filter(async (\1) => {/g' \
        -e 's/\.forEach\(async[[:space:]]*\(([^)]+)\)[[:space:]]*\{/.forEach(async (\1) => {/g' \
        -e 's/\.reduce\(async[[:space:]]*\(([^)]+)\)[[:space:]]*\{/.reduce(async (\1) => {/g' \
        "$file" > "$temp_file"
    
    # Check if the file was modified
    if ! cmp -s "$file" "$temp_file"; then
        mv "$temp_file" "$file"
        echo "  ✓ Fixed arrow functions in $file"
    else
        rm "$temp_file"
        echo "  - No changes needed in $file"
    fi
}

# Export the function so it can be used with find
export -f fix_file

# Find all TypeScript files and fix them
find src -name "*.ts" -o -name "*.tsx" | while read -r file; do
    fix_file "$file"
done

echo "Arrow function syntax fixes completed!"