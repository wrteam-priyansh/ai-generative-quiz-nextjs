'use client'

import { useState, useEffect } from 'react'
import { quizService } from '@/services/quizService'
import { formsService } from '@/services/formsService'
import { authService } from '@/services/authService'
import download from 'js-file-download'

interface QuizDisplayProps {
  quizData: any
}

export default function QuizDisplay({ quizData }: QuizDisplayProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [authPopup, setAuthPopup] = useState<Window | null>(null)
  const [showAuthComplete, setShowAuthComplete] = useState(false)

  if (!quizData) return null

  // Check if user just returned from authentication
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const authSuccess = urlParams.get('auth')
    const userEmail = urlParams.get('user_email')
    const credentials = urlParams.get('credentials')
    
    if (authSuccess === 'success' && credentials && quizData) {
      console.log('User returned from successful authentication, creating Google Form...')
      
      // Store credentials from URL parameters
      try {
        const decodedCredentials = JSON.parse(decodeURIComponent(credentials))
        authService.storeCredentials({
          access_token: decodedCredentials.token,
          refresh_token: decodedCredentials.refresh_token,
          expires_in: Math.floor((new Date(decodedCredentials.expiry).getTime() - Date.now()) / 1000),
          user_info: {
            email: decodeURIComponent(userEmail || ''),
            name: decodeURIComponent(urlParams.get('user_name') || ''),
            id: '',
            given_name: '',
            family_name: '',
            picture: '',
            locale: ''
          },
          credentials_json: JSON.stringify(decodedCredentials)
        })
        
        // Clean up URL parameters
        window.history.replaceState({}, document.title, window.location.pathname)
        
        // Create Google Form automatically
        setTimeout(() => {
          createGoogleFormDirect()
        }, 1000)
        
      } catch (error) {
        console.error('Error processing authentication:', error)
        alert('Authentication succeeded but failed to process credentials.')
      }
    }
  }, [quizData])

  const handleDownload = async (format: 'pdf' | 'txt') => {
    try {
      setIsDownloading(true)
      setIsDropdownOpen(false)
      
      if (format === 'txt') {
        const blob = await quizService.downloadTxt(
          quizData.questions,
          true, // include_answers
          quizData.topic,
          quizData.difficulty_levels
        )
        const fileName = `quiz_${quizData.topic.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`
        download(blob, fileName)
      } else if (format === 'pdf') {
        const blob = await quizService.downloadPdf(
          quizData.questions,
          true, // include_answers
          quizData.topic,
          quizData.difficulty_levels
        )
        const fileName = `quiz_${quizData.topic.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
        download(blob, fileName)
      }
    } catch (error) {
      console.error(`Error downloading ${format}:`, error)
    } finally {
      setIsDownloading(false)
    }
  }

  const handleDownloadAnswerKey = async () => {
    try {
      setIsDownloading(true)
      
      const blob = await quizService.downloadAnswerKey(
        quizData.questions,
        true, // include_answers
        quizData.topic,
        quizData.difficulty_levels
      )
      const fileName = `quiz_answer_key_${quizData.topic.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`
      download(blob, fileName)
    } catch (error) {
      console.error('Error downloading answer key:', error)
    } finally {
      setIsDownloading(false)
    }
  }

  // Create Google Form directly (when already authenticated)
  const createGoogleFormDirect = async () => {
    try {
      setIsDownloading(true)

      const formTitle = `AI Generated Quiz - ${quizData.topic}`
      const formDescription = `Quiz with ${quizData.total_questions} questions on ${quizData.topic}`
      
      const formResponse = await formsService.createFormFromQuiz(
        quizData.questions,
        formTitle,
        formDescription,
        true
      )

      if (!formResponse.error && formResponse.data) {
        // Open the created form in a new tab
        window.open(formResponse.data.form_url, '_blank')
        alert(`Google Form created successfully! Form URL: ${formResponse.data.form_url}`)
      } else {
        throw new Error('Failed to create Google Form')
      }
    } catch (error) {
      console.error('Error creating Google Form:', error)
      if (error instanceof Error) {
        alert(`Error creating Google Form: ${error.message}`)
      }
    } finally {
      setIsDownloading(false)
    }
  }

  const handleCompleteAuthentication = async () => {
    console.log('Checking authentication status...')
    
    // Get stored credentials for debugging
    const credentials = authService.getStoredCredentials()
    console.log('Stored credentials:', {
      hasAccessToken: !!credentials.access_token,
      hasRefreshToken: !!credentials.refresh_token,
      tokenExpiresAt: credentials.token_expires_at,
      currentTime: Date.now(),
      isExpired: credentials.token_expires_at ? Date.now() > parseInt(credentials.token_expires_at) : 'no expiry data'
    })
    
    if (credentials.access_token) {
      console.log('Access token found, proceeding with form creation...')
      setShowAuthComplete(false)
      await createGoogleFormDirect()
    } else {
      console.log('No access token found')
      alert('Authentication not detected. Please complete the authentication in the popup window first.')
    }
  }

  const handleCreateGoogleForm = async () => {
    try {
      setIsDownloading(true)
      
      // Check if user is authenticated
      if (!authService.isAuthenticated()) {
        console.log('User not authenticated, starting OAuth flow...')
        
        // Store quiz data before redirecting to OAuth
        sessionStorage.setItem('quiz_data_before_auth', JSON.stringify(quizData))
        sessionStorage.setItem('return_url_after_auth', window.location.href)
        
        // Get Google OAuth URL and redirect
        const authResponse = await authService.getGoogleAuthUrl()
        if (!authResponse.error && authResponse.data) {
          console.log('Redirecting to OAuth URL:', authResponse.data.auth_url)
          // Redirect to Google OAuth in same tab
          window.location.href = authResponse.data.auth_url
          return
        } else {
          throw new Error('Failed to get OAuth URL')
        }
      } else {
        // User is already authenticated, create form directly
        console.log('User already authenticated, creating form directly...')
        await createGoogleFormDirect()
      }
    } catch (error) {
      console.error('Error in Google Form flow:', error)
      alert('Error starting Google Form creation process.')
      setIsDownloading(false)
    }
  }


  return (
    <div className="mt-8 bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Generated Quiz</h2>
        <div className="flex space-x-2 flex-wrap">
          {showAuthComplete && (
            <button 
              onClick={handleCompleteAuthentication}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors cursor-pointer"
            >
              Complete Authentication
            </button>
          )}
          <div className="relative inline-block text-left">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              disabled={isDownloading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition-colors cursor-pointer"
            >
              {isDownloading ? 'Downloading...' : 'Download'}
            </button>
            {isDropdownOpen && !isDownloading && (
              <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                  <button
                    onClick={() => handleDownload('pdf')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                    role="menuitem"
                  >
                    PDF
                  </button>
                  <button
                    onClick={() => handleDownload('txt')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                    role="menuitem"
                  >
                    TXT
                  </button>
                </div>
              </div>
            )}
          </div>
          <button 
            onClick={handleDownloadAnswerKey}
            disabled={isDownloading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition-colors cursor-pointer"
          >
            {isDownloading ? 'Downloading...' : 'Download Answer Key'}
          </button>
          <button 
            onClick={handleCreateGoogleForm}
            disabled={isDownloading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition-colors cursor-pointer"
          >
            Google Form
          </button>
        </div>
      </div>


      <div className="mb-4">
        <p><span className="font-semibold">Topic:</span> {quizData.topic}</p>
        <p><span className="font-semibold">Total Questions:</span> {quizData.total_questions}</p>
      </div>

      <div className="space-y-6">
        {quizData.questions.map((question: any, index: number) => (
          <div key={question.id} className="border-t pt-4">
            <p className="font-semibold">{index + 1}. {question.question_text}</p>
            <div className="mt-2 space-y-1">
              {question.options ? (
                question.options.map((option: any, i: number) => (
                  <p key={i} className={`pl-4 ${option.is_correct ? 'text-green-600 font-semibold' : 'text-gray-700'}`}>
                    {String.fromCharCode(97 + i)}. {option.text}
                  </p>
                ))
              ) : question.correct_answer ? (
                <div className="pl-4">
                  <p className="text-green-600 font-semibold">Answer: {question.correct_answer}</p>
                </div>
              ) : (
                <p className="text-gray-500 italic">No answer available</p>
              )}
            </div>
            <div className="mt-2 text-sm text-gray-600">
              <p><span className="font-semibold">Explanation:</span> {question.explanation}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
