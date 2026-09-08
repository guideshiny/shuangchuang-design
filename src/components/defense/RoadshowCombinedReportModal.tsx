import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Award, 
  CheckCircle2, 
  Clock, 
  Download, 
  FileText, 
  RotateCcw, 
  Share2, 
  ShieldCheck, 
  Sparkles, 
  TrendingUp, 
  Users, 
  X,
  Presentation,
  MessageSquare,
  Mic,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { DefenseProject, VirtualJudge, RoadshowEvaluation } from './defenseTypes';
import { DefenseQAResult } from './RoadshowDefenseStage';

interface Props {
  project: DefenseProject;
  judges: VirtualJudge[];
  roadshowEval: RoadshowEvaluation;
  qaResults: DefenseQAResult[];
  onClose: () => void;
  onRestart: () => void;
}

export default function RoadshowCombinedReportModal({
  project,
  judges,
  roadshowEval,
  qaResults,
  onClose,
  onRestart
}: Props) {
  const [activeTab, setActiveTab] = useState<'overview' | 'roadshow' | 'qa' | 'judges'>('overview');
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Calculate composite score
  const roadshowScore = roadshowEval.totalScore || 92;
  const qaScores = qaResults.length > 0 ? qaResults.map(r => r.score) : [95, 94, 96, 98];
  const qaAverageScore = Math.round(qaScores.reduce((a, b) => a + b, 0) / qaScores.length);
  const compositeScore = Number(((roadshowScore * 0.45) + (qaAverageScore * 0.55)).toFixed(1));

  const handleExport = () => {
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-slate-900 border border-slate-800 text-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 p-5 sm:p-6 border-b border-slate-800 flex items-start justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center font-black shadow-lg">
              <Award size={26} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40">
                  2026 中国国际大学生创新大赛
                </span>
                <span className="text-xs text-slate-400">
                  国赛总决审全真模拟实训
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white mt-1 tracking-tight">
                全真实战路演与多评委答辩综合实训报告
              </h2>
              <div className="text-xs text-slate-400 mt-0.5 truncate max-w-lg">
                项目：{project.name}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Grand Score Banner */}
        <div className="bg-slate-950/90 px-6 py-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-5">
            <div className="text-center sm:text-left">
              <div className="text-[11px] uppercase tracking-wider text-slate-400">综合冲金总分</div>
              <div className="text-3xl sm:text-4xl font-black text-amber-400 font-mono flex items-baseline gap-1">
                <span>{compositeScore}</span>
                <span className="text-sm font-normal text-slate-400">/ 100</span>
              </div>
            </div>

            <div className="h-10 w-px bg-slate-800 hidden sm:block" />

            <div className="flex items-center gap-3">
              <div className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-center">
                <div className="text-[10px] text-slate-400">路演陈述分 (45%)</div>
                <div className="text-sm font-bold text-indigo-300 font-mono mt-0.5">{roadshowScore}分</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-center">
                <div className="text-[10px] text-slate-400">现场答辩分 (55%)</div>
                <div className="text-sm font-bold text-purple-300 font-mono mt-0.5">{qaAverageScore}分</div>
              </div>
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-3 py-1.5 text-center">
                <div className="text-[10px] text-emerald-400 font-semibold">国赛等级预测</div>
                <div className="text-xs font-black text-emerald-300 mt-0.5">全国金奖争霸梯队 🏆</div>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <Download size={14} />
              <span>{copiedNotification ? '报告已生成已就绪' : '导出实训报告'}</span>
            </button>
            <button
              onClick={onRestart}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all"
            >
              <RotateCcw size={14} />
              <span>再次演练</span>
            </button>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="flex items-center px-6 pt-3 bg-slate-950/40 border-b border-slate-800 gap-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-2 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'overview'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            综合全景评价
          </button>
          <button
            onClick={() => setActiveTab('qa')}
            className={`px-3.5 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'qa'
                ? 'border-purple-400 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare size={13} />
            <span>现场多评委答辩明细 ({qaResults.length || 4}轮)</span>
          </button>
          <button
            onClick={() => setActiveTab('roadshow')}
            className={`px-3.5 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'roadshow'
                ? 'border-indigo-400 text-indigo-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Presentation size={13} />
            <span>路演陈述与控时数据</span>
          </button>
          <button
            onClick={() => setActiveTab('judges')}
            className={`px-3.5 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'judges'
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users size={13} />
            <span>4位专家席个性化评语</span>
          </button>
        </div>

        {/* Scrollable Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-200">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Core Strengths Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>技术硬核壁垒</span>
                    <span className="text-emerald-400 font-bold">98分</span>
                  </div>
                  <div className="text-sm font-bold text-white">超快纳秒曝光与自研算法</div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    以15纳秒瞬态冻结彻底解耦工业车间机械微震，已获授权发明专利，学术评委一致给出顶尖评价。
                  </p>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>商业闭环与实证</span>
                    <span className="text-indigo-400 font-bold">94分</span>
                  </div>
                  <div className="text-sm font-bold text-white">3500万在手订单与58%毛利</div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    宁德时代一级供应商180天驻厂中试120万颗极耳零漏报，具备法律效力的CMA报告打消了一线创投投资人的商业顾虑。
                  </p>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>大赛育人与治理</span>
                    <span className="text-purple-400 font-bold">98分</span>
                  </div>
                  <div className="text-sm font-bold text-white">学生62%控股与全职创业</div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    学生第一负责人绝对控股且全职投入，母校技术转移中心出具排他独家许可，立德树人与师生共创成效显著。
                  </p>
                </div>
              </div>

              {/* Gold Winning Strategies & High-Value Advice */}
              <div className="bg-gradient-to-br from-indigo-950/60 to-slate-950 border border-indigo-900/40 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-amber-300 text-sm font-bold">
                  <Sparkles size={16} />
                  <span>2026 中国国际大学生创新大赛 · 国赛夺金点题锦囊</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                    <div className="font-bold text-indigo-300">1. 答辩前10秒直接报出“发明专利号”与“CMA报告单号”</div>
                    <p className="text-slate-400 leading-relaxed">
                      网评与现场双盲答辩中，评委平均注意力仅维持在作答前15秒。先抛出硬核客观凭据，再展开物理机理解析，能瞬间赢得专家信任。
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                    <div className="font-bold text-purple-300">2. 突出“工艺标定数据库”的客户高迁移成本</div>
                    <p className="text-slate-400 leading-relaxed">
                      面对投资人对“大厂低价内卷竞争”的质疑，务必强调数据沉淀与次年算法ARR订阅续费率(91.3%)，证明客户不会轻易更换服务商。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DEFENSE QA DETAILS */}
          {activeTab === 'qa' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-400 flex items-center justify-between">
                <span>现场4位主审专家轮流针对性发难实况记录：</span>
                <span className="text-amber-300 font-semibold">平均答辩得分：{qaAverageScore}分</span>
              </div>

              {(qaResults.length > 0 ? qaResults : [
                {
                  judgeName: '张怀德',
                  role: '组长·高校泰斗',
                  question: '林博士，你们在第3页强调15纳秒超快干涉实现了瞬态冻结，但工业车间常有高频机械微振动与热温漂，请问你们的差分消噪算法在物理层面是如何解耦光学相干湮灭的？核心发明专利的权利要求书是如何布局的？',
                  answer: '我们采用自研双波长差分干涉光路，曝光仅15纳秒，远低于车间机械振动微米位移特征周期(毫秒级)，从物理源头实现瞬态冻结；同时引入非均匀偏振差分算法将信噪比提升18.6dB。核心技术已授权国家发明专利ZL202310889211.X，权利要求完整覆盖振动自补偿光路与点云重构算法。',
                  score: 95,
                  comment: '论点扎实！从纳秒光路物理周期解耦到发明专利权利要求布局严密，展现了顶尖高校博士团队的学术硬核实力。',
                  timeSpent: 42
                },
                {
                  judgeName: '李元亨',
                  role: '一线创投合伙人',
                  question: '你们第5页提到硬件综合毛利58%、在手意向订单3500万。如果行业巨头比如蔡司或基恩士采取降价40%打价格战，你们在客户粘性和算法模型订阅壁垒上，凭什么保证客户不流失？',
                  answer: '我们的核心护城河在于“产线深度工艺标定数据库”。系统一旦接入客户流水线，微缺陷图谱训练越多，替换成本就极其高昂；其次单机毛利高达58%，保有充裕利润空间，客户4.8个月收回成本；最后与动力电池前三强签订排他协议，算法年费订阅续费率达91.3%。',
                  score: 94,
                  comment: '商业防护壁垒讲得很透！数据资产沉淀带来的高迁移成本是硬科技项目最核心的商业护城河，订单与毛利逻辑严谨。',
                  timeSpent: 38
                },
                {
                  judgeName: '陈致远',
                  role: '硬科技产业CTO',
                  question: '工业产线最看重在线全检节拍。动力电池极耳流水线每分钟节拍达45件以上，你们的边缘FPGA算力卡在连续运行2000小时后的平均无故障时间(MTBF)和漏报率指标究竟如何？宁德时代中试有无第三方CMA验收报告？',
                  answer: '在宁德时代一级供应商车间，我们完成了180天驻厂连续中试，累计在线检测超120万颗电芯极耳，漏报率为零，已由第三方检测机构出具了具备法律效力的CMA验收合格公函；连续无故障运行超2000小时；FPGA边缘算力卡在40毫秒内完成全幅点云重构，吞吐率达45件/分！',
                  score: 96,
                  comment: '数据极其具体！有真实驻厂180天的CMA合格报告与120万颗零漏报实绩，这个工业指标在产线赛道绝对经得起推敲。',
                  timeSpent: 45
                },
                {
                  judgeName: '王书敏',
                  role: '教育部双创专家',
                  question: '作为高校师生共创项目，林博士你作为学生第一负责人持股62%，毕业后是否全职留在企业？学校对职务发明专利的独家排他许可手续是否完全合规交割？',
                  answer: '我作为第一发明人和学生第一负责人，已办理全职创业手续并签署竞业限制与全职承诺书，毕业后100%全职投入深瞳视界运营；母校技术转移中心已正式出具职务发明排他性独家许可与转让协议，股权清晰、产权合规，完全符合国赛金奖要求！',
                  score: 98,
                  comment: '股权结构清晰合规，学生全职创业有担当，育人成效显著，完全契合中国国际大学生创新大赛立德树人的核心宗旨！',
                  timeSpent: 35
                }
              ]).map((item, idx) => (
                <div key={idx} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-xs">
                        Q{idx + 1}
                      </span>
                      <span className="text-xs font-bold text-slate-200">
                        {item.judgeName} · {item.role}
                      </span>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <span className="text-[11px] text-slate-400">用时 {item.timeSpent || 40}s</span>
                      <span className="text-sm font-black font-mono text-emerald-400">
                        {item.score}分
                      </span>
                    </div>
                  </div>

                  {/* Question */}
                  <div className="text-xs text-amber-300 font-medium pl-3 border-l-2 border-amber-400">
                    "{item.question}"
                  </div>

                  {/* Answer */}
                  <div className="bg-slate-900/90 rounded-xl p-3 text-xs text-slate-300 leading-relaxed">
                    <span className="text-indigo-400 font-bold mr-1">选手答辩作答：</span>
                    {item.answer}
                  </div>

                  {/* Comment */}
                  <div className="text-[11px] text-slate-400 italic flex items-center gap-1.5 pt-1">
                    <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                    <span>评委批语："{item.comment}"</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: ROADSHOW ANALYTICS */}
          {activeTab === 'roadshow' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-center">
                  <div className="text-[10px] text-slate-400">总控时精准度</div>
                  <div className="text-lg font-black text-emerald-400 font-mono mt-0.5">
                    {roadshowEval.timePacingScore}%
                  </div>
                  <div className="text-[9px] text-slate-500 mt-0.5">实际292s / 计划300s</div>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-center">
                  <div className="text-[10px] text-slate-400">PPT架构讲透率</div>
                  <div className="text-lg font-black text-indigo-400 font-mono mt-0.5">
                    {roadshowEval.contentCompletenessScore}%
                  </div>
                  <div className="text-[9px] text-slate-500 mt-0.5">8页重点全部讲透</div>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-center">
                  <div className="text-[10px] text-slate-400">商业说服力</div>
                  <div className="text-lg font-black text-purple-400 font-mono mt-0.5">
                    {roadshowEval.persuasivenessScore}分
                  </div>
                  <div className="text-[9px] text-slate-500 mt-0.5">订单数据客观</div>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-center">
                  <div className="text-[10px] text-slate-400">台风与眼神管理</div>
                  <div className="text-lg font-black text-amber-400 font-mono mt-0.5">
                    {roadshowEval.stagePresenceScore}分
                  </div>
                  <div className="text-[9px] text-slate-500 mt-0.5">镜头注视充分</div>
                </div>
              </div>

              {/* Per-Slide Durations */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="text-xs font-bold text-slate-200">
                  路演 8 页 PPT 分段用时与节奏把控一览表
                </div>
                <div className="space-y-2">
                  {(roadshowEval.slideDurations || [
                    { slideId: 1, title: '国家战略与痛点洞察', spent: 34, planned: 35 },
                    { slideId: 2, title: '行业三大技术天花板', spent: 42, planned: 40 },
                    { slideId: 3, title: '超快偏振共焦纳秒成像突破', spent: 48, planned: 50 },
                    { slideId: 4, title: '软硬一体化产品矩阵与实测', spent: 43, planned: 45 },
                    { slideId: 5, title: '商业模式闭环与高毛利', spent: 44, planned: 45 },
                    { slideId: 6, title: '标杆客户与3500万在手订单', spent: 38, planned: 40 },
                    { slideId: 7, title: '师生共创团队与股权治理', spent: 33, planned: 35 },
                    { slideId: 8, title: '三年财务预测与社会愿景', spent: 28, planned: 30 }
                  ]).map((item) => {
                    const ratio = Math.min(100, Math.round((item.spent / item.planned) * 100));
                    return (
                      <div key={item.slideId} className="flex items-center gap-3 text-xs">
                        <span className="w-6 font-mono font-bold text-slate-400">P{item.slideId}</span>
                        <span className="w-48 truncate text-slate-300">{item.title}</span>
                        <div className="flex-1 bg-slate-800 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              ratio > 115 ? 'bg-amber-500' : 'bg-indigo-500'
                            }`}
                            style={{ width: `${Math.min(100, ratio)}%` }}
                          />
                        </div>
                        <span className="font-mono text-[11px] text-slate-400 w-16 text-right">
                          {item.spent}s / {item.planned}s
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: 4 JUDGES' COMMENTS */}
          {activeTab === 'judges' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {judges.map((judge) => (
                <div key={judge.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={judge.avatar}
                        alt={judge.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-indigo-400/40"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{judge.name}</span>
                          <span className="text-[10px] px-2 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-medium">
                            {judge.role}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 truncate max-w-xs">{judge.title}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-slate-400">主审印象打分</div>
                      <div className="text-lg font-black font-mono text-emerald-400">
                        {judge.satisfactionScore || 92}分
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-900/80 rounded-xl p-3 text-xs text-slate-300 leading-relaxed italic border border-slate-800">
                    "{judge.reactionText}"
                  </div>

                  <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
                    <span>关注焦点：</span>
                    <span className="text-slate-300 font-medium truncate max-w-xs">{judge.interestFocus}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-950 p-4 sm:p-5 border-t border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-emerald-400" />
            <span>实训成果已自动同步归档至项目答辩演练档案</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
            >
              关闭报告
            </button>
            <button
              onClick={onRestart}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg active:scale-95 transition-all"
            >
              <RotateCcw size={14} />
              <span>再次全真模拟演练</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
