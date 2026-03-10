import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Play, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface Story {
    id: string
    title: string
    thumbnail: string
    videoId: string
}

const STORIES: Story[] = [
    {
        id: '3',
        title: 'Beauty and the Beast',
        thumbnail: 'https://img.youtube.com/vi/IMrMILXMUaQ/maxresdefault.jpg',
        videoId: 'IMrMILXMUaQ?list=PLfYK1b_PbKAn2ARaZcipOofsvI8SnZITW'
    },
    {
        id: '1',
        title: 'Aladdin and the Magic Lamp',
        thumbnail: 'https://minhtuandayroi.com/wp-content/uploads/2026/03/Aladdin-and-the-Magic-Lamp.jpeg',
        videoId: 'jbxrzaoTCZY?list=PLfYK1b_PbKAn2ARaZcipOofsvI8SnZITW'
    },
    {
        id: '2',
        title: 'Little Mermaid',
        thumbnail: 'https://minhtuandayroi.com/wp-content/uploads/2026/03/Little-Mermaid.jpeg',
        videoId: 'KM4sFUhHSf4?list=PLfYK1b_PbKAn2ARaZcipOofsvI8SnZITW'
    },
    {
        id: '4',
        title: 'The Little Mermaid',
        thumbnail: 'https://img.youtube.com/vi/CEoT3rYyWpQ/maxresdefault.jpg',
        videoId: 'CEoT3rYyWpQ?list=PLfYK1b_PbKAn2ARaZcipOofsvI8SnZITW'
    },
    {
        id: '5',
        title: 'Princess Rose and the Golden Bird',
        thumbnail: 'https://minhtuandayroi.com/wp-content/uploads/2026/03/Princess-Rose-and-the-Golden-Bird.jpeg',
        videoId: 'GpKZEp-mNVU?list=PLfYK1b_PbKAn2ARaZcipOofsvI8SnZITW'
    },
    {
        id: '6',
        title: 'The Three Little Pigs',
        thumbnail: 'https://img.youtube.com/vi/9p1CUYFSDFI/maxresdefault.jpg',
        videoId: '9p1CUYFSDFI?start=7'
    },
    {
        id: '7',
        title: 'The Princess’s Clever Plan & The Happy Ending!',
        thumbnail: 'https://img.youtube.com/vi/2Sb4n7abwiQ/maxresdefault.jpg',
        videoId: '2Sb4n7abwiQ?start=7'
    },
    {
        id: '8',
        title: 'Be a Good Friend',
        thumbnail: 'https://img.youtube.com/vi/aOKzUxpdOI4/maxresdefault.jpg',
        videoId: 'aOKzUxpdOI4?start=4'
    }
]

interface StoryModalProps {
    isOpen: boolean
    onClose: () => void
}

export const StoryModal = ({ isOpen, onClose }: StoryModalProps) => {
    const [activeVideoId, setActiveVideoId] = useState<string | null>(null)

    if (!isOpen) return null

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                />

                {/* Modal Content */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-[95vw] lg:w-[85vw] max-w-6xl bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[90vh] max-h-[90vh]"
                >
                    {/* Header */}
                    <div className="bg-pink-500 p-4 px-6 flex items-center justify-between shrink-0">
                        {activeVideoId ? (
                            <button
                                onClick={() => setActiveVideoId(null)}
                                className="text-white hover:bg-white/20 p-2 -ml-2 rounded-full transition-colors flex items-center gap-2"
                            >
                                <ChevronLeft size={24} />
                                <span className="font-bold">Danh sách truyện</span>
                            </button>
                        ) : (
                            <h2 className="text-xl font-black text-white flex items-center gap-2">
                                📖 Truyện cổ tích tiếng Anh
                            </h2>
                        )}
                        <button
                            onClick={onClose}
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-black/20 text-white hover:bg-black/30 transition-colors"
                        >
                            <X size={20} className="stroke-[3]" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="flex-1 overflow-y-auto bg-slate-50 p-4">
                        {activeVideoId ? (
                            <div className="h-full flex flex-col">
                                <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-lg border-2 border-slate-200">
                                    <iframe
                                        src={`https://www.youtube.com/embed/${activeVideoId.includes('?') ? activeVideoId.replace('?', '?autoplay=1&rel=0&') : activeVideoId + '?autoplay=1&rel=0'}`}
                                        className="w-full h-full"
                                        title="Story Video Player"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
                                </div>
                                <div className="mt-4 p-4 bg-white rounded-2xl shadow-sm text-center">
                                    <h3 className="font-bold text-slate-800 text-lg">
                                        {STORIES.find(s => s.videoId === activeVideoId)?.title}
                                    </h3>
                                    <p className="text-slate-500 text-sm mt-1">Chúc bé nghe truyện vui vẻ nhé!</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-6 max-w-2xl mx-auto py-2">
                                {STORIES.map(story => (
                                    <motion.div
                                        key={story.id}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setActiveVideoId(story.videoId)}
                                        className="bg-white rounded-[2rem] overflow-hidden shadow-md border border-slate-100 cursor-pointer group flex flex-col"
                                    >
                                        <div className="w-full aspect-video relative overflow-hidden bg-slate-900 shrink-0">
                                            <img
                                                src={story.thumbnail}
                                                alt={story.title}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                                                <div className="w-16 h-16 rounded-full bg-white/90 text-pink-500 flex items-center justify-center shadow-xl transform scale-90 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all">
                                                    <Play size={32} fill="currentColor" className="ml-1.5" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-6 bg-white text-center">
                                            <h3 className="font-black text-slate-800 text-xl group-hover:text-pink-600 transition-colors">
                                                {story.title}
                                            </h3>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}
