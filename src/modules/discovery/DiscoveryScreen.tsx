import React, { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Mascot } from '@/components/common/Mascot'
import { Check, ArrowRight, Lock, Baby } from 'lucide-react'
import { GRADES as STUDY_GRADES } from '@/modules/study/StudyPlanSetup' // We can reuse or redefine. Re-defining for now to match style.
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
import { useNavigate } from 'react-router-dom'

const DiscoveryScreen = () => {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [selectedGrade, setSelectedGrade] = useState<number | string | null>(null)
    const [selectedPackage, setSelectedPackage] = useState<string | null>(null)

    // Modal State
    const [showPaywall, setShowPaywall] = useState(false)
    const [selectedGradeForPaywall, setSelectedGradeForPaywall] = useState('')

    const handleGradeSelect = (gradeId: number | string) => {
        // Access Control Logic
        const isVipUser = user?.phone === '0832242783'
        const isUnlocked = gradeId === 5 && isVipUser

        if (isUnlocked) {
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
                        const isUnlocked = grade.id === 5 && isVipUser

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

    // Embed Subscription / Package Selection View directly here
    return (
        <div className="p-6 space-y-6 pb-24 min-h-screen bg-slate-50">
            <button onClick={() => { setSelectedGrade(null); setSelectedPackage(null) }} className="text-sm text-slate-400 font-bold hover:text-brand-blue flex items-center gap-1">
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
                    className={`border-2 rounded-2xl p-6 transition-all cursor-pointer relative bg-white ${selectedPackage === 'basic' ? 'border-brand-blue ring-4 ring-blue-50' : 'border-slate-200 hover:border-brand-blue/30'}`}
                >
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-bold text-slate-700">Gói Basic</h3>
                        {selectedPackage === 'basic' && <div className="bg-brand-blue text-white p-1 rounded-full"><Check size={14} /></div>}
                    </div>
                    <p className="text-3xl font-black text-slate-800 mb-4">
                        499k <span className="text-sm font-medium text-slate-400">/năm</span>
                    </p>
                    <ul className="space-y-3 mb-6 text-sm text-slate-600 text-left">
                        <li className="flex gap-2"><Check size={16} className="text-green-500 shrink-0" /> Mở khóa toàn bộ bài học</li>
                        <li className="flex gap-2"><Check size={16} className="text-green-500 shrink-0" /> Luyện từ vựng & ngữ pháp</li>
                        <li className="flex gap-2"><Check size={16} className="text-slate-300 shrink-0" /> <span className="line-through opacity-50">Luyện nói AI chấm điểm</span></li>
                    </ul>
                </div>

                {/* Pro Plan */}
                <div
                    onClick={() => setSelectedPackage('pro')}
                    className={`border-2 rounded-2xl p-6 relative overflow-hidden transition-all cursor-pointer ${selectedPackage === 'pro' ? 'border-brand-orange ring-4 ring-orange-100 bg-orange-50/50' : 'border-brand-orange/50 bg-white hover:bg-orange-50/30'}`}
                >
                    <div className="absolute top-0 right-0 bg-brand-orange text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                        Phổ biến nhất
                    </div>
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-bold text-brand-orange">Gói Pro</h3>
                        {selectedPackage === 'pro' && <div className="bg-brand-orange text-white p-1 rounded-full"><Check size={14} /></div>}
                    </div>
                    <p className="text-3xl font-black text-slate-800 mb-4">
                        899k <span className="text-sm font-medium text-slate-400">/năm</span>
                    </p>
                    <ul className="space-y-3 mb-6 text-sm text-slate-700 text-left">
                        <li className="flex gap-2"><Check size={16} className="text-brand-orange shrink-0" /> <strong>Tất cả quyền lợi Basic</strong></li>
                        <li className="flex gap-2"><Check size={16} className="text-brand-orange shrink-0" /> Luyện nói AI 1-1</li>
                        <li className="flex gap-2"><Check size={16} className="text-brand-orange shrink-0" /> Chấm điểm phát âm chi tiết</li>
                        <li className="flex gap-2"><Check size={16} className="text-brand-orange shrink-0" /> Chứng chỉ hoàn thành</li>
                    </ul>
                </div>
            </div>

            <div className="fixed bottom-24 left-0 right-0 px-6">
                <Button
                    disabled={!selectedPackage}
                    onClick={handleConfirm}
                    className={`w-full shadow-xl h-14 text-lg font-bold transition-all ${selectedPackage === 'pro' ? 'bg-brand-orange hover:bg-orange-600 shadow-orange-500/30' : 'bg-brand-blue hover:bg-blue-600 shadow-brand-blue/30'}`}
                >
                    {selectedPackage ? `Đăng ký gói ${selectedPackage === 'basic' ? 'Basic' : 'Pro'} ngay` : 'Chọn gói học'} <ArrowRight className="ml-2" />
                </Button>
            </div>
        </div>
    )
}

export default DiscoveryScreen
