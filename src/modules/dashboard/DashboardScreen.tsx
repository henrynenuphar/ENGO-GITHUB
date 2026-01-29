import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Mascot } from '@/components/common/Mascot'
import { Play, Star, Moon, Sun, Timer } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useNavigate } from 'react-router-dom'
import { COURSES } from '@/data/courses'
import { useDarkMode } from '@/hooks/useDarkMode'
import { FocusModal } from '@/components/common/FocusModal'
import { useFocus } from '@/context/FocusContext'
import { useAuth } from '@/context/UserContext'

const DashboardScreen = () => {
    const navigate = useNavigate()
    const { isDark, toggle } = useDarkMode()
    const { isActive } = useFocus()
    const { user } = useAuth()
    const [showFocusModal, setShowFocusModal] = useState(false)

    // Check if we should show the focus modal
    useEffect(() => {
        const hasSeenPrompt = sessionStorage.getItem('hasSeenFocusPrompt')

        if (!isActive && !hasSeenPrompt) {
            const timer = setTimeout(() => {
                setShowFocusModal(true)
            }, 1000)
            return () => clearTimeout(timer)
        }
    }, [isActive])

    const handleCloseModal = () => {
        setShowFocusModal(false)
        sessionStorage.setItem('hasSeenFocusPrompt', 'true')
    }

    // Calculate Active Lesson Progress for "Smart Sync"
    const lessonProgressData = React.useMemo(() => {
        if (!user?.enrolledCourses || user.enrolledCourses.length === 0) return { completed: 0, total: 3 } // Default 3

        // Find most recently accessed course
        const activeEnrollment = [...user.enrolledCourses].sort((a, b) => b.lastAccessed - a.lastAccessed)[0]
        const course = COURSES[activeEnrollment.courseId]
        if (!course) return { completed: 0, total: 3 }

        const lesson = course.lessons[activeEnrollment.currentLessonIndex] || course.lessons[course.lessons.length - 1]
        const progress = activeEnrollment.lessonProgress?.[lesson.id]

        const total = 1 + (lesson.games ? lesson.games.length : 0) // Video + Games

        if (!progress) return { completed: 0, total }

        const videoCount = progress.videoCompleted ? 1 : 0
        const gamesCount = progress.gameScores ? Object.keys(progress.gameScores).length : 0

        return { completed: videoCount + gamesCount, total }
    }, [user])

    const dailyStats = React.useMemo(() => {
        // Base daily count from DB
        let dbCount = 0
        if (user?.lastDailyDate) {
            const lastDate = new Date(user.lastDailyDate)
            const today = new Date()
            const isSameDay = lastDate.getDate() === today.getDate() &&
                lastDate.getMonth() === today.getMonth() &&
                lastDate.getFullYear() === today.getFullYear()
            if (isSameDay) dbCount = user.dailyLessonCount || 0
        }

        // Sync with current lesson progress (User Expectation)
        const currentCount = Math.max(dbCount, lessonProgressData.completed)

        return {
            completed: currentCount,
            total: lessonProgressData.total
        }
    }, [user, lessonProgressData])

    // const DAILY_TARGET = 3 // Removed in favor of dynamic total

    return (
        <div className="space-y-6 relative">
            {/* Focus Mode Pop-up */}
            <FocusModal isOpen={showFocusModal} onClose={handleCloseModal} />

            {/* Header with Greeting & Dark Mode Toggle */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Mascot mood="happy" size="sm" />
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Chào {user?.name || 'bé'}! 👋</h1>
                        <p className="text-brand-blue font-bold">Chúc con một ngày vui!</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Focus Mode Toggle */}
                    <button
                        onClick={() => setShowFocusModal(true)}
                        className={`p-3 rounded-full shadow-sm transition-all ${isActive
                            ? 'bg-brand-orange text-white animate-pulse shadow-md shadow-orange-200'
                            : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-yellow-400'
                            }`}
                        title={isActive ? "Đang tập trung" : "Chế độ tập trung"}
                    >
                        <Timer size={20} />
                    </button>

                    <button
                        onClick={toggle}
                        className="p-3 bg-white dark:bg-slate-800 rounded-full shadow-sm text-slate-500 dark:text-yellow-400 transition-colors"
                    >
                        {isDark ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                </div>
            </div>

            {/* Daily Progress Card */}
            {user?.enrolledCourses && user?.enrolledCourses.length > 0 && (
                <Card className="bg-gradient-to-r from-brand-blue to-brand-darkBlue text-white border-none relative overflow-hidden dark:shadow-none">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-10 translate-x-10 blur-xl"></div>
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-lg flex items-center gap-2">Mục tiêu hôm nay 🔥</h3>
                                <span className="text-white/80 text-sm">
                                    {dailyStats.completed}/{dailyStats.total} Bài học hoàn thành
                                </span>
                            </div>
                            <div className="bg-white/20 p-2 rounded-lg">
                                <Star className="text-yellow-300 fill-yellow-300" />
                            </div>
                        </div>

                        {/* Simple Progress Bar */}
                        <div className="w-full h-3 bg-black/20 rounded-full mb-2 overflow-hidden">
                            <div
                                className="h-full bg-brand-yellow rounded-full transition-all duration-1000"
                                style={{ width: `${Math.min((dailyStats.completed / dailyStats.total) * 100, 100)}%` }}
                            ></div>
                        </div>

                        <p className="text-xs text-center mt-2 font-bold text-white/90">
                            "Cố lên nhé! Con đang làm rất tốt!" - Penguin 🐧
                        </p>
                    </div>
                </Card>
            )}

            {/* Continue Learning Course */}
            {user?.enrolledCourses && user.enrolledCourses.length > 0 && (
                <div>
                    <h2 className="font-bold text-lg text-slate-700 dark:text-slate-200 mb-3">Tiếp tục học</h2>
                    {(() => {
                        // Find most recently accessed course
                        const activeEnrollment = [...user.enrolledCourses].sort((a, b) => b.lastAccessed - a.lastAccessed)[0]
                        const course = COURSES[activeEnrollment.courseId]

                        if (!course) return null

                        const isCompleted = activeEnrollment.currentLessonIndex >= course.lessons.length
                        const currentLesson = isCompleted ? course.lessons[course.lessons.length - 1] : course.lessons[activeEnrollment.currentLessonIndex]

                        return (
                            <Card
                                variant="interactive"
                                className="flex items-center gap-4 dark:bg-slate-800 dark:border-slate-700 transition-all hover:scale-[1.02]"
                                onClick={() => navigate('/app/study')}
                            >
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${course.coverColor} ${course.iconColor} dark:bg-opacity-20`}>
                                    <Play fill="currentColor" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <h3 className="font-bold text-slate-800 dark:text-white line-clamp-1">
                                            {isCompleted ? `${course.title} - Hoàn thành` : currentLesson.title}
                                        </h3>
                                        {user.enrolledCourses.length > 1 && (
                                            <span className="text-[10px] bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-500 font-bold border border-slate-200 dark:border-slate-600">
                                                {course.grade === 5 ? 'Lớp 5' : 'Lớp 4'}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-400 line-clamp-1">
                                        {isCompleted
                                            ? "Chúc mừng con đã hoàn thành xuất sắc!"
                                            : currentLesson.description}
                                    </p>
                                </div>
                                <Button size="sm" variant="secondary">
                                    {activeEnrollment.currentLessonIndex === 0 ? "Bắt đầu" : "Học tiếp"}
                                </Button>
                            </Card>
                        )
                    })()}
                </div>
            )}

            {/* Quick Actions / Study Plan Preview */}
            <div className="grid grid-cols-2 gap-4">
                {['Từ vựng', 'Nói'].map((skill) => (
                    <Card key={skill} className="p-4 bg-blue-50 dark:bg-slate-800 dark:border-slate-700 border-none flex flex-col items-center gap-2">
                        <div className="w-10 h-10 bg-white dark:bg-slate-700 rounded-full flex items-center justify-center text-brand-blue shadow-sm">
                            <Star size={16} />
                        </div>
                        <span className="font-bold text-slate-700 dark:text-slate-200">{skill}</span>
                    </Card>
                ))}
            </div>
        </div>
    )
}

export default DashboardScreen
