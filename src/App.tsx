import { useState } from 'react';
import Sidebar, { TabType } from './components/Sidebar';
import TopHeader from './components/TopHeader';
import CockpitDashboard from './components/CockpitDashboard';
import ScreeningHub from './components/ScreeningHub';
import MentorshipDispatch from './components/MentorshipDispatch';
import SupervisionClosure from './components/SupervisionClosure';
import MilestoneKanban from './components/MilestoneKanban';
import UserManagement from './components/UserManagement';
import TeamManagement from './components/TeamManagement';
import KnowledgeBaseManagement from './components/KnowledgeBaseManagement';
import MentorPoolManagement from './components/MentorPoolManagement';
import ProjectDetailDrawer from './components/ProjectDetailDrawer';
import RulesConfigModal from './components/RulesConfigModal';
import BatchImportModal from './components/BatchImportModal';
import ReportExportModal from './components/ReportExportModal';
import LoginPage from './components/LoginPage';
import ProjectMemberWorkbench from './components/ProjectMemberWorkbench';

// Shuangchuang-AI integrated components
import SceneAICoach from './components/SceneAICoach';
import SceneDefenseTraining from './components/SceneDefenseTraining';
import { SceneGuidanceWorkbench } from './components/SceneGuidanceWorkbench';

import { mockProjects } from './data/mockProjects';
import { mockMentors, mockWorkOrders, mockCohortTasks, mockAlerts } from './data/mockMentors';
import { initialProjectSpaces } from './data/mockSpaceData';
import { 
  ProjectItem, 
  SupervisionWorkOrder, 
  CohortBatchTask, 
  UserSession,
  ProjectSpace,
  CoachSession
} from './types';

export default function App() {
  // Authentication & Session State
  const [session, setSession] = useState<UserSession | null>(() => {
    try {
      const stored = localStorage.getItem('ai_studio_innovation_session_2026');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error(e);
    }
    return null;
  });

  const [activeTab, setActiveTab] = useState<TabType>(() => {
    if (session?.role === 'team_member') return 'coach';
    if (session?.role === 'mentor') return 'supervision';
    return 'cockpit';
  });
  
  // Data State - Existing Management Platform
  const [projects, setProjects] = useState<ProjectItem[]>(mockProjects);
  const [mentors, setMentors] = useState(mockMentors);
  const [workOrders, setWorkOrders] = useState<SupervisionWorkOrder[]>(mockWorkOrders);
  const [cohortTasks, setCohortTasks] = useState<CohortBatchTask[]>(mockCohortTasks);
  const [alerts] = useState(mockAlerts);

  // Data State - Shuangchuang-AI Spaces & Sessions
  const [spaces, setSpaces] = useState<ProjectSpace[]>(initialProjectSpaces);
  const [standaloneSessions, setStandaloneSessions] = useState<CoachSession[]>([
    {
      id: 'sess-init-1',
      title: '关于2026大赛评审规则重点解读与备赛战略答疑',
      time: '14:20',
      messages: [
        {
          id: 'msg-1',
          sender: 'coach',
          type: 'text',
          text: '你好！我是你的2026中国国际大学生创新大赛AI备赛教练。你可以随时向我提问关于大赛规则、商业计划书润色、PPT逻辑打磨或模拟答辩准备的问题。',
          timestamp: '14:20'
        }
      ]
    },
    {
      id: 'sess-init-2',
      title: '商业计划书执行摘要逻辑优化与价值主张提炼',
      time: '昨天',
      messages: [
        {
          id: 'msg-2',
          sender: 'coach',
          type: 'text',
          text: '在撰写执行摘要时，重点是要用三句话讲清楚：痛点真实性、技术壁垒不可替代性，以及商业化落地验证的扎实数据。',
          timestamp: '昨天'
        }
      ]
    }
  ]);
  const [activeSpaceId, setActiveSpaceId] = useState<string>('none');
  const [activeSessionId, setActiveSessionId] = useState<string>('sess-init-1');

  // Modals & Drawers State
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Global Active Project for Team Member (persists throughout session)
  const [activeTeamProjectId, setActiveTeamProjectId] = useState<string>(() => {
    return session?.projectId || mockProjects[0]?.id || 'proj-001';
  });

  const handleLoginSuccess = (newSession: UserSession) => {
    setSession(newSession);
    try {
      localStorage.setItem('ai_studio_innovation_session_2026', JSON.stringify(newSession));
    } catch (e) {
      console.error(e);
    }

    if (newSession.role === 'team_member') {
      setActiveTab('coach');
      const defaultProjId = newSession.projectId || projects[0]?.id || 'proj-001';
      setActiveTeamProjectId(defaultProjId);
      const myProj = projects.find(p => p.id === defaultProjId) || projects[0];
      setSelectedProject(myProj);
    } else if (newSession.role === 'mentor') {
      setActiveTab('supervision');
    } else {
      setActiveTab('cockpit');
    }
  };

  const handleLogout = () => {
    setSession(null);
    try {
      localStorage.removeItem('ai_studio_innovation_session_2026');
    } catch (e) {
      console.error(e);
    }
  };

  // Spaces & Sessions Handlers
  const handleSelectSpace = (spaceId: string) => {
    setActiveSpaceId(spaceId);
    if (spaceId === 'none') {
      if (standaloneSessions.length > 0) {
        setActiveSessionId(standaloneSessions[0].id);
      }
    } else {
      const sp = spaces.find(s => s.id === spaceId);
      if (sp && sp.sessions.length > 0) {
        setActiveSessionId(sp.sessions[0].id);
      }
    }
  };

  const handleSelectSession = (spaceId: string, sessionId: string) => {
    setActiveSpaceId(spaceId);
    setActiveSessionId(sessionId);
  };

  const handleCreateSpace = (newSpaceData: { name: string; trackTag: string; school: string; leader: string }) => {
    const newId = `space-${Date.now()}`;
    const initialSession: CoachSession = {
      id: `sess-${Date.now()}`,
      title: '新建备赛空间专属咨询会话',
      time: '刚刚',
      messages: [
        {
          id: `msg-${Date.now()}`,
          sender: 'coach',
          type: 'text',
          text: `已为你成功创建【${newSpaceData.name}】独立备赛空间！赛道：【${newSpaceData.trackTag}】，工作区文档与专家微调规则已就绪。`,
          timestamp: '刚刚'
        }
      ]
    };

    const newSpace: ProjectSpace = {
      id: newId,
      name: newSpaceData.name,
      trackTag: newSpaceData.trackTag as any,
      school: newSpaceData.school,
      leader: newSpaceData.leader,
      stage: 'L2',
      sessions: [initialSession],
      activeSessionId: initialSession.id,
      workspace: {
        localPath: `~/Workspaces/${newSpaceData.name.replace(/\s+/g, '-').toLowerCase()}`,
        cloudBucket: `oss://innov-cloud/spaces/${newId}/`,
        cloudSyncStatus: 'synced',
        lastSyncTime: '刚刚',
        totalFiles: 3,
        syncRate: '100%'
      }
    };

    setSpaces(prev => [newSpace, ...prev]);
    setActiveSpaceId(newId);
    setActiveSessionId(initialSession.id);
    setActiveTab('coach');
  };

  const handleCreateSession = (spaceId: string) => {
    const newSessionId = `sess-${Date.now()}`;
    const newSession: CoachSession = {
      id: newSessionId,
      title: '新对话咨询会话',
      time: '刚刚',
      messages: [
        {
          id: `msg-${Date.now()}`,
          sender: 'coach',
          type: 'text',
          text: '你好！新的备赛会话已建立。你可以向我发起关于PPT排版、答辩防守、市场测算或商业模式的咨询。',
          timestamp: '刚刚'
        }
      ]
    };

    if (spaceId === 'none') {
      setStandaloneSessions(prev => [newSession, ...prev]);
      setActiveSpaceId('none');
      setActiveSessionId(newSessionId);
    } else {
      setSpaces(prev => prev.map(s => {
        if (s.id === spaceId) {
          return {
            ...s,
            sessions: [newSession, ...s.sessions]
          };
        }
        return s;
      }));
      setActiveSpaceId(spaceId);
      setActiveSessionId(newSessionId);
    }
    setActiveTab('coach');
  };

  const handleDeleteSession = (spaceId: string, sessionId: string) => {
    if (spaceId === 'none') {
      setStandaloneSessions(prev => prev.filter(s => s.id !== sessionId));
      if (activeSessionId === sessionId) {
        const remaining = standaloneSessions.filter(s => s.id !== sessionId);
        if (remaining.length > 0) {
          setActiveSessionId(remaining[0].id);
        }
      }
    } else {
      setSpaces(prev => prev.map(s => {
        if (s.id === spaceId) {
          const remaining = s.sessions.filter(sess => sess.id !== sessionId);
          return {
            ...s,
            sessions: remaining
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
      setSpaces(prev => prev.map(s => {
        if (s.id === spaceId) {
          return {
            ...s,
            sessions: s.sessions.map(sess => sess.id === sessionId ? { ...sess, title: newTitle } : sess)
          };
        }
        return s;
      }));
    }
  };

  const handleSyncWorkspace = (spaceId: string) => {
    setSpaces(prev => prev.map(s => {
      if (s.id === spaceId && s.workspace) {
        return {
          ...s,
          workspace: {
            ...s.workspace,
            lastSyncTime: '刚刚',
            cloudSyncStatus: 'synced'
          }
        };
      }
      return s;
    }));
  };

  const handleSelectProject = (project: ProjectItem) => {
    setSelectedProject(project);
    setIsDrawerOpen(true);
  };

  const handleSelectProjectById = (projectId: string) => {
    const found = projects.find(p => p.id === projectId);
    if (found) {
      handleSelectProject(found);
    }
  };

  const handleBatchImportComplete = (newProjects: ProjectItem[]) => {
    setProjects(newProjects);
    setIsImportModalOpen(false);
  };

  const handleAddNewCohortTask = (newTask: CohortBatchTask) => {
    setCohortTasks(prev => [newTask, ...prev]);
  };

  const handleUpdateWorkOrder = (updated: SupervisionWorkOrder) => {
    setWorkOrders(prev => prev.map(o => o.id === updated.id ? updated : o));
  };

  const handleOpenAssignMentor = () => {
    setIsDrawerOpen(false);
    setActiveTab('mentorship');
  };

  // If not logged in, render the 4-portal Login Page
  if (!session) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  // Get active team project for member (globally selected from sidebar)
  const currentMemberProject = projects.find(p => p.id === activeTeamProjectId) || 
                               projects.find(p => p.id === session.projectId) || 
                               projects[0];
  const currentActiveSpace = spaces.find(s => s.id === activeSpaceId) || null;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-900 font-sans selection:bg-sky-500 selection:text-white">
      {/* Left Sidebar: Role-based Navigation & Sessions/Spaces Management */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        session={session}
        onLogout={handleLogout}
        onOpenBatchImport={() => setIsImportModalOpen(true)}
        onOpenReportExport={() => setIsReportModalOpen(true)}
        onOpenRulesConfig={() => setIsRulesModalOpen(true)}
        spaces={spaces}
        standaloneSessions={standaloneSessions}
        activeSpaceId={activeSpaceId}
        activeSessionId={activeSessionId}
        onSelectSpace={handleSelectSpace}
        onSelectSession={handleSelectSession}
        onCreateSpace={handleCreateSpace}
        onCreateSession={handleCreateSession}
        onDeleteSession={handleDeleteSession}
        projects={projects}
        selectedProjectId={currentMemberProject?.id}
        onSelectProjectItem={(projId) => {
          setActiveTeamProjectId(projId);
          const p = projects.find(proj => proj.id === projId);
          if (p) setSelectedProject(p);
        }}
      />

      {/* Right Column: Clean Top Status Bar & Workspace */}
      <div className={`flex-1 flex flex-col h-full min-w-0 ${
        ['coach', 'guidance_workbench'].includes(activeTab) 
          ? 'overflow-hidden' 
          : 'overflow-y-auto'
      }`}>
        {/* Top Status Bar */}
        <TopHeader
          activeTab={activeTab}
          session={session}
          onLogout={handleLogout}
          onOpenRulesConfig={() => setIsRulesModalOpen(true)}
          alerts={alerts}
          onSelectProjectFromAlert={handleSelectProjectById}
          currentProject={currentMemberProject}
        />

        {/* Main Content Area */}
        <main className={`flex-1 min-w-0 ${
          ['coach', 'guidance_workbench'].includes(activeTab)
            ? 'h-[calc(100vh-4rem)] overflow-hidden p-0 space-y-0 flex flex-col'
            : 'p-4 sm:p-6 lg:p-8 space-y-6'
        }`}>
          {/* Shuangchuang-AI Integrated Modules */}
          {activeTab === 'coach' && (
            <SceneAICoach
              onNavigateToScene={(sceneId) => setActiveTab(sceneId as TabType)}
              activeSpace={currentActiveSpace}
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

          {activeTab === 'guidance_workbench' && (
            <SceneGuidanceWorkbench
              projects={projects}
              selectedProject={currentMemberProject}
              onSelectProject={handleSelectProject}
              session={session}
            />
          )}

          {activeTab === 'defense_training' && (
            <SceneDefenseTraining
              currentProject={currentMemberProject}
              session={session}
            />
          )}

          {/* Existing Management Platform Modules */}
          {activeTab === 'my_project' && (
            <ProjectMemberWorkbench
              session={session}
              project={currentMemberProject}
              workOrders={workOrders}
              onUpdateWorkOrder={handleUpdateWorkOrder}
              onOpenRulesConfig={() => setIsRulesModalOpen(true)}
            />
          )}

          {activeTab === 'cockpit' && (
            <CockpitDashboard
              projects={projects}
              onSelectProject={handleSelectProject}
              onOpenReportExport={() => setIsReportModalOpen(true)}
              onOpenBatchImport={() => setIsImportModalOpen(true)}
              onNavigateTab={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'screening' && (
            <ScreeningHub
              projects={projects}
              onSelectProject={handleSelectProject}
              onOpenBatchImport={() => setIsImportModalOpen(true)}
              onOpenAssignMentor={handleOpenAssignMentor}
            />
          )}

          {activeTab === 'mentorship' && (
            <MentorshipDispatch
              mentors={mentors}
              projects={projects}
              cohortTasks={cohortTasks}
              onSelectProject={handleSelectProject}
              onAddNewCohortTask={handleAddNewCohortTask}
              onNavigateToMentorPool={() => setActiveTab('mentors_pool')}
            />
          )}

          {activeTab === 'supervision' && (
            <SupervisionClosure
              workOrders={workOrders}
              projects={projects}
              onSelectProject={handleSelectProject}
              onUpdateWorkOrder={handleUpdateWorkOrder}
            />
          )}

          {activeTab === 'milestones' && (
            <MilestoneKanban
              projects={projects}
              onSelectProject={handleSelectProject}
              onOpenReportExport={() => setIsReportModalOpen(true)}
            />
          )}

          {activeTab === 'mentors_pool' && (
            <MentorPoolManagement
              mentors={mentors}
              onUpdateMentors={setMentors}
              onNavigateTab={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'knowledge_base' && (
            <KnowledgeBaseManagement />
          )}

          {activeTab === 'users_management' && (
            <UserManagement
              onOpenProject={handleSelectProjectById}
            />
          )}

          {activeTab === 'teams_management' && (
            <TeamManagement
              onSelectProject={handleSelectProjectById}
            />
          )}
        </main>

        {/* Global Compact Footer (shown only for regular dashboard tabs) */}
        {!['coach', 'guidance_workbench'].includes(activeTab) && (
          <footer className="border-t border-slate-200 bg-white py-2.5 px-6 text-center text-[11px] text-slate-400 shrink-0">
            <span>{session.university ? `${session.university} · ` : ''}2026年中国国际大学生创新大赛 · 双创数智中枢 | 4端协同 · 金牌培育 · 全流程督导闭环</span>
          </footer>
        )}
      </div>

      {/* Project Detail Deep-Dive Drawer */}
      <ProjectDetailDrawer
        project={selectedProject}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        workOrders={workOrders}
        onOpenAssignMentor={handleOpenAssignMentor}
      />

      {/* Rules Config Modal */}
      <RulesConfigModal
        isOpen={isRulesModalOpen}
        onClose={() => setIsRulesModalOpen(false)}
      />

      {/* Batch Import & Auto-Screening Modal */}
      <BatchImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportComplete={handleBatchImportComplete}
      />

      {/* Executive Report Export Modal */}
      <ReportExportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />
    </div>
  );
}
