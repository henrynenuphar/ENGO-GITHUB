import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mascot } from '@/components/common/Mascot'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/context/UserContext'
import { toast } from 'sonner'

const LoginScreen = () => {
    const navigate = useNavigate()
    const { login } = useAuth()

    // State
    const role = 'student' // Fixed role
    const [phone, setPhone] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)

    // Constants
    const MOCK_ACCOUNTS: Record<string, { pass: string, name: string }> = {
        '0832242783': { pass: 'henry1403', name: 'Henry' },
        '0832123401': { pass: 'tuongvi01', name: 'Tường Vi' },
        '0832123402': { pass: 'nguyetanh02', name: 'Nguyệt Anh' },
        '0832123403': { pass: 'vananh03', name: 'Vân Anh' },
        '0832123404': { pass: 'vietanh04', name: 'Việt Anh' },
        '0832123405': { pass: 'thuha05', name: 'Thu Hà' },
        '0832123406': { pass: 'baominh06', name: 'Bảo Minh' },
        '0832123407': { pass: 'vanquyen07', name: 'Văn Quyền' },
        '0832123408': { pass: 'bichtram08', name: 'Bích Trâm' },
        '0832123409': { pass: 'kimthu09', name: 'Kim Thư' },
        '0832123410': { pass: 'tuongvy10', name: 'Tường Vy' }
    }

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
        const mockAccount = MOCK_ACCOUNTS[phone];
        let assignedName: string | undefined = undefined;

        if (mockAccount) {
            if (password !== mockAccount.pass) {
                toast.error('Mật khẩu không đúng!')
                return
            }
            assignedName = mockAccount.name;
        }

        // Proceed to Login
        login(phone, role, assignedName)
        navigate('/app/dashboard')
    }

    return (
        <div className="min-h-screen bg-brand-lightBlue flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-blue/10 rounded-full blur-3xl -translate-y-10 translate-x-10"></div>

            <Mascot mood="happy" size="lg" className="mb-8" />

            <Card className="w-full max-w-md bg-white/90 backdrop-blur">
                <h1 className="text-2xl font-bold text-center text-brand-blue mb-2">Chào mừng đến ENGO!</h1>
                <p className="text-center text-slate-500 mb-8">Vui lòng đăng nhập để bắt đầu</p>

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

                <Button variant="primary" className="w-full mt-8 h-12 font-bold text-lg shadow-lg shadow-brand-blue/20" onClick={handleLogin}>
                    Đăng nhập ngay
                </Button>
            </Card>

            <p className="mt-8 text-slate-400 text-sm">Chưa có tài khoản? <span className="text-brand-blue font-bold cursor-pointer hover:underline">Đăng ký ngay</span></p>
        </div>
    )
}

export default LoginScreen
