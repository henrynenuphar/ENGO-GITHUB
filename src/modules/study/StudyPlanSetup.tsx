import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Calendar, Clock, CheckCircle, ChevronRight, ChevronLeft, Flag, Target, Lock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/UserContext'

// Types
import SubscriptionModal from '@/components/common/SubscriptionModal'
import { BookOpen, GraduationCap, Baby } from 'lucide-react'

// Types
type SetupStep = 'intro' | 'grade_selection' | 'schedule' | 'preview' | 'confirm' | 'complete'
type StudyDuration = 30 | 60 | 90 | 120 | 180
const DAYS_OF_WEEK = [
    { id: 'Mon', label: 'Monday' },
    { id: 'Tue', label: 'Tuesday' },
    { id: 'Wed', label: 'Wednesday' },
    { id: 'Thu', label: 'Thursday' },
    { id: 'Fri', label: 'Friday' },
    { id: 'Sat', label: 'Saturday' },
    { id: 'Sun', label: 'Sunday' }
]

interface StudyPlanSetupProps {
    onComplete?: () => void
}

// GRADES definition removed from here as it's not used locally for selection anymore
// But DiscoveryScreen imports it?
// The user removed selection FROM HERE.
// If DiscoveryScreen imports GRADES from here, we must export it.
// Let's keep GRADES exported but move it potentially or leave it if it's exported.
// DiscoveryScreen was importing: import { GRADES as STUDY_GRADES } from '@/modules/study/StudyPlanSetup'
// So we must keep GRADES exported.

export const GRADES = [
    { id: 'kindergarten', title: 'Kindergarten', icon: <Baby size={24} />, color: 'bg-pink-500', isLocked: true },
    { id: 'grade-1', title: 'Grade 1', icon: <BookOpen size={24} />, color: 'bg-green-500', isLocked: true },
    { id: 'grade-2', title: 'Grade 2', icon: <BookOpen size={24} />, color: 'bg-teal-500', isLocked: true },
    { id: 'grade-3', title: 'Grade 3', icon: <BookOpen size={24} />, color: 'bg-blue-500', isLocked: true },
    { id: 'grade-4', title: 'Grade 4', icon: <BookOpen size={24} />, color: 'bg-indigo-500', isLocked: true },
    { id: 'grade-5', title: 'Grade 5', icon: <GraduationCap size={24} />, color: 'bg-violet-500', isLocked: false },
]

const StudyPlanSetup = ({ onComplete }: StudyPlanSetupProps) => {
    const navigate = useNavigate()
    const { user } = useAuth()
    const [step, setStep] = useState<SetupStep>('intro')

    // Modal State
    const [showPaywall, setShowPaywall] = useState(false)
    const [selectedGradeForPaywall, setSelectedGradeForPaywall] = useState('')

    // Form State
    // Form State
    const [duration, setDuration] = useState<StudyDuration>(90)
    const [selectedDays, setSelectedDays] = useState<string[]>([])
    const [startDateStr, setStartDateStr] = useState(new Date().toISOString().split('T')[0]) // Default today

    const startDate = new Date(startDateStr)

    // Derived Data: Aggregating all enrolled courses
    const enrolledCoursesInfo = (user?.enrolledCourses || []).map(enc => {
        const gradeDef = GRADES.find(g => g.id === enc.courseId)
        return {
            id: enc.courseId,
            title: gradeDef?.title || enc.courseId,
        }
    })

    const courseNames = enrolledCoursesInfo.map(c => c.title).join(' + ') || "Khóa học của bạn"
    const totalUnits = enrolledCoursesInfo.length * 12 // Map each course to 12 mock units, or count real data if available
    const totalLessons = enrolledCoursesInfo.length * 36 // Mock 36 lessons per course

    const endDate = new Date(startDate)
    endDate.setDate(startDate.getDate() + duration)

    const handleNext = () => {
        if (step === 'intro') setStep('schedule')
        else if (step === 'schedule') setStep('preview')
        else if (step === 'preview') setStep('confirm')
        else if (step === 'confirm') {
            // Save Schedule Logic
            localStorage.setItem('engo_study_schedule', JSON.stringify(selectedDays))

            // Simulate API Call
            setTimeout(() => setStep('complete'), 1000)
        }
        else if (step === 'complete') {
            if (onComplete) onComplete()
            else navigate('/app/study')
        }
    }

    const handleBack = () => {
        if (step === 'intro') setStep('grade_selection')
        else if (step === 'schedule') setStep('intro')
        else if (step === 'preview') setStep('schedule')
        else if (step === 'confirm') setStep('preview')
    }

    const toggleDay = (day: string) => {
        if (selectedDays.includes(day)) {
            setSelectedDays(prev => prev.filter(d => d !== day))
        } else {
            setSelectedDays(prev => [...prev, day])
        }
    }

    // --- SCREEN RENDERS ---

    const renderIntro = () => (
        <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="inline-block p-4 bg-brand-lightBlue rounded-full shadow-lg mb-4">
                <Target size={48} className="text-brand-blue" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">Khởi tạo Study Plan</h1>
            <Card className="p-6 bg-white border-2 border-slate-100 shadow-sm text-left space-y-4">
                <div className="flex justify-between items-center border-b pb-4">
                    <span className="text-slate-500 font-medium">Khóa học</span>
                    <span className="font-bold text-brand-blue text-right max-w-[60%] leading-tight text-lg">{courseNames}</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="text-slate-400">Tổng số Units</p>
                        <p className="font-bold text-slate-700">{totalUnits} Units</p>
                    </div>
                    <div>
                        <p className="text-slate-400">Số bài học</p>
                        <p className="font-bold text-slate-700">{totalLessons} Bài</p>
                    </div>
                    <div>
                        <p className="text-slate-400">Mục tiêu</p>
                        <p className="font-bold text-slate-700">A2 Flyers</p>
                    </div>
                    <div>
                        <p className="text-slate-400">Thời lượng</p>
                        <p className="font-bold text-slate-700">~3-6 tháng</p>
                    </div>
                </div>
            </Card>
            <p className="text-slate-500 text-sm px-4">Giúp con xây dựng lộ trình học tập phù hợp và hiệu quả nhất.</p>
        </div>
    )

    const renderSchedule = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div className="text-center">
                <h2 className="text-xl font-bold text-slate-800">Thiết lập lịch học</h2>
                <p className="text-sm text-slate-500">Chọn thời gian phù hợp với con</p>
            </div>

            {/* Duration Selector */}
            <div className="space-y-3">
                <label className="text-sm font-bold text-slate-700 block">Thời lượng dự kiến</label>
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                    {[30, 60, 90, 120, 180].map(d => (
                        <button
                            key={d}
                            onClick={() => setDuration(d as StudyDuration)}
                            className={`px-4 py-2 rounded-xl border-2 whitespace-nowrap transition-all ${duration === d
                                ? 'bg-brand-blue border-brand-blue text-white shadow-md'
                                : 'bg-white border-slate-200 text-slate-600 hover:border-brand-blue/50'
                                }`}
                        >
                            {d} ngày
                        </button>
                    ))}
                </div>
            </div>

            {/* Days Selector */}
            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <label className="text-sm font-bold text-slate-700">Lịch học trong tuần</label>
                    <button
                        onClick={() => setSelectedDays(prev => prev.length === 7 ? [] : DAYS_OF_WEEK.map(d => d.id))}
                        className="text-xs text-brand-blue font-bold px-3 py-1.5 bg-brand-lightBlue hover:bg-blue-100 transition-colors rounded-md"
                    >
                        {selectedDays.length === 7 ? 'Bỏ chọn' : 'Chọn tất cả'}
                    </button>
                </div>
                <div className="grid grid-cols-2 sm:flex sm:flex-wrap sm:justify-center gap-3 mt-4">
                    {DAYS_OF_WEEK.map(day => (
                        <button
                            key={day.id}
                            onClick={() => toggleDay(day.id)}
                            className={`w-full sm:w-[calc(25%-0.75rem)] h-14 rounded-xl flex flex-col items-center justify-center text-sm font-bold transition-all ${selectedDays.includes(day.id)
                                ? 'bg-brand-orange text-white shadow-md transform border-2 border-brand-orange scale-100 sm:scale-[1.02]'
                                : 'bg-white border-2 border-slate-100 text-slate-500 hover:border-brand-orange/30'
                                }`}
                        >
                            <span>{day.label}</span>
                            {selectedDays.includes(day.id) && <div className="w-1.5 h-1.5 bg-white rounded-full mt-0.5" />}
                        </button>
                    ))}
                </div>
            </div>

            {/* Start Date */}
            <div className="space-y-3">
                <label className="text-sm font-bold text-slate-700 block">Ngày bắt đầu</label>
                <div
                    className="relative flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-brand-blue/50 transition-colors cursor-pointer focus-within:ring-2 focus-within:ring-brand-blue/30 focus-within:border-brand-blue"
                    onClick={() => {
                        const input = document.getElementById('start-date-input') as HTMLInputElement | null;
                        if (input && typeof input.showPicker === 'function') {
                            input.showPicker();
                        } else if (input) {
                            input.focus();
                            input.click();
                        }
                    }}
                >
                    <Calendar className="text-brand-blue z-10 shrink-0" size={20} />
                    <span className="text-slate-700 font-medium z-10 whitespace-nowrap">
                        {startDateStr === new Date().toISOString().split('T')[0] ? 'Hôm nay' : ''} ({startDate.toLocaleDateString('vi-VN')})
                    </span>
                    <div className="ml-auto z-10 px-3 py-1.5 bg-brand-lightBlue text-brand-blue font-bold text-xs rounded-md shadow-sm pointer-events-none">Thay đổi</div>

                    {/* Native date picker, hidden visually but functionally accessible */}
                    <input
                        id="start-date-input"
                        type="date"
                        value={startDateStr}
                        onChange={(e) => setStartDateStr(e.target.value)}
                        className="absolute w-0 h-0 opacity-0 pointer-events-none"
                        min={new Date().toISOString().split('T')[0]} // Prevents picking past dates
                    />
                </div>
            </div>
        </div>
    )

    const renderPreview = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div className="text-center">
                <h2 className="text-xl font-bold text-slate-800">Xem trước lộ trình</h2>
                <p className="text-sm text-slate-500">Kiểm tra lại thông tin trước khi xác nhận</p>
            </div>

            <Card className="bg-white border-2 border-brand-blue/10 shadow-lg overflow-hidden">
                <div className="bg-brand-blue/5 p-4 border-b border-brand-blue/10 flex items-center justify-between">
                    <span className="font-bold text-brand-blue line-clamp-1 flex-1 mr-4">{courseNames}</span>
                    <span className="text-xs font-bold bg-white px-2 py-1 rounded text-slate-500 border whitespace-nowrap">Xác nhận</span>
                </div>
                <div className="p-6 space-y-6">
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                            <Clock size={20} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Thời gian học</p>
                            <p className="text-lg font-bold text-slate-800">{duration} Ngày</p>
                            <p className="text-xs text-slate-400">Kết thúc dự kiến: {endDate.toLocaleDateString('vi-VN')}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 shrink-0">
                            <Calendar size={20} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Lịch học</p>
                            <p className="text-lg font-bold text-slate-800">
                                {selectedDays.length > 0
                                    ? selectedDays.map(d => DAYS_OF_WEEK.find(dw => dw.id === d)?.label).join(', ')
                                    : 'Chưa chọn'}
                            </p>
                            <p className="text-xs text-slate-400">{selectedDays.length} buổi / tuần</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                            <Flag size={20} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Mục tiêu</p>
                            <p className="text-lg font-bold text-slate-800">~{Math.round(totalUnits / (duration / 7))} Unit / Tuần</p>
                        </div>
                    </div>
                </div>
                <div className="bg-yellow-50 p-3 text-xs text-yellow-700 text-center font-medium border-t border-yellow-100">
                    Kế hoạch được cá nhân hóa dựa trên lựa chọn của bạn.
                </div>
            </Card>
        </div>
    )

    const renderConfirm = () => (
        <div className="text-center space-y-8 animate-in fade-in zoom-in duration-300">
            <div className="w-40 h-40 bg-brand-lightBlue rounded-full mx-auto flex items-center justify-center relative">
                <div className="absolute inset-0 border-4 border-brand-blue/20 rounded-full animate-ping"></div>
                <Target size={64} className="text-brand-blue" />
            </div>

            <div className="space-y-4">
                <h2 className="text-2xl font-bold text-slate-800">Sẵn sàng tạo lộ trình?</h2>
                <p className="text-slate-500 max-w-xs mx-auto">
                    Hệ thống sẽ thiết lập bài học và nhắc nhở dựa trên lịch bạn đã chọn.
                </p>
            </div>
        </div>
    )

    const renderComplete = () => (
        <div className="text-center space-y-8 animate-in fade-in zoom-in duration-500 py-10">
            <div className="inline-block relative">
                <div className="w-32 h-32 bg-green-100 rounded-full flex items-center justify-center mb-4 shadow-xl ring-8 ring-green-50 mx-auto">
                    <CheckCircle size={64} className="text-green-500 animate-bounce" />
                </div>
                {/* Confetti fake elements could go here */}
            </div>

            <div className="space-y-4">
                <h2 className="text-3xl font-black text-slate-800">Tuyệt vời! 🎉</h2>
                <p className="text-slate-600 text-lg">
                    Lộ trình học của <strong>{user?.name || 'Bé'}</strong> đã sẵn sàng.
                </p>
                <div className="bg-slate-50 p-4 rounded-xl max-w-xs mx-auto text-sm text-slate-500">
                    Bài học đầu tiên: <strong>Unit 1: Summer Activities</strong>
                </div>
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            {/* Header */}
            <div className="bg-white p-4 shadow-sm flex items-center">
                {step !== 'intro' && step !== 'complete' && (
                    <Button variant="ghost" size="sm" onClick={handleBack}>
                        <ChevronLeft className="mr-1" size={20} /> Quay lại
                    </Button>
                )}
                <div className="flex-1 flex justify-center gap-1">
                    {/* Progress Dots */}
                    {['intro', 'schedule', 'preview', 'confirm'].map((s) => {
                        const stepIndex = ['intro', 'schedule', 'preview', 'confirm', 'complete'].indexOf(step)
                        const thisIndex = ['intro', 'schedule', 'preview', 'confirm'].indexOf(s)
                        return (
                            <div
                                key={s}
                                className={`w-2 h-2 rounded-full transition-all ${stepIndex >= thisIndex ? 'bg-brand-blue w-6' : 'bg-slate-200'}`}
                            />
                        )
                    })}
                </div>
                <div className="w-20"></div> {/* Spacer */}
            </div>

            {/* Content Area */}
            <div className="flex-1 p-6 flex flex-col max-w-2xl mx-auto w-full justify-center">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className="flex-1"
                    >
                        {step === 'intro' && renderIntro()}
                        {step === 'schedule' && renderSchedule()}
                        {step === 'preview' && renderPreview()}
                        {step === 'confirm' && renderConfirm()}
                        {step === 'complete' && renderComplete()}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Bottom Bar */}
            <div className="p-6 bg-white border-t border-slate-100 safe-bottom">
                <div className="max-w-2xl mx-auto w-full">
                    {step === 'complete' ? (
                        <Button onClick={handleNext} size="lg" className="w-full bg-brand-orange hover:bg-orange-600 shadow-lg shadow-orange-500/20 text-lg font-bold py-6">
                            Bắt đầu học ngay <ChevronRight className="ml-2" />
                        </Button>
                    ) : (
                        <Button
                            onClick={handleNext}
                            disabled={step === 'schedule' && selectedDays.length === 0}
                            size="lg"
                            className="w-full bg-brand-blue hover:bg-blue-600 shadow-lg shadow-blue-500/20 text-lg font-bold py-6"
                        >
                            {step === 'confirm' ? 'Khởi tạo Study Plan' : (step === 'intro' ? 'Thiết lập ngay' : 'Tiếp tục')}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}

export default StudyPlanSetup
