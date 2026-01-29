import React from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import { Home, Gamepad2, User, BookOpen, Compass, BookA, Lightbulb } from 'lucide-react'
import { cn } from '@/components/ui/Button'
import { useFocus } from '@/context/FocusContext'
import { useAuth } from '@/context/UserContext'

const MainLayout = () => {
    const { isActive, timeLeft } = useFocus()
    const { user } = useAuth()

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')} `
    }

    return (
        <div className="flex flex-col h-screen max-w-md mx-auto bg-white dark:bg-slate-900 shadow-2xl overflow-hidden relative transition-colors">
            {/* Top Bar */}
            <header className="h-16 flex items-center justify-between px-6 bg-brand-lightBlue dark:bg-slate-800 transition-colors">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-brand-blue rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                        E
                    </div>
                    <span className="font-black text-brand-blue text-lg tracking-tight">ENGO</span>
                </div>

                {/* Active Timer Display (Mini) */}
                {isActive && (
                    <div className="absolute left-1/2 -translate-x-1/2 bg-brand-orange text-white px-4 py-1 rounded-full font-mono font-bold text-sm shadow-md flex items-center gap-2 animate-pulse">
                        <Lightbulb size={16} fill="white" />
                        {formatTime(timeLeft)}
                    </div>
                )}

                <div className="flex gap-2">
                    <span className="bg-white dark:bg-slate-700 px-3 py-1 rounded-full text-brand-orange font-bold text-sm shadow-sm border border-slate-100 dark:border-slate-600">
                        ⭐ {user?.xp || 0}
                    </span>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto p-4 pb-24 scroll-smooth">
                <Outlet />
            </main>

            {/* Bottom Navigation */}
            <nav className="absolute bottom-0 left-0 right-0 h-20 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 flex items-center justify-around px-2 z-50 rounded-t-3xl shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
                <NavItem to="/app/discovery" icon={Compass} label="Discovery" />
                <NavItem to="/app/dictionary" icon={BookA} label="Dictionary" />

                {/* Central Action (Home) */}
                <div className="relative -top-6">
                    <NavLink to="/app/dashboard"
                        className={({ isActive }) => cn(
                            "w-16 h-16 rounded-full flex items-center justify-center text-white shadow-xl transition-all border-4 border-white dark:border-slate-900",
                            isActive ? "bg-brand-blue scale-110 shadow-brand-blue/50" : "bg-brand-blue hover:scale-105"
                        )}
                    >
                        <Home size={32} />
                    </NavLink>
                </div>

                <NavItem to="/app/study" icon={BookOpen} label="Study Plan" />
                <NavItem to="/app/profile" icon={User} label="Account" />
            </nav>
        </div>
    )
}

const NavItem = ({ to, icon: Icon, label }: { to: string, icon: any, label: string }) => (
    <NavLink
        to={to}
        className={({ isActive }) => cn(
            "flex flex-col items-center gap-1 p-2 rounded-xl transition-colors min-w-[60px]",
            isActive ? "text-brand-blue" : "text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
        )}
    >
        <Icon size={24} strokeWidth={2.5} />
        <span className="text-[10px] font-bold">{label}</span>
    </NavLink>
)

export default MainLayout
