export interface Question {
  id?: string
  question: string
  type: 'multiple_choice' | 'true_false' | 'short_answer' | 'long_answer' | 'fill_in_blank'
  options?: string[]
  correct_answer: string | string[]
  explanation?: string
  difficulty: 'easy' | 'medium' | 'hard'
  topic?: string
}

export interface Quiz {
  id?: string
  questions: Question[]
  total_questions: number
  difficulty_levels: string[]
  topic: string
  generated_at: string
  title?: string
}

export interface QuizGenerationRequest {
  text?: string
  file?: File
  question_types: string[]
  num_questions: number
  difficulty: string
  topic?: string
}

export interface APIResponse<T> {
  error: boolean
  data: T
  message: string
}

export interface GenerateQuizResponse {
  questions: Question[]
  total_questions: number
  difficulty_levels: string[]
  topic: string
  generated_at: string
}