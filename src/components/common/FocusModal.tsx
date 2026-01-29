import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Mascot } from '@/components/common/Mascot'
import { useFocus } from '@/context/FocusContext'

interface FocusModalProps {
    isOpen: boolean
    onClose: () => void
}

export const FocusModal = ({ isOpen, onClose }: FocusModalProps) => {
    const { startFocus } = useFocus()

    const handleStart = () => {
        startFocus(20) // Start 20 min timer
        onClose()
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-blue/90 backdrop-blur-md p-6"
                >
                    <motion.div
                        initial={{ scale: 0.8, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, y: 50 }}
                        className="w-full max-w-sm"
                    >
                        <Card className="bg-white dark:bg-slate-900 border-none shadow-2xl overflow-visible relative mt-20 p-8 rounded-[3rem]">
                            {/* Mascot peeking out - Larger */}
                            <div className="absolute -top-24 left-1/2 -translate-x-1/2 scale-125">
                                <Mascot mood="focus" size="md" />
                            </div>

                            <div className="pt-10 text-center space-y-4">
                                <h2 className="text-2xl font-black text-brand-blue uppercase leading-tight">
                                    CHO PHÉP BẬT<br />CHẾ ĐỘ TẬP TRUNG HỌC
                                </h2>

                                <p className="text-slate-500 dark:text-slate-300 font-medium">
                                    Chế độ này giúp con học tập tốt hơn bằng cách hạn chế xao nhãng.
                                </p>

                                <div className="flex flex-col gap-3 pt-4">
                                    <Button
                                        onClick={handleStart}
                                        className="w-full h-14 text-lg font-bold shadow-xl shadow-brand-blue/30 rounded-2xl animate-bounce-slow"
                                        size="lg"
                                    >
                                        Bật chế độ tập trung
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        onClick={onClose}
                                        className="text-slate-400 font-bold hover:bg-transparent hover:text-slate-600 dark:hover:text-slate-200"
                                    >
                                        Để sau
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
