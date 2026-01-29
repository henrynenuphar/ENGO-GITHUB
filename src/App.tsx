import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom'
import { Toaster } from 'sonner'
import MainLayout from '@/layouts/MainLayout'
import LoginScreen from '@/modules/auth/LoginScreen'
import DashboardScreen from '@/modules/dashboard/DashboardScreen'
import StudyScreen from '@/modules/dashboard/StudyScreen'
import ProfileScreen from '@/modules/dashboard/ProfileScreen'
import DiscoveryScreen from '@/modules/discovery/DiscoveryScreen'
import DictionaryScreen from '@/modules/dictionary/DictionaryScreen'
import StudyPlanSetup from '@/modules/study/StudyPlanSetup'
import LessonDetailScreen from '@/modules/study/LessonDetailScreen'

// Welcome Screen (Simple Splash)
const Welcome = () => {
    return (
        <div className="min-h-screen bg-brand-blue flex flex-col items-center justify-center text-white">
            <h1 className="text-4xl font-bold mb-4 animate-bounce">ENGO</h1>
            <p className="mb-8">English for Kids</p>
            <Link to="/login" className="px-6 py-3 bg-white text-brand-blue rounded-full font-bold shadow-lg hover:scale-105 transition-transform">Get Started</Link>
        </div>
    )
}

import { FocusProvider } from '@/context/FocusContext'
import { UserProvider } from '@/context/UserContext'

function App() {
    return (
        <UserProvider>
            <FocusProvider>
                <Router basename={import.meta.env.BASE_URL}>
                    <div className="min-h-screen bg-brand-lightBlue font-sans text-slate-800">
                        <Routes>
                            <Route path="/" element={<Welcome />} />
                            <Route path="/login" element={<LoginScreen />} />

                            <Route path="/app" element={<MainLayout />}>
                                <Route index element={<Navigate to="/app/dashboard" replace />} />
                                <Route path="discovery" element={<DiscoveryScreen />} />
                                <Route path="dictionary" element={<DictionaryScreen />} />
                                <Route path="dashboard" element={<DashboardScreen />} />
                                <Route path="study" element={<StudyScreen />} />
                                <Route path="study/setup" element={<StudyPlanSetup />} />
                                <Route path="study/:lessonId" element={<LessonDetailScreen />} />
                                <Route path="profile" element={<ProfileScreen />} />
                            </Route>
                        </Routes>
                        <Toaster position="top-center" />
                    </div>
                </Router>
            </FocusProvider>
        </UserProvider>
    )
}

export default App
