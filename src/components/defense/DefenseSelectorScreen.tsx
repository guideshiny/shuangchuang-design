import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Folder, 
  Settings, 
  X, 
  Info, 
  Play, 
  Clock, 
  History, 
  ChevronRight, 
  Sparkles, 
  SlidersHorizontal,
  Flame,
  Swords,
  ShieldCheck,
  Award,
  Presentation,
  Zap,
  Target
} from 'lucide-react';
import { DefenseProject, ModeDef, DefenseSessionConfig, DefenseHistoryItem } from './defenseTypes';
import { MOCK_DEFENSE_PROJECTS, TRAINING_MODES, RECENT_DEFENSE_HISTORY } from './defenseConstants';

interface Props {
  onStart: (project: DefenseProject, mode: ModeDef, config: DefenseSessionConfig) => void;
  onViewReport: (project: DefenseProject, mode: ModeDef, historyItem?: DefenseHistoryItem) => void;
  initialProject?: DefenseProject;
}

export default function DefenseSelectorScreen({ onStart, onViewReport, initialProject }: Props) {
  const [selectedProject, setSelectedProject] = useState<DefenseProject>(
    initialProject || MOCK_DEFENSE_PROJECTS[0]
  );
  const [selectedMode, setSelectedMode] = useState<ModeDef | null>(TRAINING_MODES[0]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    if (initialProject) {
      setSelectedProject(initialProject);
    }
  }, [initialProject?.id, initialProject?.name]);

  // Configuration state
  const [config, setConfig] = useState<DefenseSessionConfig>({
    judgeMode: 'single',
    difficulty: 'standard',
    rounds: 'unlimited',
    timeLimit: 90,
    elevatorDuration: '1min'
  });

  const handleModeClick = (mode: ModeDef) => {
    setSelectedMode(mode);
    setIsDrawerOpen(true);
    if (mode.id === 'elevator') {
      setConfig((c) => ({ ...c, judgeMode: 'single' }));
    } else if (mode.id === 'followup') {
      setConfig((c) => ({ ...c, judgeMode: 'single', difficulty: 'high_pressure' }));
    } else if (mode.id === 'weakness') {
      setConfig((c) => ({ ...c, judgeMode: 'single' }));
    } else if (mode.id === 'adversarial') {
      setConfig((c) => ({ ...c, judgeMode: 'panel', difficulty: 'high_pressure' }));
    }
  };

  const handleStartWithCurrent = () => {
    if (selectedProject && selectedMode) {
      setIsDrawerOpen(false);
      onStart(selectedProject, selectedMode, config);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-200 border border-indigo-400/30 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5 text-indigo-300" />
            <span>2026大赛评审专家人设与国赛多维大模型实训</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            模拟评审与答辩训练舱
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            还原全国大学生创新大赛金奖争夺现场！支持载入当前参赛项目及历届标杆案例，通过高压追问、电梯演讲与极限反驳训练，生成六维能力雷达与专家级改进方案。
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-indigo-200">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>六维能力雷达动态评估</span>
            </div>
            <span className="text-slate-600">•</span>
            <div className="flex items-center gap-1.5">
              <Swords className="h-4 w-4 text-rose-400" />
              <span>投资人/学术评委挑剔风格</span>
            </div>
            <span className="text-slate-600">•</span>
            <div className="flex items-center gap-1.5">
              <Award className="h-4 w-4 text-amber-400" />
              <span>答辩复盘与失分点专项补强</span>
            </div>
          </div>

          {/* Current Active Linked Project from Sidebar */}
          <div className="pt-2 flex flex-wrap items-center gap-2.5">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-xs border border-white/20 text-xs text-white">
              <Folder size={14} className="text-amber-400 shrink-0" />
              <span>当前答辩实训项目：</span>
              <span className="font-bold text-amber-300">{selectedProject.name}</span>
              <span className="text-[11px] text-indigo-200">({selectedProject.track})</span>
            </div>
            <span className="text-[11px] text-slate-300">
              · 已通过左侧项目栏全局联动，评委人设与靶向题库已定向匹配
            </span>
          </div>
        </div>
      </div>

      {/* Roadshow Highlight Feature Card */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-2xl p-4 sm:p-5 text-white shadow-md border border-purple-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-400/30 text-purple-300 flex items-center justify-center shrink-0">
            <Presentation size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-400/25 text-purple-200 border border-purple-300/30">
                重磅新升级 · 2026国赛标准
              </span>
              <h3 className="text-sm sm:text-base font-bold text-white">
                全真模拟路演讲台 (Roadshow Arena)
              </h3>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              配备 16:9 投影大屏、智能金奖逐页提词、脱稿记忆锚点、评委席神态动态反馈与答辩无缝转场
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            const roadshowMode = TRAINING_MODES.find(m => m.id === 'roadshow') || TRAINING_MODES[0];
            setSelectedMode(roadshowMode);
            const roadshowConf: DefenseSessionConfig = {
              ...config,
              roadshowDuration: '5min',
              teleprompterMode: 'full_script',
              autoTransitionToQA: true
            };
            setConfig(roadshowConf);
            onStart(selectedProject, roadshowMode, roadshowConf);
          }}
          className="shrink-0 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"
        >
          <Play size={14} className="fill-current" />
          <span>立即登台演练路演</span>
        </button>
      </div>

      {/* Mode Selection */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <SlidersHorizontal size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">选择实训模式与配置</h2>
              <p className="text-xs text-slate-500">点击模式卡片可展开右侧详细参数配置（轮次、单题时限、评委风格）并启动答辩</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {TRAINING_MODES.map((mode) => {
            const isSelected = selectedMode?.id === mode.id;
            const Icon = mode.icon;
            return (
              <div
                key={mode.id}
                onClick={() => handleModeClick(mode)}
                className={`relative rounded-2xl p-5 cursor-pointer transition-all duration-200 border flex flex-col justify-between ${
                  isSelected
                    ? 'bg-white border-indigo-600 shadow-md ring-2 ring-indigo-500/10'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
                }`}
              >
                {mode.badge && (
                  <span
                    className={`absolute top-3.5 right-3.5 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      mode.badge === '推荐'
                        ? 'bg-indigo-100 text-indigo-700'
                        : mode.badge === '速通'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {mode.badge}
                  </span>
                )}

                <div>
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                    style={{ backgroundColor: mode.bg, color: mode.text }}
                  >
                    <Icon size={20} />
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 mb-1.5">{mode.name}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 mb-4">
                    {mode.description}
                  </p>
                </div>

                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <div className="flex flex-wrap gap-1">
                    {mode.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] text-slate-600 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200/60 font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <button
                    type="button"
                    className={`w-full py-1.5 px-3 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1 ${
                      isSelected
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <Settings size={13} />
                    <span>{isSelected ? '配置参数并开始' : '选择模式'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Recent Training History */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
              <History size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">实训历史与复盘记录</h2>
              <p className="text-xs text-slate-500">点击历史记录可直接查看往期实训生成的六维雷达与专家改进建议报告</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {RECENT_DEFENSE_HISTORY.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                const proj = MOCK_DEFENSE_PROJECTS.find((p) => p.id === item.projectId) || selectedProject;
                const m = TRAINING_MODES.find((mode) => mode.id === item.modeId) || TRAINING_MODES[0];
                onViewReport(proj, m, item);
              }}
              className="bg-white border border-slate-200/80 hover:border-indigo-300 hover:shadow-xs rounded-2xl p-4 cursor-pointer transition-all flex flex-col justify-between group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">{item.modeName}</span>
                  <span className="text-[11px] font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                    {item.score ? `${item.score}分` : '已复盘'}
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                  {item.projectName}
                </p>
                <p className="text-[11px] text-slate-400">{item.stats}</p>
              </div>

              <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 text-[11px] text-slate-400">
                <span>{item.date}</span>
                <span className="text-indigo-600 font-medium group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                  查看报告 <ChevronRight size={13} />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Mode Configuration Drawer (Slide-Over) */}
      <AnimatePresence>
        {isDrawerOpen && selectedMode && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 transition-opacity"
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-white border-l border-slate-200 z-50 shadow-2xl flex flex-col justify-between p-6 sm:p-8 overflow-y-auto"
            >
              <div className="space-y-6">
                {/* Drawer Header */}
                <div className="flex items-start justify-between pb-5 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: selectedMode.bg, color: selectedMode.text }}
                    >
                      <selectedMode.icon size={22} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900">{selectedMode.name}</h3>
                        {selectedMode.badge && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                            {selectedMode.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {selectedMode.id === 'elevator'
                          ? '配置极速演讲时长与高密度表达节奏'
                          : ['followup', 'weakness', 'adversarial'].includes(selectedMode.id)
                          ? '配置本次专项质询的答辩轮次与作答时限'
                          : selectedMode.id === 'roadshow'
                          ? '配置路演排位时限与提词辅导模式'
                          : '配置本次演练的评委参数与对抗烈度'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsDrawerOpen(false)}
                    className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Selected Project Card in Drawer */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">已选答辩项目</span>
                  <div className="text-xs font-bold text-slate-900 truncate">{selectedProject.name}</div>
                  <div className="text-[11px] text-slate-500">{selectedProject.track}</div>
                </div>

                {/* Configuration Options */}
                <div className="space-y-5">
                  {/* Mode-specific context banner */}
                  {selectedMode.id === 'elevator' && (
                    <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2.5">
                      <Zap size={16} className="text-amber-600 shrink-0 mt-0.5" />
                      <div className="leading-relaxed">
                        <span className="font-bold">电梯演讲模式：</span>
                        聚焦极速高密度自主陈述与商业壁垒提炼，无需配置评委席位；演练结束后将自动输出六维表达力与痛点清晰度分析报告。
                      </div>
                    </div>
                  )}

                  {selectedMode.id === 'followup' && (
                    <div className="bg-sky-50/80 border border-sky-200/80 rounded-xl p-3 text-xs text-sky-900 flex items-start gap-2.5">
                      <Target size={16} className="text-sky-600 shrink-0 mt-0.5" />
                      <div className="leading-relaxed">
                        <span className="font-bold">评委预置：</span>
                        系统已自动选定国赛资深常委专家，锁定申报书单一核心逻辑漏洞连环下钻追问，无需手动配置评委席位。
                      </div>
                    </div>
                  )}

                  {selectedMode.id === 'weakness' && (
                    <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-xl p-3 text-xs text-emerald-900 flex items-start gap-2.5">
                      <Flame size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                      <div className="leading-relaxed">
                        <span className="font-bold">评委预置：</span>
                        系统已读取项目对标评测画像，定向匹配薄弱维度专项评委（技术壁垒/商业落地/财务测算）展开精准突击。
                      </div>
                    </div>
                  )}

                  {selectedMode.id === 'adversarial' && (
                    <div className="bg-rose-50/80 border border-rose-200/80 rounded-xl p-3 text-xs text-rose-900 flex items-start gap-2.5">
                      <Swords size={16} className="text-rose-600 shrink-0 mt-0.5" />
                      <div className="leading-relaxed">
                        <span className="font-bold">评委预置：</span>
                        系统已锁定挑剔型一线硬科技投资人与严苛国赛评审专家，全程进行极限抗辩与对抗性质询。
                      </div>
                    </div>
                  )}

                  {/* Judge Mode (评委席规模 / 评委选择)：电梯演讲、高压追问、弱项突击、对抗性演练均不显示 */}
                  {!['elevator', 'followup', 'weakness', 'adversarial', 'roadshow'].includes(selectedMode.id) && (
                    <div>
                      <label className="text-xs font-bold text-slate-800 block mb-2">评委选择 / 席位规模</label>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { id: 'single', label: '单主审评委', sub: '自动匹配对应赛道首席专家' },
                          { id: 'panel', label: '3人联合评委席', sub: '投资人 + 产业学者 + 财务法务' }
                        ].map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setConfig((c) => ({ ...c, judgeMode: item.id as any }))}
                            className={`p-3 rounded-xl border text-left transition-all ${
                              config.judgeMode === item.id
                                ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900'
                                : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                            }`}
                          >
                            <div className="text-xs font-bold">{item.label}</div>
                            <div className="text-[11px] text-slate-400 mt-0.5">{item.sub}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Difficulty Style (仅非电梯演讲、非路演显示) */}
                  {!['elevator', 'roadshow'].includes(selectedMode.id) && (
                    <div>
                      <label className="text-xs font-bold text-slate-800 block mb-2">评委质询风格与烈度</label>
                      <div className="grid grid-cols-3 gap-2.5">
                        {[
                          { id: 'friendly', title: '温和肯定', sub: '先鼓励再提建议' },
                          { id: 'standard', title: '标准专业', sub: '中立直奔核心漏洞' },
                          { id: 'high_pressure', title: '高压刁难', sub: '连环抓痛脚极限施压' }
                        ].map((s) => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => setConfig((c) => ({ ...c, difficulty: s.id as any }))}
                            className={`p-3 rounded-xl border text-center transition-all ${
                              config.difficulty === s.id
                                ? 'border-indigo-600 bg-indigo-50/60 text-indigo-900 font-bold'
                                : 'border-slate-200 bg-white hover:border-slate-300 text-slate-600'
                            }`}
                          >
                            <div className="text-xs">{s.title}</div>
                            <div className="text-[10px] text-slate-400 mt-0.5">{s.sub}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Mode-specific: Roadshow or Elevator Pitch or Standard QA */}
                  {selectedMode.id === 'roadshow' ? (
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-bold text-slate-800 block mb-2">国赛路演标准时限</label>
                        <div className="grid grid-cols-2 gap-2.5">
                          {[
                            { id: '3min', label: '3分钟极速路演', sub: '校赛初选/电梯快报标准' },
                            { id: '5min', label: '5分钟金牌标准', sub: '省赛决赛/复赛官方标准' },
                            { id: '8min', label: '8分钟国赛总决选', sub: '全国总决赛排位赛标准' },
                            { id: '10min', label: '10分钟产业资本路演', sub: '天使/VC高密度尽调标准' }
                          ].map((d) => (
                            <button
                              key={d.id}
                              type="button"
                              onClick={() => setConfig((c) => ({ ...c, roadshowDuration: d.id as any }))}
                              className={`p-3 rounded-xl border text-left transition-all ${
                                (config.roadshowDuration || '5min') === d.id
                                  ? 'border-purple-600 bg-purple-50 text-purple-950 font-bold'
                                  : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                              }`}
                            >
                              <div className="text-xs font-bold">{d.label}</div>
                              <div className="text-[10px] text-slate-500 mt-0.5">{d.sub}</div>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-800 block mb-2">提词辅助模式</label>
                        <div className="grid grid-cols-2 gap-2.5">
                          {[
                            { id: 'full_script', label: '国赛金奖完整讲稿', sub: '提供逐字稿、记忆锚点与推荐语速' },
                            { id: 'bullets', label: '脱稿要点提词', sub: '只提示核心数据与关键论点' }
                          ].map((m) => (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => setConfig((c) => ({ ...c, teleprompterMode: m.id as any }))}
                              className={`p-3 rounded-xl border text-left transition-all ${
                                (config.teleprompterMode || 'full_script') === m.id
                                  ? 'border-purple-600 bg-purple-50 text-purple-950 font-bold'
                                  : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                              }`}
                            >
                              <div className="text-xs font-bold">{m.label}</div>
                              <div className="text-[10px] text-slate-500 mt-0.5">{m.sub}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : selectedMode.id === 'elevator' ? (
                    <div>
                      <label className="text-xs font-bold text-slate-800 block mb-2">演讲陈述时长</label>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { id: '1min', label: '1分钟极速版 (60秒)', sub: '痛点+核心解法+壁垒' },
                          { id: '3min', label: '3分钟标准版 (180秒)', sub: '完整商业价值主张闭环' }
                        ].map((d) => (
                          <button
                            key={d.id}
                            type="button"
                            onClick={() => setConfig((c) => ({ ...c, elevatorDuration: d.id as any }))}
                            className={`p-3 rounded-xl border text-left transition-all ${
                              config.elevatorDuration === d.id
                                ? 'border-amber-500 bg-amber-50/60 text-amber-900 font-bold'
                                : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                            }`}
                          >
                            <div className="text-xs font-bold">{d.label}</div>
                            <div className="text-[11px] text-slate-400 mt-0.5">{d.sub}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="text-xs font-bold text-slate-800 block mb-2">问答轮次</label>
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { id: 'unlimited', label: '自然控场' },
                          { id: '3', label: '3 题' },
                          { id: '5', label: '5 题' },
                          { id: '8', label: '8 题' }
                        ].map((r) => (
                          <button
                            key={r.id}
                            type="button"
                            onClick={() => setConfig((c) => ({ ...c, rounds: r.id as any }))}
                            className={`py-2 px-1 rounded-xl border text-xs font-medium transition-all ${
                              config.rounds === r.id
                                ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-bold'
                                : 'border-slate-200 bg-white hover:border-slate-300 text-slate-600'
                            }`}
                          >
                            {r.label}
                          </button>
                        ))}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1.5">
                        自然控场：评委视答辩表现自主把控深度，问透即收尾，亦可随时提前交卷。
                      </p>
                    </div>
                  )}

                  {/* Per Question Time Limit (仅非路演、非电梯演讲显示) */}
                  {!['roadshow', 'elevator'].includes(selectedMode.id) && (
                    <div>
                      <label className="text-xs font-bold text-slate-800 block mb-2">单题回答时限</label>
                      <div className="grid grid-cols-3 gap-2.5">
                        {[60, 90, 120].map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setConfig((c) => ({ ...c, timeLimit: t }))}
                            className={`py-2 rounded-xl border text-xs font-medium transition-all ${
                              config.timeLimit === t
                                ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-bold'
                                : 'border-slate-200 bg-white hover:border-slate-300 text-slate-600'
                            }`}
                          >
                            {t} 秒
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Drawer Bottom Actions */}
              <div className="pt-6 border-t border-slate-100 space-y-2">
                <button
                  type="button"
                  onClick={handleStartWithCurrent}
                  className="w-full py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <Play size={16} className="fill-current" />
                  <span>进入 {selectedMode.name} 训练舱</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="w-full py-2.5 text-xs text-slate-500 hover:text-slate-700 font-medium"
                >
                  暂不开始，返回修改
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
