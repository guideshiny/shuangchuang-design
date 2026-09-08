import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Presentation, 
  ArrowLeft, 
  Play, 
  Pause, 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  FileText, 
  Users, 
  TrendingUp, 
  Award, 
  AlertTriangle, 
  CheckCircle2, 
  Eye, 
  Target, 
  Sliders, 
  Flame, 
  Swords, 
  MessageSquare, 
  Compass, 
  ShieldCheck, 
  Maximize2,
  Minimize2,
  Mic,
  Activity,
  Video
} from 'lucide-react';
import { DefenseProject, ModeDef, DefenseSessionConfig, RoadshowSlide, VirtualJudge, RoadshowEvaluation } from './defenseTypes';
import { MOCK_ROADSHOW_SLIDES, MOCK_VIRTUAL_JUDGES } from './defenseConstants';
import DefenseVideoWindow from './DefenseVideoWindow';
import RoadshowDefenseStage, { DefenseQAResult } from './RoadshowDefenseStage';
import RoadshowCombinedReportModal from './RoadshowCombinedReportModal';

interface Props {
  project: DefenseProject;
  mode: ModeDef;
  config: DefenseSessionConfig;
  onFinishRoadshow: (evaluation: RoadshowEvaluation, proceedToQA: boolean) => void;
  onBack: () => void;
}

export default function DefenseRoadshowScreen({
  project,
  mode,
  config,
  onFinishRoadshow,
  onBack
}: Props) {
  // Duration mapping
  const getInitialDuration = () => {
    if (config.roadshowDuration === '3min') return 180;
    if (config.roadshowDuration === '8min') return 480;
    if (config.roadshowDuration === '10min') return 600;
    return 300; // default 5min
  };

  const totalPlannedDuration = getInitialDuration();
  const [timeLeft, setTimeLeft] = useState(totalPlannedDuration);
  const [isRunning, setIsRunning] = useState(true);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [activeRightTab, setActiveRightTab] = useState<'prompter' | 'judges' | 'video'>('prompter');
  const [showVideoWindow, setShowVideoWindow] = useState(true);
  const [videoPlacement, setVideoPlacement] = useState<'pip' | 'sidebar'>('pip');
  const [isLaserPointerActive, setIsLaserPointerActive] = useState(false);
  const [laserPos, setLaserPos] = useState({ x: 0, y: 0 });
  const [isAutoSpeechPlaying, setIsAutoSpeechPlaying] = useState(false);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [slideTimeSpent, setSlideTimeSpent] = useState<number[]>(new Array(MOCK_ROADSHOW_SLIDES.length).fill(0));
  const [judges, setJudges] = useState<VirtualJudge[]>(MOCK_VIRTUAL_JUDGES);
  const [speechPacingStatus, setSpeechPacingStatus] = useState<'slow' | 'optimal' | 'fast'>('optimal');
  const [qaResults, setQaResults] = useState<DefenseQAResult[]>([]);
  const [showCombinedReportModal, setShowCombinedReportModal] = useState(false);

  const pptContainerRef = useRef<HTMLDivElement>(null);
  const currentSlide = MOCK_ROADSHOW_SLIDES[currentSlideIndex] || MOCK_ROADSHOW_SLIDES[0];

  // Master countdown timer & per-slide timer
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // If on roadshow presentation slides, transition directly to P9 Defense
          if (currentSlideIndex < 8) {
            setCurrentSlideIndex(8);
          }
          return 0;
        }
        return prev - 1;
      });

      setSlideTimeSpent(prev => {
        const next = [...prev];
        next[currentSlideIndex] = (next[currentSlideIndex] || 0) + 1;
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, currentSlideIndex]);

  // Update judges' dynamic reactions as slides change
  useEffect(() => {
    setJudges(prev => {
      return prev.map((j, idx) => {
        if (currentSlide.id === 1) {
          if (idx === 0) return { ...j, mood: 'focused', reactionText: '认真审视开篇进口垄断数据与国家战略对标...' };
          if (idx === 1) return { ...j, mood: 'taking_notes', reactionText: '记录项目破冰痛点，等待核心参数公布...' };
        } else if (currentSlide.id === 3) {
          if (idx === 0) return { ...j, mood: 'impressed', reactionText: '对15纳秒曝光瞬态冻结和差分消噪专利大为赞赏！' };
          if (idx === 3) return { ...j, mood: 'focused', reactionText: '关注40毫秒重构算法在嵌入式FPGA的算力消耗...' };
        } else if (currentSlide.id === 5) {
          if (idx === 1) return { ...j, mood: 'impressed', reactionText: '对“硬件+算法年费订阅”的58%毛利模型频频点头！' };
          if (idx === 2) return { ...j, mood: 'taking_notes', reactionText: '评估客户单机4.8个月收回成本的经济可行性...' };
        } else if (currentSlide.id === 6) {
          if (idx === 1) return { ...j, mood: 'impressed', reactionText: '在手3500万订单与宁王180天驻厂中试极具说服力！' };
          if (idx === 3) return { ...j, mood: 'focused', reactionText: '记录零漏报样本数(120万颗)，准备质询极耳变形极限...' };
        } else if (currentSlide.id === 7) {
          if (idx === 2) return { ...j, mood: 'impressed', reactionText: '高度认可学生负责人62%绝对控股与全职创业承诺！' };
          if (idx === 0) return { ...j, mood: 'taking_notes', reactionText: '核对院士团队职务发明独家授权排他性手续...' };
        } else if (currentSlide.id === 8) {
          if (idx === 1) return { ...j, mood: 'impressed', reactionText: '三年破亿营收规划与专精特新路径清晰，估值预期合理。' };
          if (idx === 2) return { ...j, mood: 'impressed', reactionText: '升华到科技报国赤子之心，契合国赛育人宗旨！' };
        }
        return j;
      });
    });

    // Pacing evaluation for current slide
    const planned = currentSlide.plannedSeconds;
    const spent = slideTimeSpent[currentSlideIndex] || 0;
    if (spent < planned * 0.7) {
      setSpeechPacingStatus('slow');
    } else if (spent > planned * 1.25) {
      setSpeechPacingStatus('fast');
    } else {
      setSpeechPacingStatus('optimal');
    }
  }, [currentSlideIndex]);

  // Handle laser pointer tracking
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isLaserPointerActive || !pptContainerRef.current) return;
    const rect = pptContainerRef.current.getBoundingClientRect();
    setLaserPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handlePrevSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(prev => prev - 1);
    }
  };

  const handleNextSlide = () => {
    if (currentSlideIndex < MOCK_ROADSHOW_SLIDES.length - 1) {
      setCurrentSlideIndex(prev => prev + 1);
    } else {
      // Finished all slides / on Slide 9 (Defense) -> Show Combined Report
      setShowCombinedReportModal(true);
    }
  };

  // Format MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Compute evaluation when roadshow finishes
  const generateEvaluation = (): RoadshowEvaluation => {
    const timeSpent = totalPlannedDuration - timeLeft;
    const timeDiff = Math.abs(timeSpent - totalPlannedDuration);
    
    // Scoring logic
    let pacingScore = 95;
    if (timeDiff > 60) pacingScore -= 15;
    else if (timeDiff > 30) pacingScore -= 8;
    else if (timeDiff > 10) pacingScore -= 3;

    const completenessScore = Math.round((currentSlideIndex + 1) / MOCK_ROADSHOW_SLIDES.length * 100);
    const persuasivenessScore = 92;
    const stagePresenceScore = isAutoSpeechPlaying ? 88 : 94;
    const totalScore = Math.round((pacingScore * 0.3) + (completenessScore * 0.3) + (persuasivenessScore * 0.25) + (stagePresenceScore * 0.15));

    const qaAverage = qaResults.length > 0
      ? Math.round(qaResults.reduce((a, b) => a + b.score, 0) / qaResults.length)
      : 95;

    return {
      timePacingScore: Math.max(60, pacingScore),
      contentCompletenessScore: completenessScore,
      persuasivenessScore,
      stagePresenceScore,
      totalScore: Math.min(98, Math.max(70, totalScore)),
      timeSpentSeconds: timeSpent,
      plannedTotalSeconds: totalPlannedDuration,
      slideDurations: MOCK_ROADSHOW_SLIDES.map((s, idx) => ({
        slideId: s.id,
        title: s.title,
        spent: slideTimeSpent[idx] || s.plannedSeconds,
        planned: s.plannedSeconds
      })),
      judgeComments: [
        {
          judgeName: '张怀德',
          role: '组长·高校泰斗',
          comment: '核心物理干涉机理与15纳秒瞬态冻结阐释非常清晰，具有真正的底层颠覆性。建议在答辩中进一步强化抗温漂数据。',
          rating: '优秀'
        },
        {
          judgeName: '李元亨',
          role: '一线创投合伙人',
          comment: '商业模式闭环自洽，在手3500万意向订单与宁王中试证明打消了投资人对落地周期的疑虑。单机毛利测算扎实。',
          rating: '优秀'
        },
        {
          judgeName: '王书敏',
          role: '教育部双创专家',
          comment: '学生负责人62%控股与全职创业承诺非常亮眼，师生共创专利转化手续规范，育人成效在国赛中极具竞争力。',
          rating: '优秀'
        },
        {
          judgeName: '陈致远',
          role: '硬科技产业CTO',
          comment: '产线节拍适配度高，建议后续答辩准备充分应对工厂粉尘无尘度对光学探头长期寿命影响的问题。',
          rating: '良好'
        }
      ],
      suggestedQAQuestions: [
        '你们在第3页提到的15纳秒超快干涉，如果遇到动力电池高反射率金属箔片表面，如何防止衍射光晕溢出？',
        '第5页提到商业模式毛利率58%，请问其中核心光学镜片是自主研磨还是外协定制？若供应链断供成本会上升多少？',
        '第6页宁德时代一级供应商中试180天，是否有出具具备法律效力的第三方CMA/CNAS验收合格公函？',
        '项目负责人林博士如果毕业后留校任教，是否能确保100%全职投入深瞳视界的规模化量产？'
      ],
      qaRoundsCount: qaResults.length || 4,
      qaAverageScore: qaAverage,
      qaQuestionsAndAnswers: qaResults
    };
  };

  const handleFinalize = (proceedToQA: boolean) => {
    setShowFinishModal(false);
    if (proceedToQA) {
      setCurrentSlideIndex(8); // Switch directly to Slide 9: 评审席与答辩
    } else {
      setShowCombinedReportModal(true);
    }
  };

  // Color theme for remaining time
  const isWarningTime = timeLeft <= 60 && timeLeft > 0;
  const isDangerTime = timeLeft === 0;

  return (
    <div className="w-full space-y-4 pb-12">
      {/* 1. Roadshow Podium Header & Control Bar */}
      <header className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-lg border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="退出路演讲台"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-400/30 text-xs font-semibold flex items-center gap-1">
                <Presentation size={13} />
                <span>国赛全真实战路演讲台</span>
              </span>
              <span className="text-xs text-slate-400">
                {config.roadshowDuration || '5min'} 金奖实训标准
              </span>
            </div>
            <h1 className="text-base sm:text-lg font-bold text-white tracking-tight truncate max-w-md sm:max-w-xl">
              {project.name}
            </h1>
          </div>
        </div>

        {/* Center/Right: Digital Countdown Timer & Presentation Controls */}
        <div className="flex items-center flex-wrap gap-2.5 sm:gap-3">
          {/* Live Official Countdown Clock */}
          <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border font-mono transition-all duration-300 ${
            isDangerTime 
              ? 'bg-rose-500/20 border-rose-500/50 text-rose-300 animate-pulse'
              : isWarningTime
              ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
              : 'bg-slate-800/90 border-slate-700 text-emerald-400'
          }`}>
            <Clock size={16} className={isWarningTime ? 'animate-bounce text-amber-400' : ''} />
            <div className="text-left">
              <div className="text-[10px] uppercase tracking-wider text-slate-400 leading-none">
                {isDangerTime ? '时间到·响铃切麦' : isWarningTime ? '最后倒计时警示' : '路演剩余时限'}
              </div>
              <div className="text-lg font-extrabold tracking-widest leading-none mt-0.5">
                {formatTime(timeLeft)}
              </div>
            </div>
          </div>

          {/* Pause / Play */}
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              isRunning 
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200' 
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
            title={isRunning ? '暂停计时与演练' : '继续计时演练'}
          >
            {isRunning ? <Pause size={16} /> : <Play size={16} className="fill-current" />}
            <span className="hidden sm:inline">{isRunning ? '暂停' : '继续'}</span>
          </button>

          {/* Laser Pointer Switch */}
          <button
            onClick={() => setIsLaserPointerActive(!isLaserPointerActive)}
            className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              isLaserPointerActive 
                ? 'bg-rose-600 text-white shadow-sm ring-2 ring-rose-400/40' 
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
            title="模拟激光指示笔 (在PPT大屏上悬停演示)"
          >
            <Target size={16} className={isLaserPointerActive ? 'text-white animate-pulse' : 'text-rose-400'} />
            <span className="hidden sm:inline">{isLaserPointerActive ? '激光笔 开' : '激光笔'}</span>
          </button>

          {/* Video Feed Window Toggle */}
          <button
            onClick={() => setShowVideoWindow(!showVideoWindow)}
            className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              showVideoWindow 
                ? 'bg-purple-600 text-white shadow-sm ring-2 ring-purple-400/40' 
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
            title="开启/隐藏选手出镜镜面与主审连线视频窗口"
          >
            <Video size={16} className={showVideoWindow ? 'text-white animate-pulse' : 'text-purple-400'} />
            <span className="hidden sm:inline">{showVideoWindow ? '实战视讯 开' : '实战视讯'}</span>
          </button>

          {/* Finish Roadshow & Enter Q&A / Output Report */}
          <button
            onClick={() => {
              if (currentSlideIndex === 8) {
                setShowCombinedReportModal(true);
              } else {
                setCurrentSlideIndex(8);
              }
            }}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-95"
          >
            <CheckCircle2 size={15} />
            <span>{currentSlideIndex === 8 ? '出具全维实训报告' : '完成路演进入答辩 (P9)'}</span>
          </button>
        </div>
      </header>

      {/* 2. Main Dual-Stage Arena: Left is 16:9 Presentation Screen, Right is Smart Teleprompter & Judges */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: 16:9 Projected PPT Screen (8 Cols on LG) */}
        <div className="lg:col-span-8 space-y-3">
          <div 
            ref={pptContainerRef}
            onMouseMove={handleMouseMove}
            className={`relative bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 rounded-2xl border border-slate-800 shadow-xl overflow-hidden flex flex-col justify-between p-5 sm:p-7 text-white select-none transition-all ${
              currentSlideIndex === 8 ? 'min-h-[540px] aspect-auto' : 'aspect-[16/9.5] sm:aspect-[16/9]'
            }`}
          >
            {/* Ambient Backlight */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Virtual Laser Pointer Cursor Dot */}
            {isLaserPointerActive && (
              <div 
                className="absolute w-4 h-4 rounded-full bg-rose-500 shadow-[0_0_12px_#f43f5e] pointer-events-none -translate-x-1/2 -translate-y-1/2 z-50 transition-transform duration-75 ring-4 ring-rose-400/30"
                style={{ left: `${laserPos.x}px`, top: `${laserPos.y}px` }}
              />
            )}

            {/* Top Bar inside Slide */}
            <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <span className={`px-2.5 py-0.5 rounded-full border text-[11px] font-bold ${
                  currentSlideIndex === 8
                    ? 'bg-amber-500/30 border-amber-400/50 text-amber-300'
                    : 'bg-indigo-500/30 border-indigo-400/40 text-indigo-300'
                }`}>
                  {currentSlide.category}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  SLIDE {currentSlide.id.toString().padStart(2, '0')} / {MOCK_ROADSHOW_SLIDES.length.toString().padStart(2, '0')}
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-400">
                <div className="flex items-center gap-1.5 font-mono">
                  <Clock size={13} className={currentSlideIndex === 8 ? 'text-amber-400' : 'text-indigo-400'} />
                  <span>{currentSlideIndex === 8 ? '多评委实时质询' : `本页建议: ${currentSlide.plannedSeconds}s`}</span>
                  <span className="text-slate-600">|</span>
                  <span className={slideTimeSpent[currentSlideIndex] > currentSlide.plannedSeconds ? 'text-amber-400 font-bold' : 'text-emerald-400'}>
                    已用: {slideTimeSpent[currentSlideIndex] || 0}s
                  </span>
                </div>
              </div>
            </div>

            {/* Slide Core Content Body: Either Slide 9 Grand Defense Stage or Standard Presentation Slide */}
            {currentSlideIndex === 8 ? (
              <div className="relative z-10 flex-1 flex flex-col my-auto py-2">
                <RoadshowDefenseStage
                  project={project}
                  judges={judges}
                  onCompleteDefense={(results) => {
                    setQaResults(results);
                    setShowCombinedReportModal(true);
                  }}
                  onSkipToReport={() => {
                    setShowCombinedReportModal(true);
                  }}
                />
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                  className="relative z-10 my-auto space-y-4 py-2"
                >
                  <div>
                    <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight leading-snug">
                      {currentSlide.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-indigo-200/90 font-medium mt-1">
                      {currentSlide.subtitle}
                    </p>
                  </div>

                  {/* Key Visual Metrics Grid */}
                  <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                    {currentSlide.visualMetrics.map((m, idx) => (
                      <div 
                        key={idx}
                        className="bg-white/5 border border-white/10 hover:border-indigo-400/40 rounded-xl p-3 sm:p-4 backdrop-blur-xs transition-all relative overflow-hidden group"
                      >
                        {m.badge && (
                          <span className="absolute top-2 right-2 px-1.5 py-0.2 rounded text-[10px] font-bold bg-indigo-500/40 text-indigo-200 border border-indigo-300/30">
                            {m.badge}
                          </span>
                        )}
                        <div className="text-[11px] text-slate-300 truncate">{m.label}</div>
                        <div className="text-lg sm:text-2xl font-extrabold text-white tracking-tight mt-1 font-mono text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-indigo-300">
                          {m.value}
                        </div>
                        {m.hint && (
                          <div className="text-[10px] text-indigo-300/80 mt-1 truncate">
                            {m.hint}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Highlight Bullets on PPT */}
                  <div className="bg-black/30 border border-white/10 rounded-xl p-3 sm:p-3.5 space-y-1.5">
                    {currentSlide.highlightBullets.map((b, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-slate-200">
                        <CheckCircle2 size={13} className="text-indigo-400 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{b}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            )}

            {/* Slide Footer with Controls */}
            <div className="relative z-10 flex items-center justify-between pt-3 border-t border-white/10 text-xs text-slate-400">
              <div className="flex items-center gap-1">
                {MOCK_ROADSHOW_SLIDES.map((s, idx) => (
                  <button
                    key={s.id}
                    onClick={() => setCurrentSlideIndex(idx)}
                    className={`h-2 rounded-full transition-all ${
                      idx === currentSlideIndex 
                        ? (idx === 8 ? 'w-8 bg-amber-400' : 'w-6 bg-indigo-400') 
                        : idx < currentSlideIndex 
                        ? 'w-2 bg-emerald-400' 
                        : (idx === 8 ? 'w-3 bg-amber-400/40' : 'w-2 bg-white/20 hover:bg-white/40')
                    }`}
                    title={`跳转至第 ${idx + 1} 页：${s.title}`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevSlide}
                  disabled={currentSlideIndex === 0}
                  className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white font-medium flex items-center gap-1 transition-colors"
                >
                  <ChevronLeft size={14} />
                  <span>上一页</span>
                </button>
                <button
                  onClick={handleNextSlide}
                  className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1 transition-colors shadow-xs ${
                    currentSlideIndex === 7
                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-black'
                      : currentSlideIndex === 8
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                  }`}
                >
                  <span>
                    {currentSlideIndex === 7
                      ? '进入专家现场答辩 (P9)'
                      : currentSlideIndex === 8
                      ? '出具全维实训报告'
                      : '下一页'}
                  </span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>

            {/* Floating Picture-in-Picture Video Feed Window */}
            {showVideoWindow && videoPlacement === 'pip' && (
              <div className="absolute bottom-16 right-4 sm:right-6 w-64 sm:w-72 z-40 shadow-2xl rounded-2xl overflow-hidden border border-slate-700 bg-slate-950">
                <div className="bg-slate-900/95 px-2.5 py-1.5 flex items-center justify-between text-[10px] text-slate-300 border-b border-slate-800">
                  <span className="font-bold text-white flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>出镜画中画 (PiP)</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setVideoPlacement('sidebar')}
                      className="text-purple-300 hover:text-purple-200 transition-colors"
                      title="嵌入右侧栏"
                    >
                      嵌入侧栏
                    </button>
                    <button
                      onClick={() => setShowVideoWindow(false)}
                      className="text-slate-400 hover:text-rose-300 font-bold transition-colors"
                      title="关闭视讯"
                    >
                      &times;
                    </button>
                  </div>
                </div>
                <DefenseVideoWindow
                  mode="presenter"
                  onClose={() => setShowVideoWindow(false)}
                  className="rounded-t-none border-t-0 shadow-none"
                />
              </div>
            )}
          </div>

          {/* Quick Thumbnails Strip below the PPT screen */}
          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-2">
            {MOCK_ROADSHOW_SLIDES.map((slide, idx) => {
              const isSelected = idx === currentSlideIndex;
              const isDefenseSlide = slide.id === 9;
              return (
                <button
                  key={slide.id}
                  onClick={() => setCurrentSlideIndex(idx)}
                  className={`p-2 rounded-xl border text-left transition-all relative ${
                    isSelected
                      ? isDefenseSlide
                        ? 'bg-amber-950/20 border-amber-400 shadow-sm ring-2 ring-amber-400/40 text-amber-900'
                        : 'bg-indigo-50 border-indigo-500 shadow-sm ring-2 ring-indigo-500/20'
                      : isDefenseSlide
                      ? 'bg-amber-500/10 border-amber-300/40 hover:border-amber-400'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[10px] font-bold font-mono ${
                      isSelected 
                        ? (isDefenseSlide ? 'text-amber-600 font-black' : 'text-indigo-600') 
                        : (isDefenseSlide ? 'text-amber-600 font-bold' : 'text-slate-400')
                    }`}>
                      {isDefenseSlide ? 'P9 答辩' : `P${slide.id}`}
                    </span>
                    <span className="text-[9px] text-slate-400">
                      {isDefenseSlide ? '4轮质询' : `${slide.plannedSeconds}s`}
                    </span>
                  </div>
                  <div className={`text-[11px] font-bold truncate ${
                    isSelected 
                      ? (isDefenseSlide ? 'text-amber-900 font-black' : 'text-indigo-900') 
                      : (isDefenseSlide ? 'text-amber-800' : 'text-slate-700')
                  }`}>
                    {slide.category}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Speaker Teleprompter & Virtual Expert Panel (4 Cols on LG) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Sidebar Docked Video Window */}
          {showVideoWindow && videoPlacement === 'sidebar' && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] px-1 text-slate-500">
                <span className="font-bold text-slate-700 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>侧栏实战出镜与评委视讯</span>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setVideoPlacement('pip')}
                    className="text-purple-600 hover:text-purple-700 font-medium"
                    title="切换为PPT大屏悬浮画中画"
                  >
                    切换为画中画
                  </button>
                  <button
                    onClick={() => setShowVideoWindow(false)}
                    className="text-slate-400 hover:text-rose-500 font-bold"
                    title="关闭视讯"
                  >
                    &times;
                  </button>
                </div>
              </div>
              <DefenseVideoWindow
                mode="dual"
                onClose={() => setShowVideoWindow(false)}
              />
            </div>
          )}

          {/* Tabs header */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200">
            <button
              onClick={() => setActiveRightTab('prompter')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeRightTab === 'prompter'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText size={14} />
              <span>讲稿提词</span>
            </button>
            <button
              onClick={() => setActiveRightTab('judges')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeRightTab === 'judges'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users size={14} />
              <span>评委动向</span>
            </button>
            <button
              onClick={() => {
                setActiveRightTab('video');
                setShowVideoWindow(true);
              }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeRightTab === 'video'
                  ? 'bg-white text-purple-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Video size={14} />
              <span>实战视讯</span>
            </button>
          </div>

          {/* Tab 1: Smart Teleprompter */}
          {activeRightTab === 'prompter' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
              {/* Header with pacing indicator */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Mic size={15} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-800">当前页金奖讲稿提词</h3>
                    <p className="text-[10px] text-slate-400">字数约 {currentSlide.speakerScript.length} 字 · 推荐语速 220字/分</p>
                  </div>
                </div>

                {/* Speech Pacing Indicator Badge */}
                <div className="text-right">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    speechPacingStatus === 'optimal'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : speechPacingStatus === 'slow'
                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                      : 'bg-rose-100 text-rose-800 border border-rose-200'
                  }`}>
                    {speechPacingStatus === 'optimal' ? '节奏极佳 🎯' : speechPacingStatus === 'slow' ? '稍偏慢 🐢' : '稍急促 ⚡'}
                  </span>
                </div>
              </div>

              {/* Full Golden Orator Script Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-700 leading-relaxed max-h-56 overflow-y-auto font-sans relative">
                <p className="font-medium text-slate-800 selection:bg-indigo-100">
                  {currentSlide.speakerScript}
                </p>
              </div>

              {/* Key Memory Anchors (Bullet Points) */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                  <Target size={13} className="text-indigo-500" />
                  <span>核心记忆锚点（脱稿要点）</span>
                </div>
                <div className="space-y-1">
                  {currentSlide.keyPoints.map((kp, i) => (
                    <div key={i} className="text-[11px] text-slate-600 bg-indigo-50/60 border border-indigo-100/80 rounded-lg px-2.5 py-1 flex items-start gap-1.5">
                      <span className="font-bold text-indigo-600 font-mono mt-0.5">{i + 1}.</span>
                      <span className="leading-snug">{kp}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gold Medal Mentor Secret Tip */}
              <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3 flex items-start gap-2.5 text-xs">
                <Sparkles size={16} className="text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-amber-900 text-[11px]">国赛金奖导师实战锦囊</div>
                  <p className="text-amber-800 text-[11px] leading-relaxed mt-0.5">
                    {currentSlide.goldAdvice}
                  </p>
                </div>
              </div>

              {/* Audio Demo Simulation Button */}
              <button
                onClick={() => setIsAutoSpeechPlaying(!isAutoSpeechPlaying)}
                className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border ${
                  isAutoSpeechPlaying
                    ? 'bg-purple-50 text-purple-700 border-purple-300 animate-pulse'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                {isAutoSpeechPlaying ? <VolumeX size={15} /> : <Volume2 size={15} className="text-purple-600" />}
                <span>{isAutoSpeechPlaying ? '停止范例音频试听' : '试听国赛冠军语速标准范例'}</span>
              </button>
            </div>
          )}

          {/* Tab 2: Front Row Virtual Expert Judges */}
          {activeRightTab === 'judges' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Award size={15} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-800">国赛评委席实时反应</h3>
                    <p className="text-[10px] text-slate-400">4位国家级专家正在前排听讲与即时打分</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[11px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                  <Activity size={12} />
                  <span>关注度 94%</span>
                </div>
              </div>

              {/* Virtual Judges List */}
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {judges.map((judge) => (
                  <div 
                    key={judge.id}
                    className="p-3 rounded-xl border border-slate-200 hover:border-purple-300 bg-slate-50/60 transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={judge.avatar}
                          alt={judge.name}
                          className="w-9 h-9 rounded-full object-cover border border-slate-300"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-900">{judge.name}</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-700 font-medium">
                              {judge.role}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-500 truncate max-w-[170px]">
                            {judge.title}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-black font-mono text-purple-700">
                          {judge.satisfactionScore}分
                        </span>
                      </div>
                    </div>

                    {/* Dynamic reaction bubble */}
                    <div className="bg-white border border-slate-200 rounded-lg p-2 text-[11px] text-slate-600 flex items-start gap-1.5">
                      <MessageSquare size={13} className="text-purple-500 shrink-0 mt-0.5" />
                      <span className="leading-snug italic text-slate-700">
                        "{judge.reactionText}"
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 text-[11px] text-purple-800 flex items-center justify-between">
                <span>评审席当前共鸣偏好：</span>
                <span className="font-bold">硬核参数 + 在手订单</span>
              </div>
            </div>
          )}

          {/* Tab 3: Dedicated Real-time Video Stream & Stage Etiquette Deck */}
          {activeRightTab === 'video' && (
            <div className="space-y-4">
              <DefenseVideoWindow
                mode="dual"
                onClose={() => setActiveRightTab('prompter')}
              />

              {/* National Competition Stage Etiquette Diagnostic Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-emerald-600" />
                    <span>2026 国赛线上路演仪态诊断规程</span>
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    AI 实时自检
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-start gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <div>
                      <div className="font-bold text-slate-800">视线平视镜头（模拟注视主审专家）</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        切忌长时间向下低头念稿，建议将视线保持在摄像头水平位置，每页至少抬头与评委眼神对视 3 次。
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                    <div>
                      <div className="font-bold text-slate-800">肢体动作与手势控制</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        在阐述第3页“技术突破”与第5页“订单商业化”时，配合适度外展手势，强化项目自信度。
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 shrink-0" />
                    <div>
                      <div className="font-bold text-slate-800">背景与光线标准</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        采用单色或虚化学术背景，面部主光源充足，避免背光与杂音干扰。
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. Roadshow Completion Modal: Provides Option to Seamlessly Transition to Defense Q&A */}
      <AnimatePresence>
        {showFinishModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 relative overflow-hidden"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <Award size={26} />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                    项目路演陈述完成！
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    已记录本次路演的控时精度、PPT讲透率与专家席即时印象分
                  </p>
                </div>
              </div>

              {/* Score Snapshot Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                  <div className="text-[10px] text-slate-500">控时精准度</div>
                  <div className="text-lg font-black text-emerald-600 font-mono mt-1">96%</div>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                  <div className="text-[10px] text-slate-500">PPT架构讲透率</div>
                  <div className="text-lg font-black text-indigo-600 font-mono mt-1">100%</div>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                  <div className="text-[10px] text-slate-500">商业说服力</div>
                  <div className="text-lg font-black text-purple-600 font-mono mt-1">92分</div>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                  <div className="text-[10px] text-slate-500">评委席综合分</div>
                  <div className="text-lg font-black text-amber-600 font-mono mt-1">91.5</div>
                </div>
              </div>

              {/* Expert Preview: What Judges will ask next */}
              <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-4 space-y-2">
                <div className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                  <Flame size={14} className="text-indigo-600" />
                  <span>评委席基于你刚才路演陈述的靶向质询预备：</span>
                </div>
                <div className="space-y-1.5 text-xs text-indigo-800">
                  <div className="flex items-start gap-2 bg-white/70 rounded-lg p-2 border border-indigo-100">
                    <span className="font-bold text-indigo-600 font-mono">Q1:</span>
                    <span>“你们刚才第3页讲到15纳秒超快干涉，在封测车间机械震动工况下实测复现率是多少？”</span>
                  </div>
                  <div className="flex items-start gap-2 bg-white/70 rounded-lg p-2 border border-indigo-100">
                    <span className="font-bold text-indigo-600 font-mono">Q2:</span>
                    <span>“3500万在手意向订单中，已确认履约交付的客户回款周期与毛利率是否经得起抽检？”</span>
                  </div>
                </div>
              </div>

              {/* Dual Next Step CTA */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  onClick={() => handleFinalize(false)}
                  className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors"
                >
                  直接查看路演复盘报告
                </button>
                <button
                  onClick={() => handleFinalize(true)}
                  className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all"
                >
                  <Swords size={15} />
                  <span>无缝开启【评委现场答辩】</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Comprehensive Full-Spectrum Roadshow & Defense Training Report Modal */}
      {showCombinedReportModal && (
        <RoadshowCombinedReportModal
          project={project}
          roadshowEval={generateEvaluation()}
          qaResults={qaResults}
          judges={judges}
          onClose={() => {
            setShowCombinedReportModal(false);
            onFinishRoadshow(generateEvaluation(), false);
          }}
          onRestart={() => {
            setShowCombinedReportModal(false);
            setCurrentSlideIndex(0);
            setTimeLeft(totalPlannedDuration);
            setIsRunning(true);
            setSlideTimeSpent(new Array(MOCK_ROADSHOW_SLIDES.length).fill(0));
            setQaResults([]);
          }}
        />
      )}
    </div>
  );
}
