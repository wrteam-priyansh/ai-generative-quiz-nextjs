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
      isExpired: credentials.token_expires_at ? Date.now() > parseInt(credentials.token_expires_at) : 'no expiry',
      hasCredentialsJson: !!credentials.credentials_json,
      userInfo: credentials.user_info
    })
    
    if (!credentials.access_token) {
      throw new Error('No Google access token found. Please authenticate first.')
    }

    // Check if token is expired
    if (credentials.token_expires_at && Date.now() > parseInt(credentials.token_expires_at)) {
      throw new Error('Access token has expired. Please re-authenticate.')
    }

    // Validate that we have sufficient credentials for Forms API
    if (!credentials.credentials_json) {
      console.warn('No credentials JSON found, this might cause authentication issues')
    }

    const params = new URLSearchParams()
    if (formTitle) params.append('form_title', formTitle)
    if (formDescription) params.append('form_description', formDescription)
    params.append('is_quiz', isQuiz.toString())

    console.log('Making Forms API request with:', {
      url: '/forms/create-from-quiz',
      questionsCount: questions.length,
      params: Object.fromEntries(params),
      authHeader: `Bearer ${credentials.access_token.substring(0, 20)}...`,
      sampleQuestions: questions.slice(0, 2).map(q => ({
        id: q.id,
        question_text: q.question_text?.substring(0, 50) + '...',
        question_type: q.question_type,
        hasOptions: !!q.options,
        optionsCount: q.options?.length || 0
      }))
    })

    // Based on backend error "Invalid credentials format", send credentials as expected
    const authHeaders: any = {
      'Content-Type': 'application/json'
    }
    
    // The backend expects the full credentials JSON string in the authorization header
    if (credentials.credentials_json) {
      console.log('Sending credentials JSON to backend...')
      authHeaders['authorization'] = credentials.credentials_json
    } else {
      console.warn('No credentials JSON available, backend requires full credentials format')
      throw new Error('Missing credentials JSON required for Google Forms API')
    }

    try {
      const response = await apiClient.post('/forms/create-from-quiz', questions, {
        headers: authHeaders,
        params: Object.fromEntries(params)
      })
      
      console.log('Forms API response:', response.data)
      
      // Check if the response indicates an error even though status is 200
      if (response.data.error) {
        console.error('Backend returned error in response:', response.data)
        throw new Error(response.data.message || 'Backend returned an error')
      }
      
      return response.data
    } catch (error: any) {
      console.error('Forms API error:', error)
      console.error('Full error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers,
        requestHeaders: authHeaders,
        requestUrl: '/forms/create-from-quiz',
        requestParams: Object.fromEntries(params)
      })
      
      // Handle authentication errors specifically
      if (error.response?.status === 401) {
        // Clear the stored credentials since they're invalid
        authService.clearCredentials()
        throw new Error('Authentication failed. Please log in with Google again.')
      } else if (error.response?.status === 403) {
        throw new Error('Permission denied. Please ensure you have granted the necessary permissions.')
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message)
      } else if (error.response?.data?.error) {
        throw new Error(error.response.data.error)
      } else {
        throw new Error(`Failed to create Google Form: ${error.message || 'Unknown error'}`)
      }
    }
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