import React, { useState, useEffect, useRef } from 'react'
import { GameContainer } from './components/GameContainer'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, RotateCcw, ChevronRight, Volume2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { GameReview, ReviewItem } from './components/GameReview'
import { GameResult } from './components/GameResult'

interface ConversationItem {
    id: string
    speaker: string
    text: string
    role: 'system' | 'user'
    avatar: string
    audio?: string
}

interface StarTalkGameProps {
    data: {
        conversation: ConversationItem[]
    }
    onComplete: (score: number) => void
    onExit?: () => void
}

const StarTalkGame: React.FC<StarTalkGameProps> = ({ data, onComplete, onExit }) => {
    // Filter to get only the unique vocabulary items
    const questions = React.useMemo(() => {
        const items = []
        for (let i = 0; i < data.conversation.length; i += 2) {
            if (data.conversation[i] && data.conversation[i + 1]) {
                items.push({
                    prompt: data.conversation[i], // Teacher
                    target: data.conversation[i + 1] // Student
                })
            }
        }
        return items
    }, [data.conversation])

    const [currentIndex, setCurrentIndex] = useState(0)
    const [score, setScore] = useState(0)
    const [gameState, setGameState] = useState<'listening' | 'recording' | 'feedback'>('listening')
    const [transcript, setTranscript] = useState('')
    const [accuracy, setAccuracy] = useState<number>(0)
    const [feedbackLevel, setFeedbackLevel] = useState<'perfect' | 'good' | 'retry' | null>(null)
    const [isPaused, setIsPaused] = useState(false)
    const [gamePhase, setGamePhase] = useState<'playing' | 'review' | 'result'>('playing')
    const [userAnswers, setUserAnswers] = useState<ReviewItem[]>([])

    const currentItem = questions[currentIndex]
    const recognitionRef = useRef<any>(null)
    const audioRef = useRef<HTMLAudioElement | null>(null)

    // Initial Auto-play - Immediate
    useEffect(() => {
        if (currentItem && gameState === 'listening') {
            playAudio()
        }
        return () => {
            if (audioRef.current) {
                audioRef.current.pause()
                audioRef.current.currentTime = 0
            }
            window.speechSynthesis.cancel()
        }
    }, [currentIndex, gameState])

    const playAudio = () => {
        // Stop any previous audio to prevent overlap
        if (audioRef.current) {
            audioRef.current.pause()
            audioRef.current.currentTime = 0
        }
        window.speechSynthesis.cancel()

        // STRATEGY: Use reliable TTS (Youdao) similar to FlashcardGame
        const textToRead = currentItem.prompt.text
        const ttsUrl = `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(textToRead)}&type=2`

        const audio = new Audio(ttsUrl)
        audioRef.current = audio

        const playFallbackSystemTTS = () => {
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel()
                const utterance = new SpeechSynthesisUtterance(textToRead)
                utterance.lang = 'en-US'
                utterance.rate = 0.8 // Slow for kids

                // Try to get a good voice
                const voices = window.speechSynthesis.getVoices()
                const preferredVoice = voices.find(v => v.name.includes('Google US English')) ||
                    voices.find(v => v.lang === 'en-US')
                if (preferredVoice) utterance.voice = preferredVoice

                window.speechSynthesis.speak(utterance)
            }
        }

        audio.play().catch((err) => {
            // Ignore AbortError which happens when we intentionally pause/stop the audio
            if (err.name === 'AbortError' || err.message.includes('interrupted')) {
                return
            }
            console.warn("online TTS failed, using fallback", err)
            playFallbackSystemTTS()
        })
    }

    const startRecording = () => {
        if (!('webkitSpeechRecognition' in window)) {
            toast.error("Trình duyệt không hỗ trợ thu âm.")
            return
        }

        setGameState('recording')
        setTranscript('')
        setFeedbackLevel(null)

        const SpeechRecognition = (window as any).webkitSpeechRecognition
        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.continuous = false
        recognitionRef.current.interimResults = true
        recognitionRef.current.lang = 'en-US'

        recognitionRef.current.onstart = () => { }

        recognitionRef.current.onresult = (event: any) => {
            const current = event.resultIndex
            const text = event.results[current][0].transcript
            setTranscript(text)
        }

        recognitionRef.current.onend = () => {
            // Auto-stop is handled by silence or manual stop
        }

        recognitionRef.current.start()
    }

    // State for word-level feedback
    const [feedbackTokens, setFeedbackTokens] = useState<{ text: string, status: 'correct' | 'incorrect' }[]>([])

    // Updated stopRecording to trigger new evaluation
    const stopRecording = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop()
            setGameState('feedback')
            // Don't call evaluate immediately here if we reuse transcript state, 
            // but transcript might update slightly after stop. 
            // Better to rely on the existing transcript or wait a tick.
            setTimeout(() => evaluatePronunciation(transcript), 200)
        }
    }

    const editDistance = (s1: string, s2: string) => {
        s1 = s1.toLowerCase();
        s2 = s2.toLowerCase();
        const costs = new Array();
        for (let i = 0; i <= s1.length; i++) {
            let lastValue = i;
            for (let j = 0; j <= s2.length; j++) {
                if (i == 0) costs[j] = j;
                else {
                    if (j > 0) {
                        let newValue = costs[j - 1];
                        if (s1.charAt(i - 1) != s2.charAt(j - 1))
                            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
                        costs[j - 1] = lastValue;
                        lastValue = newValue;
                    }
                }
            }
            if (i > 0) costs[s2.length] = lastValue;
        }
        return costs[s2.length];
    }

    // New Word Alignment Logic
    const evaluatePronunciation = (userSpeech: string) => {
        const targetText = currentItem.target.text.replace(/[.,!?]/g, '').trim()
        const targetWords = targetText.split(' ')

        const inputWords = userSpeech.toLowerCase().replace(/[.,!?]/g, '').trim().split(' ')

        const tokens: { text: string, status: 'correct' | 'incorrect' }[] = []
        let correctCount = 0

        // Simple greedy alignment
        // For each target word, see if a matching word exists in the input window
        let inputIndex = 0

        targetWords.forEach((word) => {
            const cleanWord = word.toLowerCase()
            let found = false

            // Look ahead window of 3 words to find a match
            // This handles cases where user skips a word or inserts extra noise
            const searchLimit = Math.min(inputIndex + 3, inputWords.length)

            for (let j = inputIndex; j < searchLimit; j++) {
                const inputWord = inputWords[j]

                // Check similarity for this word pair
                const dist = editDistance(cleanWord, inputWord)
                const maxLength = Math.max(cleanWord.length, inputWord.length)
                const sim = (maxLength - dist) / maxLength

                // Threshold generous for short words, strict for long
                const threshold = cleanWord.length <= 3 ? 0.99 : 0.75

                if (sim >= threshold) {
                    found = true
                    inputIndex = j + 1 // Advance input pointer
                    break
                }
            }

            if (found) {
                correctCount++
                tokens.push({ text: word, status: 'correct' })
            } else {
                tokens.push({ text: word, status: 'incorrect' })
            }
        })

        setFeedbackTokens(tokens)

        // Overall Score Calculation
        const accuracy = targetWords.length > 0 ? (correctCount / targetWords.length) * 100 : 0
        setAccuracy(Math.round(accuracy))

        if (accuracy >= 100) {
            setFeedbackLevel('perfect')
            setScore(prev => prev + 10)
            playSound('success')
        } else if (accuracy >= 50) {
            setFeedbackLevel('good')
            setScore(prev => prev + 5)
            playSound('good')
        } else {
            setFeedbackLevel('retry')
            // No sound
        }
    }

    const playSound = (type: 'success' | 'good') => {
        const audios = {
            success: 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3',
            good: 'https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3',
        }
        new Audio(audios[type]).play().catch(() => { })
    }

    const handleNext = () => {
        // Record the final attempt
        setUserAnswers(prev => {
            // Check if we already recorded this index, if so replace it
            const newAnswers = [...prev]
            newAnswers[currentIndex] = {
                question: `Đọc mẫu câu: "${currentItem.target.text}"`,
                userAnswer: transcript || "(Không có nội dung)",
                correctAnswer: currentItem.target.text,
                isCorrect: feedbackLevel === 'perfect' || feedbackLevel === 'good'
            }
            return newAnswers
        })

        setGameState('listening')
        setTranscript('')
        setFeedbackLevel(null)
        setFeedbackTokens([]) // Clear tokens
        setAccuracy(0)

        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1)
        } else {
            setGamePhase('review')
        }
    }

    const handleRetry = () => {
        setGameState('listening')
        setTranscript('')
        setFeedbackLevel(null)
        setFeedbackTokens([])
    }

    const progress = ((currentIndex) / questions.length) * 100

    if (gamePhase === 'review') {
        return <GameReview items={userAnswers} onContinue={() => setGamePhase('result')} title="Kiểm tra phát âm" />
    }

    if (gamePhase === 'result') {
        return <GameResult score={score} maxScore={questions.length * 10} onComplete={() => onComplete(score)} />
    }

    return (
        <GameContainer
            title="Star Talk"
            score={score}
            isPaused={isPaused}
            setIsPaused={setIsPaused}
            onRestart={() => { setCurrentIndex(0); setScore(0); setGameState('listening'); setUserAnswers([]); setGamePhase('playing'); }}
            onExit={onExit}
        >
            <div className={`h-full w-full flex flex-col bg-gradient-to-b from-indigo-900 via-purple-800 to-indigo-900 relative text-white overflow-hidden font-sans ${gamePhase !== 'playing' ? 'hidden' : ''}`}>

                {/* Background Decor */}
                <div className="absolute inset-0 overflow-hidden">
                    {[...Array(20)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute bg-white rounded-full opacity-20"
                            style={{
                                width: Math.random() * 4 + 2 + 'px',
                                height: Math.random() * 4 + 2 + 'px',
                                top: Math.random() * 100 + '%',
                                left: Math.random() * 100 + '%',
                            }}
                            animate={{ opacity: [0.2, 0.8, 0.2] }}
                            transition={{ duration: Math.random() * 3 + 2, repeat: Infinity }}
                        />
                    ))}
                </div>

                {/* Header Progress */}
                <div className="w-full px-6 py-4 flex items-center justify-between z-10">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center text-indigo-900 font-bold">
                            {currentIndex + 1}
                        </div>
                        <span className="text-sm font-medium opacity-80">/ {questions.length}</span>
                    </div>

                    <div className="flex-1 max-w-xs mx-4 h-2 bg-black/30 rounded-full">
                        <motion.div
                            className="h-full bg-yellow-400 rounded-full"
                            animate={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col items-center justify-center p-4 z-10 relative">

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        key={currentIndex}
                        className="flex flex-col items-center gap-6 w-full max-w-md"
                    >
                        {/* Mascot Hint */}
                        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                            <span className="text-2xl">🌟</span>
                            <span className="text-sm font-medium">Lắng nghe và nhắc lại nhé!</span>
                        </div>

                        {/* Vocabulary Card */}
                        <div className="w-full bg-white text-indigo-900 rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
                            <h2 className="text-3xl md:text-4xl font-bold mb-2 text-indigo-950">
                                {currentItem?.target.text}
                            </h2>
                            <p className="text-slate-400 text-lg">/IPA/</p>

                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={playAudio}
                                className="mt-6 w-14 h-14 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center hover:bg-indigo-200 transition-colors"
                            >
                                <Volume2 size={24} />
                            </motion.button>
                        </div>
                    </motion.div>

                    {/* Feedback Overlay */}
                    <AnimatePresence>
                        {feedbackLevel && (
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: 20, opacity: 0 }}
                                className="mt-8 flex flex-col items-center gap-4 w-full"
                            >
                                {/* Word Level Feedback Display */}
                                <div className="flex flex-wrap justify-center gap-2 mb-2 px-4">
                                    {feedbackTokens.map((token, idx) => (
                                        <motion.span
                                            key={idx}
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ delay: idx * 0.1 }}
                                            className={`
                                                text-2xl md:text-3xl font-bold px-3 py-1 rounded-lg border-2
                                                ${token.status === 'correct'
                                                    ? 'bg-green-100 text-green-700 border-green-200'
                                                    : 'bg-orange-100 text-orange-600 border-orange-200 line-through decoration-orange-400/50'}
                                            `}
                                        >
                                            {token.text}
                                        </motion.span>
                                    ))}
                                </div>

                                <div className={`
                                    px-6 py-3 rounded-2xl shadow-lg border-2 flex items-center gap-3 bg-white
                                    ${feedbackLevel === 'perfect' ? 'border-green-300' : ''}
                                    ${feedbackLevel === 'good' ? 'border-blue-300' : ''}
                                    ${feedbackLevel === 'retry' ? 'border-orange-300' : ''}
                                 `}>
                                    <span className="text-3xl">
                                        {feedbackLevel === 'perfect' && '🤩'}
                                        {feedbackLevel === 'good' && '😊'}
                                        {feedbackLevel === 'retry' && '🤔'}
                                    </span>
                                    <div>
                                        <h4 className={`font-bold text-lg leading-none
                                            ${feedbackLevel === 'perfect' ? 'text-green-600' : ''}
                                            ${feedbackLevel === 'good' ? 'text-blue-600' : ''}
                                            ${feedbackLevel === 'retry' ? 'text-orange-600' : ''}
                                         `}>
                                            {feedbackLevel === 'perfect' && 'Tuyệt vời!'}
                                            {feedbackLevel === 'good' && 'Làm tốt lắm!'}
                                            {feedbackLevel === 'retry' && 'Thử lại nhé!'}
                                        </h4>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                </div>

                {/* Bottom Controls */}
                <div className="w-full bg-white/10 backdrop-blur-lg border-t border-white/10 p-6 pb-10 rounded-t-[2.5rem] z-20">
                    <div className="flex items-center justify-between max-w-sm mx-auto gap-4">

                        {/* LEFT: Replay Sample */}
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={playAudio}
                            className="w-14 h-14 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white backdrop-blur-md border border-white/10 shadow-lg"
                        >
                            <Volume2 size={24} />
                        </motion.button>

                        {/* CENTER: Record / Stop / Retry */}
                        <div className="relative">
                            {gameState === 'recording' ? (
                                <motion.button
                                    initial={{ scale: 0.9 }}
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{ repeat: Infinity, duration: 2 }}
                                    onClick={stopRecording}
                                    className="w-24 h-24 rounded-full bg-red-500 border-4 border-red-200 flex items-center justify-center shadow-xl relative z-10"
                                >
                                    <div className="w-8 h-8 bg-white rounded-md" />
                                </motion.button>
                            ) : (
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={startRecording}
                                    className="w-24 h-24 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/30 border-4 border-white/20 z-10 relative"
                                >
                                    {feedbackLevel === 'retry' ? <RotateCcw size={32} className="text-white" /> : <Mic size={36} className="text-white" />}
                                </motion.button>
                            )}

                            {/* Pulse effect behind mic */}
                            {gameState === 'recording' && (
                                <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-20" />
                            )}
                        </div>

                        {/* RIGHT: Next Button */}
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={handleNext}
                            className="w-14 h-14 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white backdrop-blur-md border border-white/10 shadow-lg"
                        >
                            <ChevronRight size={28} />
                        </motion.button>

                    </div>

                    <p className="text-center text-white/50 text-xs mt-6 font-medium">
                        {gameState === 'recording' ? 'Đang nghe...' :
                            feedbackLevel === 'retry' ? 'Bấm để thử lại' : 'Bấm micro để nói'}
                    </p>
                </div>
            </div>
        </GameContainer>
    )
}

export default StarTalkGame
