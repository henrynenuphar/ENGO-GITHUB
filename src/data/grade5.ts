import { GameType, Lesson, Vocabulary, Question } from '@/types'
import vocabCamping from '@/assets/images/vocab_camping.png'
import vocabBeach from '@/assets/images/vocab_beach.png'
import vocabFarm from '@/assets/images/vocab_farm.png'
import vocabCook from '@/assets/images/vocab_cook.png'
import vocabSwim from '@/assets/images/vocab_swim.png'
import vocabGrandparents from '@/assets/images/vocab_grandparents.png'
import vocabPicnic from '@/assets/images/vocab_picnic.png'
import vocabFishing from '@/assets/images/vocab_fishing.png'
import vocabBike from '@/assets/images/vocab_bike.png'
import vocabKite from '@/assets/images/vocab_kite.png'

// Mock Vocabulary Data for Lesson 1
const L1_VOCAB: Vocabulary[] = [
    {
        id: 'v1',
        word: 'Go camping',
        ipa: '/ɡoʊ ˈkæmpɪŋ/',
        meaning: 'Đi cắm trại',
        pastTense: 'Went camping',
        image: vocabCamping,
        audio: 'https://api.dictionaryapi.dev/media/pronunciations/en/camping-us.mp3',
        exampleSentence: 'I like to go camping in the forest.'
    },
    {
        id: 'v2',
        word: 'Go to the beach',
        ipa: '/ɡəʊ tuː ðə biːtʃ/',
        meaning: 'Đi bãi biển',
        pastTense: 'Went to the beach',
        image: vocabBeach,
        audio: 'https://api.dictionaryapi.dev/media/pronunciations/en/beach-us.mp3',
        exampleSentence: 'It is hot, so we go to the beach.'
    },
    {
        id: 'v3',
        word: 'Go to the farm',
        ipa: '/ɡəʊ tuː ðə fɑːm/',
        meaning: 'Đi thăm nông trại',
        pastTense: 'Went to the farm',
        image: vocabFarm,
        audio: 'https://api.dictionaryapi.dev/media/pronunciations/en/farm-us.mp3',
        exampleSentence: 'I go to the farm and see many cows.'
    },
    {
        id: 'v4',
        word: 'Learn how to cook',
        ipa: '/lɜːn haʊ tuː kʊk/',
        meaning: 'Học nấu ăn',
        pastTense: 'Learned how to cook',
        image: vocabCook,
        audio: 'https://api.dictionaryapi.dev/media/pronunciations/en/cook-us.mp3',
        exampleSentence: 'In the summer, I learn how to cook rice.'
    },
    {
        id: 'v5',
        word: 'Learn how to swim',
        ipa: '/lɜːn haʊ tuː swɪm/',
        meaning: 'Học bơi',
        pastTense: 'Learned how to swim',
        image: vocabSwim,
        audio: 'https://api.dictionaryapi.dev/media/pronunciations/en/swim-us.mp3',
        exampleSentence: 'I learn how to swim in the pool.'
    },
    {
        id: 'v6',
        word: 'Visit my grandparents',
        ipa: '/ˈvɪz.ɪt maɪ ˈɡræn.peə.rənts/',
        meaning: 'Thăm ông bà',
        pastTense: 'Visited my grandparents',
        image: vocabGrandparents,
        audio: 'https://api.dictionaryapi.dev/media/pronunciations/en/visit-us.mp3',
        exampleSentence: 'I visit my grandparents in the countryside.'
    },
    {
        id: 'v7',
        word: 'Have a picnic',
        ipa: '/hæv ə ˈpɪk.nɪk/',
        meaning: 'Đi dã ngoại (ăn uống ngoài trời)',
        pastTense: 'Had a picnic',
        image: vocabPicnic,
        audio: 'https://api.dictionaryapi.dev/media/pronunciations/en/picnic-us.mp3',
        exampleSentence: 'We have a picnic at the park on Sunday.'
    },
    {
        id: 'v8',
        word: 'Go fishing',
        ipa: '/ɡəʊ ˈfɪʃ.ɪŋ/',
        meaning: 'Đi câu cá',
        pastTense: 'Went fishing',
        image: vocabFishing,
        audio: 'https://api.dictionaryapi.dev/media/pronunciations/en/fishing-us.mp3',
        exampleSentence: 'My dad and I go fishing near the lake.'
    },
    {
        id: 'v9',
        word: 'Ride a bike',
        ipa: '/raɪd ə baɪk/',
        meaning: 'Đi xe đạp',
        pastTense: 'Rode a bike',
        image: vocabBike,
        audio: 'https://api.dictionaryapi.dev/media/pronunciations/en/ride-us.mp3',
        exampleSentence: 'I ride a bike around my school.'
    },
    {
        id: 'v10',
        word: 'Fly a kite',
        ipa: '/flaɪ ə kaɪt/',
        meaning: 'Thả diều',
        pastTense: 'Flew a kite',
        image: vocabKite,
        audio: 'https://api.dictionaryapi.dev/media/pronunciations/en/fly-us.mp3',
        exampleSentence: 'The wind is strong, so I fly a kite.'
    }
]

// Mock Questions for Rowing Boat (Grammar)
// Mock Questions for Rowing Boat (Grammar)
const L1_GRAMMAR_QUESTIONS: Question[] = [
    // 10 Multiple Choice
    {
        id: 'q1',
        text: 'It is hot today. I want to swim. Where do I go?',
        options: ['Go to the farm', 'Fly a kite', 'Go to the beach', 'Learn how to cook'],
        correctIndex: 2, // C
        explanation: 'Hot weather creates desire to swim at the beach.',
        type: 'multiple_choice'
    },
    {
        id: 'q2',
        text: 'We sleep in a tent outside. What is it?',
        options: ['Go camping', 'Ride a bike', 'Visit my grandparents', 'Go fishing'],
        correctIndex: 0, // A
        explanation: 'Sleeping in a tent is camping.',
        type: 'multiple_choice'
    },
    {
        id: 'q3',
        text: 'Yesterday, I ______ to the farm.',
        options: ['go', 'going', 'goes', 'went'],
        correctIndex: 3, // D
        explanation: 'Past tense of "go" is "went".',
        type: 'multiple_choice'
    },
    {
        id: 'q4',
        text: "It is windy. Let's ______ a kite.",
        options: ['learn', 'fly', 'swim', 'visit'],
        correctIndex: 1, // B
        explanation: 'Phrase: fly a kite.',
        type: 'multiple_choice'
    },
    {
        id: 'q5',
        text: 'She usually ______ a bike to school.',
        options: ['ride', 'rode', 'rides', 'riding'],
        correctIndex: 2, // C
        explanation: 'Present simple with "She" adds "s" -> rides.',
        type: 'multiple_choice'
    },
    {
        id: 'q6',
        text: 'I want to make dinner. I need to ______.',
        options: ['learn how to cook', 'go camping', 'learn how to swim', 'fly a kite'],
        correctIndex: 0, // A
        explanation: 'Cooking is needed to make dinner.',
        type: 'multiple_choice'
    },
    {
        id: 'q7',
        text: 'Last summer, we ______ our grandparents.',
        options: ['visit', 'visited', 'visiting', 'visits'],
        correctIndex: 1, // B
        explanation: 'Past simple adds -ed -> visited.',
        type: 'multiple_choice'
    },
    {
        id: 'q8',
        text: 'I want to catch a fish. I ______.',
        options: ['learn how to swim', 'go shopping', 'fly a kite', 'go fishing'],
        correctIndex: 3, // D
        explanation: 'Catching fish -> go fishing.',
        type: 'multiple_choice'
    },
    {
        id: 'q9',
        text: 'Last Sunday, we ______ a picnic.',
        options: ['had', 'have', 'has', 'having'],
        correctIndex: 0, // A
        explanation: 'Past tense of "have" is "had".',
        type: 'multiple_choice'
    },
    {
        id: 'q10',
        text: 'I go to the farm. I see ______.',
        options: ['Lions', 'Sharks', 'Cows', 'Bears'],
        correctIndex: 2, // C
        explanation: 'Cows are farm animals.',
        type: 'multiple_choice'
    },
    // 5 True/False
    {
        id: 'q11',
        text: 'We eat food in the park. This is a "picnic".',
        options: ['True', 'False'],
        correctIndex: 0, // True
        explanation: 'A picnic involves eating outdoors.',
        type: 'multiple_choice' // Using MC layout for T/F
    },
    {
        id: 'q12',
        text: '"I flied a kite yesterday."',
        options: ['True', 'False'],
        correctIndex: 1, // False
        explanation: 'Incorrect. Correct is "flew".',
        type: 'multiple_choice'
    },
    {
        id: 'q13',
        text: '"He learns to swim every summer."',
        options: ['True', 'False'],
        correctIndex: 0, // True
        explanation: 'Correct grammar.',
        type: 'multiple_choice'
    },
    {
        id: 'q14',
        text: '"Grandparents" are my teachers.',
        options: ['True', 'False'],
        correctIndex: 1, // False
        explanation: 'Grandparents are parents of parents.',
        type: 'multiple_choice'
    },
    {
        id: 'q15',
        text: '"They go camping last weekend."',
        options: ['True', 'False'],
        correctIndex: 1, // False
        explanation: 'Incorrect. Must be "went" for past tense.',
        type: 'multiple_choice'
    }
]

// Helper to create Star Talk drills from vocabulary
const createVocabDrill = (vocabList: Vocabulary[]) => {
    return vocabList.flatMap((v, index) => [
        {
            id: `sys-${v.id}`,
            speaker: 'Teacher',
            text: v.word,
            role: 'system' as const,
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Teacher',
            audio: v.audio
        },
        {
            id: `usr-${v.id}`,
            speaker: 'You',
            text: v.word,
            role: 'user' as const,
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Student'
        }
    ])
}

// Mock Questions for Pick Up Trash (Grammar & Vocab)
const L1_TRASH_QUESTIONS: Question[] = [
    // --- PART 1: REMEMBERING (Grammar & Vocab) ---
    {
        id: 'q1',
        text: 'My bike was broken yesterday, so I couldn\'t ______.',
        options: ['go fishing', 'ride a bike', 'fly a kite', 'go camping'],
        correctIndex: 1,
        explanation: 'Xe đạp hỏng thì không lái xe được (ride a bike).',
        type: 'multiple_choice'
    },
    {
        id: 'q2',
        text: '"Did you went to the farm last weekend?" Câu hỏi này đúng ngữ pháp hay sai?',
        options: ['True (Đúng)', 'False (Sai)'],
        correctIndex: 1,
        explanation: 'Sai. Đã có trợ động từ "Did" thì động từ chính phải về nguyên mẫu "go".',
        type: 'multiple_choice'
    },
    {
        id: 'q3',
        text: 'I caught a big fish yesterday! It was great. I went ______.',
        options: ['shopping', 'fishing', 'swimming', 'camping'],
        correctIndex: 1,
        explanation: 'Caught a big fish -> Went fishing.',
        type: 'multiple_choice'
    },
    {
        id: 'q4',
        text: '"Visit my grandparents" means going to see your mother and father.',
        options: ['True', 'False'],
        correctIndex: 1,
        explanation: 'Sai. Grandparents là ông bà, không phải bố mẹ (parents).',
        type: 'multiple_choice'
    },
    {
        id: 'q5',
        text: 'Choose the correct sentence (Chọn câu đúng):',
        options: ['She didn\'t learned how to swim.', 'She didn\'t learn how to swim.', 'She not learn how to swim.', 'She don\'t learn how to swim.'],
        correctIndex: 1,
        explanation: 'Cấu trúc phủ định quá khứ: Didn\'t + V nguyên mẫu (learn).',
        type: 'multiple_choice'
    },

    // --- PART 2: VISUAL GUESSING (Image Logic) ---
    {
        id: 'q6',
        text: 'Look at the items. What activity is this?',
        image: vocabPicnic,
        options: ['Go to the farm', 'Learn how to cook', 'Have a picnic', 'Go camping'],
        correctIndex: 2,
        explanation: 'Basket + Blanket + Food = Have a picnic.',
        type: 'multiple_choice'
    },
    {
        id: 'q7',
        text: 'Look at these items. Where is this?',
        image: vocabFarm,
        options: ['At the beach', 'On the farm', 'At the park', 'In the kitchen'],
        correctIndex: 1,
        explanation: 'Cows in the field = On the farm.',
        type: 'multiple_choice'
    },
    {
        id: 'q8',
        text: 'Look at the scene. What did they do last night?',
        image: vocabCamping,
        options: ['They went fishing.', 'They went camping.', 'They flew a kite.', 'They rode a bike.'],
        correctIndex: 1,
        explanation: 'Tent + Night = Went camping.',
        type: 'multiple_choice'
    },

    // --- PART 3: IDIOMS (A2 Level) ---
    {
        id: 'q9',
        text: 'Learning how to ride a bike is very easy for me. It is just ______!',
        options: ['under the weather', 'a piece of cake', 'a go to the beach', 'a hard work'],
        correctIndex: 1,
        explanation: '"A piece of cake" nghĩa là rất dễ dàng.',
        type: 'multiple_choice'
    },
    {
        id: 'q10',
        text: '"The math test was very difficult (khó). It was a piece of cake." Câu này dùng thành ngữ đúng hay sai?',
        options: ['True', 'False'],
        correctIndex: 1,
        explanation: 'Sai. "Difficult" (khó) trái nghĩa với "a piece of cake" (dễ).',
        type: 'multiple_choice'
    },
    {
        id: 'q11',
        text: 'I cannot go to the beach today because I am feeling ______. I have a headache.',
        options: ['happy', 'a piece of cake', 'under the weather', 'excited'],
        correctIndex: 2,
        explanation: '"Under the weather" nghĩa là cảm thấy mệt, không khỏe.',
        type: 'multiple_choice'
    },
    {
        id: 'q12',
        text: '"Tom is under the weather, so he stays in bed." Câu này hợp lý không?',
        options: ['True', 'False'],
        correctIndex: 0,
        explanation: 'Đúng. Bị ốm (under the weather) thì nên nằm nghỉ (stays in bed).',
        type: 'multiple_choice'
    }
]

// --- Defeat the Goalkeeper Data (Unit 1) ---
const L1_GOALKEEPER_QUESTIONS: Question[] = [
    {
        id: 'gk1',
        text: 'You need a tent to sleep outside in the forest. What is this activity?',
        options: ['Go to the beach', 'Go camping', 'Fly a kite', 'Learn how to cook'],
        correctIndex: 1, // B
        explanation: 'Tent (lều) -> Go camping.',
        type: 'multiple_choice'
    },
    {
        id: 'gk2',
        text: 'It is very hot. I want to play in the sand and swim in the sea.',
        options: ['Go to the beach', 'Go to the farm', 'Ride a bike', 'Visit my grandparents'],
        correctIndex: 0, // A
        explanation: 'Sand (cát), Sea (biển) -> Go to the beach.',
        type: 'multiple_choice'
    },
    {
        id: 'gk3',
        text: 'I want to see cows, chickens, and sheep. Where should I go?',
        options: ['Go fishing', 'Have a picnic', 'Go to the farm', 'Learn how to swim'],
        correctIndex: 2, // C
        explanation: 'Cows, chickens (bò, gà) -> Go to the farm.',
        type: 'multiple_choice'
    },
    {
        id: 'gk4',
        text: 'I want to make a yummy dinner for my mom. I need to ______.',
        options: ['fly a kite', 'go camping', 'ride a bike', 'learn how to cook'],
        correctIndex: 3, // D
        explanation: 'Make dinner (làm bữa tối) -> learn how to cook.',
        type: 'multiple_choice'
    },
    {
        id: 'gk5',
        text: 'I am at the swimming pool. I want to move my body in the water.',
        options: ['learn how to cook', 'visit my grandparents', 'learn how to swim', 'go to the farm'],
        correctIndex: 2, // C
        explanation: 'Swimming pool (hồ bơi) -> learn how to swim.',
        type: 'multiple_choice'
    },
    {
        id: 'gk6',
        text: 'I go to see my grandma and grandpa. What am I doing?',
        options: ['Visit my grandparents', 'Go fishing', 'Go to the beach', 'Fly a kite'],
        correctIndex: 0, // A
        explanation: 'Grandma and grandpa (ông bà) -> Visit my grandparents.',
        type: 'multiple_choice'
    },
    {
        id: 'gk7',
        text: 'We are eating sandwiches on the grass in the park.',
        options: ['Ride a bike', 'Have a picnic', 'Learn how to swim', 'Go to the farm'],
        correctIndex: 1, // B
        explanation: 'Eating on the grass (ăn trên cỏ) -> Have a picnic.',
        type: 'multiple_choice'
    },
    {
        id: 'gk8',
        text: 'I have a rod (cần câu) and I am sitting by the lake to catch something.',
        options: ['Go camping', 'Fly a kite', 'Learn how to cook', 'Go fishing'],
        correctIndex: 3, // D
        explanation: 'Rod (cần câu), Catch (bắt) -> Go fishing.',
        type: 'multiple_choice'
    },
    {
        id: 'gk9',
        text: 'I have a helmet and two wheels. I push the pedals to move.',
        options: ['Ride a bike', 'Go to the beach', 'Have a picnic', 'Go fishing'],
        correctIndex: 0, // A
        explanation: 'Two wheels (2 bánh xe) -> Ride a bike.',
        type: 'multiple_choice'
    },
    {
        id: 'gk10',
        text: 'It is windy today. I have a toy on a long string flying in the sky.',
        options: ['Go camping', 'Fly a kite', 'Learn how to swim', 'Visit my grandparents'],
        correctIndex: 1, // B
        explanation: 'Windy (gió), Sky (bầu trời) -> Fly a kite.',
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
            },
            {
                id: 'g1-startalk',
                type: GameType.STAR_TALK,
                title: 'Star Talk',
                description: 'Speaking Practice',
                data: {
                    conversation: createVocabDrill(L1_VOCAB)
                }
            },
            {
                id: 'g1-trash',
                type: GameType.TRASH,
                title: 'Pick Up Trash',
                description: 'Clean the park & Learn!',
                data: {
                    questions: L1_TRASH_QUESTIONS
                }
            },
            {
                id: 'g1-goalkeeper',
                type: GameType.GOALKEEPER,
                title: 'Defeat the Goalkeeper',
                description: 'Penalty Shootout Challenge',
                data: {
                    questions: L1_GOALKEEPER_QUESTIONS
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
