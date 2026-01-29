
export interface LessonStep {
    id: string
    title: string
    type: 'video' | 'game' | 'quiz' | 'speaking'
    status: 'locked' | 'unlocked' | 'completed'
    gameType?: 'flashcard' | 'pair-matching' | 'smart-monkey' | 'rowing-boat' | 'shadowing'
    videoUrl?: string
}

export interface Lesson {
    id: string
    title: string
    topic: string
    description: string
    thumbnail: string
    steps: LessonStep[]
    isLocked: boolean
}

export const GRADE_5_CURRICULUM: Lesson[] = [
    {
        id: 'lesson-1',
        title: 'Lesson 1: Summer Activities',
        topic: 'Summer Holidays',
        description: 'Talk about your summer holidays.',
        thumbnail: 'https://img.freepik.com/free-vector/summer-beach-scene_1308-30188.jpg',
        isLocked: false,
        steps: [
            { id: '1-1', title: 'Video Lecture', type: 'video', status: 'unlocked', videoUrl: 'https://www.youtube.com/watch?v=VusbE6wIreo' },
            { id: '1-2', title: 'Vocabulary Flashcards', type: 'game', gameType: 'flashcard', status: 'locked' },
            { id: '1-3', title: 'Cool Pair Matching', type: 'game', gameType: 'pair-matching', status: 'locked' },
            { id: '1-4', title: 'Smart Monkey', type: 'game', gameType: 'smart-monkey', status: 'locked' },
            { id: '1-5', title: 'Rowing Boat Challenge', type: 'game', gameType: 'rowing-boat', status: 'locked' }
        ]
    },
    {
        id: 'lesson-2',
        title: 'Lesson 2: School Habits',
        topic: 'School Routine',
        description: 'Daily habits at school.',
        thumbnail: 'https://img.freepik.com/free-vector/school-building_1308-30238.jpg',
        isLocked: true,
        steps: []
    },
    {
        id: 'lesson-3',
        title: 'Lesson 3: Sports & Hobbies',
        topic: 'Sports',
        description: 'Talking about sports and hobbies.',
        thumbnail: 'https://img.freepik.com/free-vector/sport-equipment-concept_1284-13034.jpg',
        isLocked: true,
        steps: []
    },
    {
        id: 'lesson-4',
        title: 'Lesson 4: School Subjects',
        topic: 'Education',
        description: 'Subjects you learn at school.',
        thumbnail: 'https://img.freepik.com/free-vector/education-learning-concept-illustration_114360-787.jpg',
        isLocked: true,
        steps: []
    },
    {
        id: 'lesson-5',
        title: 'Lesson 5: Why learn English?',
        topic: 'Motivation',
        description: 'Importance of learning English.',
        thumbnail: 'https://img.freepik.com/free-vector/english-teacher-concept-illustration_114360-2212.jpg',
        isLocked: true,
        steps: []
    },
    {
        id: 'lesson-6',
        title: 'Lesson 6: PRACTICE TEST',
        topic: 'Review 1',
        description: 'Review lessons 1-5.',
        thumbnail: 'https://img.freepik.com/free-vector/exam-preparation-concept-illustration_114360-2184.jpg',
        isLocked: true,
        steps: []
    },
    {
        id: 'lesson-7',
        title: 'Lesson 7: Farm Animals',
        topic: 'Animals',
        description: 'Animals on the farm.',
        thumbnail: 'https://img.freepik.com/free-vector/farm-animals_1308-30198.jpg',
        isLocked: true,
        steps: []
    },
    {
        id: 'lesson-8',
        title: 'Lesson 8: Pets & Preferences',
        topic: 'Pets',
        description: 'Talking about pets you like.',
        thumbnail: 'https://img.freepik.com/free-vector/cute-pets-illustration_114360-1282.jpg',
        isLocked: true,
        steps: []
    },
    {
        id: 'lesson-9',
        title: 'Lesson 9: Wild Animals',
        topic: 'Nature',
        description: 'Animals in the wild.',
        thumbnail: 'https://img.freepik.com/free-vector/wild-animals-jungle_1308-30188.jpg',
        isLocked: true,
        steps: []
    },
    {
        id: 'lesson-10',
        title: 'Lesson 10: Zoo Animals & Comparison',
        topic: 'Comparisons',
        description: 'Comparing animals.',
        thumbnail: 'https://img.freepik.com/free-vector/zoo-animals_1308-30238.jpg',
        isLocked: true,
        steps: []
    },
    {
        id: 'lesson-11',
        title: 'Lesson 11: PRACTICE TEST',
        topic: 'Review 2',
        description: 'Review lessons 7-10.',
        thumbnail: 'https://img.freepik.com/free-vector/online-test-concept-illustration_114360-1205.jpg',
        isLocked: true,
        steps: []
    },
    {
        id: 'lesson-12',
        title: 'Lesson 12: Science / Biology',
        topic: 'Science',
        description: 'Basic science concepts.',
        thumbnail: 'https://img.freepik.com/free-vector/science-lab-concept-illustration_114360-1282.jpg',
        isLocked: true,
        steps: []
    }
]
