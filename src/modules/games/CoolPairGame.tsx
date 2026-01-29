import React, { useState, useEffect } from 'react'
import { GameContainer } from './components/GameContainer'
import { Vocabulary } from '@/types'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/Card'
import { Check, X } from 'lucide-react'

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
        return (
            <GameContainer title="Cool Pair Matching" score={score} isPaused={false} setIsPaused={() => { }} onRestart={setupGame} hideHeader hideScore>
                <div className="h-full flex flex-col items-center justify-center space-y-6 animate-in fade-in zoom-in duration-500 bg-brand-lightBlue p-8">
                    <div className="w-32 h-32 bg-green-100 rounded-full flex items-center justify-center mb-4 shadow-xl ring-8 ring-green-50">
                        <Check size={64} className="text-green-500 animate-bounce" />
                    </div>
                    <div className="text-center space-y-2">
                        <h2 className="text-3xl font-black text-slate-800">Xuất sắc! 🎉</h2>
                        <p className="text-slate-500 text-lg font-medium">Bạn đã hoàn thành trò chơi</p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 w-full max-w-xs text-center transform rotate-1">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Score</span>
                        <p className="text-5xl font-black text-brand-blue">{score}</p>
                    </div>

                    <button
                        onClick={() => onComplete(score)}
                        className="w-full max-w-xs bg-brand-orange hover:bg-orange-600 text-white py-4 rounded-xl text-xl font-bold shadow-lg shadow-orange-500/20 transform transition-transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                    >
                        Game Tiếp Theo <X className="rotate-45" />
                    </button>
                </div>
            </GameContainer>
        )
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
            headerContent={<div className="font-mono text-white/90 text-sm font-bold bg-white/20 px-2 py-0.5 rounded-md flex items-center gap-1">⏱ {formatTime(timeLeft)}</div>}
        >
            <div className="h-full w-full flex flex-col items-center justify-between p-2 pt-4 pb-6 overflow-hidden">
                {/* Cards Grid */}
                <div className={`grid ${gridCols} gap-2 w-full max-w-[400px] flex-1 content-center justify-items-center`}>
                    {cards.map((card, idx) => (
                        <motion.div
                            key={card.uniqueId}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: card.isMatched ? 0.9 : 1, opacity: card.isMatched ? 0.5 : 1 }}
                            whileTap={!card.isFlipped && !card.isMatched ? { scale: 0.95 } : {}}
                            onClick={() => handleCardClick(idx)}
                            className="w-full aspect-square perspective-1000 relative"
                        >
                            <div className={`
                                w-full h-full relative transition-all duration-500 preserve-3d cursor-pointer
                                ${card.isFlipped ? 'rotate-y-180' : ''}
                            `}>
                                {/* Front (Hidden) */}
                                <div className={`
                                    absolute inset-0 bg-white rounded-xl shadow-sm border-b-4 border-slate-200
                                    flex items-center justify-center backface-hidden group hover:border-brand-blue/50
                                    ${card.isFlipped ? 'hidden-face' : ''}
                                `}>
                                    <span className="text-3xl font-black text-brand-lightBlue opacity-50 select-none">?</span>
                                </div>

                                {/* Back (Revealed) */}
                                <div className={`
                                    absolute inset-0 bg-white rounded-xl shadow-md border-2 
                                    ${card.isMatched ? 'border-green-500 ring-2 ring-green-100' : 'border-brand-blue'}
                                    flex items-center justify-center rotate-y-180 backface-hidden p-1
                                    ${card.isFlipped || card.isMatched ? '' : 'hidden-face'}
                                `}>
                                    <div className="w-full h-full flex items-center justify-center overflow-hidden">
                                        {card.type === 'image' ? (
                                            <>
                                                <img
                                                    src={card.content}
                                                    alt="match"
                                                    className="w-full h-full object-cover rounded-lg"
                                                    onError={(e) => {
                                                        e.currentTarget.style.display = 'none'
                                                        // Show fallback text
                                                        const fallback = e.currentTarget.parentElement?.querySelector('.fallback-text')
                                                        if (fallback) fallback.classList.remove('hidden')
                                                    }}
                                                />
                                                <span className="fallback-text hidden text-xs font-bold text-slate-700 text-center leading-tight select-none break-words px-1 absolute inset-0 flex items-center justify-center">
                                                    {card.fallbackText}
                                                </span>
                                            </>
                                        ) : (
                                            <span className="text-xs font-bold text-slate-700 text-center leading-tight select-none break-words px-1">{card.content}</span>
                                        )}
                                    </div>

                                    {card.isMatched && (
                                        <div className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full p-0.5 shadow-sm">
                                            <Check size={10} strokeWidth={4} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Bottom Info Bar: Score */}
                <div className="w-full max-w-[400px] bg-white rounded-2xl p-3 shadow-lg border border-slate-100 flex items-center justify-between mt-2 shrink-0 z-10">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Current Score</span>
                    <span className="text-2xl font-black text-brand-orange">{score}</span>
                </div>
            </div>
        </GameContainer>
    )
}

export default CoolPairGame
