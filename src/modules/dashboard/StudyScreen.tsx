import { useState } from 'react'
import { GRADE_5_LESSONS } from '@/data/grade5'
import { Lesson } from '@/types'
import { ChevronRight, Trophy, Lock, PlayCircle, Star } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import StudyPlanSetup from '../study/StudyPlanSetup'

const StudyScreen = () => {
    const navigate = useNavigate()
    const [selectedLesson, setSelectedLesson] = useState<string | null>(null)

    // Check localStorage for persisted plan status
    const [hasPlan, setHasPlan] = useState(() => {
        return localStorage.getItem('engo_study_plan_done') === 'true'
    })

    // Get Schedule from Storage
    const scheduleDays = JSON.parse(localStorage.getItem('engo_study_schedule') || '["Mon", "Wed", "Fri"]') as string[]

    const getLessonDate = (lessonIndex: number) => {
        const daysMap: { [key: string]: number } = { 'Sun': 0, 'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6 }
        const targetDays = scheduleDays.map(d => daysMap[d]).sort((a, b) => a - b)

        let currentDate = new Date()
        let count = 0

        // Find next valid lesson date
        // Simple algorithm: iterate days until we find enough slots
        // Optimization: For lessonIndex 0, find first match >= today. For lessonIndex N, continue from there.
        // Actually for simplicity in this mock: 
        // Lesson 0 = Next valid day from today.
        // Lesson N = Next valid day after Lesson N-1.

        // Let's just calculate "offset" from today.
        // This acts as a projection starting today.

        let calculatedDate = new Date()
        let lessonsScheduled = 0

        // Look ahead up to 365 days
        for (let i = 0; i < 365; i++) {
            let d = new Date()
            d.setDate(d.getDate() + i)
            const dayOfWeek = d.getDay()

            if (targetDays.includes(dayOfWeek)) {
                if (lessonsScheduled === lessonIndex) {
                    calculatedDate = d
                    break
                }
                lessonsScheduled++
            }
        }

        const dayName = calculatedDate.toLocaleDateString('vi-VN', { weekday: 'short' })
        const dateStr = calculatedDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
        return `${dayName}, ${dateStr}`
    }

    const handlePlanComplete = () => {
        localStorage.setItem('engo_study_plan_done', 'true')
        setHasPlan(true)
    }

    const resetPlan = () => {
        if (confirm('Bạn có chắc muốn thiết lập lại lộ trình học không?')) {
            localStorage.removeItem('engo_study_plan_done')
            setHasPlan(false)
        }
    }

    if (!hasPlan) {
        return <StudyPlanSetup onComplete={handlePlanComplete} />
    }

    const handleLessonPress = (lesson: Lesson) => {
        if (lesson.isLocked) {
            toast.error('Bài học này chưa mở khóa! Hãy hoàn thành bài trước nhé.')
            return
        }

        // If expanding/collapsing logic is desired:
        setSelectedLesson(prev => prev === lesson.id ? null : lesson.id)

        // For now, let's navigate to a detail screen if implemented, or just expand
        // If we want to navigate:
        // navigate(`/app/study/${lesson.id}`)
    }

    const startLesson = (lessonId: string) => {
        navigate(`/app/study/${lessonId}`)
    }

    return (
        <div className="p-4 space-y-6 pb-24">
            <header className="mb-6 flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Lộ Trình Học Lớp 5</h1>
                    <p className="text-slate-500">Hoàn thành 12 Unit để chinh phục tiếng Anh nhé!</p>
                </div>
                <button onClick={resetPlan} className="text-xs text-brand-blue font-bold underline bg-blue-50 px-2 py-1 rounded">
                    Thiết lập lại
                </button>
            </header>

            <div className="space-y-4">
                {GRADE_5_LESSONS.map((lesson, index) => {
                    const isExpanded = selectedLesson === lesson.id
                    const lessonDate = getLessonDate(index)

                    return (
                        <motion.div
                            key={lesson.id}
                            layout
                            className={`bg-white rounded-2xl overflow-hidden border-2 transition-colors ${selectedLesson === lesson.id ? 'border-brand-blue shadow-md' : 'border-slate-100 hover:border-indigo-100'}`}
                        >
                            <div
                                className="p-4 flex items-center gap-4 cursor-pointer relative"
                                onClick={() => handleLessonPress(lesson)}
                            >
                                {/* Thumbnail / Icon */}
                                <div className={`w-16 h-16 rounded-xl flex-shrink-0 flex items-center justify-center text-2xl font-bold text-white relative overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600`}>
                                    {index + 1}
                                </div>

                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <span className="text-[10px] font-bold text-brand-blue bg-blue-50 px-2 py-0.5 rounded-full mb-1 inline-block">
                                            {lessonDate}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-lg text-slate-800">
                                        {lesson.title}
                                    </h3>
                                    <p className="text-sm text-slate-500 line-clamp-1">{lesson.description}</p>
                                </div>

                                <ChevronRight
                                    className={`text-slate-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                                />
                            </div>

                            {/* Expanded Content (Steps) */}
                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="bg-slate-50 px-4 pb-4"
                                    >
                                        <div className="pt-2 space-y-2">
                                            <div className="w-full h-[1px] bg-slate-200 mb-3" />
                                            {/* Video Step */}
                                            {lesson.videoUrl && (
                                                <div
                                                    onClick={(e) => { e.stopPropagation(); startLesson(lesson.id); }}
                                                    className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-100 cursor-pointer hover:border-indigo-200 transition-colors"
                                                >
                                                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-red-100 text-red-600">
                                                        <PlayCircle size={20} />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-semibold text-slate-700 text-sm">Video Lecture</p>
                                                        <p className="text-xs text-slate-400">Video</p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Games Steps */}
                                            {lesson.games.map((game) => (
                                                <div
                                                    key={game.id}
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        startLesson(lesson.id)
                                                    }}
                                                    className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-100 cursor-pointer hover:border-indigo-200 transition-colors"
                                                >
                                                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-100 text-blue-600">
                                                        <Trophy size={20} />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-semibold text-slate-700 text-sm">{game.title}</p>
                                                        <p className="text-xs text-slate-400 capitalize">{game.type.replace('-', ' ')}</p>
                                                    </div>
                                                </div>
                                            ))}

                                            <div className="mt-4 text-center">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); startLesson(lesson.id); }}
                                                    className="text-brand-blue font-bold text-sm hover:underline"
                                                >
                                                    Vào học ngay →
                                                </button>
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
    )
}

export default StudyScreen
