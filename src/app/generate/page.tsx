'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, Settings, Loader2 } from 'lucide-react'
import { quizService } from '@/services/quizService'
import ClientOnly from '@/components/ClientOnly'

const quizGenerationSchema = z.object({
  text: z.string().optional(),
  file: z.any().optional(),
  question_types: z.array(z.string()).min(1, 'Select at least one question type'),
  num_questions: z.number().min(1, 'Minimum 1 question').max(40, 'Maximum 40 questions'),
  difficulty: z.string().min(1, 'Select difficulty level'),
  topic: z.string().optional(),
}).refine(data => data.text || data.file, {
  message: 'Either provide text or upload a file',
  path: ['text']
})

type QuizGenerationForm = z.infer<typeof quizGenerationSchema>

function GeneratePageContent() {
  const [inputMethod, setInputMethod] = useState<'text' | 'file'>('text')
  const [isLoading, setIsLoading] = useState(false)
  const [availableQuestionTypes, setAvailableQuestionTypes] = useState<string[]>([])
  const [availableDifficulties, setAvailableDifficulties] = useState<string[]>([])
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<QuizGenerationForm>({
    resolver: zodResolver(quizGenerationSchema),
    defaultValues: {
      question_types: [],
      num_questions: 5,
      difficulty: '',
      topic: ''
    }
  })

  // Fetch available options on component mount
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        console.log('Fetching question types and difficulty levels...')
        
        const [questionTypesRes, difficultiesRes] = await Promise.all([
          quizService.getQuestionTypes(),
          quizService.getDifficultyLevels()
        ])
        
        console.log('Question Types Response:', questionTypesRes)
        console.log('Difficulties Response:', difficultiesRes)
        
        if (!questionTypesRes.error) {
          console.log('Setting question types:', questionTypesRes.data)
          // Extract values from the question_types array
          if (questionTypesRes.data?.question_types && Array.isArray(questionTypesRes.data.question_types)) {
            const questionTypeValues = questionTypesRes.data.question_types.map((type: any) => type.value)
            setAvailableQuestionTypes(questionTypeValues)
          }
        } else {
          console.error('Question types error:', questionTypesRes.message)
        }
        
        if (!difficultiesRes.error) {
          console.log('Setting difficulties:', difficultiesRes.data)
          // Check if data has difficulty_levels array or is a direct array
          if (difficultiesRes.data?.difficulty_levels && Array.isArray(difficultiesRes.data.difficulty_levels)) {
            const difficultyValues = difficultiesRes.data.difficulty_levels.map((diff: any) => 
              typeof diff === 'object' ? diff.value : diff
            )
            setAvailableDifficulties(difficultyValues)
          } else if (Array.isArray(difficultiesRes.data)) {
            setAvailableDifficulties(difficultiesRes.data)
          }
        } else {
          console.error('Difficulties error:', difficultiesRes.message)
        }
      } catch (error) {
        console.error('Failed to fetch options:', error)
        // Only use empty arrays if there's an error, don't set fallbacks
        setAvailableQuestionTypes([])
        setAvailableDifficulties([])
      }
    }

    fetchOptions()
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setUploadedFile(acceptedFiles[0])
        setValue('file', acceptedFiles[0])
        setInputMethod('file')
      }
    }
  })

  const selectedQuestionTypes = watch('question_types')

  const handleQuestionTypeChange = (type: string, checked: boolean) => {
    const current = selectedQuestionTypes || []
    if (checked) {
      setValue('question_types', [...current, type])
    } else {
      setValue('question_types', current.filter(t => t !== type))
    }
  }

  const onSubmit = async (data: QuizGenerationForm) => {
    setIsLoading(true)
    try {
      let response
      
      if (inputMethod === 'file' && uploadedFile) {
        const formData = new FormData()
        formData.append('file', uploadedFile)
        formData.append('question_types', JSON.stringify(data.question_types))
        formData.append('num_questions', data.num_questions.toString())
        formData.append('difficulty', data.difficulty)
        if (data.topic) {
          formData.append('topic', data.topic)
        }
        
        response = await quizService.generateFromFile(formData)
      } else {
        response = await quizService.generateQuiz({
          text: data.text,
          question_types: data.question_types,
          num_questions: data.num_questions,
          difficulty: data.difficulty,
          topic: data.topic
        })
      }

      if (!response.error) {
        // Handle successful quiz generation
        console.log('Quiz generated successfully:', response.data)
        // TODO: Navigate to results page or display results
      } else {
        console.error('Quiz generation failed:', response.message)
      }
    } catch (error) {
      console.error('Quiz generation error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Generate Quiz</h1>
          <p className="text-gray-600">Create intelligent quizzes from your content</p>
          <div className="mt-4 text-sm text-gray-500">
            Question Types: {availableQuestionTypes.length} | Difficulties: {availableDifficulties.length}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Input Method Selection */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Content Input
            </h2>
            
            <div className="flex space-x-4 mb-6">
              <button
                type="button"
                onClick={() => setInputMethod('text')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  inputMethod === 'text'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Text Input
              </button>
              <button
                type="button"
                onClick={() => setInputMethod('file')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  inputMethod === 'file'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                File Upload
              </button>
            </div>

            {inputMethod === 'text' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter your content
                </label>
                <textarea
                  {...register('text')}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Paste your content here..."
                />
                {errors.text && (
                  <p className="mt-1 text-sm text-red-600">{errors.text.message}</p>
                )}
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload file (PDF, DOCX, or TXT)
                </label>
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                    isDragActive
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-blue-400'
                  }`}
                >
                  <input {...getInputProps()} />
                  <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  {uploadedFile ? (
                    <div>
                      <p className="text-sm font-medium text-gray-900">{uploadedFile.name}</p>
                      <p className="text-xs text-gray-500">
                        {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-gray-600">
                        Drag and drop a file here, or click to select
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Supports PDF, DOCX, TXT (max 10MB)
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Quiz Configuration */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Quiz Configuration
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Number of Questions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Questions
                </label>
                <input
                  type="number"
                  {...register('num_questions', { valueAsNumber: true })}
                  min="1"
                  max="40"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.num_questions && (
                  <p className="mt-1 text-sm text-red-600">{errors.num_questions.message}</p>
                )}
              </div>

              {/* Topic */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Topic (Optional)
                </label>
                <input
                  type="text"
                  {...register('topic')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., History, Science, Mathematics"
                />
              </div>

              {/* Difficulty Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty Level
                </label>
                <select
                  {...register('difficulty')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select difficulty</option>
                  {Array.isArray(availableDifficulties) && availableDifficulties.map((difficulty) => (
                    <option key={difficulty} value={difficulty}>
                      {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                    </option>
                  ))}
                </select>
                {errors.difficulty && (
                  <p className="mt-1 text-sm text-red-600">{errors.difficulty.message}</p>
                )}
              </div>

              {/* Question Types */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question Types
                </label>
                <div className="space-y-2">
                  {Array.isArray(availableQuestionTypes) && availableQuestionTypes.map((type) => (
                    <label key={type} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedQuestionTypes?.includes(type) || false}
                        onChange={(e) => handleQuestionTypeChange(type, e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </label>
                  ))}
                </div>
                {errors.question_types && (
                  <p className="mt-1 text-sm text-red-600">{errors.question_types.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-8 rounded-lg transition-colors flex items-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating Quiz...
                </>
              ) : (
                'Generate Quiz'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function GeneratePage() {
  return (
    <ClientOnly fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <GeneratePageContent />
    </ClientOnly>
  )
}