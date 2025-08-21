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
    const credentials = authService.getStoredCredentials()
    console.log('Retrieved credentials for Forms API:', {
      hasAccessToken: !!credentials.access_token,
      tokenLength: credentials.access_token?.length,
      expiresAt: credentials.token_expires_at,
      currentTime: Date.now(),
      isExpired: credentials.token_expires_at ? Date.now() > parseInt(credentials.token_expires_at) : 'no expiry'
    })
    
    if (!credentials.access_token) {
      throw new Error('No Google access token found. Please authenticate first.')
    }

    // Check if token is expired
    if (credentials.token_expires_at && Date.now() > parseInt(credentials.token_expires_at)) {
      throw new Error('Access token has expired. Please re-authenticate.')
    }

    const params = new URLSearchParams()
    if (formTitle) params.append('form_title', formTitle)
    if (formDescription) params.append('form_description', formDescription)
    params.append('is_quiz', isQuiz.toString())

    console.log('Making Forms API request with:', {
      url: '/forms/create-from-quiz',
      questionsCount: questions.length,
      params: Object.fromEntries(params),
      authHeader: `Bearer ${credentials.access_token.substring(0, 20)}...`
    })

    // Try different authorization approaches based on backend expectations
    const authHeaders: any = {
      'Authorization': `Bearer ${credentials.access_token}`
    }
    
    // If we have the full credentials JSON, include it as well
    if (credentials.credentials_json) {
      authHeaders['X-Google-Credentials'] = credentials.credentials_json
    }

    const response = await apiClient.post('/forms/create-from-quiz', questions, {
      headers: authHeaders,
      params: Object.fromEntries(params)
    })
    
    console.log('Forms API response:', response.data)
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