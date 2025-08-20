'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { authService } from '@/services/authService'
import apiClient from '@/services/api'

export default function AuthCallback() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const searchParams = useSearchParams()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code')
        const state = searchParams.get('state')
        const error = searchParams.get('error')

        // Get return URL from session storage or default
        const returnUrl = sessionStorage.getItem('return_url_after_auth') || '/generate'
        
        if (error) {
          console.error('OAuth error:', error)
          setStatus('error')
          setMessage(`Authentication failed: ${error}`)
          // Redirect back after error
          setTimeout(() => {
            window.location.href = returnUrl
          }, 3000)
          return
        }

        if (!code) {
          console.error('No authorization code received')
          setStatus('error')
          setMessage('No authorization code received from Google')
          // Redirect back after error
          setTimeout(() => {
            window.location.href = returnUrl
          }, 3000)
          return
        }

        setStatus('loading')
        setMessage('Processing authentication...')

        // Call the backend callback endpoint directly
        const response = await apiClient.get('/auth/callback', {
          params: { code, state }
        })

        if (response.data.error) {
          throw new Error(response.data.message || 'Authentication failed')
        }

        // Store the credentials
        console.log('Storing credentials:', response.data.data)
        authService.storeCredentials(response.data.data)
        
        setStatus('success')
        setMessage('Authentication successful! Redirecting back...')

        // Clean up session storage
        sessionStorage.removeItem('quiz_data_before_auth')
        sessionStorage.removeItem('return_url_after_auth')

        // Simple redirect back - let the main page handle form creation
        console.log('Redirecting to:', returnUrl)
        setTimeout(() => {
          window.location.href = returnUrl
        }, 500)
        
        // Backup redirect in case setTimeout fails
        setTimeout(() => {
          if (window.location.pathname === '/auth/callback') {
            window.location.replace(returnUrl)
          }
        }, 2000)

      } catch (error) {
        console.error('Authentication callback error:', error)
        setStatus('error')
        setMessage(error instanceof Error ? error.message : 'Authentication failed')
        
        // Redirect back even on error
        const returnUrl = sessionStorage.getItem('return_url_after_auth') || '/generate'
        setTimeout(() => {
          window.location.href = returnUrl
        }, 3000)
      }
    }

    handleCallback()
  }, [searchParams])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            {status === 'loading' && (
              <div>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <h2 className="mt-4 text-lg font-medium text-gray-900">
                  Processing authentication...
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                  Please wait while we complete your Google authentication.
                </p>
              </div>
            )}

            {status === 'success' && (
              <div>
                <div className="mx-auto flex items-center justify-center h-8 w-8 rounded-full bg-green-100">
                  <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <h2 className="mt-4 text-lg font-medium text-green-900">
                  Authentication Successful!
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                  {message}
                </p>
                <p className="mt-2 text-xs text-gray-500">
                  You will be redirected automatically...
                </p>
                <button
                  onClick={() => window.location.href = '/generate'}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Continue to Quiz Generator
                </button>
              </div>
            )}

            {status === 'error' && (
              <div>
                <div className="mx-auto flex items-center justify-center h-8 w-8 rounded-full bg-red-100">
                  <svg className="h-5 w-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
                <h2 className="mt-4 text-lg font-medium text-red-900">
                  Authentication Failed
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                  {message}
                </p>
                <button
                  onClick={() => window.location.href = '/generate'}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Return to Quiz Generator
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}