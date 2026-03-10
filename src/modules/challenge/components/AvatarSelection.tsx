import React, { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { AVATARS } from '@/data/avatars'

interface AvatarSelectionProps {
    onSelectAvatar: (avatarId: string) => void
}

export const AvatarSelection = ({ onSelectAvatar }: AvatarSelectionProps) => {
    const [selected, setSelected] = useState<string | null>(null)

    return (
        <div className="flex flex-col flex-1 w-full max-w-lg mx-auto p-4 animate-in fade-in duration-300">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-black text-slate-800">CHỌN NHÂN VẬT</h2>
                <p className="text-sm text-slate-500 font-medium">Bé muốn hóa thân thành con vật nào?</p>
            </div>

            <Card className="flex-1 overflow-y-auto p-4 bg-white/50 border-slate-100 shadow-sm mb-4">
                <div className="grid grid-cols-4 gap-3">
                    {AVATARS.map((avatar) => {
                        const isSelected = selected === avatar.id
                        return (
                            <div
                                key={avatar.id}
                                onClick={() => setSelected(avatar.id)}
                                className={`aspect-square rounded-2xl border-4 cursor-pointer overflow-hidden transition-all ${isSelected
                                    ? 'border-brand-orange bg-orange-50 scale-105 shadow-md shadow-orange-500/20'
                                    : 'border-transparent bg-slate-100/80 hover:bg-slate-200/80'
                                    } relative flex flex-col items-center justify-center p-1`}
                            >
                                <img
                                    src={avatar.image}
                                    alt={avatar.name}
                                    className="w-full h-full object-contain mb-1"
                                    onError={(e) => {
                                        // Fallback icon if image fails to load
                                        (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/bottts/svg?seed=${avatar.name}&backgroundColor=transparent`
                                    }}
                                />
                                <span className={`text-[10px] font-bold text-center w-full truncate px-1 rounded absolute bottom-1 ${isSelected ? 'text-brand-orange bg-white/80' : 'text-slate-500'}`}>
                                    {avatar.name}
                                </span>
                            </div>
                        )
                    })}
                </div>
            </Card>

            <Button
                onClick={() => selected && onSelectAvatar(selected)}
                disabled={!selected}
                className={`w-full py-4 text-lg font-black shadow-xl transition-all ${selected ? 'bg-brand-orange hover:bg-orange-600 shadow-orange-500/30' : 'bg-slate-300 text-slate-500 opacity-50'}`}
            >
                {selected ? 'SẴN SÀNG THI ĐẤU!' : 'HÃY CHỌN 1 NHÂN VẬT'}
            </Button>
        </div>
    )
}
