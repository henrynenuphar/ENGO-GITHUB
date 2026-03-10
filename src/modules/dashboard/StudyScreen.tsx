import { useState, useEffect } from 'react'
import { COURSES } from '@/data/courses'
import { Lesson } from '@/types'
import { ChevronRight, Trophy, Lock, PlayCircle, Star } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'sonner'

import StudyPlanSetup from '../study/StudyPlanSetup'
import { useAuth } from '@/context/UserContext'

const StudyScreen = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const { user } = useAuth()
    const [selectedLesson, setSelectedLesson] = useState<string | null>(null)

    // Check localStorage for persisted plan status
    const [hasPlan, setHasPlan] = useState(() => {
        return localStorage.getItem('engo_study_plan_done') === 'true'
    })

    const targetCourseId = location.state?.courseId

    // Get active course (default to first active, or selectable)
    // We add local state to select which course is active
    const [selectedCourseIndex, setSelectedCourseIndex] = useState(() => {
        if (!user?.enrolledCourses || !targetCourseId) return 0;
        const index = user.enrolledCourses.findIndex(c => c.courseId === targetCourseId);
        return index >= 0 ? index : 0;
    })

    useEffect(() => {
        if (targetCourseId && user?.enrolledCourses) {
            const index = user.enrolledCourses.findIndex(c => c.courseId === targetCourseId);
            if (index >= 0) {
                setSelectedCourseIndex(index);
            }
        }
    }, [targetCourseId, user?.enrolledCourses])

    const activeEnrollment = user?.enrolledCourses?.[selectedCourseIndex]
    const activeCourseId = activeEnrollment?.courseId || 'grade-5'
    const activeCourse = COURSES[activeCourseId]
    const activeLessons = activeCourse?.lessons || []

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
        // if (confirm('Bạn có chắc muốn thiết lập lại lộ trình học không?')) {
        //     localStorage.removeItem('engo_study_plan_done')
        //     setHasPlan(false)
        navigate('/app/study/setup')
        // }
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
            <header className="mb-2 flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Lộ Trình Học {activeCourse?.title || 'Lớp 5'}</h1>
                    <p className="text-slate-500">Hoàn thành {activeLessons.length} Unit để chinh phục tiếng Anh nhé!</p>
                </div>
                <button onClick={resetPlan} className="text-xs text-brand-blue font-bold underline bg-blue-50 px-2 py-1 rounded">
                    Thiết lập lại
                </button>
            </header>

            {/* Course Switcher (only show if enrolled in > 1 course) */}
            {user?.enrolledCourses && user.enrolledCourses.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
                    {user.enrolledCourses.map((enrollment, index) => {
                        const c = COURSES[enrollment.courseId]
                        if (!c) return null
                        return (
                            <button
                                key={enrollment.courseId}
                                onClick={() => setSelectedCourseIndex(index)}
                                className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all border-2 ${selectedCourseIndex === index ? 'bg-brand-blue text-white border-brand-blue shadow-md' : 'bg-white text-slate-500 border-slate-200 hover:border-brand-blue/30'}`}
                            >
                                {c.title}
                            </button>
                        )
                    })}
                </div>
            )}

            <div className="space-y-4">
                {activeLessons.map((lesson, index) => {
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
                                <div className={`w-16 h-16 rounded-xl flex-shrink-0 flex items-center justify-center text-2xl font-bold text-white relative overflow-hidden bg-gradient-to-br from-brand-blue to-cyan-400`}>
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
