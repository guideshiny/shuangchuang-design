/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, ChevronUp, ChevronDown, Check, Plus, Folder, 
  FolderPlus, FolderX, Search, Mic, MicOff, Sparkles, 
  Bot, Cpu, Layers, Database, ChevronLeft, ChevronRight,
  ExternalLink, X, Info, AtSign, Paperclip
} from 'lucide-react';
import { ProjectSpace, AssociatedFileItem } from '../types';
import { 
  EXPERT_AGENTS, 
  COACH_SKILLS, 
  MCP_CONNECTORS, 
  RECOMMENDED_TASKS 
} from '../data/mockCoachAgentsAndSkills';
import AiMascot from './AiMascot';

interface ChatComposerProps {
  inputValue: string;
  setInputValue: (val: string) => void;
  onSend: (text: string) => void;
  isThinking: boolean;
  spaces: ProjectSpace[];
  activeSpace: ProjectSpace | null;
  activeSpaceId: string;
  onSelectSpace: (spaceId: string) => void;
  onCreateSpace: (newSpace: { name: string; trackTag: string; school: string; leader: string }) => void;
  selectedAgentId: 'diagnosis' | 'defense' | 'policy' | 'intel' | 'campus';
  onSelectAgent: (agentId: 'diagnosis' | 'defense' | 'policy' | 'intel' | 'campus') => void;
  selectedSkillIds: string[];
  onToggleSkill: (skillId: string) => void;
  selectedMcpIds: string[];
  onToggleMcp: (mcpId: string) => void;
  onOpenFlywheelModal?: () => void;
  isNewSessionMode?: boolean;
  availableFiles?: AssociatedFileItem[];
  mentionedFiles?: AssociatedFileItem[];
  onAddMentionFile?: (file: AssociatedFileItem) => void;
  onRemoveMentionFile?: (fileId: string) => void;
}

export default function ChatComposer({
  inputValue,
  setInputValue,
  onSend,
  isThinking,
  spaces,
  activeSpace,
  activeSpaceId,
  onSelectSpace,
  onCreateSpace,
  selectedAgentId,
  onSelectAgent,
  selectedSkillIds,
  onToggleSkill,
  selectedMcpIds,
  onToggleMcp,
  onOpenFlywheelModal,
  isNewSessionMode = false,
  availableFiles = [],
  mentionedFiles = [],
  onAddMentionFile,
  onRemoveMentionFile
}: ChatComposerProps) {
  // Popover menus state
  const [isSpaceMenuOpen, setIsSpaceMenuOpen] = useState<boolean>(false);
  const [isAgentMenuOpen, setIsAgentMenuOpen] = useState<boolean>(false);
  const [isSkillMenuOpen, setIsSkillMenuOpen] = useState<boolean>(false);
  const [isMcpMenuOpen, setIsMcpMenuOpen] = useState<boolean>(false);
  const [isModelMenuOpen, setIsModelMenuOpen] = useState<boolean>(false);
  const [isMentionMenuOpen, setIsMentionMenuOpen] = useState<boolean>(false);
  
  // Model state
  const [selectedModel, setSelectedModel] = useState<string>('DeepSeek-V4-Pro');

  // Voice recording mock state
  const [isRecording, setIsRecording] = useState<boolean>(false);

  // Search in Space dropdown
  const [spaceSearchQuery, setSpaceSearchQuery] = useState<string>('');

  // New Space Modal state
  const [showNewSpaceModal, setShowNewSpaceModal] = useState<boolean>(false);
  const [newSpaceForm, setNewSpaceForm] = useState({
    name: '',
    trackTag: '新农科组',
    school: '厦门大学',
    leader: '林小满'
  });

  // Local folder notification toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Task scroll reference
  const taskScrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const composerContainerRef = useRef<HTMLDivElement>(null);

  // Current selected expert agent
  const currentAgent = EXPERT_AGENTS.find(a => a.id === selectedAgentId) || EXPERT_AGENTS[0];

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (composerContainerRef.current && !composerContainerRef.current.contains(e.target as Node)) {
        setIsSpaceMenuOpen(false);
        setIsAgentMenuOpen(false);
        setIsSkillMenuOpen(false);
        setIsMcpMenuOpen(false);
        setIsModelMenuOpen(false);
        setIsMentionMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2400);
  };

  // Scroll task container left/right
  const scrollTasks = (direction: 'left' | 'right') => {
    if (taskScrollRef.current) {
      const scrollAmount = direction === 'left' ? -240 : 240;
      taskScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // When clicking a recommended task:
  // MUST NOT auto-send! Populates prompt into input box, and sets the target sub-agent (does not override host agent's skills/mcps)
  const handleTaskClick = (task: typeof RECOMMENDED_TASKS[0]) => {
    // 1. Set input prompt
    setInputValue(task.prompt);

    // 2. Set Sub-Agent
    onSelectAgent(task.agentId);

    // 3. Focus textarea
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);

    showToast(`已加载「${task.name}」提示词并分配给对应专家子智能体`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (!inputValue.trim() || isThinking) return;
    onSend(inputValue.trim());
    setInputValue('');
  };

  // Handle Space creation
  const handleCreateSpaceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSpaceForm.name.trim()) return;
    onCreateSpace(newSpaceForm);
    setShowNewSpaceModal(false);
    setIsSpaceMenuOpen(false);
    showToast(`成功创建并切换至工作空间「${newSpaceForm.name}」`);
    setNewSpaceForm({
      name: '',
      trackTag: '新农科组',
      school: '厦门大学',
      leader: '林小满'
    });
  };

  // Handle Local Folder Opening Simulation
  const handleOpenLocalFolder = () => {
    setIsSpaceMenuOpen(false);
    const path = activeSpace?.workspace.localPath || '~/Workspaces/project-root';
    showToast(`已关联本地工作空间目录：${path}`);
  };

  // Handle "不使用工作空间"
  const handleSelectNoSpace = () => {
    setIsSpaceMenuOpen(false);
    onSelectSpace('none');
    showToast('已切换至「不使用工作空间」模式');
  };

  // Filtered spaces by search query
  const filteredSpaces = spaces.filter(s => 
    s.name.toLowerCase().includes(spaceSearchQuery.toLowerCase()) ||
    s.trackTag.toLowerCase().includes(spaceSearchQuery.toLowerCase())
  );

  return (
    <div 
      ref={composerContainerRef}
      className="w-full relative transition-all"
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-50 bg-blue-600 text-white text-xs px-3.5 py-1.5 rounded-full shadow-lg flex items-center space-x-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
          <Sparkles className="h-3.5 w-3.5" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Composer Box */}
      <div className="bg-white border border-gray-200/90 rounded-2xl shadow-sm hover:shadow-md transition-shadow p-3 sm:p-4 text-gray-900 relative">
        {/* TOP ROW: Recommended Task Pills & Mascot */}
        <div className="flex items-center justify-between gap-2 pb-3 mb-2.5 border-b border-gray-100 relative">
          {/* Scrollable Tasks List */}
          <div className="flex-1 relative min-w-0 flex items-center">
            {/* Scroll Left Button */}
            <button 
              type="button"
              onClick={() => scrollTasks('left')}
              className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors mr-1 flex-shrink-0"
              title="向左滚动"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {/* Task Pills */}
            <div 
              ref={taskScrollRef}
              className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-0.5"
            >
              {RECOMMENDED_TASKS.map((task) => {
                return (
                  <button
                    key={task.id}
                    type="button"
                    onClick={() => handleTaskClick(task)}
                    className="flex-shrink-0 flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gray-50 hover:bg-blue-50 text-gray-700 hover:text-blue-700 border border-gray-200/80 hover:border-blue-300 text-xs font-medium transition-all group active:scale-95 shadow-2xs"
                    title={`点击将提示词填入输入框：\n${task.prompt}`}
                  >
                    <span>{task.icon}</span>
                    <span className="truncate max-w-[130px] sm:max-w-[160px]">{task.name}</span>
                    {task.tag && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-gray-200/70 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-700 font-mono">
                        {task.tag}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Scroll Right Button */}
            <button 
              type="button"
              onClick={() => scrollTasks('right')}
              className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors ml-1 flex-shrink-0"
              title="向右滚动"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* AI Mascot Avatar */}
          <div className="flex-shrink-0 pl-1">
            <AiMascot size={46} showSpeaker={true} className="hover:scale-105 transition-transform" />
          </div>
        </div>

        {/* MIDDLE ROW: Textarea Input Area */}
        <div className="relative min-h-[72px] sm:min-h-[86px]">
          {/* Mentioned Files Chips */}
          {mentionedFiles && mentionedFiles.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pb-2">
              <span className="text-[11px] text-gray-500 font-medium flex items-center space-x-1">
                <AtSign className="h-3 w-3 text-blue-500" />
                <span>已引用文件:</span>
              </span>
              {mentionedFiles.map((file) => (
                <span
                  key={file.id}
                  className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-xs font-medium group transition-colors"
                >
                  <Paperclip className="h-3 w-3 text-blue-500 flex-shrink-0" />
                  <span className="max-w-[180px] truncate">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => onRemoveMentionFile && onRemoveMentionFile(file.id)}
                    className="text-blue-400 hover:text-rose-600 hover:bg-blue-100 rounded-full p-0.5 transition-colors"
                    title="取消引用"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          <textarea
            ref={inputRef}
            rows={2}
            value={inputValue}
            onChange={(e) => {
              const val = e.target.value;
              setInputValue(val);
              if (val.endsWith('@')) {
                setIsMentionMenuOpen(true);
                setIsSpaceMenuOpen(false);
                setIsAgentMenuOpen(false);
                setIsSkillMenuOpen(false);
                setIsMcpMenuOpen(false);
                setIsModelMenuOpen(false);
              }
            }}
            onKeyDown={handleKeyDown}
            placeholder="输入内容，输入 @ 可引用项目文件提问，或点击上方推荐任务载入提示词..."
            className="w-full bg-transparent text-sm text-gray-900 placeholder-gray-400 focus:outline-none resize-none leading-relaxed min-h-[64px]"
          />
        </div>

        {/* BOTTOM ROW: Controls Bar */}
        <div className="pt-2.5 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
          {/* Left Controls: Space, Expert Agent, Skills, MCP */}
          <div className="flex items-center flex-wrap gap-1.5 sm:gap-2 text-xs">
            {/* 1. Space Selector Button (e.g. test_2) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsSpaceMenuOpen(!isSpaceMenuOpen);
                  setIsAgentMenuOpen(false);
                  setIsSkillMenuOpen(false);
                  setIsMcpMenuOpen(false);
                  setIsModelMenuOpen(false);
                }}
                className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                  isSpaceMenuOpen 
                    ? 'bg-gray-100 text-gray-900 border-gray-300 ring-1 ring-gray-200 shadow-2xs' 
                    : 'bg-gray-50/80 text-gray-700 hover:text-gray-900 hover:bg-gray-100 border-gray-200/80'
                }`}
              >
                <Folder className="h-3.5 w-3.5 text-amber-500" />
                <span className="max-w-[110px] sm:max-w-[140px] truncate font-mono">
                  {activeSpaceId === 'none' || !activeSpace ? '不使用工作空间' : activeSpace.name}
                </span>
                <ChevronUp className="h-3 w-3 text-gray-400" />
              </button>

              {/* Space Dropdown Menu */}
              {isSpaceMenuOpen && (
                <div className="absolute bottom-full left-0 mb-2 w-72 bg-white border border-gray-200 rounded-xl shadow-xl z-50 p-2 space-y-1 text-gray-900 animate-in fade-in duration-150">
                  {/* Search box */}
                  <div className="px-2 py-1.5 flex items-center space-x-2 bg-gray-50 rounded-lg border border-gray-200 text-xs">
                    <Search className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                    <input
                      type="text"
                      value={spaceSearchQuery}
                      onChange={(e) => setSpaceSearchQuery(e.target.value)}
                      placeholder="搜索工作空间"
                      className="bg-transparent text-xs text-gray-900 placeholder-gray-400 focus:outline-none w-full"
                    />
                    {spaceSearchQuery && (
                      <button onClick={() => setSpaceSearchQuery('')} className="text-gray-400 hover:text-gray-600">
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>

                  {/* Space List */}
                  <div className="max-h-48 overflow-y-auto space-y-0.5 py-1 text-xs">
                    {filteredSpaces.map((s) => {
                      const isSelected = activeSpaceId === s.id;
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => {
                            onSelectSpace(s.id);
                            setIsSpaceMenuOpen(false);
                            showToast(`已选择工作空间「${s.name}」`);
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left transition-colors ${
                            isSelected 
                              ? 'bg-blue-50 text-blue-700 font-medium' 
                              : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                          }`}
                        >
                          <div className="flex items-center space-x-2 truncate">
                            <Folder className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
                            <span className="truncate">{s.name}</span>
                          </div>
                          {isSelected && <Check className="h-3.5 w-3.5 text-blue-600 flex-shrink-0" />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-gray-100 my-1" />

                  {/* Action 1: Create New Space */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSpaceMenuOpen(false);
                      setShowNewSpaceModal(true);
                    }}
                    className="w-full flex items-center space-x-2 px-2.5 py-2 rounded-lg text-xs text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5 text-blue-600" />
                    <span>新建工作空间</span>
                  </button>

                  {/* Action 2: Open Local Folder */}
                  <button
                    type="button"
                    onClick={handleOpenLocalFolder}
                    className="w-full flex items-center space-x-2 px-2.5 py-2 rounded-lg text-xs text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                  >
                    <FolderPlus className="h-3.5 w-3.5 text-amber-500" />
                    <span>打开本地文件夹</span>
                  </button>

                  {/* Action 3: Don't Use Space */}
                  <button
                    type="button"
                    onClick={handleSelectNoSpace}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-colors ${
                      activeSpaceId === 'none'
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <FolderX className="h-3.5 w-3.5 text-rose-500" />
                      <span>不使用工作空间</span>
                    </div>
                    {activeSpaceId === 'none' && <Check className="h-3.5 w-3.5 text-blue-600" />}
                  </button>
                </div>
              )}
            </div>

            {/* 1.5 @ File Selector Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsMentionMenuOpen(!isMentionMenuOpen);
                  setIsSpaceMenuOpen(false);
                  setIsAgentMenuOpen(false);
                  setIsSkillMenuOpen(false);
                  setIsMcpMenuOpen(false);
                  setIsModelMenuOpen(false);
                }}
                className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                  mentionedFiles && mentionedFiles.length > 0
                    ? 'bg-blue-50 text-blue-700 border-blue-300 ring-1 ring-blue-100'
                    : 'bg-gray-50/80 text-gray-700 hover:text-gray-900 hover:bg-gray-100 border-gray-200/80'
                }`}
                title="关联项目文件提问，可在右侧共享资产中直接引用"
              >
                <AtSign className="h-3.5 w-3.5 text-blue-600" />
                <span>文件</span>
                {mentionedFiles && mentionedFiles.length > 0 && (
                  <span className="bg-blue-600 text-white rounded-full w-4 h-4 text-[10px] flex items-center justify-center font-mono font-bold">
                    {mentionedFiles.length}
                  </span>
                )}
              </button>

              {isMentionMenuOpen && (
                <div className="absolute bottom-full left-0 mb-2 w-72 bg-white border border-gray-200 rounded-xl shadow-xl z-50 p-2 space-y-1.5 text-xs text-gray-900 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between pb-1.5 border-b border-gray-100">
                    <span className="font-bold text-gray-800 text-xs flex items-center space-x-1">
                      <AtSign className="h-3.5 w-3.5 text-blue-600" />
                      <span>选择引用的文件</span>
                    </span>
                    <button 
                      onClick={() => setIsMentionMenuOpen(false)}
                      className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="max-h-52 overflow-y-auto space-y-1 py-1">
                    {availableFiles && availableFiles.length > 0 ? (
                      availableFiles.map((file) => {
                        const isMentioned = mentionedFiles?.some((m) => m.id === file.id);
                        return (
                          <button
                            key={file.id}
                            type="button"
                            onClick={() => {
                              if (isMentioned) {
                                onRemoveMentionFile && onRemoveMentionFile(file.id);
                              } else {
                                onAddMentionFile && onAddMentionFile(file);
                                if (inputValue.endsWith('@')) {
                                  setInputValue(inputValue.slice(0, -1));
                                }
                              }
                            }}
                            className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors ${
                              isMentioned
                                ? 'bg-blue-50 text-blue-700 font-medium border border-blue-200'
                                : 'text-gray-700 hover:bg-gray-50 border border-transparent'
                            }`}
                          >
                            <div className="flex items-center space-x-2 min-w-0 pr-1">
                              <Paperclip className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                              <div className="truncate">
                                <div className="truncate font-medium text-xs text-gray-900">{file.name}</div>
                                <div className="text-[10px] text-gray-400 font-mono">{file.typeLabel} · {file.size}</div>
                              </div>
                            </div>
                            {isMentioned ? (
                              <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded font-mono flex-shrink-0">
                                已引用 (点击取消)
                              </span>
                            ) : (
                              <span className="text-[10px] text-gray-400 font-mono hover:text-blue-600 flex-shrink-0">
                                点击引用
                              </span>
                            )}
                          </button>
                        );
                      })
                    ) : (
                      <div className="p-3 text-center text-gray-400 text-xs">
                        暂无可用文件，可在右侧共享资产中查看
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 2. Expert Agent Selector (作为子智能体配置给主智能体) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsAgentMenuOpen(!isAgentMenuOpen);
                  setIsSpaceMenuOpen(false);
                  setIsSkillMenuOpen(false);
                  setIsMcpMenuOpen(false);
                  setIsModelMenuOpen(false);
                }}
                className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                  isAgentMenuOpen 
                    ? 'bg-blue-50 text-blue-700 border-blue-200 ring-1 ring-blue-100 shadow-2xs' 
                    : 'bg-gray-50/80 text-gray-700 hover:text-gray-900 hover:bg-gray-100 border-gray-200/80'
                }`}
                title="选择委派任务的专家子智能体（各专家内置固定技能与连接器）"
              >
                <span>{currentAgent.avatar}</span>
                <span className="font-semibold">{currentAgent.name}</span>
                <ChevronDown className="h-3 w-3 text-gray-400" />
              </button>

              {/* Agent Menu Popover */}
              {isAgentMenuOpen && (
                <div className="absolute bottom-full left-0 mb-2 w-96 max-w-[90vw] bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 p-3 space-y-2 text-gray-900 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between pb-1 border-b border-gray-100">
                    <div className="flex items-center space-x-1.5">
                      <Bot className="h-4 w-4 text-blue-600" />
                      <span className="text-xs font-bold text-gray-900">专家子智能体 (Sub-Agents) · 协同配置</span>
                    </div>
                    <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-mono">
                      内置固定技能/连接器
                    </span>
                  </div>

                  {/* Architecture Note */}
                  <div className="p-2 rounded-xl bg-blue-50/70 border border-blue-100 text-blue-900 text-[11px] leading-relaxed">
                    💡 <strong>协同机制：</strong>专家作为<strong>子智能体</strong>配置给主智能体，主智能体可将专项任务分派给专家执行。各专家<strong>内置专属技能与连接器（不可更改）</strong>，独立生效，无需在下方技能/连接器中重复配置。
                  </div>

                  {/* Expert Agents List */}
                  <div className="max-h-80 overflow-y-auto space-y-2 py-1 pr-0.5">
                    {EXPERT_AGENTS.map((agent) => {
                      const isSelected = selectedAgentId === agent.id;
                      return (
                        <button
                          key={agent.id}
                          type="button"
                          onClick={() => {
                            onSelectAgent(agent.id);
                            setIsAgentMenuOpen(false);
                            showToast(`已将任务目标委派给专家子智能体「${agent.name}」`);
                          }}
                          className={`w-full p-2.5 rounded-xl text-left transition-all border ${
                            isSelected
                              ? 'bg-blue-50/90 border-blue-300 text-blue-950 ring-1 ring-blue-200 shadow-2xs'
                              : 'bg-gray-50/60 border-gray-200/70 text-gray-700 hover:bg-gray-100/80 hover:text-gray-900'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center space-x-1.5 font-bold text-xs">
                              <span>{agent.avatar}</span>
                              <span className="text-gray-900">{agent.name}</span>
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-100 text-blue-700 font-normal font-mono">
                                {agent.badge}
                              </span>
                            </div>
                            {isSelected ? (
                              <span className="flex items-center space-x-1 text-[11px] text-blue-600 font-medium">
                                <Check className="h-3.5 w-3.5" />
                                <span>已委派</span>
                              </span>
                            ) : (
                              <span className="text-[10px] text-gray-400 font-mono">点击委派</span>
                            )}
                          </div>

                          <p className="text-[11px] text-gray-600 leading-relaxed">
                            {agent.description}
                          </p>

                          {/* Built-in Skills and MCP Explanation (Fixed/Built-in, not editable) */}
                          <div className="mt-2 pt-2 border-t border-gray-200/60 space-y-1.5 text-[10.5px]">
                            {/* Built-in Skills */}
                            <div className="flex items-start space-x-1.5">
                              <span className="text-indigo-600 font-medium flex-shrink-0 flex items-center space-x-0.5">
                                <span>⚡</span>
                                <span>内置技能:</span>
                              </span>
                              <div className="flex flex-wrap gap-1">
                                {agent.builtinSkills.map((sk) => (
                                  <span 
                                    key={sk.id}
                                    className="px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-800 border border-indigo-200/70 text-[10px] flex items-center space-x-1"
                                    title={sk.description}
                                  >
                                    <span>{sk.icon}</span>
                                    <span>{sk.name}</span>
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Built-in Connectors */}
                            <div className="flex items-start space-x-1.5">
                              <span className="text-emerald-600 font-medium flex-shrink-0 flex items-center space-x-0.5">
                                <span>🔌</span>
                                <span>内置连接器:</span>
                              </span>
                              <div className="flex flex-wrap gap-1">
                                {agent.builtinConnectors.map((mcp) => (
                                  <span 
                                    key={mcp.id}
                                    className="px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-800 border border-emerald-200/70 text-[10px] flex items-center space-x-1"
                                    title={mcp.recordsCount}
                                  >
                                    <span>{mcp.icon}</span>
                                    <span>{mcp.name}</span>
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="mt-2 text-[10px] text-gray-400">
                            🎯 适用场景：{agent.recommendedFor}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* 3. Skills Selector (主智能体自主配置的技能库) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsSkillMenuOpen(!isSkillMenuOpen);
                  setIsSpaceMenuOpen(false);
                  setIsAgentMenuOpen(false);
                  setIsMcpMenuOpen(false);
                  setIsModelMenuOpen(false);
                }}
                className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                  isSkillMenuOpen 
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200 ring-1 ring-indigo-100 shadow-2xs' 
                    : 'bg-gray-50/80 text-gray-700 hover:text-gray-900 hover:bg-gray-100 border-gray-200/80'
                }`}
                title="配置直接赋予主智能体自主调用的技能工具"
              >
                <span>⚡</span>
                <span>技能 ({selectedSkillIds.length})</span>
                <ChevronDown className="h-3 w-3 text-gray-400" />
              </button>

              {/* Skills Menu Popover */}
              {isSkillMenuOpen && (
                <div className="absolute bottom-full left-0 mb-2 w-84 max-w-[90vw] bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 p-3 space-y-2 text-gray-900 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between pb-1.5 border-b border-gray-100 text-xs">
                    <div className="flex items-center space-x-1.5">
                      <span className="font-bold text-gray-900">配置可用 Skills (技能)</span>
                    </div>
                    <span className="text-[10px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full font-mono font-medium">
                      已启用 {selectedSkillIds.length} 项
                    </span>
                  </div>

                  {/* Clarification Note */}
                  <div className="p-2 rounded-xl bg-indigo-50/60 border border-indigo-100 text-indigo-900 text-[11px] leading-relaxed">
                    💡 <strong>提示：</strong>此处为直接配置给主智能体的通用技能工具集。主智能体自主规划时可直接调用，与各专家内置技能相互独立。
                  </div>

                  <div className="max-h-60 overflow-y-auto space-y-1.5 py-1">
                    {COACH_SKILLS.map((skill) => {
                      const isActive = selectedSkillIds.includes(skill.id);
                      return (
                        <div
                          key={skill.id}
                          onClick={() => onToggleSkill(skill.id)}
                          className={`p-2 rounded-lg border transition-colors cursor-pointer flex items-start space-x-2 ${
                            isActive 
                              ? 'bg-indigo-50/70 border-indigo-200 text-indigo-950 shadow-2xs' 
                              : 'bg-gray-50/60 border-gray-200/60 text-gray-600 hover:bg-gray-100/70 hover:text-gray-900'
                          }`}
                        >
                          <span className="mt-0.5">{skill.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-xs text-gray-900">{skill.name}</span>
                              <span className="text-[10px] text-gray-400 font-mono">{skill.engine}</span>
                            </div>
                            <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-1">
                              {skill.description}
                            </p>
                          </div>
                          <div className={`h-4 w-4 rounded border flex items-center justify-center flex-shrink-0 mt-0.5 ${
                            isActive ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-gray-300 bg-white'
                          }`}>
                            {isActive && <Check className="h-3 w-3" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* 4. Connectors (MCP) Selector (主智能体自主配置的连接器) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsMcpMenuOpen(!isMcpMenuOpen);
                  setIsSpaceMenuOpen(false);
                  setIsAgentMenuOpen(false);
                  setIsSkillMenuOpen(false);
                  setIsModelMenuOpen(false);
                }}
                className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                  isMcpMenuOpen 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-100 shadow-2xs' 
                    : 'bg-gray-50/80 text-gray-700 hover:text-gray-900 hover:bg-gray-100 border-gray-200/80'
                }`}
                title="配置直接挂载给主智能体的数据连接器"
              >
                <span>🔌</span>
                <span>连接器 ({selectedMcpIds.length})</span>
                <ChevronDown className="h-3 w-3 text-gray-400" />
              </button>

              {/* MCP Menu Popover */}
              {isMcpMenuOpen && (
                <div className="absolute bottom-full left-0 mb-2 w-84 max-w-[90vw] bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 p-3 space-y-2 text-gray-900 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between pb-1.5 border-b border-gray-100 text-xs">
                    <div className="flex items-center space-x-1.5">
                      <span className="font-bold text-gray-900">配置可用 MCP 连接器</span>
                    </div>
                    <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-mono font-medium">
                      已连接 {selectedMcpIds.length} 个
                    </span>
                  </div>

                  {/* Clarification Note */}
                  <div className="p-2 rounded-xl bg-emerald-50/60 border border-emerald-100 text-emerald-900 text-[11px] leading-relaxed">
                    💡 <strong>提示：</strong>此处为直接挂载给主智能体的数据连接器，用于跨库全局检索与对标分析，与各专家内部连接器互不冲突。
                  </div>

                  <div className="max-h-60 overflow-y-auto space-y-1.5 py-1">
                    {MCP_CONNECTORS.map((mcp) => {
                      const isActive = selectedMcpIds.includes(mcp.id);
                      return (
                        <div
                          key={mcp.id}
                          onClick={() => onToggleMcp(mcp.id)}
                          className={`p-2 rounded-lg border transition-colors cursor-pointer flex items-start space-x-2 ${
                            isActive 
                              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950 shadow-2xs' 
                              : 'bg-gray-50/60 border-gray-200/60 text-gray-600 hover:bg-gray-100/70 hover:text-gray-900'
                          }`}
                        >
                          <span className="mt-0.5">{mcp.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-xs text-gray-900">{mcp.name}</span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-mono font-medium">
                                {mcp.recordsCount}
                              </span>
                            </div>
                            <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-1">
                              {mcp.description}
                            </p>
                          </div>
                          <div className={`h-4 w-4 rounded border flex items-center justify-center flex-shrink-0 mt-0.5 ${
                            isActive ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-gray-300 bg-white'
                          }`}>
                            {isActive && <Check className="h-3 w-3" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Controls: Model Selector, Mic, Send Button */}
          <div className="flex items-center space-x-2">
            {/* Model Selector (e.g. DeepSeek-V4-Pro) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsModelMenuOpen(!isModelMenuOpen);
                  setIsSpaceMenuOpen(false);
                  setIsAgentMenuOpen(false);
                  setIsSkillMenuOpen(false);
                  setIsMcpMenuOpen(false);
                }}
                className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-gray-200/70 bg-gray-50/60 transition-colors"
              >
                <span>🦙</span>
                <span>{selectedModel}</span>
                <ChevronDown className="h-3 w-3 text-gray-400" />
              </button>

              {isModelMenuOpen && (
                <div className="absolute bottom-full right-0 mb-2 w-52 bg-white border border-gray-200 rounded-xl shadow-xl z-50 p-1.5 space-y-0.5 text-xs text-gray-900 animate-in fade-in duration-150">
                  {['DeepSeek-V4-Pro', 'Gemini 2.5 Flash', '大赛专属推理引擎'].map((model) => (
                    <button
                      key={model}
                      type="button"
                      onClick={() => {
                        setSelectedModel(model);
                        setIsModelMenuOpen(false);
                        showToast(`已切换推理底座：${model}`);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                        selectedModel === model 
                          ? 'bg-blue-50 text-blue-700 font-medium' 
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <span>{model}</span>
                      {selectedModel === model && <Check className="h-3.5 w-3.5 text-blue-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Voice Recording Button */}
            <button
              type="button"
              onClick={() => {
                setIsRecording(!isRecording);
                if (!isRecording) {
                  showToast('模拟语音输入已开启：随时向 AI 备赛教练讲话...');
                } else {
                  showToast('模拟语音输入已结束');
                }
              }}
              className={`p-2 rounded-xl transition-all ${
                isRecording 
                  ? 'bg-rose-50 text-rose-600 ring-1 ring-rose-300 animate-pulse' 
                  : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'
              }`}
              title="语音输入"
            >
              {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </button>

            {/* Send Button */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!inputValue.trim() || isThinking}
              className={`p-2 sm:p-2.5 rounded-xl flex items-center justify-center transition-all shadow-xs ${
                inputValue.trim() && !isThinking
                  ? 'bg-[#0071E3] hover:bg-blue-600 text-white active:scale-95'
                  : 'bg-gray-100 text-gray-300 cursor-not-allowed border border-gray-200/60'
              }`}
              title="发送会话"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* New Space Modal */}
      {showNewSpaceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-md p-5 text-gray-900 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
              <div className="flex items-center space-x-2">
                <FolderPlus className="h-5 w-5 text-blue-600" />
                <h3 className="font-bold text-sm">新建备赛工作空间</h3>
              </div>
              <button 
                onClick={() => setShowNewSpaceModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSpaceSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-gray-600 mb-1 font-medium">项目/空间名称 *</label>
                <input
                  type="text"
                  required
                  value={newSpaceForm.name}
                  onChange={(e) => setNewSpaceForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="例如：test_3 或 灵智农巡"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-600 mb-1 font-medium">赛道组别</label>
                  <select
                    value={newSpaceForm.trackTag}
                    onChange={(e) => setNewSpaceForm(prev => ({ ...prev, trackTag: e.target.value }))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:bg-white focus:border-blue-500"
                  >
                    <option value="新农科组">新农科组</option>
                    <option value="科技创新">科技创新</option>
                    <option value="医疗健康">医疗健康</option>
                    <option value="商业模式">商业模式</option>
                    <option value="乡村振兴">乡村振兴</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-600 mb-1 font-medium">所属高校</label>
                  <input
                    type="text"
                    value={newSpaceForm.school}
                    onChange={(e) => setNewSpaceForm(prev => ({ ...prev, school: e.target.value }))}
                    placeholder="厦门大学"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-600 mb-1 font-medium">团队负责人</label>
                <input
                  type="text"
                  value={newSpaceForm.leader}
                  onChange={(e) => setNewSpaceForm(prev => ({ ...prev, leader: e.target.value }))}
                  placeholder="项目申报负责人"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-blue-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-[11px] leading-relaxed">
                ℹ️ 系统将自动为新空间配置独立的本地工作区目录（~/Workspaces/…）与云端同步桶，并隔离历史会话与答辩档案。
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewSpaceModal(false)}
                  className="px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={!newSpaceForm.name.trim()}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium shadow-xs"
                >
                  确认创建
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
