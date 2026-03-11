import React, { useState, useEffect, useRef } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Timer, Star, CheckCircle2, XCircle, Users } from 'lucide-react'
import { Mascot } from '@/components/common/Mascot'
import { VIOLYMPIC_QUESTIONS } from '@/data/violympicQuestions'
import { AVATARS } from '@/data/avatars'
import { socket } from '@/lib/socket'

// Types
interface Opponent {
    id: string
    name: string
    score: number
    avatarImage: string
}

export const LiveGame = ({ roomId, userAvatarId, onFinish }: { roomId: string, userAvatarId: string, onFinish: (score: number, rank: number) => void }) => {
    const questions = VIOLYMPIC_QUESTIONS[roomId] || VIOLYMPIC_QUESTIONS['room_grade_3']
    const userAvatarUrl = AVATARS.find(a => a.id === userAvatarId)?.image || AVATARS[0].image
    const roomTitle = roomId === 'room_grade_3' ? 'LỚP 3' : roomId === 'room_grade_4' ? 'LỚP 4' : 'LỚP 5'

    // --- Audio Init ---
    const bgMusicRef = useRef<HTMLAudioElement | null>(null)

    useEffect(() => {
        bgMusicRef.current = new Audio('/sounds/fun_bg_jungle_user.mp4')
        bgMusicRef.current.loop = true
        bgMusicRef.current.volume = 0.4

        const playMusic = () => {
            bgMusicRef.current?.play().catch(e => console.log("Audio autoplay blocked", e))
        }
        playMusic()

        return () => {
            if (bgMusicRef.current) {
                bgMusicRef.current.pause()
                bgMusicRef.current = null
            }
        }
    }, [])

    const playSound = (type: 'correct' | 'wrong') => {
        const url = type === 'correct' ? '/audio/correct.wav' : '/audio/wrong.wav'
        const audio = new Audio(url)
        audio.volume = type === 'correct' ? 0.6 : 0.4
        audio.play().catch(() => { })
    }

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [timeLeft, setTimeLeft] = useState(15) // 15 seconds per question for live game
    const [score, setScore] = useState(0)

    // Status
    const [showLeaderboard, setShowLeaderboard] = useState(false)
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
    const [isAnswerRevealed, setIsAnswerRevealed] = useState(false)
    const [waitingForOthers, setWaitingForOthers] = useState(false)

    const [opponents, setOpponents] = useState<Opponent[]>([])

    const timerRef = useRef<NodeJS.Timeout | null>(null)

    // Setup opponents from WebSockets
    useEffect(() => {
        const handleStateUpdate = (roomPlayers: any[]) => {
            const others = roomPlayers.filter(p => p.socketId !== socket.id);
            setOpponents(others.map(o => ({
                id: o.socketId,
                name: o.name,
                score: o.score,
                avatarImage: o.avatarImage
            })))
        }

        const handleRoundFinished = () => {
            console.log("Round finished received from server. Showing leaderboard.");
            setShowLeaderboard(true);
            setWaitingForOthers(false);
            
            // Check if it's the end of the game
            // We use a functional state update or calculate it locally if needed,
            // but the timeout below will handle the end game check locally
        }

        const handleNextQuestion = () => {
            console.log("Next question received from server.");
            setShowLeaderboard(false);
            setCurrentQuestionIndex(prev => prev + 1);
        }
        
        socket.on('room_state_update', handleStateUpdate)
        socket.on('round_finished', handleRoundFinished)
        socket.on('next_question', handleNextQuestion)
        
        // Initial broadcast of score 0
        socket.emit('submit_answer', { roomId, score: 0 }) // using submit_answer to initialize but handled specially? No, wait. 
        // Actually, 'update_score' was removed, we should just emit an initial state or nothing since join_room does it.
        // The join_room already broadcasts the 0 score. so we don't need to emit anything here.
        
        return () => {
            socket.off('room_state_update', handleStateUpdate)
            socket.off('round_finished', handleRoundFinished)
            socket.off('next_question', handleNextQuestion)
            socket.disconnect() // Leave room / disconnect when game ends
        }
    }, [roomId])

    // Start timer for each question
    useEffect(() => {
        if (showLeaderboard) return

        setTimeLeft(15)
        setSelectedAnswer(null)
        setIsAnswerRevealed(false)
        setWaitingForOthers(false)

        startTimer()

        return () => stopTimer()
    }, [currentQuestionIndex, showLeaderboard])

    const startTimer = () => {
        if (timerRef.current) clearInterval(timerRef.current)
        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    stopTimer()
                    handleTimeOut()
                    return 0
                }
                return prev - 1
            })
        }, 1000)
    }

    const stopTimer = () => {
        if (timerRef.current) clearInterval(timerRef.current)
    }

    const handleAnswerClick = (answer: string) => {
        if (selectedAnswer || isAnswerRevealed || waitingForOthers) return // Already answered

        stopTimer()
        setSelectedAnswer(answer)
        setIsAnswerRevealed(true)
        setWaitingForOthers(true)

        const question = questions[currentQuestionIndex]
        const isCorrect = answer === question.correctAnswer

        // Play sound effect
        playSound(isCorrect ? 'correct' : 'wrong')

        // Calculate point: 1000 base + 50 * timeLeft
        const points = isCorrect ? 1000 + (timeLeft * 50) : 0
        const newScore = score + points
        setScore(newScore)
        
        // Send answer to server
        socket.emit('submit_answer', { roomId, score: newScore })

        // Check if it's the final question locally so we can finish the game
        if (currentQuestionIndex >= questions.length - 1) {
            // We still want to wait for the leaderboard to show briefly
            setTimeout(() => {
                if (bgMusicRef.current) bgMusicRef.current.pause()
                const myFinalRank = getMyFinalRank(newScore)
                onFinish(newScore, myFinalRank)
            }, 3000) // Delay before moving to result screen
        }
    }

    const handleTimeOut = () => {
        setIsAnswerRevealed(true)
        setWaitingForOthers(true)
        playSound('wrong')
        
        // Emit 0 points for timeout to unblock the server
        socket.emit('submit_answer', { roomId, score })

        if (currentQuestionIndex >= questions.length - 1) {
            setTimeout(() => {
                if (bgMusicRef.current) bgMusicRef.current.pause()
                const myFinalRank = getMyFinalRank(score)
                onFinish(score, myFinalRank)
            }, 3000)
        }
    }

    const getMyFinalRank = (myScore: number) => {
        const allScores = [...opponents.map(o => o.score), myScore]
        allScores.sort((a, b) => b - a)
        return allScores.indexOf(myScore) + 1
    }

    // --- Format timer ---
    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60)
        const s = seconds % 60
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    }

    // --- Render Logic ---
    const question = questions[currentQuestionIndex]

    if (showLeaderboard) {
        // Combined list
        const leaderboard = [
            ...opponents,
            { id: 'me', name: 'Tôi (Bạn)', score: score, avatarImage: userAvatarUrl }
        ].sort((a, b) => b.score - a.score)

        return (
            <div className="flex flex-col items-center justify-center p-6 text-center space-y-6 flex-1 w-full animate-in fade-in zoom-in-95 duration-300">
                <Mascot mood="happy" size="md" className="mb-2" />
                <h2 className="text-2xl font-black text-brand-blue">Bảng Xếp Hạng Tạm Thời</h2>
                <div className="w-full max-w-sm space-y-3">
                    {leaderboard.map((user, idx) => (
                        <div key={user.id} className={`flex items-center justify-between p-3 rounded-xl border-2 ${user.id === 'me' ? 'border-brand-blue bg-blue-50 shadow-md transform scale-105' : 'border-slate-100 bg-white'}`}>
                            <div className="flex items-center gap-3">
                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${idx === 0 ? 'bg-yellow-400' : idx === 1 ? 'bg-slate-300' : idx === 2 ? 'bg-amber-600' : 'bg-slate-400'}`}>
                                    {idx + 1}
                                </span>
                                <div className="w-8 h-8 rounded-full border-2 border-white shadow-sm overflow-hidden bg-slate-100">
                                    <img src={user.avatarImage} alt={user.name} className="w-full h-full object-cover" />
                                </div>
                                <span className={`font-bold ${user.id === 'me' ? 'text-brand-blue' : 'text-slate-700'}`}>{user.name}</span>
                            </div>
                            <span className="font-black text-slate-800 flex items-center gap-1">
                                {user.score} <Star size={14} className="text-yellow-400 fill-yellow-400" />
                            </span>
                        </div>
                    ))}
                </div>
                <div className="w-full max-w-sm mt-4">
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-brand-blue animate-pulse w-full origin-left"></div>
                    </div>
                </div>
                <p className="text-sm font-bold text-slate-400 animate-pulse">Chuẩn bị câu hỏi tiếp theo...</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col flex-1 w-full bg-[#F5F7FA] -mx-4 -mb-4 overflow-hidden absolute inset-0 pt-14">
            {/* Header Toolbar */}
            <div className="bg-white px-2 py-3 flex items-center justify-between shadow-sm z-10 sticky top-0 md:px-6">
                <div className="flex items-center gap-1 md:gap-3 flex-1 overflow-hidden">
                    <button className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-xl transition-colors min-w-[40px] flex items-center justify-center shadow-md shadow-blue-500/20">
                        <span className="font-bold hidden md:block">✖</span>
                        <span className="font-bold md:hidden">X</span>
                    </button>
                    <div className="bg-blue-500 text-white rounded-xl px-3 py-2 flex-col justify-center flex-1 truncate shadow-md shadow-blue-500/20 hidden md:flex">
                        <span className="font-bold text-sm truncate uppercase tracking-wide">
                            {roomTitle} &gt; ĐẤU TRƯỜNG &gt; VIOLYMPIC
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 px-2 md:px-0">
                    {/* Points */}
                    <div className="hidden sm:flex flex-col items-end mr-4">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Điểm của bạn</span>
                        <div className="flex items-center gap-1 font-black text-brand-blue text-lg leading-none">
                            {score} <Star size={14} className="text-yellow-400 fill-yellow-400" />
                        </div>
                    </div>

                    <div className="text-right hidden sm:block">
                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Thời gian</div>
                        <div className={`font-black text-lg font-mono leading-none transition-colors ${timeLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-slate-800'}`}>
                            {formatTime(timeLeft)}
                        </div>
                    </div>
                    {/* Compact timer for mobile */}
                    <div className={`px-3 py-1.5 rounded-lg font-black font-mono sm:hidden flex items-center gap-1.5 border ${timeLeft <= 5 ? 'bg-red-100 text-red-600 border-red-200 animate-pulse' : 'bg-blue-100 text-blue-600 border-blue-200'}`}>
                        <Timer size={16} />
                        {formatTime(timeLeft)}
                    </div>
                </div>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto w-full relative bg-[#F5F7FA]">
                <div className="max-w-5xl mx-auto md:my-6 md:px-6 h-full md:h-auto">
                    <div className="bg-white md:rounded-2xl shadow-sm border-t md:border border-slate-100 flex flex-col md:flex-row min-h-full md:min-h-[400px]">

                    {/* Left Panel: Question Context */}
                    <div className="bg-slate-50/50 p-6 md:p-8 flex-1 border-b md:border-b-0 md:border-r border-slate-100 flex flex-col">
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                            <h2 className="text-xl font-black text-slate-800 bg-white shadow-sm border border-slate-100 px-4 py-1.5 rounded-xl flex items-center gap-2">
                                Câu {currentQuestionIndex + 1} <span className="text-slate-400 text-sm font-bold">/ {questions.length}</span>
                            </h2>
                            {/* Visual Progress bar inside panel */}
                            <div className="hidden md:block w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                                <div className="h-full bg-brand-blue transition-all duration-300" style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}></div>
                            </div>
                        </div>

                        <div className="prose prose-slate max-w-none flex-1 flex flex-col justify-center gap-4">
                            <p className="text-lg md:text-xl text-slate-800 font-bold leading-relaxed text-center md:text-left">
                                {question.text}
                            </p>

                            {question.imageUrl && (
                                <div className="w-full max-w-sm mx-auto md:mx-0 rounded-2xl overflow-hidden shadow-md border-4 border-white bg-white">
                                    <img
                                        src={question.imageUrl}
                                        alt="Question Illustration"
                                        className="w-full h-auto object-cover hover:scale-105 transition-transform duration-500"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Panel: Options */}
                    <div className="p-4 md:p-8 flex-none md:flex-1 flex flex-col justify-start md:justify-center bg-white space-y-3 relative pb-8 md:pb-8">
                        {/* Live opponents indicator */}
                        <div className="absolute top-0 right-4 md:top-4 flex items-center gap-1 bg-red-50 text-red-600 px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border border-red-100 animate-pulse transform -translate-y-1/2 md:translate-y-0 shadow-sm z-10">
                            <span className="w-2 h-2 rounded-full bg-red-500"></span>
                            Live: {opponents.length + 1} người
                        </div>

                        {waitingForOthers && (
                            <div className="absolute top-10 right-4 md:top-14 flex items-center gap-2 bg-blue-50 text-brand-blue px-3 py-1.5 rounded-full text-xs font-bold border border-blue-100 animate-pulse z-10 shadow-sm">
                                <span className="flex gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-brand-blue animate-bounce"></span>
                                    <span className="w-1.5 h-1.5 rounded-full bg-brand-blue animate-bounce" style={{animationDelay: '0.1s'}}></span>
                                    <span className="w-1.5 h-1.5 rounded-full bg-brand-blue animate-bounce" style={{animationDelay: '0.2s'}}></span>
                                </span>
                                Đang chờ người khác...
                            </div>
                        )}

                        {question.options.map((option, idx) => {
                            const labels = ['A', 'B', 'C', 'D']
                            const isSelected = selectedAnswer === option
                            const isCorrect = option === question.correctAnswer

                            let btnStyle = "bg-white border-2 border-slate-200 text-slate-700 hover:border-brand-blue hover:bg-blue-50 shadow-sm"

                            if (isAnswerRevealed) {
                                if (isCorrect) {
                                    btnStyle = "bg-green-500 border-green-600 text-white shadow-[0_4px_0_rgb(22,163,74)] z-10 scale-[1.02]"
                                } else if (isSelected && !isCorrect) {
                                    btnStyle = "bg-red-500 border-red-600 text-white shadow-[0_4px_0_rgb(220,38,38)] z-10 scale-[1.02]"
                                } else {
                                    btnStyle = "bg-slate-50 border-slate-200 text-slate-400 opacity-60"
                                }
                            } else if (isSelected) {
                                // Fallback if selected but not revealed (very briefly)
                                btnStyle = "border-brand-blue bg-blue-50 ring-4 ring-blue-500/10 text-brand-blue"
                            }

                            return (
                                <button
                                    key={idx}
                                    disabled={isAnswerRevealed}
                                    onClick={() => handleAnswerClick(option)}
                                    className={`w-full text-left p-4 rounded-xl transition-all flex justify-between items-center gap-4 ${btnStyle}`}
                                >
                                    <div className="flex gap-4">
                                        <span className={`font-black flex-shrink-0 ${isSelected && !isAnswerRevealed ? 'text-brand-blue' : isAnswerRevealed && (isCorrect || isSelected) ? 'text-white' : 'text-slate-500'}`}>
                                            {labels[idx]}.
                                        </span>
                                        <span className={`font-bold ${isSelected && !isAnswerRevealed ? 'text-brand-blue' : isAnswerRevealed && (isCorrect || isSelected) ? 'text-white' : 'text-slate-700'}`}>
                                            {option}
                                        </span>
                                    </div>

                                    {isAnswerRevealed && isCorrect && <CheckCircle2 size={24} className="text-white shrink-0 animate-in zoom-in" />}
                                    {isAnswerRevealed && isSelected && !isCorrect && <XCircle size={24} className="text-white shrink-0 animate-in zoom-in" />}
                                </button>
                            )
                        })}

                        {/* Status Message when revealed */}
                        {isAnswerRevealed && (
                            <div className={`mt-4 p-3 rounded-xl text-center font-bold animate-in slide-in-from-bottom-2 ${selectedAnswer === question.correctAnswer ? 'bg-green-100 text-green-700' : selectedAnswer ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}>
                                {selectedAnswer === question.correctAnswer ? 'Tuyệt vời! Chính xác!' : selectedAnswer ? `Sai rồi! Đáp án đúng là ${question.correctAnswer}` : `Hết giờ! Đáp án đúng là ${question.correctAnswer}`}
                            </div>
                        )}
                    </div>
                </div>
                </div>
            </div>

            {/* Visual timer line at bottom instead of a full footer to keep it game-like */}
            <div className="h-2 w-full bg-slate-200 absolute bottom-0 left-0 z-20">
                <div className={`h-full transition-all duration-1000 ease-linear ${timeLeft <= 5 ? 'bg-red-500' : 'bg-brand-blue'}`} style={{ width: `${(timeLeft / 15) * 100}%` }}></div>
            </div>
        </div>
    )
}
