import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  MessageSquare,
  Utensils,
  Compass,
  BookOpen,
  Heart,
  Volume2,
  RotateCcw,
  Trophy,
  Zap,
  Check,
  X,
  Hourglass,
  Sparkles,
  Award,
  ChevronRight,
  Info,
  HelpCircle,
  VolumeX,
  CheckCircle2,
  Layers,
  ArrowRight
} from "lucide-react";
import {
  VOCABULARY,
  CATEGORIES,
  INITIAL_ACHIEVEMENTS,
  WordItem,
  Category,
  Achievement
} from "./data";

export default function App() {
  // --- Game General States ---
  const [selectedCategory, setSelectedCategory] = useState<string>("greetings");
  const [gameMode, setGameMode] = useState<"menu" | "quiz" | "mosaic" | "speedrun">("menu");
  const [score, setScore] = useState<number>(() => {
    return Number(localStorage.getItem("olympus_score") || "0");
  });
  const [streak, setStreak] = useState<number>(0);
  const [highStreak, setHighStreak] = useState<number>(() => {
    return Number(localStorage.getItem("olympus_high_streak") || "0");
  });
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("olympus_achievements") || "[]");
    } catch {
      return [];
    }
  });
  const [isSoundOn, setIsSoundOn] = useState<boolean>(true);
  const [vocabularyStats, setVocabularyStats] = useState<Record<string, { views: number; corrects: number }>>(() => {
    try {
      return JSON.parse(localStorage.getItem("olympus_stats") || "{}");
    } catch {
      return {};
    }
  });

  // Badge notification banner state
  const [achievementNotification, setAchievementNotification] = useState<string | null>(null);

  // --- Quiz Mode States ---
  const [quizWordIndex, setQuizWordIndex] = useState<number>(0);
  const [quizSelectedAnswer, setQuizSelectedAnswer] = useState<string | null>(null);
  const [isCardFlipped, setIsCardFlipped] = useState<boolean>(false);
  const [quizAnswersHistory, setQuizAnswersHistory] = useState<boolean[]>([]);

  // --- Mosaic Game States ---
  interface MosaicCard {
    id: string;
    text: string;
    type: "armenian" | "spanish";
    wordId: string;
    status: "idle" | "selected" | "matched" | "error";
  }
  const [mosaicCards, setMosaicCards] = useState<MosaicCard[]>([]);
  const [selectedMosaicId, setSelectedMosaicId] = useState<string | null>(null);
  const [mosaicMistakes, setMosaicMistakes] = useState<number>(0);
  const [mosaicCompleted, setMosaicCompleted] = useState<boolean>(false);

  // --- Speed Run (Olympus Call) States ---
  const [speedTimer, setSpeedTimer] = useState<number>(30);
  const [speedActive, setSpeedActive] = useState<boolean>(false);
  const [speedWord, setSpeedWord] = useState<WordItem | null>(null);
  const [speedChoices, setSpeedChoices] = useState<string[]>([]);
  const [speedScore, setSpeedScore] = useState<number>(0);
  const [speedHighScore, setSpeedHighScore] = useState<number>(() => {
    return Number(localStorage.getItem("olympus_speed_highscore") || "0");
  });

  // --- Reference to intervals ---
  const speedIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // --- Achievements definition list ---
  const achievementsList = useMemo(() => {
    return INITIAL_ACHIEVEMENTS.map((badge) => ({
      ...badge,
      unlocked: unlockedAchievements.includes(badge.id)
    }));
  }, [unlockedAchievements]);

  // Filter vocabulary by selected category
  const filteredVocabulary = useMemo(() => {
    return VOCABULARY.filter((item) => item.category === selectedCategory);
  }, [selectedCategory]);

  // Current category metadata
  const currentCategoryMeta = useMemo(() => {
    return CATEGORIES.find((cat) => cat.id === selectedCategory) || CATEGORIES[0];
  }, [selectedCategory]);

  // Save score & stats on change
  useEffect(() => {
    localStorage.setItem("olympus_score", score.toString());
    localStorage.setItem("olympus_high_streak", highStreak.toString());
    localStorage.setItem("olympus_achievements", JSON.stringify(unlockedAchievements));
    localStorage.setItem("olympus_stats", JSON.stringify(vocabularyStats));
  }, [score, highStreak, unlockedAchievements, vocabularyStats]);

  // Handle achievement check
  const checkAndUnlockAchievement = (conditionType: string, value: number | string) => {
    const matchedBadge = INITIAL_ACHIEVEMENTS.find((badge) => badge.condition === conditionType);
    if (!matchedBadge || unlockedAchievements.includes(matchedBadge.id)) return;

    let shouldUnlock = false;

    if (conditionType === "5_correct" && typeof value === "number" && value >= 5) {
      shouldUnlock = true;
    } else if (conditionType === "8_streak" && typeof value === "number" && value >= 8) {
      shouldUnlock = true;
    } else if (conditionType === "12_speed" && typeof value === "number" && value >= 12) {
      shouldUnlock = true;
    } else if (conditionType === "mosaic_complete" && value === "yes") {
      shouldUnlock = true;
    } else if (conditionType === "30_total") {
      // count unique correct vocabulary items from stats
      const correctCount = (Object.values(vocabularyStats) as { views: number; corrects: number }[]).filter((s) => s.corrects > 0).length;
      if (correctCount >= 30) shouldUnlock = true;
    } else if (conditionType === "100_percent" && value === "perfect_category") {
      shouldUnlock = true;
    }

    if (shouldUnlock) {
      const updated = [...unlockedAchievements, matchedBadge.id];
      setUnlockedAchievements(updated);
      setAchievementNotification(matchedBadge.titleArm);
      // Award extra Gold Drachmas for unlocking a badge!
      setScore((prev) => prev + 150);

      // Auto dismiss after 4 seconds
      setTimeout(() => {
        setAchievementNotification(null);
      }, 4000);
    }
  };

  // --- Pronunciation Speech Synthesis ---
  const speakSpanish = (text: string) => {
    if (!isSoundOn) return;
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/[¡!¿?]/g, ""); // strip spanish inverted symbols for cleaner pronunciation
      const utterance = new SynthesisSpeechUtteranceFallback(cleanText);
      utterance.lang = "es-ES";
      utterance.rate = 0.82; // slightly relaxed pace for educational purposes
      window.speechSynthesis.speak(utterance);
    }
  };

  // Polyfill fallback in case typing lacks SynthesisSpeechUtterance
  const SynthesisSpeechUtteranceFallback = (window.SpeechSynthesisUtterance || function(txt: string) {
    this.text = txt;
    this.lang = "es-ES";
    this.rate = 1;
  }) as unknown as typeof SpeechSynthesisUtterance;

  // Track user vocabulary answers stats
  const updateStats = (wordId: string, isCorrect: boolean) => {
    setVocabularyStats((prev) => {
      const current = prev[wordId] || { views: 0, corrects: 0 };
      const updated = {
        views: current.views + 1,
        corrects: current.corrects + (isCorrect ? 1 : 0)
      };
      const result = { ...prev, [wordId]: updated };
      // check Aphrodite's Apple (30+ total correct)
      const correctCount = (Object.values(result) as { views: number; corrects: number }[]).filter((s) => s.corrects > 0).length;
      if (correctCount >= 30) {
        // schedule microtask to avoid react warning
        setTimeout(() => checkAndUnlockAchievement("30_total", correctCount), 10);
      }
      return result;
    });
  };

  // --- Quiz Initialization & Functions ---
  const startQuizMode = () => {
    setQuizWordIndex(0);
    setQuizSelectedAnswer(null);
    setIsCardFlipped(false);
    setQuizAnswersHistory([]);
    generateQuizChoices(0);
    setGameMode("quiz");
  };

  const generateQuizChoices = (wordIdx: number) => {
    if (filteredVocabulary.length === 0) return;
    const correctWord = filteredVocabulary[wordIdx];
    const choicesList = [correctWord.spanish];

    // get random incorrect choices from general vocabulary list
    const otherWords = VOCABULARY.filter((item) => item.spanish !== correctWord.spanish);
    const shuffledOthers = [...otherWords].sort(() => 0.5 - Math.random());

    for (let i = 0; i < 3 && i < shuffledOthers.length; i++) {
      choicesList.push(shuffledOthers[i].spanish);
    }

    // shuffle choices list
    setQuizChoices(choicesList.sort(() => 0.5 - Math.random()));
  };

  const [quizChoices, setQuizChoices] = useState<string[]>([]);

  const handleQuizAnswer = (selectedAnswer: string) => {
    if (quizSelectedAnswer !== null) return; // already answered
    setQuizSelectedAnswer(selectedAnswer);

    const correctWord = filteredVocabulary[quizWordIndex];
    const isCorrect = selectedAnswer === correctWord.spanish;

    // Pronounce the Spanish word immediately
    speakSpanish(correctWord.spanish);

    // Update stats
    updateStats(correctWord.id, isCorrect);

    if (isCorrect) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > highStreak) {
        setHighStreak(newStreak);
        localStorage.setItem("olympus_high_streak", newStreak.toString());
      }
      setScore((prev) => prev + 25); // +25 Gold Drachmas for correct answer!
      setQuizAnswersHistory((prev) => [...prev, true]);

      // Check achievements
      checkAndUnlockAchievement("5_correct", score / 25 + 1);
      checkAndUnlockAchievement("8_streak", newStreak);
    } else {
      setStreak(0);
      setQuizAnswersHistory((prev) => [...prev, false]);
    }

    // Flip card after brief delay to show translations
    setTimeout(() => {
      setIsCardFlipped(true);
    }, 450);
  };

  const nextQuizQuestion = () => {
    if (quizWordIndex + 1 < filteredVocabulary.length) {
      const nextIdx = quizWordIndex + 1;
      setQuizWordIndex(nextIdx);
      setQuizSelectedAnswer(null);
      setIsCardFlipped(false);
      generateQuizChoices(nextIdx);
    } else {
      // End of category quiz, check if perfect round (100% correctness of all 10 words)
      const allPerfect = quizAnswersHistory.length >= 10 && quizAnswersHistory.every((ans) => ans === true);
      if (allPerfect) {
        checkAndUnlockAchievement("100_percent", "perfect_category");
      }
      setGameMode("menu");
    }
  };

  // --- Mosaic (Word Match) Logic ---
  const startMosaicMode = () => {
    setMosaicMistakes(0);
    setMosaicCompleted(false);
    setSelectedMosaicId(null);

    // Pick 6 random words from the current category to make 12 cards
    const shuffledVocab = [...filteredVocabulary].sort(() => 0.5 - Math.random()).slice(0, 6);
    const armCards: MosaicCard[] = shuffledVocab.map((w) => ({
      id: `arm-${w.id}`,
      text: w.armenian,
      type: "armenian",
      wordId: w.id,
      status: "idle"
    }));
    const espCards: MosaicCard[] = shuffledVocab.map((w) => ({
      id: `esp-${w.id}`,
      text: w.spanish,
      type: "spanish",
      wordId: w.id,
      status: "idle"
    }));

    // shuffle them together
    const combinedCards = [...armCards, ...espCards].sort(() => 0.5 - Math.random());
    setMosaicCards(combinedCards);
    setGameMode("mosaic");
  };

  const handleMosaicCardClick = (clicked: MosaicCard) => {
    if (clicked.status === "matched" || clicked.status === "error") return;

    if (selectedMosaicId === null) {
      // First card selection
      setSelectedMosaicId(clicked.id);
      setMosaicCards((prev) =>
        prev.map((c) => (c.id === clicked.id ? { ...c, status: "selected" } : c))
      );
      if (clicked.type === "spanish") {
        const foundWord = VOCABULARY.find((v) => v.id === clicked.wordId);
        if (foundWord) speakSpanish(foundWord.spanish);
      }
    } else {
      // Second card selection
      const firstCard = mosaicCards.find((c) => c.id === selectedMosaicId);
      if (!firstCard) return;

      if (firstCard.id === clicked.id) {
        // Clicked same card - toggle off
        setSelectedMosaicId(null);
        setMosaicCards((prev) =>
          prev.map((c) => (c.id === clicked.id ? { ...c, status: "idle" } : c))
        );
        return;
      }

      // Check if correct match (same wordId, different types)
      const isMatch = firstCard.wordId === clicked.wordId && firstCard.type !== clicked.type;

      if (isMatch) {
        // Correct pair!
        setMosaicCards((prev) =>
          prev.map((c) =>
            c.wordId === clicked.wordId ? { ...c, status: "matched" } : c
          )
        );
        setSelectedMosaicId(null);
        setScore((prev) => prev + 50); // +50 Drachmas for match!

        // Pronounce Spanish word if we just matched it
        const targetWord = VOCABULARY.find((v) => v.id === clicked.wordId);
        if (targetWord) speakSpanish(targetWord.spanish);

        // Check if all matched
        setTimeout(() => {
          setMosaicCards((current) => {
            const allDone = current.every((c) => c.status === "matched");
            if (allDone) {
              setMosaicCompleted(true);
              checkAndUnlockAchievement("mosaic_complete", "yes");
            }
            return current;
          });
        }, 300);
      } else {
        // Mismatch! Show error status briefly, then reset to idle
        setMosaicMistakes((prev) => prev + 1);
        setMosaicCards((prev) =>
          prev.map((c) =>
            c.id === firstCard.id || c.id === clicked.id ? { ...c, status: "error" } : c
          )
        );
        setSelectedMosaicId(null);

        setTimeout(() => {
          setMosaicCards((prev) =>
            prev.map((c) => (c.status === "error" ? { ...c, status: "idle" } : c))
          );
        }, 1000);
      }
    }
  };

  // --- Speed Run (Olympus Call) Logic ---
  const startSpeedRunMode = () => {
    setSpeedScore(0);
    setSpeedTimer(30);
    setSpeedActive(true);
    setGameMode("speedrun");
    setupNextSpeedQuestion();

    // Setup timer count down
    if (speedIntervalRef.current) clearInterval(speedIntervalRef.current);
    speedIntervalRef.current = setInterval(() => {
      setSpeedTimer((prev) => {
        if (prev <= 1) {
          clearInterval(speedIntervalRef.current!);
          setSpeedActive(false);
          // Check high score and achievements
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Terminate speed interval on unmount
  useEffect(() => {
    return () => {
      if (speedIntervalRef.current) clearInterval(speedIntervalRef.current);
    };
  }, []);

  // When timer runs out, update high scores
  useEffect(() => {
    if (gameMode === "speedrun" && speedTimer === 0 && !speedActive) {
      if (speedScore > speedHighScore) {
        setSpeedHighScore(speedScore);
        localStorage.setItem("olympus_speed_highscore", speedScore.toString());
      }
      checkAndUnlockAchievement("12_speed", speedScore);
    }
  }, [speedTimer, speedActive, gameMode, speedScore, speedHighScore]);

  const setupNextSpeedQuestion = () => {
    // Pick random word from ANY category for variety
    const randomWord = VOCABULARY[Math.floor(Math.random() * VOCABULARY.length)];
    setSpeedWord(randomWord);

    // Pick 3 random spanish choices plus correct one
    const choices = [randomWord.spanish];
    const pool = VOCABULARY.filter((v) => v.spanish !== randomWord.spanish);
    const shuffledPool = pool.sort(() => 0.5 - Math.random());

    for (let i = 0; i < 3; i++) {
      choices.push(shuffledPool[i].spanish);
    }

    setSpeedChoices(choices.sort(() => 0.5 - Math.random()));
  };

  const handleSpeedAnswer = (chosen: string) => {
    if (!speedWord || !speedActive) return;

    const isCorrect = chosen === speedWord.spanish;
    speakSpanish(speedWord.spanish);

    if (isCorrect) {
      setSpeedScore((prev) => prev + 1);
      setScore((prev) => prev + 15);
      // Give time bonus! (+2 seconds)
      setSpeedTimer((prev) => Math.min(prev + 2, 45));
    } else {
      // Time penalty! (-2 seconds)
      setSpeedTimer((prev) => Math.max(prev - 2, 0));
    }

    setupNextSpeedQuestion();
  };

  // Reset progress helper
  const resetGameData = () => {
    if (confirm("Ցանկանու՞մ եք զրոյացնել ձեր ամբողջ առաջընթացը (միավորներ, բեյջեր, վիճակագրություն):")) {
      localStorage.clear();
      setScore(0);
      setStreak(0);
      setHighStreak(0);
      setUnlockedAchievements([]);
      setVocabularyStats({});
      setSpeedHighScore(0);
      setGameMode("menu");
    }
  };

  // Helper icons mapper
  const getDeityIcon = (name: string, className: string = "w-6 h-6") => {
    switch (name) {
      case "MessageSquare":
        return <MessageSquare className={className} />;
      case "Utensils":
        return <Utensils className={className} />;
      case "Compass":
        return <Compass className={className} />;
      case "BookOpen":
        return <BookOpen className={className} />;
      case "Heart":
        return <Heart className={className} />;
      default:
        return <BookOpen className={className} />;
    }
  };

  // Pre-generate 15 static leaves styling to keep client consistent in SSR/Hydration
  const leavesArray = useMemo(() => {
    return Array.from({ length: 15 }).map((_, i) => ({
      left: `${(i * 7) % 100}%`,
      delay: `${(i * 1.7) % 10}s`,
      duration: `${10 + (i % 6)}s`,
      size: `${12 + (i % 3) * 6}px`,
      opacity: 0.15 + (i % 4) * 0.08
    }));
  }, []);

  return (
    <div className="min-h-screen text-white font-sans relative overflow-hidden select-none flex flex-col pb-8" style={{ background: "radial-gradient(circle at center, #005EB8 0%, #003366 100%)" }}>
      
      {/* --- Greek Pattern Background Overlay --- */}
      <div className="absolute inset-0 greek-pattern-bg opacity-15 pointer-events-none z-0" />
      
      {/* Corner Decor */}
      <div className="absolute top-0 left-0 w-32 h-32 border-t-4 border-l-4 border-yellow-500/40 rounded-tl-3xl pointer-events-none z-10" />
      <div className="absolute top-0 right-0 w-32 h-32 border-t-4 border-r-4 border-yellow-500/40 rounded-tr-3xl pointer-events-none z-10" />
      <div className="absolute bottom-0 left-0 w-32 h-32 border-b-4 border-l-4 border-yellow-500/40 rounded-bl-3xl pointer-events-none z-10" />
      <div className="absolute bottom-0 right-0 w-32 h-32 border-b-4 border-r-4 border-yellow-500/40 rounded-br-3xl pointer-events-none z-10" />

      {/* --- Pseudo-3D Parallax & Sky --- */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/10 via-transparent to-transparent pointer-events-none" />
      
      {/* Drifting Clouds */}
      <div className="absolute top-16 left-0 w-full h-24 overflow-hidden pointer-events-none opacity-30 z-0">
        <div className="absolute bg-radial from-slate-100/20 to-transparent w-80 h-16 rounded-full blur-xl cloud-animate-slow -top-2" />
        <div className="absolute bg-radial from-slate-200/10 to-transparent w-96 h-20 rounded-full blur-2xl cloud-animate-medium top-8" />
      </div>

      {/* Falling Olive Leaves (Greek style) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {leavesArray.map((leaf, index) => (
          <div
            key={index}
            className="absolute leaf-fall text-yellow-300/30 font-serif"
            style={{
              left: leaf.left,
              animationDelay: leaf.delay,
              animationDuration: leaf.duration,
              fontSize: leaf.size,
              opacity: leaf.opacity
            }}
          >
            🍃
          </div>
        ))}
      </div>

      {/* --- Greek Side Pillars (3D effects) --- */}
      <GreekColumn side="left" />
      <GreekColumn side="right" />

      {/* --- Unlocked Achievement Popup notification --- */}
      <AnimatePresence>
        {achievementNotification && (
          <motion.div
            initial={{ opacity: 0, y: -80, scale: 0.9 }}
            animate={{ opacity: 1, y: 16, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 p-0.5 rounded-xl shadow-[0_0_25px_rgba(245,158,11,0.5)] border border-yellow-200 w-11/12 max-w-md"
          >
            <div className="bg-slate-900 text-white p-4 rounded-xl flex items-center space-x-4">
              <div className="bg-gradient-to-br from-amber-400 to-yellow-600 p-2.5 rounded-full shadow-inner animate-bounce">
                <Trophy className="w-6 h-6 text-slate-950" />
              </div>
              <div>
                <p className="text-xs font-serif font-semibold tracking-wider text-amber-400 uppercase">
                  Փառահեղ Պարգև!
                </p>
                <h4 className="font-serif font-black text-lg text-yellow-200">
                  {achievementNotification}
                </h4>
                <p className="text-xs text-slate-300">
                  Դուք բացեցիք նոր պատվավոր բեյջ և ստացաք +150 դրախմա:
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- Main Navigation Header --- */}
      <header className="relative z-20 w-full max-w-5xl mx-auto px-8 py-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Logo / Left */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setGameMode("menu")}>
          <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(234,179,8,0.5)]">
            <span className="text-white font-bold text-xl">Ω</span>
          </div>
          <div>
            <h1 className="font-serif font-black tracking-wider text-xl bg-gradient-to-r from-amber-300 via-yellow-100 to-amber-400 bg-clip-text text-transparent">
              ՀՈՒՆԱԿԱՆ ՈԴԻՍԱԿԱՆ
            </h1>
            <p className="text-[10px] uppercase font-mono tracking-widest text-white/70">
              Ինտերակտիվ Ուսուցման Դպրոց
            </p>
          </div>
        </div>

        {/* HUD Score, Streak & Settings / Right */}
        <div className="flex items-center space-x-4">
          {/* Gold Drachmas Score */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-1.5 flex items-center space-x-2 shadow-lg">
            <div className="w-6 h-6 bg-gradient-to-b from-yellow-300 to-amber-500 rounded-full flex items-center justify-center font-serif text-slate-950 font-black text-xs border border-amber-200 animate-pulse">
              ₯
            </div>
            <div className="text-right">
              <span className="text-[9px] block text-white/70 leading-none uppercase font-semibold">Դրախմաներ</span>
              <span className="font-mono text-yellow-300 font-bold leading-none text-sm">{score} XP</span>
            </div>
          </div>

          {/* Correct Streak */}
          {streak > 0 && (
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-3 py-1.5 flex items-center space-x-1.5 shadow-lg"
            >
              <Zap className="w-4 h-4 text-orange-400 fill-orange-400 animate-bounce" />
              <span className="font-mono text-xs text-orange-300 font-bold">{streak} 🔥</span>
            </motion.div>
          )}

          {/* Sound toggle */}
          <button
            onClick={() => setIsSoundOn(!isSoundOn)}
            className="p-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-yellow-400 hover:bg-white/20 transition shadow-md"
            title="Ձայն"
            id="sound-toggle-btn"
          >
            {isSoundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-300" />}
          </button>
        </div>
      </header>

      {/* Ancient Temple Pediment Header Accent */}
      <GreekPediment />

      {/* --- Main Contents Container --- */}
      <main className="relative z-20 flex-grow w-full max-w-4xl mx-auto px-4">
        
        {/* GAME MENU MODE */}
        {gameMode === "menu" && (
          <div className="space-y-8">
            
            {/* Immersive Welcome Card */}
            <section className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-yellow-400/10 to-transparent pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />
              
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl flex-shrink-0 relative">
                  <div className="absolute inset-0 bg-yellow-400/5 rounded-xl blur-md" />
                  {/* Decorative classical pot illustration */}
                  <div className="w-24 h-24 border-2 border-yellow-500/30 rounded-full flex flex-col items-center justify-center p-1 font-serif text-yellow-400 shadow-inner">
                    <span className="text-3xl leading-none animate-pulse">🏺</span>
                    <span className="text-[9px] tracking-widest font-bold text-center mt-1 text-yellow-300">ԱՄՓՈՐԱ</span>
                  </div>
                </div>

                <div className="flex-grow space-y-2 text-center md:text-left">
                  <span className="bg-yellow-500/20 text-yellow-300 text-[10px] font-bold px-2.5 py-1 rounded-full border border-yellow-400/30 uppercase tracking-widest inline-block">
                    Բարի գալուստ Օլիմպոս
                  </span>
                  <h2 className="text-2xl font-serif font-black tracking-wide text-white">
                    Իսպաներենի Մեծ Ոդիսական
                  </h2>
                  <p className="text-sm text-white/90 leading-relaxed max-w-xl">
                    Սովորեք իսպաներեն բառեր և օգտակար արտահայտություններ հայերենից՝ անցնելով հին հունական դիցաբանության ճանապարհով: Յուրաքանչյուր կատեգորիա ներկայացնում է առանձին թեմա:
                  </p>
                </div>
              </div>

              {/* Game Mode Selection Panels (3D grid) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                {/* Mode 1: Quiz */}
                <button
                  onClick={startQuizMode}
                  className="group bg-white/5 hover:bg-white/20 backdrop-blur-xl border border-white/20 p-5 rounded-xl text-left transition duration-300 hover:-translate-y-1 shadow-lg hover:shadow-[0_10px_20px_rgba(234,179,8,0.15)] relative flex flex-col justify-between"
                  id="quiz-mode-btn"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2.5 rounded-lg bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                      <Layers className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </div>
                    <span className="text-[10px] font-mono text-yellow-400/70 uppercase tracking-widest">3D Քարտեր</span>
                  </div>
                  <div>
                    <h3 className="font-serif font-black text-lg text-white mb-1 group-hover:text-yellow-300 transition-colors">
                      Մեծ Փորձություն
                    </h3>
                    <p className="text-xs text-white/70 leading-relaxed">
                      Ընտրեք ճիշտ թարգմանությունը 3D պտտվող մարմարյա քարտերի վրա և լսեք արտասանությունը:
                    </p>
                  </div>
                  <div className="flex items-center text-xs text-yellow-400 font-bold mt-4">
                    <span>Սկսել խաղը</span>
                    <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>

                {/* Mode 2: Word Match */}
                <button
                  onClick={startMosaicMode}
                  className="group bg-white/5 hover:bg-white/20 backdrop-blur-xl border border-white/20 p-5 rounded-xl text-left transition duration-300 hover:-translate-y-1 shadow-lg hover:shadow-[0_10px_20px_rgba(16,185,129,0.15)] relative flex flex-col justify-between"
                  id="mosaic-mode-btn"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <Trophy className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400/70 uppercase tracking-widest">Խճանկար</span>
                  </div>
                  <div>
                    <h3 className="font-serif font-black text-lg text-white mb-1 group-hover:text-emerald-300 transition-colors">
                      Տաճարի Խճանկար
                    </h3>
                    <p className="text-xs text-white/70 leading-relaxed">
                      Գտեք և միացրեք հայերեն բառերը իրենց համապատասխան իսպաներեն թարգմանություններին:
                    </p>
                  </div>
                  <div className="flex items-center text-xs text-emerald-400 font-bold mt-4">
                    <span>Սկսել խաղը</span>
                    <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>

                {/* Mode 3: Time Attack */}
                <button
                  onClick={startSpeedRunMode}
                  className="group bg-white/5 hover:bg-white/20 backdrop-blur-xl border border-white/20 p-5 rounded-xl text-left transition duration-300 hover:-translate-y-1 shadow-lg hover:shadow-[0_10px_20px_rgba(239,68,68,0.15)] relative flex flex-col justify-between"
                  id="speedrun-mode-btn"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
                      <Zap className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </div>
                    <span className="text-[10px] font-mono text-red-400/70 uppercase tracking-widest">Արագընթաց</span>
                  </div>
                  <div>
                    <h3 className="font-serif font-black text-lg text-white mb-1 group-hover:text-red-300 transition-colors">
                      Օլիմպոսի Կանչ
                    </h3>
                    <p className="text-xs text-white/70 leading-relaxed">
                      Կայծակնային թարգմանությունների փուլ՝ ավազի ժամացույցի դեմ: Լրացուցիչ ժամանակ ճիշտ պատասխանի համար:
                    </p>
                  </div>
                  <div className="flex items-center text-xs text-red-400 font-bold mt-4">
                    <span>Սկսել խաղը</span>
                    <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              </div>
            </section>

            {/* Category / Deity Selector Carousel */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <h3 className="font-serif font-black tracking-wider text-lg text-white uppercase">
                    Ընտրել Ուսումնական Թեման
                  </h3>
                </div>
                <span className="text-xs font-mono text-slate-400 uppercase">
                  5 Թեմա • 50 Բառեր
                </span>
              </div>

              {/* Horizontal Temple Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                {CATEGORIES.map((cat) => {
                  const isActive = selectedCategory === cat.id;
                  const statsCount = VOCABULARY.filter((v) => v.category === cat.id).length;
                  
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`group relative text-left p-4 rounded-xl transition duration-300 border overflow-hidden flex flex-col justify-between ${
                        isActive
                          ? "bg-yellow-500/80 border-yellow-300 shadow-[0_0_20px_rgba(234,179,8,0.4)] text-white"
                          : "bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/15 text-white"
                      }`}
                    >
                      {/* Temple columns stylized background */}
                      <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20" />
                      
                      <div className="space-y-3">
                        {/* Deity icon */}
                        <div className={`p-2 w-fit rounded-lg ${
                          isActive 
                            ? "bg-white text-yellow-600 shadow-sm" 
                            : "bg-white/10 text-white group-hover:text-yellow-300"
                        }`}>
                          {getDeityIcon(cat.iconName, "w-5 h-5")}
                        </div>

                        <div>
                          <h4 className="font-serif font-bold text-sm text-white group-hover:text-yellow-100 transition-colors">
                            {cat.nameArm}
                          </h4>
                          <p className={`text-[9px] font-mono tracking-wider ${isActive ? "text-slate-900/80" : "text-yellow-300/80"}`}>
                            {cat.deity}
                          </p>
                        </div>
                      </div>

                      <div className={`mt-4 pt-2 border-t flex items-center justify-between text-[10px] ${isActive ? "border-yellow-400 text-white" : "border-white/10 text-white/60"}`}>
                        <span>{statsCount} բառ</span>
                        {isActive && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Selected Deity Banner */}
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-lg">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs uppercase font-serif font-black text-yellow-300">
                      Հովանավոր՝
                    </span>
                    <span className="text-sm font-semibold text-white">
                      {currentCategoryMeta.deity}
                    </span>
                  </div>
                  <p className="text-xs text-white/90">
                    {currentCategoryMeta.descriptionArm}
                  </p>
                </div>
                <div className="bg-yellow-500/20 px-3 py-1.5 rounded-lg border border-yellow-400/30 text-center flex-shrink-0">
                  <span className="text-[10px] block text-white/70 uppercase font-bold">Կարգավիճակ</span>
                  <span className="font-serif text-yellow-300 font-bold text-xs">Բացված է 🔓</span>
                </div>
              </div>
            </div>

            {/* Treasury of Olympus (Achievements Panel) */}
            <section className="bg-white/5 backdrop-blur-md border border-white/15 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
                <div className="flex items-center space-x-2">
                  <Award className="w-5 h-5 text-yellow-300" />
                  <h3 className="font-serif font-black text-lg text-white">
                    ՕԼԻՄՊՈՍԻ ԳԱՆՁԱՐԱՆ (ԲԵՅՋԵՐ)
                  </h3>
                </div>
                <span className="bg-white/10 text-yellow-300 font-mono text-xs px-2.5 py-1 rounded-full border border-white/10">
                  Բացված է՝ {unlockedAchievements.length} / 6
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {achievementsList.map((badge) => (
                  <div
                    key={badge.id}
                    className={`p-4 rounded-xl border flex items-start space-x-3 transition duration-300 ${
                      badge.unlocked
                        ? "bg-white/10 border-white/20 shadow-[0_0_15px_rgba(234,179,8,0.15)]"
                        : "bg-white/5 border-white/10 opacity-60 grayscale"
                    }`}
                  >
                    {/* Badge Icon Indicator */}
                    <div className={`p-2.5 rounded-full flex-shrink-0 ${
                      badge.unlocked
                        ? "bg-gradient-to-br from-yellow-400 via-amber-300 to-yellow-500 text-slate-950 shadow-md"
                        : "bg-white/10 text-slate-300"
                    }`}>
                      {badge.iconType === "sandals" && <span className="text-xl">👡</span>}
                      {badge.iconType === "lyre" && <span className="text-xl">🪕</span>}
                      {badge.iconType === "owl" && <span className="text-xl">🦉</span>}
                      {badge.iconType === "thunderbolt" && <span className="text-xl">⚡</span>}
                      {badge.iconType === "temple" && <span className="text-xl">🏛️</span>}
                      {badge.iconType === "apple" && <span className="text-xl">🍎</span>}
                    </div>

                    <div className="space-y-1">
                      <h4 className={`font-serif font-bold text-xs ${badge.unlocked ? "text-yellow-300" : "text-white/50"}`}>
                        {badge.titleArm}
                      </h4>
                      <p className="text-[10px] text-white/80 leading-tight">
                        {badge.descriptionArm}
                      </p>
                      <div className="pt-1">
                        <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-sm ${
                          badge.unlocked 
                            ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30" 
                            : "bg-white/5 text-white/40"
                        }`}>
                          {badge.unlocked ? "ԲԱՑՎԱԾ Է" : "ՓԱԿ Է"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Quick stats & Settings actions */}
            <div className="flex flex-col sm:flex-row justify-between items-center bg-slate-950 border border-slate-900 p-4 rounded-xl gap-4">
              <div className="flex items-center space-x-2 text-xs text-slate-400">
                <Info className="w-4 h-4 text-slate-500" />
                <span>Ձեր տվյալները պահպանվում են ավտոմատ կերպով բրաուզերում:</span>
              </div>
              <button
                onClick={resetGameData}
                className="text-xs text-red-400 hover:text-red-300 font-bold flex items-center space-x-1 border border-red-500/20 hover:border-red-500/40 px-3 py-1.5 rounded-lg bg-red-950/10 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Զրոյացնել Առաջընթացը</span>
              </button>
            </div>

          </div>
        )}

        {/* QUIZ (DIVINE TRIAL) MODE */}
        {gameMode === "quiz" && filteredVocabulary.length > 0 && (
          <div className="space-y-6">
            
            {/* Header / Top indicators */}
            <div className="flex items-center justify-between bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
              <button
                onClick={() => setGameMode("menu")}
                className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center space-x-1"
                id="quit-quiz-btn"
              >
                <span className="text-sm">←</span>
                <span>Վերադառնալ Մենյու</span>
              </button>

              <div className="text-center">
                <span className="text-[10px] block text-slate-400 uppercase font-bold">Կատեգորիա</span>
                <span className="font-serif text-sm font-semibold text-amber-400">
                  {currentCategoryMeta.nameArm}
                </span>
              </div>

              <div className="font-mono text-xs bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg text-slate-300">
                Հարց՝ <strong className="text-white">{quizWordIndex + 1}</strong> / {filteredVocabulary.length}
              </div>
            </div>

            {/* Word item card container */}
            <div className="w-full max-w-lg mx-auto py-4">
              
              {/* 3D Flip Card Container with Perspective */}
              <div className="perspective-1000 w-full h-64 sm:h-72 cursor-pointer relative" onClick={() => setIsCardFlipped(!isCardFlipped)}>
                <motion.div
                  className="w-full h-full duration-700 transform-style-3d relative"
                  animate={{ rotateY: isCardFlipped ? 180 : 0 }}
                >
                  
                  {/* CARD FRONT: Armenian Word */}
                  <div className="absolute inset-0 backface-hidden w-full h-full bg-white/10 backdrop-blur-2xl border border-white/30 rounded-3xl shadow-2xl p-6 flex flex-col justify-between items-center text-center">
                    
                    {/* Golden Inner Border */}
                    <div className="absolute inset-3 border-2 border-yellow-500/20 rounded-2xl pointer-events-none z-0" />
                    
                    {/* Golden Meander Decorative Accent */}
                    <div className="w-full flex items-center justify-between border-b border-white/10 pb-2 text-[10px] text-yellow-300 uppercase tracking-widest font-serif z-10">
                      <span>🏛️ Օլիմպոսի Քարտ</span>
                      <span>Մակերես</span>
                    </div>

                    <div className="space-y-3 my-auto z-10">
                      <span className="text-[10px] uppercase font-bold text-white/60 tracking-widest block">
                        Թարգմանեք բառը՝
                      </span>
                      <h3 className="text-3xl sm:text-4xl font-serif font-black tracking-wide text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
                        {filteredVocabulary[quizWordIndex].armenian}
                      </h3>
                      <p className="text-xs text-yellow-300/80 italic font-medium">
                        (Սեղմեք քարտը թարգմանությունը տեսնելու համար)
                      </p>
                    </div>

                    <div className="w-full pt-2 border-t border-white/10 text-[10px] text-white/60 flex justify-between items-center z-10">
                      <span>Կարգավիճակ՝ Հայերեն</span>
                      <span className="flex items-center text-yellow-300 font-semibold">
                        <span>Շրջել 3D</span>
                        <RotateCcw className="w-3 h-3 ml-1" />
                      </span>
                    </div>
                  </div>

                  {/* CARD BACK: Spanish Translation & Examples */}
                  <div className="absolute inset-0 backface-hidden w-full h-full bg-white/15 backdrop-blur-2xl border border-white/30 rounded-3xl shadow-2xl p-6 flex flex-col justify-between items-center text-center [transform:rotateY(180deg)]">
                    
                    {/* Golden Inner Border */}
                    <div className="absolute inset-3 border-2 border-yellow-500/20 rounded-2xl pointer-events-none z-0" />
                    
                    <div className="w-full flex items-center justify-between border-b border-white/10 pb-2 text-[10px] text-yellow-300 uppercase tracking-widest font-serif z-10">
                      <span>🏛️ Իսպաներեն Թարգմանություն</span>
                      <span>Դարձերես</span>
                    </div>

                    <div className="space-y-4 my-auto w-full z-10">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-white/60 tracking-widest block mb-1">
                          Իսպաներեն՝
                        </span>
                        <h3 className="text-3xl sm:text-4xl font-serif font-black text-yellow-300 drop-shadow-[0_2px_10px_rgba(0,0,0,0.3)] inline-block">
                          {filteredVocabulary[quizWordIndex].spanish}
                        </h3>
                        
                        {/* Audio Speak button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // prevent card flip
                            speakSpanish(filteredVocabulary[quizWordIndex].spanish);
                          }}
                          className="ml-3 p-1.5 bg-yellow-500/20 hover:bg-yellow-500/35 border border-yellow-400/30 rounded-full text-yellow-300 transition"
                          title="Արտասանել"
                          id="speak-word-btn"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Armenian phonetic pronunciation */}
                      <div className="bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-lg border border-white/20 inline-block">
                        <span className="text-[10px] text-white/70 mr-2 uppercase tracking-wider">Արտասանություն՝</span>
                        <span className="font-semibold text-xs text-yellow-300 font-sans">
                          {filteredVocabulary[quizWordIndex].pronunciation}
                        </span>
                      </div>

                      {/* Contextual Examples */}
                      <div className="space-y-1 text-left bg-white/5 backdrop-blur-md p-3 rounded-lg border border-white/10 text-xs w-full">
                        <p className="text-white/80">
                          <strong className="text-white/50">Հայ՝</strong> {filteredVocabulary[quizWordIndex].exampleArm}
                        </p>
                        <p className="text-yellow-200 font-medium">
                          <strong className="text-yellow-400/60">Esp:</strong> {filteredVocabulary[quizWordIndex].exampleEsp}
                        </p>
                      </div>
                    </div>

                    <div className="w-full pt-2 border-t border-white/10 text-[10px] text-white/60 flex justify-between items-center z-10">
                      <span>Կարգավիճակ՝ Իսպաներեն</span>
                      <span className="flex items-center text-yellow-300 font-semibold">
                        <span>Շրջել 3D</span>
                        <RotateCcw className="w-3 h-3 ml-1" />
                      </span>
                    </div>

                  </div>
                </motion.div>
              </div>

            </div>

            {/* Answer Options Section */}
            <div className="space-y-4">
              
              {/* Informative Guidance Banner */}
              <div className="text-center text-xs text-white/80 font-medium">
                {quizSelectedAnswer === null ? (
                  <span>Ընտրեք ճիշտ տարբերակը ստորև՝</span>
                ) : (
                  <span className="text-yellow-300 font-semibold flex items-center justify-center">
                    <Sparkles className="w-4 h-4 mr-1 animate-spin" />
                    Սեղմեք քարտը՝ արտասանությունը լսելու և օրինակները տեսնելու համար:
                  </span>
                )}
              </div>

              {/* 4 Choices Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
                {quizChoices.map((choice) => {
                  const isSelected = quizSelectedAnswer === choice;
                  const isCorrectAnswer = choice === filteredVocabulary[quizWordIndex].spanish;
                  const hasAnswered = quizSelectedAnswer !== null;

                  let btnStyle = "bg-white/5 hover:bg-white/20 backdrop-blur-xl border border-white/20 hover:border-yellow-400/50 text-white shadow-lg";
                  
                  if (hasAnswered) {
                    if (isCorrectAnswer) {
                      // Correct selection highlight
                      btnStyle = "bg-emerald-500/85 hover:bg-emerald-500 backdrop-blur-xl border-emerald-300 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]";
                    } else if (isSelected) {
                      // Selected wrong answer highlight
                      btnStyle = "bg-red-500/85 hover:bg-red-500 backdrop-blur-xl border-red-300 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)]";
                    } else {
                      // Non-selected answers when answered
                      btnStyle = "bg-white/5 border-white/5 text-white/40 cursor-not-allowed opacity-40";
                    }
                  }

                  return (
                    <button
                      key={choice}
                      disabled={hasAnswered}
                      onClick={() => handleQuizAnswer(choice)}
                      className={`p-4 rounded-xl text-left border font-serif font-bold text-base transition duration-200 flex items-center justify-between ${btnStyle}`}
                      id={`quiz-choice-${choice}`}
                    >
                      <span>{choice}</span>
                      
                      {hasAnswered && isCorrectAnswer && (
                        <Check className="w-5 h-5 text-white flex-shrink-0 ml-2" />
                      )}
                      {hasAnswered && isSelected && !isCorrectAnswer && (
                        <X className="w-5 h-5 text-white flex-shrink-0 ml-2" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Next Question Navigation Action */}
              {quizSelectedAnswer !== null && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-center pt-4"
                >
                  <button
                    onClick={nextQuizQuestion}
                    className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-serif font-black px-8 py-3 rounded-xl shadow-[0_5px_15px_rgba(245,158,11,0.3)] transition transform hover:-translate-y-0.5 flex items-center space-x-2"
                    id="next-quiz-btn"
                  >
                    <span>
                      {quizWordIndex + 1 < filteredVocabulary.length ? "Հաջորդ Բառը" : "Ավարտել Փուլը"}
                    </span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </motion.div>
              )}

            </div>

          </div>
        )}

        {/* TEMPLE MOSAIC (WORD MATCH) MODE */}
        {gameMode === "mosaic" && (
          <div className="space-y-6">
            
            {/* Header / Score bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl gap-4 shadow-lg">
              <button
                onClick={() => setGameMode("menu")}
                className="text-xs text-yellow-300 hover:text-yellow-100 font-bold flex items-center space-x-1"
                id="quit-mosaic-btn"
              >
                <span>←</span>
                <span>Վերադառնալ Մենյու</span>
              </button>

              <div className="text-center">
                <h3 className="font-serif font-black text-base text-white tracking-wider">
                  ՏԱՃԱՐԻ ԽՃԱՆԿԱՐ
                </h3>
                <p className="text-[10px] text-white/70">
                  Միացրեք հայերեն բառը իր իսպաներեն թարգմանության հետ:
                </p>
              </div>

              <div className="flex items-center space-x-4">
                <span className="font-mono text-xs text-white/80 bg-white/10 px-3 py-1.5 rounded-lg border border-white/15">
                  Սխալներ՝ <strong className="text-red-400">{mosaicMistakes}</strong>
                </span>
                <button
                  onClick={startMosaicMode}
                  className="p-1.5 bg-white/10 border border-white/15 rounded-lg text-yellow-300 hover:text-yellow-100 transition"
                  title="Վերսկսել"
                  id="reset-mosaic-btn"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Grid of 12 stones */}
            {!mosaicCompleted ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto py-4">
                {mosaicCards.map((card) => {
                  let statusStyle = "bg-white/5 border-white/10 text-white hover:bg-white/15 hover:border-white/20";
                  let isClickable = true;

                  if (card.status === "selected") {
                    statusStyle = "bg-yellow-500/80 border-yellow-300 text-white shadow-[0_0_20px_rgba(234,179,8,0.4)] scale-[0.98]";
                  } else if (card.status === "matched") {
                    statusStyle = "bg-emerald-500/20 border-emerald-500/30 text-emerald-300/40 cursor-not-allowed line-through opacity-40";
                    isClickable = false;
                  } else if (card.status === "error") {
                    statusStyle = "bg-red-500/80 border-red-300 text-white animate-shake";
                  }

                  return (
                    <motion.button
                      key={card.id}
                      disabled={!isClickable}
                      onClick={() => handleMosaicCardClick(card)}
                      className={`h-24 p-3 rounded-xl border text-center flex flex-col justify-center items-center transition duration-200 ${statusStyle} relative`}
                      whileTap={{ scale: isClickable ? 0.95 : 1 }}
                      id={`mosaic-tile-${card.id}`}
                    >
                      {/* Decorative tile texture corner */}
                      <div className="absolute top-1.5 left-1.5 text-[8px] opacity-25">🏛️</div>
                      
                      <span className="text-xs font-serif font-black leading-tight tracking-wide">
                        {card.text}
                      </span>
                      
                      <span className="absolute bottom-1.5 right-2 text-[8px] font-mono opacity-40 tracking-widest uppercase">
                        {card.type === "armenian" ? "arm" : "esp"}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            ) : (
              /* Completed Mosaic screen */
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-2xl max-w-md mx-auto text-center space-y-6 shadow-2xl"
              >
                <div className="w-16 h-16 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <Check className="w-10 h-10" />
                </div>

                <div className="space-y-2">
                  <h3 className="font-serif font-black text-2xl text-emerald-300">
                    ՏԱՃԱՐԸ ԿԱՌՈՒՑՎԱԾ Է
                  </h3>
                  <p className="text-sm text-white/90">
                    Դուք փառահեղորեն միացրեցիք բոլոր բառերը և ստացաք <strong>+300 XP դրախմաներ</strong>:
                  </p>
                </div>

                {/* Score summary */}
                <div className="bg-white/5 backdrop-blur-md p-4 rounded-xl border border-white/10 text-xs text-left space-y-2">
                  <div className="flex justify-between">
                    <span className="text-white/60">Կատարված միացումներ՝</span>
                    <span className="font-bold text-white">6 զույգ</span>
                  </div>
                  <div className="flex justify-between border-t border-white/10 pt-2">
                    <span className="text-white/60">Թույլ տրված սխալներ՝</span>
                    <span className={`font-bold ${mosaicMistakes === 0 ? "text-emerald-300" : "text-white"}`}>
                      {mosaicMistakes} {mosaicMistakes === 0 && " (Անթերի! 🥇)"}
                    </span>
                  </div>
                </div>

                <div className="flex justify-center gap-3">
                  <button
                    onClick={startMosaicMode}
                    className="bg-white/10 hover:bg-white/20 border border-white/15 text-white font-semibold px-5 py-2.5 rounded-xl transition text-sm"
                    id="mosaic-play-again-btn"
                  >
                    Խաղալ Նորից
                  </button>
                  <button
                    onClick={() => setGameMode("menu")}
                    className="bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-serif font-black px-6 py-2.5 rounded-xl transition text-sm"
                    id="mosaic-exit-btn"
                  >
                    Մենյու
                  </button>
                </div>
              </motion.div>
            )}

          </div>
        )}

        {/* SPEED RUN (OLYMPUS CALL) MODE */}
        {gameMode === "speedrun" && (
          <div className="space-y-6">
            
            {/* Top Indicator bar with hourglass timer */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl gap-4 shadow-lg">
              <button
                onClick={() => {
                  if (speedIntervalRef.current) clearInterval(speedIntervalRef.current);
                  setGameMode("menu");
                }}
                className="text-xs text-yellow-300 hover:text-yellow-100 font-bold flex items-center space-x-1"
                id="quit-speedrun-btn"
              >
                <span>←</span>
                <span>Վերադառնալ Մենյու</span>
              </button>

              <div className="text-center">
                <h3 className="font-serif font-black text-base text-white tracking-wider flex items-center justify-center">
                  <Zap className="w-4 h-4 text-yellow-300 mr-1.5" />
                  ՕԼԻՄՊՈՍԻ ԿԱՆՉ
                </h3>
                <p className="text-[10px] text-white/70">
                  Պատասխանեք արագ։ Ճիշտ պատասխանը ավելացնում է +2վ:
                </p>
              </div>

              {/* Hourglass falling simulation */}
              <div className="flex items-center space-x-3 bg-white/10 px-4 py-1.5 rounded-xl border border-white/15">
                <Hourglass className={`w-4 h-4 text-yellow-300 ${speedTimer > 0 && speedActive ? "animate-spin" : ""}`} />
                <span className={`font-mono text-sm font-black ${speedTimer < 10 ? "text-red-400 animate-pulse" : "text-yellow-300"}`}>
                  {speedTimer} վրկ
                </span>
              </div>
            </div>

            {/* Time progress bar */}
            <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden border border-white/10 shadow-inner">
              <motion.div
                className={`h-full ${speedTimer < 10 ? "bg-red-500" : "bg-gradient-to-r from-yellow-400 to-amber-500"}`}
                animate={{ width: `${(speedTimer / 45) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            {/* Core Game Arena */}
            {speedTimer > 0 && speedActive && speedWord ? (
              <div className="space-y-6 max-w-lg mx-auto py-4">
                
                {/* Large Word display stone */}
                <div className="bg-white/10 backdrop-blur-md border border-white/25 p-8 rounded-2xl text-center shadow-lg relative">
                  <span className="absolute top-2 left-2 text-[10px] font-mono text-white/50 uppercase">
                    Արագ Թարգմանություն
                  </span>
                  <div className="text-[10px] uppercase font-bold text-white/60 tracking-widest block mb-1">
                    Ի՞նչ է նշանակում՝
                  </div>
                  <h3 className="text-3xl sm:text-4xl font-serif font-black tracking-wide text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
                    {speedWord.armenian}
                  </h3>
                  
                  {/* Current XP display */}
                  <div className="absolute right-3 bottom-3 text-xs font-mono text-yellow-300 bg-white/10 px-2.5 py-1 rounded-md border border-white/15">
                    Ճիշտ՝ <span className="font-bold text-white">{speedScore}</span>
                  </div>
                </div>

                {/* choices buttons */}
                <div className="grid grid-cols-2 gap-3">
                  {speedChoices.map((choice) => (
                    <button
                      key={choice}
                      onClick={() => handleSpeedAnswer(choice)}
                      className="p-4 bg-white/5 hover:bg-white/15 backdrop-blur-md border border-white/15 hover:border-yellow-400/40 text-center font-serif font-bold text-sm sm:text-base rounded-xl transition duration-150 active:scale-95 text-white shadow-lg"
                      id={`speed-choice-${choice}`}
                    >
                      {choice}
                    </button>
                  ))}
                </div>

              </div>
            ) : (
              /* Time is Out Screen */
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-2xl max-w-md mx-auto text-center space-y-6 shadow-2xl"
              >
                <div className="w-16 h-16 bg-red-500/20 text-red-300 border border-red-500/30 rounded-full flex items-center justify-center mx-auto">
                  <Hourglass className="w-8 h-8" />
                </div>

                <div className="space-y-2">
                  <h3 className="font-serif font-black text-2xl text-red-400">
                    ԺԱՄԱՆԱԿԸ ՍՊԱՌՎԵՑ
                  </h3>
                  <p className="text-sm text-white/90">
                    Ավազը ամբողջությամբ թափվեց ներքև։ Դուք հաջողությամբ կատարեցիք բոլոր թարգմանությունները:
                  </p>
                </div>

                {/* Score Stats */}
                <div className="bg-white/5 backdrop-blur-md p-4 rounded-xl border border-white/10 text-xs text-left space-y-2 font-mono">
                  <div className="flex justify-between">
                    <span className="text-white/60">Վաստակած միավորներ՝</span>
                    <span className="font-bold text-yellow-300">{speedScore}</span>
                  </div>
                  <div className="flex justify-between border-t border-white/10 pt-2">
                    <span className="text-white/60">Անձնական ռեկորդ՝</span>
                    <span className="font-bold text-white">{speedHighScore}</span>
                  </div>
                </div>

                <div className="flex justify-center gap-3">
                  <button
                    onClick={startSpeedRunMode}
                    className="bg-white/10 hover:bg-white/20 border border-white/15 text-white font-semibold px-5 py-2.5 rounded-xl transition text-sm"
                    id="speedrun-play-again-btn"
                  >
                    Փորձել Նորից
                  </button>
                  <button
                    onClick={() => setGameMode("menu")}
                    className="bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-serif font-black px-6 py-2.5 rounded-xl transition text-sm"
                    id="speedrun-exit-btn"
                  >
                    Մենյու
                  </button>
                </div>
              </motion.div>
            )}

          </div>
        )}

      </main>

      {/* --- Footer Signature --- */}
      <footer className="relative z-20 w-full max-w-4xl mx-auto px-4 mt-12 pt-4 border-t border-white/10 text-center text-[10px] text-white/50">
        <p className="uppercase tracking-widest font-serif font-semibold text-yellow-300/80">
          © 2026 ՀՈՒՆԱԿԱՆ ՈԴԻՍԱԿԱՆ • Բոլոր իրավունքները պաշտպանված են
        </p>
        <p className="mt-1 font-sans text-white/40">
          Ինտերակտիվ ուսուցման համակարգ, որը միավորում է հին հունական մշակույթն ու իսպաներենի քերականությունը:
        </p>
      </footer>

    </div>
  );
}

// Sub-component definitions for visual clarity
const GreekColumn = ({ side }: { side: "left" | "right" }) => {
  return (
    <div className={`hidden lg:flex flex-col items-center h-full w-14 xl:w-16 absolute top-0 ${side === "left" ? "left-2" : "right-2"} z-10 pointer-events-none`}>
      {/* Column Capital */}
      <div className="w-full h-4 bg-amber-400/90 border border-amber-500 rounded-t-xs shadow-lg" />
      <div className="w-5/6 h-3 bg-linear-to-b from-gray-200 to-white border-x border-amber-300 shadow-md" />
      <div className="w-11/12 h-2 bg-amber-400 border border-amber-500" />
      
      {/* Column Shaft with flutes */}
      <div 
        className="w-4/5 flex-grow border-x-2 border-amber-400/40 shadow-inner relative"
        style={{
          background: "linear-gradient(90deg, #1e293b 0%, #d1d5db 15%, #ffffff 50%, #e5e7eb 85%, #475569 100%)",
        }}
      >
        {/* Subtle fluting lines overlay */}
        <div className="absolute inset-0 opacity-15 bg-[linear-gradient(90deg,transparent_50%,#000000_50%)] bg-[length:8px_100%]" />
      </div>
      
      {/* Column Base */}
      <div className="w-11/12 h-2 bg-amber-400 border border-amber-500" />
      <div className="w-5/6 h-3 bg-linear-to-b from-white to-gray-300 border-x border-amber-300" />
      <div className="w-full h-5 bg-amber-500 border border-amber-600 rounded-b-xs shadow-xl" />
    </div>
  );
};

const GreekPediment = () => {
  return (
    <div className="relative w-full max-w-4xl mx-auto mt-4 mb-6 px-4">
      {/* Triangular classical top */}
      <div className="w-0 h-0 border-l-[120px] border-l-transparent border-r-[120px] border-r-transparent border-b-[40px] border-b-amber-500 mx-auto relative -mb-[2px] hidden sm:block">
        <div className="absolute top-[16px] left-1/2 -translate-x-1/2 flex items-center justify-center space-x-1">
          <div className="w-5 h-5 rounded-full bg-yellow-300 border border-amber-600 flex items-center justify-center shadow-xs">
            <div className="w-2 h-2 rounded-full bg-amber-600" />
          </div>
        </div>
      </div>
      
      {/* Main beam with meander pattern */}
      <div className="w-full bg-linear-to-b from-amber-400 to-amber-500 border-y-2 border-amber-600 h-10 px-4 flex items-center justify-between shadow-md relative z-10 rounded-sm">
        <div className="w-8 h-full bg-[linear-gradient(45deg,#b45309_25%,transparent_25%),linear-gradient(-45deg,#b45309_25%,transparent_25%)] bg-[length:10px_10px] opacity-40" />
        <span className="font-serif font-black tracking-widest text-slate-950 text-xs sm:text-sm">
          🏛️ ՕԼԻՄՊՈՍԻ ՏԱՃԱՐԻ ԻՄԱՍՏՈՒԹՅՈՒՆ 🏛️
        </span>
        <div className="w-8 h-full bg-[linear-gradient(45deg,#b45309_25%,transparent_25%),linear-gradient(-45deg,#b45309_25%,transparent_25%)] bg-[length:10px_10px] opacity-40" />
      </div>
    </div>
  );
};
