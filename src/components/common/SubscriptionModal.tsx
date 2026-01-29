import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface SubscriptionModalProps {
    isOpen: boolean
    onClose: () => void
    gradeTitle: string
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose, gradeTitle }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div className="fixed inset-0 bg-black/50 z-50 transition-opacity" onClick={onClose} />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl pointer-events-auto relative max-h-[90vh] overflow-y-auto">
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors z-10"
                            >
                                <X size={20} className="text-slate-500" />
                            </button>

                            <div className="p-8 text-center space-y-2 bg-gradient-to-b from-brand-lightBlue to-white pb-12">
                                <span className="inline-block px-3 py-1 bg-brand-orange text-white text-xs font-bold rounded-full mb-2 uppercase tracking-wider">
                                    Premium Content
                                </span>
                                <h2 className="text-3xl font-black text-slate-800">Mở khóa {gradeTitle}</h2>
                                <p className="text-slate-500 max-w-xs mx-auto">
                                    Để học chương trình này, vui lòng chọn gói học phù hợp với bé.
                                </p>
                            </div>

                            <div className="p-6 pt-0 -mt-6 grid gap-4 grid-cols-1 md:grid-cols-2">
                                {/* Basic Plan */}
                                <div className="border-2 border-slate-200 rounded-2xl p-6 hover:border-brand-blue/30 transition-all cursor-pointer group relative">
                                    <h3 className="text-xl font-bold text-slate-700 mb-2">Gói Basic</h3>
                                    <p className="text-3xl font-black text-slate-800 mb-4">
                                        499k <span className="text-sm font-medium text-slate-400">/năm</span>
                                    </p>
                                    <ul className="space-y-3 mb-6 text-sm text-slate-600 text-left">
                                        <li className="flex gap-2"><Check size={16} className="text-green-500 shrink-0" /> Mở khóa toàn bộ bài học</li>
                                        <li className="flex gap-2"><Check size={16} className="text-green-500 shrink-0" /> Luyện từ vựng & ngữ pháp</li>
                                        <li className="flex gap-2"><Check size={16} className="text-slate-300 shrink-0" /> <span className="line-through opacity-50">Luyện nói AI chấm điểm</span></li>
                                    </ul>
                                    <Button variant="outline" className="w-full font-bold border-2 hover:bg-slate-50">Đăng ký Basic</Button>
                                </div>

                                {/* Pro Plan */}
                                <div className="border-2 border-brand-orange rounded-2xl p-6 bg-orange-50/50 relative overflow-hidden ring-4 ring-orange-100/50">
                                    <div className="absolute top-0 right-0 bg-brand-orange text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                                        Phổ biến nhất
                                    </div>
                                    <h3 className="text-xl font-bold text-brand-orange mb-2">Gói Pro</h3>
                                    <p className="text-3xl font-black text-slate-800 mb-4">
                                        899k <span className="text-sm font-medium text-slate-400">/năm</span>
                                    </p>
                                    <ul className="space-y-3 mb-6 text-sm text-slate-700 text-left">
                                        <li className="flex gap-2"><Check size={16} className="text-brand-orange shrink-0" /> <strong>Tất cả quyền lợi Basic</strong></li>
                                        <li className="flex gap-2"><Check size={16} className="text-brand-orange shrink-0" /> Luyện nói AI 1-1</li>
                                        <li className="flex gap-2"><Check size={16} className="text-brand-orange shrink-0" /> Chấm điểm phát âm chi tiết</li>
                                        <li className="flex gap-2"><Check size={16} className="text-brand-orange shrink-0" /> Chứng chỉ hoàn thành</li>
                                    </ul>
                                    <Button className="w-full bg-brand-orange hover:bg-orange-600 text-white font-bold shadow-lg shadow-orange-500/20 transform hover:scale-105 transition-transform">
                                        Đăng ký Pro ngay
                                    </Button>
                                </div>
                            </div>

                            <p className="text-center text-xs text-slate-400 pb-6 px-6">
                                Liên hệ hotline 1900 1234 để được tư vấn thêm.
                            </p>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}

export default SubscriptionModal
