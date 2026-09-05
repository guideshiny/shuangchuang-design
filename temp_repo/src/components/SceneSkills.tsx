/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, Layers, CheckCircle2, AlertTriangle, RefreshCw, 
  HelpCircle, ChevronRight, Settings, Server, Plus, Info 
} from 'lucide-react';
import { ExpertSkill } from '../types';
import { mockExpertSkills } from '../data/mockData';

interface SceneSkillsProps {
  expertSkills: ExpertSkill[];
  skillUpdates: Array<{ id: string; time: string; text: string }>;
}

export default function SceneSkills({ expertSkills, skillUpdates }: SceneSkillsProps) {
  const [selectedSkillId, setSelectedSkillId] = useState<string>('skill-1');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const selectedSkill = expertSkills.find(s => s.id === selectedSkillId) || expertSkills[0];

  const filteredSkills = expertSkills.filter(s => 
    activeCategory === 'all' || s.category === activeCategory
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <span className="text-xs font-mono font-bold tracking-wider uppercase text-gray-400">Scene 4 · P1 专家智能燃料</span>
        <h1 className="font-display font-semibold text-3xl md:text-5xl tracking-tight text-gray-900 mt-1">专家经验库 (Expert Skill Base)</h1>
        <p className="text-gray-500 text-sm mt-2 max-w-3xl">
          大赛的灵魂在评审水准。本模块把资深评委的隐性大脑经验、学术偏好、扣分命门解压编码为大模型可执行的结构化 Skill，构成AI大脑的能力库。系统通过对比评委手动修改记录，实现跨届的自生长进化。
        </p>
      </div>

      {/* Main split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left column: Skills list & live corrections logs */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Skill lists selector */}
          <div className="p-5 rounded-[24px] border border-gray-200 bg-white space-y-4 text-left shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-semibold text-gray-500">系统已封存专家评估 Skill 清单</span>
              <span className="text-[10px] text-gray-400 font-mono">V1.2 稳定版</span>
            </div>

            {/* Category selection */}
            <div className="flex gap-2">
              {['all', '评审类', '指导类'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1 rounded-full text-[10px] font-semibold transition-all shadow-sm ${
                    activeCategory === cat ? 'bg-[#0071E3] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-950'
                  }`}
                >
                  {cat === 'all' ? '全部领域' : cat}
                </button>
              ))}
            </div>

            {/* Cards */}
            <div className="space-y-2">
              {filteredSkills.map((sk) => {
                const isActive = sk.id === selectedSkillId;
                return (
                  <div
                    key={sk.id}
                    onClick={() => setSelectedSkillId(sk.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all text-left ${
                      isActive 
                        ? 'bg-gray-50 border-blue-500 shadow-sm ring-1 ring-blue-500/15' 
                        : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] text-gray-400 font-mono">
                      <span>{sk.category}</span>
                      <span className="text-gray-500">{sk.track}赛道</span>
                    </div>
                    <h4 className="text-xs font-semibold text-gray-900 mt-1.5 leading-snug">{sk.name}</h4>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Real-time synchronization log (Scene 1 Judge Corrections feed here) */}
          <div className="p-5 rounded-[24px] border border-gray-200 bg-white space-y-4 text-left shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-semibold text-gray-500 flex items-center">
                <Server className="h-4 w-4 mr-1.5 text-blue-500" />
                神经网络自重构日志 (AI Auto-Alignment)
              </h3>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
              </span>
            </div>

            <p className="text-[10px] text-gray-400 font-light leading-normal">
              当评委在「Scene 1」中推翻或修正 AI 初筛结论时，偏差理由将作为自微调（Alignment）向量，驱动大模型对各维度的评分 prompt 概率分布进行权重自校正。
            </p>

            <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
              {skillUpdates.map((log) => (
                <div key={log.id} className="p-3 rounded-lg bg-gray-50 border border-gray-100 text-[10px] space-y-1 shadow-inner">
                  <div className="flex justify-between font-mono text-gray-400">
                    <span>ACTION RECORDED</span>
                    <span>{log.time}</span>
                  </div>
                  <p className="text-teal-600 font-medium leading-relaxed">
                    {log.text}
                  </p>
                </div>
              ))}
              
              <div className="p-3 rounded-lg bg-gray-50/50 border border-dashed border-gray-200 text-[10px] text-gray-400 text-center font-mono">
                等待 Scene 1 评审进行新的修正覆核...
              </div>
            </div>
          </div>

        </div>

        {/* Right column: Selected Skill Detailed Breakdown */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedSkill.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="rounded-[24px] border border-gray-200 bg-white p-6 space-y-6 text-left shadow-sm"
            >
              
              {/* Header */}
              <div className="border-b border-gray-100 pb-5 space-y-1">
                <span className="text-xs font-mono font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded border border-gray-200/60">
                  SYSTEM CORE CONTEXT INJECTOR
                </span>
                <h2 className="font-display font-semibold text-xl text-gray-900 mt-2">
                  {selectedSkill.name}
                </h2>
                <p className="text-xs text-gray-500 leading-relaxed font-light mt-1">
                  {selectedSkill.description}
                </p>
              </div>

              {/* Rules List */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono font-semibold text-gray-500 flex items-center">
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1.5 text-blue-500" />
                  AI审理及判分强制性校验指令 (Rules)
                </h4>
                <div className="space-y-2">
                  {selectedSkill.rules.map((rule, idx) => (
                    <div key={idx} className="flex items-start space-x-2.5 p-3 rounded-xl bg-gray-50 border border-gray-100/60 shadow-inner">
                      <div className="h-5 w-5 rounded-full bg-white border border-gray-200 flex items-center justify-center text-[10px] font-mono text-gray-500 flex-shrink-0 mt-0.5 shadow-sm font-semibold">
                        {idx + 1}
                      </div>
                      <p className="text-xs text-gray-700 font-light leading-relaxed">{rule}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Common Pitfalls Check */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono font-semibold text-red-600 flex items-center">
                  <AlertTriangle className="h-3.5 w-3.5 mr-1.5 text-red-500" />
                  大纲过滤及一票否决避雷针 (Common Pitfalls)
                </h4>
                <ul className="text-xs text-gray-500 space-y-1.5 pl-5 list-disc leading-relaxed font-light">
                  {selectedSkill.pitfalls.map((pf, idx) => (
                    <li key={idx}>{pf}</li>
                  ))}
                </ul>
              </div>

              {/* Scoring Anchors */}
              <div className="space-y-3 border-t border-gray-100 pt-5">
                <h4 className="text-xs font-mono font-semibold text-gray-500 flex items-center">
                  <Layers className="h-3.5 w-3.5 mr-1.5 text-blue-500" />
                  百分制打分锚定参照 (Scoring Anchors)
                </h4>
                
                <div className="space-y-2">
                  {selectedSkill.anchors.map((anc, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row sm:items-start gap-2 p-3 rounded-xl bg-gray-50 border border-gray-100 shadow-sm">
                      <span className="text-xs font-mono font-bold text-gray-700 bg-white px-2 py-0.5 rounded border border-gray-200 flex-shrink-0 shadow-sm">
                        {anc.range}
                      </span>
                      <p className="text-xs text-gray-600 font-light leading-relaxed">{anc.criteria}</p>
                    </div>
                  ))}
                </div>
              </div>

            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
