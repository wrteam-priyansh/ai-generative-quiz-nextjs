'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

export default function PopupAuthCallback() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const searchParams = useSearchParams()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Handle both correct format (?auth=success) and malformed format (&auth=success)
        let urlParams = new URLSearchParams(window.location.search)
        
        // If no search params, check if the URL is malformed (contains &auth= in pathname)
        if (!urlParams.has('auth') && window.location.href.includes('&auth=')) {
          // Extract everything after the first &
          const malformedParams = window.location.href.split('&').slice(1).join('&')
          urlParams = new URLSearchParams(malformedParams)
        }
        
        const authSuccess = urlParams.get('auth')
        const userEmail = urlParams.get('user_email')
        const credentials = urlParams.get('credentials')
        const error = urlParams.get('error')

        if (error) {
          console.error('OAuth error:', error)
          setStatus('error')
          setMessage(`Authentication failed: ${error}`)
          
          // Send error message to parent window
          if (window.opener) {
            window.opener.postMessage({
              type: 'OAUTH_ERROR',
              error: error
            }, window.location.origin)
          }
          return
        }

        if (authSuccess === 'success' && credentials && userEmail) {
          console.log('OAuth successful in popup, processing credentials...')
          
          // Parse credentials (base64 encoded)
          const decodedCredentials = JSON.parse(atob(credentials))
          
          const credentialsToStore = {
            access_token: decodedCredentials.token,
            refresh_token: decodedCredentials.refresh_token || '',
            expires_in: Math.floor((new Date(decodedCredentials.expiry).getTime() - Date.now()) / 1000),
            user_info: {
              email: decodeURIComponent(userEmail),
              name: decodeURIComponent(urlParams.get('user_name') || ''),
              id: '',
              given_name: '',
              family_name: '',
              picture: '',
              locale: ''
            },
            credentials_json: JSON.stringify(decodedCredentials)
          }

          setStatus('success')
          setMessage('Authentication successful!')
          
          // Send success message with credentials to parent window
          if (window.opener) {
            window.opener.postMessage({
              type: 'OAUTH_SUCCESS',
              credentials: credentialsToStore
            }, window.location.origin)
          }
          
          // Close popup after a short delay
          setTimeout(() => {
            window.close()
          }, 1000)
        } else {
          throw new Error('Missing required authentication parameters')
        }
      } catch (error) {
        console.error('Popup callback error:', error)
        setStatus('error')
        setMessage(error instanceof Error ? error.message : 'Authentication failed')
        
        // Send error message to parent window
        if (window.opener) {
          window.opener.postMessage({
            type: 'OAUTH_ERROR',
            error: error instanceof Error ? error.message : 'Authentication failed'
          }, window.location.origin)
        }
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
                  This window will close automatically...
                </p>
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
                  onClick={() => window.close()}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Close Window
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}