import { GRADE_5_LESSONS } from './grade5'
import { Lesson } from '@/types'

export interface CourseDef {
    id: string
    title: string
    grade: number
    lessons: Lesson[]
    coverColor: string
    iconColor: string
}

// Mock Grade 4 (Simple placeholder)
const GRADE_4_LESSONS: Lesson[] = [
    {
        id: 'g4-u1',
        title: 'Unit 1: Colors & Shapes',
        description: 'Làm quen với màu sắc và hình khối',
        isLocked: false,
        videoUrl: '...',
        games: [],
        order: 1
    },
    // ...
]

export const COURSES: Record<string, CourseDef> = {
    'grade-5': {
        id: 'grade-5',
        title: 'Tiếng Anh Lớp 5',
        grade: 5,
        lessons: GRADE_5_LESSONS,
        coverColor: 'bg-orange-100',
        iconColor: 'text-orange-500'
    },
    'grade-4': {
        id: 'grade-4',
        title: 'Tiếng Anh Lớp 4',
        grade: 4,
        lessons: GRADE_4_LESSONS,
        coverColor: 'bg-green-100',
        iconColor: 'text-green-500'
    }
}
