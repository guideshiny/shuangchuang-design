/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import SceneAICoach from './components/SceneAICoach';
import SceneScreening from './components/SceneScreening';
import SceneCoaching from './components/SceneCoaching';
import SceneMockQA from './components/SceneMockQA';
import SceneSkills from './components/SceneSkills';
import SceneCases from './components/SceneCases';
import SceneDashboard from './components/SceneDashboard';
import { Project, ExpertSkill, ProjectSpace, CoachSession } from './types';
import { mockProjects, mockExpertSkills } from './data/mockData';
import { initialProjectSpaces } from './data/mockSpaceData';
import { Shield, Sparkles } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('coach');
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [expertSkills, setExpertSkills] = useState<ExpertSkill[]>(mockExpertSkills);
  const [screeningTriggerTime, setScreeningTriggerTime] = useState<number>(0);

  // Space Management State (Each space has sessions + independent workspace with local path and cloud bucket)
  const [spaces, setSpaces] = useState<ProjectSpace[]>(initialProjectSpaces);
  const [activeSpaceId, setActiveSpaceId] = useState<string>('none');
  const [activeSessionId, setActiveSessionId] = useState<string>('sess-init-none');

  // Standalone Sessions (无工作空间会话)
  const [standaloneSessions, setStandaloneSessions] = useState<CoachSession[]>([
    {
      id: 'sess-init-none',
      title: '备赛综合策略与政策咨询',
      time: '刚刚',
      preview: '探讨双创大赛赛道规则与综合策略'
    },
    {
      id: 'sess-none-2',
      title: '双创大赛赛道规则与打分要点',
      time: '昨天',
      preview: '探讨青年红色筑梦之旅赛道准入'
    }
  ]);
  
  // Real-time Expert Skill Sync logs fed from Scene 1
  const [skillUpdates, setSkillUpdates] = useState<Array<{ id: string; time: string; text: string }>>([
    {
      id: 'log-1',
      time: '10:14:02 AM',
      text: '系统检测到「智农飞手：林木视觉避障精细喷洒航测系统」田间柑橘增收数据完备，已对该赛道「社会价值」Skill 进行微调加固。'
    },
    {
      id: 'log-2',
      time: '02:45:18 PM',
      text: '评审组委会对「sNS-RNS 脑调控系统」临床三期金标准入组指标进行校验，校正了「科技创新赛道-技术壁垒审查」90分档位规则分布。'
    }
  ]);

  // Active space object
  const activeSpace = (activeSpaceId === 'none' || !activeSpaceId)
    ? null 
    : (spaces.find(s => s.id === activeSpaceId) || null);

  // Space handlers
  const handleSelectSpace = (spaceId: string) => {
    setActiveSpaceId(spaceId);
    if (spaceId === 'none') {
      return;
    }
    const targetSpace = spaces.find(s => s.id === spaceId);
    if (targetSpace && targetSpace.sessions.length > 0) {
      setActiveSessionId(targetSpace.activeSessionId || targetSpace.sessions[0].id);
    }
  };

  const handleSelectSession = (spaceId: string, sessionId: string) => {
    setActiveSpaceId(spaceId);
    setActiveSessionId(sessionId);
    if (spaceId !== 'none') {
      // Update activeSessionId inside space
      setSpaces(prev => prev.map(s => {
        if (s.id === spaceId) {
          return { ...s, activeSessionId: sessionId };
        }
        return s;
      }));
    }
  };

  const handleCreateSpace = (newSpaceData: { name: string; trackTag: string; school: string; leader: string }) => {
    const newId = `sp-${Date.now()}`;
    const slug = newSpaceData.name.trim().toLowerCase().replace(/[\s\W-]+/g, '') || 'project';
    const newSessionId = `sess-${Date.now()}`;

    const newSpace: ProjectSpace = {
      id: newId,
      name: newSpaceData.name,
      trackTag: newSpaceData.trackTag,
      school: newSpaceData.school || '创新示范高校',
      leader: newSpaceData.leader || '项目负责人',
      stage: 'L1',
      icon: '🚀',
      workspace: {
        localPath: `~/Workspaces/${slug}`,
        cloudBucket: `oss://innov-cloud/spaces/${slug}/`,
        cloudSyncStatus: 'synced',
        lastSyncTime: '刚刚',
        totalFiles: 1,
        syncRate: '100% 同步'
      },
      sessions: [
        {
          id: newSessionId,
          title: `${newSpaceData.name} · 初始备赛咨询`,
          time: '刚刚',
          preview: '咨询赛道准入条件与商业模式'
        }
      ],
      activeSessionId: newSessionId
    };

    setSpaces(prev => [newSpace, ...prev]);
    setActiveSpaceId(newId);
    setActiveSessionId(newSessionId);
    setActiveTab('coach');
  };

  const handleCreateSession = (spaceId: string = 'none') => {
    const newSessionId = `sess-${Date.now()}`;
    const newSession: CoachSession = {
      id: newSessionId,
      title: `新会话 · 备赛问答与策略诊断`,
      time: '刚刚',
      preview: '新建立的对话窗口'
    };

    if (!spaceId || spaceId === 'none') {
      setStandaloneSessions(prev => [newSession, ...prev]);
      setActiveSpaceId('none');
      setActiveSessionId(newSessionId);
      setActiveTab('coach');
      return;
    }

    setSpaces(prev => prev.map(s => {
      if (s.id === spaceId) {
        return {
          ...s,
          sessions: [newSession, ...s.sessions],
          activeSessionId: newSessionId
        };
      }
      return s;
    }));
    setActiveSpaceId(spaceId);
    setActiveSessionId(newSessionId);
    setActiveTab('coach');
  };

  const handleDeleteSession = (spaceId: string, sessionId: string) => {
    if (spaceId === 'none') {
      setStandaloneSessions(prev => {
        const filtered = prev.filter(s => s.id !== sessionId);
        if (activeSessionId === sessionId) {
          if (filtered.length > 0) {
            setActiveSessionId(filtered[0].id);
          } else {
            const fallbackId = `sess-${Date.now()}`;
            const fallbackSess: CoachSession = {
              id: fallbackId,
              title: '新备赛咨询会话',
              time: '刚刚',
              preview: '新建立的对话窗口'
            };
            setActiveSessionId(fallbackId);
            return [fallbackSess];
          }
        }
        return filtered;
      });
    } else {
      setSpaces(prev => prev.map(s => {
        if (s.id === spaceId) {
          const filtered = s.sessions.filter(sess => sess.id !== sessionId);
          let nextActiveId = s.activeSessionId;
          if (s.activeSessionId === sessionId) {
            nextActiveId = filtered[0]?.id || '';
          }
          return {
            ...s,
            sessions: filtered.length > 0 ? filtered : [
              { id: `sess-${Date.now()}`, title: '初始会话', time: '刚刚' }
            ],
            activeSessionId: nextActiveId || filtered[0]?.id || `sess-${Date.now()}`
          };
        }
        return s;
      }));
    }
  };

  const handleUpdateSessionTitle = (spaceId: string, sessionId: string, newTitle: string) => {
    if (spaceId === 'none') {
      setStandaloneSessions(prev => prev.map(s => s.id === sessionId ? { ...s, title: newTitle } : s));
    } else {
      setSpaces(prev => prev.map(sp => {
        if (sp.id === spaceId) {
          return {
            ...sp,
            sessions: sp.sessions.map(ss => ss.id === sessionId ? { ...ss, title: newTitle } : ss)
          };
        }
        return sp;
      }));
    }
  };

  const handleSyncWorkspace = (spaceId: string) => {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setSpaces(prev => prev.map(s => {
      if (s.id === spaceId) {
        return {
          ...s,
          workspace: {
            ...s.workspace,
            cloudSyncStatus: 'synced',
            lastSyncTime: `${nowTime} (已全量同步)`,
            syncRate: '100% 同步'
          }
        };
      }
      return s;
    }));
  };

  // Handler to receive expert adjustments from Scene 1 and append to Scene 4 logs
  const handleNotifySkillUpdate = (projectName: string, grade: string, reason: string) => {
    const newLog = {
      id: `log-override-${Date.now()}`,
      time: new Date().toLocaleTimeString(),
      text: `评委核定「${projectName}」等级为 ${grade} 级。反馈微调理由：「${reason}」。相关评审 Skill 参数已实时刷新。`
    };
    setSkillUpdates(prev => [newLog, ...prev]);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] selection:bg-blue-100 selection:text-blue-900 flex flex-col md:flex-row">
      {/* Left Sidebar Navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onTriggerScreening={() => setScreeningTriggerTime(Date.now())}
        spaces={spaces}
        standaloneSessions={standaloneSessions}
        activeSpaceId={activeSpaceId}
        activeSessionId={activeSessionId}
        onSelectSpace={handleSelectSpace}
        onSelectSession={handleSelectSession}
        onCreateSpace={handleCreateSpace}
        onCreateSession={handleCreateSession}
        onSyncWorkspace={handleSyncWorkspace}
        onDeleteSession={handleDeleteSession}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Dynamic top message ribbon (Apple.cn style announcement) */}
        <div className="bg-white border-b border-gray-200 py-2 text-center px-4 shadow-sm flex-shrink-0">
          <p className="text-[11px] font-medium text-gray-500 tracking-tight flex items-center justify-center space-x-1.5">
            <Sparkles className="h-3 w-3 text-[#0071E3] animate-pulse" />
            <span>创新大赛AI助手 · 空间与本地/云端工作空间已互通。支持多空间隔离、跨会话答辩诊断与专家经验回溯。</span>
          </p>
        </div>

        {/* Primary Content Screen switch */}
        <main className="flex-1 pb-16">
          {activeTab === 'coach' && (
            <SceneAICoach 
              onNavigateToScene={(sceneId) => setActiveTab(sceneId)} 
              activeSpace={activeSpace}
              activeSpaceId={activeSpaceId}
              spaces={spaces}
              standaloneSessions={standaloneSessions}
              onSelectSpace={handleSelectSpace}
              onCreateSpace={handleCreateSpace}
              activeSessionId={activeSessionId}
              onSelectSession={handleSelectSession}
              onCreateSession={handleCreateSession}
              onSyncWorkspace={handleSyncWorkspace}
              onUpdateSessionTitle={handleUpdateSessionTitle}
            />
          )}

          {/* 模块1：项目管理（已注释失效） */}
          {/*
          {(activeTab === 'screening' || activeTab === 'quick-screening') && (
            <SceneScreening 
              projects={projects} 
              setProjects={setProjects} 
              onNotifySkillUpdate={handleNotifySkillUpdate} 
              screeningTriggerTime={screeningTriggerTime}
            />
          )}
          */}

          {/* 模块2：深度诊断引擎（已注释失效） */}
          {/*
          {activeTab === 'coaching' && (
            <SceneCoaching 
              projects={projects} 
              setProjects={setProjects} 
            />
          )}
          {activeTab === 'mockqa' && (
            <SceneMockQA 
              projects={projects} 
            />
          )}
          */}

          {/* 模块3：经验沉淀与运营（已注释失效） */}
          {/*
          {activeTab === 'skills' && (
            <SceneSkills 
              expertSkills={expertSkills} 
              skillUpdates={skillUpdates} 
            />
          )}
          {activeTab === 'cases' && (
            <SceneCases />
          )}
          {activeTab === 'dashboard' && (
            <SceneDashboard 
              projects={projects} 
            />
          )}
          */}
        </main>


        {/* Apple.cn premium minimalist Footer */}
        <footer className="bg-white border-t border-gray-200 py-6 text-left flex-shrink-0 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-gray-400 font-mono gap-4">
              <div className="flex items-center space-x-1">
                <Shield className="h-3.5 w-3.5 text-gray-400" />
                <span>创新大赛AI助手 · 2026 赛事组委会全权所有</span>
              </div>
              <div className="flex space-x-4">
                <span>技术底座: Gemini LLM & RAG Vector Match</span>
                <span>版本: V1.2.0 Stable</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
