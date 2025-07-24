# JARVIS Chat - AI Chat Application

A modern, responsive AI chat application built with React, TypeScript, and Vite. Features dark theme with crimson red and neon accent colors, real-time chat functionality, and seamless integration with n8n backend services.

## 🚀 Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd jarvis-chat

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173` to see the application.

## 📋 Prerequisites

- Node.js 20 or higher
- npm or yarn
- Docker (optional, for containerized deployment)

## 🛠️ Development Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Copy the template and add your credentials:

```bash
# Copy the template file
cp .env.template .env.local

# Edit with your actual credentials
nano .env.local
```

You'll need to fill in:

- **VITE_SUPABASE_URL** - Your Supabase project URL
- **VITE_SUPABASE_ANON_KEY** - Your Supabase anonymous key
- **VITE_N8N_WEBHOOK_URL** (optional) - Your n8n webhook URL
- **VITE_APP_DOMAIN** (optional) - Your domain name

### 3. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173` with hot reload enabled.

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run type-check` - Run TypeScript type checking
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

## 🏗️ Project Structure

```
jarvis-chat/
├── src/
│   ├── components/          # React components
│   │   ├── ui/             # shadcn/ui components
│   │   ├── chat/           # Chat-specific components
│   │   ├── auth/           # Authentication components
│   │   └── layout/         # Layout components
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions
│   ├── pages/              # Page components
│   ├── types/              # TypeScript type definitions
│   ├── App.tsx             # Main App component
│   ├── main.tsx            # Application entry point
│   └── index.css           # Global styles with custom theme
├── public/                 # Static assets
├── docker/                 # Docker-related files
├── docs/                   # Documentation
└── package.json           # Project configuration
```

## 🎨 Theme & Styling

The application uses a dark theme with:

- **Primary Colors**: Pure Black (#000000), Pure White (#FFFFFF), Crimson Red (#DC143C)
- **Accent Colors**: Neon Cyan, Green, Purple, Yellow
- **UI Library**: shadcn/ui components with Tailwind CSS
- **Typography**: System fonts with optimized rendering

### Custom CSS Classes

```css
.neon-cyan {
  color: #00ffff;
}
.neon-green {
  color: #00ff00;
}
.neon-purple {
  color: #ff00ff;
}
.neon-yellow {
  color: #ffff00;
}
```

## 🐳 Docker Deployment

### Production Build

```bash
# Build the image
docker build -t jarvis-chat .

# Run the container
docker run -p 3000:80 jarvis-chat
```

### Development with Docker

```bash
# Run development environment
docker-compose --profile dev up
```

### Production with Docker Compose

```bash
# Run production environment
docker-compose up -d
```

## 🔍 Code Quality

The project enforces code quality through:

- **ESLint**: Linting for JavaScript/TypeScript
- **Prettier**: Code formatting
- **TypeScript**: Type checking
- **Husky**: Pre-commit hooks
- **Pre-commit hooks**: Runs type checking and format validation

### Pre-commit Hooks

Before each commit, the following checks run automatically:

- TypeScript type checking (`npm run type-check`)
- Code formatting validation (`npm run format:check`)

## 🏛️ Architecture

### Frontend Stack

- **React 18+** with TypeScript for type safety
- **Vite** for fast development and optimized builds
- **shadcn/ui** components with Tailwind CSS
- **React Query** for state management and caching
- **React Router** for client-side routing

### Backend Integration

- **Supabase** for authentication, database, and real-time features
- **n8n** webhook integration for AI agent functionality
- **RESTful API** communication with error handling and retries

### Deployment

- **Docker** containerization with nginx for production
- **Multi-stage builds** for optimized image size
- **Environment-based configuration**

## 🚀 Production Deployment

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory, ready for deployment.

### Environment Variables for Production

Ensure these environment variables are set in your production environment:

- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `VITE_N8N_WEBHOOK_URL` - Your n8n webhook endpoint
- `VITE_APP_DOMAIN` - Your application domain

### Docker Production Deployment

The production Docker image uses nginx to serve the built static files:

```bash
docker build -t jarvis-chat .
docker run -d -p 80:80 --name jarvis-chat-prod jarvis-chat
```

## 🧪 Testing

### Type Checking

```bash
npm run type-check
```

### Linting

```bash
npm run lint
```

### Manual Testing Checklist

- [ ] Application loads without errors
- [ ] Dark theme applies correctly
- [ ] Crimson red primary color displays
- [ ] Neon accent colors are available
- [ ] Hot reload works in development
- [ ] Build process completes successfully
- [ ] Docker container builds and runs
- [ ] TypeScript compilation passes
- [ ] ESLint rules pass
- [ ] Prettier formatting is consistent

## 🔧 Troubleshooting

### Common Issues

1. **Node.js Version**: Ensure you're using Node.js 20 or higher
2. **Dependencies**: Run `npm install` if you encounter missing module errors
3. **Type Errors**: Run `npm run type-check` to identify TypeScript issues
4. **Build Errors**: Clear `node_modules` and reinstall dependencies

### Development Issues

- **Hot Reload Not Working**: Restart the development server
- **Import Path Issues**: Check that path aliases are correctly configured
- **Theme Not Applied**: Ensure Tailwind CSS is properly imported in `index.css`

### Docker Issues

- **Build Failures**: Ensure Node.js 20+ is available in the container
- **Port Conflicts**: Use different ports if 3000 or 80 are occupied
- **Environment Variables**: Verify all required variables are set

## 📝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Run tests: `npm run type-check && npm run lint`
5. Commit changes: `git commit -m "Add feature"`
6. Push to branch: `git push origin feature-name`
7. Create Pull Request

### Code Standards

- Use TypeScript for all new code
- Follow the existing code style (enforced by Prettier)
- Add type definitions for new interfaces
- Use semantic commit messages
- Ensure all tests pass before submitting

## 📄 License

This project is licensed under the MIT License.

## 🤝 Support

For questions, issues, or contributions, please refer to the project documentation or contact the development team.

---

**JARVIS Chat** - Built with ❤️ for seamless AI conversations
