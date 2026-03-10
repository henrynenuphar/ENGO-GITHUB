import React, { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Mascot } from '@/components/common/Mascot'
import { VIOLYMPIC_ROOMS } from '@/data/violympicQuestions'
import { Users, Star, PlusCircle, Lock, X } from 'lucide-react'

interface RoomSelectionProps {
    onSelectRoom: (roomId: string) => void
}

export const RoomSelection = ({ onSelectRoom }: RoomSelectionProps) => {
    const [activeTab, setActiveTab] = useState<'available' | 'create'>('available')
    const [selectedRoomWithPin, setSelectedRoomWithPin] = useState<{id: string, name: string, pin?: string} | null>(null)
    const [pinInput, setPinInput] = useState('')
    const [pinError, setPinError] = useState(false)

    const handleRoomClick = (room: any) => {
        if (room.pin) {
            setSelectedRoomWithPin(room)
            setPinInput('')
            setPinError(false)
        } else {
            onSelectRoom(room.id)
        }
    }

    const handlePinSubmit = () => {
        if (selectedRoomWithPin && pinInput === selectedRoomWithPin.pin) {
            onSelectRoom(selectedRoomWithPin.id)
        } else {
            setPinError(true)
        }
    }

    return (
        <div className="flex flex-col items-center p-6 text-center flex-1 w-full animate-in fade-in duration-500 overflow-y-auto w-full pt-10">
            <Mascot mood="happy" size="md" className="mb-4 drop-shadow-lg" />

            <div className="space-y-1 mb-8">
                <h2 className="text-[32px] font-black text-brand-blue drop-shadow-sm tracking-tight uppercase">
                    CHỌN PHÒNG THI
                </h2>
                <p className="text-slate-500 font-medium text-lg">
                    Hãy chọn phòng phù hợp với độ tuổi của con nhé!
                </p>
            </div>

            {/* Custom Tabs */}
            <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-8 w-full max-w-lg shadow-inner border border-slate-200/50">
                <button
                    onClick={() => setActiveTab('available')}
                    className={`flex-1 py-3 px-6 rounded-xl font-bold text-[15px] transition-all duration-300 ${activeTab === 'available' ? 'bg-white text-slate-800 shadow-sm scale-[1.02]' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Phòng có sẵn
                </button>
                <button
                    onClick={() => setActiveTab('create')}
                    className={`flex-1 py-3 px-6 rounded-xl font-bold text-[15px] transition-all duration-300 ${activeTab === 'create' ? 'bg-white text-slate-800 shadow-sm scale-[1.02]' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Tự tạo phòng
                </button>
            </div>

            {/* Tab Content: Available Rooms */}
            {activeTab === 'available' && (
                <div className="w-full max-w-xl space-y-5 pb-10">
                    {VIOLYMPIC_ROOMS.map((room, idx) => {
                        // Matching the design colors
                        const colors = [
                            'bg-gradient-to-tr from-[#3b82f6] to-[#60a5fa] shadow-[#3b82f6]/30', // Blue
                            'bg-gradient-to-tr from-[#22c55e] to-[#4ade80] shadow-[#22c55e]/30', // Green
                            'bg-gradient-to-tr from-[#a855f7] to-[#c084fc] shadow-[#a855f7]/30'  // Purple
                        ]

                        return (
                            <button
                                key={room.id}
                                className={`w-full relative group text-left overflow-hidden rounded-[2rem] transition-all duration-300 hover:scale-[1.02] shadow-xl ${colors[idx % colors.length]}`}
                                onClick={() => handleRoomClick(room)}
                            >
                                {/* Decorative elements */}
                                <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full translate-x-12 -translate-y-12 blur-2xl"></div>
                                <div className="absolute left-0 bottom-0 w-24 h-24 bg-black/5 rounded-full -translate-x-8 translate-y-8 blur-xl"></div>

                                <div className="relative z-10 flex items-center justify-between p-7 text-white">
                                    <div className="flex flex-col items-start gap-3">
                                        <div className="flex items-center gap-1.5 bg-white/20 px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider backdrop-blur-sm border border-white/10">
                                            <Star size={12} className="text-yellow-300 fill-yellow-300" />
                                            <span>VIOLYMPIC</span>
                                        </div>

                                        <h3 className="text-3xl font-black drop-shadow-sm tracking-tight">{room.name}</h3>

                                        <div className="flex items-center gap-2 text-white/90 text-[13px] font-bold mt-1 bg-black/10 px-3 py-1.5 rounded-lg border border-white/5 backdrop-blur-sm">
                                            <Users size={16} />
                                            <span>Đang chờ: {Math.floor(Math.random() * 19) + 1} người</span>
                                        </div>
                                        {room.pin && (
                                            <div className="flex items-center gap-1.5 bg-black/20 px-2 py-1 rounded-md text-xs font-bold mt-1">
                                                <Lock size={12} className="text-yellow-300" />
                                                <span className="text-yellow-300">Phòng Khóa</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Circular Action Button */}
                                    <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-3xl backdrop-blur-md shadow-lg border border-white/20 group-hover:bg-white/30 group-hover:shadow-xl transition-all mr-2">
                                        👉
                                    </div>
                                </div>
                            </button>
                        )
                    })}
                </div>
            )}

            {/* Tab Content: Create Room */}
            {activeTab === 'create' && (
                <div className="w-full max-w-xl py-12 px-6 flex flex-col items-center justify-center bg-white rounded-[2rem] border-2 border-dashed border-slate-200">
                    <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6 border border-blue-100">
                        <PlusCircle size={40} className="text-brand-blue" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-800 mb-2">Tính năng đang phát triển</h3>
                    <p className="text-slate-500 font-medium text-center max-w-sm">
                        Tính năng tự tạo phòng thi đấu cùng bạn bè sẽ sớm được ra mắt. Hãy tiếp tục theo dõi nhé!
                    </p>
                    <button
                        onClick={() => setActiveTab('available')}
                        className="mt-8 bg-brand-blue hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-md shadow-blue-500/20"
                    >
                        Quay lại Phòng có sẵn
                    </button>
                </div>
            )}

            {/* PIN Modal */}
            {selectedRoomWithPin && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl relative animate-in zoom-in-95 duration-300">
                        <button 
                            onClick={() => setSelectedRoomWithPin(null)}
                            className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors"
                        >
                            <X size={20} />
                        </button>
                        
                        <div className="flex flex-col items-center text-center mt-2 mb-6">
                            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4 text-yellow-500">
                                <Lock size={32} />
                            </div>
                            <h3 className="text-2xl font-black text-slate-800">Nhập mã PIN</h3>
                            <p className="text-slate-500 font-medium text-sm mt-1">
                                Phòng thi {selectedRoomWithPin.name} yêu cầu mã bảo mật
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <input 
                                    type="password"
                                    pattern="[0-9]*"
                                    inputMode="numeric"
                                    placeholder="----"
                                    maxLength={4}
                                    value={pinInput}
                                    onChange={(e) => {
                                        setPinInput(e.target.value.replace(/[^0-9]/g, ''))
                                        setPinError(false)
                                    }}
                                    onKeyDown={(e) => e.key === 'Enter' && handlePinSubmit()}
                                    className={`w-full text-center text-3xl tracking-[1em] font-black p-4 rounded-xl border-2 transition-colors ${pinError ? 'border-red-400 bg-red-50 text-red-600' : 'border-slate-200 bg-slate-50 text-slate-800 focus:border-brand-blue focus:bg-white'}`}
                                    autoFocus
                                />
                                {pinError && <p className="text-red-500 text-sm font-bold text-center mt-2 animate-in slide-in-from-top-1">Mã PIN không đúng, vui lòng thử lại!</p>}
                            </div>
                            
                            <button
                                onClick={handlePinSubmit}
                                className="w-full bg-brand-blue hover:bg-blue-600 text-white font-black py-4 rounded-xl transition-all shadow-md shadow-blue-500/20 text-lg"
                            >
                                VÀO PHÒNG
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
