import React, { useState, useEffect } from 'react'
import { GameContainer } from './components/GameContainer'
import { Question } from '@/types'
import { motion, AnimatePresence } from 'framer-motion'
import { Volume2, VolumeX } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { toast } from 'sonner'
import { GameReview, ReviewItem } from './components/GameReview'
import { GameResult } from './components/GameResult'
import mascotGrabber from '/images/trash/Khi-nhat-rac.png'
import bg3dBeach from '@/assets/images/bg_3d_beach.png'

interface PickUpTrashGameProps {
    data: {
        questions: Question[]
    }
    onComplete: (score: number) => void
    onExit?: () => void
}

interface TrashItem {
    id: string
    x: number
    y: number
    type: 'chai-nuoc-cu' | 'chai-ruou-vo' | 'Chuoi' | 'lon-nuoc' | 'nui-ni-long' | 'swd' | 'tao-can-do' | 'vo-cam'
    rotation: number
    inWater: boolean
    isGreyedOut?: boolean
}

const TRASH_TYPES = ['chai-nuoc-cu', 'chai-ruou-vo', 'Chuoi', 'lon-nuoc', 'nui-ni-long', 'swd', 'tao-can-do', 'vo-cam'] as const

const PickUpTrashGame: React.FC<PickUpTrashGameProps> = ({ data, onComplete, onExit }) => {
    // Game Constants
    const ROUND_DURATION = 1200 // 20 minutes
    const MAX_TRASH_COUNT = 10

    // State
    const [score, setScore] = useState(0)
    const [timeLeft, setTimeLeft] = useState(ROUND_DURATION)
    const [isPaused, setIsPaused] = useState(false)
    const [gameStatus, setGameStatus] = useState<'playing' | 'review' | 'finished'>('playing')
    const [isMuted, setIsMuted] = useState(false)

    const [trashItems, setTrashItems] = useState<TrashItem[]>([])
    const [activeTrashId, setActiveTrashId] = useState<string | null>(null)
    const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
    const [showQuestionModal, setShowQuestionModal] = useState(false)

    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)

    // Question Management (No Repeats)
    const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([])
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)

    // Tracking for Review
    const [userAnswers, setUserAnswers] = useState<{ question: Question, selectedIdx: number, isCorrect: boolean }[]>([])

    const [hasInteracted, setHasInteracted] = useState(false)

    // Background Audio
    const bgMusicRef = React.useRef<HTMLAudioElement | null>(null)
    useEffect(() => {
        bgMusicRef.current = new Audio('/sounds/fun_bg_jungle_user.mp4')
        bgMusicRef.current.loop = true
        bgMusicRef.current.volume = 0.4

        return () => {
            if (bgMusicRef.current) {
                bgMusicRef.current.pause()
                bgMusicRef.current.currentTime = 0
            }
        }
    }, [])

    useEffect(() => {
        const playMusic = () => {
            if (!isPaused && bgMusicRef.current && gameStatus === 'playing' && hasInteracted) {
                bgMusicRef.current.play().catch(e => console.log("Audio autoplay blocked", e))
            } else if (bgMusicRef.current) {
                bgMusicRef.current.pause()
            }
        }

        // Only play if not globally muted
        if (!isMuted) {
            playMusic()
        } else if (bgMusicRef.current) {
            bgMusicRef.current.pause()
        }
    }, [isPaused, gameStatus, isMuted, hasInteracted])

    // Mascot State
    const [mascotPos, setMascotPos] = useState({ x: 50, y: 75 })
    const [isMoving, setIsMoving] = useState(false)
    const [facingRight, setFacingRight] = useState(false)

    // SFX
    const playSound = (type: 'correct' | 'wrong' | 'pickup' | 'water') => {
        if (isMuted) return
        const sounds = {
            correct: 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3',
            wrong: 'https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3',
            pickup: 'https://assets.mixkit.co/active_storage/sfx/2578/2578-preview.mp3',
            water: 'https://assets.mixkit.co/active_storage/sfx/110/110-preview.mp3'
        }
        const audio = new Audio(sounds[type])
        audio.volume = 0.5
        audio.play().catch(() => { })
    }

    // Init Game
    useEffect(() => {
        initGame()
    }, [])

    // Timer
    useEffect(() => {
        if (isPaused || gameStatus !== 'playing' || showQuestionModal) return
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer)
                    endGame()
                    return 0
                }
                return prev - 1
            })
        }, 1000)
        return () => clearInterval(timer)
    }, [isPaused, gameStatus, showQuestionModal])

    const initGame = () => {
        setScore(0)
        setTimeLeft(ROUND_DURATION)
        setGameStatus('playing')
        setUserAnswers([])
        setIsPaused(false)
        spawnTrash(MAX_TRASH_COUNT)
        setMascotPos({ x: 50, y: 75 })

        // Shuffle Questions and pick exactly 10
        const shuffled = [...data.questions].sort(() => Math.random() - 0.5).slice(0, MAX_TRASH_COUNT)
        setShuffledQuestions(shuffled)
        setCurrentQuestionIndex(0)
    }

    const spawnTrash = (count: number) => {
        // Guarantee all 8 types are present at least once
        const selectedTypes = [...TRASH_TYPES]

        // Add random duplicates to reach the required count (10)
        while (selectedTypes.length < count) {
            selectedTypes.push(TRASH_TYPES[Math.floor(Math.random() * TRASH_TYPES.length)])
        }

        // Shuffle the selected types so they don't appear in the same order
        selectedTypes.sort(() => Math.random() - 0.5)

        const newTrash: TrashItem[] = []
        for (let i = 0; i < count; i++) {
            // Keep items safely within the visible sand area (avoid bottom edges)
            const yMin = 70
            const yMax = 82

            const itemY = Math.random() * (yMax - yMin) + yMin
            const itemX = Math.random() * 80 + 10 // from 10% to 90%

            newTrash.push({
                id: `trash-${Date.now()}-${i}`,
                x: itemX,
                y: itemY,
                type: selectedTypes[i],
                rotation: Math.random() * 360,
                inWater: false,
                isGreyedOut: false
            })
        }
        setTrashItems(newTrash)
    }

    const handleTrashClick = (trashId: string, targetX: number, targetY: number) => {
        if (gameStatus !== 'playing' || isPaused || isMoving) return

        // Prevent clicking if the trash is already answered (greyed out)
        const clickedTrash = trashItems.find(t => t.id === trashId)
        if (clickedTrash?.isGreyedOut) return

        setIsMoving(true)
        setFacingRight(targetX > mascotPos.x)

        // Use purely the target coordinates since we are standardizing the mascot anchor to center
        setMascotPos({ x: targetX, y: targetY })

        if (targetY < 75) playSound('water')
        else playSound('pickup')

        // Show question (Unique from shuffled list)
        setActiveTrashId(trashId)

        // Safety check: Loop back if run out (though 12 q > 10 trash)
        const qIndex = currentQuestionIndex % shuffledQuestions.length
        const nextQ = shuffledQuestions[qIndex]

        setCurrentQuestion(nextQ)
        setCurrentQuestionIndex(prev => prev + 1)
        setShowQuestionModal(true)

        // Mascot movement calculation
        const distance = Math.hypot(targetX - mascotPos.x, targetY - mascotPos.y)
        const duration = Math.min(1.5, Math.max(0.8, distance / 40)) * 1000

        setTimeout(() => {
            setIsMoving(false)
        }, duration)
    }

    const handleAnswer = (optionIndex: number) => {
        if (!currentQuestion || selectedAnswer !== null) return // Prevent multiple clicks

        setSelectedAnswer(optionIndex)
        const isCorrect = optionIndex === currentQuestion.correctIndex

        if (isCorrect) {
            playSound('correct')
            setScore(prev => prev + 10)
            toast.success("Correct! +10 points")
        } else {
            playSound('wrong')
            setScore(prev => Math.max(0, prev - 3))
            toast.error("Incorrect! -3 points")
        }

        // Record Answer
        setUserAnswers(prev => [...prev, {
            question: currentQuestion,
            selectedIdx: optionIndex,
            isCorrect
        }])

        // Delay closing to show feedback
        setTimeout(() => {
            setShowQuestionModal(false)
            setSelectedAnswer(null)
            setCurrentQuestion(null)

            if (isCorrect) {
                // Remove trash if correct
                setTrashItems(prev => prev.filter(t => t.id !== activeTrashId))
            } else {
                // Grey out trash if wrong
                setTrashItems(prev => prev.map(t => t.id === activeTrashId ? { ...t, isGreyedOut: true } : t))
            }

            // Check win condition using total answers instead of remaining trash arrays length
            if (userAnswers.length + 1 >= MAX_TRASH_COUNT) { // +1 because userAnswers state hasn't updated here yet due to async functional batching 
                endGame(true)
            }
        }, 1500)
    }

    const closeModal = () => {
        setShowQuestionModal(false)
        setActiveTrashId(null)
        setCurrentQuestion(null)
        setSelectedAnswer(null)
    }

    const endGame = (isWin = false) => {
        setGameStatus('review')
        setIsPaused(true)
    }

    const finishReview = () => {
        setGameStatus('finished')
    }

    const getTrashIcon = (type: string) => {
        return <img src={`/images/trash/${type}.png`} alt={type} className="w-16 h-16 object-contain drop-shadow-lg" />
    }

    // --- VISUAL COMPONENTS ---

    // Wood Board for UI
    const WoodBoard = ({ children, className }: any) => (
        <div className={`
            bg-[#8d6e63] border-b-4 border-r-4 border-[#5d4037] rounded-xl shadow-lg 
            flex items-center justify-center p-2 text-white font-bold font-comic
            ${className}
        `}>
            {children}
        </div>
    )

    // --- RENDER STATES ---

    // 1. REVIEW SCREEN
    if (gameStatus === 'review') {
        const reviewItems: ReviewItem[] = userAnswers.map(ans => ({
            question: ans.question.text,
            userAnswer: ans.question.options[ans.selectedIdx],
            correctAnswer: ans.question.options[ans.question.correctIndex],
            isCorrect: ans.isCorrect
        }))
        return <GameReview items={reviewItems} onContinue={finishReview} title="Xem Lại Đáp Án" />
    }

    // 2. FINISHED SCREEN (Score)
    if (gameStatus === 'finished') {
        return <GameResult score={score} maxScore={100} onComplete={() => onComplete(score)} />
    }

    return (
        <GameContainer
            title="Pick Up Trash"
            score={score}
            isPaused={isPaused}
            setIsPaused={setIsPaused}
            onRestart={initGame}
            onExit={onExit}
            hideScore={true}
        >
            <div className="relative w-full h-full overflow-hidden select-none cursor-crosshair font-comic">

                {/* --- BACKGROUND (3D Cartoon) --- */}
                <div className="absolute inset-0">
                    <img
                        src={bg3dBeach}
                        alt="Beach Background"
                        className="w-full h-full object-cover"
                    />
                    {/* Optional: Add a subtle overlay for better text contrast if needed, but 3D arts usually pop nicely */}
                </div>

                {/* --- UI LAYER --- */}
                <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-50">
                    <WoodBoard className="px-6 py-2 gap-3 min-w-[140px]">
                        <span className="text-2xl text-green-300">♻️</span>
                        <span className="text-xl tracking-wider text-yellow-100">{score}</span>
                    </WoodBoard>

                    <div className="flex gap-2">
                        <button onClick={() => setIsMuted(!isMuted)} className="w-10 h-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors border-2 border-white/40">
                            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                        </button>
                        <WoodBoard className="px-4 py-2 gap-2 min-w-[100px]">
                            <span className="text-xl">⏱️</span>
                            <span className={`text-xl font-mono ${timeLeft < 10 ? 'text-red-300 animate-pulse' : 'text-yellow-100'}`}>
                                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                            </span>
                        </WoodBoard>
                    </div>
                </div>

                {/* --- INTERACTIVE OBJECTS --- */}
                <AnimatePresence>
                    {trashItems.map((item) => (
                        <motion.div
                            key={item.id}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{
                                scale: 1,
                                opacity: 1,
                                rotate: item.rotation,
                                y: item.inWater ? [0, 5, 0] : 0
                            }}
                            transition={{
                                scale: { duration: 0.3 },
                                y: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                            }}
                            exit={{ scale: 0, opacity: 0 }}
                            whileHover={{ scale: 1.25, rotate: 10 }}
                            whileTap={{ scale: 0.9 }}
                            style={{ left: `${item.x}%`, top: `${item.y}%` }}
                            onClick={() => handleTrashClick(item.id, item.x, item.y)}
                            className={`absolute text-5xl z-20 transition-all duration-300
                                ${item.inWater ? 'opacity-90' : 'drop-shadow-xl'}
                                ${item.isGreyedOut ? 'grayscale opacity-75 cursor-not-allowed filter' : 'cursor-pointer hover:drop-shadow-2xl'}
                            `}
                        >
                            {/* Visual wrapper to shrink or fade if greyed out */}
                            <div className={`transition-all duration-500 ${item.isGreyedOut ? 'scale-90 opacity-60' : ''}`}>
                                {getTrashIcon(item.type)}
                            </div>
                            {item.inWater && !item.isGreyedOut && (
                                <div className="absolute -bottom-2 -left-2 w-[120%] h-4 bg-white/30 rounded-full blur-sm animate-pulse" />
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Mascot Wrapper to detach position coordinates from Framer Motion transforms */}
                <motion.div
                    animate={{
                        left: `${mascotPos.x}%`,
                        top: `${mascotPos.y}%`,
                        scaleX: facingRight ? 1 : -1
                    }}
                    transition={{
                        left: { duration: isMoving ? 1 : 0, ease: "linear" },
                        top: { duration: isMoving ? 1 : 0, ease: "linear" }
                    }}
                    className="absolute z-30 pointer-events-none transform -translate-x-1/2 -translate-y-1/2"
                >
                    <motion.div
                        animate={{
                            y: isMoving ? [0, -15, 0] : 0
                        }}
                        transition={{
                            y: { duration: 0.4, repeat: isMoving ? Infinity : 0 }
                        }}
                        className="w-48 h-48 md:w-64 md:h-64"
                    >
                        <img src={mascotGrabber} alt="Mascot" className="w-full h-full object-contain drop-shadow-2xl" />
                    </motion.div>
                </motion.div>

                {/* --- QUESTION BOX (Integrated HUD) --- */}
                <AnimatePresence>
                    {showQuestionModal && currentQuestion && (
                        <div className="absolute inset-x-0 top-[8%] z-[60] flex justify-center px-4 pointer-events-none" onClick={() => setHasInteracted(true)}>
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                                className="w-full max-w-4xl pointer-events-auto"
                            >
                                <div className="bg-gradient-to-b from-sky-400/80 to-blue-600/80 border-[6px] border-white/40 rounded-[3rem] overflow-hidden relative backdrop-blur-[2px] p-6 lg:p-8 flex flex-col items-center gap-4 lg:gap-6 shadow-sm">

                                    {/* Question Text */}
                                    <h3 className="text-2xl md:text-4xl font-black text-white text-center leading-normal drop-shadow-md font-comic">
                                        {currentQuestion.text}
                                    </h3>

                                    {/* Image (if any) */}
                                    {currentQuestion.image && (
                                        <div className="h-40 lg:h-48 rounded-2xl overflow-hidden border-4 border-white/30 shadow-sm bg-white">
                                            <img
                                                src={currentQuestion.image}
                                                alt="Question"
                                                className="h-full w-full object-contain p-2"
                                            />
                                        </div>
                                    )}

                                    {/* Options (Pill Buttons) */}
                                    <div className="flex flex-wrap justify-center gap-4 w-full">
                                        {currentQuestion.options.map((opt, idx) => {
                                            const isSelected = selectedAnswer === idx
                                            const isCorrect = currentQuestion.correctIndex === idx
                                            const showResult = selectedAnswer !== null

                                            let buttonStyle = "bg-white text-blue-500 border-blue-200 hover:bg-yellow-300 hover:text-blue-700 hover:border-yellow-500 hover:-translate-y-1"

                                            if (showResult) {
                                                if (isCorrect) {
                                                    buttonStyle = "bg-green-500 text-white border-green-700 scale-105 shadow-lg ring-4 ring-green-300 pointer-events-none"
                                                } else if (isSelected && !isCorrect) {
                                                    buttonStyle = "bg-red-500 text-white border-red-700 shake pointer-events-none"
                                                } else {
                                                    buttonStyle = "bg-gray-100 text-gray-400 border-gray-200 opacity-50 pointer-events-none"
                                                }
                                            }

                                            return (
                                                <button
                                                    key={idx}
                                                    onClick={() => handleAnswer(idx)}
                                                    className={`
                                                        min-w-[40%] md:min-w-[200px] px-6 py-3 rounded-full border-b-[6px] transition-all font-black text-xl 
                                                        font-comic shadow-sm
                                                        ${buttonStyle}
                                                    `}
                                                >
                                                    {opt}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </GameContainer>
    )
}

export default PickUpTrashGame
