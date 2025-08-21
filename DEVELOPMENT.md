# Development Guide

## Project Status: ✅ Production Ready

### Current State
All major features have been successfully implemented and tested:

✅ **Phase 1**: Project Setup  
✅ **Phase 2**: Core Components Development  
✅ **Phase 3**: UI Components Library  
✅ **Phase 4**: Quiz Results & Management  
✅ **Phase 5**: File Download System  
✅ **Phase 6**: Google Forms Integration  
✅ **Phase 7**: API Integration  
✅ **Phase 8**: User Experience Enhancements  
✅ **Phase 9**: Responsive Design  
🔄 **Phase 10**: Testing & Quality (Ongoing)  
🔄 **Phase 11**: Deployment & DevOps (Ready)  

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- FastAPI backend running on `http://localhost:8000`
- Google Cloud Project with Forms and Drive APIs enabled

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

## Completed Features

### 🎯 **Core Quiz Generation**
- ✅ AI-powered quiz creation using Google Gemini
- ✅ Text input and file upload support (PDF, DOCX, TXT)
- ✅ Configurable question count (1-40) and difficulty levels
- ✅ Multiple question types with intelligent generation

### 🔐 **Authentication System**
- ✅ Complete Google OAuth 2.0 integration
- ✅ Secure token management with automatic refresh
- ✅ Proper scope handling for Forms and Drive APIs
- ✅ Error recovery with re-authentication prompts

### 📥 **Export & Download System**
- ✅ PDF generation with professional formatting
- ✅ TXT export for plain text sharing
- ✅ Answer key generation with explanations
- ✅ Bulk download functionality with progress tracking

### 🔗 **Google Forms Integration**
- ✅ One-click form creation from quiz questions
- ✅ Real-time progress indicators during creation
- ✅ Smart popup blocker bypass with fallback options
- ✅ Multiple access methods (direct open, clipboard, links)
- ✅ Comprehensive error handling and recovery

### 🎨 **User Interface**
- ✅ Responsive design for all screen sizes
- ✅ Real-time feedback and progress indicators
- ✅ Accessible UI with Radix components
- ✅ Clean, modern styling with Tailwind CSS

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
- `quizService.ts` - Quiz generation and download management
- `authService.ts` - Google OAuth authentication
- `formsService.ts` - Google Forms API integration

#### Type Definitions
All TypeScript interfaces are defined in `src/types/`:
- `quiz.ts` - Quiz, Question, QuizGenerationRequest, and APIResponse types

## Technology Stack

- **Core Framework**: Next.js 15 with TypeScript and app router
- **Styling**: Tailwind CSS with Radix UI components  
- **Forms**: React Hook Form with Zod validation
- **State Management**: TanStack Query for server state
- **File Handling**: React Dropzone for uploads, js-file-download for exports
- **Icons**: Lucide React
- **Authentication**: Google OAuth with localStorage token storage

## Key Development Patterns

### API Integration
- Use the centralized `apiClient` from `src/services/api.ts`
- All API responses follow the `APIResponse<T>` interface
- Authentication tokens are automatically injected via axios interceptors
- 401 errors automatically redirect to login page

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
POST /quiz/generate                # Generate quiz from text
POST /quiz/generate-from-file      # Generate quiz from file upload
GET  /quiz/test-gemini            # Test AI connection
POST /quiz/download/pdf           # Download quiz as PDF
POST /quiz/download/txt           # Download quiz as TXT
POST /quiz/download/answer-key    # Download answer key
GET  /auth/google/authorize       # Initialize Google OAuth flow
GET  /auth/callback               # Handle OAuth callback and redirect
POST /forms/create-from-quiz      # Create Google Form from quiz questions
GET  /forms/{form_id}/responses   # Retrieve form responses
DELETE /forms/{form_id}           # Delete form
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

## File Upload Constraints

- **Supported formats**: PDF, DOCX, TXT
- **Maximum file size**: 10MB
- **Interface**: Drag-and-drop using react-dropzone

## Production Features

### 🎯 **Quiz Generation Capabilities**
- **Question Types**: Multiple choice, True/false, Open-ended
- **Content Sources**: Text input, PDF files, DOCX documents, TXT files
- **Configuration**: 1-40 questions, Basic/Intermediate/Advanced difficulty
- **AI Quality**: Powered by Google Gemini for intelligent question generation

### 📤 **Export & Integration Options**
- **PDF Download**: Professional formatting with questions and optional answers
- **TXT Export**: Plain text format for easy sharing and editing
- **Answer Key**: Comprehensive answer sheets with explanations
- **Google Forms**: Interactive forms with automatic grading and response collection

### 🔧 **Technical Implementation**
- **Smart Form Creation**: Pre-opens tabs to bypass popup blockers
- **Progress Tracking**: Real-time status updates during form generation
- **Error Recovery**: Comprehensive fallback options (clipboard, manual links)
- **Authentication**: Seamless OAuth flow with proper token management

## Environment Configuration

Required environment variables:
- `NEXT_PUBLIC_API_BASE_URL` - Backend API URL (default: http://localhost:8000)
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` - Google OAuth client ID

## Troubleshooting

### Common Issues
1. **API Connection Errors**: Check backend server status and CORS configuration
2. **Build Failures**: Verify all TypeScript types and imports
3. **Styling Issues**: Check Tailwind CSS configuration and PostCSS setup
4. **Authentication Problems**: Verify Google OAuth configuration and credentials
5. **File Upload Issues**: Check file size limits and supported formats

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