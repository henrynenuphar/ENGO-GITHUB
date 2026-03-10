import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// Force Vite HMR rebuild
import { Volume2, ChevronRight, CheckCircle, RotateCcw } from 'lucide-react';
import { GameResult } from './components/GameResult';

// Word to Character Map
const NUMBER_WORDS = ['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE', 'TEN'];

// SVG Path Data for letters used in words ONE-TEN
const CHAR_PATHS: Record<string, string> = {
    'O': 'M 100 20 C 40 20, 40 180, 100 180 C 160 180, 160 20, 100 20',
    'N': 'M 40 180 L 40 20 L 160 180 L 160 20',
    'E': 'M 160 20 L 60 20 L 60 180 L 160 180 M 60 100 L 140 100',
    'T': 'M 40 20 L 160 20 M 100 20 L 100 180',
    'W': 'M 40 20 L 70 180 L 100 60 L 130 180 L 160 20',
    'H': 'M 60 20 L 60 180 M 140 20 L 140 180 M 60 100 L 140 100',
    'R': 'M 60 180 L 60 20 C 140 20, 140 100, 60 100 L 160 180',
    'F': 'M 160 20 L 60 20 L 60 180 M 60 100 L 140 100',
    'U': 'M 60 20 L 60 140 C 60 180, 140 180, 140 140 L 140 20',
    'I': 'M 60 20 L 140 20 M 100 20 L 100 180 M 60 180 L 140 180',
    'V': 'M 40 20 L 100 180 L 160 20',
    'S': 'M 160 40 C 160 10, 40 10, 40 80 C 40 150, 160 150, 160 180 C 160 200, 40 200, 40 160',
    'X': 'M 40 20 L 160 180 M 160 20 L 40 180',
    'G': 'M 160 60 C 160 20, 40 20, 40 100 C 40 180, 160 180, 160 100 L 100 100'
};

const getStrokes = (d: string) => {
    return d.split(/(?=M)/).map(s => s.trim()).filter(Boolean);
};

interface NumberWordTraceGameProps {
    data?: any;
    onComplete: (score: number) => void;
    onExit: () => void;
}

const NumberWordTraceGame: React.FC<NumberWordTraceGameProps> = ({ onComplete, onExit }) => {
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [currentCharIndex, setCurrentCharIndex] = useState(0);
    const [currentStrokeIndex, setCurrentStrokeIndex] = useState(0);

    // Tracing engine state
    const [isTracing, setIsTracing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [strokeLength, setStrokeLength] = useState(1000);
    const [strokeStart, setStrokeStart] = useState({ x: 0, y: 0 });

    const [gameOver, setGameOver] = useState(false);

    const svgRef = useRef<SVGSVGElement>(null);
    const measureStrokeRef = useRef<SVGPathElement>(null);
    const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});

    const currentWord = NUMBER_WORDS[currentWordIndex];
    const currentChar = currentWord?.[currentCharIndex];
    const charStrokes = currentChar ? getStrokes(CHAR_PATHS[currentChar]) : [];
    const isWordComplete = currentCharIndex === currentWord.length - 1 && currentStrokeIndex >= charStrokes.length;

    const [hasInteracted, setHasInteracted] = useState(false);

    // Preload voices and BG music
    const bgMusicRef = useRef<HTMLAudioElement | null>(null);
    useEffect(() => {
        audioRefs.current['correct'] = new Audio('/audio/correct.wav');
        if ('speechSynthesis' in window) {
            window.speechSynthesis.onvoiceschanged = () => {
                window.speechSynthesis.getVoices();
            };
            window.speechSynthesis.getVoices();
        }

        // Initialize music
        bgMusicRef.current = new Audio('/sounds/fun_bg_jungle_user.mp4');
        bgMusicRef.current.loop = true;
        bgMusicRef.current.volume = 0.4;

        return () => {
            if ('speechSynthesis' in window) window.speechSynthesis.cancel();
            if (bgMusicRef.current) {
                bgMusicRef.current.pause();
                bgMusicRef.current.currentTime = 0;
            }
        }
    }, []);

    useEffect(() => {
        // Play when interacted and not over
        if (hasInteracted && !gameOver && bgMusicRef.current) {
            bgMusicRef.current.play().catch(e => console.log("Audio autoplay blocked", e));
        } else if (bgMusicRef.current) {
            bgMusicRef.current.pause();
        }
    }, [hasInteracted, gameOver]);

    const playSound = (text: string, onEnd?: () => void) => {
        // Try local MP3 for full words first
        const wordIndex = NUMBER_WORDS.indexOf(text.toUpperCase());
        if (wordIndex !== -1) {
            try {
                const audio = new Audio(`/audio/${wordIndex + 1}.mp3`);
                audio.onended = onEnd || null;
                audio.play().catch(() => playTTS(text, onEnd));
                return;
            } catch (e) {
                // Fallback to TTS handled below
            }
        }
        playTTS(text, onEnd);
    };

    const playTTS = (text: string, onEnd?: () => void) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const msg = new SpeechSynthesisUtterance(text);
            msg.lang = 'en-US';
            msg.rate = 0.75;
            msg.pitch = 1.1;

            const voices = window.speechSynthesis.getVoices();
            const enVoice = voices.find(v => v.lang.startsWith('en-US') || v.lang.startsWith('en-GB') || v.lang.startsWith('en'));
            if (enVoice) msg.voice = enVoice;
            if (onEnd) msg.onend = onEnd;

            window.speechSynthesis.speak(msg);
        } else {
            onEnd?.();
        }
    };

    // Play a cheerful chime using Web Audio API (no assets needed)
    const playWordCompleteFanfare = () => {
        try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
            notes.forEach((freq, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.type = 'sine';
                osc.frequency.value = freq;
                const startTime = ctx.currentTime + i * 0.14;
                gain.gain.setValueAtTime(0, startTime);
                gain.gain.linearRampToValueAtTime(0.35, startTime + 0.03);
                gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.45);
                osc.start(startTime);
                osc.stop(startTime + 0.5);
            });
        } catch (e) { /* Audio not supported */ }
    };

    // Measure newly active stroke
    useEffect(() => {
        if (measureStrokeRef.current && currentChar) {
            try {
                const len = measureStrokeRef.current.getTotalLength();
                let start = { x: 0, y: 0 };
                if (len > 0) start = measureStrokeRef.current.getPointAtLength(0);
                setStrokeLength(Math.max(len, 1));
                setStrokeStart(start);
            } catch (e) { }
        }
    }, [currentCharIndex, currentWordIndex, currentStrokeIndex, currentChar]);

    // Auto-play the first word on game mount
    useEffect(() => {
        const timer = setTimeout(() => {
            playSound(currentWord);
        }, 800);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const getLocalCoordinates = (e: React.PointerEvent) => {
        if (!svgRef.current) return null;
        const pt = svgRef.current.createSVGPoint();
        pt.x = e.clientX;
        pt.y = e.clientY;
        const ctm = svgRef.current.getScreenCTM();
        if (!ctm) return null;
        const svgP = pt.matrixTransform(ctm.inverse());
        return {
            x: svgP.x - currentCharIndex * 180,
            y: svgP.y
        };
    };

    const handlePointerDown = (e: React.PointerEvent) => {
        if (isWordComplete || currentStrokeIndex >= charStrokes.length) return;
        const local = getLocalCoordinates(e);
        if (!local || !measureStrokeRef.current) return;

        // Check if user taps near the current progress knot
        const currentPt = measureStrokeRef.current.getPointAtLength(progress);
        const dist = Math.hypot(currentPt.x - local.x, currentPt.y - local.y);
        if (dist < 60) {
            setIsTracing(true);
            (e.target as Element).setPointerCapture(e.pointerId);
        }
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!isTracing || isWordComplete) return;
        const local = getLocalCoordinates(e);
        if (!local || !measureStrokeRef.current) return;

        let closestDist = Infinity;
        let bestLength = progress;

        // Look ahead window limits snapping too far ahead or backwards
        const LOOK_AHEAD = 80;
        for (let l = Math.max(0, progress - 10); l <= Math.min(progress + LOOK_AHEAD, strokeLength); l += 5) {
            const p = measureStrokeRef.current.getPointAtLength(l);
            const d = Math.hypot(p.x - local.x, p.y - local.y);
            if (d < closestDist) {
                closestDist = d;
                bestLength = l;
            }
        }

        const TOLERANCE = 50;
        if (closestDist < TOLERANCE) {
            setProgress(bestLength);

            // Reached end of stroke
            if (bestLength >= strokeLength - 10 || (strokeLength < 10 && bestLength > 0)) {
                setIsTracing(false);
                setProgress(0);

                if (currentStrokeIndex < charStrokes.length - 1) {
                    // Next stroke in same char
                    setCurrentStrokeIndex(p => p + 1);
                } else {
                    // Done with this char — play the letter sound
                    const audio = audioRefs.current['correct'];
                    if (audio) { audio.currentTime = 0; audio.play().catch(() => { }); }

                    playSound(currentChar);

                    if (currentCharIndex < currentWord.length - 1) {
                        setCurrentStrokeIndex(0);
                        setTimeout(() => {
                            setCurrentCharIndex(p => p + 1);
                        }, 600);
                    } else {
                        // Entire word complete!
                        setCurrentStrokeIndex(charStrokes.length);
                        // Play fanfare then read out the full word
                        playWordCompleteFanfare();
                        setTimeout(() => playSound(currentWord.toLowerCase()), 800);
                    }
                }
            }
        } else if (closestDist > TOLERANCE * 1.5) {
            // Stray too far
            setIsTracing(false);
        }
    };

    const handlePointerUp = () => setIsTracing(false);

    const handleNextWord = () => {
        if (currentWordIndex < NUMBER_WORDS.length - 1) {
            const nextWord = NUMBER_WORDS[currentWordIndex + 1];
            setCurrentWordIndex(p => p + 1);
            setCurrentCharIndex(0);
            setCurrentStrokeIndex(0);
            setProgress(0);

            // Auto play the new word tied immediately to the user's click gesture
            setTimeout(() => {
                playSound(nextWord);
            }, 600);
        } else {
            setGameOver(true);
        }
    };

    if (gameOver) {
        return <GameResult score={10} maxScore={10} onComplete={() => onComplete(10)} />
    }

    return (
        <div className="fixed inset-0 z-[100] bg-orange-50 overflow-hidden select-none touch-none" onPointerDown={() => setHasInteracted(true)}>
            <div className="absolute inset-0 bg-cover bg-center opacity-60" style={{ backgroundImage: 'url(/images/trace_bg.png)' }} />

            {/* Header */}
            <div className="absolute top-6 left-0 right-0 p-4 flex justify-between items-center z-20 pointer-events-none">
                <div className="bg-white/90 backdrop-blur-md rounded-full px-6 py-2 flex items-center gap-4 shadow-lg border-2 border-orange-100 pointer-events-auto">
                    <Volume2 className="text-brand-orange w-6 h-6 cursor-pointer" onClick={() => playSound(currentWord)} />
                    <div className="flex gap-1">
                        {currentWord.split('').map((char, i) => (
                            <span key={i} className={`text-3xl font-black transition-colors ${i < currentCharIndex ? 'text-green-500' : (i === currentCharIndex ? 'text-brand-orange animate-pulse' : 'text-slate-300')}`}>
                                {char}
                            </span>
                        ))}
                    </div>
                </div>
                <button onClick={onExit} className="bg-white/80 text-red-500 rounded-full px-5 py-2 font-bold shadow-md pointer-events-auto">Thoát</button>
            </div>

            {/* Main Tracing Area */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pt-20 pb-32 z-10">

                {/* Apples/Count Visual */}
                <div className="flex flex-wrap justify-center gap-2 mb-8 min-h-[100px] max-w-[80vw]">
                    <AnimatePresence>
                        {[...Array(currentWordIndex + 1)].map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center text-4xl md:text-5xl drop-shadow-md bg-white rounded-full border-4 border-orange-100 pb-1"
                            >
                                🍎
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* The Tracing Canvas Box */}
                <div className="relative bg-[#FFDD7E]/40 backdrop-blur-xl rounded-[50px] p-2 w-[95%] md:w-[80%] aspect-video max-w-[800px] shadow-2xl border-4 border-white flex justify-center items-center overflow-hidden touch-none select-none">

                    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white px-8 py-2 rounded-full text-[#F59E0B] font-black text-xl whitespace-nowrap shadow-sm border-2 border-orange-100 flex items-center gap-3">
                        <Volume2 className="w-5 h-5 cursor-pointer text-[#F59E0B]" onClick={() => playSound(currentWord)} />
                        {currentWord.toLowerCase()}
                    </div>

                    <div className="w-full h-full flex justify-center items-center mt-12 px-6">
                        <svg
                            ref={svgRef}
                            viewBox={`0 0 ${currentWord.length * 180} 200`}
                            className="w-full h-full max-h-[300px] overflow-visible"
                            onPointerDown={handlePointerDown}
                            onPointerMove={handlePointerMove}
                            onPointerUp={handlePointerUp}
                            onPointerLeave={handlePointerUp}
                            style={{ touchAction: 'none' }}
                        >
                            {/* Hidden measurement path for current active stroke */}
                            {!isWordComplete && charStrokes[currentStrokeIndex] && (
                                <path
                                    ref={measureStrokeRef}
                                    d={charStrokes[currentStrokeIndex]}
                                    fill="none" stroke="none" opacity="0" pointerEvents="none"
                                />
                            )}

                            {/* Render all character letters */}
                            {currentWord.split('').map((char, i) => {
                                const localStrokes = getStrokes(CHAR_PATHS[char]);
                                const isDoneChar = i < currentCharIndex;
                                const isCurrentChar = i === currentCharIndex;

                                return (
                                    <g key={`${i}-${char}`} transform={`translate(${i * 180}, 0)`}>

                                        {/* Fat Solid White Background Trace Track */}
                                        <path d={CHAR_PATHS[char]} fill="none" stroke="#FFFFFF" strokeWidth="48" strokeLinecap="round" strokeLinejoin="round" />

                                        {/* Inner Dashed Track Guideline */}
                                        <path d={CHAR_PATHS[char]} fill="none" stroke="#D1D5DB" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="12 16" />

                                        {/* Filled Strokes */}
                                        {localStrokes.map((strokeData, sIdx) => {
                                            const isDoneStroke = isDoneChar || (isCurrentChar && sIdx < currentStrokeIndex);
                                            const isCurrentStroke = isCurrentChar && sIdx === currentStrokeIndex;

                                            if (isDoneStroke) {
                                                return <path key={sIdx} d={strokeData} fill="none" stroke="#8B5CF6" strokeWidth="36" strokeLinecap="round" strokeLinejoin="round" />;
                                            }
                                            if (isCurrentStroke && progress > 0) {
                                                return (
                                                    <path
                                                        key={sIdx} d={strokeData} fill="none" stroke="#8B5CF6" strokeWidth="36" strokeLinecap="round" strokeLinejoin="round"
                                                        strokeDasharray={strokeLength}
                                                        strokeDashoffset={strokeLength - progress}
                                                        style={{ transition: isTracing ? 'none' : 'stroke-dashoffset 0.1s ease-out' }}
                                                    />
                                                );
                                            }
                                            return null;
                                        })}

                                        {/* The Active Indicator Dot & Finger */}
                                        {isCurrentChar && !isWordComplete && (
                                            <g>
                                                {(() => {
                                                    let pointX = strokeStart.x;
                                                    let pointY = strokeStart.y;
                                                    if (measureStrokeRef.current && progress > 0) {
                                                        const pt = measureStrokeRef.current.getPointAtLength(progress);
                                                        pointX = pt.x; pointY = pt.y;
                                                    }
                                                    return (
                                                        <g transform={`translate(${pointX}, ${pointY})`}>
                                                            {/* Blue target circle */}
                                                            <circle r="22" fill="#60A5FA" stroke="white" strokeWidth="6" className="drop-shadow-sm pointer-events-none" />
                                                            {/* White inner dot */}
                                                            <circle r="8" fill="white" className="pointer-events-none" />

                                                            {/* Helper animated finger if child is not tracing yet */}
                                                            {!isTracing && progress === 0 && (
                                                                <motion.image
                                                                    href="/images/trace_finger.png"
                                                                    width="90"
                                                                    height="90"
                                                                    x="-20" y="0"
                                                                    initial={{ opacity: 0 }}
                                                                    animate={{ x: [-20, 10, -20], y: [0, 20, 0], opacity: 1 }}
                                                                    transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
                                                                    className="pointer-events-none drop-shadow-md"
                                                                />
                                                            )}
                                                        </g>
                                                    );
                                                })()}
                                            </g>
                                        )}
                                    </g>
                                );
                            })}
                        </svg>
                    </div>

                    {isWordComplete && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute inset-0 flex flex-col items-center justify-center bg-white/40 backdrop-blur-sm rounded-[50px] z-10 pointer-events-none">
                            <motion.div initial={{ y: 20 }} animate={{ y: [0, -20, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                                <svg viewBox="0 0 100 100" className="w-32 h-32 drop-shadow-2xl">
                                    <circle cx="50" cy="50" r="48" fill="#22C55E" />
                                    <path d="M30 50 L45 65 L70 35" fill="none" stroke="white" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </motion.div>
                        </motion.div>
                    )}
                </div>

                {/* Footer Controls */}
                <div className="mt-8 min-h-[80px]">
                    {isWordComplete && (
                        <motion.button
                            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                            onClick={handleNextWord}
                            className="bg-[#8B5CF6] text-white px-12 py-5 rounded-[30px] font-black text-2xl shadow-[0_8px_0_#6D28D9] hover:translate-y-1 hover:shadow-[0_4px_0_#6D28D9] transition-all flex items-center gap-3 active:shadow-none active:translate-y-2 pointer-events-auto"
                        >
                            {currentWordIndex === NUMBER_WORDS.length - 1 ? 'XONG! 🎉' : 'CHỮ TIẾP THEO'} <ChevronRight className="w-8 h-8" />
                        </motion.button>
                    )}
                </div>
            </div>
            {/* Mascot */}
            <div className="absolute bottom-[-10px] left-4 z-20 pointer-events-none">
                <motion.img animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 3 }} src="/images/balloon_monkey_new.png" className="w-48 h-48 md:w-64 md:h-64 object-contain drop-shadow-2xl" />
            </div>
        </div>
    );
};

export default NumberWordTraceGame;
