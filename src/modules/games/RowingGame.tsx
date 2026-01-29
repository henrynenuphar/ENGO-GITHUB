import React, { useState } from 'react'
import { GameContainer } from './components/GameContainer'
import { Question } from '@/types'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/Card'

interface RowingGameProps {
    data: {
        questions: Question[]
    }
    onComplete: (score: number) => void
    onExit?: () => void
}

const RowingGame: React.FC<RowingGameProps> = ({ data, onComplete, onExit }) => {
    if (!data?.questions || data.questions.length === 0) return <div>No questions loaded</div>

    const [index, setIndex] = useState(0)
    const [score, setScore] = useState(0)
    const [isPaused, setIsPaused] = useState(false)
    const [boatState, setBoatState] = useState<'normal' | 'fast' | 'slow'>('normal')
    const [selectedOption, setSelectedOption] = useState<number | null>(null);

    const currentQuestion = data.questions[index]

    const handleAnswer = (optionIndex: number) => {
        if (selectedOption !== null) return; // Prevent double click
        setSelectedOption(optionIndex);

        const isCorrect = optionIndex === currentQuestion.correctIndex;
        if (isCorrect) {
            setScore(prev => prev + 10)
            setBoatState('fast')
        } else {
            setScore(prev => prev + 2) // +2 for participation
            setBoatState('slow')
        }

        setTimeout(() => {
            if (index < data.questions.length - 1) {
                setIndex(prev => prev + 1)
                setSelectedOption(null)
                setBoatState('normal')
            } else {
                onComplete(score + (isCorrect ? 10 : 2))
            }
        }, 1500)
    }

    return (
        <GameContainer
            title="Rowing Adventure"
            score={score}
            isPaused={isPaused}
            setIsPaused={setIsPaused}

            onRestart={() => { setIndex(0); setScore(0); setIsPaused(false); }}
            onExit={onExit}
        >
            <div className="h-full flex flex-col bg-sky-100 relative overflow-hidden">
                {/* Visual Scene */}
                <div className="flex-1 relative flex items-center justify-center">
                    <div className="absolute inset-0 bg-blue-300 opacity-30 animate-pulse"></div>
                    {/* Water/Boat Animation Placeholder */}
                    <motion.div
                        animate={{
                            x: boatState === 'fast' ? 100 : (boatState === 'slow' ? -50 : 0),
                            scale: boatState === 'fast' ? 1.1 : 1
                        }}
                        className="text-8xl relative z-10 transition-transform duration-500"
                    >
                        🛶
                        <span className="text-4xl absolute -top-4 left-4">🐧</span>
                    </motion.div>

                    {/* Feedback Text */}
                    {selectedOption !== null && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`absolute top-10 px-6 py-2 rounded-full font-bold text-white shadow-lg
                                ${selectedOption === currentQuestion.correctIndex ? 'bg-green-500' : 'bg-red-500'}
                            `}
                        >
                            {selectedOption === currentQuestion.correctIndex ? 'Speed Up! 🚀' : 'Slow Down... 🐢'}
                        </motion.div>
                    )}
                </div>

                {/* Question Area */}
                <div className="bg-white p-6 rounded-t-3xl shadow-2xl relative z-20">
                    <h3 className="text-xl font-bold text-slate-700 mb-6 text-center">{currentQuestion.text}</h3>

                    <div className="grid grid-cols-1 gap-3">
                        {currentQuestion.options.map((option, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleAnswer(idx)}
                                disabled={selectedOption !== null}
                                className={`
                                    w-full p-4 rounded-xl text-left font-semibold text-lg border-2 transition-all
                                    ${selectedOption === null
                                        ? 'border-slate-100 bg-slate-50 hover:border-brand-blue hover:bg-blue-50'
                                        : (idx === currentQuestion.correctIndex
                                            ? 'border-green-500 bg-green-100 text-green-700'
                                            : (idx === selectedOption ? 'border-red-500 bg-red-100 text-red-700' : 'opacity-50')
                                        )
                                    }
                                `}
                            >
                                {String.fromCharCode(65 + idx)}. {option}
                            </button>
                        ))}
                    </div>

                    <div className="mt-4 text-center text-slate-400 text-sm">
                        Question {index + 1} of {data.questions.length}
                    </div>
                </div>
            </div>
        </GameContainer>
    )
}

export default RowingGame
