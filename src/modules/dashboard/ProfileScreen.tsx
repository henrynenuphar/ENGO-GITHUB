import React from 'react'
import { Button } from '@/components/ui/Button'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/UserContext'
import { Card } from '@/components/ui/Card'
import { Crown, User as UserIcon, BookOpen, Star, ChevronRight, TrendingUp, Shield, Camera, AlertTriangle } from 'lucide-react'
import { differenceInDays } from 'date-fns'
import { toast } from 'sonner'
import { COURSES } from '@/data/courses'

const ProfileScreen = () => {
    const navigate = useNavigate()
    const { user, logout, updateUser } = useAuth()
    const [showNameModal, setShowNameModal] = React.useState(false)
    const [editName, setEditName] = React.useState('')

    // New States
    const [showProvinceModal, setShowProvinceModal] = React.useState(false)
    const [rankTime, setRankTime] = React.useState<'week' | 'month'>('week')
    const [rankScope, setRankScope] = React.useState<'national' | 'province'>('national')

    const fileInputRef = React.useRef<HTMLInputElement>(null)

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    const handleUpdateName = () => {
        if (editName.trim()) {
            updateUser({ name: editName })
            setShowNameModal(false)
        }
    }

    const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (file.size > 5 * 1024 * 1024) {
            toast.error("File quá lớn. Vui lòng chọn ảnh < 5MB")
            return
        }

        const reader = new FileReader()
        reader.onload = (event) => {
            const img = new Image()
            img.onload = () => {
                const canvas = document.createElement('canvas')
                const MAX_WIDTH = 200
                const scaleSize = MAX_WIDTH / img.width

                // Only resize if width > MAX_WIDTH
                const width = (scaleSize < 1) ? MAX_WIDTH : img.width
                const height = (scaleSize < 1) ? img.height * scaleSize : img.height

                canvas.width = width
                canvas.height = height

                const ctx = canvas.getContext('2d')
                ctx?.drawImage(img, 0, 0, width, height)

                // Compress to JPEG 0.7 quality
                const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7)

                updateUser({ avatar: compressedBase64 })
                toast.success("Đổi ảnh đại diện thành công!")
            }
            img.src = event.target?.result as string
        }
        reader.readAsDataURL(file)
    }

    const handleUpdateProvince = (province: string) => {
        const now = Date.now()
        // Check 30 days restriction
        if (user?.lastProvinceChangeDate) {
            const daysDiff = differenceInDays(now, user.lastProvinceChangeDate)
            if (daysDiff < 30) {
                toast.error(`Bạn chỉ có thể đổi tỉnh thành sau ${30 - daysDiff} ngày nữa!`, {
                    description: "Quy định để đảm bảo tính công bằng bảng xếp hạng."
                })
                return
            }
        }

        updateUser({ province, lastProvinceChangeDate: now })
        setShowProvinceModal(false)
        toast.success(`Đã chuyển khu vực sang ${province}!`)
    }

    const PROVINCES_LIST = [
        "Hà Nội", "TP. Hồ Chí Minh", "Đà Nẵng", "Hải Phòng", "Cần Thơ",
        "Bà Rịa - Vũng Tàu", "Bắc Giang", "Bắc Ninh", "Bến Tre", "Bình Dương",
        "Bình Định", "Bình Phước", "Bình Thuận", "Cà Mau", "Cao Bằng",
        "Đắk Lắk", "Đắk Nông", "Điện Biên", "Đồng Nai", "Đồng Tháp",
        "Gia Lai", "Hà Giang", "Hà Nam", "Hà Tĩnh", "Hải Dương",
        "Hậu Giang", "Hòa Bình", "Hưng Yên", "Khánh Hòa", "Kiên Giang",
        "Kon Tum", "Lai Châu", "Lâm Đồng", "Lạng Sơn"
    ]

    if (!user) {
        return (
            <div className="p-10 text-center">
                <p>Bạn chưa đăng nhập</p>
                <Button onClick={() => navigate('/login')} className="mt-4">Đăng nhập</Button>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            {/* Header / Avatar */}
            <div className="bg-white p-6 pb-8 rounded-b-3xl shadow-sm flex flex-col items-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-brand-blue to-blue-500"></div>

                <div className="relative z-10 mt-8">
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-xl border-4 border-white overflow-hidden relative group/avatar ${user.isPremium ? 'bg-gradient-to-br from-yellow-400 to-orange-500' : 'bg-slate-300'}`} onClick={() => fileInputRef.current?.click()}>
                        {user.avatar ? (
                            <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            user.isPremium ? <Crown size={40} /> : <UserIcon size={40} />
                        )}

                        {/* Camera Overlay */}
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity cursor-pointer backdrop-blur-[1px]">
                            <Camera size={24} className="text-white" />
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleAvatarUpload}
                        />
                    </div>
                    {user.isPremium && (
                        <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-white p-1.5 rounded-full border-4 border-white shadow-sm">
                            <Star size={12} fill="currentColor" />
                        </div>
                    )}
                </div>

                <h1 className="text-2xl font-black text-slate-800 mt-3">{user.name}</h1>
                <p className="text-slate-500 font-medium mb-1">{user.role === 'student' ? 'Học sinh' : 'Phụ huynh'}</p>
                {user.isPremium ? (
                    <span className="bg-yellow-100 text-yellow-700 font-bold px-3 py-0.5 rounded-full text-[10px] border border-yellow-200 inline-flex items-center gap-1 uppercase tracking-wider">
                        <Crown size={10} /> Premium
                    </span>
                ) : (
                    <span className="bg-slate-100 text-slate-500 font-bold px-3 py-0.5 rounded-full text-[10px] border border-slate-200 inline-block uppercase tracking-wider">
                        Thành viên thường
                    </span>
                )}
            </div>

            <div className="p-4 space-y-6 max-w-md mx-auto">
                {/* 1. Profile Info */}
                <section>
                    <div className="flex items-center gap-2 mb-3 px-1">
                        <UserIcon size={18} className="text-brand-blue" />
                        <h2 className="font-bold text-slate-700">Thông tin cá nhân</h2>
                    </div>
                    <Card className="p-0 overflow-hidden bg-white border-none shadow-sm">
                        <div className="divide-y divide-slate-100">
                            {/* Name Row - Interactive */}
                            <div
                                onClick={() => { setEditName(user.name); setShowNameModal(true) }}
                                className="p-4 flex justify-between items-center cursor-pointer hover:bg-slate-50 transition-colors group"
                            >
                                <span className="text-sm text-slate-500">Họ và tên</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-slate-700">{user.name}</span>
                                    <ChevronRight size={16} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            </div>

                            {/* Province Row */}
                            <div
                                onClick={() => setShowProvinceModal(true)}
                                className="p-4 flex justify-between items-center cursor-pointer hover:bg-slate-50 transition-colors group"
                            >
                                <span className="text-sm text-slate-500">Tỉnh / Thành phố</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-slate-700">{user.province || 'Chưa cập nhật'}</span>
                                    <ChevronRight size={16} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            </div>

                            <div className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors">
                                <span className="text-sm text-slate-500">Số điện thoại</span>
                                <span className="text-sm font-bold text-slate-700">{user.phone}</span>
                            </div>
                            <div className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors">
                                <span className="text-sm text-slate-500">Email</span>
                                <span className="text-sm font-bold text-slate-700">{user.phone === '0832242783' ? 'henry@engo.app' : 'Chưa cập nhật'}</span>
                            </div>
                        </div>
                    </Card>
                </section>

                {/* Edit Name Modal */}
                {showNameModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
                        <div className="bg-white rounded-3xl w-full max-w-xs p-6 shadow-2xl scale-100 animate-in zoom-in-95">
                            <h3 className="text-lg font-bold text-slate-800 mb-4 text-center">Đổi tên hiển thị</h3>
                            <input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="w-full bg-slate-100 border-2 border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 focus:outline-none focus:border-brand-blue mb-6"
                                placeholder="Nhập tên của bạn"
                                autoFocus
                            />
                            <div className="flex gap-3">
                                <Button variant="secondary" className="flex-1 bg-slate-200 text-slate-600 hover:bg-slate-300" onClick={() => setShowNameModal(false)}>Hủy</Button>
                                <Button className="flex-1" onClick={handleUpdateName}>Lưu</Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Province Selection Modal */}
                {showProvinceModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
                        <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl scale-100 animate-in zoom-in-95 max-h-[80vh] flex flex-col">
                            <h3 className="text-lg font-bold text-slate-800 mb-2 text-center">Chọn Tỉnh / Thành phố</h3>
                            <p className="text-xs text-slate-500 text-center mb-4 px-4 bg-orange-50 text-orange-600 py-2 rounded-lg border border-orange-100 flex items-start gap-2">
                                <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                                Lưu ý: Bạn chỉ được thay đổi khu vực tối đa 30 ngày / lần để đảm bảo tính công bằng của bảng xếp hạng.
                            </p>

                            <div className="overflow-y-auto flex-1 space-y-1 pr-2 -mr-2 mb-4 custom-scrollbar">
                                {PROVINCES_LIST.map(p => (
                                    <button
                                        key={p}
                                        onClick={() => handleUpdateProvince(p)}
                                        className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm transition-colors ${user.province === p ? 'bg-brand-blue text-white' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'}`}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>

                            <Button variant="secondary" className="w-full bg-slate-200 text-slate-600 hover:bg-slate-300" onClick={() => setShowProvinceModal(false)}>Đóng</Button>
                        </div>
                    </div>
                )}

                {/* 2. My Courses */}
                <section>
                    <div className="flex items-center gap-2 mb-3 px-1">
                        <BookOpen size={18} className="text-brand-orange" />
                        <h2 className="font-bold text-slate-700">Khóa học của tôi</h2>
                    </div>
                    {user.enrolledCourses && user.enrolledCourses.length > 0 ? (
                        <div className="space-y-3">
                            {user.enrolledCourses.map(enrollment => {
                                const course = COURSES[enrollment.courseId]
                                if (!course) return null

                                return (
                                    <Card key={enrollment.courseId} className="p-4 border-l-4 border-l-brand-blue bg-white shadow-sm flex items-center justify-between">
                                        <div>
                                            <h3 className="font-bold text-brand-blue">{course.title}</h3>
                                            <p className="text-xs text-slate-500">
                                                {enrollment.expiryDate
                                                    ? `Hết hạn: ${new Date(enrollment.expiryDate).toLocaleDateString('vi-VN')}`
                                                    : `Đang học • Unit ${enrollment.currentLessonIndex + 1}/${course.lessons.length}`
                                                }
                                            </p>
                                        </div>
                                        <div className="h-8 w-8 rounded-full bg-blue-50 text-brand-blue flex items-center justify-center">
                                            <ChevronRight size={16} />
                                        </div>
                                    </Card>
                                )
                            })}
                        </div>
                    ) : (
                        <Card className="p-6 text-center bg-slate-100 border-dashed border-2 border-slate-200 shadow-none">
                            <p className="text-slate-400 text-sm mb-2">Chưa đăng ký khóa học nào</p>
                            <Button variant="outline" size="sm" onClick={() => navigate('/app/discovery')}>
                                Khám phá ngay
                            </Button>
                        </Card>
                    )}
                </section>

                {/* 3. Learning Ranking */}
                <section>
                    <div className="flex items-center justify-between mb-3 px-1">
                        <div className="flex items-center gap-2">
                            <TrendingUp size={18} className="text-green-500" />
                            <h2 className="font-bold text-slate-700">Bảng xếp hạng</h2>
                        </div>
                    </div>

                    <Card className="bg-white border-none shadow-sm overflow-hidden p-0">
                        {/* Filter Tabs */}
                        <div className="flex border-b border-slate-100">
                            <button
                                onClick={() => setRankTime('week')}
                                className={`flex-1 py-3 text-xs font-bold transition-colors ${rankTime === 'week' ? 'text-brand-blue border-b-2 border-brand-blue bg-blue-50/50' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                Tuần này
                            </button>
                            <button
                                onClick={() => setRankTime('month')}
                                className={`flex-1 py-3 text-xs font-bold transition-colors ${rankTime === 'month' ? 'text-brand-blue border-b-2 border-brand-blue bg-blue-50/50' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                Tháng này
                            </button>
                        </div>
                        <div className="flex gap-2 p-3 bg-slate-50 justify-center">
                            <button
                                onClick={() => setRankScope('national')}
                                className={`px-4 py-1.5 rounded-full text-[10px] font-bold transition-all border ${rankScope === 'national' ? 'bg-white text-brand-blue border-brand-blue/30 shadow-sm' : 'bg-transparent text-slate-400 border-transparent hover:bg-slate-200'}`}
                            >
                                Toàn quốc
                            </button>
                            <button
                                onClick={() => setRankScope('province')}
                                className={`px-4 py-1.5 rounded-full text-[10px] font-bold transition-all border ${rankScope === 'province' ? 'bg-white text-green-600 border-green-200 shadow-sm' : 'bg-transparent text-slate-400 border-transparent hover:bg-slate-200'}`}
                            >
                                {user.province || 'Tỉnh thành'}
                            </button>
                        </div>

                        {/* User Rank */}
                        <div className="bg-brand-lightBlue/30 p-4 flex items-center gap-4 border-b border-blue-50">
                            <div className="font-black text-xl text-brand-blue w-6 text-center">{rankScope === 'province' ? 5 : 142}</div>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold bg-gradient-to-br from-yellow-400 to-orange-500 ring-2 ring-white overflow-hidden`}>
                                {user.avatar ? <img src={user.avatar} alt="Me" className="w-full h-full object-cover" /> : <UserIcon size={20} />}
                            </div>
                            <div className="flex-1">
                                <p className="font-bold text-slate-800 text-sm">{user.name} (Bạn)</p>
                                <p className="text-xs text-slate-500">{user.xp ? user.xp.toLocaleString() : 0} XP • {rankScope === 'province' ? `Hạng 5 tại ${user.province}` : 'Top 20% Toàn quốc'}</p>
                            </div>
                        </div>
                        {/* Other Ranks Mock */}
                        {[1, 2, 3].map(rank => (
                            <div key={rank} className="p-3 px-4 flex items-center gap-4 hover:bg-slate-50">
                                <div className={`font-bold text-lg w-6 text-center ${rank === 1 ? 'text-yellow-500' : rank === 2 ? 'text-slate-400' : 'text-orange-700'}`}>
                                    {rank}
                                </div>
                                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500 overflow-hidden">
                                    {/* Mock avatars */}
                                    {rank === 1 ? '🦄' : rank === 2 ? '🦊' : '🐼'}
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-slate-700 text-sm">Bạn nhỏ {String.fromCharCode(64 + rank)}</p>
                                    <p className="text-xs text-slate-400">{rankTime === 'week' ? 2000 - (rank * 200) : 8000 - (rank * 500)} XP</p>
                                </div>
                            </div>
                        ))}
                    </Card>
                </section>

                {/* 4. Privacy Settings */}
                <section>
                    <div className="flex items-center gap-2 mb-3 px-1">
                        <Shield size={18} className="text-purple-500" />
                        <h2 className="font-bold text-slate-700">Quyền riêng tư</h2>
                    </div>
                    <Card className="p-0 overflow-hidden bg-white border-none shadow-sm">
                        <div className="divide-y divide-slate-100">
                            <div className="p-4 flex justify-between items-center cursor-pointer hover:bg-red-50 transition-colors group">
                                <div>
                                    <p className="text-sm font-bold text-red-500 group-hover:text-red-600">Quên mật khẩu?</p>
                                    <p className="text-xs text-slate-400">Đặt lại mật khẩu mới qua SĐT</p>
                                </div>
                                <div className="p-2 bg-slate-50 rounded-full text-slate-400 group-hover:bg-red-100 group-hover:text-red-500">
                                    <ChevronRight size={16} />
                                </div>
                            </div>
                            <div className="p-4 flex justify-between items-center">
                                <div>
                                    <p className="text-sm font-bold text-slate-700">Hiển thị hồ sơ</p>
                                    <p className="text-xs text-slate-400">Cho phép người khác tìm thấy bạn</p>
                                </div>
                                <div className="w-10 h-6 bg-brand-blue rounded-full relative cursor-pointer">
                                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                                </div>
                            </div>
                            <div className="p-4 flex justify-between items-center">
                                <div>
                                    <p className="text-sm font-bold text-slate-700">Thông báo học tập</p>
                                    <p className="text-xs text-slate-400">Nhắc nhở giờ học hàng ngày</p>
                                </div>
                                <div className="w-10 h-6 bg-brand-blue rounded-full relative cursor-pointer">
                                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </section>

                <div className="pt-4">
                    <Button variant="outline" onClick={handleLogout} className="border-red-100 text-red-500 hover:bg-red-50 w-full font-bold">
                        Đăng xuất
                    </Button>
                    <p className="text-center text-[10px] text-slate-300 mt-4">
                        Phiên bản 1.0.2 • ENGO Education
                    </p>
                </div>
            </div>
        </div>
    )
}

export default ProfileScreen
