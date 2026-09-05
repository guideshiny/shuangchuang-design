/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Filter, Award, ChevronRight, BookOpen, ThumbsUp, Tag } from 'lucide-react';
import { Case, TrackType } from '../types';
import { mockCases } from '../data/mockData';

export default function SceneCases() {
  const [selectedCaseId, setSelectedCaseId] = useState<string>('case-1');
  const [activeTrack, setActiveTrack] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const selectedCase = mockCases.find(c => c.id === selectedCaseId) || mockCases[0];

  const filteredCases = mockCases.filter(c => {
    const matchesTrack = activeTrack === 'all' || c.track === activeTrack;
    const matchesSearch = 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTrack && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <span className="text-xs font-mono font-bold tracking-wider uppercase text-gray-400">Scene 5 · P1 赛事记忆</span>
        <h1 className="font-display font-semibold text-3xl md:text-5xl tracking-tight text-gray-900 mt-1">历史案例库 (Historical Cases)</h1>
        <p className="text-gray-500 text-sm mt-2 max-w-3xl">
          往届优秀案例是AI模型判断的基准坐标。本数据库对近3届国家级金奖、银奖项目进行了深度脱敏与结构化归档，保留核心创新路径与评委评语，供后续项目进行语义级的同台竞技对标。
        </p>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Search & Bento Grid */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-700">标杆项目案例库 ({filteredCases.length})</span>
            <span className="text-[10px] text-gray-400 font-mono">脱敏归档库</span>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="语义模糊搜：芯片、仿地避障、医疗..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-gray-200 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-gray-300 transition-colors shadow-inner"
            />
          </div>

          {/* Track Filter Tab */}
          <div className="flex flex-wrap gap-1">
            {['all', '科技创新', '乡村振兴', '商业模式', '社会公益'].map((t) => (
              <button
                key={t}
                onClick={() => setActiveTrack(t)}
                className={`px-3 py-1 rounded-full text-[10px] font-semibold transition-all shadow-sm ${
                  activeTrack === t ? 'bg-[#0071E3] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-950'
                }`}
              >
                {t === 'all' ? '全部赛道' : t}
              </button>
            ))}
          </div>

          {/* Case listing */}
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {filteredCases.length === 0 ? (
              <div className="py-12 text-center rounded-[24px] border border-dashed border-gray-200 text-gray-400 text-xs bg-white shadow-sm">
                没有找到匹配的优秀案例
              </div>
            ) : (
              filteredCases.map((cs) => {
                const isSelected = cs.id === selectedCaseId;
                return (
                  <div
                    key={cs.id}
                    onClick={() => setSelectedCaseId(cs.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer text-left ${
                      isSelected 
                        ? 'bg-gray-50 border-blue-500 shadow-sm ring-1 ring-blue-500/15' 
                        : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50/50 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] text-gray-400 font-mono">
                      <span>{cs.track} · {cs.type}</span>
                      
                      <span className="flex items-center space-x-1 text-amber-600 font-semibold">
                        <Award className="h-3 w-3" />
                        <span>{cs.award}</span>
                      </span>
                    </div>

                    <h4 className="font-display font-semibold text-sm text-gray-900 mt-2 leading-snug">
                      {cs.name}
                    </h4>

                    <p className="text-[11px] text-gray-500 font-light mt-1.5 leading-relaxed line-clamp-2">
                      {cs.summary}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Case Details Sheet */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedCase.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="rounded-[24px] border border-gray-200 bg-white p-6 space-y-6 text-left shadow-sm"
            >
              {/* Header */}
              <div className="border-b border-gray-100 pb-5 flex justify-between items-start gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded border border-gray-200/60">
                      {selectedCase.track}赛道 · {selectedCase.type}
                    </span>
                  </div>
                  <h2 className="font-display font-semibold text-xl text-gray-900 mt-2 leading-snug">
                    {selectedCase.name}
                  </h2>
                </div>

                <div className="flex items-center space-x-1 bg-amber-50 border border-amber-200 text-amber-700 px-3 py-1 rounded-full text-xs font-semibold">
                  <Award className="h-3.5 w-3.5" />
                  <span>国赛 {selectedCase.award}</span>
                </div>
              </div>

              {/* Core summary */}
              <div className="space-y-2">
                <h4 className="text-xs font-mono font-semibold text-gray-500 flex items-center">
                  <Tag className="h-3.5 w-3.5 mr-1.5 text-blue-500" />
                  核心项目成效摘要 (Summary)
                </h4>
                <p className="text-xs text-gray-700 leading-relaxed font-light bg-gray-50 p-4 rounded-xl border border-gray-100/60 shadow-inner">
                  {selectedCase.summary}
                </p>
              </div>

              {/* Highlights list */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono font-semibold text-gray-500 flex items-center">
                  <BookOpen className="h-3.5 w-3.5 mr-1.5 text-blue-500" />
                  可借鉴性突破看点 (Highlights)
                </h4>
                <div className="space-y-2">
                  {selectedCase.highlights.map((hl, idx) => (
                    <div key={idx} className="flex items-start space-x-2.5 p-3 rounded-xl bg-gray-50 border border-gray-100/60 shadow-inner">
                      <div className="h-5 w-5 rounded-full bg-white border border-gray-200 flex items-center justify-center text-[10px] font-mono text-gray-500 flex-shrink-0 mt-0.5 shadow-sm font-semibold">
                        {idx + 1}
                      </div>
                      <p className="text-xs text-gray-700 font-light leading-relaxed">{hl}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Real judge comments */}
              <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-100 space-y-2.5">
                <h4 className="text-xs font-mono font-semibold text-amber-800 flex items-center">
                  <Award className="h-3.5 w-3.5 mr-1.5 text-amber-500" />
                  主考官决胜质询评语原文 (Proctor Comments)
                </h4>
                <p className="text-xs text-gray-700 leading-relaxed font-light italic">
                  {selectedCase.judgeComments}
                </p>
              </div>

            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
