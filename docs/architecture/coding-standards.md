# Coding Standards

## Code Style & Formatting

### JavaScript/TypeScript
- **ESLint**: Use provided eslint.config.js configuration
- **Prettier**: Format all code with `npm run format`
- **TypeScript**: Strict mode enabled, all code must be typed
- **Imports**: Use absolute imports with `@/` alias for src directory
- **File Extensions**: `.ts` for utilities, `.tsx` for React components

### React Components
- **Functional Components**: Use function declarations, not arrow functions for components
- **Hooks**: Follow React Hooks rules, use custom hooks for shared logic
- **Props**: Define interfaces for all component props
- **Naming**: PascalCase for components, camelCase for functions and variables

```typescript
// ✅ Good
interface ButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

function Button({ onClick, disabled = false }: ButtonProps) {
  return <button onClick={onClick} disabled={disabled} />;
}

// ❌ Bad  
const button = ({ onClick, disabled }) => {
  return <button onClick={onClick} disabled={disabled} />;
}
```

## File Organization

### Component Structure
```
components/
├── feature-name/
│   ├── ComponentName.tsx
│   ├── __tests__/
│   │   └── ComponentName.test.tsx
│   └── index.ts (if needed for exports)
```

### Test Requirements
- **Coverage**: All components must have tests
- **Location**: Tests in `__tests__/` directory alongside components
- **Naming**: `ComponentName.test.tsx`
- **Framework**: Vitest + React Testing Library

### Import Order
1. React and external libraries
2. Internal utilities and services  
3. Components (relative imports last)
4. Types and interfaces

```typescript
import React from 'react';
import { useQuery } from '@tanstack/react-query';

import { chatService } from '@/lib/chatService';
import { Button } from '@/components/ui/button';

import type { ChatMessage } from '@/types/chat';
```

## Code Quality

### Error Handling
- Use ErrorBoundary for React error handling
- Implement proper error states in components
- Log errors appropriately with structured logging

### Performance
- Use React.memo for expensive components
- Implement proper loading states
- Optimize bundle size with code splitting

### Accessibility
- All interactive elements must be keyboard accessible
- Use semantic HTML elements
- Include proper ARIA labels
- Test with screen readers

### Security
- Validate all user inputs
- Sanitize data before rendering
- Use environment variables for secrets
- Never commit sensitive data

## Git Workflow

### Commit Messages
```
type(scope): description

feat(chat): add message search functionality
fix(auth): resolve login redirect issue
docs(readme): update installation instructions
```

### Branch Naming
- `feature/description`
- `fix/issue-description`  
- `docs/documentation-update`

### Pre-commit Hooks
- ESLint checks must pass
- Type checking must pass
- Tests must pass
- Code must be formatted

## Documentation

### Code Comments
- Use JSDoc for functions and complex logic
- Explain "why" not "what"
- Keep comments up to date

### README Updates
- Document new features
- Update setup instructions
- Include usage examples

## Validation Commands

Before committing, run:
```bash
npm run lint        # ESLint checks
npm run type-check  # TypeScript validation  
npm run test:run    # Full test suite
npm run format      # Code formatting
```