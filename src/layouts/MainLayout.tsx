import React, { useEffect } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { Home, Gamepad2, User, BookOpen, Compass, BookA, Lightbulb, Menu } from 'lucide-react'
import { cn } from '@/components/ui/Button'
import { useFocus } from '@/context/FocusContext'
import { useAuth } from '@/context/UserContext'
import logoImg from '@/assets/images/logo_khi.png'

const MainLayout = () => {
    const navigate = useNavigate()
    const { isActive, timeLeft } = useFocus()
    const { user } = useAuth()

    useEffect(() => {
        if (!user) {
            navigate('/login', { replace: true })
        }
    }, [user, navigate])

    if (!user) return null // Prevent flash of content

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')} `
    }

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-slate-950 transition-colors overflow-hidden">
            {/* --- DESKTOP SIDEBAR (Visible on md+) --- */}
            <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-xl z-20">
                <div className="h-20 flex items-center px-6 gap-3 border-b border-slate-100 dark:border-slate-800">
                    <img src={logoImg} alt="ENGO Logo" className="w-10 h-10 object-contain drop-shadow-md shrink-0" />
                    <span className="font-black text-brand-blue text-xl tracking-tight">ENGO</span>
                </div>

                <nav className="flex-1 flex flex-col p-4 gap-2 overflow-y-auto">
                    <SidebarItem to="/app/dashboard" icon={Home} label="Dashboard" />
                    <SidebarItem to="/app/study" icon={BookOpen} label="Study Plan" />
                    <SidebarItem to="/app/discovery" icon={Compass} label="Discovery" />
                    <SidebarItem to="/app/dictionary" icon={BookA} label="Dictionary" />
                    <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
                        <SidebarItem to="/app/profile" icon={User} label="My Account" />
                    </div>
                </nav>

                {/* Desktop Timer */}
                {isActive && (
                    <div className="p-4 bg-brand-lightBlue dark:bg-slate-800 m-4 rounded-xl border border-brand-blue/20">
                        <div className="flex items-center gap-2 text-brand-blue font-bold mb-1">
                            <Lightbulb size={18} /> Focus Mode
                        </div>
                        <div className="text-2xl font-mono font-bold text-slate-800 dark:text-white">
                            {formatTime(timeLeft)}
                        </div>
                    </div>
                )}
            </aside>

            {/* --- MAIN CONTENT WRAPPER --- */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
                {/* Mobile Top Bar (Hidden on md+) */}
                <header className="md:hidden h-16 flex items-center justify-between px-4 bg-brand-lightBlue dark:bg-slate-800 transition-colors shrink-0 z-10 relative">
                    <div className="flex items-center gap-2">
                        <img src={logoImg} alt="ENGO Logo" className="w-9 h-9 object-contain drop-shadow-md shrink-0" />
                        <span className="font-black text-brand-blue text-lg tracking-tight">ENGO</span>
                    </div>

                    {/* Active Timer Display (Mobile) */}
                    {isActive && (
                        <div className="absolute left-1/2 -translate-x-1/2 bg-brand-orange text-white px-3 py-1 rounded-full font-mono font-bold text-sm shadow-md flex items-center gap-2 animate-pulse">
                            <Lightbulb size={14} fill="white" />
                            {formatTime(timeLeft)}
                        </div>
                    )}

                    <div className="flex gap-2">
                        <span className="bg-white dark:bg-slate-700 px-3 py-1 rounded-full text-brand-orange font-bold text-xs shadow-sm border border-slate-100 dark:border-slate-600 flex items-center gap-1">
                            ⭐ {user?.xp || 0}
                        </span>
                    </div>
                </header>

                {/* --- SCROLLABLE PAGE CONTENT --- */}
                <main className="flex-1 overflow-y-auto scroll-smooth p-4 pb-24 md:pb-8 md:p-8">
                    {/* Container to prevent stretching on giant screens */}
                    <div className="max-w-5xl mx-auto w-full">
                        <Outlet />
                    </div>
                </main>

                {/* Mobile Bottom Navigation (Hidden on md+) */}
                <nav className="md:hidden absolute bottom-0 left-0 right-0 h-20 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 flex items-center justify-around px-2 z-50 rounded-t-3xl shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
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

const SidebarItem = ({ to, icon: Icon, label }: { to: string, icon: any, label: string }) => (
    <NavLink
        to={to}
        className={({ isActive }) => cn(
            "flex items-center gap-3 p-3 rounded-xl transition-all font-bold text-sm",
            isActive
                ? "bg-brand-lightBlue text-brand-blue dark:bg-slate-800 dark:text-blue-400 shadow-sm"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
        )}
    >
        <Icon size={20} strokeWidth={2.5} />
        <span>{label}</span>
    </NavLink>
)

export default MainLayout
