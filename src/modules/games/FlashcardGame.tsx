import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Vocabulary } from '@/types'
import { Button } from '@/components/ui/Button'
import { ChevronLeft, ChevronRight, Volume2, RotateCw, CheckCircle, Trophy } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { toast } from 'sonner'

interface FlashcardGameProps {
    data: {
        words: Vocabulary[]
    }
    onComplete: (score: number) => void
    onExit?: () => void
}

const FlashcardGame: React.FC<FlashcardGameProps> = ({ data, onComplete, onExit }) => {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isFlipped, setIsFlipped] = useState(false)
    const [isCompleted, setIsCompleted] = useState(false)

    // Safety check with mock data fallback if data is missing
    const words = data?.words || []
    const currentWord = words[currentIndex]
    const totalWords = words.length

    if (totalWords === 0) return <div>No vocabulary data found.</div>

    const playAudio = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (currentWord.audio) {
            const audio = new Audio(currentWord.audio)
            audio.play().catch(() => toast.error("Audio not found"))
        }
    }

    const handleNext = () => {
        if (currentIndex < totalWords - 1) {
            setIsFlipped(false)
            setCurrentIndex(prev => prev + 1)
        } else {
            handleFinish()
        }
    }

    const handlePrev = () => {
        if (currentIndex > 0) {
            setIsFlipped(false)
            setCurrentIndex(prev => prev - 1)
        }
    }

    const handleFinish = () => {
        setIsCompleted(true)
        // Celebration animation could go here, for now just a delay then onComplete
        // We'll let the user click the button in the completion view to actually exit
    }

    if (isCompleted) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-6 space-y-6 text-center animate-in fade-in zoom-in duration-500 bg-white">
                <div className="w-32 h-32 bg-yellow-100 rounded-full flex items-center justify-center mb-4 shadow-xl ring-8 ring-yellow-50">
                    <Trophy size={64} className="text-yellow-500 animate-bounce" />
                </div>
                <h2 className="text-3xl font-bold text-slate-800">Tuyệt vời!</h2>
                <p className="text-slate-500 text-lg">Bạn đã học xong {totalWords} từ vựng mới.</p>
                <Button onClick={() => onComplete(30)} size="lg" className="bg-green-500 hover:bg-green-600 shadow-lg hover:scale-105 transition-transform">
                    Chơi Game Ngay! <ChevronRight className="ml-2" />
                </Button>
            </div>
        )
    }

    return (
        <div className="h-full flex flex-col bg-slate-50 relative overflow-hidden font-sans pt-16">
            {/* Progress Bar */}
            <div className="px-6 py-4 flex items-center justify-between shrink-0">
                <span className="text-sm font-bold text-slate-400">Word {currentIndex + 1} of {totalWords}</span>
                <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-brand-blue transition-all duration-300"
                        style={{ width: `${((currentIndex + 1) / totalWords) * 100}%` }}
                    />
                </div>
            </div>

            {/* Card Container - ~65-70% Height */}
            <div className="flex-1 flex items-center justify-center p-4 min-h-0 relative z-10">
                <div className="w-full max-w-sm h-full max-h-[85%] relative perspective-1000 group cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
                    <motion.div
                        className="w-full h-full relative preserve-3d transition-all duration-500"
                        animate={{ rotateY: isFlipped ? 180 : 0 }}
                        initial={false}
                    >
                        {/* Front Side */}
                        <Card className="absolute inset-0 backface-hidden flex flex-col items-center p-4 bg-white shadow-xl rounded-3xl border-2 border-slate-100 overflow-hidden">
                            <div className="flex-1 flex flex-col items-center justify-center space-y-3 w-full text-center">
                                {/* Image Removed */}

                                {/* Word & IPA */}
                                <div className="space-y-1">
                                    <h2 className="text-3xl font-black text-slate-800 tracking-tight leading-tight">{currentWord.word}</h2>
                                    {currentWord.ipa && (
                                        <p className="text-slate-400 font-mono text-base">{currentWord.ipa}</p>
                                    )}
                                </div>

                                {/* Audio */}
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={playAudio}
                                    className="rounded-full px-6 py-1.5 h-auto border-brand-blue/30 text-brand-blue hover:bg-brand-blue/5 text-sm"
                                >
                                    <Volume2 size={16} className="mr-2" /> Listen (US)
                                </Button>

                                {/* Example (Now on Front) */}
                                <div className="bg-slate-50 p-3 rounded-2xl w-full border border-slate-100 mt-1 flex-1 flex flex-col justify-center max-h-[45%]">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block text-left">Example</span>
                                    <p className="text-base font-medium leading-relaxed text-slate-700 text-left italic line-clamp-4">
                                        {(() => {
                                            const sentence = currentWord.exampleSentence || ""
                                            const target = currentWord.pastTense || currentWord.word
                                            if (!target) return `"${sentence}"`
                                            const parts = sentence.split(new RegExp(`(${target})`, 'gi'))
                                            if (parts.length > 1) {
                                                return <>{parts.map((p, i) => p.toLowerCase() === target.toLowerCase() ? <span key={i} className="text-brand-blue font-extrabold not-italic">{p}</span> : p)}</>
                                            }
                                            const lastWord = target.split(' ').pop()
                                            if (lastWord && sentence.toLowerCase().includes(lastWord.toLowerCase())) {
                                                const parts2 = sentence.split(new RegExp(`(${lastWord})`, 'gi'))
                                                return <>{parts2.map((p, i) => p.toLowerCase() === lastWord.toLowerCase() ? <span key={i} className="text-brand-blue font-extrabold not-italic">{p}</span> : p)}</>
                                            }
                                            return `"${sentence}"`
                                        })()}
                                    </p>
                                </div>
                            </div>
                            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-2 flex items-center gap-1 animate-pulse shrink-0">
                                <RotateCw size={10} /> Tap for Meaning
                            </p>
                        </Card>

                        {/* Back Side */}
                        <Card className="absolute inset-0 backface-hidden rotate-y-180 flex flex-col items-center p-8 bg-gradient-to-br from-brand-blue to-blue-600 text-white shadow-xl rounded-3xl border-2 border-brand-blue">
                            <div className="flex-1 flex flex-col items-center justify-center space-y-8 text-center w-full">
                                {/* Main Meaning - Only this is shown as requested */}
                                <div className="space-y-4">
                                    <h4 className="text-4xl font-black text-yellow-300 leading-tight">
                                        {currentWord.meaning}
                                    </h4>
                                </div>

                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={playAudio}
                                    className="text-white/80 hover:bg-white/20 hover:text-white border border-white/30 rounded-full px-6 transition-all"
                                >
                                    <Volume2 size={24} className="mr-2" /> Listen Again
                                </Button>
                            </div>
                            <p className="text-xs font-bold text-white/50 uppercase tracking-widest mt-4 flex items-center gap-1 shrink-0">
                                <RotateCw size={12} /> Tap to flip back
                            </p>
                        </Card>
                    </motion.div>
                </div>
            </div>

            {/* Navigation */}
            <div className="p-6 pb-8 flex justify-between items-center max-w-sm mx-auto w-full z-20 shrink-0">
                <Button
                    variant="ghost"
                    size="lg"
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                    className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 disabled:opacity-20 p-0 h-14 w-14 rounded-full border-2 border-transparent hover:border-slate-200"
                >
                    <ChevronLeft size={32} />
                </Button>

                {currentIndex === totalWords - 1 ? (
                    <Button
                        size="lg"
                        onClick={handleNext}
                        className="bg-green-500 hover:bg-green-600 text-white px-8 h-14 rounded-full shadow-lg shadow-green-500/20 text-lg font-bold transform transition-transform hover:scale-105 active:scale-95"
                    >
                        Complete <CheckCircle className="ml-2" />
                    </Button>
                ) : (
                    <Button
                        size="lg"
                        onClick={handleNext}
                        className="bg-brand-blue hover:bg-blue-600 text-white px-0 h-14 w-14 rounded-full shadow-lg shadow-blue-500/20 flex items-center justify-center transform transition-transform hover:scale-105 active:scale-95"
                    >
                        <ChevronRight size={32} />
                    </Button>
                )}
            </div>
        </div>
    )
}

export default FlashcardGame
