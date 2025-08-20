import apiClient from './api'
import { QuizGenerationRequest, APIResponse, GenerateQuizResponse, Question } from '@/types/quiz'

export const quizService = {
  // Generate quiz from text
  generateQuiz: async (data: QuizGenerationRequest): Promise<APIResponse<GenerateQuizResponse>> => {
    const response = await apiClient.post('/quiz/generate', data)
    return response.data
  },

  // Generate quiz from file
  generateFromFile: async (formData: FormData): Promise<APIResponse<GenerateQuizResponse>> => {
    const response = await apiClient.post('/quiz/generate-from-file', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  // Test Gemini connection
  testGemini: async (): Promise<APIResponse<any>> => {
    const response = await apiClient.get('/quiz/test-gemini')
    return response.data
  },

  // Get available question types
  getQuestionTypes: async (): Promise<APIResponse<string[]>> => {
    const response = await apiClient.get('/quiz/question-types')
    return response.data
  },

  // Get available difficulty levels
  getDifficultyLevels: async (): Promise<APIResponse<string[]>> => {
    const response = await apiClient.get('/quiz/difficulty-levels')
    return response.data
  },

  // Get system limits
  getLimits: async (): Promise<APIResponse<any>> => {
    const response = await apiClient.get('/quiz/limits')
    return response.data
  },

  // Download as TXT
  downloadTxt: async (questions: Question[]): Promise<Blob> => {
    const response = await apiClient.post('/quiz/download/txt', 
      { questions }, 
      { responseType: 'blob' }
    )
    return response.data
  },

  // Download as PDF
  downloadPdf: async (questions: Question[], includeAnswers: boolean = true): Promise<Blob> => {
    const response = await apiClient.post('/quiz/download/pdf', 
      { questions, include_answers: includeAnswers }, 
      { responseType: 'blob' }
    )
    return response.data
  },

  // Download answer key
  downloadAnswerKey: async (questions: Question[]): Promise<Blob> => {
    const response = await apiClient.post('/quiz/download/answer-key', 
      { questions }, 
      { responseType: 'blob' }
    )
    return response.data
  },
}