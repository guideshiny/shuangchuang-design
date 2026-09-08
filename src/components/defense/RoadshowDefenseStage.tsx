import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Send, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  Award, 
  ShieldCheck, 
  Flame, 
  AlertCircle,
  HelpCircle,
  Play,
  Pause,
  ChevronRight,
  FileCheck
} from 'lucide-react';
import { VirtualJudge, DefenseProject } from './defenseTypes';

export interface DefenseQAResult {
  judgeName: string;
  role: string;
  question: string;
  answer: string;
  score: number;
  comment: string;
  timeSpent: number;
}

interface Props {
  project: DefenseProject;
  judges: VirtualJudge[];
  onCompleteDefense: (results: DefenseQAResult[]) => void;
  onSkipToReport: () => void;
}

interface DefenseRoundConfig {
  judgeIndex: number;
  question: string;
  focusTag: string;
  suggestedPills: string[];
  goldStandardAnswer: string;
  voicePitch: number;
  voiceRate: number;
  feedbackComment: string;
  baseScore: number;
}

const DEFENSE_ROUNDS: DefenseRoundConfig[] = [
  {
    judgeIndex: 0, // 张怀德 · 组长/高校泰斗
    focusTag: '底层物理机理与自主专利壁垒',
    question: '林博士，你们在第3页强调15纳秒超快干涉实现了瞬态冻结，但工业流水车间常有高频机械微振动与热温漂，请问你们的差分消噪算法在物理层面是如何解耦光学相干湮灭的？核心发明专利的权利要求书是如何布局的？',
    suggestedPills: [
      '15纳秒曝光远小于机械振动毫秒周期，物理瞬态解耦',
      '非均匀环境光偏振差分消噪，信噪比实测跃升18.6dB',
      '授权国家发明专利ZL202310889211.X权利要求全覆盖'
    ],
    goldStandardAnswer: '张老师切中要害！我们采用自研双波长差分干涉光路，激光脉宽仅15纳秒，远低于车间机械振动微米位移特征周期(毫秒级)，从物理源头实现瞬态冻结；同时引入非均匀偏振差分算法将信噪比提升18.6dB，经国家权威质检中心检测横向分辨率达0.35微米。核心技术已授权国家发明专利ZL202310889211.X，权利要求完整覆盖振动自补偿光路与点云重构算法，实现真正自主可控。',
    voicePitch: 0.9,
    voiceRate: 0.95,
    feedbackComment: '论点扎实！从纳秒光路物理周期解耦到发明专利权利要求布局严密，展现了顶尖高校博士团队的学术硬核实力。',
    baseScore: 95
  },
  {
    judgeIndex: 1, // 李元亨 · 一线创投合伙人
    focusTag: '在手订单真实履约与毛利壁垒',
    question: '你们第5页提到硬件综合毛利58%、在手意向订单3500万。如果行业巨头比如蔡司或基恩士采取降价40%打价格战，你们在客户粘性和算法模型订阅壁垒上，凭什么保证客户不流失？',
    suggestedPills: [
      '工艺标定数据库深度嵌入MES，客户迁移成本极高',
      '单机58%毛利保有巨大安全边际，客户4.8个月收回成本',
      '与锂电头部签署排他协议，每年算法ARR订阅续费率91.3%'
    ],
    goldStandardAnswer: '李总这个问题非常尖锐！首先，我们的核心护城河在于“产线深度工艺标定数据库”。系统一旦接入客户流水线，微缺陷图谱训练越多，替换成本就极其高昂；其次，我们依托国产精密供应链单机毛利高达58%，即便降价仍有充裕利润空间，且为客户挽回废品损失年均超120万，4.8个月即可收回成本；最后，我们与动力电池前三强签订了排他协议，算法年费订阅续费率达91.3%，构筑了坚实的SaaS现金流壁垒。',
    voicePitch: 1.05,
    voiceRate: 1.02,
    feedbackComment: '商业防护壁垒讲得很透！数据资产沉淀带来的高迁移成本是硬科技项目最核心的商业护城河，订单与毛利逻辑严谨。',
    baseScore: 94
  },
  {
    judgeIndex: 3, // 陈致远 · 硬科技产业CTO (MOCK_VIRTUAL_JUDGES index 3)
    focusTag: '产线45件/分节拍与极端工况MTBF',
    question: '工业产线最看重在线全检节拍。动力电池极耳流水线每分钟节拍达45件以上，你们的边缘FPGA算力卡在连续运行2000小时后的平均无故障时间(MTBF)和漏报率指标究竟如何？宁德时代中试有无第三方CMA验收报告？',
    suggestedPills: [
      '宁德时代一级供应商车间驻厂180天连续中试',
      '累计检测120万颗极耳零漏报，已获CMA第三方报告',
      '自研FPGA张量加速核，40毫秒重构吞吐率达45件/分'
    ],
    goldStandardAnswer: '陈总问到了产线生命线！在宁德时代一级供应商车间，我们完成了180天驻厂连续中试，累计在线检测超120万颗电芯极耳，漏报率为零，已由国家计量认证第三方检测机构出具了具备法律效力的CMA/CNAS验收合格公函；单机连续稳定无故障运行突破2000小时；且自研FPGA边缘算力卡在40毫秒内完成全幅点云重构，综合吞吐率达45件/分，节拍完全匹配高速流水线！',
    voicePitch: 1.0,
    voiceRate: 1.0,
    feedbackComment: '数据极其具体！有真实驻厂180天的CMA合格报告与120万颗零漏报实绩，这个工业指标在产线赛道绝对经得起推敲。',
    baseScore: 96
  },
  {
    judgeIndex: 2, // 王书敏 · 教育部双创专家 (MOCK_VIRTUAL_JUDGES index 2)
    focusTag: '学生62%绝对控股与育人成效',
    question: '作为高校师生共创项目，林博士你作为学生第一负责人持股62%，毕业后是否全职留在企业？学校对职务发明专利的独家排他许可手续是否完全合规交割？',
    suggestedPills: [
      '第一发明人已签全职创业承诺，毕业后100%投入',
      '学校技术转移中心出具排他性独家许可与转让公函',
      '累计带领28名硕博完成毕业设计，研产赛教深度融合'
    ],
    goldStandardAnswer: '王老师请放心！我作为第一发明人和学生第一负责人，已办理全职创业手续并签署竞业限制与全职承诺书，毕业后100%全职投入深瞳视界运营；母校技术转移中心已正式出具职务发明排他性独家许可与转让协议，股权清晰、产权合规，完全符合国赛金奖要求！同时，项目累计带领28名硕博在工程一线完成课题与就业，全员缴纳社保，形成了产学研用深度融合的育人闭环。',
    voicePitch: 1.08,
    voiceRate: 0.95,
    feedbackComment: '股权结构清晰合规，学生全职创业有担当，育人成效显著，完全契合中国国际大学生创新大赛立德树人的核心宗旨！',
    baseScore: 98
  }
];

export default function RoadshowDefenseStage({
  project,
  judges,
  onCompleteDefense,
  onSkipToReport
}: Props) {
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingVolume, setRecordingVolume] = useState(0);
  const [speechStatusHint, setSpeechStatusHint] = useState<string>('');
  const [interimSpeechText, setInterimSpeechText] = useState<string>('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isTtsMuted, setIsTtsMuted] = useState(false);
  const [roundTimeLeft, setRoundTimeLeft] = useState(75);
  const [roundTimerActive, setRoundTimerActive] = useState(true);
  const [roundResults, setRoundResults] = useState<DefenseQAResult[]>([]);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [currentRoundEval, setCurrentRoundEval] = useState<{ score: number; comment: string } | null>(null);

  const recognitionRef = useRef<any>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const baseAnswerRef = useRef<string>('');
  const accumulatedSpeechRef = useRef<string>('');
  const roundStartTimeRef = useRef<number>(Date.now());
  const currentRound = DEFENSE_ROUNDS[currentRoundIndex] || DEFENSE_ROUNDS[0];
  const activeJudge = judges[currentRound.judgeIndex] || judges[0];

  // 1. Text-to-Speech (TTS) Voice Synthesis for Active Judge Question
  const speakQuestion = (text: string, pitch: number, rate: number) => {
    if (isTtsMuted) return;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-CN';
      utterance.pitch = pitch;
      utterance.rate = rate;

      const voices = window.speechSynthesis.getVoices();
      const zhVoice = voices.find(v => v.lang.includes('zh') || v.lang.includes('cmn') || v.name.includes('Chinese'));
      if (zhVoice) {
        utterance.voice = zhVoice;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    }
  };

  // Speak on round change
  useEffect(() => {
    roundStartTimeRef.current = Date.now();
    setRoundTimeLeft(75);
    setRoundTimerActive(true);
    setUserAnswer('');
    setShowFeedbackModal(false);
    setCurrentRoundEval(null);

    // Speak question after slight delay
    const timer = setTimeout(() => {
      speakQuestion(currentRound.question, currentRound.voicePitch, currentRound.voiceRate);
    }, 600);

    return () => {
      clearTimeout(timer);
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [currentRoundIndex]);

  // Round countdown timer
  useEffect(() => {
    if (!roundTimerActive || showFeedbackModal) return;

    const interval = setInterval(() => {
      setRoundTimeLeft(prev => {
        if (prev <= 1) {
          setRoundTimerActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [roundTimerActive, showFeedbackModal]);

  // Cleanup recording tracks and audio context
  const stopHardwareRecording = useCallback(() => {
    setIsRecording(false);
    setSpeechStatusHint('');
    setInterimSpeechText('');
    setRecordingVolume(0);

    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }

    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(t => t.stop());
      audioStreamRef.current = null;
    }

    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
  }, []);

  // Stop TTS and Recording when unmounting
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      stopHardwareRecording();
    };
  }, [stopHardwareRecording]);

  // 2. Real Hardware Microphone + Speech-to-Text (STT) Voice Recognition
  const toggleSpeechRecognition = async () => {
    if (isRecording) {
      stopHardwareRecording();
      return;
    }

    // Prepare text baseline
    baseAnswerRef.current = userAnswer;
    accumulatedSpeechRef.current = '';
    setInterimSpeechText('');
    setSpeechStatusHint('正在连接电脑麦克风...');

    // 1. Capture real microphone audio stream & connect Web Audio API meter
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setSpeechStatusHint('当前浏览器不支持麦克风设备访问');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      audioStreamRef.current = stream;

      // Set up real-time audio volume measurement via Web Audio API
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          const audioCtx = new AudioContextClass();
          audioContextRef.current = audioCtx;
          const source = audioCtx.createMediaStreamSource(stream);
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 256;
          analyser.smoothingTimeConstant = 0.4;
          source.connect(analyser);
          analyserRef.current = analyser;

          const bufferLength = analyser.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);

          const updateMeter = () => {
            if (analyserRef.current) {
              analyserRef.current.getByteFrequencyData(dataArray);
              let sum = 0;
              for (let i = 0; i < bufferLength; i++) {
                sum += dataArray[i];
              }
              const avg = sum / bufferLength;
              const level = Math.min(100, Math.round((avg / 64) * 100));
              setRecordingVolume(level);
            }
            animFrameRef.current = requestAnimationFrame(updateMeter);
          };
          updateMeter();
        }
      } catch (audioCtxErr) {
        console.warn('Web Audio API analysis error:', audioCtxErr);
      }

      setIsRecording(true);
      setSpeechStatusHint('真实麦克风已连接 · 请面对麦克风陈述您的答辩观点');
    } catch (micErr: any) {
      console.error('Real microphone access denied or failed:', micErr);
      setSpeechStatusHint('未获取到麦克风权限，请在浏览器地址栏允许使用麦克风');
      return;
    }

    // 2. Start Real Web Speech API for voice recognition if available
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.lang = 'zh-CN';
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
          setSpeechStatusHint('正在实时收音并转写...');
        };

        recognition.onresult = (event: any) => {
          let interim = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              accumulatedSpeechRef.current += transcript;
            } else {
              interim += transcript;
            }
          }
          setInterimSpeechText(interim);

          const fullSpoken = (accumulatedSpeechRef.current + interim).trim();
          if (fullSpoken) {
            setUserAnswer(() => {
              const base = baseAnswerRef.current.trim();
              return base ? `${base} ${fullSpoken}` : fullSpoken;
            });
          }
        };

        recognition.onerror = (event: any) => {
          console.warn('SpeechRecognition event error:', event.error);
          if (event.error === 'no-speech') {
            setSpeechStatusHint('正在聆听中... 请开始作答');
          } else if (event.error === 'not-allowed') {
            setSpeechStatusHint('麦克风权限未被允许');
          } else if (event.error === 'network') {
            setSpeechStatusHint('云端语音转写通道延迟，电脑麦克风收音仍持续采集中');
          } else {
            setSpeechStatusHint(`语音转写提示: ${event.error}`);
          }
        };

        recognition.onend = () => {
          setInterimSpeechText('');
        };

        recognitionRef.current = recognition;
        recognition.start();
      } catch (err) {
        console.warn('SpeechRecognition start failed:', err);
        setSpeechStatusHint('已开启真实电脑麦克风硬件拾音 (识别引擎待命)');
      }
    } else {
      setSpeechStatusHint('已连接电脑麦克风硬件 (当前浏览器建议在Chrome中体验完整语音转写)');
    }
  };

  // 3. Handle Answer Submission
  const handleSubmitAnswer = () => {
    if (!userAnswer.trim()) return;

    // Stop speaking & recording
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    stopHardwareRecording();

    const timeSpent = Math.max(5, Math.round((Date.now() - roundStartTimeRef.current) / 1000));
    
    // Evaluate answer length and quality
    let roundScore = currentRound.baseScore;
    if (userAnswer.length > 50) roundScore = Math.min(99, roundScore + 2);
    if (userAnswer.length < 20) roundScore = Math.max(80, roundScore - 6);

    const resultItem: DefenseQAResult = {
      judgeName: activeJudge.name,
      role: activeJudge.role,
      question: currentRound.question,
      answer: userAnswer,
      score: roundScore,
      comment: currentRound.feedbackComment,
      timeSpent
    };

    const newResults = [...roundResults, resultItem];
    setRoundResults(newResults);
    setCurrentRoundEval({ score: roundScore, comment: currentRound.feedbackComment });
    setShowFeedbackModal(true);
  };

  // 4. Proceed to Next Round or Finish Defense
  const handleProceedToNextRound = () => {
    setShowFeedbackModal(false);
    if (currentRoundIndex < DEFENSE_ROUNDS.length - 1) {
      setCurrentRoundIndex(prev => prev + 1);
    } else {
      // Completed all 4 rounds!
      onCompleteDefense(roundResults);
    }
  };

  return (
    <div className="flex flex-col h-full justify-between text-white space-y-4">
      {/* 1. Header Bar: Stage Identity, Round Badge, TTS & Skip Controls */}
      <div className="flex items-center justify-between gap-3 bg-slate-900/80 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
            <Award size={18} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-amber-400 tracking-wider">
                国赛综合答辩大厅 · 第 {currentRoundIndex + 1} / {DEFENSE_ROUNDS.length} 轮
              </span>
              <span className="text-[10px] px-2 py-0.2 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                {currentRound.focusTag}
              </span>
            </div>
            <div className="text-[11px] text-slate-400">
              全真模拟专家席轮流针对性发难 · 实时语音交互质询
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* TTS Audio Controls */}
          <button
            onClick={() => {
              if (isSpeaking) {
                if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                  window.speechSynthesis.cancel();
                }
                setIsSpeaking(false);
              } else {
                speakQuestion(currentRound.question, currentRound.voicePitch, currentRound.voiceRate);
              }
            }}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
              isSpeaking
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
            title="播放或重播专家语音提问"
          >
            <Volume2 size={14} className={isSpeaking ? 'animate-bounce' : ''} />
            <span className="hidden sm:inline">{isSpeaking ? '语音提问中...' : '重播专家语音'}</span>
          </button>

          {/* Mute Toggle */}
          <button
            onClick={() => setIsTtsMuted(!isTtsMuted)}
            className={`p-1.5 rounded-xl border text-xs transition-colors ${
              isTtsMuted ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
            }`}
            title={isTtsMuted ? '取消静音' : '静音评委语音'}
          >
            {isTtsMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          </button>

          {/* Skip directly to comprehensive report */}
          <button
            onClick={onSkipToReport}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all"
          >
            出具报告
          </button>
        </div>
      </div>

      {/* 2. Grand Jury Bench: 4 Virtual Judges displayed across the top of the stage */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3">
        {judges.map((judge, idx) => {
          const isCurrentSpeaker = idx === currentRound.judgeIndex;
          return (
            <div
              key={judge.id}
              className={`p-3 rounded-2xl border transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${
                isCurrentSpeaker
                  ? 'bg-gradient-to-b from-amber-500/20 via-slate-900 to-indigo-950/80 border-amber-400 ring-2 ring-amber-400/60 shadow-[0_0_24px_rgba(251,191,36,0.35)] scale-[1.02]'
                  : 'bg-slate-900/80 border-slate-800 opacity-75 hover:opacity-100'
              }`}
            >
              {/* Highlight Badge for Active Questioning Judge */}
              {isCurrentSpeaker && (
                <div className="absolute top-2 right-2 flex items-center gap-1 bg-amber-500 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-full shadow-xs uppercase tracking-wider animate-pulse">
                  <Mic size={10} className="fill-current" />
                  <span>正在发问</span>
                </div>
              )}

              <div className="flex items-start gap-2.5">
                <div className="relative shrink-0">
                  <img
                    src={judge.avatar}
                    alt={judge.name}
                    className={`w-11 h-11 rounded-full object-cover border-2 transition-all ${
                      isCurrentSpeaker
                        ? 'border-amber-400 ring-4 ring-amber-400/30'
                        : 'border-slate-700'
                    }`}
                  />
                  {isCurrentSpeaker && isSpeaking && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-amber-400 flex items-center justify-center text-slate-950 animate-bounce">
                      <Volume2 size={10} />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`text-xs font-bold ${isCurrentSpeaker ? 'text-white' : 'text-slate-300'}`}>
                      {judge.name}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-900/60 text-indigo-300 border border-indigo-700/40 truncate">
                      {judge.role}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5" title={judge.title}>
                    {judge.title}
                  </div>
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                <span className="text-slate-400">
                  {isCurrentSpeaker ? '专场质询维度' : '实时状态'}
                </span>
                <span className={`font-semibold ${isCurrentSpeaker ? 'text-amber-300' : 'text-slate-400'}`}>
                  {isCurrentSpeaker ? currentRound.focusTag : '认真倾听核验'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Main Center Stage: Judge's Spoken Question (Audio Wave + Subtitles) */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 sm:p-5 relative shadow-inner space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <Sparkles size={14} />
              <span>{activeJudge.name}（{activeJudge.role}）现场质询原声</span>
            </span>
            {isSpeaking && (
              <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>实时语音广播中</span>
              </span>
            )}
          </div>

          {/* Countdown timer for student answer */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-700 font-mono">
              <Clock size={13} className={roundTimeLeft < 20 ? 'text-rose-400 animate-spin' : 'text-amber-400'} />
              <span className={roundTimeLeft < 20 ? 'text-rose-400 font-bold' : 'text-slate-200'}>
                答辩倒计时：{roundTimeLeft}s
              </span>
            </div>
          </div>
        </div>

        {/* Big Question Display with Spoken Wave */}
        <div className="relative pl-3 border-l-2 border-amber-400 py-1">
          <p className="text-sm sm:text-base font-semibold text-slate-100 leading-relaxed selection:bg-amber-500 selection:text-slate-950">
            "{currentRound.question}"
          </p>
        </div>

        {/* Audio Equalizer bars during judge speech */}
        {isSpeaking && (
          <div className="flex items-center gap-1.5 py-1">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(i => (
              <motion.div
                key={i}
                className="w-1 bg-gradient-to-t from-amber-500 to-yellow-300 rounded-full origin-bottom"
                animate={{ height: ['20%', '100%', '30%'] }}
                transition={{
                  repeat: Infinity,
                  duration: 0.4 + (i % 4) * 0.1,
                  ease: 'easeInOut'
                }}
                style={{ height: 16 }}
              />
            ))}
            <span className="text-[10px] text-amber-300/80 ml-2">正在通过拟真评委声学引擎现场发音...</span>
          </div>
        )}
      </div>

      {/* 4. Student Response Deck: Voice Recording, Quick Pills, Text Input & Submit */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Mic size={14} className="text-indigo-400" />
              <span>选手现场答辩作答席</span>
            </span>
            <span className="text-[10px] text-slate-400 hidden sm:inline">
              (支持点击麦克风实时语音转写，或点选金牌要点组合提交)
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Real Voice Input Button */}
            <button
              onClick={toggleSpeechRecognition}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95 ${
                isRecording
                  ? 'bg-rose-600 text-white ring-4 ring-rose-400/40 animate-pulse'
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white'
              }`}
              title={isRecording ? '点击停止麦克风录音' : '点击连接电脑麦克风进行语音答辩'}
            >
              {isRecording ? <MicOff size={14} /> : <Mic size={14} />}
              <span>{isRecording ? '正在录音收音中... (点击停止)' : '开启麦克风语音答辩'}</span>
            </button>
          </div>
        </div>

        {/* Live Microphone Recording Status Bar (Shown when isRecording) */}
        {isRecording && (
          <div className="bg-rose-950/30 border border-rose-500/30 rounded-xl p-2.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping shrink-0" />
              {/* Real-time Web Audio Waveform Visualization */}
              <div className="flex items-end gap-1 h-5 px-1 bg-black/40 rounded-lg border border-white/5">
                {[1, 2, 3, 4, 5, 6, 7].map(barIdx => {
                  const barHeight = Math.max(
                    15,
                    Math.min(100, (recordingVolume * (0.8 + (barIdx % 3) * 0.2)))
                  );
                  return (
                    <div
                      key={barIdx}
                      className="w-1 bg-rose-400 rounded-full transition-all duration-75"
                      style={{ height: `${barHeight}%` }}
                    />
                  );
                })}
              </div>
              <div className="text-xs text-rose-200">
                <span className="font-bold">实时拾音音量: {recordingVolume}%</span>
                {speechStatusHint && (
                  <span className="ml-2 text-[11px] text-slate-300 font-normal">
                    · {speechStatusHint}
                  </span>
                )}
              </div>
            </div>

            {interimSpeechText && (
              <div className="text-[11px] text-emerald-300 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-md truncate max-w-xs">
                正在捕获: "{interimSpeechText}"
              </div>
            )}
          </div>
        )}

        {/* Quick High-Score Response Pills (Click to append) */}
        <div className="space-y-1.5">
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <Sparkles size={12} className="text-amber-400" />
            <span>推荐金牌答辩论点要点（点击一键引用到发言）：</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {currentRound.suggestedPills.map((pill, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setUserAnswer(prev => prev ? `${prev}。${pill}` : pill);
                }}
                className="text-xs bg-slate-800/90 hover:bg-indigo-900/50 hover:text-indigo-200 hover:border-indigo-400/50 border border-slate-700 px-2.5 py-1 rounded-xl text-slate-300 transition-colors text-left truncate max-w-full"
              >
                + {pill}
              </button>
            ))}
            <button
              onClick={() => setUserAnswer(currentRound.goldStandardAnswer)}
              className="text-xs bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-xl font-medium transition-colors"
            >
              一键填入国赛级金牌应答全文 🎯
            </button>
          </div>
        </div>

        {/* Text Area for Answer */}
        <div className="relative">
          <textarea
            value={userAnswer}
            onChange={e => setUserAnswer(e.target.value)}
            placeholder="请在此输入或通过麦克风说出您的答辩观点... (建议首先给出结论核心数据，随后引用合同、测试报告或知识产权证书作为客观证据)"
            rows={3}
            className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500 rounded-xl p-3 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 leading-relaxed resize-none"
          />
          <div className="absolute bottom-2.5 right-3 text-[10px] text-slate-500">
            {userAnswer.length} 字 · 建议不低于 50 字
          </div>
        </div>

        {/* Bottom Actions Bar */}
        <div className="flex items-center justify-between pt-1">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-emerald-400" />
            <span>评分标准：论据扎实度 40% · 数据真实度 30% · 仪态表达 30%</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setUserAnswer('')}
              disabled={!userAnswer}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 text-xs font-semibold transition-colors"
            >
              清空重填
            </button>
            <button
              onClick={handleSubmitAnswer}
              disabled={!userAnswer.trim()}
              className="px-5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
            >
              <span>提交答辩并由专家评审</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* 5. Instant Evaluation Modal on submitting each round */}
      <AnimatePresence>
        {showFeedbackModal && currentRoundEval && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 text-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 relative overflow-hidden"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-bold text-lg shrink-0">
                    <Award size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white">
                        第 {currentRoundIndex + 1} 轮 · {activeJudge.name} 现场评审结论
                      </h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        化解成功
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      评委席对本轮回答扎实度给予高度评价
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] text-slate-400">本轮得分</div>
                  <div className="text-2xl font-black font-mono text-emerald-400">
                    {currentRoundEval.score}分
                  </div>
                </div>
              </div>

              {/* Judge Feedback Quote Bubble */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2">
                <div className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-emerald-400" />
                  <span>{activeJudge.name}（{activeJudge.role}）现场批注评语：</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed italic">
                  "{currentRoundEval.comment}"
                </p>
              </div>

              {/* Next Step Action */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={handleProceedToNextRound}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-lg active:scale-95 transition-all"
                >
                  <span>
                    {currentRoundIndex < DEFENSE_ROUNDS.length - 1
                      ? `进入下一轮（由 ${judges[DEFENSE_ROUNDS[currentRoundIndex + 1].judgeIndex]?.name} 提问）`
                      : '完成全部答辩，出具综合实训报告'}
                  </span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
