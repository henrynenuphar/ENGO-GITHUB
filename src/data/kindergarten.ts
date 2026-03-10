import { Lesson, GameType } from '@/types'

export const KINDERGARTEN_LESSONS: Lesson[] = [
    {
        id: 'k-lesson-1',
        title: 'Lesson 1: Count Numbers',
        description: 'Learn to count from 1 to 10.',
        videoUrl: 'https://www.youtube.com/embed/LxghLyXt9Jk?start=12',
        thumbnail: 'https://img.freepik.com/free-vector/numbers-concept-illustration_114360-3949.jpg',
        order: 1,
        isLocked: false,
        games: [
            {
                id: 'k-lesson-1-balloon-1',
                title: 'Balloon Pop Numbers',
                type: 'balloon_pop' as any,
                data: {} // Dynamic data generated inside the game
            },
            {
                id: 'k-lesson-1-trace-2',
                title: 'Writing Fun',
                type: GameType.TRACE_NUMBER_WORD,
                data: {} // Dynamic data inside game
            }
        ]
    },
    {
        id: 'k-lesson-2',
        title: 'Lesson 2: FRUITS 1',
        description: 'Learn about local fruits.',
        videoUrl: 'https://www.youtube.com/watch?v=example',
        thumbnail: 'https://img.freepik.com/free-vector/fresh-fruits-concept-illustration_114360-2640.jpg',
        order: 2,
        isLocked: true,
        games: []
    },
    {
        id: 'k-lesson-3',
        title: 'Lesson 3: FRUITS 2',
        description: 'Learn about exotic fruits.',
        videoUrl: 'https://www.youtube.com/watch?v=example',
        thumbnail: 'https://img.freepik.com/free-vector/exotic-fruits-concept-illustration_114360-1282.jpg',
        order: 3,
        isLocked: true,
        games: []
    },
    {
        id: 'k-lesson-4',
        title: 'Lesson 4: Colors 1',
        description: 'Primary colors.',
        videoUrl: 'https://www.youtube.com/watch?v=example',
        thumbnail: 'https://img.freepik.com/free-vector/colors-concept-illustration_114360-1205.jpg',
        order: 4,
        isLocked: true,
        games: []
    },
    {
        id: 'k-lesson-5',
        title: 'Lesson 5: Colors 2',
        description: 'Secondary colors.',
        videoUrl: 'https://www.youtube.com/watch?v=example',
        thumbnail: 'https://img.freepik.com/free-vector/colors-theory-concept-illustration_114360-3949.jpg',
        order: 5,
        isLocked: true,
        games: []
    },
    {
        id: 'k-lesson-6',
        title: 'Lesson 6: Fruits & Colors',
        description: 'Combining what we learned.',
        videoUrl: 'https://www.youtube.com/watch?v=example',
        thumbnail: 'https://img.freepik.com/free-vector/fruits-colors-concept-illustration_114360-2640.jpg',
        order: 6,
        isLocked: true,
        games: []
    },
    {
        id: 'k-lesson-7',
        title: 'Lesson 7: Practice Test',
        description: 'Review fruits and colors.',
        videoUrl: 'https://www.youtube.com/watch?v=example',
        thumbnail: 'https://img.freepik.com/free-vector/exam-preparation-concept-illustration_114360-2184.jpg',
        order: 7,
        isLocked: true,
        games: []
    },
    {
        id: 'k-lesson-8',
        title: 'Lesson 8: Family 1',
        description: 'Mother, father, brother, sister.',
        videoUrl: 'https://www.youtube.com/watch?v=example',
        thumbnail: 'https://img.freepik.com/free-vector/family-concept-illustration_114360-3949.jpg',
        order: 8,
        isLocked: true,
        games: []
    },
    {
        id: 'k-lesson-9',
        title: 'Lesson 9: Family 2',
        description: 'Grandparents, uncles, aunts.',
        videoUrl: 'https://www.youtube.com/watch?v=example',
        thumbnail: 'https://img.freepik.com/free-vector/family-tree-concept-illustration_114360-2640.jpg',
        order: 9,
        isLocked: true,
        games: []
    },
    {
        id: 'k-lesson-10',
        title: 'Lesson 10: My Body',
        description: 'Parts of the body.',
        videoUrl: 'https://www.youtube.com/watch?v=example',
        thumbnail: 'https://img.freepik.com/free-vector/my-body-concept-illustration_114360-1282.jpg',
        order: 10,
        isLocked: true,
        games: []
    }
]
