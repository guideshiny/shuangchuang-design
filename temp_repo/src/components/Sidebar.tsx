/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Cpu, CheckSquare, MessageSquare, BookOpen, Database, 
  BarChart3, Zap, ChevronRight, Menu, X, Shield, Users, Bot, Sparkles,
  FolderKanban, Folder, Cloud, HardDrive, RefreshCw, Plus, ChevronDown, Check,
  Copy, Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ProjectSpace, CoachSession } from '../types';
import { cleanSessionTitle } from '../utils/titleUtils';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onTriggerScreening: () => void;
  spaces: ProjectSpace[];
  standaloneSessions?: CoachSession[];
  activeSpaceId: string;
  activeSessionId: string;
  onSelectSpace: (spaceId: string) => void;
  onSelectSession: (spaceId: string, sessionId: string) => void;
  onCreateSpace: (newSpace: { name: string; trackTag: string; school: string; leader: string; localPath?: string; cloudBucket?: string }) => void;
  onCreateSession: (spaceId: string) => void;
  onSyncWorkspace: (spaceId: string) => void;
  onDeleteSession?: (spaceId: string, sessionId: string) => void;
}

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  onTriggerScreening,
  spaces,
  standaloneSessions = [],
  activeSpaceId,
  activeSessionId,
  onSelectSpace,
  onSelectSession,
  onCreateSpace,
  onCreateSession,
  onSyncWorkspace,
  onDeleteSession
}: SidebarProps) {
  const [isOpenMobile, setIsOpenMobile] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [showCreateSpaceModal, setShowCreateSpaceModal] = useState<boolean>(false);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  // Accordion state for standalone Sessions (无工作空间)
  const [isSessionsExpanded, setIsSessionsExpanded] = useState<boolean>(true);

  // Accordion state for Space list
  const [isSpacesExpanded, setIsSpacesExpanded] = useState<boolean>(true);
  const [expandedSpaceIds, setExpandedSpaceIds] = useState<Set<string>>(() => new Set(spaces.map(s => s.id)));

  const toggleSpace = (spaceId: string) => {
    setExpandedSpaceIds(prev => {
      const next = new Set(prev);
      if (next.has(spaceId)) {
        next.delete(spaceId);
      } else {
        next.add(spaceId);
      }
      return next;
    });
  };

  // New Space Form State
  const [newSpaceForm, setNewSpaceForm] = useState({
    name: '',
    trackTag: '新农科组',
    school: '厦门大学',
    leader: '',
  });

  const safeSpaces = spaces && spaces.length > 0 ? spaces : [];
  const activeSpace = safeSpaces.find(s => s.id === activeSpaceId) || safeSpaces[0];

  const handleCopy = (text: string, type: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedItem(type);
    setTimeout(() => setCopiedItem(null), 1800);
  };

  const handleSyncClick = (spaceId: string) => {
    setIsSyncing(true);
    onSyncWorkspace(spaceId);
    setTimeout(() => {
      setIsSyncing(false);
    }, 900);
  };

  const handleCreateSpaceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSpaceForm.name.trim()) return;
    onCreateSpace(newSpaceForm);
    setShowCreateSpaceModal(false);
    setNewSpaceForm({
      name: '',
      trackTag: '新农科组',
      school: '厦门大学',
      leader: '',
    });
  };

  // Grouped navigation categories
  const navGroups = [
    {
      groupName: '智能体统一入口',
      items: [
        { id: 'coach', label: '新建会话', icon: Plus, prd: 'Hero', highlight: true },
      ]
    },
    /*
    {
      groupName: '项目管理',
      items: [
        { id: 'screening', label: '项目列表', icon: CheckSquare, prd: 'P0' },
      ]
    },
    {
      groupName: '深度诊断引擎',
      items: [
        { id: 'coaching', label: '4.2 诊断与指导', icon: Cpu, prd: 'P0' },
        { id: 'mockqa', label: '4.3 模拟答辩', icon: MessageSquare, prd: 'P1' },
      ]
    },
    {
      groupName: '经验沉淀与运营',
      items: [
        { id: 'skills', label: '专家经验库', icon: BookOpen, prd: 'P1' },
        { id: 'cases', label: '历史案例库', icon: Database, prd: 'P1' },
        { id: 'dashboard', label: '数据看板', icon: BarChart3, prd: 'P2' },
      ]
    }
    */
  ];

  const handleItemClick = (id: string) => {
    if (id === 'coach') {
      setActiveTab('coach');
      onCreateSession('none');
      setIsOpenMobile(false);
      return;
    }
    setActiveTab(id);
    setIsOpenMobile(false);
  };

  const handleStartScreeningAction = (e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering double click events
    setActiveTab('quick-screening');
    onTriggerScreening();
    setIsOpenMobile(false);
  };

  // Sidebar content component (reused for desktop and mobile slide-out)
  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white select-none">
      {/* Brand Header */}
      <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center space-x-3 flex-shrink-0">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 p-[1px] shadow-md shadow-blue-500/10 flex-shrink-0">
          <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-white">
            <Cpu className="h-4.5 w-4.5 text-blue-600 animate-pulse" />
          </div>
        </div>
        <div className="min-w-0">
          <h2 className="font-display font-bold text-sm tracking-tight text-gray-900 truncate">
            创新大赛AI助手
          </h2>
          <span className="inline-block mt-0.5 text-[9px] px-1.5 py-0.2 rounded-full bg-blue-50 border border-blue-100 text-blue-600 font-mono scale-95 origin-left">
            备赛教练与统一工作台
          </span>
        </div>
      </div>

      {/* Nav Groups Container */}
      <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-5">
        {navGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-1">
            {/* Category label */}
            <span className="px-3 text-[10px] font-mono font-bold uppercase text-gray-400 tracking-wider block">
              {group.groupName}
            </span>
            
            {/* Items inside category */}
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                const isProjectList = item.id === 'screening';
                const isQuickScreeningActive = activeTab === 'quick-screening';

                return (
                  <div key={item.id} className="space-y-1">
                    <button
                      onClick={() => handleItemClick(item.id)}
                      className={`w-full relative flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group ${
                        isActive
                          ? 'text-white bg-[#0071E3] shadow-sm font-semibold'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <Icon className={`h-4 w-4 flex-shrink-0 transition-transform ${
                          isActive ? 'scale-110 text-white' : 'text-gray-400 group-hover:text-gray-600'
                        }`} />
                        <span className="truncate">{item.label}</span>
                      </div>

                      {/* Right indicator or tag */}
                      <div className="flex items-center space-x-1 flex-shrink-0">
                        <span className={`text-[8px] px-1 rounded-sm scale-90 font-mono ${
                          item.prd === 'Hero'
                            ? isActive
                              ? 'bg-white/20 text-white'
                              : 'bg-blue-100 text-blue-800 border border-blue-200 font-bold'
                            : item.prd === 'P0' 
                              ? isActive 
                                ? 'bg-white/20 text-white'
                                : 'bg-red-50 text-red-600 border border-red-100' 
                              : item.prd === 'P1'
                                ? isActive
                                  ? 'bg-white/20 text-white'
                                  : 'bg-amber-50 text-amber-700 border border-amber-100'
                                : isActive
                                  ? 'bg-white/20 text-white'
                                  : 'bg-gray-100 text-gray-500 border border-gray-200'
                        }`}>
                          {item.id === 'coach' ? 'AI教练' : item.prd === 'Hero' ? '统一入口' : item.prd}
                        </span>
                      </div>
                    </button>

                    {/* Left sidebar project list quick screening button */}
                    {isProjectList && (
                      <div className="mt-1 ml-5 pr-1.5 pl-1">
                        <button
                          onClick={handleStartScreeningAction}
                          className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-[10px] font-medium tracking-tight transition-all active:scale-[0.98] group/btn ${
                            isQuickScreeningActive
                              ? 'text-white bg-[#0071E3] shadow-sm font-semibold'
                              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                          }`}
                          id="sidebar-btn-quick-screening"
                        >
                          <div className="flex items-center space-x-1.5">
                            <Zap className={`h-3 w-3 ${isQuickScreeningActive ? 'text-amber-300' : 'text-amber-500'}`} />
                            <span>⚡ 智能初筛</span>
                          </div>
                          <ChevronRight className={`h-2.5 w-2.5 transition-transform group-hover/btn:translate-x-0.5 ${
                            isQuickScreeningActive ? 'text-white/80' : 'text-gray-400 group-hover/btn:text-gray-600'
                          }`} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* ============================================================== */}
        {/* SECTION: 会话 (收录无工作空间的会话，形态跟“空间”一样) */}
        {/* ============================================================== */}
        <div className="pt-3 border-t border-gray-200/80 space-y-1">
          {/* 大标题 “会话” */}
          <div className="flex items-center justify-between px-1.5 py-1">
            <button
              onClick={() => setIsSessionsExpanded(!isSessionsExpanded)}
              className="flex items-center space-x-1.5 text-xs font-semibold text-gray-700 hover:text-gray-900 transition-colors"
              title="折叠/展开会话列表"
            >
              <span>会话 ({standaloneSessions.length})</span>
              <ChevronDown 
                className={`h-3.5 w-3.5 text-gray-400 transition-transform duration-200 ${
                  isSessionsExpanded ? '' : '-rotate-90'
                }`} 
              />
            </button>
            <button
              onClick={() => onCreateSession('none')}
              className="p-1 rounded-md text-gray-400 hover:text-blue-600 hover:bg-gray-100 transition-colors"
              title="新建独立会话"
              id="btn-create-standalone-session"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* 下面是无工作空间的逐个会话列表 */}
          {isSessionsExpanded && (
            <div className="space-y-0.5 mt-0.5">
              {standaloneSessions.map((sess) => {
                const isSessionActive = activeTab === 'coach' && (activeSpaceId === 'none' || !activeSpaceId) && sess.id === activeSessionId;
                return (
                  <div
                    key={sess.id}
                    onClick={() => {
                      onSelectSession('none', sess.id);
                      setActiveTab('coach');
                      setIsOpenMobile(false);
                    }}
                    className={`flex items-center justify-between py-1.5 px-2 rounded-lg text-xs transition-colors cursor-pointer group/sess ${
                      isSessionActive
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/70'
                    }`}
                  >
                    <div className="flex items-center space-x-2 min-w-0 flex-1">
                      <MessageSquare className={`h-3.5 w-3.5 flex-shrink-0 ${
                        isSessionActive ? 'text-blue-600' : 'text-gray-400 group-hover/sess:text-gray-600'
                      }`} />
                      <span className="truncate pr-1 text-xs" title={cleanSessionTitle(sess.title)}>
                        {cleanSessionTitle(sess.title)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1 flex-shrink-0">
                      <span className={`text-[10px] font-mono whitespace-nowrap ${
                        isSessionActive ? 'text-blue-600 font-medium' : 'text-gray-400'
                      }`}>
                        {sess.time}
                      </span>
                      {onDeleteSession && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteSession('none', sess.id);
                          }}
                          className="opacity-0 group-hover/sess:opacity-100 p-0.5 hover:text-rose-600 rounded text-gray-400 transition-opacity"
                          title="删除会话"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
              {standaloneSessions.length === 0 && (
                <div className="px-2 py-2 text-[11px] text-gray-400 italic text-center">
                  暂无独立会话，点击 + 新建
                </div>
              )}
            </div>
          )}
        </div>

        {/* ============================================================== */}
        {/* SECTION: 空间 (Clean Minimalist Tree View matching screenshot) */}
        {/* ============================================================== */}
        <div className="pt-3 border-t border-gray-200/80 space-y-1">
          {/* 大标题 “空间” */}
          <div className="flex items-center justify-between px-1.5 py-1">
            <button
              onClick={() => setIsSpacesExpanded(!isSpacesExpanded)}
              className="flex items-center space-x-1.5 text-xs font-semibold text-gray-700 hover:text-gray-900 transition-colors"
              title="折叠/展开空间列表"
            >
              <span>空间 ({safeSpaces.length})</span>
              <ChevronDown 
                className={`h-3.5 w-3.5 text-gray-400 transition-transform duration-200 ${
                  isSpacesExpanded ? '' : '-rotate-90'
                }`} 
              />
            </button>
            <button
              onClick={() => setShowCreateSpaceModal(true)}
              className="p-1 rounded-md text-gray-400 hover:text-blue-600 hover:bg-gray-100 transition-colors"
              title="新建空间"
              id="btn-create-space"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* 下面是逐个空间 */}
          {isSpacesExpanded && (
            <div className="space-y-0.5 mt-0.5">
              {safeSpaces.map((space) => {
                const isExpanded = expandedSpaceIds.has(space.id);
                const isSpaceActive = space.id === activeSpaceId;

                return (
                  <div key={space.id} className="space-y-0.5">
                    {/* 逐个空间行 */}
                    <div 
                      className={`flex items-center justify-between px-2 py-1.5 rounded-lg group transition-colors cursor-pointer ${
                        isSpaceActive ? 'text-gray-900 font-medium' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100/60'
                      }`}
                      onClick={() => {
                        toggleSpace(space.id);
                        if (space.id !== activeSpaceId) {
                          onSelectSpace(space.id);
                        }
                      }}
                    >
                      {/* Folder 图标 + 空间名称 + 展开箭头 */}
                      <div className="flex items-center space-x-2 min-w-0 flex-1">
                        <Folder className="h-3.5 w-3.5 text-gray-500 flex-shrink-0" />
                        <span className="text-xs truncate">{space.name}</span>
                        <ChevronDown 
                          className={`h-3 w-3 text-gray-400 flex-shrink-0 transition-transform duration-150 ${
                            isExpanded ? '' : '-rotate-90'
                          }`} 
                        />
                      </div>

                      {/* 每个空间旁边有一个小的新建会话按钮，不用有文字，只是一个加号 */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onCreateSession(space.id);
                        }}
                        className="p-1 text-gray-400 hover:text-blue-600 hover:bg-gray-100 rounded transition-colors"
                        title="新建会话"
                        id={`btn-new-session-${space.id}`}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* 空间下面是逐个 sessions */}
                    {isExpanded && (
                      <div className="pl-6 pr-1 space-y-0.5">
                        {space.sessions.map((sess) => {
                          const isSessionActive = activeTab === 'coach' && isSpaceActive && sess.id === activeSessionId;
                          return (
                            <div
                              key={sess.id}
                              onClick={() => {
                                onSelectSession(space.id, sess.id);
                                setActiveTab('coach');
                                setIsOpenMobile(false);
                              }}
                              className={`flex items-center justify-between py-1.5 px-2 rounded-lg text-xs transition-colors cursor-pointer group/sess ${
                                isSessionActive
                                  ? 'bg-blue-50 text-blue-700 font-medium'
                                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/70'
                              }`}
                            >
                              <div className="flex items-center min-w-0 pr-1.5 space-x-1.5 flex-1">
                                <span className="truncate text-xs" title={cleanSessionTitle(sess.title)}>
                                  {cleanSessionTitle(sess.title)}
                                </span>
                              </div>
                              <div className="flex items-center space-x-1 flex-shrink-0">
                                <span className={`text-[10px] font-mono whitespace-nowrap ${
                                  isSessionActive ? 'text-blue-600 font-medium' : 'text-gray-400'
                                }`}>
                                  {sess.time}
                                </span>
                                {onDeleteSession && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onDeleteSession(space.id, sess.id);
                                    }}
                                    className="opacity-0 group-hover/sess:opacity-100 p-0.5 hover:text-rose-600 rounded text-gray-400 transition-opacity"
                                    title="删除会话"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* User profile section at bottom */}
      <div className="p-3.5 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="h-8.5 w-8.5 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-xs font-semibold text-white border border-blue-200 shadow-sm">
            李
          </div>
          <div className="min-w-0">
            <span className="text-xs font-semibold text-gray-700 block truncate">李组委</span>
            <span className="text-[10px] text-gray-400 font-mono block">评审办·赛事主管</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Mobile top bar */}
      <div className="md:hidden flex items-center justify-between h-14 px-4 bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="flex items-center space-x-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
            <Cpu className="h-3.5 w-3.5" />
          </div>
          <span className="font-display font-bold text-xs tracking-tight text-gray-900">
            创新大赛AI助手
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {/*
          <button
            onClick={onTriggerScreening}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            <Zap className="h-2.5 w-2.5 text-amber-300 animate-pulse" />
            <span>智能初筛</span>
          </button>
          */}
          
          <button
            onClick={() => setIsOpenMobile(!isOpenMobile)}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 active:bg-gray-200 transition-all"
          >
            {isOpenMobile ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* 2. Mobile Nav Drawer Overlays */}
      <AnimatePresence>
        {isOpenMobile && (
          <>
            {/* Dark tint backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpenMobile(false)}
              className="fixed inset-0 bg-black z-40 md:hidden"
            />
            {/* Drawer container */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed top-0 bottom-0 left-0 w-72 bg-white border-r border-gray-200 z-50 md:hidden shadow-2xl h-screen"
            >
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 3. Desktop Vertical Sidebar Panel */}
      <aside className="hidden md:block w-64 md:w-72 border-r border-gray-200 h-screen sticky top-0 flex-shrink-0 z-40 bg-white shadow-sm">
        <SidebarContent />
      </aside>

      {/* 4. Modal: Create New Space */}
      {showCreateSpaceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-gray-100 space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="h-7 w-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <FolderKanban className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-gray-900">新建备赛空间与独立工作空间</h3>
                  <p className="text-[10px] text-gray-500">
                    每个空间拥有专属 sessions、本地目录和云端同步节点
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateSpaceModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSpaceSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                  空间 / 项目名称 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="例如：光子芯海：硅基片上光互连通信模组"
                  value={newSpaceForm.name}
                  onChange={(e) => setNewSpaceForm({ ...newSpaceForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                    参赛赛道 / 组别
                  </label>
                  <select
                    value={newSpaceForm.trackTag}
                    onChange={(e) => setNewSpaceForm({ ...newSpaceForm, trackTag: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  >
                    <option value="新农科组">新农科组</option>
                    <option value="科技创新">科技创新组</option>
                    <option value="医疗健康">医疗健康组</option>
                    <option value="高端装备">高端装备组</option>
                    <option value="乡村振兴">乡村振兴组</option>
                    <option value="商业模式">商业模式组</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                    团队负责人
                  </label>
                  <input
                    type="text"
                    placeholder="如：林小满"
                    value={newSpaceForm.leader}
                    onChange={(e) => setNewSpaceForm({ ...newSpaceForm, leader: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                  所属高校
                </label>
                <input
                  type="text"
                  placeholder="如：厦门大学"
                  value={newSpaceForm.school}
                  onChange={(e) => setNewSpaceForm({ ...newSpaceForm, school: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>

              {/* Auto Workspace Config Preview */}
              <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 space-y-1.5 text-[10px]">
                <div className="font-semibold text-gray-700 flex items-center space-x-1">
                  <HardDrive className="h-3 w-3 text-blue-600" />
                  <span>自动分配的工作空间</span>
                </div>
                <p className="text-gray-500 flex items-center space-x-1 font-mono truncate">
                  <Folder className="h-2.5 w-2.5 text-amber-500 flex-shrink-0" />
                  <span>本地路径: ~/Workspaces/{newSpaceForm.name ? newSpaceForm.name.slice(0, 10) : 'new-project'}</span>
                </p>
                <p className="text-gray-500 flex items-center space-x-1 font-mono truncate">
                  <Cloud className="h-2.5 w-2.5 text-sky-500 flex-shrink-0" />
                  <span>云端路径: oss://innov-cloud/spaces/sp-{Date.now().toString().slice(-4)}/</span>
                </p>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowCreateSpaceModal(false)}
                  className="px-3 py-1.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-[#0071E3] hover:bg-blue-600 text-white font-semibold transition-colors shadow-xs"
                >
                  创建并进入空间
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

