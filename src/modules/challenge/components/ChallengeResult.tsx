import React, { useEffect, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Trophy, Star, Medal, ArrowRight, Sparkles } from 'lucide-react'
import { Mascot } from '@/components/common/Mascot'

export const ChallengeResult = ({ score, rank, onHome }: { score: number, rank: number, onHome: () => void }) => {
    // Determine reward based on rank
    const getReward = () => {
        if (rank === 1) return { stars: 50, title: 'Nhà Vô Địch', color: 'text-yellow-500', bg: 'bg-yellow-50', border: 'border-yellow-400' }
        if (rank <= 3) return { stars: 30, title: 'Xuất Sắc', color: 'text-slate-400', bg: 'bg-slate-50', border: 'border-slate-300' }
        return { stars: 10, title: 'Nỗ Lực', color: 'text-amber-600', bg: 'bg-orange-50', border: 'border-orange-200' }
    }

    const reward = getReward()

    // Confetti effect simulation via multiple tiny divs
    const [confetti, setConfetti] = useState<{ x: number, y: number, color: string, delay: number }[]>([])

    useEffect(() => {
        if (rank <= 3) {
            const colors = ['bg-yellow-400', 'bg-blue-400', 'bg-pink-400', 'bg-green-400', 'bg-purple-400']
            const pieces = Array.from({ length: 30 }).map(() => ({
                x: Math.random() * 100, // percentage left
                y: -20 - Math.random() * 20, // start above
                color: colors[Math.floor(Math.random() * colors.length)],
                delay: Math.random() * 2 // seconds
            }))
            setConfetti(pieces)
        }
    }, [rank])

    return (
        <div className="flex flex-col items-center justify-center p-6 text-center space-y-6 flex-1 w-full relative overflow-hidden animate-in fade-in duration-700">
            {/* Confetti container */}
            {rank <= 3 && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                    {confetti.map((c, i) => (
                        <div
                            key={i}
                            className={`absolute w-3 h-3 rounded-sm ${c.color} opacity-70`}
                            style={{
                                left: `${c.x}%`,
                                top: `${c.y}%`,
                                animation: `fall 3s linear ${c.delay}s infinite`
                            }}
                        />
                    ))}
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes fall {
                    0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
                    100% { transform: translateY(110vh) rotate(360deg); opacity: 0; }
                }
            `}} />

            {/* Header / Title */}
            <div className="space-y-4 z-10 relative mt-4">
                <Mascot mood={rank <= 3 ? "cheer" : "happy"} size="lg" className="mx-auto" />
                <div className="inline-flex items-center justify-center gap-2 px-6 py-2 bg-gradient-to-r from-brand-orange to-yellow-400 text-white rounded-full shadow-lg font-black tracking-widest uppercase transform -rotate-2">
                    <Sparkles size={18} /> Kết Quả Thi Đấu <Sparkles size={18} />
                </div>
            </div>

            {/* Rank Card */}
            <Card className={`p-8 w-full max-w-sm rounded-[2rem] border-4 ${reward.border} ${reward.bg} shadow-2xl flex flex-col items-center justify-center relative overflow-visible z-10`}>
                <div className={`absolute -top-10 w-20 h-20 rounded-full flex items-center justify-center border-4 border-white shadow-lg bg-white ${reward.color}`}>
                    {rank === 1 ? <Trophy size={40} className="fill-current" /> : <Medal size={40} className="fill-current" />}
                </div>

                <div className="mt-8 space-y-1">
                    <h3 className={`text-4xl font-black ${reward.color}`}>TOP {rank}</h3>
                    <p className="font-bold text-slate-500 uppercase tracking-widest text-sm">{reward.title}</p>
                </div>

                <div className="w-full h-px bg-black/5 my-6"></div>

                <div className="w-full grid grid-cols-2 gap-4">
                    <div className="flex flex-col items-center p-3 bg-white rounded-2xl border border-slate-100 shadow-sm">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Điểm số</span>
                        <span className="text-2xl font-black text-brand-blue">{score.toLocaleString()}</span>
                    </div>
                    <div className="flex flex-col items-center p-3 text-yellow-900 bg-gradient-to-br from-yellow-300 to-yellow-400 rounded-2xl shadow-sm border border-yellow-200">
                        <span className="text-xs font-bold uppercase tracking-wider mb-1 opacity-80">Phần thưởng</span>
                        <span className="text-2xl font-black flex items-center gap-1">
                            +{reward.stars} <Star size={20} className="fill-current" />
                        </span>
                    </div>
                </div>
            </Card>

            <p className="text-sm font-medium text-slate-500 max-w-xs mx-auto z-10">
                Chúc mừng con đã hoàn thành xuất sắc vòng thi đấu VIOLYMPIC! Điểm thưởng đã được cộng vào tài khoản.
            </p>

            {/* Action */}
            <div className="w-full max-w-sm pt-4 z-10">
                <Button
                    onClick={onHome}
                    className="w-full h-14 text-lg font-black shadow-xl bg-brand-blue hover:bg-blue-600 shadow-brand-blue/30"
                >
                    <span className="flex items-center justify-center gap-2">
                        NHẬN THƯỞNG & VỀ NHÀ <ArrowRight size={20} />
                    </span>
                </Button>
            </div>
        </div>
    )
}
