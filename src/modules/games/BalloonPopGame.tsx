import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, AlertCircle, Sparkles, Volume2 } from 'lucide-react'
import { GameResult } from './components/GameResult'

const NUMBER_WORDS: Record<number, string> = {
    1: 'one', 2: 'two', 3: 'three', 4: 'four', 5: 'five',
    6: 'six', 7: 'seven', 8: 'eight', 9: 'nine', 10: 'ten'
};

// Game Types
type Balloon = {
    id: number;
    number: number;
    color: string;
    x: number;
    y: number;
    speed: number;
    wobbleOffset: number;
    popped: boolean;
}

const BALLOON_COLORS = [
    '#FF5252', // Red
    '#FF4081', // Pink
    '#E040FB', // Purple
    '#7C4DFF', // Deep Purple
    '#536DFE', // Indigo
    '#448AFF', // Blue
    '#40C4FF', // Light Blue
    '#18FFFF', // Cyan
    '#64FFDA', // Teal
    '#69F0AE', // Green
    '#B2FF59', // Light Green
    '#EEFF41', // Lime
    '#FFFF00', // Yellow
    '#FFD740', // Amber
    '#FFAB40', // Orange
    '#FF6E40', // Deep Orange
];

interface BalloonPopGameProps {
    data?: any;
    onComplete: (score: number) => void;
    onExit: () => void;
}

const BalloonPopGame: React.FC<BalloonPopGameProps> = ({ onComplete, onExit }) => {
    // Game State
    const [gameStarted, setGameStarted] = useState(false)
    const [targetNumber, setTargetNumber] = useState<number>(0)
    const [balloons, setBalloons] = useState<Balloon[]>([])
    const [score, setScore] = useState(0)
    const [mistakes, setMistakes] = useState(0)
    const [gameOver, setGameOver] = useState(false)
    const [round, setRound] = useState(1)
    const [clickFeedback, setClickFeedback] = useState<{ x: number, y: number, isCorrect: boolean } | null>(null)
    const [celebrating, setCelebrating] = useState(false)

    // Configuration
    const TOTAL_ROUNDS = 10;
    const WIN_SCORE = 30;
    const BALLOONS_PER_WAVE = 12; // Increased density

    // Generate Baloons
    const generateBalloons = (target: number) => {
        const newBalloons: Balloon[] = [];

        // Ensure the target number is always present at least once or twice
        let numbersToSpawn = [target, target, target]; // 3 targets now

        // Fill the rest with random numbers from 1 to 10
        while (numbersToSpawn.length < BALLOONS_PER_WAVE) {
            let rand = Math.floor(Math.random() * 10) + 1;
            if (rand !== target) numbersToSpawn.push(rand);
        }

        // Shuffle arrays
        numbersToSpawn.sort(() => Math.random() - 0.5);

        // Divide screen into 12 vertical lanes to prevent overlapping
        const lanes = [5, 12, 19, 26, 33, 40, 47, 54, 61, 68, 75, 82];
        lanes.sort(() => Math.random() - 0.5);

        numbersToSpawn.forEach((num, index) => {
            newBalloons.push({
                id: Date.now() + index,
                number: num,
                color: BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)],
                x: lanes[index] + Math.random() * 3, // Base lane position + slight jitter
                y: 110 + Math.random() * 15 + (index * 8), // Stagger vertical start heavily reduced -> tighter clusters
                speed: 15 + Math.random() * 15, // Faster speed (15 to 30 units per sec)
                wobbleOffset: Math.random() * Math.PI * 2, // Random starting phase for wobble
                popped: false
            });
        });

        setBalloons(newBalloons);
    }

    const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});

    useEffect(() => {
        // Preload numbering audio files
        for (let i = 1; i <= 10; i++) {
            const audio = new Audio(`/audio/${i}.mp3`);
            audio.preload = 'auto';
            audioRefs.current[i.toString()] = audio;
        }

        // Preload SFX
        const sfxCorrect = new Audio('/audio/correct.wav');
        sfxCorrect.preload = 'auto';
        audioRefs.current['correct'] = sfxCorrect;

        const sfxWrong = new Audio('/audio/wrong.wav');
        sfxWrong.preload = 'auto';
        audioRefs.current['wrong'] = sfxWrong;

        // Cleanup speech on unmount
        return () => {
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }
        }
    }, []);

    const fallbackTTS = (num: number) => {
        if (!('speechSynthesis' in window)) return;

        const textToSpeak = String(num);
        const msg = new SpeechSynthesisUtterance(textToSpeak);

        msg.lang = 'en-US';
        msg.pitch = 1.5;
        msg.rate = 1.0;
        msg.volume = 1.0;

        let voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
            const enVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Female') || v.name.includes('Samantha') || v.name.includes('Google')))
                || voices.find(v => v.lang.startsWith('en'));
            if (enVoice) {
                msg.voice = enVoice;
            }
        }

        (window as any).__vmsg = msg;
        msg.onerror = (e) => console.error("Speech Synthesis Error:", e);
        window.speechSynthesis.speak(msg);
    }

    const speakNumber = (num: number) => {
        const audio = audioRefs.current[num.toString()];
        if (audio) {
            audio.currentTime = 0;
            audio.play().catch(e => {
                console.error("HTML5 Audio playback failed:", e);
                fallbackTTS(num);
            });
        } else {
            fallbackTTS(num);
        }
    }

    const startRound = () => {
        const randomTarget = Math.floor(Math.random() * 10) + 1;
        setTargetNumber(randomTarget);
        generateBalloons(randomTarget);
        speakNumber(randomTarget);
    }

    const bgMusicRef = useRef<HTMLAudioElement | null>(null);

    const handleStartGame = () => {
        if ('speechSynthesis' in window) {
            const unlockMsg = new SpeechSynthesisUtterance('');
            window.speechSynthesis.speak(unlockMsg);
        }

        // Also unlock HTML5 Audio Context by playing and immediately pausing a dummy sound
        const dummyAudio = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA');
        dummyAudio.play().then(() => dummyAudio.pause()).catch(() => { });

        // Unlock SFX
        audioRefs.current['correct']?.play().then(() => audioRefs.current['correct'].pause()).catch(() => { });
        audioRefs.current['wrong']?.play().then(() => audioRefs.current['wrong'].pause()).catch(() => { });

        // Start BGM
        bgMusicRef.current = new Audio('/sounds/fun_bg_jungle_user.mp4');
        bgMusicRef.current.loop = true;
        bgMusicRef.current.volume = 0.4;
        bgMusicRef.current.play().catch(e => console.log("Audio autoplay blocked", e));

        setGameStarted(true);
        startRound();
    }

    // Cleanup BGM on unmount or game over
    useEffect(() => {
        if (gameOver && bgMusicRef.current) {
            bgMusicRef.current.pause();
            bgMusicRef.current.currentTime = 0;
        }
        return () => {
            if (bgMusicRef.current) {
                bgMusicRef.current.pause();
                bgMusicRef.current.currentTime = 0;
            }
        }
    }, [gameOver])

    // Animation Loop
    useEffect(() => {
        if (!gameStarted || gameOver || celebrating) return;

        let animationFrameId: number;
        let lastTime = performance.now();

        const animate = (time: number) => {
            const deltaTime = (time - lastTime) / 1000; // seconds
            lastTime = time;

            setBalloons(currentBalloons => {
                let allOffScreen = true;

                const updated = currentBalloons.map(b => {
                    if (b.popped) return b;

                    const newY = b.y - (b.speed * deltaTime);

                    // Allow balloons to float off top. If any is still visible, game continues.
                    if (newY > -20) allOffScreen = false;

                    return { ...b, y: newY };
                });

                // If all balloons floated away without being popped, generate more to prevent soft-lock
                if (allOffScreen && updated.length > 0) {
                    // Slight delay to respawn
                    setTimeout(() => generateBalloons(targetNumber), 500);
                    return []; // Clear current to avoid infinite loop of respawning
                }

                return updated;
            });

            animationFrameId = requestAnimationFrame(animate);
        };

        animationFrameId = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(animationFrameId);
    }, [gameStarted, gameOver, celebrating, targetNumber]);

    // Handle Click
    const handleBalloonClick = (e: React.MouseEvent, balloon: Balloon) => {
        e.stopPropagation();
        if (balloon.popped || gameOver || celebrating) return;

        const isCorrect = balloon.number === targetNumber;

        // Show feedback
        setClickFeedback({ x: e.clientX, y: e.clientY, isCorrect });
        setTimeout(() => setClickFeedback(null), 800);

        if (isCorrect) {
            // Play Correct Sound
            const correctAudio = audioRefs.current['correct'];
            if (correctAudio) {
                correctAudio.currentTime = 0;
                correctAudio.play().catch(() => { });
            }

            // Pop the balloon
            setBalloons(prev => prev.map(b => b.id === balloon.id ? { ...b, popped: true } : b));
            const newScore = score + 1;
            setScore(newScore);

            setCelebrating(true);
            setTimeout(() => {
                setCelebrating(false);
                if (round < TOTAL_ROUNDS) {
                    setRound(r => r + 1);
                    startRound();
                } else {
                    setGameOver(true);
                }
            }, 1500);
        } else {
            // Play Wrong Sound
            const wrongAudio = audioRefs.current['wrong'];
            if (wrongAudio) {
                wrongAudio.currentTime = 0;
                wrongAudio.play().catch(() => { });
            }

            // Wrong balloon!
            setMistakes(m => m + 1);
            // Optionally, we could add a slight penalty or red flash
        }
    }

    // Finish Game
    const handleFinish = () => {
        // Calculate final score based on mistakes
        let finalScore = WIN_SCORE - (mistakes * 2);
        if (finalScore < 10) finalScore = 10; // Minimum score
        onComplete(finalScore);
    }

    // Render Game Over
    if (gameOver) {
        return <GameResult score={score} maxScore={10} onComplete={() => onComplete(score)} />
    }

    return (
        <div className="fixed inset-0 z-[100] bg-sky-300 overflow-hidden select-none">

            {/* Animated Natural Clouds Background */}
            <div className="absolute inset-0 pointer-events-none opacity-60">
                <motion.div
                    initial={{ x: '-100%' }}
                    animate={{ x: '100vw' }}
                    transition={{ ease: "linear", duration: 80, repeat: Infinity }}
                    className="absolute top-[10%] left-0 w-48 h-16 bg-white/80 rounded-full blur-[2px]"
                >
                    <div className="absolute -top-6 left-8 w-20 h-20 bg-white/80 rounded-full" />
                    <div className="absolute -top-10 left-20 w-24 h-24 bg-white/80 rounded-full" />
                </motion.div>

                <motion.div
                    initial={{ x: '-10%' }}
                    animate={{ x: '100vw' }}
                    transition={{ ease: "linear", duration: 120, repeat: Infinity }}
                    className="absolute top-[30%] left-[-20%] w-64 h-20 bg-white/60 rounded-full blur-[3px]"
                >
                    <div className="absolute -top-8 left-10 w-24 h-24 bg-white/60 rounded-full" />
                    <div className="absolute -top-12 left-24 w-32 h-32 bg-white/60 rounded-full" />
                </motion.div>

                <motion.div
                    initial={{ x: '50vw' }}
                    animate={{ x: '100vw' }}
                    transition={{ ease: "linear", duration: 90, repeat: Infinity }}
                    className="absolute top-[60%] left-0 w-40 h-12 bg-white/70 rounded-full blur-[2px]"
                >
                    <div className="absolute -top-5 left-6 w-16 h-16 bg-white/70 rounded-full" />
                    <div className="absolute -top-8 left-16 w-20 h-20 bg-white/70 rounded-full" />
                </motion.div>

                {/* Second set of clouds for continuous loop illusion */}
                <motion.div
                    initial={{ x: '-150%' }}
                    animate={{ x: '100vw' }}
                    transition={{ ease: "linear", duration: 80, repeat: Infinity, delay: 40 }}
                    className="absolute top-[15%] left-0 w-56 h-16 bg-white/50 rounded-full blur-[2px]"
                >
                    <div className="absolute -top-8 left-8 w-24 h-24 bg-white/50 rounded-full" />
                    <div className="absolute -top-12 left-20 w-28 h-28 bg-white/50 rounded-full" />
                </motion.div>
            </div>

            {!gameStarted ? (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center max-w-sm w-full mx-4 text-center"
                    >
                        <div className="w-24 h-24 bg-brand-blue/10 rounded-full flex items-center justify-center mb-6">
                            <Volume2 className="text-brand-blue w-12 h-12" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-800 mb-2">Bật Âm Thanh</h2>
                        <p className="text-slate-500 mb-8">
                            Nhấn Bắt Đầu để cho phép trò chơi phát âm thanh bài học nhé!
                        </p>
                        <button
                            onClick={handleStartGame}
                            className="bg-brand-blue text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-lg shadow-blue-500/30 w-full hover:scale-105 transition-transform"
                        >
                            Bắt Đầu Ngay
                        </button>
                    </motion.div>
                </div>
            ) : (
                <>
                    {/* Clouds Overlay for depth */}
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-10 left-[-10%] w-[120%] h-32 bg-white/20 blur-2xl rounded-full mix-blend-overlay" />
                        <div className="absolute bottom-1/3 right-[-10%] w-[80%] h-40 bg-white/20 blur-3xl rounded-full mix-blend-overlay" />
                    </div>

                    {/* Top Bar Status */}
                    <div className="absolute top-6 left-0 right-0 p-4 flex justify-between items-start z-20 pointer-events-none">
                        <div className="bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2 shadow-sm border border-white/50">
                            <span className="font-bold text-brand-blue">Vòng: {round}/{TOTAL_ROUNDS}</span>
                        </div>
                        <div className="flex flex-col items-end gap-3 pointer-events-auto">
                            <button
                                onClick={onExit}
                                className="bg-white/80 hover:bg-red-50 text-red-500 backdrop-blur-sm rounded-full px-4 py-2 font-bold shadow-sm border border-white/50 transition-colors flex items-center gap-2"
                            >
                                <AlertCircle className="w-4 h-4" /> Thoát
                            </button>
                            <div className="flex flex-wrap items-center justify-end gap-1.5 max-w-[150px]">
                                {[...Array(TOTAL_ROUNDS)].map((_, i) => (
                                    <div key={i} className={`w-3 h-3 md:w-4 md:h-4 rounded-full ${i < round - 1 ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]' : 'bg-white/50 border border-white/30'}`} />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Balloons Area */}
                    <div className="absolute inset-0 z-10" onClick={() => {
                        setMistakes(m => m + 1);
                        setClickFeedback({ x: window.innerWidth / 2, y: window.innerHeight / 2, isCorrect: false });
                        setTimeout(() => setClickFeedback(null), 800);
                    }}>
                        <AnimatePresence>
                            {balloons.map(balloon => {
                                if (balloon.popped) return null;

                                // Calculate wobble using time and offset
                                const timeInSec = performance.now() / 1000;
                                const wobbleParams = Math.sin(timeInSec * 2 + balloon.wobbleOffset) * 5;

                                return (
                                    <motion.div
                                        key={balloon.id}
                                        className="absolute cursor-pointer"
                                        style={{
                                            left: `${balloon.x}%`,
                                            top: `${balloon.y}%`,
                                            transform: `translateX(-50%) translateX(${wobbleParams}px)`,
                                        }}
                                        onClick={(e) => handleBalloonClick(e, balloon)}
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        exit={{ scale: 1.5, opacity: 0, transition: { duration: 0.2 } }}
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                    >
                                        {/* Balloon Body */}
                                        <div className="relative flex flex-col items-center">
                                            <div
                                                className="w-24 h-28 rounded-[50%] shadow-inner flex items-center justify-center relative overflow-hidden"
                                                style={{
                                                    backgroundColor: balloon.color,
                                                    boxShadow: 'inset -5px -5px 15px rgba(0,0,0,0.2), 0 5px 15px rgba(0,0,0,0.2)'
                                                }}
                                            >
                                                {/* Highlight reflection */}
                                                <div className="absolute top-2 left-4 w-6 h-10 bg-white/40 rounded-[50%] rotate-z-[25deg] blur-[1px]" />

                                                {/* Number */}
                                                <span className="text-4xl font-black text-white drop-shadow-md relative z-10" style={{ textShadow: '2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000' }}>
                                                    {balloon.number}
                                                </span>
                                            </div>

                                            {/* Balloon Knot & String */}
                                            <div className="w-4 h-3 rounded-b-md -mt-1 z-0" style={{ backgroundColor: balloon.color, filter: 'brightness(0.8)' }} />
                                            <svg width="2" height="40" className="opacity-50 mt-[-2px] z-[-1]">
                                                <path d="M1,0 Q3,10 0,20 T1,40" stroke="white" strokeWidth="2" fill="none" />
                                            </svg>
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </AnimatePresence>
                    </div>

                    {/* Click Feedback Overlay */}
                    <AnimatePresence>
                        {clickFeedback && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 1.5 }}
                                className="fixed pointer-events-none z-50 flex flex-col items-center"
                                style={{ left: clickFeedback.x - 24, top: clickFeedback.y - 48 }}
                            >
                                {clickFeedback.isCorrect ? (
                                    <CheckCircle className="text-green-500 w-12 h-12 bg-white rounded-full shadow-lg" />
                                ) : (
                                    <AlertCircle className="text-red-500 w-12 h-12 bg-white rounded-full shadow-lg" />
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Bottom Character & Instruction */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 pb-8 z-30 pointer-events-none flex items-end justify-center">
                        <div className="relative flex items-end max-w-md w-full">
                            {/* Character */}
                            <img
                                src="/images/balloon_monkey_new.png"
                                className="w-32 h-32 object-contain drop-shadow-xl z-10 cursor-pointer hover:scale-105 transition-transform"
                                alt="Monkey Character"
                                onClick={() => speakNumber(targetNumber)}
                            />

                            {/* Speech Bubble */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                key={targetNumber}
                                className="bg-white px-6 py-4 rounded-3xl rounded-bl-none shadow-[0_8px_30px_rgb(0,0,0,0.12)] border-2 border-slate-100 ml-[-20px] mb-8 relative cursor-pointer hover:bg-slate-50 transition-colors pointer-events-auto"
                                onClick={() => speakNumber(targetNumber)}
                            >
                                <div className="flex items-center gap-2">
                                    <p className="text-xl font-bold text-slate-700">
                                        Tìm số <span className="text-4xl font-black text-brand-blue mx-1 uppercase">{NUMBER_WORDS[targetNumber]}</span> nhé!
                                    </p>
                                    <div className="bg-brand-blue/10 p-2 rounded-full animate-pulse">
                                        <Volume2 className="text-brand-blue w-5 h-5" />
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>

                    {/* Celebration Overlay */}
                    <AnimatePresence>
                        {celebrating && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 z-40 bg-white/30 backdrop-blur-sm flex items-center justify-center pointer-events-none"
                            >
                                <motion.div
                                    initial={{ scale: 0.5, rotate: -10 }}
                                    animate={{ scale: 1.2, rotate: 10 }}
                                    exit={{ scale: 0 }}
                                    transition={{ type: "spring", damping: 10 }}
                                >
                                    <h1 className="text-6xl font-black text-brand-orange drop-shadow-xl" style={{ textShadow: '3px 3px 0 #fff' }}>Hoan hô!</h1>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </>
            )}
        </div>
    )
}

export default BalloonPopGame
