/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Share2, 
  Maximize2, 
  Minimize2, 
  PanelRight, 
  ChevronDown, 
  Search, 
  Printer, 
  Settings2, 
  Sparkles, 
  Check, 
  Presentation, 
  FileSpreadsheet, 
  FileText, 
  Video, 
  Paperclip,
  Pin,
  Download,
  Eye,
  Sliders,
  Layers,
  ArrowRight,
  FileCheck,
  GitCompare,
  PlusCircle,
  MessageSquare,
  History,
  XCircle
} from 'lucide-react';
import { AssociatedFileItem } from '../types';
import { ReviewFileItem, FileAnnotation, ReviewDecision } from '../types/reviewTypes';
import ReviewFileViewer from './review/ReviewFileViewer';

export const ALL_PROJECT_DELIVERABLES: AssociatedFileItem[] = [
  {
    id: 'art-ppt-1',
    name: '安里AI_BP补充_项目路标.pptx',
    type: 'ppt',
    typeLabel: '路演汇报幻灯片 (Deck)',
    size: '31.3 KB',
    updateTime: '刚刚',
    status: 'ready',
    metaInfo: '含 P1~P4 四阶产品、场景、客户/收入与融资演进全案'
  },
  {
    id: 'art-xlsx-1',
    name: '安里AI项目路标_草稿.xlsx',
    type: 'excel',
    typeLabel: '研发排期与财务测算 (Excel)',
    size: '18.6 KB',
    updateTime: '2026-03-29 14:10',
    status: 'ready',
    metaInfo: '分阶段工期甘特表、算力成本折算及客单价模型'
  },
  {
    id: 'art-ppt-2',
    name: '安里AI_BP补充_风险与应对.pptx',
    type: 'ppt',
    typeLabel: '风控防范专项汇报',
    size: '28.4 KB',
    updateTime: '2026-03-29 11:45',
    status: 'ready',
    metaInfo: '涉法合规漏洞、数据隐私脱敏与模型幻觉纠偏机制'
  },
  {
    id: 'art-ppt-3',
    name: '安里AI_BP补充_资源投入.pptx',
    type: 'ppt',
    typeLabel: '研发与市场资源投入',
    size: '24.1 KB',
    updateTime: '2026-03-29 09:30',
    status: 'ready',
    metaInfo: '团队薪酬配比、服务器及行业评测费用预算'
  },
  {
    id: 'art-ppt-4',
    name: '安里AI_BP补充_产品里程碑.pptx',
    type: 'ppt',
    typeLabel: '产品与交付里程碑',
    size: '35.2 KB',
    updateTime: '2026-03-28 17:00',
    status: 'ready',
    metaInfo: '从MVP算法验证到SaaS全流程AI平台阶段拆解'
  },
  {
    id: 'art-doc-1',
    name: '【AI产品需求规划与架构设计说明】.docx',
    type: 'doc',
    typeLabel: '架构设计白皮书',
    size: '42.5 KB',
    updateTime: '2026-03-28 10:15',
    status: 'ready',
    metaInfo: 'Agent编排引擎、微服务网关与司法专属大模型蒸馏技术方案'
  },
  {
    id: 'art-bp-1',
    name: '智耘农业_商业计划书_V2.4_初赛版.pdf',
    type: 'bp',
    typeLabel: '商业计划书 (BP)',
    size: '14.8 MB',
    updateTime: '2026-03-27 16:30',
    status: 'ready',
    metaInfo: '2026国赛标准12章节完整版，含科技查新与公章证明'
  },
  {
    id: 'art-vcr-1',
    name: '智耘农业_1分钟田间实测与产品VCR.mp4',
    type: 'vcr',
    typeLabel: '田间实测与产品VCR',
    size: '38.2 MB',
    updateTime: '2026-03-26 15:20',
    status: 'ready',
    metaInfo: '低空多光谱无人机自主巡检与病虫害实测视频'
  }
];

interface RightWorkspacePanelProps {
  isOpen: boolean;
  onClose: () => void;
  activeFileId: string;
  onSelectFile: (fileId: string) => void;
  openTabs: string[];
  onCloseTab: (fileId: string) => void;
  onAddTab: (fileId: string) => void;
  allFiles?: AssociatedFileItem[];
  projectName?: string;
  widthPx?: number;
  widthPercent?: number;
  isDragging?: boolean;
  isExpandedFull?: boolean;
  onToggleExpandedFull?: () => void;
  // Review & Annotation features
  reviewFiles?: ReviewFileItem[];
  activeReviewIndex?: number;
  onSelectReviewIndex?: (index: number) => void;
  onAddAnnotation?: (fileId: string, annotation: { selectedText: string; comment: string; side?: 'old' | 'new' | 'single' }) => void;
  onRemoveAnnotation?: (fileId: string, annotationId: string) => void;
  panelMode?: 'review' | 'deliverables';
  onSetPanelMode?: (mode: 'review' | 'deliverables') => void;
  onReviewDecision?: (fileId: string, decision: ReviewDecision, comment?: string) => void;
}

export default function RightWorkspacePanel({
  isOpen,
  onClose,
  activeFileId,
  onSelectFile,
  openTabs,
  onCloseTab,
  onAddTab,
  allFiles = ALL_PROJECT_DELIVERABLES,
  projectName = '安里AI / 智耘农业',
  widthPx,
  widthPercent = 40,
  isDragging = false,
  isExpandedFull: externalIsExpandedFull,
  onToggleExpandedFull,
  reviewFiles = [],
  activeReviewIndex = 0,
  onSelectReviewIndex,
  onAddAnnotation,
  onRemoveAnnotation,
  panelMode: externalPanelMode,
  onSetPanelMode,
  onReviewDecision
}: RightWorkspacePanelProps) {
  const [showDeliverablesMenu, setShowDeliverablesMenu] = useState(false);
  const [internalIsExpandedFull, setInternalIsExpandedFull] = useState(false);
  const [showImproveModal, setShowImproveModal] = useState<boolean>(false);
  const [improveComment, setImproveComment] = useState<string>('');
  const [internalPanelMode, setInternalPanelMode] = useState<'review' | 'deliverables'>(
    (reviewFiles && reviewFiles.length > 0) ? 'review' : 'deliverables'
  );

  const currentMode = externalPanelMode !== undefined ? externalPanelMode : internalPanelMode;
  const setMode = (m: 'review' | 'deliverables') => {
    if (onSetPanelMode) onSetPanelMode(m);
    setInternalPanelMode(m);
  };

  const activeReviewFile = reviewFiles.length > 0 ? (reviewFiles[activeReviewIndex] || reviewFiles[0]) : null;
  const pendingReviewCount = reviewFiles.filter(f => f.status === 'pending').length;

  // 判断当前文件是否属于审核项且需要审批
  const isReviewFile = currentMode === 'review' && !!activeReviewFile;
  const isApprovalNeeded = isReviewFile && activeReviewFile.status === 'pending';

  const handleApprove = () => {
    const file = activeReviewFile || (reviewFiles.length > 0 ? reviewFiles[0] : null);
    if (file) {
      if (onReviewDecision) {
        onReviewDecision(file.id, 'approved');
      }
      showToast(`已同意《${file.name}》并合并至项目交付物库`);
    }
  };

  const handleReject = () => {
    const file = activeReviewFile || (reviewFiles.length > 0 ? reviewFiles[0] : null);
    if (file) {
      if (onReviewDecision) {
        onReviewDecision(file.id, 'rejected');
      }
      showToast(`已否决《${file.name}》修改方案，保留原基准版本`);
    }
  };

  const handleImproveSubmit = () => {
    const file = activeReviewFile || (reviewFiles.length > 0 ? reviewFiles[0] : null);
    const comment = improveComment.trim();
    if (!comment) return;
    if (file) {
      if (onReviewDecision) {
        onReviewDecision(file.id, 'improved', comment);
      }
      showToast(`已提交对《${file.name}》的改进意见`);
    }
    setShowImproveModal(false);
    setImproveComment('');
  };
  
  // Controlled or uncontrolled support for expanded full state
  const isExpandedFull = externalIsExpandedFull !== undefined ? externalIsExpandedFull : internalIsExpandedFull;
  const toggleFullscreen = () => {
    if (onToggleExpandedFull) {
      onToggleExpandedFull();
    } else {
      setInternalIsExpandedFull(prev => !prev);
    }
  };

  const [freeSelectMode, setFreeSelectMode] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(48); // default 48% matching screenshot
  const [activeSheetTab, setActiveSheetTab] = useState<'roadmap' | 'budget' | 'kpi'>('roadmap');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Old version visibility toggle (default closed: false)
  const [showOldVersion, setShowOldVersion] = useState<boolean>(false);
  // Saved annotations drawer toggle (default closed: false)
  const [showAnnotations, setShowAnnotations] = useState<boolean>(false);
  // Change declaration panel toggle (default open: true)
  const [showChangeDeclaration, setShowChangeDeclaration] = useState<boolean>(true);

  // Listen for ESC key to exit in-page fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isExpandedFull) {
        if (onToggleExpandedFull) {
          onToggleExpandedFull();
        } else {
          setInternalIsExpandedFull(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isExpandedFull, onToggleExpandedFull]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2000);
  };

  const activeFile = allFiles.find(f => f.id === activeFileId) || allFiles[0];

  const getFileIcon = (type: string, className = "h-3.5 w-3.5") => {
    switch (type) {
      case 'ppt':
        return <Presentation className={`${className} text-orange-500`} />;
      case 'excel':
        return <FileSpreadsheet className={`${className} text-emerald-600`} />;
      case 'doc':
      case 'bp':
        return <FileText className={`${className} text-blue-600`} />;
      case 'vcr':
        return <Video className={`${className} text-purple-500`} />;
      default:
        return <Paperclip className={`${className} text-slate-500`} />;
    }
  };

  const currentFileName = currentMode === 'review' && activeReviewFile
    ? activeReviewFile.name
    : (activeFile?.name || '产物文件');

  const currentFileBadge = currentMode === 'review' && activeReviewFile
    ? (activeReviewFile.changeType === 'modify' ? '修改' : '新增')
    : null;

  const currentAnnotationsCount = currentMode === 'review' && activeReviewFile
    ? activeReviewFile.annotations.length
    : 0;

  if (!isOpen) return null;

  return (
    <aside 
      id="right-independent-workspace"
      style={
        isExpandedFull 
          ? { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100vh', zIndex: 9999 } 
          : widthPx !== undefined 
            ? { width: `${widthPx}px` } 
            : { width: `${widthPercent}%` }
      }
      className={`flex flex-col bg-white select-none ${
        isDragging ? '' : 'transition-all duration-150'
      } ${
        isExpandedFull 
          ? 'fixed inset-0 z-[9999] w-screen h-screen border-none shadow-2xl overflow-hidden' 
          : 'h-full border-l border-slate-200 shadow-sm shrink-0 relative'
      }`}
    >
      {/* Dragging Transparent Overlay to prevent event dropping */}
      {isDragging && (
        <div className="absolute inset-0 z-50 bg-sky-500/5 cursor-col-resize select-none pointer-events-auto" />
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-12 right-6 z-50 bg-slate-900 text-white text-xs px-3.5 py-2 rounded-xl shadow-xl flex items-center space-x-2 animate-in fade-in slide-in-from-top-2 duration-150">
          <Check className="h-3.5 w-3.5 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* 1. SINGLE MERGED HEADER: 产物清单 + 旧版本开关 + 已存批注 + 窗口操作 */}
      {/* ----------------------------------------------------------------- */}
      <div className="h-11 bg-white border-b border-slate-200 px-3 flex items-center justify-between shrink-0 select-none relative z-30">
        <div className="flex items-center space-x-2 min-w-0">
          {/* 产物清单 Dropdown Button (保留“产物清单”，增加标识，“修改”和“新增”，两者都没有的不标识) */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setShowDeliverablesMenu(prev => !prev)}
              className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200/80 text-slate-800 border border-slate-200 transition-colors cursor-pointer"
              title="查看与切换产物清单"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-sky-600 shrink-0" />
              <span>产物清单</span>
              {currentFileBadge && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                  currentFileBadge === '修改' 
                    ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                    : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                }`}>
                  {currentFileBadge}
                </span>
              )}
              <span className="text-slate-500 font-normal max-w-[130px] sm:max-w-[180px] md:max-w-[220px] truncate hidden sm:inline">
                ({currentFileName})
              </span>
              <ChevronDown className={`h-3 w-3 text-slate-400 transition-transform ${showDeliverablesMenu ? 'rotate-180' : ''}`} />
            </button>

            {/* Deliverables Dropdown Menu */}
            {showDeliverablesMenu && (
              <div 
                className="absolute left-0 top-10 w-80 bg-white rounded-xl border border-slate-200 shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150"
              >
                <div className="px-2.5 py-1.5 mb-1 border-b border-slate-100 text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>产物清单目录</span>
                  <span className="text-[10px] text-slate-400 font-normal">点击选择文件</span>
                </div>

                <div className="space-y-1 max-h-80 overflow-y-auto">
                  {/* 1. Review items: 增加标识，“修改”和“新增” */}
                  {reviewFiles.map((revFile, idx) => {
                    const isSelected = currentMode === 'review' && activeReviewIndex === idx;
                    const badge = revFile.changeType === 'modify' ? '修改' : '新增';
                    return (
                      <div
                        key={revFile.id}
                        onClick={() => {
                          setMode('review');
                          if (onSelectReviewIndex) onSelectReviewIndex(idx);
                          setShowDeliverablesMenu(false);
                        }}
                        className={`flex items-center justify-between px-2.5 py-2 rounded-lg text-xs cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-sky-50 text-sky-900 font-semibold border border-sky-200'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center space-x-2 min-w-0 flex-1 mr-2">
                          {getFileIcon(revFile.fileType, "h-4 w-4 shrink-0")}
                          <span className="truncate">{revFile.name}</span>
                        </div>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold shrink-0 ${
                          badge === '修改' 
                            ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                            : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        }`}>
                          {badge}
                        </span>
                      </div>
                    );
                  })}

                  {/* 2. Standard deliverables: 两者都没有的不标识 */}
                  {allFiles.filter(f => !reviewFiles.some(r => r.name === f.name)).map((file) => {
                    const isCurrent = currentMode === 'deliverables' && file.id === activeFile?.id;
                    return (
                      <div
                        key={file.id}
                        onClick={() => {
                          setMode('deliverables');
                          onSelectFile(file.id);
                          setShowDeliverablesMenu(false);
                        }}
                        className={`flex items-center justify-between px-2.5 py-2 rounded-lg text-xs cursor-pointer transition-colors ${
                          isCurrent
                            ? 'bg-sky-50 text-sky-900 font-semibold border border-sky-200'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center space-x-2 min-w-0 flex-1">
                          {getFileIcon(file.type, "h-4 w-4 shrink-0")}
                          <span className="truncate">{file.name}</span>
                        </div>
                        {/* 两者都没有的不标识 */}
                      </div>
                    );
                  })}
                </div>

                <div className="pt-1.5 mt-1 border-t border-slate-100 px-2 flex items-center justify-between text-[11px] text-slate-500">
                  <span>共 {reviewFiles.length + allFiles.length} 项交付产物</span>
                  <span 
                    onClick={() => {
                      showToast('已打包下载全部产物');
                      setShowDeliverablesMenu(false);
                    }}
                    className="text-sky-600 font-medium cursor-pointer hover:underline"
                  >
                    全部导出ZIP
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right side: 审核项 (顶部右对齐) + 审批三按钮 (右对齐) + Window controls */}
        <div className="flex items-center space-x-2 shrink-0 ml-auto">
          {/* 顶部右对齐：审核项指示 */}
          {isReviewFile ? (
            <div 
              className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-100/90 border border-slate-200 text-xs font-medium font-mono text-slate-700 shrink-0 select-none"
              title={`当前处于审核模式，共 ${reviewFiles.length} 项待处理`}
            >
              <span className="text-slate-500">审核项：</span>
              <span className="font-bold text-slate-800">{activeReviewIndex + 1} / {reviewFiles.length}</span>
              {activeReviewFile?.status !== 'pending' && (
                <span className={`text-[10px] font-sans font-semibold px-1 py-0.2 rounded ml-1 ${
                  activeReviewFile?.status === 'approved'
                    ? 'text-emerald-700 bg-emerald-100/80 border border-emerald-200'
                    : activeReviewFile?.status === 'rejected'
                      ? 'text-rose-700 bg-rose-100/80 border border-rose-200'
                      : 'text-sky-700 bg-sky-100/80 border border-sky-200'
                }`}>
                  {activeReviewFile?.status === 'approved' ? '已同意' : activeReviewFile?.status === 'rejected' ? '已否决' : '已提改进'}
                </span>
              )}
            </div>
          ) : (
            <div 
              className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/60 text-xs font-medium font-mono text-slate-400 shrink-0 select-none"
              title="当前文件为标准交付物，无需审批"
            >
              <span>审核项：</span>
              <span className="text-[11px] text-slate-400 font-sans">无需审核</span>
            </div>
          )}

          {/* 审批三按钮 (右对齐，不需要审批的文件时变灰变浅色不可点击) */}
          <button
            type="button"
            id="btn-approval-agree"
            disabled={!isApprovalNeeded}
            onClick={isApprovalNeeded ? handleApprove : undefined}
            className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 select-none ${
              isApprovalNeeded
                ? 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-2xs hover:shadow-xs cursor-pointer'
                : 'bg-slate-100 text-slate-400 border border-slate-200/80 cursor-not-allowed shadow-none opacity-60'
            }`}
            title={
              !isReviewFile 
                ? "当前文件无需审批" 
                : activeReviewFile?.status === 'approved' 
                  ? "当前文件已通过审批" 
                  : activeReviewFile?.status === 'rejected'
                    ? "当前文件已否决"
                    : activeReviewFile?.status === 'improved'
                      ? "当前文件已提交改进意见"
                      : "同意并合并至交付物库"
            }
          >
            <Check className={`h-3.5 w-3.5 ${isApprovalNeeded ? 'text-white' : 'text-slate-400'}`} />
            <span>同意</span>
          </button>

          <button
            type="button"
            id="btn-approval-reject"
            disabled={!isApprovalNeeded}
            onClick={isApprovalNeeded ? handleReject : undefined}
            className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 select-none ${
              isApprovalNeeded
                ? 'bg-white hover:bg-rose-50 active:bg-rose-100 text-rose-600 hover:text-rose-700 border border-rose-200 shadow-2xs hover:border-rose-300 cursor-pointer'
                : 'bg-slate-100 text-slate-400 border border-slate-200/80 cursor-not-allowed shadow-none opacity-60'
            }`}
            title={
              !isReviewFile 
                ? "当前文件无需审批" 
                : activeReviewFile?.status !== 'pending'
                  ? "当前文件无需重复处理"
                  : "否决并退回原版本"
            }
          >
            <XCircle className={`h-3.5 w-3.5 ${isApprovalNeeded ? 'text-rose-600' : 'text-slate-400'}`} />
            <span>否决</span>
          </button>

          <button
            type="button"
            id="btn-approval-improve"
            disabled={!isApprovalNeeded}
            onClick={isApprovalNeeded ? () => setShowImproveModal(true) : undefined}
            className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 select-none ${
              isApprovalNeeded
                ? 'bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white shadow-2xs hover:shadow-xs cursor-pointer'
                : 'bg-slate-100 text-slate-400 border border-slate-200/80 cursor-not-allowed shadow-none opacity-60'
            }`}
            title={
              !isReviewFile 
                ? "当前文件无需审批" 
                : activeReviewFile?.status !== 'pending'
                  ? "当前文件无需重复处理"
                  : "点击输入改进意见"
            }
          >
            <Sparkles className={`h-3.5 w-3.5 ${isApprovalNeeded ? 'text-amber-300' : 'text-slate-400'}`} />
            <span>改进</span>
          </button>

          {/* 分隔线 */}
          <div className="h-4 w-px bg-slate-200 mx-0.5 shrink-0" />

          {/* Window controls (Fullscreen, Close) */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className={`p-1.5 rounded-lg transition-colors flex items-center justify-center cursor-pointer ${
              isExpandedFull 
                ? 'text-sky-600 bg-sky-100/80 hover:bg-sky-200' 
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
            title={isExpandedFull ? "退出全屏" : "全屏模式"}
          >
            {isExpandedFull ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            title="收起右侧面板"
          >
            <PanelRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* 2. CANVAS / REVIEW CONTENT DISPLAY                                */}
      {/* ----------------------------------------------------------------- */}
      {currentMode === 'review' && activeReviewFile ? (
        <div className="flex-1 overflow-hidden flex flex-col relative">
          <ReviewFileViewer
            file={activeReviewFile}
            showOldVersion={showOldVersion}
            onToggleOldVersion={() => setShowOldVersion(prev => !prev)}
          />
        </div>
      ) : (
        <div 
          className="flex-1 bg-slate-100/70 overflow-auto p-4 flex flex-col items-center justify-start relative"
          onClick={() => {
            if (showDeliverablesMenu) setShowDeliverablesMenu(false);
          }}
        >
        {/* PPT SLIDE PREVIEW (Default for 安里AI_BP补充_项目路标.pptx) */}
        {activeFile.type === 'ppt' && (
          <div 
            className="w-full max-w-4xl bg-white rounded-xl shadow-md border border-slate-200 flex flex-col overflow-hidden transition-transform duration-200"
            style={{ 
              transform: `scale(${zoomLevel / 48})`,
              transformOrigin: 'top center'
            }}
          >
            {/* Slide Top Banner Header */}
            <div className="bg-[#1E293B] text-white px-5 py-3 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="h-6 w-1 bg-amber-400 rounded-full" />
                <div>
                  <h2 className="text-sm font-bold tracking-tight text-white flex items-center space-x-2">
                    <span>安里AI项目路标 · 全景演进矩阵</span>
                    <span className="text-[10px] font-normal px-2 py-0.5 rounded bg-slate-700 text-slate-300">
                      Deck v3.2
                    </span>
                  </h2>
                  <p className="text-[10px] text-slate-400">
                    阶段定义 | 核心功能 · 场景深度 · 客户与收入 · 融资与合规演进
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-mono text-slate-400 bg-slate-800/80 px-2 py-1 rounded">
                密级：商业绝密 · 参赛评委专用
              </span>
            </div>

            {/* Slide Content: 4-Column Timeline Grid Table */}
            <div className="p-4 bg-slate-50/50">
              {/* Table Column Headers */}
              <div className="grid grid-cols-5 gap-2 text-center text-xs font-bold mb-2">
                <div className="p-2 bg-slate-200/80 rounded-lg text-slate-700 flex items-center justify-center">
                  维度 / 阶段
                </div>
                <div className="p-2 bg-sky-100/90 text-sky-900 rounded-lg border border-sky-200/80">
                  <div>P1 验证期</div>
                  <div className="text-[10px] font-normal text-sky-700">2025.01-06 / 6个月</div>
                </div>
                <div className="p-2 bg-emerald-100/90 text-emerald-900 rounded-lg border border-emerald-200/80">
                  <div>P2 拓展期</div>
                  <div className="text-[10px] font-normal text-emerald-700">2025.07-2026.06 / 12个月</div>
                </div>
                <div className="p-2 bg-indigo-100/90 text-indigo-900 rounded-lg border border-indigo-200/80">
                  <div>P3 增长期</div>
                  <div className="text-[10px] font-normal text-indigo-700">2026.07-2027.06 / 12个月</div>
                </div>
                <div className="p-2 bg-purple-100/90 text-purple-900 rounded-lg border border-purple-200/80">
                  <div>P4 规模化</div>
                  <div className="text-[10px] font-normal text-purple-700">2027.07-2028.12 / 18个月</div>
                </div>
              </div>

              {/* Row 1: 产品里程碑 */}
              <div className="grid grid-cols-5 gap-2 mb-2 text-xs">
                <div className="p-2.5 bg-slate-100 text-slate-800 font-semibold rounded-lg flex items-center justify-center text-center">
                  产品里程碑
                </div>
                <div className="p-2.5 bg-white border border-slate-200 rounded-lg text-[11px] text-slate-700 space-y-1 leading-relaxed">
                  <div className="font-semibold text-sky-800">【MVP基础助手】</div>
                  <div>• Assistant助手7项功能完整列出</div>
                  <div>• 数据脱敏4项、案件库2项</div>
                  <div>• 模型基准评测能力2项全面打通</div>
                </div>
                <div className="p-2.5 bg-white border border-slate-200 rounded-lg text-[11px] text-slate-700 space-y-1 leading-relaxed">
                  <div className="font-semibold text-emerald-800">【SaaS产品化】</div>
                  <div>• 合规审查完成、助手专业拓展</div>
                  <div>• Workflows+多Agent深度协作</div>
                  <div>• 自建替代底层算子各模块子项全展开</div>
                </div>
                <div className="p-2.5 bg-white border border-slate-200 rounded-lg text-[11px] text-slate-700 space-y-1 leading-relaxed">
                  <div className="font-semibold text-indigo-800">【全流程AI化】</div>
                  <div>• 案件立案→庭审全链条AI嵌入</div>
                  <div>• Agent Platform企业级客户化</div>
                  <div>• 行业垂直生态模型私有化部署</div>
                </div>
                <div className="p-2.5 bg-white border border-slate-200 rounded-lg text-[11px] text-slate-700 space-y-1 leading-relaxed">
                  <div className="font-semibold text-purple-800">【平台生态化】</div>
                  <div>• 开发者开放API生态繁荣</div>
                  <div>• 多法域多语言国际版落地</div>
                  <div>• 千家行业大客户私有化集群覆盖</div>
                </div>
              </div>

              {/* Row 2: 场景深度 */}
              <div className="grid grid-cols-5 gap-2 mb-2 text-xs">
                <div className="p-2.5 bg-slate-100 text-slate-800 font-semibold rounded-lg flex items-center justify-center text-center">
                  场景深度
                </div>
                <div className="p-2.5 bg-white border border-slate-200 rounded-lg text-[11px] text-slate-700 space-y-1 leading-relaxed">
                  <div>• 验证目标明确，覆盖范围与交付流程完整保留</div>
                  <div>• 针对知识产权初审与民商事合同高频场景建立标准SOP</div>
                </div>
                <div className="p-2.5 bg-white border border-slate-200 rounded-lg text-[11px] text-slate-700 space-y-1 leading-relaxed">
                  <div>• 刑事+知产各自的具体功能和适用场景充分展开</div>
                  <div>• 诉前风险排查与法条溯源交叉质证试验落地</div>
                </div>
                <div className="p-2.5 bg-white border border-slate-200 rounded-lg text-[11px] text-slate-700 space-y-1 leading-relaxed">
                  <div>• 立案→举证→庭审→判决→执行每个环节AI能力全列出</div>
                  <div>• 智能文书生成与事实要素自动化对齐</div>
                </div>
                <div className="p-2.5 bg-white border border-slate-200 rounded-lg text-[11px] text-slate-700 space-y-1 leading-relaxed">
                  <div>• 司法全场景深度渗透，仲裁委/大型头部律所深度绑定</div>
                  <div>• 跨区域司法行政协同生态闭环</div>
                </div>
              </div>

              {/* Row 3: 客户/收入 */}
              <div className="grid grid-cols-5 gap-2 mb-2 text-xs">
                <div className="p-2.5 bg-slate-100 text-slate-800 font-semibold rounded-lg flex items-center justify-center text-center">
                  客户/收入
                </div>
                <div className="p-2.5 bg-white border border-slate-200 rounded-lg text-[11px] text-slate-700 space-y-1 leading-relaxed">
                  <div>• 种子客户：10家标杆律所</div>
                  <div>• 收入：0~50万元（MVP验证）</div>
                  <div>• 核心验证产品留存与调用频次</div>
                </div>
                <div className="p-2.5 bg-white border border-slate-200 rounded-lg text-[11px] text-slate-700 space-y-1 leading-relaxed">
                  <div>• 年化收入：500~1000万元</div>
                  <div>• 客单价：20~50万/年</div>
                  <div>• 覆盖中型律所与企业法务合规部门</div>
                </div>
                <div className="p-2.5 bg-white border border-slate-200 rounded-lg text-[11px] text-slate-700 space-y-1 leading-relaxed">
                  <div>• 年化收入：2000~3000万元</div>
                  <div>• 客单价：50~100万/年</div>
                  <div>• 大型央国企、顶级红圈所高复购</div>
                </div>
                <div className="p-2.5 bg-white border border-slate-200 rounded-lg text-[11px] text-slate-700 space-y-1 leading-relaxed">
                  <div>• 年化收入：8000万~1.2亿元</div>
                  <div>• SaaS标准化订阅 + 私有化微调服务</div>
                  <div>• 毛利率达 75% 以上</div>
                </div>
              </div>

              {/* Row 4: 融资 */}
              <div className="grid grid-cols-5 gap-2 text-xs">
                <div className="p-2.5 bg-slate-100 text-slate-800 font-semibold rounded-lg flex items-center justify-center text-center">
                  融资规划
                </div>
                <div className="p-2.5 bg-white border border-slate-200 rounded-lg text-[11px] text-slate-700 space-y-1 leading-relaxed">
                  <div className="font-semibold text-slate-800">天使轮：500~1000万</div>
                  <div>核心投向：团队扩充与模型算法初筛落地</div>
                </div>
                <div className="p-2.5 bg-white border border-slate-200 rounded-lg text-[11px] text-slate-700 space-y-1 leading-relaxed">
                  <div className="font-semibold text-slate-800">Pre-A轮：2000~3000万</div>
                  <div>核心投向：商务交付团队与标杆客户扩张</div>
                </div>
                <div className="p-2.5 bg-white border border-slate-200 rounded-lg text-[11px] text-slate-700 space-y-1 leading-relaxed">
                  <div className="font-semibold text-slate-800">A轮：5000万~1亿元</div>
                  <div>核心投向：自建算力中心与全国交付网络</div>
                </div>
                <div className="p-2.5 bg-white border border-slate-200 rounded-lg text-[11px] text-slate-700 space-y-1 leading-relaxed">
                  <div className="font-semibold text-slate-800">B轮/战略轮：2~3亿元</div>
                  <div>核心投向：海外多法域并购与生态基金</div>
                </div>
              </div>

              {/* Bottom Slide Footer Note */}
              <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500">
                <span className="font-mono">
                  核心逻辑：MVP验证算法P0 → 场景扩充+SaaS化(P2) → 全流程AI化+客户拓展(P3) → 矩阵拓展+生态化(P4)
                </span>
                <span className="text-sky-600 hover:underline cursor-pointer">
                  点击添加演示备注
                </span>
              </div>
            </div>
          </div>
        )}

        {/* EXCEL SPREADSHEET PREVIEW */}
        {activeFile.type === 'excel' && (
          <div 
            className="w-full max-w-4xl bg-white rounded-xl shadow-md border border-slate-200 flex flex-col overflow-hidden"
            style={{ 
              transform: `scale(${zoomLevel / 48})`,
              transformOrigin: 'top center'
            }}
          >
            <div className="bg-emerald-700 text-white px-4 py-2.5 flex items-center justify-between">
              <span className="text-xs font-semibold flex items-center space-x-2">
                <FileSpreadsheet className="h-4 w-4" />
                <span>{activeFile.name}</span>
              </span>
              <div className="flex items-center space-x-2 text-xs">
                <button 
                  onClick={() => setActiveSheetTab('roadmap')}
                  className={`px-2 py-0.5 rounded ${activeSheetTab === 'roadmap' ? 'bg-white/25 font-bold' : 'hover:bg-white/10'}`}
                >
                  工期甘特
                </button>
                <button 
                  onClick={() => setActiveSheetTab('budget')}
                  className={`px-2 py-0.5 rounded ${activeSheetTab === 'budget' ? 'bg-white/25 font-bold' : 'hover:bg-white/10'}`}
                >
                  财务收支
                </button>
                <button 
                  onClick={() => setActiveSheetTab('kpi')}
                  className={`px-2 py-0.5 rounded ${activeSheetTab === 'kpi' ? 'bg-white/25 font-bold' : 'hover:bg-white/10'}`}
                >
                  指标对标
                </button>
              </div>
            </div>

            {/* Formula Bar */}
            <div className="px-3 py-1.5 bg-slate-50 border-b border-slate-200 flex items-center space-x-2 text-xs font-mono">
              <span className="text-slate-400 font-bold">fx</span>
              <span className="text-slate-700">=SUM(C4:C24)*1.15 [综合预算估算公式]</span>
            </div>

            {/* Table Grid */}
            <div className="p-3 overflow-x-auto text-xs">
              <table className="w-full border-collapse border border-slate-200 text-left">
                <thead>
                  <tr className="bg-slate-100 text-slate-700">
                    <th className="border border-slate-200 p-2 w-12 text-center">序号</th>
                    <th className="border border-slate-200 p-2">阶段交付模块</th>
                    <th className="border border-slate-200 p-2">责任团队</th>
                    <th className="border border-slate-200 p-2">工期排期</th>
                    <th className="border border-slate-200 p-2">预算金额 (万元)</th>
                    <th className="border border-slate-200 p-2">当前对标状态</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { id: 1, name: 'P1 视觉检测算法蒸馏优化', team: '算法研发组', time: '2025.01 - 2025.03', cost: '38.5', status: '已完成 100%' },
                    { id: 2, name: 'P1 数据脱敏与合规沙箱', team: '数据安全组', time: '2025.03 - 2025.05', cost: '22.0', status: '已完成 100%' },
                    { id: 3, name: 'P2 多Agent编排调度引擎', team: '后端架构组', time: '2025.07 - 2025.10', cost: '85.0', status: '推进中 75%' },
                    { id: 4, name: 'P2 10家标杆客户现场部署', team: '解决方案与交付', time: '2025.10 - 2026.03', cost: '120.0', status: '试点交付中' },
                    { id: 5, name: 'P3 全国高校及赛区知识产权复核', team: '商务与法务组', time: '2026.04 - 2026.06', cost: '45.0', status: '准备申报' },
                  ].map(row => (
                    <tr key={row.id} className="hover:bg-slate-50">
                      <td className="border border-slate-200 p-2 text-center text-slate-400 font-mono">{row.id}</td>
                      <td className="border border-slate-200 p-2 font-medium text-slate-800">{row.name}</td>
                      <td className="border border-slate-200 p-2 text-slate-600">{row.team}</td>
                      <td className="border border-slate-200 p-2 text-slate-600 font-mono">{row.time}</td>
                      <td className="border border-slate-200 p-2 text-right font-mono font-semibold text-slate-900">{row.cost}</td>
                      <td className="border border-slate-200 p-2 text-emerald-600 font-semibold">{row.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* WORD/DOC/BP PREVIEW */}
        {(activeFile.type === 'doc' || activeFile.type === 'bp' || activeFile.type === 'attachment' || activeFile.type === 'vcr') && (
          <div 
            className="w-full max-w-3xl bg-white rounded-xl shadow-md border border-slate-200 p-6 space-y-4"
            style={{ 
              transform: `scale(${zoomLevel / 48})`,
              transformOrigin: 'top center'
            }}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h1 className="text-base font-bold text-slate-900">{activeFile.name}</h1>
                <p className="text-xs text-slate-400 mt-0.5">最后更新：{activeFile.updateTime} · 格式：{activeFile.typeLabel}</p>
              </div>
              <button 
                onClick={() => showToast('已下载该文件至本地')}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-semibold text-slate-700 flex items-center space-x-1"
              >
                <Download className="h-3.5 w-3.5" />
                <span>导出源文件</span>
              </button>
            </div>

            <div className="text-xs text-slate-700 space-y-3 leading-relaxed">
              <h2 className="text-sm font-semibold text-slate-900 pt-2 border-b border-slate-100 pb-1">
                第一章：项目概述与核心痛点
              </h2>
              <p>
                本项目紧密契合 2026 年中国国际大学生创新大赛评审导向。针对传统行业面临的专家稀缺、数据孤岛与人工流转低效三大卡脖子难题，创新性提出了自主研发的垂直场景推理引擎与多 Agent 协同体系。
              </p>

              <h2 className="text-sm font-semibold text-slate-900 pt-2 border-b border-slate-100 pb-1">
                第二章：技术壁垒与知识产权自主可控
              </h2>
              <p>
                已获得 4 项国家发明专利独占实施许可与 6 项软件著作权登记。在核心算法层面，通过小样本蒸馏技术使端侧推理速度提升 400%，在保持 99.2% 精准度的同时极大降低算力基础设施成本。
              </p>

              <h2 className="text-sm font-semibold text-slate-900 pt-2 border-b border-slate-100 pb-1">
                第三章：真实落地商业台账与未来演进
              </h2>
              <p>
                团队坚决杜绝“纸面虚构营收”，已与建瓯、吉安等头部示范单位签署真实服务合同，形成带公章挽损增收台账。四阶演进规划清晰，具备高度可落地的持续商业造血能力。
              </p>
            </div>
          </div>
        )}
      </div>
      )}

      {/* 改进意见输入小窗口 (Modal) */}
      {showImproveModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-sky-50/60 to-indigo-50/40">
              <div className="flex items-center space-x-2.5">
                <div className="h-8 w-8 rounded-xl bg-sky-100 flex items-center justify-center text-sky-600">
                  <Sparkles className="h-4 w-4 text-sky-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">输入改进意见</h3>
                  <p className="text-[11px] text-slate-500 truncate max-w-xs sm:max-w-sm">
                    针对《{currentFileName}》向智能体提出针对性修改要求
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowImproveModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  具体修改与润色建议 <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={improveComment}
                  onChange={(e) => setImproveComment(e.target.value)}
                  placeholder="请详细描述具体的优化方向或修改意见（例如：补充核心技术壁垒对比、完善商业模式与财务预测数据、强化答辩逻辑结构等）..."
                  rows={4}
                  autoFocus
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 resize-none placeholder:text-slate-400 leading-relaxed text-slate-800"
                />
              </div>

              {/* Quick suggestion tags */}
              <div className="space-y-1.5">
                <span className="text-[11px] text-slate-500 font-medium">快捷建议参考：</span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    '补充竞品技术壁垒对比与权威检测数据',
                    '完善未来三年财务预测与敏感性分析',
                    '强化路演逻辑，对标国赛金奖精简要点',
                    '针对行业痛点深化场景化落地应用案例'
                  ].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        setImproveComment(prev => prev ? `${prev}\n· ${tag}` : `· ${tag}`);
                      }}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-sky-50 hover:text-sky-700 hover:border-sky-200 border border-slate-200/80 text-slate-600 transition-colors cursor-pointer"
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 hidden sm:inline">
                提交后将由双创专家 Agent 重新推理润色
              </span>
              <div className="flex items-center space-x-2 ml-auto">
                <button
                  type="button"
                  onClick={() => setShowImproveModal(false)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-200/70 transition-colors cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleImproveSubmit}
                  disabled={!improveComment.trim()}
                  className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-sky-600 hover:bg-sky-700 active:bg-sky-800 disabled:bg-slate-200 disabled:text-slate-400 text-white flex items-center space-x-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>提交改进</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
