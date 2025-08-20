import apiClient from './api'
import { APIResponse, Question } from '@/types/quiz'
import { authService } from './authService'

interface GoogleFormResponse {
  form_id: string
  form_url: string
  edit_url: string
  title: string
  created_at: string
}

interface FormResponseData {
  form_id: string
  total_responses: number
  responses: Array<{
    response_id: string
    timestamp: string
    respondent_email: string
    answers: Array<{
      question_id: string
      question_text: string
      answer: string
      is_correct: boolean
      score: number
    }>
    total_score: number
    max_score: number
  }>
  retrieved_at: string
}

export const formsService = {
  // Create Google Form from quiz questions
  createFormFromQuiz: async (
    questions: Question[],
    formTitle?: string,
    formDescription?: string,
    isQuiz: boolean = true
  ): Promise<APIResponse<GoogleFormResponse>> => {
    const { access_token } = authService.getStoredCredentials()
    
    if (!access_token) {
      throw new Error('No Google access token found. Please authenticate first.')
    }

    const params = new URLSearchParams()
    if (formTitle) params.append('form_title', formTitle)
    if (formDescription) params.append('form_description', formDescription)
    params.append('is_quiz', isQuiz.toString())

    const response = await apiClient.post('/forms/create-from-quiz', questions, {
      headers: {
        'Authorization': `Bearer ${access_token}`
      },
      params: Object.fromEntries(params)
    })
    
    return response.data
  },

  // Get form responses
  getFormResponses: async (formId: string): Promise<APIResponse<FormResponseData>> => {
    const { access_token } = authService.getStoredCredentials()
    
    if (!access_token) {
      throw new Error('No Google access token found. Please authenticate first.')
    }

    const response = await apiClient.get(`/forms/${formId}/responses`, {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    })
    
    return response.data
  },

  // Delete form
  deleteForm: async (formId: string): Promise<APIResponse<{ deleted: boolean; form_id: string }>> => {
    const { access_token } = authService.getStoredCredentials()
    
    if (!access_token) {
      throw new Error('No Google access token found. Please authenticate first.')
    }

    const response = await apiClient.delete(`/forms/${formId}`, {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    })
    
    return response.data
  },

  // Get forms integration info
  getFormsInfo: async (): Promise<APIResponse<any>> => {
    const response = await apiClient.get('/forms/')
    return response.data
  }
}