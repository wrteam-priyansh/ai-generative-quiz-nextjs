# AI Quiz Generator Frontend

A modern Next.js frontend for the AI Quiz Generator that integrates with a FastAPI backend to create intelligent quizzes from text or uploaded files.

## Features

- 🤖 **AI-Powered Quiz Generation** - Generate quizzes from text input or uploaded files (PDF, DOCX, TXT)
- 📝 **Multiple Question Types** - Support for multiple choice, true/false, short answer, long answer, and fill-in-blank questions
- 🔗 **Google Forms Integration** - Create and manage Google Forms directly from generated quizzes
- 📊 **Flexible Difficulty Levels** - Generate questions with easy, medium, or hard difficulty
- 📥 **Multiple Export Formats** - Download quizzes as PDF, TXT, or answer keys
- 🎨 **Modern UI/UX** - Built with Tailwind CSS and Radix UI components
- 🔐 **Google OAuth Authentication** - Secure authentication for Google Forms integration
- 📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices

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

## Backend Integration

This frontend connects to a FastAPI backend that should be running on `http://localhost:8000`. The backend provides:

- Quiz generation endpoints
- File upload and processing
- Google OAuth authentication
- Google Forms API integration
- File download services (PDF, TXT, Answer Keys)

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