# Development Guide

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- FastAPI backend running on `http://localhost:8000`

### Setup
```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your configuration

# Start development server
npm run dev
```

## Development Workflow

### Phase-Based Development
Follow the structured approach outlined in `FRONTEND_TODO.md`:

1. **Phase 1**: Project Setup ✅ (Completed)
2. **Phase 2**: Core Components Development
3. **Phase 3**: UI Components Library
4. **Phase 4**: Quiz Results & Management
5. **Phase 5**: File Download System
6. **Phase 6**: Google Forms Integration
7. **Phase 7**: API Integration
8. **Phase 8**: User Experience Enhancements
9. **Phase 9**: Responsive Design
10. **Phase 10**: Testing & Quality
11. **Phase 11**: Deployment & DevOps

### Code Organization

#### Components Structure
```
src/components/
├── ui/                  # Basic UI components (Button, Input, Card, etc.)
├── forms/               # Form-specific components
├── layout/              # Layout components (Header, Sidebar, Footer)
├── quiz/                # Quiz-related components
└── auth/                # Authentication components
```

#### Services Architecture
- `api.ts` - Base API client with interceptors
- `quizService.ts` - Quiz generation and management
- `authService.ts` - Authentication (to be implemented)
- `formsService.ts` - Google Forms integration (to be implemented)

#### Type Definitions
All TypeScript interfaces are defined in `src/types/`:
- `quiz.ts` - Quiz, Question, and API response types
- `auth.ts` - Authentication types (to be implemented)
- `forms.ts` - Google Forms types (to be implemented)

## Key Development Patterns

### API Integration
- Use the centralized `apiClient` from `src/services/api.ts`
- All API responses follow the `APIResponse<T>` interface
- Authentication tokens are automatically handled by interceptors

### Form Handling
- Use React Hook Form with Zod validation
- Forms should be reusable and follow the established patterns
- Error handling should be consistent across all forms

### State Management
- Use TanStack Query for server state
- Use React Context for global client state
- Keep component state local when possible

### Styling Guidelines
- Use Tailwind CSS for all styling
- Follow mobile-first responsive design
- Use Radix UI components as base for complex interactions
- Maintain consistent spacing and color schemes

## Backend API Integration

### Base URL Configuration
```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'
```

### Expected Backend Endpoints
```
POST /quiz/generate              # Generate quiz from text
POST /quiz/generate-from-file    # Generate quiz from file upload
GET  /quiz/test-gemini          # Test AI connection
GET  /quiz/question-types       # Get available question types
GET  /quiz/difficulty-levels    # Get available difficulty levels
POST /quiz/download/pdf         # Download quiz as PDF
POST /quiz/download/txt         # Download quiz as TXT
POST /quiz/download/answer-key  # Download answer key
GET  /auth/google/authorize     # Google OAuth
GET  /auth/callback             # OAuth callback
POST /forms/create              # Create Google Form
```

### API Response Format
```typescript
interface APIResponse<T> {
  error: boolean
  data: T
  message: string
}
```

## Testing Strategy

### Unit Testing
- Use Jest and React Testing Library
- Test components in isolation
- Mock API calls and external dependencies

### Integration Testing
- Test component interactions
- Test API integration flows
- Test form validation and submission

### E2E Testing
- Use Playwright for end-to-end tests
- Test critical user journeys
- Test across different browsers and devices

## Performance Considerations

### Code Splitting
- Implement dynamic imports for large components
- Use Next.js built-in code splitting features
- Load components lazily where appropriate

### Caching
- Use TanStack Query for intelligent caching
- Implement proper cache invalidation strategies
- Cache static assets appropriately

### Bundle Optimization
- Analyze bundle size regularly
- Tree-shake unused dependencies
- Optimize images and assets

## Security Best Practices

### Authentication
- Use secure token storage
- Implement proper token refresh logic
- Handle authentication errors gracefully

### API Security
- Validate all user inputs
- Sanitize data before sending to backend
- Handle sensitive data appropriately

### Environment Variables
- Never commit sensitive keys to version control
- Use proper environment variable naming
- Validate required environment variables on startup

## Deployment

### Build Process
```bash
# Production build
npm run build

# Start production server
npm run start
```

### Environment Setup
- Configure production environment variables
- Set up proper error monitoring
- Implement analytics if needed

### Performance Monitoring
- Monitor bundle size
- Track Core Web Vitals
- Set up error tracking

## Troubleshooting

### Common Issues
1. **API Connection Errors**: Check backend server status and CORS configuration
2. **Build Failures**: Verify all TypeScript types and imports
3. **Styling Issues**: Check Tailwind CSS configuration and PostCSS setup
4. **Authentication Problems**: Verify Google OAuth configuration

### Debug Tools
- Use React Developer Tools
- Use Next.js built-in debugger
- Check Network tab for API calls
- Use TypeScript compiler for type checking

## Contributing Guidelines

### Code Quality
- Follow TypeScript strict mode
- Use ESLint and Prettier
- Write meaningful commit messages
- Add proper JSDoc comments for complex functions

### Pull Request Process
1. Create feature branch from main
2. Implement changes following established patterns
3. Add tests for new functionality
4. Update documentation if needed
5. Submit PR with clear description

### Code Review Checklist
- [ ] TypeScript types are properly defined
- [ ] Components follow established patterns
- [ ] API integration is properly handled
- [ ] Error handling is implemented
- [ ] Responsive design is maintained
- [ ] Performance considerations are addressed