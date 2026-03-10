import { GRADE_5_LESSONS } from './grade5'
import { KINDERGARTEN_LESSONS } from './kindergarten'
import { GRADE_1_LESSONS } from './grade1'
import { GRADE_2_LESSONS } from './grade2'
import { GRADE_3_LESSONS } from './grade3'
import { GRADE_4_LESSONS } from './grade4'
import { Lesson } from '@/types'

export interface CourseDef {
    id: string
    title: string
    grade: number
    lessons: Lesson[]
    coverColor: string
    iconColor: string
}


export const COURSES: Record<string, CourseDef> = {
    'kindergarten': {
        id: 'kindergarten',
        title: 'Lớp Mầm Non',
        grade: 0,
        lessons: KINDERGARTEN_LESSONS,
        coverColor: 'bg-pink-100',
        iconColor: 'text-pink-500'
    },
    'grade-5': {
        id: 'grade-5',
        title: 'Tiếng Anh Lớp 5',
        grade: 5,
        lessons: GRADE_5_LESSONS,
        coverColor: 'bg-orange-100',
        iconColor: 'text-orange-500'
    },
    'grade-1': {
        id: 'grade-1',
        title: 'Tiếng Anh Lớp 1',
        grade: 1,
        lessons: GRADE_1_LESSONS,
        coverColor: 'bg-red-100',
        iconColor: 'text-red-500'
    },
    'grade-2': {
        id: 'grade-2',
        title: 'Tiếng Anh Lớp 2',
        grade: 2,
        lessons: GRADE_2_LESSONS,
        coverColor: 'bg-yellow-100',
        iconColor: 'text-yellow-500'
    },
    'grade-3': {
        id: 'grade-3',
        title: 'Tiếng Anh Lớp 3',
        grade: 3,
        lessons: GRADE_3_LESSONS,
        coverColor: 'bg-green-100',
        iconColor: 'text-green-500'
    },
    'grade-4': {
        id: 'grade-4',
        title: 'Tiếng Anh Lớp 4',
        grade: 4,
        lessons: GRADE_4_LESSONS,
        coverColor: 'bg-cyan-100',
        iconColor: 'text-cyan-500'
    }
}
