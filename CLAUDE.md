# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js frontend for an AI Quiz Generator that integrates with a FastAPI backend. The application generates intelligent quizzes from text or uploaded files, with Google Forms integration and multiple export formats.

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linting
npm run lint
```

## Core Architecture

### API Integration Layer
- **Base API Client**: `src/services/api.ts` - Centralized axios client with authentication interceptors
- **Quiz Service**: `src/services/quizService.ts` - All quiz-related API calls
- **Backend URL**: Configured via `NEXT_PUBLIC_API_BASE_URL` (default: http://localhost:8000)
- **Authentication**: Bearer token stored in localStorage, automatic redirect on 401 errors

### Type System
- **Core Types**: `src/types/quiz.ts` defines Question, Quiz, QuizGenerationRequest, and APIResponse interfaces
- **API Response Pattern**: All backend responses follow `APIResponse<T>` with error, data, and message fields
- **Question Types**: 'multiple_choice' | 'true_false' | 'short_answer' | 'long_answer' | 'fill_in_blank'

### Backend Integration Points
The frontend expects these FastAPI endpoints:
- `POST /quiz/generate` - Generate quiz from text
- `POST /quiz/generate-from-file` - Generate quiz from file upload  
- `GET /quiz/test-gemini` - Test AI connection
- `POST /quiz/download/pdf` - Download quiz as PDF
- `POST /quiz/download/txt` - Download as text file
- `POST /quiz/download/answer-key` - Download answer key
- `GET /auth/google/authorize` - Google OAuth flow
- `POST /forms/create` - Create Google Form

### Project Structure
```
src/
├── app/                 # Next.js app router pages
├── components/          # Reusable UI components
├── services/            # API service layer
├── types/               # TypeScript type definitions
├── contexts/            # React contexts (auth, theme, etc.)
├── hooks/               # Custom React hooks
└── utils/               # Utility functions
```

## Technology Stack

**Core Framework**: Next.js 15 with TypeScript and app router
**Styling**: Tailwind CSS with Radix UI components
**Forms**: React Hook Form with Zod validation
**State Management**: TanStack Query for server state
**File Handling**: React Dropzone for uploads, js-file-download for exports
**Icons**: Lucide React

## Development Phases

The project follows a structured 11-phase development approach outlined in `FRONTEND_TODO.md`. Phase 1 (project setup) is complete. Key upcoming phases:

- **Phase 2**: Layout & Navigation, Authentication Components, Quiz Generation Components
- **Phase 3**: Reusable UI Components Library
- **Phase 4**: Quiz Results & Management Features
- **Phase 5**: File Download System
- **Phase 6**: Google Forms Integration

## Key Implementation Notes

### Authentication Flow
- Google OAuth integration with token storage in localStorage
- Automatic token injection via axios interceptors
- 401 error handling with redirect to login page

### Quiz Generation Flow
1. User inputs text or uploads file (PDF/DOCX/TXT, max 10MB)
2. Selects question types, difficulty, number of questions (1-40)
3. Frontend calls appropriate generation endpoint
4. Quiz displayed with edit/preview capabilities
5. Export options: PDF, TXT, Answer Key, or Google Forms

### File Upload Constraints
- Supported formats: PDF, DOCX, TXT
- Maximum file size: 10MB
- Drag-and-drop interface using react-dropzone

### Environment Configuration
Required environment variables:
- `NEXT_PUBLIC_API_BASE_URL` - Backend API URL
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` - Google OAuth client ID

## Common Development Tasks

### Adding New API Endpoints
1. Define TypeScript interfaces in `src/types/`
2. Add service function to appropriate file in `src/services/`
3. Use existing apiClient for consistent error handling

### Creating UI Components
- Follow Radix UI patterns for accessibility
- Use Tailwind CSS for styling
- Implement responsive design (mobile-first)
- Add proper TypeScript props interfaces

### Form Implementation
- Use React Hook Form with Zod schemas
- Follow established validation patterns
- Implement proper error messaging
- Use existing form component patterns

When implementing features, refer to FRONTEND_TODO.md for detailed requirements and maintain consistency with the established architecture patterns.