export type LearningStepType = 'video' | 'flashcard' | 'game' | 'quiz'

export interface LearningStep {
    id: string
    type: LearningStepType
    title: string
    gameType?: 'flashcard' | 'pair-matching' | 'smart-monkey' | 'rowing-boat' | 'goalkeeper' | 'trash-collecting' | 'teacher-coming'
    videoUrl?: string
    isLocked?: boolean
}

export interface Lesson {
    id: string
    title: string
    topic: string
    description: string
    steps: LearningStep[]
}

export const GRADE_5_CURRICULUM: Lesson[] = [
    {
        id: 'lesson-1',
        title: 'Lesson 1',
        topic: 'Summer Activities',
        description: 'Learn about fun activities in summer!',
        steps: [
            { id: 'l1-s1', type: 'video', title: 'Bài giảng: Summer Activities', videoUrl: 'https://www.youtube.com/watch?v=VusbE6wIreo' },
            { id: 'l1-s2', type: 'game', title: 'Flashcard: Từ vựng mới', gameType: 'flashcard' },
            { id: 'l1-s3', type: 'game', title: 'Cool Pair Matching', gameType: 'pair-matching' },
            { id: 'l1-s4', type: 'game', title: 'Smart Monkey', gameType: 'smart-monkey' },
            { id: 'l1-s5', type: 'game', title: 'Rowing Boat: Phiêu lưu', gameType: 'rowing-boat' }
        ]
    },
    {
        id: 'lesson-2',
        title: 'Lesson 2',
        topic: 'School Habits',
        description: 'Talk about your daily school routine.',
        steps: [
            { id: 'l2-s1', type: 'video', title: 'Bài giảng: School Habits', videoUrl: 'https://www.youtube.com/watch?v=example' },
            { id: 'l2-s2', type: 'game', title: 'Flashcard: Daily Routine', gameType: 'flashcard' },
            { id: 'l2-s3', type: 'game', title: 'The Teacher Is Coming', gameType: 'teacher-coming' }
        ]
    },
    {
        id: 'lesson-3',
        title: 'Lesson 3',
        topic: 'Sports & Hobbies',
        description: 'What is your favorite sport?',
        steps: [
            { id: 'l3-s1', type: 'video', title: 'Bài giảng: Sports', videoUrl: 'https://www.youtube.com/watch?v=example' },
            { id: 'l3-s2', type: 'game', title: 'Defeat the Goalkeeper', gameType: 'goalkeeper' }
        ]
    },
    {
        id: 'lesson-4',
        title: 'Lesson 4',
        topic: 'School Subjects',
        description: 'Math, English, Science and more.',
        steps: []
    },
    {
        id: 'lesson-5',
        title: 'Lesson 5',
        topic: 'Why learn English?',
        description: 'Benefits of learning a new language.',
        steps: []
    },
    {
        id: 'lesson-6',
        title: 'Lesson 6',
        topic: 'PRACTICE TEST',
        description: 'Mid-term review.',
        steps: []
    },
    {
        id: 'lesson-7',
        title: 'Lesson 7',
        topic: 'Farm Animals',
        description: 'Animals on the farm.',
        steps: []
    },
    {
        id: 'lesson-8',
        title: 'Lesson 8',
        topic: 'Pets & Preferences',
        description: 'Cats, dogs and favorite pets.',
        steps: []
    },
    {
        id: 'lesson-9',
        title: 'Lesson 9',
        topic: 'Wild Animals',
        description: 'Lions, tigers and bears!',
        steps: []
    },
    {
        id: 'lesson-10',
        title: 'Lesson 10',
        topic: 'Zoo Animals & Comparison',
        description: 'Comparing animals at the zoo.',
        steps: []
    },
    {
        id: 'lesson-11',
        title: 'Lesson 11',
        topic: 'PRACTICE TEST',
        description: 'Pre-final review.',
        steps: []
    },
    {
        id: 'lesson-12',
        title: 'Lesson 12',
        topic: 'Science / Biology',
        description: 'Basic science concepts.',
        steps: []
    }
]
