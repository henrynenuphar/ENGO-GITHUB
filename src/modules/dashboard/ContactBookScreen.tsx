import React, { useRef } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/UserContext'
import { BookOpen, Target, Clock, TrendingUp, Download, ArrowLeft, CheckCircle2, XCircle, Lightbulb, AlertCircle, Star } from 'lucide-react'

const ContactBookScreen = () => {
    const navigate = useNavigate()
    const { user } = useAuth()
    const printRef = useRef<HTMLDivElement>(null)

    // New state for progress timeframe filtering
    const [timeframe, setTimeframe] = React.useState<'week' | 'month'>('week')
    const [selectedPeriod, setSelectedPeriod] = React.useState<string>('w2-m3')

    // User courses based on phone (Henry's account 0832242783 has 2 courses)
    const availableCourses = user?.phone === '0832242783' ? [
        { id: 'kindergarten', name: 'Lớp Mầm Non' },
        { id: 'grade5', name: 'Lớp 5' }
    ] : [
        { id: 'kindergarten', name: 'Lớp Mầm Non' }
    ]
    const [selectedCourse, setSelectedCourse] = React.useState<string>(availableCourses[0].id)

    const handlePrint = () => {
        window.print()
    }

    if (!user) {
        return (
            <div className="p-10 text-center">
                <p>Bạn chưa đăng nhập</p>
                <Button onClick={() => navigate('/login')} className="mt-4">Đăng nhập</Button>
            </div>
        )
    }

    // Deterministic mock data generator based on course and period
    const getDynamicData = (course: string, period: string) => {
        // Create a predictable random seed from period string
        const seed = period.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)

        const isMng = course === 'kindergarten'
        const baseScore = isMng ? 85 : 72
        const rand = (seed % 15) - 5 // -5 to +10

        const currentScore = Math.min(100, Math.max(0, baseScore + rand))
        const prevScore = Math.min(100, Math.max(0, currentScore - (seed % 10) - 2))

        return {
            stats: {
                completedLessons: 5 + (seed % 12),
                avgScore: currentScore,
                correctRate: currentScore - (seed % 5),
                studyTime: `${1 + (seed % 3)} giờ ${(seed * 7) % 60} phút`,
            },
            progress: {
                current: currentScore,
                previous: prevScore,
                improvement: currentScore - prevScore,
                periodLabel: timeframe === 'week' ? 'tuần' : 'tháng'
            },
            strengths: isMng ? [
                { topic: 'Từ vựng: Động vật', score: Math.min(100, currentScore + 8) },
                { topic: 'Từ vựng: Số đếm', score: Math.min(100, currentScore + 5) }
            ] : [
                { topic: 'Ngữ pháp: Thì quá khứ', score: Math.min(100, currentScore + 6) },
                { topic: 'Từ vựng: Hoạt động', score: Math.min(100, currentScore + 3) }
            ],
            weaknesses: isMng ? [
                'Từ vựng: Chủ đề đồ ăn',
                'Ngữ pháp: Câu hỏi đơn giản'
            ] : [
                'Ngữ pháp: Câu điều kiện',
                'Đọc hiểu đoạn văn dài',
                'Nghe chép chính tả'
            ],
            mistakes: {
                vocab: isMng ? ['butterfly', 'strawberry', 'elephant'] : ['environment', 'necessary', 'comfortable'],
                grammar: isMng ? [
                    { wrong: 'I is a boy', right: 'I am a boy' }
                ] : [
                    { wrong: 'If it will rain, I stay home', right: 'If it rains, I will stay home' },
                    { wrong: 'He don\'t know', right: 'He doesn\'t know' }
                ]
            },
            suggestions: isMng ? [
                'Luyện nghe lại bài hát bảng chữ cái',
                'Mẹ cùng bé ôn flashcard chủ đề đồ ăn 10 phút/ngày'
            ] : [
                'Làm thêm 5 bài tập trắc nghiệm câu điều kiện',
                'Nghe podcast tiếng Anh cơ bản 15 phút mỗi sáng'
            ]
        }
    }

    const dynamicData = getDynamicData(selectedCourse, selectedPeriod)
    const { stats, progress, strengths, weaknesses, mistakes, suggestions } = dynamicData
    const currentCourseName = availableCourses.find(c => c.id === selectedCourse)?.name

    return (
        <div className="min-h-screen bg-slate-50 pb-24 print:bg-white print:pb-0">
            {/* Standard App Header - hidden during print */}
            <div className="bg-brand-blue text-white p-4 sticky top-0 z-50 flex items-center gap-4 shadow-sm print:hidden">
                <button onClick={() => navigate('/app/profile')} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
                    <ArrowLeft size={20} />
                </button>
                <h1 className="font-bold text-lg flex-1 text-center pr-10">Sổ Liên Lạc</h1>
            </div>

            <div ref={printRef} className="p-4 space-y-6 max-w-2xl mx-auto print:max-w-none print:p-8">
                {/* Print Header - specific for PDF export */}
                <div className="hidden print:block text-center mb-8 border-b-2 border-brand-blue pb-6">
                    <h1 className="text-3xl font-black text-brand-blue mb-2">SỔ LIÊN LẠC HỌC TẬP</h1>
                    <p className="text-slate-600 font-bold text-lg">ENGO Education - English for Kids</p>
                    <div className="mt-4 p-4 bg-slate-50 rounded-xl flex justify-between text-left">
                        <div>
                            <p className="font-bold text-slate-800">Học viên: <span className="text-brand-blue">{user.name}</span></p>
                            <p className="text-slate-500 text-sm">Cấp độ: {currentCourseName}</p>
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-slate-800">Kỳ báo cáo: <span className="text-brand-orange">{timeframe === 'week' ? 'Theo Tuần' : 'Theo Tháng'}</span></p>
                            <p className="text-slate-500 text-sm">Ngày xuất: {new Date().toLocaleDateString('vi-VN')}</p>
                        </div>
                    </div>
                </div>

                {/* On-screen Student & Course Info */}
                <Card className="p-5 bg-gradient-to-r from-brand-blue to-blue-500 border-none shadow-lg print:hidden flex justify-between items-center relative overflow-hidden mb-8">
                    {/* Decorative Background Elements */}
                    <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
                    <div className="absolute right-10 -bottom-10 w-24 h-24 bg-brand-yellow/20 rounded-full blur-xl pointer-events-none"></div>

                    <div className="flex items-center gap-4 relative z-10 w-full">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl border-2 border-white/30 flex items-center justify-center font-black text-white text-3xl shadow-inner">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                            <p className="font-black text-white text-2xl tracking-tight leading-none mb-2">{user.name}</p>
                            <div className="flex items-center gap-2">
                                <span className="text-blue-100 text-sm font-medium">Khóa học:</span>
                                <select
                                    className="bg-white/20 backdrop-blur-md border border-white/30 text-white font-bold text-sm rounded-xl px-3 py-1.5 focus:outline-none cursor-pointer hover:bg-white/30 transition-colors shadow-sm appearance-none outline-none"
                                    value={selectedCourse}
                                    onChange={(e) => setSelectedCourse(e.target.value)}
                                >
                                    {availableCourses.map(c => <option key={c.id} value={c.id} className="text-slate-800">{c.name}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* 1. Tổng quan */}
                <section>
                    <div className="flex items-center gap-2 mb-3">
                        <Target size={20} className="text-brand-blue" />
                        <h2 className="font-bold text-lg text-slate-800">Tổng quan kết quả</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-3 print:grid-cols-4">
                        <Card className="p-4 bg-blue-50/50 border-none print:border print:border-slate-200">
                            <div className="text-brand-blue mb-2"><BookOpen size={24} /></div>
                            <p className="text-3xl font-black text-slate-800">{stats.completedLessons}</p>
                            <p className="text-xs font-bold text-slate-500 uppercase mt-1">Bài học đã hoàn thành</p>
                        </Card>
                        <Card className="p-4 bg-orange-50/50 border-none print:border print:border-slate-200">
                            <div className="text-brand-orange mb-2"><Target size={24} /></div>
                            <p className="text-3xl font-black text-slate-800">{stats.avgScore}%</p>
                            <p className="text-xs font-bold text-slate-500 uppercase mt-1">Điểm trung bình</p>
                        </Card>
                        <Card className="p-4 bg-green-50/50 border-none print:border print:border-slate-200">
                            <div className="text-green-500 mb-2"><CheckCircle2 size={24} /></div>
                            <p className="text-3xl font-black text-slate-800">{stats.correctRate}%</p>
                            <p className="text-xs font-bold text-slate-500 uppercase mt-1">Tỷ lệ trả lời đúng</p>
                        </Card>
                        <Card className="p-4 bg-purple-50/50 border-none print:border print:border-slate-200">
                            <div className="text-purple-500 mb-2"><Clock size={24} /></div>
                            <p className="text-2xl font-black text-slate-800 mt-1">{stats.studyTime}</p>
                            <p className="text-xs font-bold text-slate-500 uppercase mt-1">Tổng thời gian học</p>
                        </Card>
                    </div>
                </section>

                {/* 2. So sánh tiến độ */}
                <section>
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <TrendingUp size={20} className="text-brand-orange" />
                            <h2 className="font-bold text-lg text-slate-800">Tiến độ học tập</h2>
                        </div>
                        {/* Timeframe Toggle */}
                        <div className="bg-slate-200 rounded-lg p-1 flex gap-1 print:hidden">
                            <button
                                onClick={() => { setTimeframe('week'); setSelectedPeriod('w2-m3') }}
                                className={`px-3 py-1 font-bold text-xs rounded-md transition-colors ${timeframe === 'week' ? 'bg-white text-brand-blue shadow-sm' : 'text-slate-500'}`}
                            >
                                Theo Tuần
                            </button>
                            <button
                                onClick={() => { setTimeframe('month'); setSelectedPeriod('m3-2026') }}
                                className={`px-3 py-1 font-bold text-xs rounded-md transition-colors ${timeframe === 'month' ? 'bg-white text-brand-blue shadow-sm' : 'text-slate-500'}`}
                            >
                                Theo Tháng
                            </button>
                        </div>
                    </div>
                    <Card className="p-5 bg-white border-none shadow-sm print:border print:border-slate-200">
                        {/* Period Selector Dropdown */}
                        <div className="mb-4 print:hidden">
                            <select
                                value={selectedPeriod}
                                onChange={(e) => setSelectedPeriod(e.target.value)}
                                className="w-full sm:w-auto bg-slate-50 border border-slate-200 text-slate-700 font-bold text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-brand-blue"
                            >
                                {timeframe === 'week'
                                    ? [
                                        { id: 'w1-m1', label: 'Tuần 1 (Tháng 1/2026)' },
                                        { id: 'w2-m1', label: 'Tuần 2 (Tháng 1/2026)' },
                                        { id: 'w3-m1', label: 'Tuần 3 (Tháng 1/2026)' },
                                        { id: 'w4-m1', label: 'Tuần 4 (Tháng 1/2026)' },
                                        { id: 'w1-m2', label: 'Tuần 1 (Tháng 2/2026)' },
                                        { id: 'w2-m2', label: 'Tuần 2 (Tháng 2/2026)' },
                                        { id: 'w3-m2', label: 'Tuần 3 (Tháng 2/2026)' },
                                        { id: 'w4-m2', label: 'Tuần 4 (Tháng 2/2026)' },
                                        { id: 'w1-m3', label: 'Tuần 1 (Tháng 3/2026)' },
                                        { id: 'w2-m3', label: 'Tuần 2 (Tháng 3/2026)' },
                                    ].map(w => <option key={w.id} value={w.id}>{w.label}</option>)
                                    : [
                                        { id: 'm1-2026', label: 'Tháng 1/2026' },
                                        { id: 'm2-2026', label: 'Tháng 2/2026' },
                                        { id: 'm3-2026', label: 'Tháng 3/2026' },
                                    ].map(m => <option key={m.id} value={m.id}>{m.label}</option>)
                                }
                            </select>
                        </div>

                        <div className="flex justify-between items-end mb-6">
                            <div>
                                <p className="text-sm font-bold text-slate-500">Tiến bộ so với {progress.periodLabel} trước</p>
                                <p className={`text-3xl font-black ${progress.improvement >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                    {progress.improvement >= 0 ? '+' : ''}{progress.improvement}% {progress.improvement >= 0 ? '🚀' : '📉'}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-bold text-slate-800">Kỳ này: {progress.current}%</p>
                                <p className="text-sm text-slate-500">Kỳ trước: {progress.previous}%</p>
                            </div>
                        </div>
                        {/* Simple Bar Chart */}
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                                    <span>Kỳ trước</span>
                                    <span>{progress.previous}%</span>
                                </div>
                                <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-slate-300 rounded-full transition-all duration-1000" style={{ width: `${progress.previous}%` }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                                    <span className="text-brand-orange">Kỳ này</span>
                                    <span className="text-brand-orange">{progress.current}%</span>
                                </div>
                                <div className="h-4 bg-orange-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-brand-orange rounded-full relative transition-all duration-1000" style={{ width: `${progress.current}%` }}>
                                        {/* Highlight improvement */}
                                        {progress.improvement > 0 && (
                                            <div className="absolute top-0 right-0 h-full bg-green-400 opacity-60" style={{ width: `${(progress.improvement / progress.current) * 100}%` }}></div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </section>

                {/* 3. Điểm mạnh / Yếu */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-2">
                    <section>
                        <div className="flex items-center gap-2 mb-3">
                            <Star size={20} className="text-yellow-400 fill-yellow-400" />
                            <h2 className="font-bold text-lg text-slate-800">Nội dung học tốt</h2>
                        </div>
                        <Card className="p-0 bg-white border-none shadow-sm overflow-hidden print:border print:border-slate-200">
                            <div className="divide-y divide-slate-100">
                                {strengths.map((item, idx) => (
                                    <div key={idx} className="p-4 flex justify-between items-center">
                                        <span className="font-bold text-slate-700">{item.topic}</span>
                                        <span className="font-black text-green-500">{item.score}%</span>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </section>

                    <section>
                        <div className="flex items-center gap-2 mb-3">
                            <AlertCircle size={20} className="text-red-400" />
                            <h2 className="font-bold text-lg text-slate-800">Nội dung cần cải thiện</h2>
                        </div>
                        <Card className="p-4 bg-white border-none shadow-sm print:border print:border-slate-200">
                            <ul className="space-y-3">
                                {weaknesses.map((item, idx) => (
                                    <li key={idx} className="flex items-start gap-2">
                                        <div className="mt-1 w-1.5 h-1.5 rounded-full bg-red-400 shrink-0"></div>
                                        <span className="font-medium text-slate-600">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </Card>
                    </section>
                </div>

                {/* 4. Lỗi thường gặp */}
                <section>
                    <div className="flex items-center gap-2 mb-3">
                        <XCircle size={20} className="text-red-500" />
                        <h2 className="font-bold text-lg text-slate-800">Các lỗi thường gặp</h2>
                    </div>
                    <Card className="p-5 bg-red-50/50 border-none print:border print:border-red-100">
                        <div className="mb-4">
                            <h3 className="font-bold text-slate-700 mb-2">Từ vựng sai:</h3>
                            <div className="flex flex-wrap gap-2">
                                {mistakes.vocab.map((word, idx) => (
                                    <span key={idx} className="bg-white px-3 py-1 rounded-lg border border-red-200 text-red-600 font-bold text-sm">
                                        {word}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-700 mb-2">Ngữ pháp:</h3>
                            <ul className="space-y-2">
                                {mistakes.grammar.map((item, idx) => (
                                    <li key={idx} className="bg-white p-3 rounded-lg border border-red-200">
                                        <p className="text-slate-500 line-through text-sm">"{item.wrong}"</p>
                                        <p className="text-green-600 font-bold text-sm flex items-center gap-1 mt-1">
                                            <CheckCircle2 size={14} /> "{item.right}"
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </Card>
                </section>

                {/* 5. Gợi ý ôn tập */}
                <section>
                    <div className="flex items-center gap-2 mb-3">
                        <Lightbulb size={20} className="text-brand-yellow" />
                        <h2 className="font-bold text-lg text-slate-800">Gợi ý ôn tập</h2>
                    </div>
                    <Card className="p-5 bg-brand-lightBlue/30 border-none print:border print:border-blue-100">
                        <ul className="space-y-3">
                            {suggestions.map((item, idx) => (
                                <li key={idx} className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center font-bold text-brand-blue shrink-0 shadow-sm text-sm">
                                        {idx + 1}
                                    </div>
                                    <span className="font-bold text-brand-blue">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </Card>
                </section>

                {/* Print Footer Text */}
                <div className="hidden print:block text-center mt-12 text-slate-400 text-sm">
                    <p>Báo cáo được tạo tự động bởi hệ thống tiếng Anh ENGO.</p>
                    <p>Để biết thêm chi tiết, phụ huynh vui lòng truy cập app ENGO.</p>
                </div>
            </div>

            {/* 6. Export Button */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-slate-100 print:hidden z-50 animate-in fade-in slide-in-from-bottom-4">
                <Button onClick={handlePrint} className="w-full max-w-sm mx-auto flex items-center justify-center gap-2 py-4 rounded-2xl shadow-lg">
                    <Download size={20} />
                    Xuất báo cáo PDF
                </Button>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    @page { margin: 0; }
                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                }
            `}} />
        </div>
    )
}

export default ContactBookScreen
