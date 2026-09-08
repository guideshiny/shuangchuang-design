/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import ChatComposer from './ChatComposer';
import { AssociatedFileItem, ProjectSpace } from '../types';

export interface GuideTaskItem {
  id: string;
  title: string;
  icon: string;
  agentId: 'diagnosis' | 'defense' | 'policy' | 'intel' | 'campus';
  prompt: string;
}

// 推荐任务胶囊列表（严格对标设计截图）
export const GUIDE_TASK_PILLS: GuideTaskItem[] = [
  {
    id: 'task-bp-diag',
    title: '项目完整诊断',
    icon: '🚀',
    agentId: 'diagnosis',
    prompt: '请对当前参赛项目进行全维度商业计划书 (BP) 与路演材料深度诊断，对标国赛金奖标准评估各维度差距并提出改进建议。'
  },
  {
    id: 'task-defense-sim',
    title: '全流程模拟答辩',
    icon: '🎙️',
    agentId: 'defense',
    prompt: '请启动全流程 5 分钟模拟答辩与评委提问环节，针对项目痛点与商业壁垒进行尖锐质询与应答复盘。'
  },
  {
    id: 'task-5-questions',
    title: '5道高频答辩题',
    icon: '⚡',
    agentId: 'defense',
    prompt: '请结合国赛资深评审专家的考量视角，为当前项目定制 5 道最尖锐的高频答辩质询题及金奖级应答范式。'
  },
  {
    id: 'task-bm-quick',
    title: '商业模式速诊',
    icon: '📑',
    agentId: 'diagnosis',
    prompt: '请针对当前项目的商业模式、盈利机制及落地闭环进行速诊，指出散户/B端客户付费转化漏洞与改进策略。'
  },
  {
    id: 'task-tech-moat',
    title: '技术壁垒核查',
    icon: '🛡️',
    agentId: 'diagnosis',
    prompt: '请全面核查当前项目的核心技术壁垒与研发自主可控性，分析竞品（如行业龙头）免费跟进时的防守策略。'
  },
  {
    id: 'task-rule-decode',
    title: '赛道规则解读',
    icon: '⚖️',
    agentId: 'policy',
    prompt: '请详细解读 2026 年大赛高教主赛道与红旅赛道的最新评审规则、申报门槛与评分标准差异。'
  },
  {
    id: 'task-intel-compete',
    title: '竞品壁垒透视',
    icon: '📊',
    agentId: 'intel',
    prompt: '请分析当前项目所在赛道的头部竞品格局、融资阶段与核心优势，并提供差异化突围路线图。'
  },
  {
    id: 'task-finance-audit',
    title: '财务模型测算',
    icon: '💰',
    agentId: 'diagnosis',
    prompt: '请检查当前项目 BP 中的财务预测模型与产能装配数据一致性，排查数据打架与虚高漏洞。'
  }
];

interface SessionGuidePageProps {
  inputValue: string;
  setInputValue: (val: string) => void;
  onSend: (text: string) => void;
  isThinking: boolean;
  selectedAgentId: 'diagnosis' | 'defense' | 'policy' | 'intel' | 'campus';
  onSelectAgent: (agentId: 'diagnosis' | 'defense' | 'policy' | 'intel' | 'campus') => void;
  selectedSkillIds: string[];
  onToggleSkill: (skillId: string) => void;
  selectedMcpIds: string[];
  onToggleMcp: (mcpId: string) => void;
  onOpenFlywheelModal?: () => void;
  availableFiles?: AssociatedFileItem[];
  mentionedFiles?: AssociatedFileItem[];
  onAddMentionFile?: (file: AssociatedFileItem) => void;
  onRemoveMentionFile?: (fileId: string) => void;
  spaces?: ProjectSpace[];
  activeSpace?: ProjectSpace | null;
  activeSpaceId?: string;
  onSelectSpace?: (spaceId: string) => void;
}

export default function SessionGuidePage({
  inputValue,
  setInputValue,
  onSend,
  isThinking,
  selectedAgentId,
  onSelectAgent,
  selectedSkillIds,
  onToggleSkill,
  selectedMcpIds,
  onToggleMcp,
  onOpenFlywheelModal,
  availableFiles = [],
  mentionedFiles = [],
  onAddMentionFile,
  onRemoveMentionFile,
  spaces,
  activeSpace,
  activeSpaceId,
  onSelectSpace
}: SessionGuidePageProps) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [hintMessage, setHintMessage] = useState<string | null>(null);

  // 横向轮播平滑滚动
  const handleScrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -240, behavior: 'smooth' });
    }
  };

  const handleScrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 240, behavior: 'smooth' });
    }
  };

  // 点击任务卡片：载入提示词并聚焦输入框，同步切换推荐智能体
  const handleSelectTask = (task: GuideTaskItem) => {
    setInputValue(task.prompt);
    if (onSelectAgent) {
      onSelectAgent(task.agentId);
    }
    setHintMessage(`已载入「${task.title}」提示词，点击发送即可开始`);
    setTimeout(() => {
      setHintMessage(null);
    }, 2500);

    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.setSelectionRange(task.prompt.length, task.prompt.length);
      }
    }, 50);
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center my-auto px-4 py-8 animate-in fade-in duration-200">
      {/* 提示气泡 */}
      {hintMessage && (
        <div className="mb-4 bg-sky-600 text-white text-xs px-3.5 py-1.5 rounded-full shadow-md flex items-center space-x-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
          <Sparkles className="h-3.5 w-3.5" />
          <span>{hintMessage}</span>
        </div>
      )}

      {/* 1. 标题（严格还原截图2：AI 备赛教练，我帮你） */}
      <h1 
        className="text-2xl sm:text-3xl lg:text-[32px] font-bold text-slate-800 tracking-tight text-center mb-6 select-none"
        id="guide-page-main-title"
      >
        AI 备赛教练，我帮你
      </h1>

      {/* 2. 推荐任务横向轮播胶囊区（严格还原截图2） */}
      <div className="w-full relative flex items-center mb-6 sm:mb-8 group">
        {/* 左箭头 */}
        <button
          type="button"
          onClick={handleScrollLeft}
          className="h-8 w-8 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-800 shadow-2xs flex items-center justify-center transition-all flex-shrink-0 z-10 active:scale-95"
          title="向左滚动"
          aria-label="Previous tasks"
          id="btn-guide-carousel-prev"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {/* 滚动胶囊容器 */}
        <div
          ref={carouselRef}
          className="flex-1 flex items-center space-x-2 sm:space-x-2.5 overflow-x-auto no-scrollbar py-1 px-2.5 scroll-smooth"
          id="guide-task-pills-container"
        >
          {GUIDE_TASK_PILLS.map((task) => (
            <button
              key={task.id}
              type="button"
              onClick={() => handleSelectTask(task)}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-full border border-slate-200/90 bg-white hover:bg-sky-50/60 hover:border-sky-300 hover:text-sky-700 text-slate-700 text-xs sm:text-[13px] font-medium shadow-2xs hover:shadow-xs transition-all whitespace-nowrap cursor-pointer flex-shrink-0 active:scale-95"
              id={`btn-guide-task-${task.id}`}
              title={task.prompt}
            >
              <span className="text-sm">{task.icon}</span>
              <span>{task.title}</span>
            </button>
          ))}
        </div>

        {/* 右箭头 */}
        <button
          type="button"
          onClick={handleScrollRight}
          className="h-8 w-8 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-800 shadow-2xs flex items-center justify-center transition-all flex-shrink-0 z-10 active:scale-95"
          title="向右滚动"
          aria-label="Next tasks"
          id="btn-guide-carousel-next"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* 3. 全页居中输入框卡片（严格还原截图1） */}
      <div className="w-full" id="guide-composer-wrapper">
        <ChatComposer
          inputValue={inputValue}
          setInputValue={setInputValue}
          onSend={onSend}
          isThinking={isThinking}
          selectedAgentId={selectedAgentId}
          onSelectAgent={onSelectAgent}
          selectedSkillIds={selectedSkillIds}
          onToggleSkill={onToggleSkill}
          selectedMcpIds={selectedMcpIds}
          onToggleMcp={onToggleMcp}
          onOpenFlywheelModal={onOpenFlywheelModal}
          availableFiles={availableFiles}
          mentionedFiles={mentionedFiles}
          onAddMentionFile={onAddMentionFile}
          onRemoveMentionFile={onRemoveMentionFile}
          spaces={spaces}
          activeSpace={activeSpace}
          activeSpaceId={activeSpaceId}
          onSelectSpace={onSelectSpace}
          isCenteredMode={true}
          externalInputRef={inputRef}
        />
      </div>
    </div>
  );
}
