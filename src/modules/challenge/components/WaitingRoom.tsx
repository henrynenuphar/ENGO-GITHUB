declare global { interface Window { __matchStartTime?: number } }

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Users, Clock } from 'lucide-react'
import { AVATARS } from '@/data/avatars'
import { socket } from '@/lib/socket'
import { useAuth } from '@/context/UserContext'

export const WaitingRoom = ({ roomId, userAvatarId, onStart }: { roomId: string, userAvatarId: string, onStart: () => void }) => {
    const [timeLeft, setTimeLeft] = useState<number | null>(null) // Null until we get server update
    const [players, setPlayers] = useState<any[]>([])
    const { user } = useAuth()

    const userAvatarUrl = AVATARS.find(a => a.id === userAvatarId)?.image || AVATARS[0].image

    // WebSockets connection
    useEffect(() => {
        if (!socket.connected) {
            socket.connect()
        }
        
        socket.emit('join_room', { 
            roomId, 
            player: { name: user?.name || 'Khách', avatarImage: userAvatarUrl } 
        })
        
        const handleStateUpdate = (payload: any) => {
            if (Array.isArray(payload)) setPlayers(payload)
            else if (payload.players) setPlayers(payload.players)
        }
        
        const handleTimerUpdate = (time: number) => {
            setTimeLeft(time)
        }

        const handleStartGame = () => {
            onStart()
        }
        
        socket.on('room_state_update', handleStateUpdate)
        socket.on('timer_update', handleTimerUpdate)
        socket.on('start_game', handleStartGame)
        
        return () => {
            socket.off('room_state_update', handleStateUpdate)
            socket.off('timer_update', handleTimerUpdate)
            socket.off('start_game', handleStartGame)
        }
    }, [roomId, userAvatarUrl, user?.name, onStart])

    const formatTime = (seconds: number) => {
        const m = Math.floor(Math.max(0, seconds) / 60)
        const s = Math.max(0, seconds) % 60
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    }

    return (
        <div className="flex flex-col items-center justify-center p-6 text-center space-y-8 flex-1 w-full animate-in fade-in duration-500">
            {/* Header / Title */}
            <div className="space-y-2">
                <div className="inline-block px-3 py-1 bg-yellow-400 text-yellow-900 text-xs font-black rounded-full uppercase tracking-wider mb-2 animate-pulse">
                    Live
                </div>
                <h2 className="text-3xl font-black text-slate-800 drop-shadow-sm">VIOLYMPIC TRỰC TUYẾN</h2>
                <p className="text-slate-500 font-medium">Đang ghép phòng...</p>
            </div>

            {/* Countdown Circle */}
            <Card className="p-8 w-48 h-48 rounded-full border-4 border-brand-blue bg-blue-50/50 shadow-xl flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-brand-blue/10 animate-ping opacity-20"></div>
                <Clock className="text-brand-blue mb-2" size={32} />
                <div className="text-4xl font-black text-slate-800 font-mono tracking-tighter">
                    {timeLeft !== null ? formatTime(timeLeft) : "--:--"}
                </div>
                <p className="text-xs font-bold text-brand-blue uppercase tracking-wider mt-1">Bắt đầu sau</p>
            </Card>

            {/* Players Area */}
            <div className="w-full max-w-sm">
                <div className="flex items-center justify-center gap-2 mb-4">
                    <Users className="text-brand-blue" size={20} />
                    <span className="font-bold text-slate-700">{players.length} đối thủ đang chờ</span>
                </div>

                {/* Visual grid of joining players */}
                <div className="grid grid-cols-5 gap-3 bg-white p-5 rounded-2xl shadow-sm border border-slate-100 min-h-[120px]">
                    {players.map((p, idx) => {
                        const isMe = p.socketId === socket.id;
                        return (
                            <div key={idx} className={`aspect-square rounded-full ${isMe ? 'bg-blue-50 border-brand-blue' : 'bg-slate-50 border-white'} border-2 shadow-md overflow-visible relative flex items-center justify-center p-1 animate-in zoom-in spin-in-12 duration-500`} title={p.name}>
                                <div className="w-full h-full rounded-full overflow-hidden bg-white">
                                    <img src={p.avatarImage} alt="Player" className="w-full h-full object-cover" />
                                </div>
                                {isMe && <div className="absolute -bottom-2 lg:-bottom-1 bg-brand-blue text-white text-[9px] font-black px-2 py-0.5 rounded-full border-2 border-white shadow-sm z-10 whitespace-nowrap">BẠN</div>}
                            </div>
                        )
                    })}
                    {/* Placeholder loading */}
                    {(players.length) < 5 && (
                        <div className="aspect-square rounded-full bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300 animate-pulse">
                            ...
                        </div>
                    )}
                </div>
            </div>

            {/* Action */}
            <Button 
                variant="primary" 
                className={`w-full max-w-sm h-14 text-lg font-black shadow-xl transition-all ${timeLeft !== null && timeLeft <= 0 ? 'bg-brand-blue shadow-blue-500/30 wiggling' : 'bg-slate-300 text-slate-500 opacity-50'}`}
            >
                {timeLeft !== null && timeLeft > 0 ? 'CHỜ ĐỢI...' : 'CHUẨN BỊ VÀO PHÒNG!'}
            </Button>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes wiggle {
                    0%, 100% { transform: rotate(-3deg); }
                    50% { transform: rotate(3deg); }
                }
                .wiggling {
                    animation: wiggle 0.5s ease-in-out infinite;
                }
            `}} />
        </div>
    )
}
