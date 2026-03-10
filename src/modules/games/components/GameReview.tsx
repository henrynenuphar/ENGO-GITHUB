import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export interface ReviewItem {
    question: string
    userAnswer: string
    correctAnswer: string
    isCorrect: boolean
}

interface GameReviewProps {
    items: ReviewItem[]
    onContinue: () => void
    title?: string
}

export const GameReview: React.FC<GameReviewProps> = ({
    items,
    onContinue,
    title = "Xem lại bài làm"
}) => {
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null)
    const correctCount = items.filter(i => i.isCorrect).length

    return (
        <div className="absolute inset-0 z-50 bg-slate-50 flex flex-col items-center p-4 md:p-6 overflow-hidden font-sans">

            {/* Header */}
            <div className="w-full max-w-2xl bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4 shrink-0 mt-2 z-10 relative">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-blue-50 border-2 border-blue-100 flex items-center justify-center relative overflow-hidden">
                        {/* Fake pie chart visual based on score */}
                        <svg viewBox="0 0 36 36" className="w-12 h-12 transform -rotate-90">
                            <path
                                className="text-slate-200"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="4"
                            />
                            <path
                                className="text-green-500 transition-all duration-1000 ease-out"
                                strokeDasharray={`${(correctCount / items.length) * 100}, 100`}
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="4"
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center font-black text-xs text-slate-700">
                            {correctCount}/{items.length}
                        </div>
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 leading-tight">{title}</h2>
                        <p className="text-slate-500 font-medium text-sm">
                            Cùng xem lại những câu con đã làm nhé!
                        </p>
                    </div>
                </div>

                <Button
                    onClick={onContinue}
                    className="bg-brand-blue hover:bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-blue-500/30 whitespace-nowrap hidden md:flex"
                >
                    Tiếp tục <ArrowRight size={18} className="ml-2" />
                </Button>
            </div>

            {/* List */}
            <div className="w-full max-w-2xl flex-1 mt-6 overflow-y-auto z-10 pb-24 md:pb-6 scrollbar-hide">
                <div className="space-y-3">
                    {items.map((item, idx) => {
                        const isExpanded = expandedIndex === idx;
                        return (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className={`
                                    bg-white border-2 rounded-2xl overflow-hidden transition-all duration-300
                                    ${item.isCorrect ? 'border-green-100 hover:border-green-300' : 'border-red-100 hover:border-red-300'}
                                    ${isExpanded ? 'shadow-md' : 'shadow-sm'}
                                `}
                            >
                                {/* Item Header */}
                                <div
                                    className="p-4 flex items-start gap-3 cursor-pointer select-none"
                                    onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                                >
                                    <div className="shrink-0 mt-0.5">
                                        {item.isCorrect
                                            ? <CheckCircle className="text-green-500" size={24} />
                                            : <XCircle className="text-red-500" size={24} />
                                        }
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                                            Câu {idx + 1}
                                        </div>
                                        <p className="text-slate-800 font-bold text-base leading-snug break-words">
                                            {item.question}
                                        </p>
                                    </div>
                                    <div className="shrink-0 text-slate-300 ml-2 mt-1">
                                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                    </div>
                                </div>

                                {/* Expanded Detail */}
                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="px-4 pb-4 pt-0 border-t border-slate-50 mt-2 bg-slate-50/50">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                                    {/* User Answer */}
                                                    <div className="space-y-1">
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Câu trả lời của bạn</span>
                                                        <div className={`p-3 rounded-xl border-2 font-medium break-words ${item.isCorrect ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                                                            {item.userAnswer || "— Không trả lời —"}
                                                        </div>
                                                    </div>

                                                    {/* Correct Answer (only show if wrong) */}
                                                    {!item.isCorrect && (
                                                        <div className="space-y-1">
                                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Đáp án đúng</span>
                                                            <div className="p-3 rounded-xl border-2 bg-green-50 border-green-200 text-green-700 font-bold break-words">
                                                                {item.correctAnswer}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        )
                    })}
                </div>
            </div>

            {/* Mobile Action Bar */}
            <div className="md:hidden absolute bottom-4 left-4 right-4 z-20">
                <Button
                    onClick={onContinue}
                    className="w-full bg-brand-blue hover:bg-blue-600 text-white h-14 rounded-2xl font-black shadow-xl shadow-blue-500/30 flex items-center justify-center text-lg"
                >
                    TIẾP TỤC <ArrowRight size={20} className="ml-2" />
                </Button>
            </div>

            {/* Soft fade at bottom of list */}
            <div className="absolute bottom-0 w-full h-12 bg-gradient-to-t from-slate-50 to-transparent pointer-events-none z-10" />
        </div>
    )
}
