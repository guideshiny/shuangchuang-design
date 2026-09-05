import React, { useState } from 'react';
import { 
  BarChart3, 
  Layers, 
  Users, 
  CheckSquare, 
  Kanban, 
  UserCheck, 
  UsersRound, 
  BookOpen, 
  UploadCloud, 
  FileText, 
  Sparkles, 
  Target, 
  LogOut, 
  ChevronRight,
  ShieldCheck, 
  ChevronDown, 
  Database, 
  Award, 
  Building, 
  GraduationCap, 
  School, 
  Repeat,
  Bot,
  Cpu,
  MessageSquare,
  Folder,
  FolderKanban,
  Plus,
  Trash2,
  X,
  Swords,
  Workflow
} from 'lucide-react';
import { UserSession, ProjectSpace, CoachSession } from '../types';
import { cleanSessionTitle } from '../utils/titleUtils';

export type TabType = 
  | 'cockpit' 
  | 'screening' 
  | 'mentorship' 
  | 'supervision' 
  | 'milestones'
  | 'mentors_pool'
  | 'knowledge_base'
  | 'users_management'
  | 'teams_management'
  | 'my_project'
  | 'coach'
  | 'guidance_workbench'
  | 'defense_training';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  session: UserSession;
  onLogout: () => void;
  onOpenBatchImport: () => void;
  onOpenReportExport: () => void;
  onOpenRulesConfig: () => void;
  // Team Member Sessions & Spaces
  spaces?: ProjectSpace[];
  standaloneSessions?: CoachSession[];
  activeSpaceId?: string;
  activeSessionId?: string;
  onSelectSpace?: (spaceId: string) => void;
  onSelectSession?: (spaceId: string, sessionId: string) => void;
  onCreateSpace?: (newSpace: { name: string; trackTag: string; school: string; leader: string }) => void;
  onCreateSession?: (spaceId: string) => void;
  onDeleteSession?: (spaceId: string, sessionId: string) => void;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  session,
  onLogout,
  onOpenBatchImport,
  onOpenReportExport,
  onOpenRulesConfig,
  spaces = [],
  standaloneSessions = [],
  activeSpaceId = 'none',
  activeSessionId = '',
  onSelectSpace,
  onSelectSession,
  onCreateSpace,
  onCreateSession,
  onDeleteSession,
}: SidebarProps) {
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [showCreateSpaceModal, setShowCreateSpaceModal] = useState(false);
  const [isSessionsExpanded, setIsSessionsExpanded] = useState(true);
  const [isSpacesExpanded, setIsSpacesExpanded] = useState(true);
  const [expandedSpaceIds, setExpandedSpaceIds] = useState<Set<string>>(() => new Set(spaces.map(s => s.id)));

  // New Space Form State
  const [newSpaceForm, setNewSpaceForm] = useState({
    name: '',
    trackTag: '高教主赛道-创意组',
    school: session.university || '创新示范高校',
    leader: session.name || '项目负责人',
  });

  const safeSpaces = spaces && spaces.length > 0 ? spaces : [];

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

  const handleCreateSpaceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSpaceForm.name.trim()) return;
    onCreateSpace?.(newSpaceForm);
    setShowCreateSpaceModal(false);
    setNewSpaceForm({
      name: '',
      trackTag: '高教主赛道-创意组',
      school: session.university || '创新示范高校',
      leader: session.name || '项目负责人',
    });
  };

  // Role-based Nav configurations
  const getNavGroups = () => {
    if (session.role === 'team_member') {
      return [
        {
          groupName: 'AI伴学与答辩实训',
          items: [
            { id: 'coach' as TabType, label: 'AI备赛教练 (统一入口)', icon: Bot, badge: 'Hero', highlight: false },
            { id: 'guidance_workbench' as TabType, label: '全链路指导工作台', icon: Workflow, badge: 'L1~L6', highlight: true },
            { id: 'defense_training' as TabType, label: '模拟评审与答辩训练', icon: Swords, badge: '实训', highlight: false },
          ]
        },
        {
          groupName: '项目执行与推进管线',
          items: [
            { id: 'my_project' as TabType, label: '我的参赛项目工作台', icon: Target, badge: 'AI对标' },
            { id: 'supervision' as TabType, label: '导师整改与工单复核', icon: CheckSquare, badge: '闭环' },
            { id: 'milestones' as TabType, label: '项目备赛阶段管线', icon: Kanban, badge: '5阶' },
            { id: 'teams_management' as TabType, label: '团队架构与分工审查', icon: UsersRound, badge: '合规' },
          ]
        },
      ];
    }

    if (session.role === 'mentor') {
      return [
        {
          groupName: '导师评审工作台',
          items: [
            { id: 'supervision' as TabType, label: '项目辅导与督导工单', icon: CheckSquare, badge: '问诊督导' },
          ]
        },
        {
          groupName: '项目遴选与调度',
          items: [
            { id: 'mentorship' as TabType, label: '辅导调度与排期日历', icon: Users, badge: '排期' },
            { id: 'screening' as TabType, label: '对标初筛评审工作台', icon: Layers, badge: '2026细则' },
          ]
        },
        {
          groupName: '导师专家资源库',
          items: [
            { id: 'mentors_pool' as TabType, label: '我的导师智库履历', icon: Award, badge: '专家库' },
            { id: 'knowledge_base' as TabType, label: '2026大赛官方评审规程', icon: Database, badge: '细则' },
          ]
        },
      ];
    }

    // school_admin and system_admin get full access
    return [
      {
        groupName: '决策中枢驾驶舱',
        items: [
          { id: 'cockpit' as TabType, label: '备赛数据驾驶舱', icon: BarChart3, badge: 'AI决策' },
        ]
      },
      {
        groupName: '备赛培育核心',
        items: [
          { id: 'screening' as TabType, label: '智能对标初筛与排名', icon: Layers, badge: '2026细则' },
          { id: 'mentorship' as TabType, label: '常态化辅导与调度', icon: Users, badge: '排期' },
          { id: 'supervision' as TabType, label: '辅导资产沉淀与督导', icon: CheckSquare, badge: '闭环' },
          { id: 'milestones' as TabType, label: '重点项目全流程看板', icon: Kanban, badge: '5阶' },
        ]
      },
      {
        groupName: session.role === 'system_admin' ? '全平台资源与权限总控' : '校本智库与组织管理',
        items: [
          { id: 'mentors_pool' as TabType, label: '双创导师智库管理', icon: Award, badge: '专家库' },
          { id: 'knowledge_base' as TabType, label: session.university ? `${session.university}双创智库` : '学校知识库管理', icon: Database, badge: '校内智库' },
          { id: 'users_management' as TabType, label: '用户与权限管理', icon: UserCheck, badge: '全员' },
          { id: 'teams_management' as TabType, label: '项目团队架构管理', icon: UsersRound, badge: '合规' },
        ]
      },
    ];
  };

  const navGroups = getNavGroups();

  return (
    <aside 
      id="app-sidebar"
      className="w-64 xl:w-72 bg-white border-r border-slate-200 flex flex-col h-screen shrink-0 select-none z-30 transition-all duration-200"
    >
      {/* Sidebar Header: Logo & Platform Title & University Badge */}
      <div className="h-16 px-4 xl:px-5 border-b border-slate-200 flex items-center space-x-3 bg-white">
        <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-sky-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-sm shadow-sky-500/20 shrink-0">
          <Target className="h-5 w-5 text-white" />
        </div>
        <div className="overflow-hidden min-w-0">
          <div className="flex items-center space-x-1.5">
            <span className="font-bold text-xs xl:text-sm tracking-tight text-slate-900 truncate">
              {session.university ? `${session.university}双创中枢` : '高校双创管理中枢'}
            </span>
            <span className="text-[10px] bg-sky-50 text-sky-700 border border-sky-200 px-1 py-0.2 rounded font-medium shrink-0">
              2026
            </span>
          </div>
          <div className="flex items-center space-x-1.5 text-[11px] text-slate-400 truncate">
            <span className="truncate">
              {session.role === 'team_member' && '【项目组成员】专属端'}
              {session.role === 'school_admin' && '【学校管理端】决策平台'}
              {session.role === 'mentor' && '【导师端】评审与问诊'}
              {session.role === 'system_admin' && '【Admin端】平台总管'}
            </span>
          </div>
        </div>
      </div>

      {/* Sidebar Nav Items (Scrollable Body) */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5 text-xs">
        {navGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-1">
            <div className="px-3 mb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {group.groupName}
            </div>
            <nav className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    id={`sidebar-tab-${item.id}`}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-medium transition ${
                      isActive
                        ? 'bg-sky-50 text-sky-700 font-semibold shadow-2xs border border-sky-100'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 truncate">
                      <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-sky-600' : 'text-slate-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0 ${
                      item.badge === 'Hero'
                        ? isActive
                          ? 'bg-sky-600 text-white font-bold'
                          : 'bg-sky-100 text-sky-800 font-bold border border-sky-200'
                        : item.badge === 'P0'
                          ? isActive
                            ? 'bg-rose-500 text-white font-bold'
                            : 'bg-rose-50 text-rose-700 border border-rose-100'
                          : isActive ? 'bg-sky-100 text-sky-800' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {item.badge}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>
        ))}

        {/* Team Member: 会话列表 (收录无工作空间的独立会话) */}
        {session.role === 'team_member' && (
          <>
            <div className="pt-3 border-t border-slate-200/80 space-y-1">
              <div className="flex items-center justify-between px-1.5 py-1">
                <button
                  onClick={() => setIsSessionsExpanded(!isSessionsExpanded)}
                  className="flex items-center space-x-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors"
                  title="折叠/展开会话列表"
                >
                  <span>会话 ({standaloneSessions.length})</span>
                  <ChevronDown 
                    className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${
                      isSessionsExpanded ? '' : '-rotate-90'
                    }`} 
                  />
                </button>
                <button
                  onClick={() => {
                    onCreateSession?.('none');
                    setActiveTab('coach');
                  }}
                  className="p-1 rounded-md text-slate-400 hover:text-sky-600 hover:bg-slate-100 transition-colors"
                  title="新建独立会话"
                  id="btn-create-standalone-session"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              {isSessionsExpanded && (
                <div className="space-y-0.5 mt-0.5">
                  {standaloneSessions.map((sess) => {
                    const isSessionActive = activeTab === 'coach' && (activeSpaceId === 'none' || !activeSpaceId) && sess.id === activeSessionId;
                    return (
                      <div
                        key={sess.id}
                        onClick={() => {
                          onSelectSession?.('none', sess.id);
                          setActiveTab('coach');
                        }}
                        className={`flex items-center justify-between py-1.5 px-2 rounded-lg text-xs transition-colors cursor-pointer group/sess ${
                          isSessionActive
                            ? 'bg-sky-50 text-sky-700 font-medium'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                        }`}
                      >
                        <div className="flex items-center space-x-2 min-w-0 flex-1">
                          <MessageSquare className={`h-3.5 w-3.5 flex-shrink-0 ${
                            isSessionActive ? 'text-sky-600' : 'text-slate-400 group-hover/sess:text-slate-600'
                          }`} />
                          <span className="truncate pr-1 text-xs" title={cleanSessionTitle(sess.title)}>
                            {cleanSessionTitle(sess.title)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1 flex-shrink-0">
                          <span className={`text-[10px] font-mono whitespace-nowrap ${
                            isSessionActive ? 'text-sky-600 font-medium' : 'text-slate-400'
                          }`}>
                            {sess.time}
                          </span>
                          {onDeleteSession && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteSession('none', sess.id);
                              }}
                              className="opacity-0 group-hover/sess:opacity-100 p-0.5 hover:text-rose-600 rounded text-slate-400 transition-opacity"
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
                    <div className="px-2 py-2 text-[11px] text-slate-400 italic text-center">
                      暂无独立会话，点击 + 新建
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Team Member: 空间列表 (每个空间包含独立工作空间与专属会话) */}
            <div className="pt-3 border-t border-slate-200/80 space-y-1">
              <div className="flex items-center justify-between px-1.5 py-1">
                <button
                  onClick={() => setIsSpacesExpanded(!isSpacesExpanded)}
                  className="flex items-center space-x-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors"
                  title="折叠/展开空间列表"
                >
                  <span>空间 ({safeSpaces.length})</span>
                  <ChevronDown 
                    className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${
                      isSpacesExpanded ? '' : '-rotate-90'
                    }`} 
                  />
                </button>
                <button
                  onClick={() => setShowCreateSpaceModal(true)}
                  className="p-1 rounded-md text-slate-400 hover:text-sky-600 hover:bg-slate-100 transition-colors"
                  title="新建备赛空间"
                  id="btn-create-space"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              {isSpacesExpanded && (
                <div className="space-y-0.5 mt-0.5">
                  {safeSpaces.map((space) => {
                    const isExpanded = expandedSpaceIds.has(space.id);
                    const isSpaceActive = space.id === activeSpaceId;

                    return (
                      <div key={space.id} className="space-y-0.5">
                        <div 
                          className={`flex items-center justify-between px-2 py-1.5 rounded-lg group transition-colors cursor-pointer ${
                            isSpaceActive ? 'text-slate-900 font-medium bg-slate-50' : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100/60'
                          }`}
                          onClick={() => {
                            toggleSpace(space.id);
                            if (space.id !== activeSpaceId) {
                              onSelectSpace?.(space.id);
                            }
                          }}
                        >
                          <div className="flex items-center space-x-2 min-w-0 flex-1">
                            <Folder className="h-3.5 w-3.5 text-slate-500 flex-shrink-0" />
                            <span className="text-xs truncate">{space.name}</span>
                            <ChevronDown 
                              className={`h-3 w-3 text-slate-400 flex-shrink-0 transition-transform duration-150 ${
                                isExpanded ? '' : '-rotate-90'
                              }`} 
                            />
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onCreateSession?.(space.id);
                              setActiveTab('coach');
                            }}
                            className="p-1 text-slate-400 hover:text-sky-600 hover:bg-slate-100 rounded transition-colors"
                            title="新建空间专属会话"
                            id={`btn-new-session-${space.id}`}
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        {isExpanded && (
                          <div className="pl-5 pr-1 space-y-0.5">
                            {space.sessions.map((sess) => {
                              const isSessionActive = activeTab === 'coach' && isSpaceActive && sess.id === activeSessionId;
                              return (
                                <div
                                  key={sess.id}
                                  onClick={() => {
                                    onSelectSession?.(space.id, sess.id);
                                    setActiveTab('coach');
                                  }}
                                  className={`flex items-center justify-between py-1.5 px-2 rounded-lg text-xs transition-colors cursor-pointer group/sess ${
                                    isSessionActive
                                      ? 'bg-sky-50 text-sky-700 font-medium'
                                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                                  }`}
                                >
                                  <div className="flex items-center min-w-0 pr-1.5 space-x-1.5 flex-1">
                                    <span className="truncate text-xs" title={cleanSessionTitle(sess.title)}>
                                      {cleanSessionTitle(sess.title)}
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-1 flex-shrink-0">
                                    <span className={`text-[10px] font-mono whitespace-nowrap ${
                                      isSessionActive ? 'text-sky-600 font-medium' : 'text-slate-400'
                                    }`}>
                                      {sess.time}
                                    </span>
                                    {onDeleteSession && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onDeleteSession(space.id, sess.id);
                                        }}
                                        className="opacity-0 group-hover/sess:opacity-100 p-0.5 hover:text-rose-600 rounded text-slate-400 transition-opacity"
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
          </>
        )}

        {/* 常用捷径与工具 */}
        <div>
          <div className="px-3 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            备赛捷径与工具
          </div>
          <div className="space-y-1">
            <button
              id="sidebar-btn-rules"
              onClick={onOpenRulesConfig}
              className="w-full flex items-center justify-between px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition text-left"
            >
              <div className="flex items-center space-x-2.5">
                <BookOpen className="h-4 w-4 text-sky-600 shrink-0" />
                <span>2026官方评审细则</span>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
            </button>

            {(session.role === 'school_admin' || session.role === 'system_admin') && (
              <>
                <button
                  id="sidebar-btn-import"
                  onClick={onOpenBatchImport}
                  className="w-full flex items-center justify-between px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition text-left"
                >
                  <div className="flex items-center space-x-2.5">
                    <UploadCloud className="h-4 w-4 text-indigo-600 shrink-0" />
                    <span>海量项目智能导入</span>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
                </button>

                <button
                  id="sidebar-btn-report"
                  onClick={onOpenReportExport}
                  className="w-full flex items-center justify-between px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition text-left"
                >
                  <div className="flex items-center space-x-2.5">
                    <FileText className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>阶段复盘汇报生成</span>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Fixed Personal Account at Bottom (展示当前登录端与高校) */}
      <div className="mt-auto border-t border-slate-200 p-3 bg-slate-50/80 relative">
        <div 
          id="sidebar-user-card"
          onClick={() => setShowAccountMenu(!showAccountMenu)}
          className="flex items-center justify-between p-2 rounded-xl hover:bg-white border border-transparent hover:border-slate-200 transition cursor-pointer shadow-2xs"
        >
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="relative shrink-0">
              <img
                src={session.avatar}
                alt={session.name}
                className="h-9 w-9 rounded-full object-cover border border-slate-200"
              />
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-white" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-1.5">
                <span className="text-xs font-bold text-slate-800 truncate">{session.name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-medium shrink-0 ${
                  session.role === 'team_member' ? 'bg-sky-100 text-sky-800' :
                  session.role === 'school_admin' ? 'bg-blue-100 text-blue-800' :
                  session.role === 'mentor' ? 'bg-amber-100 text-amber-800' : 'bg-purple-100 text-purple-800'
                }`}>
                  {session.roleLabel}
                </span>
              </div>
              <div className="text-[11px] text-slate-500 truncate flex items-center space-x-1">
                {session.university && (
                  <span className="font-medium text-slate-700 truncate">{session.university}</span>
                )}
                {session.college && (
                  <span className="truncate">· {session.college}</span>
                )}
              </div>
            </div>
          </div>
          <ChevronDown className="h-4 w-4 text-slate-400 shrink-0 ml-1" />
        </div>

        {/* Account Menu Popover */}
        {showAccountMenu && (
          <div 
            id="sidebar-account-popover"
            className="absolute bottom-full left-3 right-3 mb-2 bg-white border border-slate-200 rounded-xl shadow-xl p-2.5 z-50 text-xs text-slate-700 animate-in fade-in slide-in-from-bottom-2"
          >
            <div className="px-2.5 py-2 border-b border-slate-100">
              <div className="font-semibold text-slate-900 flex items-center justify-between">
                <span>{session.name}</span>
                <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                  {session.account}
                </span>
              </div>
              {session.university && (
                <div className="text-[11px] text-sky-700 font-medium mt-1 flex items-center">
                  <Building className="h-3 w-3 mr-1 text-sky-600" />
                  所属高校：{session.university}
                </div>
              )}
              <div className="text-[11px] text-slate-400 mt-0.5">
                {session.majorOrTitle || session.college}
              </div>
            </div>

            <div className="py-1 space-y-0.5">
              <button 
                onClick={() => {
                  onLogout();
                  setShowAccountMenu(false);
                }}
                className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg hover:bg-sky-50 text-sky-700 transition text-left font-medium"
              >
                <Repeat className="h-3.5 w-3.5 text-sky-600" />
                <span>切换登录端 / 切换账号</span>
              </button>

              {(session.role === 'school_admin' || session.role === 'system_admin') && (
                <button 
                  onClick={() => {
                    setActiveTab('users_management');
                    setShowAccountMenu(false);
                  }}
                  className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-50 transition text-left"
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-slate-500" />
                  <span>全员权限与角色分配</span>
                </button>
              )}
            </div>

            <div className="pt-1 border-t border-slate-100">
              <button 
                onClick={() => {
                  onLogout();
                  setShowAccountMenu(false);
                }}
                className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition text-left font-medium"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>退出登录</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Create New Space */}
      {showCreateSpaceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="h-7 w-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
                  <FolderKanban className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">新建备赛空间与独立工作台</h3>
                  <p className="text-[10px] text-slate-500">
                    每个空间拥有专属 sessions、本地工作目录与云端同步节点
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateSpaceModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSpaceSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  空间 / 项目名称 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="例如：光子芯海：硅基片上光互连通信模组"
                  value={newSpaceForm.name}
                  onChange={(e) => setNewSpaceForm({ ...newSpaceForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">参赛赛道/组别</label>
                  <input
                    type="text"
                    value={newSpaceForm.trackTag}
                    onChange={(e) => setNewSpaceForm({ ...newSpaceForm, trackTag: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">负责人姓名</label>
                  <input
                    type="text"
                    placeholder="项目负责人"
                    value={newSpaceForm.leader}
                    onChange={(e) => setNewSpaceForm({ ...newSpaceForm, leader: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">申报高校</label>
                <input
                  type="text"
                  value={newSpaceForm.school}
                  onChange={(e) => setNewSpaceForm({ ...newSpaceForm, school: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateSpaceModal(false)}
                  className="px-3 py-1.5 rounded-xl text-slate-600 hover:bg-slate-100 font-medium"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold shadow-xs"
                >
                  确认创建
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </aside>
  );
}
