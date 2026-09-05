/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, User, AlertTriangle, Play, Send, 
  HelpCircle, BarChart3, Award, RefreshCw, ThumbsUp, ShieldAlert, Zap 
} from 'lucide-react';
import { Project, MockQASession, Message } from '../types';
import { mockInterviews } from '../data/mockData';

interface SceneMockQAProps {
  projects: Project[];
}

export default function SceneMockQA({ projects }: SceneMockQAProps) {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('p-1');
  const [activePersonaId, setActivePersonaId] = useState<string>('investor');
  const [difficulty, setDifficulty] = useState<'basic' | 'medium' | 'hard'>('medium');
  const [session, setSession] = useState<MockQASession | null>(null);
  
  // Current user typing answer
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);

  const selectedProject = projects.find(p => p.id === selectedProjectId) || projects[0];
  const persona = mockInterviews[activePersonaId] || mockInterviews.investor;

  // Initialize/Start Q&A Session
  const handleStartSession = () => {
    const initialQuestion = persona.questions[0];
    const initialMessages: Message[] = [
      {
        id: 'msg-init-0',
        sender: 'ai',
        text: `【答辩会正式开始】我是本次评审会的主委 ${persona.personaName}。我已经审阅了你们关于「${selectedProject.name}」的全部材料。\n\n我们将直接进入提问。我的第一题是：\n\n${initialQuestion}`,
        timestamp: new Date().toLocaleTimeString()
      }
    ];

    setSession({
      id: `session-${Date.now()}`,
      projectId: selectedProjectId,
      projectName: selectedProject.name,
      persona: activePersonaId,
      personaTitle: persona.personaTitle,
      personaStyle: persona.personaStyle,
      difficulty: difficulty,
      status: 'running',
      currentQuestionIndex: 0,
      questions: persona.questions,
      answers: [],
      scores: [],
      feedbacks: [],
      messages: initialMessages
    });

    setUserAnswer('');
  };

  // Submit Answer
  const handleSubmitAnswer = () => {
    if (!session || !userAnswer.trim() || isEvaluating) return;

    setIsEvaluating(true);

    const updatedMessages = [
      ...session.messages,
      {
        id: `msg-usr-${Date.now()}`,
        sender: 'user' as const,
        text: userAnswer,
        timestamp: new Date().toLocaleTimeString()
      }
    ];

    setSession(prev => prev ? { ...prev, messages: updatedMessages } : null);

    // AI evaluates the answer based on persona evaluation rules
    setTimeout(() => {
      const evaluation = persona.evaluateResponse(session.currentQuestionIndex, userAnswer);
      
      const qIndex = session.currentQuestionIndex;
      const isLastQuestion = qIndex >= persona.questions.length - 1;

      let nextMessages = [
        ...updatedMessages,
        {
          id: `msg-ai-eval-${Date.now()}`,
          sender: 'ai' as const,
          text: `【AI评委判定：${evaluation.score}分】\n${evaluation.criticism}`,
          timestamp: new Date().toLocaleTimeString(),
          score: evaluation.score,
          criticism: evaluation.criticism
        }
      ];

      if (!isLastQuestion) {
        nextMessages.push({
          id: `msg-ai-q-${Date.now()}`,
          sender: 'ai' as const,
          text: `好的，我的下一题是：\n\n${evaluation.followUp || persona.questions[qIndex + 1]}`,
          timestamp: new Date().toLocaleTimeString()
        });
      } else {
        nextMessages.push({
          id: `msg-ai-end-${Date.now()}`,
          sender: 'ai' as const,
          text: `【问答模拟已全部结束】\n感谢你的回答，评委团将在后台汇总多轮应答表现。综合报告卡已在下方生成，您可以针对薄弱环节回去精研修改您的申报书。`,
          timestamp: new Date().toLocaleTimeString()
        });
      }

      setSession(prev => {
        if (!prev) return null;
        return {
          ...prev,
          currentQuestionIndex: isLastQuestion ? qIndex : qIndex + 1,
          answers: [...prev.answers, userAnswer],
          scores: [...prev.scores, evaluation.score],
          feedbacks: [...prev.feedbacks, evaluation.criticism],
          status: isLastQuestion ? 'completed' : 'running',
          messages: nextMessages
        };
      });

      setUserAnswer('');
      setIsEvaluating(false);
    }, 1500);
  };

  // Calculate stats for the completed card
  const avgScore = session && session.scores.length > 0 
    ? Math.round(session.scores.reduce((a, b) => a + b, 0) / session.scores.length)
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <span className="text-xs font-mono font-bold tracking-wider uppercase text-gray-400">Scene 3 · P1 核心链路</span>
        <h1 className="font-display font-semibold text-3xl md:text-5xl tracking-tight text-gray-900 mt-1">模拟答辩工坊</h1>
        <p className="text-gray-500 text-sm mt-2 max-w-3xl">
          答辩是冲金最核心的一战。系统搭载了“评委人格矩阵”与“动态追问引擎”，根据您的项目量身生成刁难和追问。在毫无准备的即兴问答中练习，让您上台前已经受过百次锤炼。
        </p>
      </div>

      {/* Main Workspace split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left column: Setup Suite (if not running) or Summary of current session */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-5 rounded-[24px] border border-gray-200 bg-white space-y-5 text-left shadow-sm">
            <h3 className="text-xs font-mono font-semibold text-gray-500 flex items-center">
              <Zap className="h-4 w-4 mr-1.5 text-blue-500" />
              答辩配置中心 (Setup Config)
            </h3>

            {/* Project Switcher */}
            <div className="space-y-1">
              <label className="text-[11px] text-gray-400 font-mono">1. 选择演练项目</label>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                disabled={session?.status === 'running'}
                className="w-full bg-gray-50 text-gray-800 text-xs py-2 px-3 rounded-xl border border-gray-200 focus:ring-1 focus:ring-gray-300 focus:outline-none"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Persona selectors */}
            <div className="space-y-2">
              <label className="text-[11px] text-gray-400 font-mono block">2. 指定主考评审人设</label>
              <div className="space-y-2">
                {[
                  { id: 'investor', name: '陆一鸣 · 资深投资人', desc: '星海创投合伙人。极度看重商业闭环、采购决策流与盈利真实性。不吃口号。', bg: 'bg-indigo-600' },
                  { id: 'expert', name: '顾建国 · 技术教授', desc: '主研、博士生导师。揪底代码套壳、数据集来源合规性、消融实验论证。', bg: 'bg-teal-700' }
                ].map((p) => {
                  const isActive = activePersonaId === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => session?.status !== 'running' && setActivePersonaId(p.id)}
                      className={`p-3 rounded-xl border transition-all ${
                        session?.status === 'running' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                      } ${
                        isActive 
                          ? 'bg-gray-50 border-blue-500 shadow-sm ring-1 ring-blue-500/15' 
                          : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <div className={`h-6 w-6 rounded-full ${p.bg} flex items-center justify-center text-[10px] font-bold text-white`}>
                          {p.name[0]}
                        </div>
                        <span className="text-xs font-semibold text-gray-900">{p.name}</span>
                      </div>
                      <p className="text-[10px] text-gray-500 leading-normal mt-1.5 font-light pl-8">
                        {p.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Difficulty select */}
            <div className="space-y-1">
              <label className="text-[11px] text-gray-400 font-mono">3. 设定提问挑战难度</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'basic', label: '友好引导' },
                  { id: 'medium', label: '真实复赛' },
                  { id: 'hard', label: '国赛刁难' }
                ].map((diff) => (
                  <button
                    key={diff.id}
                    onClick={() => session?.status !== 'running' && setDifficulty(diff.id as any)}
                    disabled={session?.status === 'running'}
                    className={`py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm ${
                      difficulty === diff.id 
                        ? 'bg-[#0071E3] text-white' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                    }`}
                  >
                    {diff.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-2">
              {session?.status === 'running' ? (
                <button
                  onClick={() => setSession(null)}
                  className="w-full flex items-center justify-center space-x-1.5 bg-red-50 text-red-600 border border-red-100 py-2.5 rounded-full text-xs font-semibold hover:bg-red-100 active:scale-[0.98] transition-transform shadow-sm"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>中止并退出本次演练</span>
                </button>
              ) : (
                <button
                  onClick={handleStartSession}
                  className="w-full flex items-center justify-center space-x-1.5 bg-[#0071E3] text-white py-2.5 rounded-full text-xs font-semibold hover:bg-[#0077ED] active:scale-[0.98] transition-all shadow-sm shadow-blue-500/15"
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                  <span>进入全真答辩演练舱</span>
                </button>
              )}
            </div>
          </div>

          {/* Session Progress indicators (when active) */}
          {session && (
            <div className="p-4 rounded-xl border border-gray-200 bg-white space-y-3 shadow-sm">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500 font-mono">答辩轮数进度:</span>
                <span className="font-mono text-gray-800 font-bold">{session.answers.length} / 3 轮</span>
              </div>
              <div className="flex gap-1.5">
                {[0, 1, 2].map((idx) => {
                  const isCompleted = session.answers.length > idx;
                  const isActive = session.currentQuestionIndex === idx && session.status === 'running';
                  return (
                    <div
                      key={idx}
                      className={`h-1.5 flex-1 rounded-full transition-all ${
                        isCompleted 
                          ? 'bg-blue-600' 
                          : isActive 
                            ? 'bg-amber-500 animate-pulse' 
                            : 'bg-gray-100'
                      }`}
                    />
                  );
                })}
              </div>
              <div className="text-[10px] text-gray-400 font-light leading-tight">
                AI正在基于您的回答进行深度的多变量推演，提炼您的失分漏洞、学术漏洞并记录到分析看板。
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Dynamic Q&A Chat Console */}
        <div className="lg:col-span-8 flex flex-col h-[640px] rounded-[24px] border border-gray-200 bg-white overflow-hidden shadow-sm">
          
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <div className="flex items-center space-x-3 text-left">
              <div className={`h-8 w-8 rounded-full ${persona.avatarBg} flex items-center justify-center text-xs font-bold text-white shadow-sm`}>
                {persona.personaName[0]}
              </div>
              <div>
                <span className="text-xs font-semibold text-gray-900 block">{persona.personaName}</span>
                <span className="text-[9px] text-gray-400 block font-mono">{persona.personaTitle}</span>
              </div>
            </div>

            <span className="text-[10px] font-mono bg-gray-100 text-gray-500 px-2 py-0.5 rounded border border-gray-200">
              {difficulty === 'basic' ? '友好' : difficulty === 'medium' ? '硬核复审' : '地狱挑战'}
            </span>
          </div>

          {/* Chat Messages Scrolling Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/20">
            {!session ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
                <div className="h-12 w-12 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-gray-400" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-semibold text-gray-900">答辩演练舱处于离线状态</h4>
                  <p className="text-[11px] text-gray-500 max-w-sm leading-normal">
                    请在左侧指定主考官（陆一鸣或顾建国），选定您的申报项目并点击“进入答辩演练舱”启动。
                  </p>
                </div>
              </div>
            ) : (
              session.messages.map((msg) => {
                const isAI = msg.sender === 'ai';
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isAI ? 'justify-start' : 'justify-end'}`}
                  >
                    <div className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed text-left ${
                      isAI 
                        ? 'bg-white text-gray-800 border border-gray-100 rounded-tl-sm shadow-sm' 
                        : 'bg-[#0071E3] text-white font-medium rounded-tr-sm shadow-sm'
                    }`}>
                      {/* Message metadata */}
                      <div className={`flex justify-between items-center text-[9px] mb-2 border-b pb-1 font-mono ${
                        isAI ? 'text-gray-400 border-gray-100' : 'text-blue-200 border-blue-500/20'
                      }`}>
                        <span>{isAI ? 'PROCTOR' : 'COMPETITOR'}</span>
                        <span>{msg.timestamp}</span>
                      </div>
                      
                      <p className="whitespace-pre-wrap font-light">{msg.text}</p>
                    </div>
                  </div>
                );
              })
            )}

            {isEvaluating && (
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-2xl p-4 bg-white border border-gray-100 rounded-tl-sm text-xs text-left shadow-sm">
                  <div className="flex items-center space-x-2 text-gray-500">
                    <RefreshCw className="h-3 w-3 animate-spin" />
                    <span className="font-mono text-[10px]">评委正在分析您的应答陈述并打分...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Interactive Chat Input panel */}
          {session && session.status === 'running' && (
            <div className="p-4 border-t border-gray-100 bg-white space-y-3 shadow-inner">
              <textarea
                rows={3}
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="在此处输入您的答辩陈述（最少15字以触发深度消融评估）..."
                className="w-full p-3 rounded-xl bg-white border border-gray-200 text-xs text-gray-900 placeholder-gray-400 leading-relaxed font-light focus:outline-none focus:border-gray-300 focus:ring-1 focus:ring-gray-200 transition-all shadow-inner"
              />
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-gray-400 font-mono">提示：陆一鸣看重商业逻辑，顾建国执着技术算子</span>
                <button
                  onClick={handleSubmitAnswer}
                  disabled={!userAnswer.trim() || isEvaluating}
                  className="flex items-center space-x-1.5 bg-[#0071E3] text-white px-4 py-1.5 rounded-full text-xs font-semibold hover:bg-[#0077ED] disabled:opacity-50 transition-all shadow-sm active:scale-[0.98]"
                >
                  <span>发送陈述回答</span>
                  <Send className="h-3 w-3" />
                </button>
              </div>
            </div>
          )}

          {/* If completed, display a gorgeous Report card footer */}
          {session && session.status === 'completed' && (
            <div className="p-6 border-t border-gray-200 bg-gray-50 text-left space-y-4 overflow-y-auto max-h-[300px]">
              <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                <div className="flex items-center space-x-2">
                  <Award className="h-5 w-5 text-amber-500 animate-bounce" />
                  <span className="text-xs font-mono font-bold text-gray-900 uppercase tracking-wider">答辩综合诊断报告卡 (Mock Defense Report)</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-gray-400 block leading-none">应答加权分</span>
                  <span className="text-xl font-mono font-bold text-gray-900">{avgScore}分</span>
                </div>
              </div>

              {/* Three detailed indices */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-3 rounded-lg bg-white border border-gray-200 text-xs space-y-1 shadow-sm">
                  <span className="text-[10px] text-gray-400 font-mono block">回答准确度 (Accuracy)</span>
                  <span className="text-sm font-semibold text-gray-800">
                    {avgScore >= 85 ? '优秀 · 直面核心痛点' : avgScore >= 70 ? '及格 · 部分维度偏于抽象' : '极差 · 涉嫌回避问题'}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-white border border-gray-200 text-xs space-y-1 shadow-sm">
                  <span className="text-[10px] text-gray-400 font-mono block">应变承压能力 (Stress Limit)</span>
                  <span className="text-sm font-semibold text-gray-800">
                    {difficulty === 'hard' ? '极强 · 承受地狱拷问' : '良好 · 逻辑基本融洽'}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-white border border-gray-200 text-xs space-y-1 shadow-sm">
                  <span className="text-[10px] text-gray-400 font-mono block">高频失分倾向模式</span>
                  <span className="text-sm font-semibold text-amber-600">
                    {avgScore >= 85 ? '轻度专业词汇堆砌' : '回避核心痛点型'}
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-gray-600 font-light leading-relaxed">
                <p className="font-semibold text-gray-800">💡 终审教练建议:</p>
                <p className="mt-1">
                  您的项目在答辩时由于对“医院采购决策流”论述单薄，触发了投资人较大幅度扣分。建议您立刻前往「诊断与指导工作室（Scene 2）」第4章“商业模式”，参考AI提供的CFDA准入建议重新修订，并调低首年500台系统的激进预期，改好了再次前来挑战演练。
                </p>
              </div>

              <button
                onClick={() => setSession(null)}
                className="bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 px-5 py-2 rounded-full text-xs font-semibold shadow-sm active:scale-[0.98] transition-transform"
              >
                关闭报告并重新配置
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
