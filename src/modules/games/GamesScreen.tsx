import { Card } from '@/components/ui/Card'
import { Grid, Award } from 'lucide-react'

import { useNavigate } from 'react-router-dom'

const GamesScreen = () => {
    const navigate = useNavigate()
    const games = [
        { id: 2, title: 'Cool Pair Matching', icon: Award, color: 'bg-green-500' },
        { id: 4, title: 'Smart Monkey', icon: Grid, color: 'bg-orange-500' }, // New Smart Monkey
    ]

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-800">Game Center 🎮</h1>

            <div className="grid grid-cols-2 gap-4">
                {games.map((game) => (
                    <Card
                        key={game.id}
                        variant="interactive"
                        className="aspect-square flex flex-col items-center justify-center gap-4 text-center"
                        onClick={() => {
                            if (game.id === 2) navigate('/app/games/cool-pair')
                            if (game.id === 4) navigate('/app/games/smart-monkey')
                        }}
                    >
                        <div className={`w-16 h-16 ${game.color} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
                            <game.icon size={32} />
                        </div>
                        <h3 className="font-bold text-slate-700 leading-tight">{game.title}</h3>
                    </Card>
                ))}
            </div>
        </div>
    )
}

export default GamesScreen
