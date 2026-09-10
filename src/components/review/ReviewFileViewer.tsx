/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { 
  FileText, 
  GitCompare, 
  PlusCircle, 
  X, 
  History
} from 'lucide-react';
import { ReviewFileItem } from '../../types/reviewTypes';

interface ReviewFileViewerProps {
  file: ReviewFileItem;
  onAddAnnotation?: (fileId: string, annotation: { selectedText: string; comment: string; side?: 'old' | 'new' | 'single' }) => void;
  onRemoveAnnotation?: (fileId: string, annotationId: string) => void;
  showOldVersion?: boolean;
  onToggleOldVersion?: () => void;
  showAnnotationsDrawer?: boolean;
  onToggleAnnotationsDrawer?: () => void;
  showChangeDeclaration?: boolean;
  onToggleChangeDeclaration?: () => void;
}

export default function ReviewFileViewer({
  file,
  showOldVersion: propShowOldVersion,
  onToggleOldVersion,
}: ReviewFileViewerProps) {
  // Internal fallback for old version visibility (default closed: false)
  const [internalShowOldVersion, setInternalShowOldVersion] = useState<boolean>(false);
  const showOldVersion = propShowOldVersion !== undefined ? propShowOldVersion : internalShowOldVersion;
  const toggleOldVersion = onToggleOldVersion || (() => setInternalShowOldVersion(prev => !prev));

  const containerRef = useRef<HTMLDivElement>(null);

  // Helper to render text paragraph
  const renderParagraph = (text: string, pIdx: number) => {
    const isHeading = text.startsWith('【') || text.startsWith('一、') || text.startsWith('二、') || text.startsWith('三、');

    return (
      <div 
        key={pIdx} 
        className={`relative p-3 rounded-lg transition-colors ${
          isHeading 
            ? 'font-bold text-slate-900 bg-slate-50/90 mt-3 first:mt-0 text-xs sm:text-sm border-l-2 border-sky-500' 
            : 'text-xs text-slate-700 leading-relaxed hover:bg-slate-50/50'
        }`}
      >
        <span>{text}</span>
      </div>
    );
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full flex flex-col overflow-hidden bg-slate-100/70"
    >
      {/* Main Canvas Body */}
      <div className="flex-1 flex overflow-hidden p-3 gap-3">
        {/* Document Content View */}
        <div className="flex-1 flex flex-col min-w-0 bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
          {file.changeType === 'modify' ? (
            /* Modified File View */
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
              {/* Optional Old Version Column (Closed by default: showOldVersion === false) */}
              {showOldVersion && (
                <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-slate-50/40 animate-in fade-in duration-150">
                  <div className="px-3.5 py-2.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between shrink-0">
                    <span className="font-semibold text-xs text-slate-700 flex items-center space-x-1.5">
                      <span className="h-2 w-2 rounded-full bg-slate-400" />
                      <span>修改前 · 原始旧版本</span>
                    </span>
                    <button
                      type="button"
                      onClick={toggleOldVersion}
                      className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center space-x-1 cursor-pointer"
                    >
                      <X className="h-3 w-3" />
                      <span>关闭旧版</span>
                    </button>
                  </div>
                  {/* Independent scroll */}
                  <div 
                    className="flex-1 overflow-y-auto p-4 space-y-2 select-text"
                  >
                    {(file.originalContent || []).map((para, idx) => 
                      renderParagraph(para, idx)
                    )}
                  </div>
                </div>
              )}

              {/* New Version Column (Main) */}
              <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-white">
                <div className="px-3.5 py-2.5 bg-sky-50 border-b border-sky-100 flex items-center justify-between shrink-0">
                  <span className="font-semibold text-xs text-sky-900 flex items-center space-x-1.5">
                    <span className="h-2 w-2 rounded-full bg-sky-500 animate-pulse" />
                    <span>修改后 · Agent 最新优化版本</span>
                  </span>
                  <div className="flex items-center space-x-2">
                    {!showOldVersion && (
                      <button
                        type="button"
                        onClick={toggleOldVersion}
                        className="text-[11px] px-2 py-0.5 rounded bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 flex items-center space-x-1 cursor-pointer font-medium"
                      >
                        <History className="h-3 w-3 text-amber-600" />
                        <span>对比旧版本</span>
                      </button>
                    )}
                    <span className="text-[10px] text-sky-700 font-mono bg-sky-100/80 px-1.5 py-0.5 rounded">
                      最新
                    </span>
                  </div>
                </div>

                {/* Independent scroll */}
                <div 
                  className="flex-1 overflow-y-auto p-5 space-y-2.5 select-text"
                >
                  <div className="pb-3 mb-2 border-b border-slate-100">
                    <h1 className="text-base font-bold text-slate-900">{file.name}</h1>
                    <p className="text-xs text-slate-500 mt-1">
                      分类：{file.typeLabel} · 产出：{file.updateTime} · 摘要：{file.summary}
                    </p>
                  </div>
                  {file.modifiedContent.map((para, idx) => 
                    renderParagraph(para, idx)
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Created File View */
            <div className="flex-1 flex flex-col h-full overflow-hidden bg-white">
              <div className="px-4 py-2.5 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between shrink-0">
                <div className="flex items-center space-x-2">
                  <PlusCircle className="h-4 w-4 text-emerald-600" />
                  <span className="font-semibold text-xs text-emerald-950">
                    Agent 新增文件展示 · 等待人类审批
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] text-emerald-700 font-mono bg-emerald-100 px-2 py-0.5 rounded">
                    新建交付物
                  </span>
                </div>
              </div>
              <div 
                className="flex-1 overflow-y-auto p-6 space-y-3 select-text"
              >
                <div className="pb-3 mb-2 border-b border-slate-200">
                  <h1 className="text-base font-bold text-slate-900">{file.name}</h1>
                  <p className="text-xs text-slate-500 mt-1">
                    分类：{file.typeLabel} · 产出：{file.updateTime} · 摘要：{file.summary}
                  </p>
                </div>
                {file.modifiedContent.map((para, idx) => 
                  renderParagraph(para, idx)
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
