import React, { createContext, useContext, useState, useEffect } from 'react'
import { toast } from 'sonner'
import { useAuth } from './UserContext'

interface FocusContextType {
    isActive: boolean
    isPaused: boolean
    timeLeft: number
    startFocus: (durationMinutes?: number) => void
    stopFocus: () => void
    pauseFocus: () => void
    resumeFocus: () => void
}

const FocusContext = createContext<FocusContextType | undefined>(undefined)

export const FocusProvider = ({ children }: { children: React.ReactNode }) => {
    const [isActive, setIsActive] = useState(false)
    const [isPaused, setIsPaused] = useState(false)
    const [timeLeft, setTimeLeft] = useState(25 * 60) // Default 25 mins
    const { user } = useAuth()

    const startFocus = (durationMinutes = 20) => {
        setTimeLeft(durationMinutes * 60)
        setIsActive(true)
        setIsPaused(false)
        toast.success("Đã bật chế độ tập trung! Cố lên nhé! 🐧")
    }

    const stopFocus = () => {
        setIsActive(false)
        setIsPaused(false)
        setTimeLeft(25 * 60)
    }

    const pauseFocus = () => setIsPaused(true)
    const resumeFocus = () => setIsPaused(false)

    // Reset focus session when user logs out or switches account
    useEffect(() => {
        stopFocus()
        sessionStorage.removeItem('hasSeenFocusPrompt')
    }, [user?.phone]) // Use phone as ID equivalent since User interface uses phone as key in DB usually, or just user object ref if unsure. Let's use user?.phone based on context usage, or simply [user] to be safe if object checks are fast. Actually user re-creation might be frequent? No, only on context update. let's use user?.phone (unique ID) to be safe. Wait, UserContext defines User? Let's assume unique key. In UserContext it was `phone` as key in DB.
    // If user is null, it runs. If user changes, it runs. Perfect.

    useEffect(() => {
        let interval: any = null

        if (isActive && !isPaused && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        // Timer Finished
                        clearInterval(interval)
                        setIsActive(false)
                        toast.success("Hoàn thành phiên học! Bạn giỏi lắm! 🎉")
                        // Reset prompt flag so user is asked again next time
                        sessionStorage.removeItem('hasSeenFocusPrompt')
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)
        }

        return () => clearInterval(interval)
    }, [isActive, isPaused, timeLeft])

    return (
        <FocusContext.Provider value={{ isActive, isPaused, timeLeft, startFocus, stopFocus, pauseFocus, resumeFocus }}>
            {children}
        </FocusContext.Provider>
    )
}

export const useFocus = () => {
    const context = useContext(FocusContext)
    if (!context) throw new Error('useFocus must be used within a FocusProvider')
    return context
}
