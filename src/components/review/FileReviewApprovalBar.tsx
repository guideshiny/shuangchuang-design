/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Check, 
  X, 
  Sparkles, 
  FileText, 
  Presentation, 
  FileSpreadsheet, 
  ChevronLeft, 
  ChevronRight, 
  ExternalLink,
  MessageSquare,
  GitCompare,
  PlusCircle,
  Clock
} from 'lucide-react';
import { ReviewFileItem } from '../../types/reviewTypes';

interface FileReviewApprovalBarProps {
  activeFile: ReviewFileItem | null;
  currentIndex: number;
  totalFiles: number;
  onApprove: () => void;
  onReject: () => void;
  onImprove: () => void;
  onSelectIndex: (index: number) => void;
  isWorkspaceOpen?: boolean;
  onOpenWorkspace?: () => void;
  allFiles?: ReviewFileItem[];
}

export default function FileReviewApprovalBar({
  activeFile,
  currentIndex,
  totalFiles,
  onApprove,
  onReject,
  onImprove,
  onSelectIndex,
  isWorkspaceOpen = true,
  onOpenWorkspace,
  allFiles = []
}: FileReviewApprovalBarProps) {
  if (!activeFile) return null;

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'ppt':
        return <Presentation className="h-4 w-4 text-orange-500 shrink-0" />;
      case 'excel':
        return <FileSpreadsheet className="h-4 w-4 text-emerald-600 shrink-0" />;
      default:
        return <FileText className="h-4 w-4 text-blue-600 shrink-0" />;
    }
  };

  const isPending = activeFile.status === 'pending';
  const annotationCount = activeFile.annotations.length;

  return (
    <div 
      id="file-review-approval-bar"
      className="w-full bg-white rounded-2xl border-2 border-sky-300 shadow-md p-3.5 sm:p-4 mb-3 animate-in fade-in slide-in-from-bottom-2 duration-150 select-none"
    >
      {/* Top Header: Queue indicator, file type tag, and jump control */}
      <div className="flex items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-slate-100">
        <div className="flex items-center space-x-2 min-w-0">
          {/* Status Badge */}
          {activeFile.changeType === 'create' ? (
            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
              <PlusCircle className="h-3 w-3" />
              <span>Agent 新增文件</span>
            </span>
          ) : (
            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
              <GitCompare className="h-3 w-3" />
              <span>Agent 修改文件 (左右同步对比)</span>
            </span>
          )}

          {/* Decision Status if not pending */}
          {activeFile.status === 'approved' && (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-600 text-white">
              已同意
            </span>
          )}
          {activeFile.status === 'rejected' && (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-600 text-white">
              已否决
            </span>
          )}
          {activeFile.status === 'improved' && (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-600 text-white">
              已要求改进
            </span>
          )}

          {/* Progress count */}
          <span className="text-xs text-slate-400 font-mono">
            待审进度 {currentIndex + 1} / {totalFiles}
          </span>
        </div>

        {/* Right side navigation & workspace link */}
        <div className="flex items-center space-x-2 shrink-0">
          {/* Pager */}
          <div className="flex items-center space-x-1 bg-slate-100 rounded-lg p-0.5 text-xs text-slate-600">
            <button
              type="button"
              disabled={currentIndex <= 0}
              onClick={() => onSelectIndex(currentIndex - 1)}
              className="p-1 rounded hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed"
              title="查看上一个文件"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <span className="px-1.5 font-mono text-[11px]">
              {currentIndex + 1}/{totalFiles}
            </span>
            <button
              type="button"
              disabled={currentIndex >= totalFiles - 1}
              onClick={() => onSelectIndex(currentIndex + 1)}
              className="p-1 rounded hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed"
              title="查看下一个文件"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Quick jump to Right Panel */}
          {onOpenWorkspace && (
            <button
              type="button"
              onClick={onOpenWorkspace}
              className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-medium text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 transition-colors cursor-pointer"
              title="在右侧产物与审核区查看全文并划词写批注"
            >
              <span>{isWorkspaceOpen ? '右侧审核中' : '打开产物与审核区'}</span>
              <ExternalLink className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* Middle: File Details */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div className="flex items-start space-x-2.5 min-w-0 flex-1">
          <div className="p-2 rounded-xl bg-slate-100 border border-slate-200 shrink-0 mt-0.5">
            {getFileIcon(activeFile.fileType)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-2">
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate" title={activeFile.name}>
                {activeFile.name}
              </h4>
              <span className="text-[10px] text-slate-400 font-mono shrink-0">
                {activeFile.size} · {activeFile.updateTime}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5 line-clamp-1">
              {activeFile.summary}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom: The 3 Decision Buttons (同意 / 否决 / 改进) */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
        <div className="text-[11px] text-slate-400">
          点击审批按钮后将保存决议并自动跳转到下一个待审文件
        </div>

        <div className="flex items-center space-x-2 ml-auto">
          {/* Button 1: 同意 */}
          <button
            type="button"
            id="btn-approval-agree"
            onClick={onApprove}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-semibold shadow-xs hover:shadow transition-all cursor-pointer"
            title="同意此文件的新增或修改，并跳转下一个文件"
          >
            <Check className="h-4 w-4" />
            <span>同意</span>
          </button>

          {/* Button 2: 否决 */}
          <button
            type="button"
            id="btn-approval-reject"
            onClick={onReject}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 hover:border-rose-400 text-xs font-semibold shadow-2xs hover:shadow-xs transition-all cursor-pointer"
            title="否决此文件的新增或修改，并跳转下一个文件"
          >
            <X className="h-4 w-4" />
            <span>否决</span>
          </button>

          {/* Button 3: 改进 */}
          <button
            type="button"
            id="btn-approval-improve"
            onClick={onImprove}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white text-xs font-semibold shadow-xs hover:shadow transition-all cursor-pointer"
            title="要求智能体优化改进"
          >
            <Sparkles className="h-4 w-4 text-amber-300" />
            <span>改进</span>
          </button>
        </div>
      </div>
    </div>
  );
}
