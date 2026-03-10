import React, { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Mascot } from '@/components/common/Mascot'
import { Check, ArrowRight, Lock, Baby, X, Star } from 'lucide-react'
import { GRADES as STUDY_GRADES } from '@/modules/study/StudyPlanSetup' // We can reuse or redefine. Re-defining for now to match style.
import { COURSES } from '@/data/courses'
import { PACKAGES } from './data'
import { toast } from 'sonner'
import SubscriptionModal from '@/components/common/SubscriptionModal'

// Re-define GRADES for Discovery to match the grid style
const DISCOVERY_GRADES = [
    { id: 'kindergarten', name: 'Kindergarten', color: 'bg-pink-500' },
    { id: 1, name: 'Grade 1', color: 'bg-red-500' },
    { id: 2, name: 'Grade 2', color: 'bg-orange-500' },
    { id: 3, name: 'Grade 3', color: 'bg-yellow-400' },
    { id: 4, name: 'Grade 4', color: 'bg-green-500' },
    { id: 5, name: 'Grade 5', color: 'bg-blue-500' },
]

import { useAuth } from '@/context/UserContext'
import { useNavigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'

const DiscoveryScreen = () => {
    const { user, updateUser } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const [selectedGrade, setSelectedGrade] = useState<number | string | null>(null)
    const [selectedPackage, setSelectedPackage] = useState<string | null>(null)

    // Parse URL parameter on mount
    useEffect(() => {
        const params = new URLSearchParams(location.search)
        const gradeParam = params.get('grade')
        if (gradeParam) {
            // Convert to number if it's a digit, else string (like 'kindergarten')
            const parsedGrade = isNaN(Number(gradeParam)) ? gradeParam : Number(gradeParam)
            handleGradeSelect(parsedGrade)
        }
    }, [location.search])

    // Modal State
    const [showPaywall, setShowPaywall] = useState(false)
    const [selectedGradeForPaywall, setSelectedGradeForPaywall] = useState('')

    const handleGradeSelect = (gradeId: number | string) => {
        // Access Control Logic
        // Original logic: VIP user only purchased Grade 5
        const isVipUser = user?.phone === '0832242783'
        const isUnlocked = ((gradeId === 5 || gradeId === 'kindergarten') && isVipUser) || user?.enrolledCourses?.some(c => c.courseId === `grade-${gradeId}` || c.courseId === gradeId)

        if (isUnlocked) {
            // Give user access to this course ID
            const courseId = gradeId === 'kindergarten' ? 'kindergarten' : `grade-${gradeId}`

            // Just update context & storage logic here so app knows which is active
            if (user) {
                const updatedCourses = [...user.enrolledCourses]
                const existingIndex = updatedCourses.findIndex(c => c.courseId === courseId)
                if (existingIndex > -1) {
                    updatedCourses[existingIndex].lastAccessed = Date.now()
                    // Move to front so StudyScreen defaults to it
                    const [item] = updatedCourses.splice(existingIndex, 1)
                    updatedCourses.unshift(item)
                } else {
                    updatedCourses.unshift({
                        courseId,
                        currentLessonIndex: 0,
                        lastAccessed: Date.now(),
                        expiryDate: new Date('2027-01-26').getTime()
                    })
                }

                // Actually save it to context and local storage so StudyScreen sees the new active course
                updateUser({ enrolledCourses: updatedCourses })
            }

            toast.success(`Chào mừng VIP ${user?.name || ''}! Đang chuyển đến lộ trình học...`)
            navigate('/app/study')
            return
        }

        // For locked grades, expand the view to show subscription options instead of a modal
        setSelectedGrade(gradeId)
        // Ensure we scroll to top or reset view state if needed
    }

    const handleConfirm = () => {
        if (selectedGrade && selectedPackage) {
            toast.success(`Đã chọn Lớp ${selectedGrade} - Gói ${selectedPackage.toUpperCase()}`)
            // In real app, navigate to checkout or lesson overview
        }
    }

    // Grade Selection View
    if (!selectedGrade) {
        return (
            <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-brand-blue">Khám phá khóa học</h1>
                    <Mascot mood="happy" size="sm" />
                </div>
                <p className="text-slate-500">Chọn khối lớp của con để bắt đầu:</p>

                <div className="grid grid-cols-2 gap-4">
                    {DISCOVERY_GRADES.map((grade) => {
                        const isVipUser = user?.phone === '0832242783'
                        const isUnlocked = ((grade.id === 5 || grade.id === 'kindergarten') && isVipUser) || user?.enrolledCourses?.some(c => c.courseId === `grade-${grade.id}` || c.courseId === grade.id)

                        return (
                            <Card
                                key={grade.id}
                                variant="interactive"
                                onClick={() => handleGradeSelect(grade.id)}
                                className={`aspect-square flex flex-col items-center justify-center gap-2 ${grade.color} text-white border-none shadow-md hover:scale-105 transition-transform relative`}
                            >
                                {grade.id === 'kindergarten' ? <Baby size={48} /> : <span className="text-6xl font-black">{grade.id}</span>}
                                <span className="font-bold text-lg">{grade.name}</span>

                                {!isUnlocked && (
                                    <div className="absolute top-2 right-2 bg-white/20 p-2 rounded-full backdrop-blur-sm">
                                        <Lock size={20} className="text-white" />
                                    </div>
                                )}
                            </Card>
                        )
                    })}
                </div>
            </div>
        )
    }

    return (
        <div className="p-6 space-y-6 pb-24 min-h-screen bg-slate-50">
            <button
                onClick={() => {
                    setSelectedGrade(null)
                    setSelectedPackage(null)
                    navigate('/app/discovery', { replace: true }) // clear query params
                }}
                className="text-sm text-slate-400 font-bold hover:text-brand-blue flex items-center gap-1"
            >
                <ArrowRight className="rotate-180" size={16} /> Quay lại
            </button>

            <div className="text-center space-y-2">
                <div className="inline-block px-3 py-1 bg-brand-orange text-white text-xs font-bold rounded-full mb-2 uppercase tracking-wider">
                    Premium Content
                </div>
                <h2 className="text-2xl font-black text-slate-800">Mở khóa Lớp {selectedGrade}</h2>
                <p className="text-slate-500 max-w-xs mx-auto text-sm">
                    Để học chương trình này, vui lòng chọn gói học phù hợp với bé.
                </p>
            </div>

            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                {/* Basic Plan */}
                <div
                    onClick={() => setSelectedPackage('basic')}
                    className={`border-2 rounded-2xl p-6 transition-all cursor-pointer relative bg-white flex flex-col ${selectedPackage === 'basic' ? 'border-brand-blue ring-4 ring-blue-50' : 'border-slate-200 hover:border-brand-blue/30'}`}
                >
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-bold text-slate-700">Gói Basic</h3>
                        {selectedPackage === 'basic' && <div className="bg-brand-blue text-white p-1 rounded-full"><Check size={14} /></div>}
                    </div>
                    <p className="text-3xl font-black text-slate-800 mb-6">
                        499k <span className="text-sm font-medium text-slate-400">/năm</span>
                    </p>
                    <ul className="space-y-3 mb-6 text-sm text-slate-800 text-left font-medium">
                        <li className="flex gap-2"><Check size={18} className="text-slate-700 shrink-0" /> Mở khóa toàn bộ khóa học</li>
                        <li className="flex gap-2"><Check size={18} className="text-slate-700 shrink-0" /> Kho từ vựng: 2000+ từ</li>
                        <li className="flex gap-2"><Check size={18} className="text-slate-700 shrink-0" /> 150+ Collocations & Idioms</li>
                        <li className="flex gap-2"><Check size={18} className="text-slate-700 shrink-0" /> Study Plan (lộ trình học)</li>
                        <li className="flex gap-2"><Check size={18} className="text-slate-700 shrink-0" /> Bài tập luyện tập</li>

                        <li className="flex gap-2 pt-2"><X size={18} className="text-red-600 shrink-0" /> Phòng luyện Violympic</li>
                        <li className="flex gap-2"><X size={18} className="text-red-600 shrink-0" /> Chấm điểm phát âm chi tiết (IPA / Intonation)</li>
                        <li className="flex gap-2"><X size={18} className="text-red-600 shrink-0" /> AI sửa lỗi phát âm</li>
                        <li className="flex gap-2"><X size={18} className="text-red-600 shrink-0" /> Luyện nói AI 1-1</li>
                        <li className="flex gap-2"><X size={18} className="text-red-600 shrink-0" /> Báo cáo tiến độ học tập</li>
                    </ul>
                </div>

                {/* Pro Plan */}
                <div
                    onClick={() => setSelectedPackage('pro')}
                    className={`border-2 rounded-2xl p-6 relative overflow-hidden transition-all cursor-pointer flex flex-col ${selectedPackage === 'pro' ? 'border-brand-orange ring-4 ring-orange-100 bg-orange-50/50' : 'border-brand-orange/50 bg-white hover:bg-orange-50/30'}`}
                >
                    <div className="absolute top-0 right-0 bg-brand-orange text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                        Phổ biến nhất
                    </div>
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-bold flex items-center gap-2 text-slate-800">
                            <Star size={20} className="text-yellow-400 fill-yellow-400" />
                            Gói Pro <span className="text-brand-orange text-sm relative top-0.5">(Phổ biến nhất)</span>
                        </h3>
                        {selectedPackage === 'pro' && <div className="bg-brand-orange text-white p-1 rounded-full"><Check size={14} /></div>}
                    </div>
                    <p className="text-3xl font-black text-slate-800 mb-1">
                        899k <span className="text-sm font-medium text-slate-400">/năm</span>
                    </p>
                    <p className="text-sm italic text-slate-500 mb-6">~2.400đ / ngày</p>
                    <ul className="space-y-3 mb-6 text-sm text-slate-800 text-left font-medium">
                        <li className="flex gap-2"><Check size={18} className="text-slate-700 shrink-0" /> Mở khóa toàn bộ khóa học</li>
                        <li className="flex gap-2"><Check size={18} className="text-slate-700 shrink-0" /> Kho từ vựng: 2000+ từ</li>
                        <li className="flex gap-2"><Check size={18} className="text-slate-700 shrink-0" /> 400+ Collocations & Idioms</li>
                        <li className="flex gap-2"><Check size={18} className="text-slate-700 shrink-0" /> Study Plan (lộ trình học)</li>
                        <li className="flex gap-2"><Check size={18} className="text-slate-700 shrink-0" /> Bài tập luyện tập</li>

                        <li className="flex gap-2 pt-2"><Star size={18} className="text-yellow-400 fill-yellow-400 shrink-0 drop-shadow-sm" /> <strong>Phòng luyện Violympic</strong></li>
                        <li className="flex gap-2"><Star size={18} className="text-yellow-400 fill-yellow-400 shrink-0 drop-shadow-sm" /> <strong>Chấm điểm phát âm chi tiết (IPA / Intonation)</strong></li>
                        <li className="flex gap-2"><Star size={18} className="text-yellow-400 fill-yellow-400 shrink-0 drop-shadow-sm" /> <strong>AI sửa lỗi phát âm theo từng từ</strong></li>
                        <li className="flex gap-2"><Star size={18} className="text-yellow-400 fill-yellow-400 shrink-0 drop-shadow-sm" /> <strong>Luyện nói AI 1-1 theo tình huống</strong></li>
                        <li className="flex gap-2"><Star size={18} className="text-yellow-400 fill-yellow-400 shrink-0 drop-shadow-sm" /> <strong>Báo cáo tiến độ học tập</strong></li>
                    </ul>
                </div>
            </div>

            {/* Locked Course Preview */}
            <div className="pt-4 space-y-4">
                <h3 className="text-lg font-bold text-slate-800 text-center">Nội dung khóa học</h3>
                <div className="space-y-3 pb-8">
                    {COURSES[selectedGrade === 'kindergarten' ? 'kindergarten' : `grade-${selectedGrade}`]?.lessons.map((lesson, index) => (
                        <div key={lesson.id} className="bg-white rounded-2xl overflow-hidden border-2 border-slate-100 opacity-70 grayscale-[30%]">
                            <div className="p-4 flex items-center gap-4 relative">
                                {/* Thumbnail / Icon */}
                                <div className={`w-16 h-16 rounded-xl flex-shrink-0 flex items-center justify-center text-2xl font-bold text-white relative overflow-hidden bg-gradient-to-br from-brand-blue to-cyan-400`}>
                                    {index + 1}
                                    <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                                        <Lock size={24} className="text-white drop-shadow-md" />
                                    </div>
                                </div>

                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <span className="text-[10px] font-bold text-slate-400 border border-slate-200 px-2 py-0.5 rounded-full mb-1 inline-block flex items-center gap-1">
                                            <Lock size={10} /> Bài học bị khóa
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-lg text-slate-800">
                                        {lesson.title}
                                    </h3>
                                    <p className="text-sm text-slate-500 line-clamp-1">{lesson.description}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="fixed bottom-24 md:bottom-0 left-0 right-0 md:left-64 px-6 flex justify-center bg-gradient-to-t from-slate-50 via-slate-50 to-transparent pt-12 pb-2 md:pb-6 z-40 pointer-events-none">
                <div className="w-full max-w-xl pointer-events-auto drop-shadow-xl">
                    <Button
                        disabled={!selectedPackage}
                        onClick={handleConfirm}
                        className={`w-full shadow-2xl h-14 text-lg font-bold transition-all ${selectedPackage === 'pro' ? 'bg-brand-orange hover:bg-orange-600 shadow-orange-500/30' : 'bg-brand-blue hover:bg-blue-600 shadow-brand-blue/30'}`}
                    >
                        {selectedPackage ? `Đăng ký gói ${selectedPackage === 'basic' ? 'Basic' : 'Pro'} ngay` : 'Chọn gói học'} <ArrowRight className="ml-2" />
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default DiscoveryScreen
