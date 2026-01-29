import React, { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Search, Volume2, Plus, Check, Loader2 } from 'lucide-react'
import { DICTIONARY_DATA, WordEntry } from './data'
import { toast } from 'sonner'

const DictionaryScreen = () => {
    const [searchTerm, setSearchTerm] = useState('')
    const [result, setResult] = useState<WordEntry | null>(null)
    const [isSaved, setIsSaved] = useState(false)
    const [loading, setLoading] = useState(false)

    const fetchDictionaryData = async (word: string) => {
        setLoading(true)
        setResult(null)
        setIsSaved(false)

        const key = word.toLowerCase().trim()

        // 1. Check Mock Data First (For high-quality Vietnamese definitions)
        if (DICTIONARY_DATA[key]) {
            setResult(DICTIONARY_DATA[key])
            setLoading(false)
            return
        }

        // 2. Fetch from Real API
        try {
            const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${key}`)
            if (!response.ok) throw new Error('Not found')

            const data = await response.json()
            const entry = data[0] // take first result

            // Map API response to our format
            const mappedResult: WordEntry = {
                id: key,
                word: entry.word,
                ipa: entry.phonetic || (entry.phonetics.find((p: any) => p.text)?.text) || '',
                audio: entry.phonetics.find((p: any) => p.audio)?.audio || '',
                meanings: entry.meanings.map((m: any) => ({
                    type: m.partOfSpeech,
                    definition: m.definitions[0].definition, // Primary English definition
                    example: m.definitions[0].example || ''
                }))
            }

            setResult(mappedResult)
        } catch (error) {
            toast.error(`Không tìm thấy từ "${key}". Hãy thử từ khác xem!`)
        } finally {
            setLoading(false)
        }
    }

    const handleSearch = () => {
        if (!searchTerm) return
        fetchDictionaryData(searchTerm)
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSearch()
    }

    const handleSave = () => {
        setIsSaved(true)
        toast.success(`Đã thêm "${result?.word}" vào danh sách ôn tập!`)
    }

    const playAudio = () => {
        if (result?.audio) {
            const audio = new Audio(result.audio)
            audio.play().catch(() => toast.error("Không thể phát âm thanh này."))
        } else {
            toast.error("Chưa có phát âm cho từ này.")
        }
    }

    return (
        <div className="p-6 space-y-6 h-full flex flex-col">
            <h1 className="text-2xl font-bold text-brand-blue">Tra từ điển</h1>

            {/* Search Bar */}
            <div className="relative">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Nhập bất kỳ từ nào (vd: galaxy)..."
                    className="w-full p-4 pl-12 rounded-2xl border-2 border-slate-200 focus:border-brand-blue focus:outline-none bg-slate-50 font-bold text-lg"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <button
                    onClick={handleSearch}
                    disabled={loading}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-brand-blue text-white p-2 rounded-xl hover:bg-brand-darkBlue disabled:opacity-50"
                >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : "Tra"}
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto">
                {result ? (
                    <div className="space-y-4 animate-slide-up">
                        <Card className="p-6 border-brand-blue/20 shadow-lg">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h2 className="text-4xl font-black text-brand-blue mb-1 capitalize">{result.word}</h2>
                                    <div className="flex items-center gap-3 text-slate-500">
                                        {result.ipa && <span className="font-mono bg-slate-100 px-2 py-1 rounded-md">{result.ipa}</span>}
                                        <button
                                            onClick={playAudio}
                                            className={`p-2 rounded-full ${result.audio ? 'bg-brand-lightBlue text-brand-blue hover:bg-blue-100' : 'bg-slate-100 text-slate-300'}`}
                                        >
                                            <Volume2 size={18} />
                                        </button>
                                    </div>
                                </div>
                                <button
                                    onClick={handleSave}
                                    disabled={isSaved}
                                    className={`p-3 rounded-xl transition-all ${isSaved ? 'bg-green-100 text-green-600' : 'bg-brand-orange/10 text-brand-orange hover:bg-brand-orange hover:text-white'}`}
                                >
                                    {isSaved ? <Check size={20} /> : <Plus size={20} />}
                                </button>
                            </div>

                            <div className="space-y-4">
                                {result.meanings.map((m, idx) => (
                                    <div key={idx} className="border-t pt-4 border-slate-100">
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{m.type}</span>
                                        <p className="text-xl font-bold text-slate-800 mt-1">{m.definition}</p>
                                        {m.example && (
                                            <div className="mt-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                                <p className="text-slate-500 italic">"{m.example}"</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                ) : (
                    !loading && (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-4 mt-10">
                            <div className="w-32 h-32 bg-slate-100 rounded-full flex items-center justify-center">
                                <Search size={48} className="opacity-20" />
                            </div>
                            <p>Nhập từ vựng để tra cứu online...</p>
                        </div>
                    )
                )}
            </div>
        </div>
    )
}

export default DictionaryScreen
