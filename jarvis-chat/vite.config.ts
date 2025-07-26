import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/lib': path.resolve(__dirname, './src/lib'),
      '@/pages': path.resolve(__dirname, './src/pages'),
      '@/types': path.resolve(__dirname, './src/types'),
    },
  },
  build: {
    chunkSizeWarningLimit: 1000, // Increase warning limit temporarily
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        sw: path.resolve(__dirname, 'src/sw.ts'),
      },
      output: {
        entryFileNames: chunkInfo => {
          return chunkInfo.name === 'sw' ? 'sw.js' : 'assets/[name]-[hash].js';
        },
        // Manual chunk optimization
        manualChunks: {
          // Vendor libraries
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['@radix-ui/react-dropdown-menu', '@radix-ui/react-slot', 'lucide-react'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-query': ['@tanstack/react-query'],
          'vendor-form': ['react-hook-form', '@hookform/resolvers', 'zod'],
          
          // App chunks
          'components-auth': [
            'src/components/auth/AuthLayout.tsx',
            'src/components/auth/LoginForm.tsx',
            'src/components/auth/RegisterForm.tsx',
            'src/components/auth/ProtectedRoute.tsx'
          ],
          'components-chat': [
            'src/components/chat/ChatLayout.tsx',
            'src/components/chat/MessageBubble.tsx',
            'src/components/chat/MessageInput.tsx',
            'src/components/chat/MessageList.tsx',
            'src/components/chat/MessageSearch.tsx',
            'src/components/chat/ToolsSelector.tsx',
            'src/components/chat/TypingIndicator.tsx'
          ],
          'services': [
            'src/lib/chatService.ts',
            'src/lib/webhookService.ts',
            'src/lib/supabase.ts'
          ]
        }
      },
    },
  },
});
