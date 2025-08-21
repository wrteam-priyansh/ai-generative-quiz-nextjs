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
- **Quiz Service**: `src/services/quizService.ts` - All quiz-related API calls (download PDF/TXT/answer key)
- **Auth Service**: `src/services/authService.ts` - Google OAuth flow and credential management
- **Forms Service**: `src/services/formsService.ts` - Google Forms API integration
- **Backend URL**: Configured via `NEXT_PUBLIC_API_BASE_URL` (default: http://localhost:8000)
- **Authentication**: Google OAuth with credentials stored in localStorage

### Type System
- **Core Types**: `src/types/quiz.ts` defines Question, Quiz, QuizGenerationRequest, and APIResponse interfaces
- **API Response Pattern**: All backend responses follow `APIResponse<T>` with error, data, and message fields
- **Question Types**: 'multiple_choice' | 'true_false' | 'short_answer' | 'long_answer' | 'fill_in_blank'

### Backend Integration Points
The frontend integrates with these FastAPI endpoints:
- `POST /quiz/generate` - Generate quiz from text
- `POST /quiz/generate-from-file` - Generate quiz from file upload  
- `GET /quiz/test-gemini` - Test AI connection
- `POST /quiz/download/pdf` - Download quiz as PDF (with questions, include_answers, topic, difficulty_levels)
- `POST /quiz/download/txt` - Download as text file (same parameters)
- `POST /quiz/download/answer-key` - Download answer key (same parameters)
- `GET /auth/google/authorize` - Initialize Google OAuth flow
- `GET /auth/callback` - Handle OAuth callback and redirect to frontend
- `POST /forms/create-from-quiz` - Create Google Form from quiz questions
- `GET /forms/{form_id}/responses` - Retrieve form responses
- `DELETE /forms/{form_id}` - Delete form

### Project Structure
```
src/
├── app/                 # Next.js app router pages
│   ├── auth/callback/   # OAuth callback handler page
│   └── generate/        # Main quiz generation page
├── components/          # Reusable UI components
│   └── QuizDisplay.tsx  # Quiz results and export functionality
├── services/            # API service layer
│   ├── api.ts           # Base axios client
│   ├── quizService.ts   # Quiz generation and download APIs
│   ├── authService.ts   # Google OAuth authentication
│   └── formsService.ts  # Google Forms integration
├── types/               # TypeScript type definitions
│   └── quiz.ts          # Quiz-related interfaces
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

## Development Status

✅ **Completed Features:**
- **Core Quiz Generation**: Text and file-based quiz creation with AI
- **Authentication System**: Complete Google OAuth integration
- **Quiz Export System**: PDF, TXT, and Answer Key downloads
- **Google Forms Integration**: Full end-to-end form creation with progress tracking
- **Responsive UI**: Clean, accessible interface with Tailwind CSS
- **Error Handling**: Comprehensive error management and user feedback

🔄 **Current Phase:** Production-ready with all major features implemented

## Key Implementation Notes

### Authentication Flow
- **Google OAuth Integration**: Complete OAuth 2.0 flow with secure token management
- **Credential Storage**: Access tokens and refresh tokens stored in localStorage
- **Automatic Authentication**: Token injection via axios interceptors
- **Error Handling**: 401/403 error handling with automatic re-authentication prompts
- **Scope Management**: Forms and Drive API scopes for full Google integration

### Quiz Generation Flow
1. **Content Input**: User inputs text or uploads file (PDF/DOCX/TXT, max 10MB)
2. **Configuration**: Select question types, difficulty levels, number of questions (1-40)
3. **AI Processing**: Backend uses Google Gemini for intelligent question generation
4. **Results Display**: Interactive quiz preview with all questions and answers
5. **Export Options**: Multiple formats available:
   - **PDF Download**: Formatted quiz document
   - **TXT Download**: Plain text version
   - **Answer Key**: Separate answer sheet
   - **Google Forms**: Live form with automatic grading

### Google Forms Integration
- **Seamless Creation**: One-click form generation from quiz questions
- **Real-time Progress**: Visual progress indicators during form creation
- **Popup Handling**: Smart popup blocker bypass with fallback options
- **Multiple Access Methods**: Direct tab opening, clipboard copy, or clickable links
- **Error Recovery**: Comprehensive error handling with user-friendly messages

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