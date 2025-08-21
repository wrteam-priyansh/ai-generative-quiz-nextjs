# AI Quiz Generator Frontend

A production-ready Next.js frontend for the AI Quiz Generator that creates intelligent quizzes from text or uploaded files with seamless Google Forms integration.

## ✨ Features

### 🤖 **AI-Powered Quiz Generation**
- Generate intelligent quizzes from text input or uploaded files (PDF, DOCX, TXT)
- Powered by Google Gemini AI for high-quality question generation
- Support for 1-40 questions per quiz with customizable difficulty levels

### 📝 **Comprehensive Question Types**
- Multiple choice questions with 4 options
- True/false questions with explanations
- Open-ended questions for detailed responses
- Automatic answer validation and scoring

### 🔗 **Advanced Google Forms Integration**
- **One-click form creation** from generated quizzes
- **Real-time progress tracking** with visual indicators
- **Smart popup handling** with multiple fallback options
- **Automatic grading** for quiz mode forms
- **Form management** with edit and delete capabilities

### 📊 **Flexible Configuration**
- **Difficulty Levels**: Basic, Intermediate, Advanced
- **Question Count**: 1-40 questions per quiz
- **Topic Customization**: Specify focus areas for targeted content
- **File Upload**: Support for PDF, DOCX, TXT files (max 10MB)

### 📥 **Multiple Export Options**
- **PDF Download**: Professionally formatted quiz documents
- **TXT Download**: Plain text version for easy sharing
- **Answer Key**: Separate answer sheets with explanations
- **Google Forms**: Interactive forms with automatic grading

### 🔐 **Secure Authentication**
- **Google OAuth 2.0** integration with proper scope management
- **Automatic token refresh** for seamless user experience
- **Secure credential storage** with localStorage management
- **Error recovery** with re-authentication prompts

### 🎨 **Modern User Experience**
- **Responsive design** optimized for all device sizes
- **Real-time feedback** with progress indicators and status updates
- **Accessible UI** built with Radix UI components
- **Clean interface** with Tailwind CSS styling

## Tech Stack

- **Framework**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Form Handling**: React Hook Form with Zod validation
- **State Management**: TanStack Query
- **API Client**: Axios
- **File Handling**: React Dropzone
- **Icons**: Lucide React

## Quick Start

1. **Clone and install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your configuration
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser** to [http://localhost:3000](http://localhost:3000)

## Environment Variables

Create a `.env.local` file with the following variables:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- A running FastAPI backend (available separately)
- Google Cloud Project with Forms and Drive API enabled

### Backend Integration

This frontend connects to a FastAPI backend that should be running on `http://localhost:8000`. The backend provides:

- **AI Quiz Generation**: Google Gemini integration for intelligent question creation
- **File Processing**: PDF, DOCX, TXT file parsing and content extraction
- **Google OAuth**: Complete authentication flow with token management
- **Google Forms API**: Form creation, management, and response retrieval
- **Export Services**: PDF/TXT generation and answer key formatting

### Production Deployment

For production deployment:

1. **Backend Requirements**: Ensure the FastAPI backend is deployed and accessible
2. **Environment Variables**: Update `NEXT_PUBLIC_API_BASE_URL` to point to your backend
3. **Google Cloud Setup**: Configure OAuth credentials for your domain
4. **Build & Deploy**: Use `npm run build` and deploy to your preferred platform

## Project Structure

```
src/
├── app/                 # Next.js app directory
├── components/          # Reusable UI components
├── contexts/            # React contexts
├── hooks/               # Custom React hooks
├── services/            # API service functions
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
└── styles/              # Global styles
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Contributing

1. Follow the development phases outlined in `FRONTEND_TODO.md`
2. Ensure all TypeScript types are properly defined
3. Use the existing component patterns and styling conventions
4. Test integration with the backend API regularly

## License

ISC