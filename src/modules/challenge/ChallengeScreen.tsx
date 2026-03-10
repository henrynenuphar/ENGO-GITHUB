import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ChevronLeft } from 'lucide-react'
import { RoomSelection } from './components/RoomSelection'
import { AvatarSelection } from './components/AvatarSelection'
import { WaitingRoom } from './components/WaitingRoom'
import { LiveGame } from './components/LiveGame'
import { ChallengeResult } from './components/ChallengeResult'

type ChallengePhase = 'roomSelection' | 'avatarSelection' | 'waiting' | 'playing' | 'result'

const ChallengeScreen = () => {
    const navigate = useNavigate()
    const [phase, setPhase] = useState<ChallengePhase>('roomSelection')
    const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null)
    const [selectedAvatarId, setSelectedAvatarId] = useState<string | null>(null)
    const [score, setScore] = useState(0)
    const [rank, setRank] = useState(0)

    const handleBack = () => {
        if (phase === 'playing' || phase === 'waiting') {
            if (window.confirm("Bạn có chắc muốn thoát? Kết quả sẽ không được lưu.")) {
                navigate('/app/dashboard')
            }
        } else if (phase === 'avatarSelection') {
            setPhase('roomSelection')
        } else {
            navigate('/app/dashboard')
        }
    }

    const handleSelectRoom = (roomId: string) => {
        setSelectedRoomId(roomId)
        setPhase('avatarSelection')
    }

    const handleSelectAvatar = (avatarId: string) => {
        setSelectedAvatarId(avatarId)
        setPhase('waiting')
    }

    const handleStart = () => setPhase('playing')
    const handleFinish = (finalScore: number, finalRank: number) => {
        setScore(finalScore)
        setRank(finalRank)
        setPhase('result')
    }

    return (
        <div className="min-h-screen bg-brand-lightBlue flex flex-col">
            {/* Header */}
            <div className="bg-white px-4 py-3 flex items-center justify-between shadow-sm sticky top-0 z-20">
                <button onClick={handleBack} className="p-2 -ml-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 transition-colors">
                    <ChevronLeft size={24} />
                </button>
                <div className="flex-1 text-center">
                    <h1 className="font-black text-lg text-slate-800 flex items-center justify-center gap-2">
                        🏆 VIOLYMPIC
                    </h1>
                </div>
                <div className="w-10"></div>{/* Spacer for centering */}
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-y-auto">
                <div className="flex-1 max-w-lg mx-auto w-full flex flex-col p-4">
                    {phase === 'roomSelection' && <RoomSelection onSelectRoom={handleSelectRoom} />}
                    {phase === 'avatarSelection' && <AvatarSelection onSelectAvatar={handleSelectAvatar} />}
                    {phase === 'waiting' && <WaitingRoom roomId={selectedRoomId!} userAvatarId={selectedAvatarId!} onStart={handleStart} />}
                    {phase === 'playing' && <LiveGame roomId={selectedRoomId!} userAvatarId={selectedAvatarId!} onFinish={handleFinish} />}
                    {phase === 'result' && <ChallengeResult score={score} rank={rank} onHome={() => navigate('/app/dashboard')} />}
                </div>
            </div>
        </div>
    )
}

export default ChallengeScreen
