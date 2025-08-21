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
  const [formCreationStatus, setFormCreationStatus] = useState<string>('')
  const [isCreatingForm, setIsCreatingForm] = useState(false)

  if (!quizData) return null

  // Check if user just returned from authentication
  useEffect(() => {
    // Check if authentication was just completed and we should create a form
    const shouldCreateForm = sessionStorage.getItem('create_form_after_auth')
    
    if (shouldCreateForm === 'true' && quizData && authService.isAuthenticated()) {
      console.log('User returned from authentication, creating Google Form automatically...')
      sessionStorage.removeItem('create_form_after_auth')
      
      // Wait a moment for the page to settle, then create the form
      setTimeout(() => {
        createGoogleFormDirect()
      }, 500)
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
      setIsCreatingForm(true)
      setFormCreationStatus('🔐 Verifying authentication...')

      // Double-check authentication before proceeding
      if (!authService.isAuthenticated()) {
        throw new Error('Authentication required. Please log in with Google first.')
      }

      setFormCreationStatus('📝 Preparing quiz questions...')
      
      const formTitle = `AI Generated Quiz - ${quizData.topic}`
      const formDescription = `Quiz with ${quizData.total_questions} questions on ${quizData.topic}`
      
      console.log('Creating Google Form with authenticated user...')
      
      setFormCreationStatus('🌐 Opening new tab...')
      
      // Pre-open a window to avoid popup blockers (this must be done in user gesture context)
      const newWindow = window.open('about:blank', '_blank', 'noopener,noreferrer')
      
      setFormCreationStatus('🚀 Creating Google Form...')
      
      const formResponse = await formsService.createFormFromQuiz(
        quizData.questions,
        formTitle,
        formDescription,
        true
      )

      if (!formResponse.error && formResponse.data) {
        console.log('Form created successfully:', formResponse.data)
        setFormCreationStatus('✅ Google Form created successfully!')
        
        const formUrl = formResponse.data.form_url
        
        // Use the pre-opened window if available, otherwise try opening normally
        if (newWindow && !newWindow.closed) {
          setFormCreationStatus('🔗 Opening form in new tab...')
          newWindow.location.href = formUrl
          console.log('Form opened in pre-opened tab successfully')
          
          // Show success notification after a brief delay
          setTimeout(() => {
            setFormCreationStatus('🎉 Form opened successfully!')
            setTimeout(() => {
              setFormCreationStatus('')
            }, 3000)
          }, 1000)
        } else {
          // Fallback: try opening normally
          const fallbackWindow = window.open(formUrl, '_blank', 'noopener,noreferrer')
          
          if (fallbackWindow) {
            console.log('Form opened in new tab successfully')
            setFormCreationStatus('🎉 Form opened successfully!')
            setTimeout(() => {
              setFormCreationStatus('')
            }, 3000)
          } else {
            console.warn('Popup blocked, providing manual options')
            setFormCreationStatus('⚠️ Popup blocked - providing alternatives...')
            
            // If popup was blocked, provide multiple options
            const confirmed = confirm(`Google Form created successfully!\n\nPopup was blocked. Would you like to copy the form URL to your clipboard?\n\nClick OK to copy the URL, or Cancel to see a clickable link.`)
            
            if (confirmed) {
              // Try to copy to clipboard
              try {
                setFormCreationStatus('📋 Copying to clipboard...')
                await navigator.clipboard.writeText(formUrl)
                setFormCreationStatus('✅ Form URL copied to clipboard!')
                setTimeout(() => {
                  setFormCreationStatus('')
                }, 5000)
              } catch (clipboardError) {
                console.warn('Clipboard access failed:', clipboardError)
                setFormCreationStatus('❌ Clipboard access failed')
                alert(`Couldn't copy to clipboard. Here's your form URL:\n\n${formUrl}`)
                setTimeout(() => {
                  setFormCreationStatus('')
                }, 3000)
              }
            } else {
              // Show clickable link
              setFormCreationStatus('🔗 Clickable link created below')
              
              // Create a prominent clickable link
              const linkElement = document.createElement('a')
              linkElement.href = formUrl
              linkElement.target = '_blank'
              linkElement.rel = 'noopener noreferrer'
              linkElement.textContent = '🔗 Click Here to Open Your Google Form'
              linkElement.style.cssText = 'display: block; margin: 20px auto; padding: 15px 30px; background: linear-gradient(45deg, #4285f4, #34a853); color: white; text-decoration: none; border-radius: 8px; text-align: center; font-weight: bold; font-size: 16px; box-shadow: 0 4px 8px rgba(0,0,0,0.2); max-width: 300px; transition: transform 0.2s;'
              
              linkElement.addEventListener('mouseenter', () => {
                linkElement.style.transform = 'scale(1.05)'
              })
              
              linkElement.addEventListener('mouseleave', () => {
                linkElement.style.transform = 'scale(1)'
              })
              
              // Add the link to the quiz display area
              const container = document.querySelector('.quiz-display')
              if (container) {
                const buttonContainer = container.querySelector('.flex.space-x-2')
                if (buttonContainer) {
                  buttonContainer.parentNode?.insertBefore(linkElement, buttonContainer.nextSibling)
                } else {
                  container.appendChild(linkElement)
                }
                
                // Remove the link after 30 seconds
                setTimeout(() => {
                  linkElement.remove()
                  setFormCreationStatus('')
                }, 30000)
              }
            }
          }
        }
      } else {
        // Close the pre-opened window if form creation failed
        if (newWindow && !newWindow.closed) {
          newWindow.close()
        }
        throw new Error(formResponse.message || 'Failed to create Google Form')
      }
    } catch (error) {
      console.error('Error creating Google Form:', error)
      setFormCreationStatus('❌ Failed to create Google Form')
      
      if (error instanceof Error) {
        // Check if it's an authentication error
        if (error.message.includes('401') || error.message.includes('authentication') || error.message.includes('token')) {
          // Clear invalid credentials and prompt re-authentication
          authService.clearCredentials()
          setFormCreationStatus('🔐 Authentication expired - please try again')
          alert('Your Google authentication has expired. Please click "Google Form" again to re-authenticate.')
        } else {
          setFormCreationStatus(`❌ Error: ${error.message}`)
          alert(`Error creating Google Form: ${error.message}`)
        }
      }
      
      // Clear status after 5 seconds
      setTimeout(() => {
        setFormCreationStatus('')
      }, 5000)
    } finally {
      setIsDownloading(false)
      setIsCreatingForm(false)
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
      
      // Debug: Log current authentication state
      const credentials = authService.getStoredCredentials()
      console.log('Current authentication state:', {
        isAuthenticated: authService.isAuthenticated(),
        hasAccessToken: !!credentials.access_token,
        hasCredentialsJson: !!credentials.credentials_json,
        tokenExpiry: credentials.token_expires_at,
        currentTime: Date.now()
      })
      
      // Check if user is authenticated
      if (!authService.isAuthenticated()) {
        console.log('User not authenticated, starting OAuth flow...')
        
        // Clear any existing invalid credentials
        authService.clearCredentials()
        
        // Set flag to create form after authentication
        sessionStorage.setItem('create_form_after_auth', 'true')
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
        // Even if user appears authenticated, the 401 error suggests credentials are invalid
        // Force re-authentication for Google Forms to ensure fresh tokens
        console.log('Forcing fresh authentication for Google Forms...')
        
        // Clear potentially stale credentials
        authService.clearCredentials()
        
        // Set flag to create form after authentication
        sessionStorage.setItem('create_form_after_auth', 'true')
        sessionStorage.setItem('quiz_data_before_auth', JSON.stringify(quizData))
        sessionStorage.setItem('return_url_after_auth', window.location.href)
        
        // Get Google OAuth URL and redirect
        const authResponse = await authService.getGoogleAuthUrl()
        if (!authResponse.error && authResponse.data) {
          console.log('Redirecting to OAuth URL for fresh authentication:', authResponse.data.auth_url)
          // Redirect to Google OAuth in same tab
          window.location.href = authResponse.data.auth_url
          return
        } else {
          throw new Error('Failed to get OAuth URL')
        }
      }
    } catch (error) {
      console.error('Error in Google Form flow:', error)
      alert('Error starting Google Form creation process.')
      setIsDownloading(false)
    }
  }


  return (
    <div className="mt-8 bg-white rounded-lg shadow-md p-6 quiz-display">
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
            disabled={isDownloading || isCreatingForm}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition-colors cursor-pointer"
          >
            {isCreatingForm ? 'Creating Form...' : 'Google Form'}
          </button>
        </div>
      </div>

      {/* Progress Status Display */}
      {formCreationStatus && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2">
            {isCreatingForm && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            )}
            <span className="text-blue-800 font-medium">{formCreationStatus}</span>
          </div>
        </div>
      )}

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
