import apiClient from './api'
import { APIResponse } from '@/types/quiz'

interface GoogleAuthResponse {
  auth_url: string
}

interface AuthCallbackResponse {
  access_token: string
  refresh_token: string
  expires_in: number
  user_info: {
    id: string
    email: string
    name: string
    given_name: string
    family_name: string
    picture: string
    locale: string
  }
  credentials_json: string
}

interface TokenRefreshResponse {
  access_token: string
  expires_in: number
}

interface CredentialValidation {
  valid: boolean
  status: string
}

export const authService = {
  // Get Google OAuth authorization URL
  getGoogleAuthUrl: async (state?: string): Promise<APIResponse<GoogleAuthResponse>> => {
    // Use current page as redirect URL to preserve quiz data
    const redirectState = state || `${window.location.href}&auth=success`
    console.log('Getting OAuth URL with redirect state:', redirectState)
    const params = { state: redirectState }
    const response = await apiClient.get('/auth/google/authorize', { params })
    console.log('OAuth URL response:', response.data)
    return response.data
  },

  // Refresh access token
  refreshToken: async (refreshToken: string): Promise<APIResponse<TokenRefreshResponse>> => {
    const response = await apiClient.post('/auth/refresh', null, {
      params: { refresh_token: refreshToken }
    })
    return response.data
  },

  // Validate Google credentials
  validateCredentials: async (credentialsJson: string): Promise<APIResponse<CredentialValidation>> => {
    const response = await apiClient.post('/auth/validate', null, {
      params: { credentials_json: credentialsJson }
    })
    return response.data
  },

  // Store credentials in localStorage
  storeCredentials: (data: AuthCallbackResponse) => {
    console.log('Storing credentials with data:', data)
    localStorage.setItem('google_access_token', data.access_token)
    localStorage.setItem('google_refresh_token', data.refresh_token)
    localStorage.setItem('google_credentials_json', data.credentials_json)
    localStorage.setItem('user_info', JSON.stringify(data.user_info))
    
    // Calculate expiry time from expires_in (seconds)
    const expiryTime = Date.now() + (data.expires_in * 1000)
    localStorage.setItem('token_expires_at', expiryTime.toString())
    
    console.log('Stored tokens:', {
      access_token: !!localStorage.getItem('google_access_token'),
      refresh_token: !!localStorage.getItem('google_refresh_token'),
      expires_at: localStorage.getItem('token_expires_at'),
      current_time: Date.now()
    })
  },

  // Get stored credentials
  getStoredCredentials: () => {
    return {
      access_token: localStorage.getItem('google_access_token'),
      refresh_token: localStorage.getItem('google_refresh_token'),
      credentials_json: localStorage.getItem('google_credentials_json'),
      user_info: localStorage.getItem('user_info') ? JSON.parse(localStorage.getItem('user_info')!) : null,
      token_expires_at: localStorage.getItem('token_expires_at')
    }
  },

  // Clear stored credentials
  clearCredentials: () => {
    localStorage.removeItem('google_access_token')
    localStorage.removeItem('google_refresh_token')
    localStorage.removeItem('google_credentials_json')
    localStorage.removeItem('user_info')
    localStorage.removeItem('token_expires_at')
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    const { access_token, token_expires_at } = authService.getStoredCredentials()
    console.log('isAuthenticated check:', { 
      access_token: !!access_token, 
      token_expires_at, 
      currentTime: Date.now(),
      isExpired: token_expires_at ? Date.now() > parseInt(token_expires_at) : 'no expiry'
    })
    
    if (!access_token) {
      console.log('No access token found')
      return false
    }
    
    // If no expiry time, consider it valid (some OAuth flows don't provide expiry)
    if (!token_expires_at) {
      console.log('No expiry time found, considering token valid')
      return true
    }
    
    const isValid = Date.now() < parseInt(token_expires_at)
    console.log('Token validation result:', isValid)
    return isValid
  }
}