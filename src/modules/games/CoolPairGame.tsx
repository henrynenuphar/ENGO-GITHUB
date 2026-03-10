import React, { useState, useEffect } from 'react'
import { GameContainer } from './components/GameContainer'
import { Vocabulary } from '@/types'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/Card'
import { Check, X } from 'lucide-react'
import { GameResult } from './components/GameResult'

interface CoolPairGameProps {
    data: {
        pairs: Vocabulary[]
    }
    onComplete: (score: number) => void
    onExit?: () => void
}

interface GameCard {
    id: string; // matches vocab id
    content: string;
    type: 'word' | 'image';
    uniqueId: string;
    isFlipped: boolean;
    isMatched: boolean;
    fallbackText?: string;
}

const CoolPairGame: React.FC<CoolPairGameProps> = ({ data, onComplete, onExit }) => {
    if (!data?.pairs || data.pairs.length === 0) return <div>No pairs loaded</div>

    const [cards, setCards] = useState<GameCard[]>([])
    const [flippedIndices, setFlippedIndices] = useState<number[]>([])
    const [score, setScore] = useState(0)
    const [isPaused, setIsPaused] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)
    const [gameCompleted, setGameCompleted] = useState(false)
    const [timeLeft, setTimeLeft] = useState(600) // 10 minutes

    // Initialize Game
    useEffect(() => {
        setupGame()
    }, [data])

    // Background Audio
    const bgMusicRef = React.useRef<HTMLAudioElement | null>(null)
    const [hasInteracted, setHasInteracted] = useState(false)

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
            if (!isPaused && bgMusicRef.current && !gameCompleted && hasInteracted) {
                bgMusicRef.current.play().catch(e => console.log("Audio autoplay blocked", e))
            } else if (bgMusicRef.current) {
                bgMusicRef.current.pause()
            }
        }
        playMusic()
    }, [isPaused, gameCompleted, hasInteracted])

    // Timer Logic
    useEffect(() => {
        if (isPaused || gameCompleted) return

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer)
                    setGameCompleted(true)
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(timer)
    }, [isPaused, gameCompleted])

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60)
        const s = seconds % 60
        return `${m}:${s < 10 ? '0' : ''}${s}`
    }

    const setupGame = () => {
        // Randomly select up to 8 pairs
        const shuffledPairs = [...data.pairs].sort(() => Math.random() - 0.5).slice(0, 8)

        const gameCards: GameCard[] = []
        shuffledPairs.forEach(p => {
            gameCards.push({ id: p.id, content: p.word, type: 'word', uniqueId: p.id + '-word', isFlipped: false, isMatched: false })
            gameCards.push({ id: p.id, content: p.image, type: 'image', uniqueId: p.id + '-image', isFlipped: false, isMatched: false, fallbackText: p.meaning })
        })
        // Shuffle cards
        setCards(gameCards.sort(() => Math.random() - 0.5))
        setScore(0)
        setFlippedIndices([])
        setIsPaused(false)
        setGameCompleted(false)
        setTimeLeft(600) // Reset to 10 mins
    }

    const playSound = (type: 'correct' | 'wrong') => {
        // Simple Audio Placeholder
        if (type === 'correct') {
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3') // Ding sound
            audio.volume = 0.5
            audio.play().catch(() => { })
        }
    }

    const handleCardClick = (index: number) => {
        if (isProcessing || isPaused || cards[index].isFlipped || cards[index].isMatched) return

        const newCards = [...cards]
        newCards[index].isFlipped = true
        setCards(newCards)

        const newFlipped = [...flippedIndices, index]
        setFlippedIndices(newFlipped)

        if (newFlipped.length === 2) {
            checkMatch(newFlipped[0], newFlipped[1])
        }
    }

    const checkMatch = (idx1: number, idx2: number) => {
        setIsProcessing(true)
        const match = cards[idx1].id === cards[idx2].id

        if (match) {
            playSound('correct')
            setTimeout(() => {
                setCards(prev => prev.map((c, i) =>
                    (i === idx1 || i === idx2) ? { ...c, isMatched: true } : c
                ))
                setScore(prev => prev + 10)
                setFlippedIndices([])
                setIsProcessing(false)

                // Check Win Condition
                if (cards.every((c, i) => (i === idx1 || i === idx2) || c.isMatched)) {
                    setTimeout(() => setGameCompleted(true), 500)
                }
            }, 500)
        } else {
            // Wrong match: Silent flip back
            setTimeout(() => {
                setCards(prev => prev.map((c, i) =>
                    (i === idx1 || i === idx2) ? { ...c, isFlipped: false } : c
                ))
                setScore(prev => Math.max(0, prev - 1))
                setFlippedIndices([])
                setIsProcessing(false)
            }, 1000)
        }
    }

    if (gameCompleted) {
        return <GameResult score={score} maxScore={80} onComplete={() => onComplete(score)} />
    }

    // Always 4 columns maximum for 8 pairs (16 cards).
    // Using simple responsive logic
    const gridCols = cards.length <= 12 ? 'grid-cols-3' : 'grid-cols-4'

    return (
        <GameContainer
            title="Cool Pair Matching"
            score={score}
            isPaused={isPaused}
            setIsPaused={setIsPaused}

            onRestart={setupGame}
            onExit={onExit}
            hideScore={true}
        >
            <div className="h-full w-full flex flex-col items-center p-4 relative overflow-hidden bg-sky-100" onClick={() => setHasInteracted(true)}>
                {/* Background Image */}
                <div
                    className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: 'url(/images/classroom_bg.png)' }}
                />

                {/* Overlay for Readability */}
                <div className="absolute inset-0 z-0 bg-white/30 backdrop-blur-[2px]" />

                {/* Timer - Moved here to avoid header clipping */}
                <div className="z-20 mt-2 mb-2 font-mono text-brand-blue text-2xl md:text-3xl font-black bg-white/90 backdrop-blur px-8 py-2 rounded-full flex items-center gap-3 shadow-xl border-4 border-brand-blue transform hover:scale-105 transition-transform">
                    ⏱ <span className="w-24 text-center pt-1">{formatTime(timeLeft)}</span>
                </div>

                {/* Main Content Area - Centered */}
                <div className="flex-1 w-full flex items-center justify-center z-10 relative">
                    {/* Grid Container - Strictly square, fitting within viewport constraints */}
                    <div
                        className={`grid ${gridCols} gap-2 md:gap-4`}
                        style={{
                            width: 'min(90vw, 70vh)',
                            height: 'min(90vw, 70vh)'
                        }}
                    >
                        {cards.map((card, idx) => (
                            <div
                                key={card.uniqueId}
                                onClick={() => handleCardClick(idx)}
                                className="w-full h-full perspective-1000 cursor-pointer group"
                            >
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{
                                        scale: 1,
                                        opacity: 1,
                                        rotateY: card.isFlipped || card.isMatched ? 180 : 0
                                    }}
                                    transition={{ duration: 0.4 }}
                                    className="w-full h-full relative preserve-3d"
                                >
                                    {/* Front Face (Card Back) - Visible when rotateY = 0 */}
                                    <div className="absolute inset-0 rounded-2xl shadow-lg border-b-4 border-indigo-700
                                        flex items-center justify-center backface-hidden
                                        bg-gradient-to-br from-indigo-500 to-purple-600 z-[2]"
                                    >
                                        <span className="text-4xl font-black text-white/30 select-none group-hover:scale-110 transition-transform">?</span>
                                    </div>

                                    {/* Back Face (Content) - Visible when rotateY = 180 */}
                                    <div className={`
                                        absolute inset-0 bg-white rounded-2xl shadow-xl border-2 
                                        ${card.isMatched ? 'border-green-500 ring-4 ring-green-100' : 'border-indigo-100'}
                                        flex items-center justify-center backface-hidden p-2
                                    `}
                                        style={{ transform: 'rotateY(180deg)' }}
                                    >
                                        <CardContent card={card} />

                                        {card.isMatched && (
                                            <div className="absolute -top-3 -right-3 bg-green-500 text-white rounded-full p-1.5 shadow-md z-10 transition-transform scale-110">
                                                <Check size={20} strokeWidth={4} />
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer Score - Absolute or Flex Item */}
                <div className="h-16 shrink-0 flex items-center justify-center w-full z-20">
                    <div className="bg-white/90 backdrop-blur-sm rounded-full py-2 px-8 shadow-xl border border-white/50 flex items-center gap-4">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Score</span>
                        <span className="text-3xl font-black text-brand-orange">{score}</span>
                    </div>
                </div>
            </div>
        </GameContainer >
    )
}

// Sub-component for reliable content rendering
const CardContent: React.FC<{ card: GameCard }> = ({ card }) => {
    const [imgError, setImgError] = useState(false)

    // Helper for adaptive text sizing
    const getTextClass = (text: string) => {
        const len = text.length
        // Very short words (e.g. "Cat", "Dog")
        if (len <= 5) return 'text-2xl md:text-4xl'
        // Short phrases (e.g. "Go camping", "Fly a kite")
        if (len <= 12) return 'text-lg md:text-2xl'
        // Medium phrases (e.g. "Learn how to swim")
        if (len <= 20) return 'text-sm md:text-xl'
        // Long phrases (e.g. "Visit my grandparents") - Reduced further to avoid wrapping issues
        return 'text-[10px] md:text-base'
    }

    if (card.type === 'word') {
        return (
            <div className="w-full h-full flex items-center justify-center overflow-hidden relative">
                <span className={`font-bold text-slate-700 text-center leading-tight select-none p-1 break-words w-full flex items-center justify-center ${getTextClass(card.content)}`}>
                    {card.content}
                </span>
            </div>
        )
    }

    // Image Type
    if (imgError) {
        return (
            <div className="w-full h-full flex items-center justify-center overflow-hidden relative">
                <span className={`font-bold text-slate-700 text-center leading-tight select-none p-1 break-words absolute inset-0 flex items-center justify-center ${getTextClass(card.fallbackText || '')}`}>
                    {card.fallbackText}
                </span>
            </div>
        )
    }

    return (
        <div className="w-full h-full flex items-center justify-center overflow-hidden relative">
            <img
                src={card.content}
                alt="match"
                className="w-full h-full object-contain rounded-lg"
                onError={() => setImgError(true)}
            />
        </div>
    )
}

export default CoolPairGame
