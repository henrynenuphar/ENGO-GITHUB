import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mascot } from '@/components/common/Mascot'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { User, ShieldCheck, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/context/UserContext'
import { toast } from 'sonner'

const LoginScreen = () => {
    const navigate = useNavigate()
    const { login } = useAuth()

    // State
    const [role, setRole] = useState<'student' | 'parent'>('student')
    const [phone, setPhone] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)

    // Constants
    const MOCK_PREMIUM_PHONE = '0832242783'
    const MOCK_PREMIUM_PASS = 'henry1403'

    const handleLogin = () => {
        // Validation
        if (!phone || !password) {
            toast.error('Vui lòng nhập đầy đủ số điện thoại và mật khẩu!')
            return
        }

        if (password.length < 8) {
            toast.error('Mật khẩu phải có ít nhất 8 ký tự!')
            return
        }

        // Mock Auth Logic
        if (phone === MOCK_PREMIUM_PHONE) {
            if (password !== MOCK_PREMIUM_PASS) {
                toast.error('Mật khẩu không đúng cho tài khoản VIP này!')
                return
            }
        }

        // Proceed to Login
        login(phone, role)
        navigate('/app/dashboard')
    }

    return (
        <div className="min-h-screen bg-brand-lightBlue flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-blue/10 rounded-full blur-3xl -translate-y-10 translate-x-10"></div>

            <Mascot mood="happy" size="lg" className="mb-8" />

            <Card className="w-full max-w-md bg-white/90 backdrop-blur">
                <h1 className="text-2xl font-bold text-center text-brand-blue mb-2">Chào mừng đến ENGO!</h1>
                <p className="text-center text-slate-500 mb-8">Chọn vai trò để tiếp tục</p>

                <div className="grid grid-cols-2 gap-4 mb-8">
                    <button
                        onClick={() => setRole('student')}
                        className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${role === 'student' ? 'border-brand-blue bg-brand-lightBlue' : 'border-slate-200 hover:border-brand-blue/50'}`}
                    >
                        <div className="w-12 h-12 rounded-full bg-brand-blue text-white flex items-center justify-center">
                            <User />
                        </div>
                        <span className="font-bold text-slate-700">Học sinh</span>
                    </button>

                    <button
                        onClick={() => setRole('parent')}
                        className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${role === 'parent' ? 'border-brand-orange bg-orange-50' : 'border-slate-200 hover:border-brand-orange/50'}`}
                    >
                        <div className="w-12 h-12 rounded-full bg-brand-orange text-white flex items-center justify-center">
                            <ShieldCheck />
                        </div>
                        <span className="font-bold text-slate-700">Phụ huynh</span>
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <input
                            type="tel"
                            placeholder="Số điện thoại"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} // Only numbers
                            className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
                        />
                    </div>

                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Mật khẩu (tối thiểu 8 ký tự)"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-blue/50 pr-12"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand-blue"
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                </div>

                <Button variant={role === 'student' ? 'primary' : 'secondary'} className="w-full mt-8 h-12 font-bold text-lg shadow-lg shadow-brand-blue/20" onClick={handleLogin}>
                    Đăng nhập ngay
                </Button>
            </Card>

            <p className="mt-8 text-slate-400 text-sm">Chưa có tài khoản? <span className="text-brand-blue font-bold cursor-pointer hover:underline">Đăng ký ngay</span></p>
        </div>
    )
}

export default LoginScreen
