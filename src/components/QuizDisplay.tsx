'use client'

import { useState } from 'react'

interface QuizDisplayProps {
  quizData: any
}

export default function QuizDisplay({ quizData }: QuizDisplayProps) {
  if (!quizData) return null
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const handleDownload = (format: 'pdf' | 'txt') => {
    console.log(`Downloading as ${format}`)
    setIsDropdownOpen(false)
    // TODO: Implement actual download logic
  }

  const handleDownloadAnswerKey = () => {
    console.log('Downloading answer key')
    // TODO: Implement answer key download logic
  }

  const handleCreateGoogleForm = () => {
    console.log('Creating Google Form')
    // TODO: Implement Google Form creation logic
  }

  return (
    <div className="mt-8 bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Generated Quiz</h2>
        <div className="flex space-x-2">
          <div className="relative inline-block text-left">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors cursor-pointer"
            >
              Download
            </button>
            {isDropdownOpen && (
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
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors cursor-pointer"
          >
            Download Answer Key
          </button>
          <button 
            onClick={handleCreateGoogleForm}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors cursor-pointer"
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
              {question.options.map((option: any, i: number) => (
                <p key={i} className={`pl-4 ${option.is_correct ? 'text-green-600 font-semibold' : 'text-gray-700'}`}>
                  {String.fromCharCode(97 + i)}. {option.text}
                </p>
              ))}
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
