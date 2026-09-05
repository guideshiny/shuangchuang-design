/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Cpu, Compass, CheckCircle2, AlertCircle, Edit3, 
  Sparkles, History, HelpCircle, ThumbsUp, ChevronRight, ArrowRight,
  TrendingUp, RefreshCw, Layers, Lightbulb
} from 'lucide-react';
import { Project, Chapter } from '../types';

interface SceneCoachingProps {
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
}

export default function SceneCoaching({ projects, setProjects }: SceneCoachingProps) {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('p-1');
  const [activeChapterId, setActiveChapterId] = useState<string>('c-1');
  const [isDiagnosing, setIsDiagnosing] = useState<boolean>(false);
  const [isReviewing, setIsReviewing] = useState<boolean>(false);

  const selectedProject = projects.find(p => p.id === selectedProjectId) || projects[0];
  const activeChapter = selectedProject.chapters.find(c => c.id === activeChapterId) || selectedProject.chapters[0];

  // Temporary edit content for the text area
  const [editorContent, setEditorContent] = useState<string>(activeChapter?.content || '');

  React.useEffect(() => {
    if (activeChapter) {
      setEditorContent(activeChapter.content);
    }
  }, [activeChapterId, selectedProjectId]);

  const handleDiagnose = () => {
    setIsDiagnosing(true);
    setTimeout(() => {
      setIsDiagnosing(false);
    }, 1500);
  };

  const handleReviewChapter = () => {
    setIsReviewing(true);
    
    // Simulate an AI review which upgrades the score, refines critique, and adds a revision history point!
    setTimeout(() => {
      setIsReviewing(false);

      setProjects(prev => prev.map(p => {
        if (p.id === selectedProject.id) {
          // Find current chapter
          const updatedChapters = p.chapters.map(c => {
            if (c.id === activeChapter.id) {
              // Increase score and polish feedback
              const oldScore = c.score;
              const newScore = Math.min(98, oldScore + 5);
              return {
                ...c,
                content: editorContent,
                score: newScore,
                feedback: `【AI智能校准：${newScore}分 · 新修订版本】\n您的修改非常好！新增了具体的试点论证和客观对比数据。针对之前的弱项进行了深度弥补。技术细节描述更加通俗易懂，极易获得跨界评委的好评。目前「执行摘要」部分已基本具备冲金实力！`
              };
            }
            return c;
          });

          // Calculate new composite score
          const sum = updatedChapters.reduce((acc, chap) => acc + chap.score, 0);
          const newAvg = Math.round(sum / updatedChapters.length);

          return {
            ...p,
            score: newAvg,
            grade: newAvg >= 90 ? 'A' : newAvg >= 75 ? 'B' : 'C',
            chapters: updatedChapters,
            revisions: [
              ...p.revisions,
              {
                version: `V${p.revisions.length + 1}`,
                date: new Date().toISOString().split('T')[0],
                score: newAvg,
                changes: `通过 逐章节指导工作室 修订了「${activeChapter.title}」。分值由 ${activeChapter.score} 提升至 ${Math.min(98, activeChapter.score + 5)} 分。`
              }
            ]
          };
        }
        return p;
      }));
    }, 1200);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-bold tracking-wider uppercase text-gray-400">Scene 2 · P0 核心链路</span>
          <h1 className="font-display font-semibold text-3xl md:text-5xl tracking-tight text-gray-900 mt-1">诊断与指导工作室</h1>
          <p className="text-gray-500 text-sm mt-2 max-w-3xl">
            专为参赛团队设计。通过与AI教练的互动对话建立多维项目成熟度模型（L1-L4），并按照评委金奖指标逐章节撰写、润色与迭代商业计划书（BP），全程拒绝套路模板，见证能力跨越。
          </p>
        </div>

        {/* Project switcher */}
        <div className="flex items-center space-x-2 bg-white p-1.5 rounded-full border border-gray-200 shadow-sm">
          <span className="text-xs text-gray-500 pl-3">当前项目:</span>
          <select
            value={selectedProjectId}
            onChange={(e) => {
              setSelectedProjectId(e.target.value);
              // reset active chapter to first of new project
              const nextProj = projects.find(p => p.id === e.target.value);
              if (nextProj && nextProj.chapters.length > 0) {
                setActiveChapterId(nextProj.chapters[0].id);
              }
            }}
            className="bg-gray-100 text-gray-800 text-xs font-semibold py-1 px-3 rounded-full border-0 focus:ring-1 focus:ring-gray-300 focus:outline-none"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name.length > 15 ? p.name.substring(0, 15) + '...' : p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid Layout: Left Diagnosis / Right Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Diagnosis Hub & Chapter Progress Tracker */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Project Diagnosis Hub */}
          <div className="p-5 rounded-[24px] border border-gray-200 bg-white space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-semibold text-gray-500 flex items-center">
                <Compass className="h-4 w-4 mr-1.5 text-gray-400" />
                项目当前成熟度模型
              </h3>
              <button
                onClick={handleDiagnose}
                disabled={isDiagnosing}
                className="text-[10px] bg-gray-50 border border-gray-200 text-gray-600 px-2.5 py-1 rounded-full hover:bg-gray-100 flex items-center space-x-1 font-medium shadow-sm"
              >
                <RefreshCw className={`h-2.5 w-2.5 ${isDiagnosing ? 'animate-spin' : ''}`} />
                <span>{isDiagnosing ? '诊断中...' : '重新评估'}</span>
              </button>
            </div>

            {/* Diagnostic readout */}
            <div className="flex items-center space-x-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div className="h-14 w-14 rounded-full bg-white border border-gray-200 flex flex-col items-center justify-center relative shadow-sm">
                <span className="text-2xl font-display font-semibold text-gray-900 leading-none">{selectedProject.status}</span>
                <span className="text-[8px] text-gray-400 font-mono mt-1">PHASE</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-gray-800">
                  {selectedProject.status === 'L1' ? '探索期 (Idea Stage)' :
                   selectedProject.status === 'L2' ? '概念期 (Concept Validation)' :
                   selectedProject.status === 'L3' ? '方案期 (Scheme Draft)' :
                   '成熟期 (Ready for Roadshow)'}
                </span>
                <p className="text-[10px] text-gray-500 leading-tight">
                  {selectedProject.status === 'L3' ? '核心方案已具备，正在进行材料打磨与消融实验补充。' : '商业模式已基本跑通，可进行全真模拟答辩训练。'}
                </p>
              </div>
            </div>

            {/* Gap Analysis and Roadmap List */}
            <div className="space-y-2 text-xs">
              <span className="text-[10px] font-mono text-gray-400 block">系统标记需补足缺陷清单</span>
              
              <div className="space-y-1.5 font-light">
                {selectedProject.id === 'p-1' ? (
                  <>
                    <div className="flex items-start space-x-2 text-gray-600">
                      <AlertCircle className="h-3.5 w-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <p>商业闭环推导偏向主观，500套销售假设离谱（L3缺陷）</p>
                    </div>
                    <div className="flex items-start space-x-2 text-gray-600">
                      <AlertCircle className="h-3.5 w-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <p>消融实验在极高噪声伪影下的数据对比不明确（L3缺陷）</p>
                    </div>
                  </>
                ) : (
                  <div className="flex items-start space-x-2 text-gray-600">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <p>已通过L3级技术验证与大样本真实世界临床核证，进入L4成熟期。</p>
                  </div>
                )}
              </div>
            </div>

            {/* Simulated mini track history chart */}
            <div className="pt-3 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
              <span className="flex items-center">
                <TrendingUp className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                迭代分值走势:
              </span>
              <div className="flex items-center space-x-1 font-mono font-semibold">
                {selectedProject.revisions.map((rev, idx) => (
                  <React.Fragment key={idx}>
                    <span className="text-gray-700">{rev.score}分</span>
                    {idx < selectedProject.revisions.length - 1 && <span className="text-gray-300">→</span>}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          {/* Chapter selector navigation list */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-gray-700 block">商业计划书 (BP) 章节进度</span>
            <div className="space-y-1">
              {selectedProject.chapters.map((chap) => {
                const isActive = chap.id === activeChapterId;
                return (
                  <div
                    key={chap.id}
                    onClick={() => setActiveChapterId(chap.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer text-left transition-all flex items-center justify-between ${
                      isActive 
                        ? 'bg-white border-blue-500 shadow-md ring-1 ring-blue-500/15' 
                        : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-semibold text-gray-900 leading-none">{chap.title}</h4>
                      <span className="text-[10px] text-gray-400 font-mono">
                        {chap.score >= 90 ? '冲金状态' : chap.score >= 75 ? '良好·建议润色' : '急需优化'}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-bold text-gray-700">{chap.score}分</span>
                      <ChevronRight className="h-3 w-3 text-gray-400" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Revision History Log */}
          <div className="p-4 rounded-xl border border-gray-200 bg-white space-y-2 shadow-sm">
            <h4 className="text-xs font-mono font-semibold text-gray-500 flex items-center">
              <History className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
              项目修订日志 ({selectedProject.revisions.length})
            </h4>
            <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
              {selectedProject.revisions.slice().reverse().map((rev, idx) => (
                <div key={idx} className="text-[10px] border-l border-gray-200 pl-2.5 pb-2 last:pb-0 space-y-0.5">
                  <div className="flex justify-between text-gray-400 font-mono">
                    <span>{rev.version} 版本 ({rev.date})</span>
                    <span className="text-gray-700 font-bold">{rev.score}分</span>
                  </div>
                  <p className="text-gray-500 leading-normal font-light">{rev.changes}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Side: Step-by-Step Writing Workstation */}
        <div className="lg:col-span-8 space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeChapter.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="rounded-[24px] border border-gray-200 bg-white p-6 space-y-6 shadow-sm"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-100 pb-5">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded border border-gray-200/60 uppercase">
                    Chapter Coached Module
                  </span>
                  <h2 className="font-display font-semibold text-xl text-gray-900 mt-1">
                    正在指导: {activeChapter.title}
                  </h2>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-gray-400 block">本章节得分</span>
                  <span className="font-mono text-xl font-bold text-gray-900">{activeChapter.score} <span className="text-xs text-gray-400 font-normal">/100</span></span>
                </div>
              </div>

              {/* Coach Guidelines Cards (Accordion feel) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* What Judges Look For */}
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100/60 space-y-1.5 shadow-sm">
                  <h4 className="text-[11px] font-mono font-semibold text-gray-700 flex items-center">
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1.5 text-[#0071E3]" />
                    评委金奖评判红线 (What Judges Look For)
                  </h4>
                  <p className="text-[11px] text-gray-500 leading-relaxed font-light">
                    {activeChapter.whatJudgesLookFor}
                  </p>
                </div>

                {/* Common Pitfalls */}
                <div className="p-4 rounded-xl bg-red-50/50 border border-red-100 space-y-1.5 shadow-sm">
                  <h4 className="text-[11px] font-mono font-semibold text-red-600 flex items-center">
                    <AlertCircle className="h-3.5 w-3.5 mr-1.5 text-red-500" />
                    常见致命扣分重灾区 (Common Pitfalls)
                  </h4>
                  <p className="text-[11px] text-gray-500 leading-relaxed font-light">
                    {activeChapter.commonPitfalls}
                  </p>
                </div>

              </div>

              {/* Content Editor */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono font-semibold text-gray-500 flex items-center">
                    <Edit3 className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                    草稿工作区 (输入或润色内容)
                  </label>
                  <span className="text-[10px] text-gray-400 font-mono">
                    字符数: {editorContent.length}
                  </span>
                </div>

                <textarea
                  rows={8}
                  value={editorContent}
                  onChange={(e) => setEditorContent(e.target.value)}
                  placeholder="在此处输入或修订您的章节内容..."
                  className="w-full p-4 rounded-xl bg-white border border-gray-200 text-xs text-gray-900 placeholder-gray-400 leading-relaxed font-light focus:outline-none focus:border-gray-300 focus:ring-1 focus:ring-gray-200 transition-all shadow-inner"
                />
              </div>

              {/* Active Coach Feedback Output */}
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-2 shadow-sm">
                <h4 className="text-xs font-mono font-semibold text-gray-500 flex items-center">
                  <Sparkles className="h-3.5 w-3.5 mr-1.5 text-blue-500" />
                  AI教练实时诊断批注
                </h4>
                <p className="text-[11px] text-gray-700 leading-relaxed font-light whitespace-pre-wrap">
                  {activeChapter.feedback}
                </p>
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-between border-t border-gray-100 pt-5">
                <div className="flex items-center space-x-2 text-[11px] text-gray-400">
                  <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
                  <span>修改后点击AI诊断可提升估算得分并更新批注。</span>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setEditorContent(activeChapter.content)}
                    className="px-4 py-1.5 rounded-full text-xs text-gray-500 hover:text-gray-900 transition-colors font-medium"
                  >
                    撤销修改
                  </button>
                  <button
                    onClick={handleReviewChapter}
                    disabled={isReviewing}
                    className="flex items-center space-x-1.5 bg-[#0071E3] text-white px-5 py-2 rounded-full text-xs font-semibold hover:bg-[#0077ED] transition-transform active:scale-[0.98] disabled:opacity-50 shadow-sm shadow-blue-500/15"
                  >
                    <Cpu className={`h-3.5 w-3.5 ${isReviewing ? 'animate-spin' : ''}`} />
                    <span>{isReviewing ? 'AI正在全面评估...' : '启动 AI 诊断并评分'}</span>
                  </button>
                </div>
              </div>

            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
