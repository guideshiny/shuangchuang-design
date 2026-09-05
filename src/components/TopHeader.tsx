import { useState } from 'react';
import { 
  Bell, 
  AlertTriangle, 
  ChevronRight, 
  BookOpen, 
  Sparkles, 
  Clock,
  CheckCircle2,
  Building,
  GraduationCap,
  School,
  Award,
  ShieldCheck,
  Repeat,
  LogOut,
  Folder,
  PanelLeft
} from 'lucide-react';
import { NotificationAlert, UserSession, ProjectItem } from '../types';
import { TabType } from './Sidebar';

interface TopHeaderProps {
  activeTab: TabType;
  session: UserSession;
  onLogout: () => void;
  onOpenRulesConfig: () => void;
  alerts: NotificationAlert[];
  onSelectProjectFromAlert?: (projectId: string) => void;
  currentProject?: ProjectItem;
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
}

export default function TopHeader({
  activeTab,
  session,
  onLogout,
  onOpenRulesConfig,
  alerts,
  onSelectProjectFromAlert,
  currentProject,
  isSidebarCollapsed = false,
  onToggleSidebar
}: TopHeaderProps) {
  const [showAlertMenu, setShowAlertMenu] = useState(false);
  const urgentAlertCount = alerts.filter(a => a.type === 'urgent' || a.type === 'warning').length;

  const tabTitleMap: Record<TabType, { title: string; subtitle: string }> = {
    coach: { title: 'AI备赛教练与统一入口', subtitle: '多模式智能体对话 · 空间文档互通 · 深度工具链调度' },
    guidance_workbench: { title: '全链路指导工作台', subtitle: 'L1~L6全阶段智能演进 · 商业计划书12章沉浸打磨 · 多模态材料档案与版本快照' },
    defense_training: { title: '模拟评审与答辩训练', subtitle: '全真模拟答辩 · 评委风格质询 · 六维能力雷达与复盘报告' },
    my_project: { title: '我的参赛项目工作台', subtitle: 'AI对标得分 · 专家问诊诊断 · 整改工单交付' },
    cockpit: { title: '备赛数据驾驶舱', subtitle: '全校项目总览 · 梯队分布 · AI战略决策' },
    screening: { title: '智能对标初筛与排名', subtitle: '2026教育部官方主赛道二级细分指标对标' },
    mentorship: { title: '常态化辅导与调度', subtitle: '专家智库 · 弱项针对性匹配 · 批量集训营' },
    supervision: { title: '辅导资产沉淀与督导', subtitle: '辅导工单闭环 · 二次复核 · 修改成效验证' },
    milestones: { title: '重点项目全流程看板', subtitle: '五阶备赛管线 · 动态跟踪 · 冲刺保障' },
    mentors_pool: { title: '全校及外部双创导师智库', subtitle: '校内博导 · 国奖评委 · 产业高管 · 创投合伙人 · 履历档案与即时联络' },
    knowledge_base: { title: '学校双创知识库管理', subtitle: '校内专属智库 · 2026大赛规程 · 标杆案例库 · RAG调用' },
    users_management: { title: '用户与权限管理', subtitle: '校级管理 · 学院秘书 · 评审导师 · 学生团队' },
    teams_management: { title: '项目团队架构管理', subtitle: '跨学科配比 · 商业专人 · 知识产权合规' },
  };

  const currentTabInfo = tabTitleMap[activeTab] || { title: '管理中枢', subtitle: '' };

  return (
    <header 
      id="top-header"
      className="sticky top-0 h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between shadow-2xs z-20 shrink-0"
    >
      {/* Left Context: Sidebar Toggle Button, Breadcrumbs and Stage Tag */}
      <div className="flex items-center space-x-3 min-w-0">
        {onToggleSidebar && (
          <button
            type="button"
            id="btn-toggle-sidebar"
            onClick={onToggleSidebar}
            title={isSidebarCollapsed ? "展开左侧边栏 (Ctrl+B)" : "收起左侧边栏 (Ctrl+B)"}
            aria-label={isSidebarCollapsed ? "展开左侧边栏" : "收起左侧边栏"}
            className={`h-9 w-9 rounded-xl border flex items-center justify-center transition-all duration-200 shrink-0 cursor-pointer ${
              isSidebarCollapsed 
                ? 'bg-sky-50 border-sky-300 text-sky-700 hover:bg-sky-100 hover:border-sky-400 shadow-2xs' 
                : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            <PanelLeft className="h-4.5 w-4.5 transition-transform" />
          </button>
        )}

        <div className="flex items-baseline space-x-2 truncate">
          <span className="text-sm font-bold text-slate-900 tracking-tight">{currentTabInfo.title}</span>
          <span className="text-xs text-slate-400 hidden md:inline truncate">/ {currentTabInfo.subtitle}</span>
        </div>

        <div className="hidden lg:flex items-center space-x-1 text-[11px] text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full font-medium shrink-0">
          <Clock className="h-3 w-3 text-amber-600 mr-1" />
          <span>距离国赛网评：48 天 · 重点攻坚期</span>
        </div>
      </div>

      {/* Right Controls: Portal Info, University Badge, Switch Button, Quick Rules, Alerts */}
      <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
        {/* University Badge (for team_member and school_admin) */}
        {session.university && (
          <div className="hidden sm:flex items-center space-x-1 text-xs text-sky-800 bg-sky-50 border border-sky-200 px-2.5 py-1 rounded-lg font-semibold">
            <Building className="h-3.5 w-3.5 text-sky-600" />
            <span>{session.university}</span>
          </div>
        )}

        {/* Global Active Project Badge (for team_member) */}
        {session.role === 'team_member' && currentProject && (
          <div 
            className="hidden xl:flex items-center space-x-1.5 text-xs text-sky-800 bg-sky-50/80 border border-sky-200/80 px-2.5 py-1 rounded-lg font-medium max-w-[240px] truncate"
            title={`当前全局参赛项目: ${currentProject.name}`}
          >
            <Folder className="h-3.5 w-3.5 text-sky-600 shrink-0" />
            <span className="truncate font-semibold">{currentProject.name}</span>
          </div>
        )}

        {/* Role Portal Badge */}
        <div className={`flex items-center space-x-1 text-xs px-2.5 py-1 rounded-lg font-medium border ${
          session.role === 'team_member' ? 'bg-sky-50 text-sky-700 border-sky-200' :
          session.role === 'school_admin' ? 'bg-blue-50 text-blue-700 border-blue-200' :
          session.role === 'mentor' ? 'bg-amber-50 text-amber-700 border-amber-200' :
          'bg-purple-50 text-purple-700 border-purple-200'
        }`}>
          {session.role === 'team_member' && <GraduationCap className="h-3.5 w-3.5 text-sky-600" />}
          {session.role === 'school_admin' && <School className="h-3.5 w-3.5 text-blue-600" />}
          {session.role === 'mentor' && <Award className="h-3.5 w-3.5 text-amber-600" />}
          {session.role === 'system_admin' && <ShieldCheck className="h-3.5 w-3.5 text-purple-600" />}
          <span>{session.roleLabel}</span>
        </div>

        {/* Switch Portal / Logout Button */}
        <button
          onClick={onLogout}
          title="切换登录端或切换账号"
          className="flex items-center space-x-1 px-2.5 py-1 text-xs text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition font-medium"
        >
          <Repeat className="h-3.5 w-3.5 text-slate-500" />
          <span className="hidden sm:inline">切换端</span>
        </button>

        {/* Quick Rule Button */}
        <button
          onClick={onOpenRulesConfig}
          className="hidden md:inline-flex items-center px-2.5 py-1 text-xs text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition font-medium"
        >
          <BookOpen className="h-3.5 w-3.5 mr-1.5 text-sky-600" />
          2026规则
        </button>

        <div className="h-4 w-px bg-slate-200 hidden sm:block" />

        {/* Alert Bell Trigger */}
        <div className="relative">
          <button
            id="btn-top-alert-center"
            onClick={() => setShowAlertMenu(!showAlertMenu)}
            className="relative p-1.5 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 rounded-lg border border-slate-200 transition"
            title="预警与待办提醒"
          >
            <Bell className="h-4 w-4" />
            {urgentAlertCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-2xs">
                {urgentAlertCount}
              </span>
            )}
          </button>

          {/* Alert Dropdown */}
          {showAlertMenu && (
            <div 
              id="top-alert-dropdown-menu"
              className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-white border border-slate-200 shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
            >
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 text-xs">
                <span className="font-semibold text-slate-800 flex items-center">
                  <AlertTriangle className="h-4 w-4 text-amber-500 mr-1.5" />
                  预警与待办中心 ({alerts.length})
                </span>
                <span className="text-[11px] text-slate-400">实时智能监控</span>
              </div>

              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-2.5 rounded-lg text-xs border ${
                      alert.type === 'urgent'
                        ? 'bg-rose-50 border-rose-200 text-rose-800'
                        : alert.type === 'warning'
                        ? 'bg-amber-50 border-amber-200 text-amber-800'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between font-medium">
                      <span className="truncate">{alert.title}</span>
                      <span className="text-[10px] opacity-75 whitespace-nowrap ml-2">{alert.timestamp}</span>
                    </div>
                    <p className="text-[11px] mt-1 leading-relaxed opacity-90">{alert.content}</p>
                    {alert.projectId && (
                      <button
                        onClick={() => {
                          setShowAlertMenu(false);
                          if (onSelectProjectFromAlert) {
                            onSelectProjectFromAlert(alert.projectId!);
                          }
                        }}
                        className="mt-2 text-[11px] text-sky-600 hover:text-sky-700 font-semibold inline-flex items-center"
                      >
                        {alert.actionLabel || '查看详情'} <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
