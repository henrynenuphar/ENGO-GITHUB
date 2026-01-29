export enum GameType {
    FLASHCARD = 'flashcard',
    COOL_PAIR = 'cool_pair',
    ROWING = 'rowing', // Chèo thuyền
    TRASH = 'trash', // Nhặt rác
    SMART_MONKEY = 'smart_monkey',
    GOALKEEPER = 'goalkeeper', // Study/Quiz game
    TEACHER = 'teacher', // Reflex game
    SHADOWING = 'shadowing',
    WRITING = 'writing'
}

export interface Vocabulary {
    id: string;
    word: string;
    meaning: string; // Vietnamese meaning
    image: string; // URL or emoji
    audio?: string; // URL to audio file
    exampleSentence?: string;
    ipa?: string;
    pastTense?: string;
}

export interface Question {
    id: string;
    text: string;
    image?: string;
    options: string[];
    correctIndex: number;
    explanation?: string;
    type?: 'multiple_choice' | 'fill_blank' | 'true_false' | 'sentence_order';
}

export interface GameConfig {
    id: string;
    type: GameType;
    title: string;
    description?: string;
    data?: any; // Flexible data depending on game type
    // e.g. for Flashcard: { vocabIds: string[] }
    // e.g. for Quiz: { questions: Question[] }
}

export interface Lesson {
    id: string;
    title: string;
    description: string;
    thumbnail?: string;
    videoUrl: string; // YouTube link
    order: number;
    games: GameConfig[];
    isLocked?: boolean;
}

export interface UserProgress {
    userId: string;
    completedLessons: string[]; // lesson IDs
    lessonScores: Record<string, number>; // lessonId -> score
    gameHighScores: Record<string, number>; // gameId -> score
}
