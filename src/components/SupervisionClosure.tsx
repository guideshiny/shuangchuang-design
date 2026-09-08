import { useState } from 'react';
import { 
  CheckSquare, 
  Sparkles, 
  Mic, 
  FileCheck, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileText, 
  TrendingUp, 
  Search, 
  Award,
  Users, 
  X, 
  Plus, 
  Trash2, 
  Edit3, 
  ShieldAlert, 
  Video, 
  Send, 
  ThumbsDown, 
  Check, 
  ChevronRight,
  ExternalLink,
  UploadCloud,
  FileSpreadsheet,
  Layers,
  Info
} from 'lucide-react';
import { 
  SupervisionWorkOrder, 
  ProjectItem, 
  WorkOrderStatus, 
  WorkOrderTask, 
  SchoolMentorInvitation 
} from '../types';
import { mockSchoolInvitations } from '../data/mockMentors';

interface SupervisionClosureProps {
  workOrders: SupervisionWorkOrder[];
  projects: ProjectItem[];
  onSelectProject: (project: ProjectItem) => void;
  onUpdateWorkOrder?: (order: SupervisionWorkOrder) => void;
  onAddNewWorkOrder?: (order: SupervisionWorkOrder) => void;
}

export default function SupervisionClosure({
  workOrders,
  projects,
  onSelectProject,
  onUpdateWorkOrder,
  onAddNewWorkOrder
}: SupervisionClosureProps) {
  // Invitations State
  const [invitations, setInvitations] = useState<SchoolMentorInvitation[]>(mockSchoolInvitations);
  const [showDeclineModal, setShowDeclineModal] = useState<SchoolMentorInvitation | null>(null);
  const [declineReason, setDeclineReason] = useState('');
  const [showInvitationDetailModal, setShowInvitationDetailModal] = useState<SchoolMentorInvitation | null>(null);

  // Work Orders Filter & Selection
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | WorkOrderStatus>('ALL');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<SupervisionWorkOrder>(workOrders[0]);

  // Tab within selected order workspace
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<'tasks' | 'diff_ai' | 'meeting' | 'materials'>('tasks');

  // Interactive Task Management State
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<WorkOrderTask | null>(null);
  const [taskForm, setTaskForm] = useState({
    title: '',
    category: '商业模式' as WorkOrderTask['category'],
    description: '',
    priority: 'high' as WorkOrderTask['priority'],
    dueDays: 3,
  });

  // Audio/Video Upload & New Order Modal
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadMediaType, setUploadMediaType] = useState<'audio' | 'video'>('video');
  const [uploadProjectTarget, setUploadProjectTarget] = useState(projects[0]?.id || 'proj-001');
  const [uploadMeetingTitle, setUploadMeetingTitle] = useState('腾讯会议：国赛金奖辅导答辩与技术商业重构研讨会');
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState<{ message: string; type: 'success' | 'info' | 'warning' } | null>(null);

  // Rework Modal State
  const [isReworkModalOpen, setIsReworkModalOpen] = useState(false);
  const [reworkComment, setReworkComment] = useState('');

  // Final Close Modal State
  const [isFinalApproveModalOpen, setIsFinalApproveModalOpen] = useState(false);
  const [finalRemark, setFinalRemark] = useState('修改非常到位！商业模式与订单数据形成闭环，温漂专利证据链扎实，通过验收！');
  const [finalScoreDelta, setFinalScoreDelta] = useState(7.0);

  const showToast = (message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setFeedbackToast({ message, type });
    setTimeout(() => {
      setFeedbackToast(null);
    }, 4500);
  };

  // Helper to sync updated order
  const syncOrder = (updated: SupervisionWorkOrder) => {
    setSelectedOrder(updated);
    if (onUpdateWorkOrder) {
      onUpdateWorkOrder(updated);
    }
  };

  // Status Filter mapping
  const filteredOrders = workOrders.filter(o => {
    if (selectedStatus !== 'ALL') {
      if (selectedStatus === 'draft_ai_suggested' && o.status !== 'draft_ai_suggested') return false;
      if (selectedStatus === 'pending_team_accept' && o.status !== 'pending_team_accept') return false;
      if (selectedStatus === 'team_in_progress' && o.status !== 'team_in_progress') return false;
      if (selectedStatus === 'team_submitted' && (o.status !== 'team_submitted' && o.status !== 'student_submitted')) return false;
      if (selectedStatus === 'closed_completed' && (o.status !== 'closed_completed' && o.status !== 'expert_checked')) return false;
    }
    if (searchKeyword.trim()) {
      const kw = searchKeyword.toLowerCase();
      const matchName = o.projectName.toLowerCase().includes(kw);
      const matchCollege = o.college.toLowerCase().includes(kw);
      const matchLeader = o.leader.toLowerCase().includes(kw);
      const matchMentor = o.mentorName.toLowerCase().includes(kw);
      if (!matchName && !matchCollege && !matchLeader && !matchMentor) return false;
    }
    return true;
  });

  // Handle Accept Invitation
  const handleAcceptInvitation = (inv: SchoolMentorInvitation) => {
    setInvitations(prev => prev.map(item => item.id === inv.id ? { ...item, status: 'accepted' as const } : item));
    showToast(`已成功接受学校对【${inv.projectName}】的辅导指派！已加入您的指导项目库。`, 'success');
  };

  // Handle Decline Invitation
  const handleConfirmDecline = () => {
    if (!showDeclineModal) return;
    const invId = showDeclineModal.id;
    setInvitations(prev => prev.map(item => item.id === invId ? { 
      ...item, 
      status: 'declined' as const, 
      declineReason: declineReason || '导师因近期国家级评审及出差行程冲突，无法按期指导' 
    } : item));
    showToast(`已婉拒对【${showDeclineModal.projectName}】的邀请，回执与理由已同步推送至学校双创教学指导处。`, 'info');
    setShowDeclineModal(null);
    setDeclineReason('');
  };

  // 1. Mentor confirms AI Draft and pushes to project team
  const handlePushDraftToTeam = () => {
    if (!selectedOrder) return;
    const updated: SupervisionWorkOrder = {
      ...selectedOrder,
      status: 'pending_team_accept',
    };
    syncOrder(updated);
    showToast(`工单【${selectedOrder.batchTitle || selectedOrder.id}】已由导师确认，并正式推送至项目团队负责人待办！`, 'success');
  };

  // 2. Simulate Team Acceptance
  const handleSimulateTeamAccept = () => {
    if (!selectedOrder) return;
    const updated: SupervisionWorkOrder = {
      ...selectedOrder,
      status: 'team_in_progress',
    };
    syncOrder(updated);
    showToast(`项目团队【${selectedOrder.projectName}】已确认接单，团队成员正按任务项逐一整改材料。`, 'info');
  };

  // 3. Simulate Team Rejection with Reason
  const handleSimulateTeamReject = () => {
    if (!selectedOrder) return;
    const updated: SupervisionWorkOrder = {
      ...selectedOrder,
      status: 'team_rejected',
      teamRejectionReason: '团队反馈：目前第2条“补充3000套框架协议”涉及军工客户保密协议未脱敏，拟于后天拿到合规公函后再接单整改。',
    };
    syncOrder(updated);
    showToast(`项目团队驳回了该工单，已附上驳回理由，请导师查阅沟通。`, 'warning');
  };

  // 4. Simulate Team submitting modified BP/PPT with notes
  const handleSimulateTeamSubmit = () => {
    if (!selectedOrder) return;
    const updated: SupervisionWorkOrder = {
      ...selectedOrder,
      status: 'team_submitted',
      studentSubmission: {
        submissionDate: '2026-08-28 17:30',
        modificationNotes: '陈老师好！团队已全员连续攻坚完成：\n1. BP第24页补充3000套先期供货框架协议；\n2. PPT第8页新增极端工况温漂与专利对比矩阵；\n3. 演练了面对评委杀手锏提问的答辩三步法录音，请老师验收！',
        newBpVersion: `${selectedOrder.projectName.slice(0, 4)}_商业计划书_国赛冲刺版_v4.2.pdf`,
        newPptVersion: `${selectedOrder.projectName.slice(0, 4)}_国赛路演PPT_10min_v3.8.pptx`,
        vcrUpdated: true,
        taskReplies: selectedOrder.tasks.map(t => ({
          taskId: t.id,
          reply: `已按要求完成《${t.title}》的材料整改与数据补齐。`,
        })),
      },
      versionDiff: selectedOrder.versionDiff || {
        beforeBpVersion: `${selectedOrder.projectName.slice(0, 4)}_商业计划书_v3.0.pdf`,
        afterBpVersion: `${selectedOrder.projectName.slice(0, 4)}_商业计划书_国赛冲刺版_v4.2.pdf`,
        beforePptVersion: `${selectedOrder.projectName.slice(0, 4)}_PPT_v2.5.pptx`,
        afterPptVersion: `${selectedOrder.projectName.slice(0, 4)}_国赛路演PPT_10min_v3.8.pptx`,
        keyChanges: [
          '【财务与订单】新增工业大客户采购意向协议，量化财务模型可行度大幅拉升；',
          '【竞品与壁垒】PPT由原来纯文字描述升级为“温漂折线图+第三方检测报告”图表证据链；',
          '【答辩逻辑】提炼了应对极限质疑的杀手锏三步回应话术。',
        ],
        aiScoreDelta: {
          totalBefore: 81.5,
          totalAfter: 88.5,
          delta: 7.0,
          dimensionChanges: [
            { dimension: '商业模式与财务可行性', before: 72.0, after: 84.5, delta: 12.5, comment: '订单协议落地直接破解商业性虚浮痛点，提升显著。' },
            { dimension: '技术壁垒与科技创新', before: 88.0, after: 92.0, delta: 4.0, comment: '检测报告与微纳加工温漂数据形成强力佐证。' },
            { dimension: '路演表现与材料视觉', before: 79.5, after: 85.0, delta: 5.5, comment: 'PPT前8页逻辑动线更加紧凑，反驳证据醒目。' },
            { dimension: '团队协作与学生贡献', before: 86.5, after: 89.0, delta: 2.5, comment: '答辩演练展示了学生骨干的担当。' },
          ],
        },
      },
    };
    syncOrder(updated);
    showToast(`项目团队已提交最新修订版 BP 与路演 PPT，等待导师进行双版本比对与结项终审！`, 'success');
  };

  // 5. Mentor approves and closes the work order
  const handleApproveFinalClose = () => {
    if (!selectedOrder) return;
    const updated: SupervisionWorkOrder = {
      ...selectedOrder,
      status: 'closed_completed',
      expertCheck: {
        checkedDate: '2026-08-28 18:20',
        approved: true,
        finalRemark: finalRemark,
        scoreChangeDelta: finalScoreDelta,
      },
    };
    syncOrder(updated);
    setIsFinalApproveModalOpen(false);
    showToast(`工单已验收合格并结项归档！AI诊断综合提升 +${finalScoreDelta} 分，已同步更新全校项目评分库。`, 'success');
  };

  // 6. Mentor rejects/reworks
  const handleConfirmRework = () => {
    if (!selectedOrder || !reworkComment.trim()) return;
    const updated: SupervisionWorkOrder = {
      ...selectedOrder,
      status: 'need_rework',
      teamRejectionReason: `导师终审打回重改：${reworkComment}`,
    };
    syncOrder(updated);
    setIsReworkModalOpen(false);
    setReworkComment('');
    showToast(`工单已退回给团队重新修改，退回意见已发送给队长。`, 'warning');
  };

  // Task Add/Edit
  const handleOpenAddTaskModal = () => {
    setEditingTask(null);
    setTaskForm({
      title: '',
      category: '商业模式',
      description: '',
      priority: 'high',
      dueDays: 3,
    });
    setIsTaskModalOpen(true);
  };

  const handleOpenEditTaskModal = (task: WorkOrderTask) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      category: task.category,
      description: task.description,
      priority: task.priority,
      dueDays: task.dueDays,
    });
    setIsTaskModalOpen(true);
  };

  const handleSaveTaskForm = () => {
    if (!selectedOrder || !taskForm.title.trim()) return;
    if (editingTask) {
      const updatedTasks = selectedOrder.tasks.map(t => t.id === editingTask.id ? {
        ...t,
        title: taskForm.title,
        category: taskForm.category,
        description: taskForm.description,
        priority: taskForm.priority,
        dueDays: taskForm.dueDays,
      } : t);
      syncOrder({ ...selectedOrder, tasks: updatedTasks });
      showToast('任务条目已成功更新！', 'success');
    } else {
      const newTask: WorkOrderTask = {
        id: `t-manual-${Date.now()}`,
        title: taskForm.title,
        category: taskForm.category,
        description: taskForm.description,
        priority: taskForm.priority,
        completed: false,
        dueDays: taskForm.dueDays,
      };
      syncOrder({ ...selectedOrder, tasks: [...selectedOrder.tasks, newTask] });
      showToast('已成功新增辅导修改结构化条目！', 'success');
    }
    setIsTaskModalOpen(false);
  };

  const handleDeleteTask = (taskId: string) => {
    if (!selectedOrder) return;
    const updatedTasks = selectedOrder.tasks.filter(t => t.id !== taskId);
    syncOrder({ ...selectedOrder, tasks: updatedTasks });
    showToast('该条目已删除', 'info');
  };

  const handleToggleTaskCompleted = (taskId: string) => {
    if (!selectedOrder) return;
    const updatedTasks = selectedOrder.tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t);
    syncOrder({ ...selectedOrder, tasks: updatedTasks });
  };

  // Simulate Media Upload & AI Generation of Work Order Draft
  const handleUploadAndGenerateOrder = () => {
    setIsAiProcessing(true);
    const targetProj = projects.find(p => p.id === uploadProjectTarget) || projects[0];

    setTimeout(() => {
      const newOrder: SupervisionWorkOrder = {
        id: `order-${Date.now().toString().slice(-6)}`,
        projectId: targetProj.id,
        projectName: targetProj.name,
        college: targetProj.college,
        leader: targetProj.leader,
        mentorId: 'mentor-001',
        mentorName: '陈建国',
        mentorTitle: '长江学者 / 航空制造特聘专家',
        batchTitle: `辅导批次 · ${uploadMeetingTitle.slice(0, 18)}`,
        coMentors: [
          { name: '陈建国', title: '长江学者 / 航空制造特聘专家', roleTag: '主审技术导师' },
          { name: '温晓琳', title: '全国金奖资深评委', roleTag: '商业模式与路演导师' },
        ],
        sessionDate: new Date().toISOString().slice(0, 16).replace('T', ' '),
        sessionType: 'online_meeting',
        audioDurationMinutes: 42,
        meetingRecord: {
          title: uploadMeetingTitle,
          mediaType: uploadMediaType,
          durationText: '42分18秒',
          uploadTime: '刚刚',
          summary: `导师针对【${targetProj.name}】进行了逐页PPT穿透式推演。指出：技术实力扎实，但商业量产测算过软，必须补充先期试样供货协议与权威第三方法定质检凭据。`,
          transcriptHighlights: [
            '【10:15 导师发言】：你们说客户反响热烈，必须拿出盖章的意向采购函，空口无凭！',
            '【22:40 学生负责人】：老师，我们已收到两家国企采购意向，正在走盖章流转。',
            '【31:10 导师发言】：那就作为必改项放入工单，下发给你们限时3天补充进BP附录！',
          ],
        },
        diagnosticSummary: {
          coreFindings: `由会议${uploadMediaType === 'video' ? '视频' : '录音'}智能转写生成：项目科技壁垒突出，但商业落地佐证与财务现金流模型存在薄弱环节。`,
          dimensionFeedback: [
            { dimension: '创新与壁垒', expertRemark: '核心专利技术过硬，建议在PPT前5页强化关键性能测试柱状图。', level: 'good' },
            { dimension: '商业模式与落地', expertRemark: '缺乏先期订单与意向采购函佐证，需充实商业化闭环证明。', level: 'poor' },
            { dimension: '路演表现与协作', expertRemark: '答辩节奏紧凑，建议提炼面对专家追问核心话术。', level: 'average' },
          ],
        },
        tasks: [
          {
            id: `t-gen-1-${Date.now()}`,
            category: '商业模式',
            title: '补齐头部客户先期试样供货协议或采购意向函',
            description: '在商业计划书“市场落地与合同证据”章节补充盖章意向函脱敏页。',
            priority: 'high',
            completed: false,
            dueDays: 3,
          },
          {
            id: `t-gen-2-${Date.now()}`,
            category: '材料/PPT',
            title: 'PPT第6页新增第三方质检报告与竞品对比矩阵',
            description: '左右两栏对比核心性能参数，直击评委对量产可靠性的疑虑。',
            priority: 'high',
            completed: false,
            dueDays: 3,
          },
          {
            id: `t-gen-3-${Date.now()}`,
            category: '财务与数据',
            title: '平滑车规或工业化认证期现金流，增加前18个月营收来源测算',
            description: '测算科研服务、样机租赁对研发成本的有效覆盖。',
            priority: 'medium',
            completed: false,
            dueDays: 5,
          },
        ],
        status: 'draft_ai_suggested', // 状态1：AI建议工单草稿
      };

      setIsAiProcessing(false);
      setIsUploadModalOpen(false);
      setSelectedOrder(newOrder);
      if (onAddNewWorkOrder) {
        onAddNewWorkOrder(newOrder);
      }
      showToast(`已通过会议${uploadMediaType === 'video' ? '视频' : '录音'}完成转写！已生成【AI建议工单草稿】，请导师确认细化后推送给团队。`, 'success');
    }, 1800);
  };

  const getStatusBadge = (status: WorkOrderStatus) => {
    switch (status) {
      case 'draft_ai_suggested':
        return { text: '1. AI工单草稿 (待导师确认)', bg: 'bg-purple-100 text-purple-800 border-purple-200' };
      case 'pending_team_accept':
        return { text: '2. 待团队接单 (已推送)', bg: 'bg-amber-100 text-amber-800 border-amber-200' };
      case 'team_rejected':
        return { text: '团队已驳回工单', bg: 'bg-rose-100 text-rose-800 border-rose-200' };
      case 'team_in_progress':
        return { text: '3. 团队整改中', bg: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 'team_submitted':
      case 'student_submitted':
        return { text: '4. 团队已提交 (待导师验收)', bg: 'bg-teal-100 text-teal-800 border-teal-200' };
      case 'need_rework':
        return { text: '导师退回需重新修改', bg: 'bg-orange-100 text-orange-800 border-orange-200' };
      case 'closed_completed':
      case 'expert_checked':
        return { text: '5. 已验收归档 (闭环)', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      default:
        return { text: '处理中', bg: 'bg-slate-100 text-slate-800 border-slate-200' };
    }
  };

  const pendingInvitations = invitations.filter(i => i.status === 'pending');

  return (
    <div id="mentor-portal-supervision-workbench" className="space-y-6">
      {/* 1. Top Header & Mentor Role Notification */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-200">
              导师端 · 督导辅导闭环工作台
            </span>
            <span className="text-xs text-slate-500">当前导师：陈建国 教授 (特聘国赛资深评审)</span>
          </div>
          <h2 className="text-base font-bold text-slate-900 flex items-center mt-1.5">
            <CheckSquare className="h-5 w-5 text-emerald-600 mr-2" />
            项目全周期辅导：材料审阅 · 录音导入 · 工单派发 · 智能提分与闭环
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            支持接收学校邀请、多导师协同指导、会议录像/音频导入ASR转写、AI智能建议工单、团队接单整改与改前改后版本提分双向验收。
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-semibold shadow-xs shadow-emerald-600/20 transition flex items-center"
          >
            <Mic className="h-4 w-4 mr-1.5" />
            导入辅导会议录音/视频
          </button>
        </div>
      </div>

      {/* Toast Feedback */}
      {feedbackToast && (
        <div className={`p-4 rounded-xl text-xs flex items-center justify-between shadow-md transition-all ${
          feedbackToast.type === 'success' ? 'bg-emerald-50 border border-emerald-300 text-emerald-900' :
          feedbackToast.type === 'warning' ? 'bg-amber-50 border border-amber-300 text-amber-900' :
          'bg-sky-50 border border-sky-300 text-sky-900'
        }`}>
          <div className="flex items-center space-x-2">
            <Sparkles className="h-4 w-4" />
            <span className="font-medium">{feedbackToast.message}</span>
          </div>
          <button onClick={() => setFeedbackToast(null)} className="text-slate-400 hover:text-slate-700">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* 2. School Invitations Banner (学校指派项目与导师邀请闭环) */}
      {pendingInvitations.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 via-orange-50/50 to-white border border-amber-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded-lg bg-amber-500 text-white">
                <ShieldAlert className="h-4 w-4" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  学校创新创业学院 · 新项目辅导指派邀请 ({pendingInvitations.length} 项待确认)
                </h3>
                <p className="text-[11px] text-slate-600">
                  学校已根据项目专业赛道与多导师交叉培育规划，指派您为项目指导导师。您可接受入驻或婉拒并附理由。
                </p>
              </div>
            </div>
            <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[11px] font-bold rounded-full border border-amber-200">
              待导师响应
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {pendingInvitations.map(inv => (
              <div key={inv.id} className="bg-white border border-amber-200/80 rounded-xl p-4 shadow-2xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 bg-sky-50 text-sky-700 text-[10px] font-bold rounded border border-sky-200">
                        {inv.track}
                      </span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-slate-600 font-medium">{inv.college}</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 mt-1">{inv.projectName}</h4>
                  </div>
                  <div className="text-xs text-slate-500 font-mono">
                    指派时间：{inv.invitedDate}
                  </div>
                </div>

                <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg leading-relaxed">
                  <strong>项目简述：</strong>{inv.projectSummary}
                </p>

                {/* Multi-Mentor Group Allocation */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-slate-100 text-xs">
                  <div className="flex items-center space-x-2 flex-wrap">
                    <span className="text-slate-500 font-medium flex items-center">
                      <Users className="h-3.5 w-3.5 mr-1 text-slate-400" />
                      学校指派导师组（多导师协同）：
                    </span>
                    {inv.assignedMentors.map((m, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 font-medium text-[11px] border border-slate-200 flex items-center space-x-1">
                        <span>{m.name}</span>
                        <span className="text-slate-400 font-normal">({m.roleTag})</span>
                      </span>
                    ))}
                  </div>

                  {/* Actions: Accept or Decline */}
                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      onClick={() => setShowInvitationDetailModal(inv)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition flex items-center"
                    >
                      <FileText className="h-3.5 w-3.5 mr-1" />
                      查看材料与AI诊断
                    </button>
                    <button
                      onClick={() => setShowDeclineModal(inv)}
                      className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold transition"
                    >
                      婉拒邀请
                    </button>
                    <button
                      onClick={() => handleAcceptInvitation(inv)}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-xs transition flex items-center"
                    >
                      <Check className="h-3.5 w-3.5 mr-1" />
                      接受指导并入驻
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">我指导的项目工单</div>
          <div className="text-xl font-bold text-slate-900 mt-1">{workOrders.length} 批次</div>
          <div className="text-[11px] text-sky-700 font-semibold mt-1">支持多导师组联合打磨</div>
        </div>

        <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-200 shadow-xs">
          <div className="text-xs text-purple-800 font-medium">待确认/待推送 AI 工单草稿</div>
          <div className="text-xl font-bold text-purple-700 mt-1">
            {workOrders.filter(w => w.status === 'draft_ai_suggested').length} 份
          </div>
          <div className="text-[11px] text-slate-500 mt-1">语音转写沉淀待导师敲定</div>
        </div>

        <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 shadow-xs">
          <div className="text-xs text-blue-800 font-medium">学生团队修改中工单</div>
          <div className="text-xl font-bold text-blue-700 mt-1">
            {workOrders.filter(w => w.status === 'team_in_progress' || w.status === 'pending_team_accept').length} 批
          </div>
          <div className="text-[11px] text-slate-500 mt-1">任务条目双向进度追踪</div>
        </div>

        <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 shadow-xs">
          <div className="text-xs text-emerald-800 font-medium">AI 复核提分均值 (Δ)</div>
          <div className="text-xl font-bold text-emerald-700 mt-1">+7.0 分</div>
          <div className="text-[11px] text-slate-500 mt-1">双版本文档语义深度对比</div>
        </div>
      </div>

      {/* 4. Main 2-Col Layout: Work Order Pipeline List (Left) & Deep Workbench (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col (4/12): Work Orders Pipeline List */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center">
                <Layers className="h-4 w-4 mr-1.5 text-sky-600" />
                辅导工单列表 ({filteredOrders.length})
              </h3>
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="text-[11px] text-emerald-700 font-semibold hover:underline flex items-center"
              >
                <Plus className="h-3.5 w-3.5 mr-0.5" />
                新辅导
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="搜索项目、学院、团队成员..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-sky-500 text-slate-800"
              />
            </div>

            {/* Status Filter Tabs */}
            <div className="flex flex-wrap gap-1 text-[11px] bg-slate-100 p-1 rounded-lg">
              {[
                { key: 'ALL', label: '全部' },
                { key: 'draft_ai_suggested', label: 'AI草稿' },
                { key: 'team_in_progress', label: '修改中' },
                { key: 'team_submitted', label: '待我验收' },
                { key: 'closed_completed', label: '已归档' },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setSelectedStatus(tab.key as any)}
                  className={`px-2 py-1 rounded-md font-medium transition ${
                    selectedStatus === tab.key ? 'bg-sky-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Order Items */}
            <div className="space-y-2.5 max-h-[620px] overflow-y-auto pr-1">
              {filteredOrders.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  暂无匹配的辅导工单
                </div>
              ) : (
                filteredOrders.map(order => {
                  const isSelected = selectedOrder?.id === order.id;
                  const badge = getStatusBadge(order.status);
                  const completedTasks = order.tasks.filter(t => t.completed).length;
                  const progressPct = order.tasks.length ? Math.round((completedTasks / order.tasks.length) * 100) : 0;

                  return (
                    <div
                      key={order.id}
                      onClick={() => setSelectedOrder(order)}
                      className={`p-3.5 rounded-xl border text-xs transition cursor-pointer space-y-2 shadow-2xs ${
                        isSelected
                          ? 'border-sky-500 bg-sky-50/70 text-slate-900 shadow-xs ring-1 ring-sky-400'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <span className="font-semibold text-slate-900 line-clamp-1 flex-1 pr-1">
                          {order.projectName}
                        </span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] shrink-0 font-bold border ${badge.bg}`}>
                          {badge.text}
                        </span>
                      </div>

                      {order.batchTitle && (
                        <div className="text-[11px] text-slate-600 font-medium line-clamp-1 bg-slate-50 px-1.5 py-0.5 rounded">
                          📌 {order.batchTitle}
                        </div>
                      )}

                      {/* Co-mentors info */}
                      {order.coMentors && order.coMentors.length > 0 && (
                        <div className="flex items-center space-x-1 text-[10px] text-slate-500">
                          <Users className="h-3 w-3 text-slate-400" />
                          <span>导师组：{order.coMentors.map(c => `${c.name}(${c.roleTag})`).join('、')}</span>
                        </div>
                      )}

                      {/* Task checklist progress */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-slate-500">
                          <span>整改任务条目</span>
                          <span>{completedTasks}/{order.tasks.length} 项完成 ({progressPct}%)</span>
                        </div>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              order.status === 'closed_completed' ? 'bg-emerald-500' : 'bg-sky-500'
                            }`}
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                        <span>负责人：{order.leader}</span>
                        <span>{order.sessionDate.split(' ')[0]}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Tips Box */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-2 text-xs text-slate-600">
            <h4 className="font-bold text-slate-800 flex items-center">
              <Info className="h-4 w-4 mr-1.5 text-sky-600" />
              导师端规范流程指引
            </h4>
            <ol className="space-y-1 text-[11px] text-slate-500 list-decimal list-inside leading-relaxed">
              <li>学校指派项目后，导师可接受入驻并与其他导师组成指导团队；</li>
              <li>开会沟通后，导入音视频文件，AI自动提炼建议工单草稿；</li>
              <li>导师自由增删改查结构化修改条目，确认后一键推送给团队；</li>
              <li>团队提交新版BP/PPT后，系统自动生成两版文档对比与提分Δ；</li>
              <li>导师综合AI打分与材料质量终审归档或退回重改。</li>
            </ol>
          </div>
        </div>

        {/* Right Col (8/12): Deep-Dive Work Order & Multi-Tab Workbench */}
        <div className="lg:col-span-8 space-y-5">
          {selectedOrder ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5 text-xs text-slate-800">
              {/* Header Info with Co-Mentors and Status Flow Stepper */}
              <div className="border-b border-slate-100 pb-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center space-x-2 flex-wrap">
                      <span className="text-xs text-sky-700 font-mono font-bold bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                        工单批次号: {selectedOrder.id}
                      </span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-600 font-medium">{selectedOrder.college}</span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-600">负责人：{selectedOrder.leader}</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mt-1.5 flex items-center">
                      {selectedOrder.projectName}
                    </h3>
                  </div>

                  <div className="text-right shrink-0">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${getStatusBadge(selectedOrder.status).bg}`}>
                      {getStatusBadge(selectedOrder.status).text}
                    </span>
                    <div className="text-[11px] text-slate-400 mt-1">
                      辅导开会时间：{selectedOrder.sessionDate}
                    </div>
                  </div>
                </div>

                {/* Co-Mentors Group Banner */}
                {selectedOrder.coMentors && selectedOrder.coMentors.length > 0 && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-sky-600 shrink-0" />
                      <span className="font-semibold text-slate-700">联合指导专家组：</span>
                      <div className="flex items-center space-x-2 flex-wrap">
                        {selectedOrder.coMentors.map((cm, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded bg-white text-slate-800 font-medium text-[11px] border border-slate-200">
                            {cm.name} <span className="text-sky-700 font-bold">[{cm.roleTag}]</span>
                          </span>
                        ))}
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-500">已授权跨领域共同评审</span>
                  </div>
                )}

                {/* Status Stepper Timeline */}
                <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200/80">
                  <div className="text-[11px] font-bold text-slate-500 mb-2">工单全周期流转时序：</div>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[10px]">
                    <div className={`p-2 rounded-lg border flex items-center space-x-1.5 ${
                      selectedOrder.meetingRecord ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-bold' : 'bg-white border-slate-200 text-slate-500'
                    }`}>
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                      <span>1. 会议音视频录入</span>
                    </div>

                    <div className={`p-2 rounded-lg border flex items-center space-x-1.5 ${
                      selectedOrder.status === 'draft_ai_suggested' 
                        ? 'bg-purple-100 border-purple-300 text-purple-900 font-bold ring-1 ring-purple-400' 
                        : 'bg-emerald-50 border-emerald-200 text-emerald-900 font-semibold'
                    }`}>
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-purple-600" />
                      <span>2. AI建议草稿</span>
                    </div>

                    <div className={`p-2 rounded-lg border flex items-center space-x-1.5 ${
                      selectedOrder.status === 'pending_team_accept'
                        ? 'bg-amber-100 border-amber-300 text-amber-900 font-bold ring-1 ring-amber-400'
                        : selectedOrder.status === 'draft_ai_suggested'
                        ? 'bg-white border-slate-200 text-slate-400'
                        : 'bg-emerald-50 border-emerald-200 text-emerald-900 font-semibold'
                    }`}>
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-amber-600" />
                      <span>3. 导师确认推送</span>
                    </div>

                    <div className={`p-2 rounded-lg border flex items-center space-x-1.5 ${
                      selectedOrder.status === 'team_in_progress'
                        ? 'bg-blue-100 border-blue-300 text-blue-900 font-bold ring-1 ring-blue-400'
                        : selectedOrder.status === 'team_submitted' || selectedOrder.status === 'closed_completed' || selectedOrder.status === 'expert_checked'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-semibold'
                        : 'bg-white border-slate-200 text-slate-400'
                    }`}>
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-blue-600" />
                      <span>4. 团队整改落实</span>
                    </div>

                    <div className={`p-2 rounded-lg border flex items-center space-x-1.5 ${
                      selectedOrder.status === 'closed_completed' || selectedOrder.status === 'expert_checked'
                        ? 'bg-emerald-100 border-emerald-300 text-emerald-900 font-bold ring-1 ring-emerald-400'
                        : selectedOrder.status === 'team_submitted'
                        ? 'bg-teal-100 border-teal-300 text-teal-900 font-bold ring-1 ring-teal-400'
                        : 'bg-white border-slate-200 text-slate-400'
                    }`}>
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                      <span>5. 双版本提分终审</span>
                    </div>
                  </div>
                </div>

                {/* Navigation Tabs */}
                <div className="flex border-b border-slate-200 text-xs font-semibold gap-4">
                  <button
                    onClick={() => setActiveWorkspaceTab('tasks')}
                    className={`pb-2.5 transition flex items-center space-x-1.5 border-b-2 ${
                      activeWorkspaceTab === 'tasks'
                        ? 'border-sky-600 text-sky-700'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <CheckSquare className="h-4 w-4" />
                    <span>辅导整改任务清单 ({selectedOrder.tasks.length})</span>
                  </button>

                  <button
                    onClick={() => setActiveWorkspaceTab('diff_ai')}
                    className={`pb-2.5 transition flex items-center space-x-1.5 border-b-2 ${
                      activeWorkspaceTab === 'diff_ai'
                        ? 'border-sky-600 text-sky-700'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <TrendingUp className="h-4 w-4 text-emerald-600" />
                    <span>改前改后版本比对 & AI提分验收</span>
                    {selectedOrder.status === 'team_submitted' && (
                      <span className="px-1.5 py-0.2 bg-teal-500 text-white rounded-full text-[9px]">新提交</span>
                    )}
                  </button>

                  <button
                    onClick={() => setActiveWorkspaceTab('meeting')}
                    className={`pb-2.5 transition flex items-center space-x-1.5 border-b-2 ${
                      activeWorkspaceTab === 'meeting'
                        ? 'border-sky-600 text-sky-700'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Mic className="h-4 w-4 text-purple-600" />
                    <span>会议音视频与ASR纪要</span>
                  </button>

                  <button
                    onClick={() => setActiveWorkspaceTab('materials')}
                    className={`pb-2.5 transition flex items-center space-x-1.5 border-b-2 ${
                      activeWorkspaceTab === 'materials'
                        ? 'border-sky-600 text-sky-700'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <FileText className="h-4 w-4 text-blue-600" />
                    <span>项目原始材料与初始诊断</span>
                  </button>
                </div>
              </div>

              {/* TAB 1: 辅导整改任务清单 (Checklist) */}
              {activeWorkspaceTab === 'tasks' && (
                <div className="space-y-4">
                  {/* Status-specific Callout Action */}
                  {selectedOrder.status === 'draft_ai_suggested' && (
                    <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="font-bold text-xs flex items-center">
                          <Sparkles className="h-4 w-4 text-purple-600 mr-1.5" />
                          当前状态：AI建议工单草稿（尚未推送至学生团队）
                        </div>
                        <p className="text-[11px] text-purple-800 mt-1">
                          系统已根据导师会议录音提取了以下细化条目。您可以自由增、删、改每个条目，确认无误后点击右侧按钮推送给团队。
                        </p>
                      </div>
                      <button
                        onClick={handlePushDraftToTeam}
                        className="px-4 py-2 bg-purple-700 hover:bg-purple-600 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center shrink-0 transition"
                      >
                        <Send className="h-3.5 w-3.5 mr-1.5" />
                        导师确认无误 · 推送给团队
                      </button>
                    </div>
                  )}

                  {selectedOrder.status === 'pending_team_accept' && (
                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="font-bold text-xs flex items-center">
                          <Clock className="h-4 w-4 text-amber-600 mr-1.5" />
                          当前状态：已推送至项目团队，等待团队接单确认
                        </div>
                        <p className="text-[11px] text-amber-800 mt-1">
                          已派发至队长【{selectedOrder.leader}】。团队有权接单开始修改，或针对条件提出驳回反馈。
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 shrink-0">
                        <button
                          onClick={handleSimulateTeamReject}
                          className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-lg text-xs font-medium transition"
                        >
                          模拟团队驳回
                        </button>
                        <button
                          onClick={handleSimulateTeamAccept}
                          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold shadow-xs transition"
                        >
                          模拟团队接单开始整改
                        </button>
                      </div>
                    </div>
                  )}

                  {selectedOrder.status === 'team_rejected' && (
                    <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 space-y-2">
                      <div className="font-bold text-xs flex items-center">
                        <AlertCircle className="h-4 w-4 text-rose-600 mr-1.5" />
                        项目团队驳回了该工单
                      </div>
                      <p className="text-[11px] text-rose-800 bg-white p-2.5 rounded-lg border border-rose-200 leading-relaxed">
                        <strong>驳回理由：</strong>{selectedOrder.teamRejectionReason}
                      </p>
                      <div className="flex justify-end pt-1">
                        <button
                          onClick={handlePushDraftToTeam}
                          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-medium"
                        >
                          重新调整条目并再次推送
                        </button>
                      </div>
                    </div>
                  )}

                  {selectedOrder.status === 'team_in_progress' && (
                    <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="font-bold text-xs flex items-center">
                          <CheckCircle2 className="h-4 w-4 text-blue-600 mr-1.5" />
                          当前状态：团队正在根据工单整改 BP 与 PPT 课件
                        </div>
                        <p className="text-[11px] text-blue-800 mt-1">
                          团队成员正在逐项落实数据与论述，您可以继续跟进条目完成度。
                        </p>
                      </div>
                      <button
                        onClick={handleSimulateTeamSubmit}
                        className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-xs shrink-0"
                      >
                        模拟团队整改完毕并提交
                      </button>
                    </div>
                  )}

                  {selectedOrder.status === 'team_submitted' && (
                    <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="font-bold text-xs flex items-center">
                          <FileCheck className="h-4 w-4 text-teal-600 mr-1.5" />
                          团队已提交新版文档与整改答复说明，等待导师验收！
                        </div>
                        <p className="text-[11px] text-teal-800 mt-1">
                          已由 AI 完成两版本语义对比与自动提分计算，请点击右侧切换至比对标签页进行验收归档。
                        </p>
                      </div>
                      <button
                        onClick={() => setActiveWorkspaceTab('diff_ai')}
                        className="px-4 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold shadow-xs shrink-0 flex items-center"
                      >
                        前往版本比对与终审
                        <ArrowRight className="h-3.5 w-3.5 ml-1" />
                      </button>
                    </div>
                  )}

                  {/* Task List Header */}
                  <div className="flex items-center justify-between pt-1">
                    <h4 className="font-bold text-xs text-slate-900 flex items-center">
                      <CheckSquare className="h-4 w-4 text-emerald-600 mr-1.5" />
                      主工单批次包含的细化任务条目 ({selectedOrder.tasks.length})
                    </h4>
                    <button
                      onClick={handleOpenAddTaskModal}
                      className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center transition"
                    >
                      <Plus className="h-3.5 w-3.5 mr-1 text-slate-500" />
                      添加细化修改项
                    </button>
                  </div>

                  {/* Task Items */}
                  <div className="space-y-3">
                    {selectedOrder.tasks.map((t, idx) => (
                      <div
                        key={t.id}
                        className={`p-4 rounded-xl border transition space-y-2 ${
                          t.completed ? 'bg-slate-50/70 border-slate-200' : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start space-x-2.5">
                            <input
                              type="checkbox"
                              checked={t.completed}
                              onChange={() => handleToggleTaskCompleted(t.id)}
                              className="mt-0.5 h-4 w-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                            />
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2 flex-wrap">
                                <span className="px-1.5 py-0.2 rounded bg-sky-100 text-sky-800 text-[10px] font-bold border border-sky-200">
                                  {t.category}
                                </span>
                                <span className={`px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                                  t.priority === 'high' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                                  t.priority === 'medium' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                                  'bg-slate-100 text-slate-700'
                                }`}>
                                  {t.priority === 'high' ? '高优必改' : t.priority === 'medium' ? '中等优化' : '建议完善'}
                                </span>
                                <span className="text-[11px] text-slate-400">限时 {t.dueDays} 天</span>
                              </div>
                              <h5 className={`font-semibold text-xs ${t.completed ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                                {idx + 1}. {t.title}
                              </h5>
                              <p className="text-[11px] text-slate-600 leading-relaxed">
                                {t.description}
                              </p>
                            </div>
                          </div>

                          {/* Action icons */}
                          <div className="flex items-center space-x-1 shrink-0">
                            <button
                              onClick={() => handleOpenEditTaskModal(t)}
                              className="p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded transition"
                              title="编辑条目"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteTask(t.id)}
                              className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded transition"
                              title="删除条目"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Student task response if available */}
                        {selectedOrder.studentSubmission?.taskReplies?.find(r => r.taskId === t.id) && (
                          <div className="ml-6 p-2 rounded-lg bg-teal-50 border border-teal-200 text-[11px] text-teal-900 space-y-0.5">
                            <span className="font-bold text-teal-800 flex items-center">
                              <CheckCircle2 className="h-3 w-3 mr-1 text-teal-600" />
                              团队整改回执：
                            </span>
                            <p className="text-teal-950">
                              {selectedOrder.studentSubmission.taskReplies.find(r => r.taskId === t.id)?.reply}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 2: 改前改后版本比对 & AI自动提分验收 (核心重点功能) */}
              {activeWorkspaceTab === 'diff_ai' && (
                <div className="space-y-5">
                  {/* AI Scoring Delta Banner */}
                  {selectedOrder.versionDiff?.aiScoreDelta ? (
                    <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-white border border-emerald-200 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="px-2 py-0.5 bg-emerald-600 text-white rounded text-[10px] font-bold">
                              AI 智能对比评测引擎
                            </span>
                            <span className="text-xs font-bold text-emerald-950">
                              两个版本项目文档综合评分变动测算
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 mt-1">
                            通过对比【整改前初稿】与【整改后冲刺版】，自动量化商业、技术、路演维度得分跃迁。
                          </p>
                        </div>

                        <div className="text-right bg-white p-3 rounded-xl border border-emerald-200 shadow-2xs">
                          <div className="text-[11px] text-slate-500">综合评分跃迁 (Δ)</div>
                          <div className="text-xl font-black text-emerald-700 font-mono">
                            {selectedOrder.versionDiff.aiScoreDelta.totalBefore} ➔ {selectedOrder.versionDiff.aiScoreDelta.totalAfter}
                            <span className="ml-1 text-sm text-emerald-600 font-bold">
                              (+{selectedOrder.versionDiff.aiScoreDelta.delta}分)
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Dimension score changes bar table */}
                      <div className="space-y-2.5 pt-1">
                        <div className="text-xs font-bold text-slate-800">各评审维度提分明细：</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {selectedOrder.versionDiff.aiScoreDelta.dimensionChanges.map((dim, idx) => (
                            <div key={idx} className="bg-white p-3 rounded-xl border border-slate-200 space-y-1.5">
                              <div className="flex justify-between items-center text-xs">
                                <span className="font-bold text-slate-900">{dim.dimension}</span>
                                <div className="font-mono text-[11px]">
                                  <span className="text-slate-400">{dim.before}</span>
                                  <span className="text-slate-400 mx-1">➔</span>
                                  <span className="text-slate-900 font-bold">{dim.after}</span>
                                  <span className="ml-1 text-emerald-600 font-bold">
                                    (+{dim.delta})
                                  </span>
                                </div>
                              </div>
                              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                <div
                                  className="bg-emerald-500 h-full rounded-full"
                                  style={{ width: `${Math.min(100, dim.after)}%` }}
                                />
                              </div>
                              <p className="text-[10px] text-slate-500 leading-tight">
                                💡 {dim.comment}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 text-center text-xs">
                      团队尚未提交新版文件，暂无法生成版本比对与提分Δ。团队提交后将自动对比。
                    </div>
                  )}

                  {/* Side-by-side Version Document Diff */}
                  {selectedOrder.versionDiff && (
                    <div className="space-y-3">
                      <h4 className="font-bold text-xs text-slate-900 flex items-center">
                        <FileCheck className="h-4 w-4 mr-1.5 text-sky-600" />
                        双版本核心交付物演进比对
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Before Version Card */}
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                          <div className="font-bold text-slate-700 flex items-center justify-between">
                            <span>整改前原始版本 (Before)</span>
                            <span className="text-[10px] text-slate-400">辅导前留存</span>
                          </div>
                          <div className="space-y-1.5 text-[11px]">
                            <div className="p-2 bg-white rounded border border-slate-200 flex items-center justify-between">
                              <span className="truncate text-slate-700">📄 {selectedOrder.versionDiff.beforeBpVersion}</span>
                              <span className="text-slate-400 text-[10px]">原版BP</span>
                            </div>
                            <div className="p-2 bg-white rounded border border-slate-200 flex items-center justify-between">
                              <span className="truncate text-slate-700">📊 {selectedOrder.versionDiff.beforePptVersion}</span>
                              <span className="text-slate-400 text-[10px]">原版PPT</span>
                            </div>
                          </div>
                        </div>

                        {/* After Version Card */}
                        <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 space-y-2 text-xs">
                          <div className="font-bold text-emerald-950 flex items-center justify-between">
                            <span>整改后冲刺交付版本 (After)</span>
                            <span className="text-[10px] text-emerald-700 font-bold">待终审验收</span>
                          </div>
                          <div className="space-y-1.5 text-[11px]">
                            <div className="p-2 bg-white rounded border border-emerald-200 flex items-center justify-between">
                              <span className="truncate text-slate-900 font-medium">📄 {selectedOrder.versionDiff.afterBpVersion}</span>
                              <span className="text-emerald-700 text-[10px] font-bold">已更新</span>
                            </div>
                            <div className="p-2 bg-white rounded border border-emerald-200 flex items-center justify-between">
                              <span className="truncate text-slate-900 font-medium">📊 {selectedOrder.versionDiff.afterPptVersion}</span>
                              <span className="text-emerald-700 text-[10px] font-bold">已更新</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Key Change Diff Highlights */}
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                        <div className="font-bold text-xs text-slate-800">
                          AI 智能比对提取的关键改动证据清单：
                        </div>
                        <ul className="space-y-1.5 text-[11px] text-slate-700">
                          {selectedOrder.versionDiff.keyChanges.map((kc, idx) => (
                            <li key={idx} className="flex items-start space-x-2">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                              <span>{kc}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Student Team Submission Notes */}
                  {selectedOrder.studentSubmission && (
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800">项目团队提交说明与落实附言</span>
                        <span className="text-slate-400 font-mono text-[11px]">
                          提交于：{selectedOrder.studentSubmission.submissionDate}
                        </span>
                      </div>
                      <p className="text-slate-700 bg-white p-3 rounded-lg border border-slate-200 text-[11px] leading-relaxed whitespace-pre-line">
                        {selectedOrder.studentSubmission.modificationNotes}
                      </p>
                    </div>
                  )}

                  {/* Mentor Final Check Actions */}
                  {selectedOrder.status === 'closed_completed' || selectedOrder.status === 'expert_checked' ? (
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950 space-y-2">
                      <div className="flex items-center justify-between font-bold text-xs">
                        <span className="flex items-center">
                          <CheckCircle2 className="h-4 w-4 mr-1.5 text-emerald-600" />
                          导师已通过该工单验收并归档
                        </span>
                        <span className="text-emerald-700 font-mono text-sm">
                          评定提分：+{selectedOrder.expertCheck?.scoreChangeDelta || 7.0} 分
                        </span>
                      </div>
                      <p className="text-[11px] text-emerald-900 leading-relaxed bg-white/70 p-2.5 rounded border border-emerald-200">
                        <strong>导师终审评语：</strong> {selectedOrder.expertCheck?.finalRemark}
                      </p>
                      <div className="text-[10px] text-slate-500 text-right">
                        归档复核时间：{selectedOrder.expertCheck?.checkedDate}
                      </div>
                    </div>
                  ) : selectedOrder.status === 'team_submitted' ? (
                    <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="font-bold text-xs text-teal-950">
                          请导师对团队整改结果做出裁定
                        </div>
                        <p className="text-[11px] text-teal-800 mt-0.5">
                          可根据AI提分分析与材料细节，确认通过归档结项，或打回要求继续修改。
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 shrink-0">
                        <button
                          onClick={() => setIsReworkModalOpen(true)}
                          className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold transition"
                        >
                          退回继续修改
                        </button>
                        <button
                          onClick={() => setIsFinalApproveModalOpen(true)}
                          className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-xs transition flex items-center"
                        >
                          <Check className="h-4 w-4 mr-1.5" />
                          验收合格 · 归档结项
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              )}

              {/* TAB 3: 会议音视频与ASR纪要 */}
              {activeWorkspaceTab === 'meeting' && (
                <div className="space-y-4">
                  {selectedOrder.meetingRecord ? (
                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center space-x-3">
                          <div className="p-3 bg-purple-100 text-purple-700 rounded-xl">
                            {selectedOrder.meetingRecord.mediaType === 'video' ? (
                              <Video className="h-6 w-6" />
                            ) : (
                              <Mic className="h-6 w-6" />
                            )}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-900">
                              {selectedOrder.meetingRecord.title}
                            </h4>
                            <div className="text-[11px] text-slate-500 flex items-center space-x-2 mt-0.5">
                              <span>媒体类型：{selectedOrder.meetingRecord.mediaType === 'video' ? '会议录像视频' : '录音音频'}</span>
                              <span>•</span>
                              <span>有效时长：{selectedOrder.meetingRecord.durationText}</span>
                              <span>•</span>
                              <span>导入时间：{selectedOrder.meetingRecord.uploadTime}</span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => setIsUploadModalOpen(true)}
                          className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium shrink-0"
                        >
                          重新上传/追加会议录音
                        </button>
                      </div>

                      {/* Simulated Audio Waveform Bar */}
                      <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                        <div className="flex items-center justify-between text-[10px] text-slate-500">
                          <span>ASR 逐句对齐波形流：</span>
                          <span className="text-purple-700 font-bold">100% 转写完成</span>
                        </div>
                        <div className="flex items-center space-x-1 h-8">
                          {[40, 60, 30, 80, 95, 55, 70, 45, 90, 65, 30, 85, 90, 40, 75, 50, 80, 60, 40, 70, 95, 80, 60, 45, 75].map((h, i) => (
                            <div
                              key={i}
                              className="flex-1 bg-purple-400/80 rounded-full"
                              style={{ height: `${h}%` }}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Meeting Summary */}
                      <div className="space-y-2">
                        <div className="font-bold text-xs text-slate-800">
                          AI 提炼《导师核心交谈要点与痛点诊断》：
                        </div>
                        <p className="text-slate-700 bg-white p-3 rounded-lg border border-slate-200 text-[11px] leading-relaxed italic">
                          &quot;{selectedOrder.meetingRecord.summary}&quot;
                        </p>
                      </div>

                      {/* Transcript Highlights */}
                      <div className="space-y-2">
                        <div className="font-bold text-xs text-slate-800">
                          会议关键问答对与导师金句原声记录：
                        </div>
                        <div className="space-y-1.5">
                          {selectedOrder.meetingRecord.transcriptHighlights.map((hl, idx) => (
                            <div key={idx} className="p-2.5 bg-white rounded-lg border border-slate-200 text-[11px] text-slate-700 leading-relaxed font-mono">
                              {hl}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-3">
                      <Mic className="h-8 w-8 text-slate-400 mx-auto" />
                      <div className="text-xs font-bold text-slate-700">暂无关联的辅导会议录像或录音</div>
                      <p className="text-[11px] text-slate-500 max-w-md mx-auto">
                        您可以导入与该项目团队开会的录音文件或腾讯会议号，系统将自动识别文字并生成建议工单。
                      </p>
                      <button
                        onClick={() => setIsUploadModalOpen(true)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold inline-flex items-center"
                      >
                        <UploadCloud className="h-4 w-4 mr-1.5" />
                        立即导入会议录像/录音
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: 项目原始材料与初始诊断 */}
              {activeWorkspaceTab === 'materials' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="font-bold text-xs text-sky-800 flex items-center">
                      <Sparkles className="h-4 w-4 mr-1.5 text-sky-600" />
                      项目初始 AI 诊断报告与薄弱维度
                    </div>
                    <p className="text-slate-800 bg-white p-3 rounded-lg border border-slate-200 leading-relaxed italic text-[11px]">
                      &quot;{selectedOrder.diagnosticSummary.coreFindings}&quot;
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                      {selectedOrder.diagnosticSummary.dimensionFeedback.map((fb, idx) => (
                        <div key={idx} className="p-2.5 rounded-lg bg-white border border-slate-200 space-y-1">
                          <div className="flex items-center justify-between font-semibold text-xs">
                            <span className="text-slate-800">{fb.dimension}</span>
                            <span className={`text-[10px] px-1 rounded font-medium ${
                              fb.level === 'good' ? 'bg-emerald-100 text-emerald-800' :
                              fb.level === 'average' ? 'bg-sky-100 text-sky-800' :
                              'bg-rose-100 text-rose-800'
                            }`}>
                              {fb.level === 'good' ? '优秀' : fb.level === 'average' ? '需优化' : '急需整改'}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 leading-tight">{fb.expertRemark}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Project Materials Cards */}
                  <div className="space-y-2">
                    <div className="font-bold text-xs text-slate-800">项目核心申报资料：</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                        <div className="flex justify-between items-center text-slate-500 text-[11px]">
                          <span>商业计划书 (BP)</span>
                          <span className="text-sky-600 hover:underline cursor-pointer">在线预览</span>
                        </div>
                        <div className="font-bold text-slate-900 truncate">
                          📄 {selectedOrder.versionDiff?.beforeBpVersion || `${selectedOrder.projectName.slice(0, 6)}_商业计划书_v3.0.pdf`}
                        </div>
                      </div>

                      <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                        <div className="flex justify-between items-center text-slate-500 text-[11px]">
                          <span>路演演示文稿 (PPT)</span>
                          <span className="text-sky-600 hover:underline cursor-pointer">在线播放</span>
                        </div>
                        <div className="font-bold text-slate-900 truncate">
                          📊 {selectedOrder.versionDiff?.beforePptVersion || `${selectedOrder.projectName.slice(0, 6)}_路演PPT_v2.5.pptx`}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
              请在左侧选择一个辅导工单以查看详情
            </div>
          )}
        </div>
      </div>

      {/* MODAL 1: 导入新会议音视频 & 生成工单草稿 */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Mic className="h-5 w-5 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-900">导入专家辅导开会录音/视频</h3>
              </div>
              <button onClick={() => setIsUploadModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">选择辅导项目：</label>
                <select
                  value={uploadProjectTarget}
                  onChange={(e) => setUploadProjectTarget(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                >
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.college} · {p.leader})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">媒体类型：</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setUploadMediaType('video')}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center space-x-1.5 ${
                      uploadMediaType === 'video' ? 'bg-purple-50 border-purple-500 text-purple-800' : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    <Video className="h-4 w-4" />
                    <span>会议录像视频 (MP4/MOV)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadMediaType('audio')}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center space-x-1.5 ${
                      uploadMediaType === 'audio' ? 'bg-purple-50 border-purple-500 text-purple-800' : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    <Mic className="h-4 w-4" />
                    <span>会议录音音频 (MP3/M4A)</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">会议名称或录音备注：</label>
                <input
                  type="text"
                  value={uploadMeetingTitle}
                  onChange={(e) => setUploadMeetingTitle(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800"
                />
              </div>

              {/* Upload Dropzone */}
              <div className="p-6 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 text-center space-y-2">
                <UploadCloud className="h-8 w-8 text-slate-400 mx-auto" />
                <div className="font-semibold text-slate-700">点击上传或拖拽录像/录音文件至此</div>
                <div className="text-[11px] text-slate-400">
                  支持腾讯会议云录屏导出、飞书妙记文件、微信语音导出的音频。单个最大支持 2GB。
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleUploadAndGenerateOrder}
                disabled={isAiProcessing}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center disabled:opacity-50"
              >
                {isAiProcessing ? (
                  <>
                    <Sparkles className="h-4 w-4 mr-1.5 animate-spin" />
                    AI 正在识别语音并生成工单草稿...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-1.5" />
                    开始转写并生成 AI 建议工单草稿
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: 婉拒学校指派邀请弹窗 */}
      {showDeclineModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center space-x-2 text-rose-600 font-bold text-sm">
              <AlertCircle className="h-5 w-5" />
              <span>婉拒学校辅导指派邀请</span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              您正在婉拒项目【{showDeclineModal.projectName}】的指导指派。请填写婉拒理由，学校创新创业学院将重新为您推荐调配合适项目，并为该项目另行匹配专家。
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">婉拒理由：</label>
              <textarea
                rows={3}
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                placeholder="例如：近期承担国家级重点科研评审任务，出差行程密集，建议调配给微电子学院专家组..."
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowDeclineModal(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium"
              >
                返回
              </button>
              <button
                onClick={handleConfirmDecline}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold"
              >
                确认婉拒并发送回执
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: 查看学校邀请详情与材料 */}
      {showInvitationDetailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  {showInvitationDetailModal.projectName}
                </h3>
                <span className="text-xs text-slate-500">
                  {showInvitationDetailModal.college} · {showInvitationDetailModal.track}
                </span>
              </div>
              <button onClick={() => setShowInvitationDetailModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <div className="font-bold text-slate-700">学校指派导师团队：</div>
                <div className="flex flex-wrap gap-1.5">
                  {showInvitationDetailModal.assignedMentors.map((m, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-800 text-[11px]">
                      {m.name} · {m.roleTag} ({m.title})
                    </span>
                  ))}
                </div>
              </div>

              {showInvitationDetailModal.materials && (
                <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-2">
                  <div className="flex justify-between items-center font-bold text-emerald-900">
                    <span>AI 初筛诊断综合得分</span>
                    <span className="text-base font-mono text-emerald-700">{showInvitationDetailModal.materials.aiDiagnosisScore} 分</span>
                  </div>
                  <div className="text-[11px] text-slate-700">
                    <strong>AI 诊断出的核心短板：</strong>
                    <ul className="list-disc list-inside mt-1 text-slate-600 space-y-0.5">
                      {showInvitationDetailModal.materials.aiKeyWeakness.map((w, idx) => (
                        <li key={idx}>{w}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <div className="font-bold text-slate-700">申报资料附件：</div>
                <div className="text-[11px] text-slate-600 space-y-1">
                  <div>📄 BP：{showInvitationDetailModal.materials?.bpName}</div>
                  <div>📊 PPT：{showInvitationDetailModal.materials?.pptName}</div>
                  <div>👥 核心成员：{showInvitationDetailModal.materials?.teamMembers.join('、')}</div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  handleAcceptInvitation(showInvitationDetailModal);
                  setShowInvitationDetailModal(null);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-xs"
              >
                接受指导并入驻
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: 细化结构化任务条目（添加/编辑） */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900">
                {editingTask ? '编辑辅导整改任务项' : '添加新的细化修改任务项'}
              </h3>
              <button onClick={() => setIsTaskModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">任务分类：</label>
                <select
                  value={taskForm.category}
                  onChange={(e) => setTaskForm({ ...taskForm, category: e.target.value as any })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                >
                  <option value="商业模式">商业模式</option>
                  <option value="创新点">创新点 / 技术壁垒</option>
                  <option value="材料/PPT">材料 / PPT / VCR</option>
                  <option value="财务与数据">财务与数据 / 订单测算</option>
                  <option value="团队">团队分工与答辩演练</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">修改标题：</label>
                <input
                  type="text"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  placeholder="例如：补充工业AGV微纳加工先期供货框架协议"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">修改要求与具体论证指引：</label>
                <textarea
                  rows={3}
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  placeholder="详细描述项目团队需要在BP第几页、PPT第几页补充什么佐证数据..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">优先级：</label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value as any })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="high">高优 (必改项)</option>
                    <option value="medium">中优 (重要优化)</option>
                    <option value="low">低优 (建议润色)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">整改限时 (天)：</label>
                  <input
                    type="number"
                    min={1}
                    max={14}
                    value={taskForm.dueDays}
                    onChange={(e) => setTaskForm({ ...taskForm, dueDays: parseInt(e.target.value) || 3 })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsTaskModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleSaveTaskForm}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-xs"
              >
                保存条目
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: 导师终审合格归档弹窗 */}
      {isFinalApproveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center space-x-2 text-emerald-600 font-bold text-sm">
              <CheckCircle2 className="h-5 w-5" />
              <span>导师终审合格 · 验收归档结项</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1">
                <div className="font-bold text-emerald-900">AI 测算提分幅度：+{finalScoreDelta} 分</div>
                <div className="text-[11px] text-emerald-700">
                  整改后文档已通过语义一致性与反事实逻辑校验，符合结项标准。
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">导师最终复核评语：</label>
                <textarea
                  rows={3}
                  value={finalRemark}
                  onChange={(e) => setFinalRemark(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">最终认定打磨提分 (Δ)：</label>
                <input
                  type="number"
                  step="0.5"
                  value={finalScoreDelta}
                  onChange={(e) => setFinalScoreDelta(parseFloat(e.target.value) || 0)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setIsFinalApproveModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium"
              >
                取消
              </button>
              <button
                onClick={handleApproveFinalClose}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-xs"
              >
                确认验收并结项
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 6: 导师退回重新修改弹窗 */}
      {isReworkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center space-x-2 text-rose-600 font-bold text-sm">
              <AlertCircle className="h-5 w-5" />
              <span>退回项目团队重新修改</span>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-600 leading-relaxed">
                若团队提交的文件仍存在硬伤（如合同缺少印章、PPT逻辑不够紧凑等），请填写退回意见：
              </p>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">退回整改意见：</label>
                <textarea
                  rows={3}
                  value={reworkComment}
                  onChange={(e) => setReworkComment(e.target.value)}
                  placeholder="例如：3000套采购意向书虽然补充了，但缺少法定代表人签字页；请于明日重新提交盖章扫描件！"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setIsReworkModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium"
              >
                取消
              </button>
              <button
                onClick={handleConfirmRework}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold"
              >
                退回团队重做
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
