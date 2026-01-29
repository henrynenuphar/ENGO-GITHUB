import { GameType, Lesson, Vocabulary, Question } from '@/types'

// Mock Vocabulary Data for Lesson 1
const L1_VOCAB: Vocabulary[] = [
    {
        id: 'v1',
        word: 'Go camping',
        ipa: '/ɡəʊ ˈkæmpɪŋ/',
        meaning: 'Đi cắm trại',
        pastTense: 'Went camping',
        image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=400&q=80',
        audio: 'https://api.dictionaryapi.dev/media/pronunciations/en/camping-us.mp3',
        exampleSentence: 'I went camping in the forest last weekend.'
    },
    {
        id: 'v2',
        word: 'Go to the beach',
        ipa: '/ɡəʊ tuː ðə biːtʃ/',
        meaning: 'Đi bãi biển',
        pastTense: 'Went to the beach',
        image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80',
        audio: 'https://api.dictionaryapi.dev/media/pronunciations/en/beach-us.mp3',
        exampleSentence: 'It was hot, so we went to the beach.'
    },
    {
        id: 'v3',
        word: 'Go to the farm',
        ipa: '/ɡəʊ tuː ðə fɑːm/',
        meaning: 'Đi thăm nông trại',
        pastTense: 'Went to the farm',
        image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=400&q=80',
        audio: 'https://api.dictionaryapi.dev/media/pronunciations/en/farm-us.mp3',
        exampleSentence: 'I went to the farm and saw many cows.'
    },
    {
        id: 'v4',
        word: 'Learn how to cook',
        ipa: '/lɜːn haʊ tuː kʊk/',
        meaning: 'Học nấu ăn',
        pastTense: 'Learned how to cook',
        image: 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?auto=format&fit=crop&w=400&q=80',
        audio: 'https://api.dictionaryapi.dev/media/pronunciations/en/cook-us.mp3',
        exampleSentence: 'In the summer, I learned how to cook rice.'
    },
    {
        id: 'v5',
        word: 'Learn how to swim',
        ipa: '/lɜːn haʊ tuː swɪm/',
        meaning: 'Học bơi',
        pastTense: 'Learned how to swim',
        image: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=400&q=80',
        audio: 'https://api.dictionaryapi.dev/media/pronunciations/en/swim-us.mp3',
        exampleSentence: 'I learned how to swim in the pool.'
    },
    {
        id: 'v6',
        word: 'Visit my grandparents',
        ipa: '/ˈvɪz.ɪt maɪ ˈɡræn.peə.rənts/',
        meaning: 'Thăm ông bà',
        pastTense: 'Visited my grandparents',
        image: 'https://images.unsplash.com/photo-1568219656418-15c730d477a4?auto=format&fit=crop&w=400&q=80',
        audio: 'https://api.dictionaryapi.dev/media/pronunciations/en/visit-us.mp3',
        exampleSentence: 'I visited my grandparents in the countryside.'
    },
    {
        id: 'v7',
        word: 'Have a picnic',
        ipa: '/hæv ə ˈpɪk.nɪk/',
        meaning: 'Đi dã ngoại (ăn uống ngoài trời)',
        pastTense: 'Had a picnic',
        image: 'https://images.unsplash.com/photo-1526436166014-46c63283f5e5?auto=format&fit=crop&w=400&q=80',
        audio: 'https://api.dictionaryapi.dev/media/pronunciations/en/picnic-us.mp3',
        exampleSentence: 'We had a picnic at the park on Sunday.'
    },
    {
        id: 'v8',
        word: 'Go fishing',
        ipa: '/ɡəʊ ˈfɪʃ.ɪŋ/',
        meaning: 'Đi câu cá',
        pastTense: 'Went fishing',
        image: 'https://images.unsplash.com/photo-1520697223078-43d9202de468?auto=format&fit=crop&w=400&q=80',
        audio: 'https://api.dictionaryapi.dev/media/pronunciations/en/fishing-us.mp3',
        exampleSentence: 'My dad and I went fishing near the lake.'
    },
    {
        id: 'v9',
        word: 'Ride a bike',
        ipa: '/raɪd ə baɪk/',
        meaning: 'Đi xe đạp',
        pastTense: 'Rode a bike',
        image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=400&q=80',
        audio: 'https://api.dictionaryapi.dev/media/pronunciations/en/ride-us.mp3',
        exampleSentence: 'I rode a bike around my school.'
    },
    {
        id: 'v10',
        word: 'Fly a kite',
        ipa: '/flaɪ ə kaɪt/',
        meaning: 'Thả diều',
        pastTense: 'Flew a kite',
        image: 'https://images.unsplash.com/photo-1534685153243-d3493722b512?auto=format&fit=crop&w=400&q=80',
        audio: 'https://api.dictionaryapi.dev/media/pronunciations/en/fly-us.mp3',
        exampleSentence: 'The wind was strong, so I flew a kite.'
    }
]

// Mock Questions for Rowing Boat (Grammar)
const L1_GRAMMAR_QUESTIONS: Question[] = [
    {
        id: 'q1',
        text: 'Last summer, check I ___ to the beach with my family.',
        options: ['go', 'went', 'going', 'will go'],
        correctIndex: 1, // went
        explanation: 'Use "went" (Past Simple) because it happened "Last summer".',
        type: 'multiple_choice'
    },
    {
        id: 'q2',
        text: 'What ___ you do last weekend?',
        options: ['do', 'did', 'does', 'are'],
        correctIndex: 1, // did
        explanation: 'Use "did" for Past Simple questions.',
        type: 'multiple_choice'
    },
    {
        id: 'q3',
        text: 'We ___ sandcastles yesterday.',
        options: ['build', 'built', 'building', 'builds'],
        correctIndex: 1, // built
        explanation: '"Built" is the past tense of "build".',
        type: 'multiple_choice'
    }
]

export const GRADE_5_LESSONS: Lesson[] = [
    {
        id: 'lesson-1',
        title: 'Unit 1: Summer Activities',
        description: 'Talk about your summer holidays.',
        videoUrl: 'https://www.youtube.com/watch?v=VusbE6wIreo',
        thumbnail: 'https://img.freepik.com/free-vector/summer-beach-scene_1308-30188.jpg',
        order: 1,
        isLocked: false,
        games: [
            {
                id: 'g1-flashcard',
                type: GameType.FLASHCARD,
                title: 'Vocabulary Flashcards',
                description: 'Learn new words',
                data: {
                    words: L1_VOCAB
                }
            },
            {
                id: 'g1-pair',
                type: GameType.COOL_PAIR,
                title: 'Cool Pair Matching',
                description: 'Match words with images',
                data: {
                    pairs: L1_VOCAB
                }
            },
            {
                id: 'g1-monkey',
                type: GameType.SMART_MONKEY,
                title: 'Smart Monkey',
                description: 'Choose the right word',
                data: {
                    words: L1_VOCAB
                }
            },
            {
                id: 'g1-rowing',
                type: GameType.ROWING,
                title: 'Rowing Boat Challenge',
                description: 'Grammar Quiz',
                data: {
                    questions: L1_GRAMMAR_QUESTIONS
                }
            }
        ]
    },
    // Placeholders for other lessons to match the 12 lesson requirement
    // Unit 2
    {
        id: 'lesson-2',
        title: 'Unit 2: School Habits',
        description: 'Daily habits at school.',
        videoUrl: '',
        thumbnail: 'https://img.freepik.com/free-vector/school-building_1308-30238.jpg',
        order: 2,
        isLocked: true,
        games: []
    },
    // Unit 3
    {
        id: 'lesson-3',
        title: 'Unit 3: Sports & Hobbies',
        description: 'Talking about sports and hobbies.',
        videoUrl: '',
        thumbnail: 'https://img.freepik.com/free-vector/sport-equipment-concept_1284-13034.jpg',
        order: 3,
        isLocked: true,
        games: []
    },
    // Unit 4
    {
        id: 'lesson-4',
        title: 'Unit 4: School Subjects',
        description: 'Subjects you learn at school.',
        videoUrl: '',
        thumbnail: 'https://img.freepik.com/free-vector/education-learning-concept-illustration_114360-787.jpg',
        order: 4,
        isLocked: true,
        games: []
    },
    // Unit 5
    {
        id: 'lesson-5',
        title: 'Unit 5: Why learn English?',
        description: 'Importance of learning English.',
        videoUrl: '',
        thumbnail: 'https://img.freepik.com/free-vector/english-teacher-concept-illustration_114360-2212.jpg',
        order: 5,
        isLocked: true,
        games: []
    },
    // Unit 6 - Review 1
    {
        id: 'lesson-6',
        title: 'Unit 6: PRACTICE TEST',
        description: 'Review lessons 1-5.',
        videoUrl: '',
        thumbnail: 'https://img.freepik.com/free-vector/exam-preparation-concept-illustration_114360-2184.jpg',
        order: 6,
        isLocked: true,
        games: []
    },
    // Unit 7
    {
        id: 'lesson-7',
        title: 'Unit 7: Farm Animals',
        description: 'Animals on the farm.',
        videoUrl: '',
        thumbnail: 'https://img.freepik.com/free-vector/farm-animals_1308-30198.jpg',
        order: 7,
        isLocked: true,
        games: []
    },
    // Unit 8
    {
        id: 'lesson-8',
        title: 'Unit 8: Pets & Preferences',
        description: 'Talking about pets you like.',
        videoUrl: '',
        thumbnail: 'https://img.freepik.com/free-vector/cute-pets-illustration_114360-1282.jpg',
        order: 8,
        isLocked: true,
        games: []
    },
    // Unit 9
    {
        id: 'lesson-9',
        title: 'Unit 9: Wild Animals',
        description: 'Animals in the wild.',
        videoUrl: '',
        thumbnail: 'https://img.freepik.com/free-vector/wild-animals-jungle_1308-30188.jpg',
        order: 9,
        isLocked: true,
        games: []
    },
    // Unit 10
    {
        id: 'lesson-10',
        title: 'Unit 10: Zoo Animals & Comparison',
        description: 'Comparing animals.',
        videoUrl: '',
        thumbnail: 'https://img.freepik.com/free-vector/zoo-animals_1308-30238.jpg',
        order: 10,
        isLocked: true,
        games: []
    },
    // Unit 11
    {
        id: 'lesson-11',
        title: 'Unit 11: PRACTICE TEST',
        description: 'Review lessons 7-10.',
        videoUrl: '',
        thumbnail: 'https://img.freepik.com/free-vector/online-test-concept-illustration_114360-1205.jpg',
        order: 11,
        isLocked: true,
        games: []
    },
    // Unit 12 - Final Review
    {
        id: 'lesson-12',
        title: 'Unit 12: Science / Biology',
        description: 'Basic science concepts.',
        videoUrl: '',
        thumbnail: 'https://img.freepik.com/free-vector/science-lab-concept-illustration_114360-1282.jpg',
        order: 12,
        isLocked: true,
        games: []
    }
]
