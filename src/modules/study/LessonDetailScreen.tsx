import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { GRADE_5_LESSONS } from '@/data/grade5'
import { GameType } from '@/types'
import { Button } from '@/components/ui/Button'
import { Play, CheckCircle, Star, Lock, Trophy, AlertCircle, ChevronLeft } from 'lucide-react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { useAuth } from '@/context/UserContext'

// Game Imports
import FlashcardGame from '../games/FlashcardGame'
import CoolPairGame from '../games/CoolPairGame'
import SmartMonkeyGame from '../games/SmartMonkeyGame'
import RowingGame from '../games/RowingGame'

// Mock Components for unimplemented games
const PlaceholderGame = ({ onComplete, title }: { onComplete: (score: number) => void, title: string }) => (
    <div className="h-full flex flex-col items-center justify-center space-y-4">
        <h2 className="text-2xl font-bold">{title}</h2>
        <p className="text-slate-500">Game content coming soon...</p>
        <Button onClick={() => onComplete(30)}>Simulate Win (3 Stars)</Button>
    </div>
)

const LessonDetailScreen = () => {
    const { lessonId } = useParams()
    const navigate = useNavigate()
    const { user, updateUser } = useAuth() // Moved to top
    const lesson = GRADE_5_LESSONS.find(l => l.id === lessonId)

    // State
    const [viewMode, setViewMode] = useState<'overview' | 'playing'>('overview')
    const [activeItemIndex, setActiveItemIndex] = useState<number | null>(null)

    // Helper to check if this lesson is already fully completed in history
    const isLessonPast = React.useMemo(() => {
        if (!user || !user.enrolledCourses) return false
        const enrollment = user.enrolledCourses.find(e => e.courseId === 'grade-5')
        if (!enrollment) return false
        return enrollment.currentLessonIndex >= (lesson?.order || 9999)
    }, [user, lesson])

    // Helper to get stored progress for THIS specific lesson
    const storedProgress = React.useMemo(() => {
        if (!user || !user.enrolledCourses) return null
        const enrollment = user.enrolledCourses.find(e => e.courseId === 'grade-5')
        if (!enrollment || !enrollment.lessonProgress || !lesson) return null
        return enrollment.lessonProgress[lesson.id]
    }, [user, lesson])

    // Progress State
    const [videoCompleted, setVideoCompleted] = useState(() => {
        if (isLessonPast) return true
        return storedProgress?.videoCompleted || false
    })

    const [gameScores, setGameScores] = useState<Record<string, { highest: number, average: number, count: number }>>(() => {
        if (isLessonPast && lesson) {
            const scores: Record<string, { highest: number, average: number, count: number }> = {}
            lesson.games.forEach(g => {
                scores[g.id] = { highest: 30, average: 30, count: 1 }
            })
            return scores
        }
        // Force cast access because we know it's migrated
        // @ts-ignore
        return storedProgress?.gameScores || {}
    })

    // Helper to save progress
    const saveProgress = (videoDone: boolean, scores: Record<string, { highest: number, average: number, count: number }>, xpEarned: number = 0) => {
        if (!user || !user.enrolledCourses) return

        const newEnrolledCourses = user.enrolledCourses.map(e => {
            if (e.courseId === 'grade-5') {
                const currentProgress = e.lessonProgress || {}
                const newLessonProgress = {
                    ...currentProgress,
                    [lesson!.id]: {
                        videoCompleted: videoDone,
                        gameScores: scores
                    }
                }

                return {
                    ...e,
                    lessonProgress: newLessonProgress,
                    lastAccessed: Date.now()
                }
            }
            return e
        })

        // Daily Progress Logic
        const today = new Date()
        const lastDate = user.lastDailyDate ? new Date(user.lastDailyDate) : new Date(0)
        const isSameDay = lastDate.getDate() === today.getDate() &&
            lastDate.getMonth() === today.getMonth() &&
            lastDate.getFullYear() === today.getFullYear()

        // Only increment if we earned XP from a game or finished video (xpEarned > 0 implied activity)
        // If xpEarned is 0 (video done?), count it too? videoDone implies completion.
        // Let's count if xpEarned > 0 OR videoDone is newly true (hard to track 'newly').
        // Let's rely on xpEarned > 0 OR just increment on any save that isn't empty.
        // Simplest: Increment if xpEarned > 0.
        // Wait, video completion calls saveProgress(true, gameScores) -> xpEarned default 0.
        // But video completion is a BIG event. It should count.
        const shouldCount = xpEarned > 0 || videoDone

        const newDailyCount = isSameDay
            ? ((user.dailyLessonCount || 0) + (shouldCount ? 1 : 0))
            : (shouldCount ? 1 : 0)

        // @ts-ignore
        updateUser({
            enrolledCourses: newEnrolledCourses,
            xp: (user.xp || 0) + xpEarned,
            dailyLessonCount: newDailyCount,
            lastDailyDate: Date.now()
        })
    }

    if (!lesson) return <div>Lesson not found</div>

    const enrollment = user?.enrolledCourses?.find(e => e.courseId === 'grade-5')
    const totalItems = 1 + lesson.games.length
    const completedCount = (videoCompleted ? 1 : 0) + Object.keys(gameScores).length
    const isLessonComplete = completedCount === totalItems

    // Calculate Stars (based on Average Score now)
    const videoStars = videoCompleted ? 3 : 0
    const gameStarsTotal = Object.values(gameScores).reduce((acc, stat) => {
        const score = stat.average
        if (score >= 30) return acc + 3
        if (score >= 20) return acc + 2
        if (score >= 10) return acc + 1
        return acc
    }, 0)
    const totalStars = videoStars + gameStarsTotal
    const maxStars = totalItems * 3

    // Content List Helper
    const contentList = [
        {
            type: 'video',
            id: 'video-main',
            title: 'Bài giảng Video',
            isLocked: false,
            isCompleted: videoCompleted,
            averageScore: videoCompleted ? 30 : 0
        },
        ...lesson.games.map((game, idx) => {
            const prevItemCompleted = idx === 0 ? videoCompleted : !!gameScores[lesson.games[idx - 1].id]
            const stat = gameScores[game.id]
            return {
                type: 'game',
                id: game.id,
                title: game.title,
                gameType: game.type,
                isLocked: !prevItemCompleted,
                isCompleted: !!stat,
                averageScore: stat ? stat.average : 0
            }
        })
    ]

    const handleStartItem = (index: number) => {
        const targetItem = contentList[index]
        if (targetItem.isLocked) {
            toast.error('Hãy hoàn thành phần trước nhé!')
            return
        }
        setActiveItemIndex(index)
        setViewMode('playing')
    }

    const handleVideoComplete = () => {
        setVideoCompleted(true)
        saveProgress(true, gameScores)
        toast.success("Đã hoàn thành video! Bắt đầu học từ vựng nhé.")
        setActiveItemIndex(0 + 1)
        setViewMode('playing')
    }

    const handleGameActivityComplete = (score: number) => {
        if (activeItemIndex === null) return

        const gameIndex = activeItemIndex - 1

        if (gameIndex >= 0 && gameIndex < lesson.games.length) {
            const gameId = lesson.games[gameIndex].id
            const currentStat = gameScores[gameId] || { highest: 0, average: 0, count: 0 }

            const newHighest = Math.max(currentStat.highest, score)
            const newCount = currentStat.count + 1
            // Calculate new average
            const currentTotal = currentStat.average * currentStat.count
            const newAverage = Math.round((currentTotal + score) / newCount)

            const newScores = {
                ...gameScores,
                [gameId]: { highest: newHighest, average: newAverage, count: newCount }
            }

            setGameScores(newScores)
            saveProgress(videoCompleted, newScores, score)

            // Check for Lesson Completion
            const isNowComplete = (videoCompleted ? 1 : 0) + Object.keys(newScores).length === totalItems

            if (isNowComplete) {
                if (enrollment && enrollment.currentLessonIndex < lesson.order) {
                    const newEnrolledCourses = user?.enrolledCourses.map(e => {
                        if (e.courseId === 'grade-5') {
                            return {
                                ...e,
                                currentLessonIndex: Math.max(e.currentLessonIndex, lesson.order),
                                lastAccessed: Date.now()
                            }
                        }
                        return e
                    })
                    // @ts-ignore
                    updateUser({ enrolledCourses: newEnrolledCourses })
                    toast.success("Chúc mừng! Con đã hoàn thành bài học này! 🎉")
                }
            }
        }

        toast.success(`Hoàn thành trò chơi! +${score} XP`)
        setViewMode('overview')
    }

    // --- VIEW: PLAYING ---
    if (viewMode === 'playing' && activeItemIndex !== null) {
        if (activeItemIndex === 0) {
            return (
                <div className="h-full flex flex-col bg-black text-white">
                    <div className="p-4 flex justify-between items-center">
                        <Button variant="ghost" onClick={() => setViewMode('overview')} className="text-white hover:bg-white/20">
                            <ChevronLeft /> Quay lại
                        </Button>
                        <h3 className="font-bold">Video Bài Giảng</h3>
                        <div className="w-10"></div>
                    </div>
                    <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-6">
                        <div className="w-full max-w-4xl aspect-video bg-slate-900 rounded-2xl overflow-hidden shadow-2xl relative group border border-slate-700">
                            <iframe
                                src={`https://www.youtube.com/embed/${lesson.videoUrl.split('v=')[1]}`}
                                className="w-full h-full"
                                title="Video Lecture"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        </div>
                        <div className="text-center">
                            <p className="text-slate-400 mb-4">Xem hết video để nắm kiến thức nhé!</p>
                            <Button size="lg" onClick={handleVideoComplete} className="bg-brand-orange hover:bg-orange-600 px-8 text-lg">
                                Tiếp theo <ChevronLeft className="ml-2 rotate-180" />
                            </Button>
                        </div>
                    </div>
                </div>
            )
        }

        const gameIndex = activeItemIndex - 1
        const currentGame = lesson.games[gameIndex]

        if (!currentGame) return <div>Game not found</div>

        let GameComponent
        switch (currentGame.type) {
            case GameType.FLASHCARD: GameComponent = FlashcardGame; break;
            case GameType.COOL_PAIR: GameComponent = CoolPairGame; break;
            case GameType.SMART_MONKEY: GameComponent = SmartMonkeyGame; break;
            case GameType.ROWING: GameComponent = RowingGame; break;
            default: GameComponent = null
        }

        if (!GameComponent) {
            return (
                <div className="h-full flex items-center justify-center relative">
                    <Button variant="ghost" onClick={() => setViewMode('overview')} className="absolute top-4 left-4 z-50">
                        Back
                    </Button>
                    <PlaceholderGame title={currentGame.title} onComplete={handleGameActivityComplete} />
                </div>
            )
        }

        return (
            <div className="h-full relative">
                <GameComponent
                    data={currentGame.data}
                    onComplete={handleGameActivityComplete}
                    onExit={() => setViewMode('overview')}
                />
                <div className="absolute top-4 left-4 z-50 opacity-50 hover:opacity-100 transition-opacity">
                    <Button variant="outline" size="sm" onClick={() => setViewMode('overview')}>
                        ❌ Thoát
                    </Button>
                </div>
            </div>
        )
    }

    // --- VIEW: OVERVIEW DASHBOARD ---

    return (
        <div className="h-full bg-slate-50 flex flex-col font-sans">
            {/* 1. Top Bar */}
            <div className="bg-white px-4 py-3 flex items-center justify-between shadow-sm z-10 sticky top-0">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm" onClick={() => navigate('/app/study')}>
                        <ChevronLeft className="text-slate-600" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="font-bold text-slate-800">Unit {lesson.order}</h2>
                            {!isLessonComplete && <AlertCircle size={16} className="text-orange-500" />}
                        </div>
                        <p className="text-xs text-slate-400 font-medium">{new Date().toLocaleDateString('vi-VN')}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-full">
                    <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-white text-[10px]">
                        <CheckCircle size={12} />
                    </div>
                    <span className="text-sm font-bold text-slate-600">{completedCount}/{totalItems}</span>
                </div>
            </div>

            {/* 2. Notification Area */}
            {!isLessonComplete && (
                <div className="bg-yellow-50 px-4 py-2 border-b border-yellow-100 flex items-center justify-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                    <p className="text-xs font-bold text-yellow-700">Bạn chưa hoàn thành bài học này</p>
                </div>
            )}

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* 3. Hero Card */}
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl -mr-10 -mt-10" />

                    <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                        <div className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-bold backdrop-blur-sm border border-white/10">
                            UNIT {lesson.order.toString().padStart(2, '0')} - BÀI HỌC
                        </div>

                        <h1 className="text-2xl font-black uppercase tracking-tight max-w-[80%] leading-tight">
                            {lesson.title.split(': ')[1] || lesson.title}
                        </h1>

                        <div className="grid grid-cols-2 gap-4 w-full mt-2">
                            <div className="bg-black/20 rounded-2xl p-3 flex flex-col items-center justify-center backdrop-blur-sm">
                                <span className="text-xs font-bold opacity-80 mb-1">TIẾN ĐỘ</span>
                                <div className="text-xl font-black">{completedCount}/{totalItems} <span className="text-xs font-normal opacity-70">Phần</span></div>
                            </div>
                            <div className="bg-black/20 rounded-2xl p-3 flex flex-col items-center justify-center backdrop-blur-sm relative overflow-hidden">
                                {totalStars > 0 && <div className="absolute inset-0 bg-yellow-400/20 animate-pulse" />}
                                <span className="text-xs font-bold opacity-80 mb-1">ĐIỂM SAO</span>
                                <div className="flex items-center gap-1">
                                    <span className="text-xl font-black text-yellow-300">{totalStars}/{maxStars}</span>
                                    <Star size={16} className="text-yellow-300 fill-yellow-300" />
                                </div>
                            </div>
                        </div>

                        {/* Trophy Case Placeholders */}
                        <div className="flex gap-2 mt-2 opacity-50">
                            {[1, 2, 3].map(i => (
                                <Trophy key={i} size={20} className={i === 1 && totalStars > 5 ? "text-yellow-300" : "text-white/30"} />
                            ))}
                        </div>
                    </div>
                </div>

                {/* 4. Content List */}
                <div className="space-y-3 pb-8">
                    <h3 className="font-bold text-slate-700 ml-1">Nội dung bài học</h3>

                    <div className="space-y-3">
                        {contentList.map((item, idx) => (
                            <motion.div
                                key={item.type + item.id}
                                whileTap={!item.isLocked ? { scale: 0.98 } : {}}
                                onClick={() => handleStartItem(idx)}
                                className={`
                                    relative p-4 rounded-2xl border-2 flex items-center gap-4 transition-all
                                    ${item.isLocked
                                        ? 'bg-slate-100 border-transparent opacity-60 grayscale'
                                        : 'bg-white border-slate-100 shadow-sm hover:border-brand-blue/30 hover:shadow-md cursor-pointer'
                                    }
                                    ${item.isCompleted ? 'border-green-200 bg-green-50/30' : ''}
                                `}
                            >
                                {/* Icon Box */}
                                <div className={`
                                    w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm shrink-0
                                    ${item.isLocked
                                        ? 'bg-slate-200 text-slate-400'
                                        : (item.type === 'video' ? 'bg-red-100 text-red-500' : 'bg-brand-blue/10 text-brand-blue')
                                    }
                                `}>
                                    {item.isLocked ? <Lock size={24} /> : (item.type === 'video' ? <Play size={24} fill="currentColor" /> : <Trophy size={24} />)}
                                </div>

                                {/* Content Info */}
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-slate-800 truncate">{item.title}</h4>
                                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                                        <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                                            {item.type === 'video' ? 'Video' : 'Game'}
                                        </span>
                                        {item.isCompleted && <span className="text-green-600 font-bold flex items-center gap-0.5"><CheckCircle size={10} /> Hoàn thành</span>}
                                    </div>
                                </div>

                                {/* Average Score Badge */}
                                {/* Star Rating */}
                                {!item.isLocked && (
                                    <div className="flex flex-col items-end gap-1">
                                        <div className="flex">
                                            {[1, 2, 3].map(s => (
                                                <Star
                                                    key={s}
                                                    size={16}
                                                    className={`${(item.averageScore || 0) >= s * 10
                                                        ? 'text-yellow-400 fill-yellow-400'
                                                        : 'text-slate-200 fill-slate-200'
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LessonDetailScreen
