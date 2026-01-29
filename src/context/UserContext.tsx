import React, { createContext, useContext, useState } from 'react'
import { toast } from 'sonner'

interface User {
    id: string
    name: string
    phone: string
    role: 'student' | 'parent'
    isPremium: boolean
    avatar?: string
    province?: string
    lastProvinceChangeDate?: number
    xp: number
    dailyLessonCount?: number
    lastDailyDate?: number
    enrolledCourses: EnrolledCourse[]
}

interface GameStat {
    highest: number
    average: number
    count: number
}

export interface EnrolledCourse {
    courseId: string
    currentLessonIndex: number
    lastAccessed: number
    expiryDate?: number
    lessonProgress?: Record<string, {
        videoCompleted: boolean
        gameScores: Record<string, GameStat>
    }>
}

interface UserContextType {
    user: User | null
    login: (phone: string, role: 'student' | 'parent') => void
    logout: () => void
    updateUser: (updates: Partial<User>) => void
    isAuthenticated: boolean
}

const UserContext = createContext<UserContextType | undefined>(undefined)

const PREMIUM_PHONE = '0832242783'

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(() => {
        const saved = localStorage.getItem('engo_user')
        if (!saved) return null

        const parsedUser = JSON.parse(saved)

        // Data Migration: Ensure enrolledCourses exists & Migrate Game Scores
        if (parsedUser.enrolledCourses) {
            parsedUser.enrolledCourses = parsedUser.enrolledCourses.map((course: any) => {
                if (course.lessonProgress) {
                    Object.keys(course.lessonProgress).forEach(lessonId => {
                        const progress = course.lessonProgress[lessonId]
                        if (progress.gameScores) {
                            const newScores: Record<string, GameStat> = {}
                            Object.keys(progress.gameScores).forEach(gameId => {
                                const scoreVal = progress.gameScores[gameId]
                                if (typeof scoreVal === 'number') {
                                    // Migrate number -> GameStat
                                    newScores[gameId] = {
                                        highest: scoreVal,
                                        average: scoreVal,
                                        count: 1
                                    }
                                } else {
                                    // Already migrated
                                    newScores[gameId] = scoreVal
                                }
                            })
                            progress.gameScores = newScores
                        }
                    })
                }
                return course
            })
        }
        if (!parsedUser.enrolledCourses) {
            const isPremium = parsedUser.isPremium || parsedUser.phone === PREMIUM_PHONE
            // Purchase Date: 26/01/2026 -> Expiry: 26/01/2027
            const expiryDate = new Date('2027-01-26').getTime()

            parsedUser.enrolledCourses = isPremium ? [
                {
                    courseId: 'grade-5',
                    currentLessonIndex: 0, // Reset to 0 (Unit 1)
                    lastAccessed: Date.now(),
                    expiryDate: expiryDate
                }
            ] : []

            // Save the migrated structure back to storage
            localStorage.setItem('engo_user', JSON.stringify(parsedUser))
        } else if (parsedUser.phone === PREMIUM_PHONE) {
            // Check if migrated to 0 XP state (User Request)
            const isMigrated = parsedUser.enrolledCourses.length > 0 &&
                parsedUser.enrolledCourses[0].currentLessonIndex === 0 &&
                parsedUser.xp === 0

            if (!isMigrated) {
                // Force reset for this specific user
                const expiryDate = new Date('2027-01-26').getTime()

                // Ensure Enrolled Courses
                if (!parsedUser.enrolledCourses || parsedUser.enrolledCourses.length === 0) {
                    parsedUser.enrolledCourses = [{
                        courseId: 'grade-5',
                        currentLessonIndex: 0,
                        lastAccessed: Date.now(),
                        expiryDate: expiryDate
                    }]
                } else {
                    parsedUser.enrolledCourses[0].currentLessonIndex = 0
                    parsedUser.enrolledCourses[0].expiryDate = expiryDate
                }

                // Force XP to 0 (If it was 1250 or anything else)
                parsedUser.xp = 0

                localStorage.setItem('engo_user', JSON.stringify(parsedUser))
            }
        }

        // *** SYNC SESSION TO DB (Auto-Migration) ***
        // This ensures that if a user is already logged in, their data is backed up to the DB immediately.
        if (parsedUser && parsedUser.phone) {
            const dbString = localStorage.getItem('engo_users_db')
            const db: Record<string, typeof parsedUser> = dbString ? JSON.parse(dbString) : {}

            // Update DB with current session data
            db[parsedUser.phone] = parsedUser
            localStorage.setItem('engo_users_db', JSON.stringify(db))
        }

        return parsedUser
    })

    // Simulated Login Logic
    const login = (phone: string, role: 'student' | 'parent') => {
        const isPremium = phone === PREMIUM_PHONE

        // 1. Load DB
        const dbString = localStorage.getItem('engo_users_db')
        const db: Record<string, User> = dbString ? JSON.parse(dbString) : {}

        // 2. Check if user exists
        let userToLogin = db[phone]

        if (!userToLogin) {
            // Purchase Date: 26/01/2026 -> Expiry: 26/01/2027
            const expiryDate = new Date('2027-01-26').getTime()

            userToLogin = {
                id: isPremium ? 'vip_user_123' : `user_${Date.now()}`,
                name: isPremium ? 'Henry (VIP)' : 'Bạn Mới',
                phone,
                role,
                isPremium,
                province: 'Hồ Chí Minh', // Default
                avatar: undefined,
                xp: 0,
                dailyLessonCount: 0,
                lastDailyDate: Date.now(),
                enrolledCourses: isPremium ? [
                    {
                        courseId: 'grade-5',
                        currentLessonIndex: 0, // Start from Unit 1
                        lastAccessed: Date.now(),
                        expiryDate: expiryDate
                    }
                ] : []
            }

            // Save new user to DB
            db[phone] = userToLogin
            localStorage.setItem('engo_users_db', JSON.stringify(db))

            if (isPremium) {
                toast.success("Chào mừng VIP Member Henry! (Tài khoản mới) 👑")
            } else {
                toast.success("Tạo tài khoản thành công!")
            }
        } else {
            // Restore existing user
            // Ensure compatibility/migrations if needed (simplified here)
            if (isPremium && !userToLogin.isPremium) {
                userToLogin.isPremium = true;
                userToLogin.name = 'Henry (VIP)'
            }
            toast.success(`Chào mừng trở lại, ${userToLogin.name}!`)
        }

        // 3. Set Session
        setUser(userToLogin)
        localStorage.setItem('engo_user', JSON.stringify(userToLogin))
    }

    const logout = () => {
        setUser(null)
        localStorage.removeItem('engo_user')
        toast.info("Đã đăng xuất.")
    }

    const updateUser = (updates: Partial<User>) => {
        if (!user) return
        const updatedUser = { ...user, ...updates }

        try {
            // 1. Update Session
            setUser(updatedUser)
            localStorage.setItem('engo_user', JSON.stringify(updatedUser))

            // 2. Update DB
            const dbString = localStorage.getItem('engo_users_db')
            const db: Record<string, User> = dbString ? JSON.parse(dbString) : {}

            if (updatedUser.phone) {
                db[updatedUser.phone] = updatedUser
                localStorage.setItem('engo_users_db', JSON.stringify(db))
            }
            toast.success("Cập nhật thông tin thành công!")
        } catch (error) {
            console.error("Storage Save Error:", error)

            if (error instanceof DOMException && (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
                // *** EMERGENCY CLEANUP ***
                // Auto-remove avatars from DB to save space for critical progress
                try {
                    const dbString = localStorage.getItem('engo_users_db')
                    if (dbString) {
                        const db: Record<string, User> = JSON.parse(dbString)
                        let freedSpace = false

                        Object.keys(db).forEach(key => {
                            if (db[key].avatar) {
                                db[key].avatar = undefined // sacrifice avatar
                                freedSpace = true
                            }
                        })

                        if (freedSpace) {
                            if (updatedUser.phone) {
                                db[updatedUser.phone] = updatedUser // ensure current update is preserved
                            }
                            localStorage.setItem('engo_users_db', JSON.stringify(db))
                            toast.warning("Hệ thống đã tự động xóa ảnh đại diện cũ để giải phóng bộ nhớ cho bài học mới.", {
                                duration: 5000
                            })
                            return // Recovered!
                        }
                    }
                } catch (retryErr) {
                    console.error("Cleanup failed:", retryErr)
                }

                toast.error("Bộ nhớ trình duyệt đã đầy!", {
                    description: "Vui lòng xóa dữ liệu duyệt web để tiếp tục lưu tiến độ."
                })
            } else {
                toast.error("Lỗi lưu dữ liệu. Vui lòng thử lại.")
            }
        }
    }

    return (
        <UserContext.Provider value={{ user, login, logout, updateUser, isAuthenticated: !!user }}>
            {children}
        </UserContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(UserContext)
    if (!context) throw new Error('useAuth must be used within a UserProvider')
    return context
}
