import React, { useState, useMemo } from 'react';
import { 
  Folder, 
  FolderOpen,
  FileText, 
  Presentation, 
  FileSpreadsheet, 
  FileCode, 
  ShieldCheck, 
  Video, 
  GitCommit, 
  History, 
  Copy, 
  Check, 
  ChevronRight, 
  ChevronDown, 
  ChevronLeft,
  Search, 
  Code, 
  GitCompare, 
  Download, 
  Upload, 
  Plus, 
  MoreHorizontal, 
  File, 
  ArrowLeft, 
  Clock, 
  User, 
  Calendar, 
  Layers, 
  Info, 
  X, 
  Sparkles, 
  ExternalLink,
  Split,
  Eye,
  CheckCircle2,
  AlertCircle,
  Sun,
  Moon,
  Database,
  Play,
  Pause,
  Volume2,
  Maximize2,
  Award,
  Tag,
  FileCheck,
  SlidersHorizontal,
  LayoutGrid,
  List
} from 'lucide-react';
import { 
  AssetFile, 
  VersionCommit, 
  CommitChange, 
  INITIAL_ASSET_FILES, 
  MOCK_VERSION_COMMITS, 
  FOLDER_METADATA,
  ROADSHOW_SLIDES_DATA 
} from '../data/mockAssetManagementData';
import { ProjectItem, UserSession } from '../types';

interface AssetManagementSystemProps {
  currentProject?: ProjectItem;
  session?: UserSession;
  onNavigateTab?: (tab: string) => void;
}

export default function AssetManagementSystem({
  currentProject,
  session,
  onNavigateTab
}: AssetManagementSystemProps) {
  // Theme state: dark mode (matching GitHub screenshot) or light mode
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  // Active version commit snapshot (null means latest HEAD commit)
  const [versionCommits, setVersionCommits] = useState<VersionCommit[]>(MOCK_VERSION_COMMITS);
  const [selectedCommitId, setSelectedCommitId] = useState<string>(MOCK_VERSION_COMMITS[0].id);

  // Dynamic commit counter for generating sequential realistic mock commits
  const [commitCounter, setCommitCounter] = useState<number>(1);

  // Files data (can be appended if user uses "Add file" or "提交")
  const [filesList, setFilesList] = useState<AssetFile[]>(INITIAL_ASSET_FILES);

  // Current navigation location in middle column
  // 'folder' view (with folderPath, e.g., '' for root, '核心申报', 'src', etc.)
  // or 'file' view (with selectedFileId)
  const [currentFolder, setCurrentFolder] = useState<string>(''); // '' represents root
  const [activeFileId, setActiveFileId] = useState<string | null>(null);

  // Search filter for left column "Go to file"
  const [fileSearchQuery, setFileSearchQuery] = useState<string>('');

  // Tree expanded folders
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    '核心申报': true,
    '用户调研': true,
    '路演答辩': true,
    '演示多媒体': true,
    '佐证材料': true,
    '财务模型': true
  });

  // Multi-modal viewer states
  const [activeSlide, setActiveSlide] = useState<number>(1);
  const [isPlayingVideo, setIsPlayingVideo] = useState<boolean>(false);
  const [videoProgress, setVideoProgress] = useState<number>(38);
  const [activeSheetTab, setActiveSheetTab] = useState<'unit' | 'pnl' | 'cash' | 'bom'>('unit');
  const [showRawCode, setShowRawCode] = useState<boolean>(false);
  const [middleViewMode, setMiddleViewMode] = useState<'table' | 'cards'>('table');

  // Diff Modal state
  const [activeDiffCommit, setActiveDiffCommit] = useState<VersionCommit | null>(null);
  const [selectedDiffFileIndex, setSelectedDiffFileIndex] = useState<number>(0);

  // Add File Modal state
  const [isAddFileModalOpen, setIsAddFileModalOpen] = useState<boolean>(false);
  const [newFileName, setNewFileName] = useState<string>('');
  const [newFileFolder, setNewFileFolder] = useState<string>('核心申报');
  const [newFileType, setNewFileType] = useState<'ppt' | 'excel' | 'doc' | 'pdf' | 'code'>('doc');
  const [newFileMeta, setNewFileMeta] = useState<string>('');

  // Commit timeline filters
  const [authorFilter, setAuthorFilter] = useState<string>('all');
  const [timeFilter, setTimeFilter] = useState<string>('all');

  // Copy SHA or path toast feedback
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard?.writeText?.(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Find currently active commit
  const activeCommit = useMemo(() => {
    return versionCommits.find(c => c.id === selectedCommitId) || versionCommits[0];
  }, [versionCommits, selectedCommitId]);

  const isHeadVersion = activeCommit.id === versionCommits[0].id;

  // Filter files belonging to current snapshot
  const snapshotFiles = useMemo(() => {
    const allowedIds = new Set(activeCommit.fileIdsPresent);
    return filesList.filter(f => allowedIds.has(f.id));
  }, [filesList, activeCommit]);

  // Current viewed file object
  const activeFile = useMemo(() => {
    if (!activeFileId) return null;
    return snapshotFiles.find(f => f.id === activeFileId) || null;
  }, [activeFileId, snapshotFiles]);

  // Folders list in snapshot
  const availableFolders = useMemo(() => {
    const foldersSet = new Set<string>();
    snapshotFiles.forEach(f => {
      if (f.folder) foldersSet.add(f.folder);
    });
    return Array.from(foldersSet);
  }, [snapshotFiles]);

  // Filtered files for Left tree based on search
  const filteredTreeFiles = useMemo(() => {
    if (!fileSearchQuery.trim()) return snapshotFiles;
    const q = fileSearchQuery.toLowerCase();
    return snapshotFiles.filter(f => f.name.toLowerCase().includes(q) || f.path.toLowerCase().includes(q));
  }, [snapshotFiles, fileSearchQuery]);

  // Files in the current middle column folder
  const currentFolderFiles = useMemo(() => {
    return snapshotFiles.filter(f => f.folder === currentFolder);
  }, [snapshotFiles, currentFolder]);

  // Subfolders in the current middle column folder
  const currentFolderSubfolders = useMemo(() => {
    if (currentFolder !== '') return []; // 1-level folders in this prototype
    return availableFolders;
  }, [currentFolder, availableFolders]);

  // Filter commits for Right Timeline
  const filteredCommits = useMemo(() => {
    return versionCommits.filter(c => {
      if (authorFilter !== 'all' && !c.author.name.includes(authorFilter)) return false;
      return true;
    });
  }, [versionCommits, authorFilter]);

  // Group commits by dateLabel
  const groupedCommits = useMemo<Record<string, VersionCommit[]>>(() => {
    const map: Record<string, VersionCommit[]> = {};
    filteredCommits.forEach(c => {
      if (!map[c.dateLabel]) map[c.dateLabel] = [];
      map[c.dateLabel].push(c);
    });
    return map;
  }, [filteredCommits]);

  // Helper for folder toggle
  const toggleFolder = (folderName: string) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderName]: !prev[folderName]
    }));
  };

  // Helper to open a file
  const handleOpenFile = (file: AssetFile) => {
    setActiveFileId(file.id);
    setCurrentFolder(file.folder);
  };

  // Helper to navigate to a folder
  const handleNavigateFolder = (folderName: string) => {
    setActiveFileId(null);
    setCurrentFolder(folderName);
  };

  // Helper to select a version snapshot
  const handleEnterVersionSnapshot = (commitId: string) => {
    setSelectedCommitId(commitId);
    // If current file doesn't exist in new commit, return to folder
    const targetCommit = versionCommits.find(c => c.id === commitId);
    if (targetCommit && activeFileId && !targetCommit.fileIdsPresent.includes(activeFileId)) {
      setActiveFileId(null);
    }
  };

  // Helper to create a new mock version commit when clicking "提交"
  const handleCreateMockCommit = () => {
    const nextNum = commitCounter;
    setCommitCounter(prev => prev + 1);

    const mockCandidates = [
      {
        title: 'feat: 完善国赛答辩演进资产与核心证据链索引 (V3.1)',
        desc: '补充评委极限质询应答卡、更新产线1200小时无故障试跑报告并对标2026大赛评审指标完成资产归档。',
        stage: '国赛最新提交 V3.1',
        addFileName: '2026国赛专家质询应答与合规索引.docx',
        addFilePath: '核心申报/2026国赛专家质询应答与合规索引.docx'
      },
      {
        title: 'docs: 增补财务敏捷测算模型与单客户经济学补充草案 (V3.2)',
        desc: '针对晶圆检测设备长账期及边际制造成本递减模型新增动态敏感性分析，完成终审答辩关键数据支撑。',
        stage: '财务敏捷版 V3.2',
        addFileName: '晶圆检测设备算力与BOM成本动态测算敏捷模型.xlsx',
        addFilePath: '财务模型/晶圆检测设备算力与BOM成本动态测算敏捷模型.xlsx'
      },
      {
        title: 'feat: 优化非对称干涉光路仿真并完成边缘张量板卡测试 (V3.3)',
        desc: '升级端侧嵌入式缺陷分类算法模型，将晶圆开裂虚警过杀率压降至0.078%以下，更新基线说明。',
        stage: '算法优化版 V3.3',
        addFileName: 'wafer_defect_inference_v3.py',
        addFilePath: '核心申报/wafer_defect_inference_v3.py'
      },
      {
        title: 'refactor: 升级国赛金奖对标商业计划书与CNAS检验报告 (V3.4)',
        desc: '完成国家机器人与精密仪器检测评定中心(CNAS)检验报告彩色高精扫描件归档，优化全套路演交付物。',
        stage: '金奖终审版 V3.4',
        addFileName: '国家CNAS全项检验优级判定公告书.pdf',
        addFilePath: '佐证材料/国家CNAS全项检验优级判定公告书.pdf'
      }
    ];

    const currentMock = mockCandidates[(nextNum - 1) % mockCandidates.length];
    const newHash = `${Math.random().toString(16).substring(2, 9)}${Math.random().toString(16).substring(2, 9)}c0fa${nextNum}`;
    const shortHash = newHash.substring(0, 7);

    // Create the associated asset file so the snapshot really reflects the update
    const newFileId = `art-new-commit-${Date.now()}`;
    const newAssetFile: AssetFile = {
      id: newFileId,
      name: currentMock.addFileName,
      path: currentMock.addFilePath,
      folder: currentMock.addFilePath.split('/')[0] || '',
      type: currentMock.addFileName.endsWith('.pptx') ? 'ppt' : currentMock.addFileName.endsWith('.xlsx') ? 'excel' : currentMock.addFileName.endsWith('.pdf') ? 'pdf' : currentMock.addFileName.endsWith('.py') ? 'code' : 'doc',
      typeLabel: '新提交归档产物',
      size: `${(Math.random() * 20 + 8).toFixed(1)} KB`,
      lastCommitMessage: currentMock.title,
      lastCommitDate: '刚刚',
      lastCommitAuthor: '林子越',
      lastCommitHash: shortHash,
      metaInfo: `由 林子越 于刚刚提交审核 (${shortHash})`,
      contentLines: [
        `# ${currentMock.addFileName}`,
        '',
        `> 提交版本: ${currentMock.title}`,
        `> 提交作者: 林子越 (项目负责人)`,
        `> 关联阶段: ${currentMock.stage}`,
        `> 提交哈希: ${shortHash}`,
        `> 产物描述: ${currentMock.desc}`,
        '',
        '## 核心资产审核与评审对标记录',
        '1. 【评审对标】已核验2026大赛评审指标体系，佐证材料链闭环。',
        '2. 【技术支撑】司法专属垂直大模型基准测试结果与代码完全一致。',
        '3. 【现场答辩】已集成至现场路演演示机私有容器环境中。'
      ]
    };

    setFilesList(prev => [newAssetFile, ...prev]);

    const newCommit: VersionCommit = {
      id: `commit-submitted-${Date.now()}`,
      hash: newHash,
      shortHash: shortHash,
      title: currentMock.title,
      description: currentMock.desc,
      author: {
        name: '林子越',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&auto=format&fit=crop&q=80',
        role: '项目负责人'
      },
      date: '2026-09-08',
      dateLabel: 'Commits on Sep 8, 2026',
      timeAgo: '刚刚 (Just now)',
      stageBadge: currentMock.stage,
      fileIdsPresent: [newFileId, ...filesList.map(f => f.id)],
      changes: [
        {
          fileId: newFileId,
          fileName: currentMock.addFileName,
          path: currentMock.addFilePath,
          changeType: 'added',
          additions: 38,
          deletions: 0,
          description: currentMock.desc,
          diffLines: [
            { type: 'add', newLine: 1, text: `+ # ${currentMock.addFileName}` },
            { type: 'add', newLine: 2, text: `+ 提交作者: 林子越 (项目负责人) | 阶段: ${currentMock.stage}` },
            { type: 'add', newLine: 3, text: `+ ${currentMock.desc}` },
            { type: 'add', newLine: 4, text: '+ [已完成] 导师与专家质询答辩材料双向校验' }
          ]
        },
        {
          fileId: 'asset-readme',
          fileName: 'README.md',
          path: 'README.md',
          changeType: 'modified',
          additions: 4,
          deletions: 1,
          description: '更新项目资产版本标签与答辩冲刺状态。',
          diffLines: [
            { type: 'del', oldLine: 8, text: '- **当前演进阶段**: L5 国赛金奖冲刺 (V3.0 Final Release)' },
            { type: 'add', newLine: 8, text: `+ **当前演进阶段**: ${currentMock.stage} (林子越最新提交)` }
          ]
        }
      ]
    };

    setVersionCommits(prev => [newCommit, ...prev]);
    setSelectedCommitId(newCommit.id);
    handleCopy(newCommit.title, `成功新增提交记录: ${newCommit.title}`);
  };

  // Helper to create mock asset file
  const handleCreateMockFile = () => {
    if (!newFileName.trim()) return;
    const extension = newFileName.includes('.') ? newFileName.split('.').pop() || 'docx' : 'docx';
    const cleanName = newFileName.includes('.') ? newFileName : `${newFileName}.docx`;
    const folder = newFileFolder;
    const path = folder ? `${folder}/${cleanName}` : cleanName;

    const newAsset: AssetFile = {
      id: `custom-asset-${Date.now()}`,
      name: cleanName,
      path: path,
      folder: folder,
      type: newFileType,
      typeLabel: `${newFileType.toUpperCase()} 文档`,
      size: '15.4 KB',
      lastCommitMessage: `feat: 新增资产文件 ${cleanName}`,
      lastCommitDate: '刚刚',
      lastCommitAuthor: '林子越',
      lastCommitHash: 'custom' + Math.floor(Math.random() * 89999 + 10000),
      metaInfo: newFileMeta || '通过资产管理系统新增的参赛项目交付物',
      contentLines: [
        `# ${cleanName}`,
        '',
        `> 资产属性: ${newFileType.toUpperCase()}`,
        `> 归档位置: ${path}`,
        `> 提交作者: 林子越 (项目负责人)`,
        `> 创建时间: ${new Date().toLocaleString()}`,
        `> 说明: ${newFileMeta || '新录入的双创赛事关键技术或申报文件'}`
      ]
    };

    setFilesList(prev => [newAsset, ...prev]);
    // Also include in current commit's fileIdsPresent
    activeCommit.fileIdsPresent.push(newAsset.id);
    setIsAddFileModalOpen(false);
    setNewFileName('');
    setNewFileMeta('');
    handleOpenFile(newAsset);
  };

  // File icon renderer
  const renderFileIcon = (type: string, className = "h-4 w-4") => {
    switch (type) {
      case 'ppt':
        return <Presentation className={`${className} text-amber-400`} />;
      case 'excel':
        return <FileSpreadsheet className={`${className} text-emerald-400`} />;
      case 'doc':
      case 'bp':
        return <FileText className={`${className} text-blue-400`} />;
      case 'pdf':
        return <ShieldCheck className={`${className} text-rose-400`} />;
      case 'vcr':
        return <Video className={`${className} text-purple-400`} />;
      case 'code':
      case 'yaml':
      case 'json':
        return <FileCode className={`${className} text-sky-400`} />;
      default:
        return <File className={`${className} text-slate-400`} />;
    }
  };

  // Color classes matching the clean platform aesthetic
  const theme = {
    bg: 'bg-slate-50',
    surface: 'bg-white',
    surfaceSubtle: 'bg-slate-50',
    surfaceHover: 'hover:bg-slate-100',
    border: 'border-slate-200',
    borderSubtle: 'border-slate-100',
    textPrimary: 'text-slate-900',
    textSecondary: 'text-slate-600',
    textMuted: 'text-slate-400',
    accent: 'text-sky-600',
    accentBg: 'bg-sky-50',
    codeBg: 'bg-slate-50/80'
  };

  return (
    <div id="asset-management-system-root" className="flex flex-col h-full bg-slate-50 text-slate-900 font-sans select-none overflow-hidden text-xs">
      
      {/* 3-Column Main Body */}
      <div className="flex-1 flex min-h-0 divide-x divide-slate-200 overflow-hidden bg-slate-50">
        
        {/* ======================= COLUMN 1 (LEFT): FILES LIST ======================= */}
        <div className="w-64 xl:w-72 flex flex-col shrink-0 bg-white overflow-hidden">
          
          {/* Files Header & Search */}
          <div className="p-3 border-b border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-slate-800 font-semibold text-xs">
                <File className="h-4 w-4 text-slate-500" />
                <span>Files 文件资产清单</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  {snapshotFiles.length}
                </span>
              </div>
              <button
                onClick={() => handleNavigateFolder('')}
                className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                title="返回根目录"
              >
                <FolderOpen className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* "Go to file" Search box */}
            <div className="relative">
              <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={fileSearchQuery}
                onChange={(e) => setFileSearchQuery(e.target.value)}
                placeholder="Go to file..."
                className="w-full pl-8 pr-7 py-1 text-xs rounded-md bg-slate-50 border border-slate-200 focus:outline-none focus:border-sky-500 focus:bg-white text-slate-900 placeholder-slate-400 transition-colors"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400 border border-slate-200 bg-white px-1 py-0.2 rounded shadow-2xs">
                T
              </span>
            </div>
          </div>

          {/* Hierarchical File Tree View */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1 text-xs">
            {/* Folders */}
            {availableFolders.map((folderName) => {
              const isExpanded = !!expandedFolders[folderName];
              const folderFiles = snapshotFiles.filter(f => f.folder === folderName);
              const isFolderActive = currentFolder === folderName && !activeFileId;

              return (
                <div key={folderName} className="space-y-0.5">
                  <div
                    onClick={() => {
                      toggleFolder(folderName);
                      handleNavigateFolder(folderName);
                    }}
                    className={`flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer transition-colors group ${
                      isFolderActive 
                        ? 'bg-sky-50 text-sky-700 font-semibold' 
                        : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center space-x-1.5 min-w-0">
                      <span className="text-slate-400 group-hover:text-slate-600">
                        {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                      </span>
                      {isExpanded ? (
                        <FolderOpen className="h-4 w-4 text-sky-600 shrink-0" />
                      ) : (
                        <Folder className="h-4 w-4 text-sky-600 shrink-0" />
                      )}
                      <span className="font-mono text-xs truncate">{folderName}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 group-hover:text-slate-500">
                      {folderFiles.length}
                    </span>
                  </div>

                  {/* Folder Children Files */}
                  {isExpanded && (
                    <div className="pl-4 space-y-0.5 border-l border-slate-200 ml-3 my-0.5">
                      {folderFiles.map(file => {
                        const isFileActive = activeFileId === file.id;
                        return (
                          <div
                            key={file.id}
                            onClick={() => handleOpenFile(file)}
                            className={`flex items-center space-x-2 px-2 py-1 rounded-md cursor-pointer transition-colors group ${
                              isFileActive 
                                ? 'bg-sky-50 text-sky-700 font-semibold border-l-2 border-sky-600' 
                                : 'hover:bg-slate-100 text-slate-700'
                            }`}
                            title={file.name}
                          >
                            {renderFileIcon(file.type)}
                            <span className="font-mono text-xs truncate leading-snug">{file.name}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Root Files: Rendered inline alongside folders without explicit "根目录文件" header */}
            {snapshotFiles.filter(f => !f.folder).map(file => {
              const isFileActive = activeFileId === file.id;
              return (
                <div
                  key={file.id}
                  onClick={() => handleOpenFile(file)}
                  className={`flex items-center space-x-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors group ${
                    isFileActive 
                      ? 'bg-sky-50 text-sky-700 font-semibold border-l-2 border-sky-600' 
                      : 'hover:bg-slate-100 text-slate-700'
                  }`}
                  title={file.name}
                >
                  {renderFileIcon(file.type)}
                  <span className="font-mono text-xs truncate">{file.name}</span>
                </div>
              );
            })}
          </div>

          {/* Left Footer: Asset summary info */}
          <div className="p-2.5 border-t border-slate-200 bg-slate-50 text-[11px] text-slate-500 flex items-center justify-between">
            <span>当前快照共 <strong>{snapshotFiles.length}</strong> 项资产</span>
            <span className="font-mono text-[10px] text-slate-400">{activeCommit.shortHash}</span>
          </div>
        </div>

        {/* ======================= COLUMN 2 (MIDDLE): FOLDER OR FILE CONTENT ======================= */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-50/50 overflow-hidden">
          
          {/* Middle Top Navigation & Breadcrumbs Bar without project name */}
          <div className="h-12 px-4 border-b border-slate-200 bg-white flex items-center justify-between shrink-0">
            {/* Breadcrumb path */}
            <div className="flex items-center space-x-1.5 font-mono text-xs text-slate-700 min-w-0">
              <button
                onClick={() => handleNavigateFolder('')}
                className="hover:text-sky-600 font-semibold text-slate-700 flex items-center space-x-1 transition-colors"
                title="根目录"
              >
                <Folder className="h-3.5 w-3.5 text-sky-600 shrink-0" />
                <span>根目录</span>
              </button>
              <span>/</span>
              {currentFolder && (
                <>
                  <button
                    onClick={() => handleNavigateFolder(currentFolder)}
                    className="hover:text-sky-600 hover:underline text-slate-700"
                  >
                    {currentFolder}
                  </button>
                  <span>/</span>
                </>
              )}
              {activeFile && (
                <span className="text-slate-900 font-semibold truncate">
                  {activeFile.name}
                </span>
              )}
              <button
                onClick={() => handleCopy(activeFile ? activeFile.path : (currentFolder || '/'), 'path')}
                className="p-1 text-slate-400 hover:text-slate-600 transition-colors ml-1"
                title="复制当前路径"
              >
                {copiedText === 'path' ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>

            {/* Actions: Add File */}
            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={() => setIsAddFileModalOpen(true)}
                className="px-3 py-1.5 rounded-md text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors flex items-center space-x-1.5 shadow-xs"
              >
                <Plus className="h-3.5 w-3.5 text-slate-500" />
                <span>Add file</span>
              </button>
              <button
                onClick={() => handleCopy(JSON.stringify(snapshotFiles.map(f => f.name), null, 2), 'export')}
                className="p-1.5 rounded-md bg-white border border-slate-200 text-slate-500 hover:text-slate-700 transition-colors"
                title="导出资产清单"
              >
                <MoreHorizontal className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Main Content Area of Column 2: Folder View OR File View */}
          <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4">
            {/* CONDITIONAL DISPLAY: FOLDER VIEW vs FILE VIEW */}
            {!activeFile ? (
              <div className="space-y-4">
                {/* Folder Header Toolbar with View Mode Switcher */}
                <div className="flex items-center justify-between bg-white px-3.5 py-2.5 rounded-lg border border-slate-200 shadow-xs">
                  <div className="flex items-center space-x-2 min-w-0">
                    <Folder className="h-4 w-4 text-sky-600 shrink-0" />
                    <span className="font-semibold text-slate-800 text-xs truncate">
                      {currentFolder ? `目录: ${currentFolder}` : '全部资产清单 (项目根目录)'}
                    </span>
                    <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                      共 {currentFolderFiles.length + currentFolderSubfolders.length} 项
                    </span>
                  </div>

                  {/* View mode toggle: Table vs Cards */}
                  <div className="flex items-center space-x-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200/80">
                    <button
                      onClick={() => setMiddleViewMode('table')}
                      className={`px-2 py-1 rounded text-xs flex items-center space-x-1 transition-all ${
                        middleViewMode === 'table'
                          ? 'bg-white text-sky-700 font-semibold shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                      title="切换为表格清单视图"
                    >
                      <List className="h-3.5 w-3.5" />
                      <span>表格清单</span>
                    </button>
                    <button
                      onClick={() => setMiddleViewMode('cards')}
                      className={`px-2 py-1 rounded text-xs flex items-center space-x-1 transition-all ${
                        middleViewMode === 'cards'
                          ? 'bg-white text-sky-700 font-semibold shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                      title="切换为多模态资产卡片视图"
                    >
                      <LayoutGrid className="h-3.5 w-3.5" />
                      <span>多模态卡片</span>
                    </button>
                  </div>
                </div>

                {middleViewMode === 'table' ? (
                  /* ================== FOLDER LISTING TABLE ================== */
                  <div className="rounded-lg border border-slate-200 bg-white overflow-hidden shadow-xs">
                    <table className="w-full text-left text-xs divide-y divide-slate-200">
                      <thead className="bg-slate-50 text-slate-600 font-medium">
                        <tr>
                          <th className="px-4 py-2.5 font-normal">Name 资产名称</th>
                          <th className="px-4 py-2.5 font-normal">Last commit message 提交摘要</th>
                          <th className="px-4 py-2.5 font-normal text-right">Last commit date 日期</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-mono">
                        {/* Parent Folder ".." row if inside subfolder */}
                        {currentFolder !== '' && (
                          <tr
                            onClick={() => handleNavigateFolder('')}
                            className="hover:bg-slate-50 cursor-pointer transition-colors text-slate-600 hover:text-sky-600"
                          >
                            <td className="px-4 py-2.5 flex items-center space-x-2 font-bold">
                              <Folder className="h-4 w-4 text-sky-600" />
                              <span>..</span>
                            </td>
                            <td className="px-4 py-2.5 text-slate-400 font-sans italic">返回上一级目录</td>
                            <td className="px-4 py-2.5 text-right text-slate-400">-</td>
                          </tr>
                        )}

                        {/* Subfolders rows */}
                        {currentFolderSubfolders.map(subfolder => {
                          const filesInSub = snapshotFiles.filter(f => f.folder === subfolder);
                          const latestFile = filesInSub[0] || snapshotFiles[0];

                          return (
                            <tr
                              key={subfolder}
                              onClick={() => handleNavigateFolder(subfolder)}
                              className="hover:bg-slate-50 cursor-pointer transition-colors group"
                            >
                              <td className="px-4 py-2.5 text-slate-800 group-hover:text-sky-600">
                                <div className="flex items-center space-x-2">
                                  <Folder className="h-4 w-4 text-sky-600 shrink-0" />
                                  <span className="font-bold">{subfolder}</span>
                                </div>
                              </td>
                              <td className="px-4 py-2.5 text-slate-500 font-sans truncate max-w-md">
                                {latestFile?.lastCommitMessage || activeCommit.title}
                              </td>
                              <td className="px-4 py-2.5 text-right text-slate-400 whitespace-nowrap">
                                {latestFile?.lastCommitDate || activeCommit.timeAgo}
                              </td>
                            </tr>
                          );
                        })}

                        {/* Files rows in current folder */}
                        {currentFolderFiles.map(file => (
                          <tr
                            key={file.id}
                            onClick={() => handleOpenFile(file)}
                            className="hover:bg-slate-50 cursor-pointer transition-colors group"
                          >
                            <td className="px-4 py-2.5 text-slate-800 group-hover:text-sky-600">
                              <div className="flex items-center space-x-2">
                                {renderFileIcon(file.type)}
                                <span className="font-sans font-medium">{file.name}</span>
                                {file.badge && (
                                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-50 text-sky-700 border border-sky-200">
                                    {file.badge}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-2.5 text-slate-500 font-sans truncate max-w-md">
                              {file.lastCommitMessage}
                            </td>
                            <td className="px-4 py-2.5 text-right text-slate-400 whitespace-nowrap">
                              {file.lastCommitDate}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  /* ================== MULTI-MODAL CARDS GRID ================== */
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {currentFolderFiles.map(file => (
                      <div
                        key={file.id}
                        onClick={() => handleOpenFile(file)}
                        className="bg-white rounded-xl border border-slate-200 hover:border-sky-400 hover:shadow-md transition-all p-4 flex flex-col justify-between cursor-pointer group"
                      >
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                              {file.category || file.folder || '通用产物'}
                            </span>
                            {file.badge && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-medium">
                                {file.badge}
                              </span>
                            )}
                          </div>

                          <div className="flex items-start space-x-2.5">
                            <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 group-hover:bg-sky-50 group-hover:border-sky-200 transition-colors">
                              {renderFileIcon(file.type, "h-4 w-4")}
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-semibold text-slate-900 text-xs leading-snug group-hover:text-sky-600 transition-colors">
                                {file.name}
                              </h4>
                              <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                                {file.description || file.metaInfo}
                              </p>
                            </div>
                          </div>

                          {file.tags && file.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-1">
                              {file.tags.map(t => (
                                <span key={t} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-50 text-slate-500 border border-slate-200/60">
                                  #{t}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-3 text-[10px] text-slate-400">
                          <div className="flex items-center space-x-2">
                            <span>{file.size}</span>
                            <span>·</span>
                            <span>{file.lastCommitDate}</span>
                          </div>
                          <span className="text-sky-600 group-hover:translate-x-0.5 transition-transform flex items-center font-medium">
                            检视详情 &rarr;
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* ================== MULTI-MODAL FILE VIEWER ================== */
              <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs space-y-0">
                
                {/* File Viewer Header */}
                <div className="px-5 py-3.5 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 shadow-xs flex items-center justify-center shrink-0">
                      {renderFileIcon(activeFile.type, "h-4 w-4")}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2 flex-wrap gap-1">
                        <h3 className="font-bold text-slate-900 text-sm truncate">{activeFile.name}</h3>
                        {activeFile.badge && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 shrink-0">
                            {activeFile.badge}
                          </span>
                        )}
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200/70 text-slate-700 font-medium shrink-0">
                          {activeFile.category || activeFile.folder}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">
                          {activeFile.size}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 truncate mt-0.5">
                        {activeFile.description || activeFile.metaInfo}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Multi-modal vs Raw Code Switcher */}
                    <button
                      onClick={() => setShowRawCode(!showRawCode)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center space-x-1.5 ${
                        showRawCode 
                          ? 'bg-sky-50 text-sky-700 border-sky-300' 
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                      title={showRawCode ? '切换为真实多模态形态渲染' : '切换为纯文本源码视图'}
                    >
                      <Code className="h-3.5 w-3.5" />
                      <span>{showRawCode ? '多模态渲染' : '纯文本/源码'}</span>
                    </button>

                    <button
                      onClick={() => handleCopy(activeFile.contentPreview || activeFile.contentLines?.join('\n') || '', 'filecontent')}
                      className="px-2.5 py-1.5 rounded-lg text-xs text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 transition-colors flex items-center space-x-1"
                      title="复制文件内容或摘要"
                    >
                      {copiedText === 'filecontent' ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>复制</span>
                    </button>

                    <button
                      onClick={() => {
                        const content = activeFile.contentPreview || activeFile.contentLines?.join('\n') || '';
                        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = activeFile.name;
                        a.click();
                      }}
                      className="px-2.5 py-1.5 rounded-lg text-xs text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 transition-colors flex items-center space-x-1"
                      title="导出/下载本资产文件"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>下载</span>
                    </button>

                    <button
                      onClick={() => setActiveFileId(null)}
                      className="px-2.5 py-1.5 rounded-lg text-xs text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 transition-colors flex items-center space-x-1"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                      <span>返回目录</span>
                    </button>
                  </div>
                </div>

                {/* File Body Content */}
                <div className="p-4 lg:p-6 bg-slate-50/50">
                  {showRawCode ? (
                    /* Fallback Code / Text View */
                    <div className="p-4 font-mono text-xs bg-slate-900 text-slate-200 rounded-xl overflow-x-auto leading-relaxed space-y-1">
                      {(activeFile.contentLines || (activeFile.contentPreview ? activeFile.contentPreview.split('\n') : [activeFile.metaInfo || '文件内容已加载'])).map((line, idx) => (
                        <div key={idx} className="flex hover:bg-slate-800/60 rounded px-1 -mx-1">
                          <span className="w-10 text-right pr-4 text-slate-500 select-none font-mono shrink-0">
                            {idx + 1}
                          </span>
                          <span className="flex-1 whitespace-pre-wrap">{line}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    /* ================== REAL MULTI-MODAL FILE TYPE RENDERING ================== */
                    <div>
                      {/* 1. PPTX 路演幻灯片形态 (16:9 Canvas + 15 Slides Strip) */}
                      {(activeFile.type === 'ppt' || activeFile.ext === 'pptx' || activeFile.name.endsWith('.pptx')) && (
                        <div className="max-w-4xl mx-auto space-y-5">
                          {/* 16:9 Simulated High-End Slide Canvas */}
                          <div className="relative aspect-video w-full bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 rounded-2xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col justify-between p-6 md:p-8 text-white">
                            {/* Slide Canvas Header */}
                            <div className="relative z-10 flex items-center justify-between border-b border-slate-800/80 pb-3">
                              <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                                <span className="text-xs font-semibold tracking-wider uppercase text-indigo-400">
                                  2026 中国国际大学生创新大赛 · 全国总决赛路演
                                </span>
                              </div>
                              <span className="text-xs text-slate-400 font-mono">
                                SLIDE {activeSlide} / {ROADSHOW_SLIDES_DATA.length}
                              </span>
                            </div>

                            {/* Slide Center Hero Body */}
                            <div className="relative z-10 my-auto text-center space-y-3.5 max-w-2xl mx-auto px-4">
                              <div className="inline-block px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-medium tracking-wide">
                                第 {activeSlide} 页核心论证
                              </div>
                              <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-tight">
                                {ROADSHOW_SLIDES_DATA[activeSlide - 1]?.title}
                              </h1>
                              <p className="text-sm md:text-base text-slate-300 font-normal leading-relaxed">
                                {ROADSHOW_SLIDES_DATA[activeSlide - 1]?.subtitle}
                              </p>

                              {/* Dynamic visual preview note per slide */}
                              <div className="mt-4 p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur text-left text-xs text-slate-200">
                                <div className="flex items-center gap-1.5 text-indigo-400 font-semibold mb-1">
                                  <Sparkles className="w-3.5 h-3.5" />
                                  <span>8分钟路演演讲口诀与评委关切点：</span>
                                </div>
                                <p className="text-slate-300 leading-relaxed text-xs">
                                  {ROADSHOW_SLIDES_DATA[activeSlide - 1]?.note}
                                </p>
                              </div>
                            </div>

                            {/* Slide Footer */}
                            <div className="relative z-10 flex items-center justify-between border-t border-slate-800/80 pt-3 text-[11px] text-slate-400">
                              <span>参赛编号：CX2026-HQ88921 | 面向晶圆级高精度光学缺陷检测系统</span>
                              <span>主讲人：李林峰（光学工程博士）/ 林子越（项目负责人）</span>
                            </div>
                          </div>

                          {/* Slide Navigation Controls */}
                          <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center justify-between shadow-xs">
                            <div className="flex items-center gap-2">
                              <button
                                disabled={activeSlide <= 1}
                                onClick={() => setActiveSlide(s => Math.max(1, s - 1))}
                                className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                              >
                                <ChevronLeft className="w-4 h-4" />
                              </button>
                              <span className="text-xs font-semibold text-slate-700 px-2 font-mono">
                                第 {activeSlide} 页 / 共 {ROADSHOW_SLIDES_DATA.length} 页
                              </span>
                              <button
                                disabled={activeSlide >= ROADSHOW_SLIDES_DATA.length}
                                onClick={() => setActiveSlide(s => Math.min(ROADSHOW_SLIDES_DATA.length, s + 1))}
                                className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                              >
                                <ChevronRight className="w-4 h-4" />
                              </button>
                            </div>

                            <span className="text-xs text-slate-500">
                              建议陈述节奏：每页控制在 25~35 秒
                            </span>
                          </div>

                          {/* 15-Slides Thumbnail Strip */}
                          <div className="space-y-2">
                            <div className="text-xs font-semibold text-slate-700">幻灯片缩略序列（点击跳转对应页面）：</div>
                            <div className="flex gap-2 overflow-x-auto pb-2">
                              {ROADSHOW_SLIDES_DATA.map(s => (
                                <div
                                  key={s.page}
                                  onClick={() => setActiveSlide(s.page)}
                                  className={`shrink-0 w-32 p-2 rounded-lg border text-left cursor-pointer transition-all ${
                                    activeSlide === s.page
                                      ? 'border-indigo-600 bg-indigo-50/70 shadow-xs'
                                      : 'border-slate-200 bg-white hover:border-slate-300'
                                  }`}
                                >
                                  <div className="text-[10px] font-mono font-bold text-slate-400 mb-1">
                                    P.{s.page}
                                  </div>
                                  <div className="text-[11px] font-medium text-slate-800 line-clamp-1">
                                    {s.title.slice(3)}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 2. MP4 真实样机演示视频播放器形态 */}
                      {(activeFile.type === 'vcr' || activeFile.ext === 'mp4' || activeFile.name.endsWith('.mp4')) && (
                        <div className="max-w-4xl mx-auto space-y-5">
                          <div className="relative aspect-video w-full bg-slate-950 rounded-2xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col justify-between p-6">
                            {/* Simulated Video Frame */}
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="relative w-full h-full bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950 flex flex-col items-center justify-center text-center p-6">
                                {/* Grid Lines Overlay representing semiconductor optics */}
                                <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />
                                
                                <div className="relative z-10 flex flex-col items-center space-y-4">
                                  <div 
                                    onClick={() => setIsPlayingVideo(!isPlayingVideo)}
                                    className="w-16 h-16 rounded-full bg-indigo-600/90 hover:bg-indigo-600 text-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform cursor-pointer"
                                  >
                                    {isPlayingVideo ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 translate-x-0.5" />}
                                  </div>
                                  <div>
                                    <div className="text-sm font-semibold text-white">
                                      {isPlayingVideo ? '正在播放产线无故障试跑实录...' : '点击播放产线实操与微米缺陷分类演示'}
                                    </div>
                                    <div className="text-xs text-slate-400 mt-1">
                                      4K 60FPS · 时长 03:15 · 某头部芯片洁净中试车间实录
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Video Top Details */}
                            <div className="relative z-10 flex items-center justify-between text-xs text-slate-300">
                              <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur px-2.5 py-1 rounded-md border border-slate-800">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                <span>工业样机现场无故障试跑实录 · 无剪辑原音实录</span>
                              </div>
                              <span className="font-mono text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded">
                                01:05 / 03:15
                              </span>
                            </div>

                            {/* Video Controls Bar */}
                            <div className="relative z-10 space-y-2 bg-slate-900/80 backdrop-blur p-3 rounded-xl border border-slate-800">
                              {/* Progress bar */}
                              <div 
                                className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden cursor-pointer"
                                onClick={(e) => {
                                  const rect = e.currentTarget.getBoundingClientRect();
                                  const p = Math.round(((e.clientX - rect.left) / rect.width) * 100);
                                  setVideoProgress(p);
                                }}
                              >
                                <div className="h-full bg-indigo-500 transition-all duration-150" style={{ width: `${videoProgress}%` }}></div>
                              </div>

                              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                                <div className="flex items-center gap-3">
                                  <button onClick={() => setIsPlayingVideo(!isPlayingVideo)} className="hover:text-white transition-colors">
                                    {isPlayingVideo ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                  </button>
                                  <div className="flex items-center gap-1.5">
                                    <Volume2 className="w-4 h-4" />
                                    <span className="text-[11px]">80%</span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-3">
                                  <span className="text-[11px] font-mono">1.0x 正常速度</span>
                                  <Maximize2 className="w-4 h-4 hover:text-white cursor-pointer" />
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Video Highlights / Key Chapters Jump */}
                          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3 shadow-xs">
                            <div className="text-xs font-semibold text-slate-800">演示视频关键节点跳转与技术要点标记：</div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                              <div onClick={() => setVideoProgress(8)} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between cursor-pointer hover:bg-indigo-50/60 hover:border-indigo-200 transition-colors">
                                <span className="font-medium text-slate-700">00:15 晶圆真空吸附与亚微米初定位</span>
                                <span className="text-indigo-600 font-mono text-[11px]">00:15</span>
                              </div>
                              <div onClick={() => setVideoProgress(34)} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between cursor-pointer hover:bg-indigo-50/60 hover:border-indigo-200 transition-colors">
                                <span className="font-medium text-slate-700">01:05 纳秒激光脉冲大视场全片断层扫查</span>
                                <span className="text-indigo-600 font-mono text-[11px]">01:05</span>
                              </div>
                              <div onClick={() => setVideoProgress(71)} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between cursor-pointer hover:bg-indigo-50/60 hover:border-indigo-200 transition-colors">
                                <span className="font-medium text-slate-700">02:18 边缘张量推理在0.18秒内完成缺陷定级</span>
                                <span className="text-indigo-600 font-mono text-[11px]">02:18</span>
                              </div>
                              <div onClick={() => setVideoProgress(92)} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between cursor-pointer hover:bg-indigo-50/60 hover:border-indigo-200 transition-colors">
                                <span className="font-medium text-slate-700">03:00 自动机械臂分选出料及MES系统自动联锁</span>
                                <span className="text-indigo-600 font-mono text-[11px]">03:00</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 3. PDF 国家权威检测报告 / 专利授权凭证形态 (含红色CNAS检验公章) */}
                      {(activeFile.type === 'pdf' || activeFile.ext === 'pdf' || activeFile.name.endsWith('.pdf')) && (
                        <div className="max-w-3xl mx-auto space-y-6">
                          {/* Simulated Official Document Sheet */}
                          <div className="bg-white rounded-xl shadow-lg border border-slate-300 p-8 md:p-10 relative overflow-hidden text-slate-800">
                            {/* Document Official Watermark / Stamp */}
                            <div className="absolute right-12 bottom-12 w-36 h-36 rounded-full border-4 border-red-600/70 flex flex-col items-center justify-center text-red-600/80 font-bold rotate-[-18deg] select-none pointer-events-none p-2 text-center">
                              <div className="text-[10px] tracking-widest border-b border-red-600/60 pb-1">国家认可委 CNAS 认证</div>
                              <div className="text-xs font-black my-1">检验检测专用章</div>
                              <div className="text-[9px] tracking-tighter">有效检验凭证 · 唯一编号</div>
                            </div>

                            {/* Sheet Header */}
                            <div className="text-center border-b-2 border-red-700 pb-4 mb-6">
                              <div className="text-xs tracking-widest text-slate-500 font-bold uppercase mb-1">
                                中华人民共和国国家检验检测机构资质认定凭证
                              </div>
                              <h1 className="text-xl font-extrabold text-slate-900 tracking-wider">
                                {activeFile.name.replace('.pdf', '')}
                              </h1>
                              <div className="flex items-center justify-center gap-6 text-xs text-slate-500 mt-2 font-mono">
                                <span>报告编号：ST2026-0902-8871</span>
                                <span>受检样品：晶圆级光学缺陷在线检测整机V2</span>
                                <span>送检单位：高校联合创新实验室</span>
                              </div>
                            </div>

                            {/* Inspection Results Table */}
                            <div className="space-y-4 text-xs">
                              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                                <div className="font-bold text-slate-800 mb-2">一、核心技术性能检测综合结论：</div>
                                <p className="text-slate-600 leading-relaxed">
                                  本机构依据《GB/T 38659-2020 工业视觉检验设备通用规范》及半导体先进制程量测评定准则，对该仪器进行了连续120小时高低温温湿度恶劣环境动态测试与2000片标准刻蚀硅片实测。各项指标完全符合设计要求，检出率达到国标A级。
                                </p>
                              </div>

                              <div className="border border-slate-200 rounded-lg overflow-hidden">
                                <table className="w-full text-left border-collapse">
                                  <thead className="bg-slate-100 text-slate-700 font-semibold">
                                    <tr>
                                      <th className="p-2.5 border-b border-slate-200">检验测试项目</th>
                                      <th className="p-2.5 border-b border-slate-200">国家/行业标准要求</th>
                                      <th className="p-2.5 border-b border-slate-200">实测指标</th>
                                      <th className="p-2.5 border-b border-slate-200 text-center">结论判定</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100 text-slate-600">
                                    <tr>
                                      <td className="p-2.5 font-medium text-slate-800">单片晶圆全检节拍</td>
                                      <td className="p-2.5">≤ 1.0 秒</td>
                                      <td className="p-2.5 font-semibold text-emerald-600">0.18 ~ 0.20 秒</td>
                                      <td className="p-2.5 text-center text-emerald-600 font-bold">优级通过</td>
                                    </tr>
                                    <tr>
                                      <td className="p-2.5 font-medium text-slate-800">微米级微裂纹检出率</td>
                                      <td className="p-2.5">≥ 95.0%</td>
                                      <td className="p-2.5 font-semibold text-emerald-600">99.6%</td>
                                      <td className="p-2.5 text-center text-emerald-600 font-bold">优级通过</td>
                                    </tr>
                                    <tr>
                                      <td className="p-2.5 font-medium text-slate-800">产线虚警过杀率</td>
                                      <td className="p-2.5">≤ 1.0%</td>
                                      <td className="p-2.5 font-semibold text-emerald-600">0.08%</td>
                                      <td className="p-2.5 text-center text-emerald-600 font-bold">优级通过</td>
                                    </tr>
                                    <tr>
                                      <td className="p-2.5 font-medium text-slate-800">连续无故障运行 (MTBF)</td>
                                      <td className="p-2.5">≥ 2000 小时</td>
                                      <td className="p-2.5 font-semibold text-emerald-600">&gt; 5000 小时</td>
                                      <td className="p-2.5 text-center text-emerald-600 font-bold">优级通过</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>

                              <div className="flex items-center justify-between pt-6 text-xs text-slate-500">
                                <div>
                                  <span>主检工程师：</span>
                                  <span className="font-semibold text-slate-700">陈建华（国家注册质检师）</span>
                                </div>
                                <div>
                                  <span>审核发证日期：</span>
                                  <span className="font-mono text-slate-700">2026年08月28日</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 4. XLSX 财务三张表与单机BOM模型形态 */}
                      {(activeFile.type === 'excel' || activeFile.ext === 'xlsx' || activeFile.name.endsWith('.xlsx')) && (
                        <div className="max-w-4xl mx-auto space-y-6">
                          <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
                            {/* Sheet tabs bar */}
                            <div className="flex items-center bg-slate-100 border-b border-slate-200 px-4 pt-2 gap-1 overflow-x-auto">
                              <button
                                onClick={() => setActiveSheetTab('unit')}
                                className={`px-3 py-1.5 text-xs font-semibold rounded-t-lg transition-colors whitespace-nowrap ${
                                  activeSheetTab === 'unit'
                                    ? 'bg-white text-indigo-700 border-t-2 border-indigo-600 shadow-xs'
                                    : 'text-slate-600 hover:bg-slate-200'
                                }`}
                              >
                                单客户经济模型 (Unit Economics)
                              </button>
                              <button
                                onClick={() => setActiveSheetTab('pnl')}
                                className={`px-3 py-1.5 text-xs font-semibold rounded-t-lg transition-colors whitespace-nowrap ${
                                  activeSheetTab === 'pnl'
                                    ? 'bg-white text-indigo-700 border-t-2 border-indigo-600 shadow-xs'
                                    : 'text-slate-600 hover:bg-slate-200'
                                }`}
                              >
                                未来三年利润表测算 (2026-2028)
                              </button>
                              <button
                                onClick={() => setActiveSheetTab('cash')}
                                className={`px-3 py-1.5 text-xs font-semibold rounded-t-lg transition-colors whitespace-nowrap ${
                                  activeSheetTab === 'cash'
                                    ? 'bg-white text-indigo-700 border-t-2 border-indigo-600 shadow-xs'
                                    : 'text-slate-600 hover:bg-slate-200'
                                }`}
                              >
                                现金流与账期压力测试
                              </button>
                              <button
                                onClick={() => setActiveSheetTab('bom')}
                                className={`px-3 py-1.5 text-xs font-semibold rounded-t-lg transition-colors whitespace-nowrap ${
                                  activeSheetTab === 'bom'
                                    ? 'bg-white text-indigo-700 border-t-2 border-indigo-600 shadow-xs'
                                    : 'text-slate-600 hover:bg-slate-200'
                                }`}
                              >
                                标机硬件BOM拆解与采购明细
                              </button>
                            </div>

                            {/* Sheet Tab 1: Unit Economics */}
                            {activeSheetTab === 'unit' && (
                              <div className="p-6 space-y-6">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                  <div className="p-4 bg-indigo-50/60 rounded-xl border border-indigo-100">
                                    <div className="text-xs text-indigo-600 font-medium">客单价 (ASP)</div>
                                    <div className="text-xl font-extrabold text-indigo-900 mt-1">¥ 180 万元</div>
                                    <div className="text-[10px] text-slate-500 mt-0.5">进口同级设备的 40%</div>
                                  </div>
                                  <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-100">
                                    <div className="text-xs text-emerald-600 font-medium">硬件BOM成本</div>
                                    <div className="text-xl font-extrabold text-emerald-900 mt-1">¥ 75 万元</div>
                                    <div className="text-[10px] text-slate-500 mt-0.5">自研光机电自主可控</div>
                                  </div>
                                  <div className="p-4 bg-sky-50/60 rounded-xl border border-sky-100">
                                    <div className="text-xs text-sky-600 font-medium">综合毛利率</div>
                                    <div className="text-xl font-extrabold text-sky-900 mt-1">58.3%</div>
                                    <div className="text-[10px] text-slate-500 mt-0.5">随量产可逼近 63%</div>
                                  </div>
                                  <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-100">
                                    <div className="text-xs text-amber-600 font-medium">获客回本周期 (CAC Payback)</div>
                                    <div className="text-xl font-extrabold text-amber-900 mt-1">1.5 个月</div>
                                    <div className="text-[10px] text-slate-500 mt-0.5">LTV / CAC 高达 19.1x</div>
                                  </div>
                                </div>

                                <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
                                  <table className="w-full text-left">
                                    <thead className="bg-slate-50 font-semibold text-slate-700">
                                      <tr>
                                        <th className="p-3 border-b">客户类型</th>
                                        <th className="p-3 border-b">标机采购台数</th>
                                        <th className="p-3 border-b">单价 (万元)</th>
                                        <th className="p-3 border-b">硬件BOM (万元)</th>
                                        <th className="p-3 border-b">SaaS年费 (万元)</th>
                                        <th className="p-3 border-b">单客户首年贡献</th>
                                        <th className="p-3 border-b text-center">回本周期</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-slate-600">
                                      <tr>
                                        <td className="p-3 font-medium text-slate-900">标杆灯塔晶圆厂</td>
                                        <td className="p-3">2 台</td>
                                        <td className="p-3">180</td>
                                        <td className="p-3">75</td>
                                        <td className="p-3">25</td>
                                        <td className="p-3 font-semibold text-indigo-700">¥ 385 万元</td>
                                        <td className="p-3 text-center text-emerald-600 font-semibold">1.2 个月</td>
                                      </tr>
                                      <tr>
                                        <td className="p-3 font-medium text-slate-900">区域骨干封测厂</td>
                                        <td className="p-3">1 台</td>
                                        <td className="p-3">180</td>
                                        <td className="p-3">75</td>
                                        <td className="p-3">18</td>
                                        <td className="p-3 font-semibold text-indigo-700">¥ 198 万元</td>
                                        <td className="p-3 text-center text-emerald-600 font-semibold">1.5 个月</td>
                                      </tr>
                                      <tr>
                                        <td className="p-3 font-medium text-slate-900">先进封装中小厂</td>
                                        <td className="p-3">1 台</td>
                                        <td className="p-3">165</td>
                                        <td className="p-3">72</td>
                                        <td className="p-3">12</td>
                                        <td className="p-3 font-semibold text-indigo-700">¥ 177 万元</td>
                                        <td className="p-3 text-center text-emerald-600 font-semibold">1.8 个月</td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}

                            {/* Sheet Tab 2: P&L */}
                            {activeSheetTab === 'pnl' && (
                              <div className="p-6">
                                <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
                                  <table className="w-full text-left">
                                    <thead className="bg-slate-50 font-semibold text-slate-700">
                                      <tr>
                                        <th className="p-3 border-b">科目名称 (万元)</th>
                                        <th className="p-3 border-b">2026年 (落地量产年)</th>
                                        <th className="p-3 border-b">2027年 (规模放量年)</th>
                                        <th className="p-3 border-b">2028年 (行业爆发年)</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-slate-600">
                                      <tr className="bg-indigo-50/30 font-semibold text-slate-900">
                                        <td className="p-3">营业收入总额</td>
                                        <td className="p-3">1,250.0</td>
                                        <td className="p-3">2,850.0</td>
                                        <td className="p-3">6,200.0</td>
                                      </tr>
                                      <tr>
                                        <td className="p-3 pl-6">其中：硬件整机销售</td>
                                        <td className="p-3">1,080.0 (6台)</td>
                                        <td className="p-3">2,340.0 (13台)</td>
                                        <td className="p-3">4,860.0 (27台)</td>
                                      </tr>
                                      <tr>
                                        <td className="p-3 pl-6">其中：SaaS缺陷算法年费</td>
                                        <td className="p-3">170.0</td>
                                        <td className="p-3">510.0</td>
                                        <td className="p-3">1,340.0</td>
                                      </tr>
                                      <tr className="text-rose-600">
                                        <td className="p-3">主营业务成本 (BOM+装调)</td>
                                        <td className="p-3">520.0</td>
                                        <td className="p-3">1,120.0</td>
                                        <td className="p-3">2,280.0</td>
                                      </tr>
                                      <tr className="font-semibold text-emerald-700">
                                        <td className="p-3">毛利额 (毛利率)</td>
                                        <td className="p-3">730.0 (58.4%)</td>
                                        <td className="p-3">1,730.0 (60.7%)</td>
                                        <td className="p-3">3,920.0 (63.2%)</td>
                                      </tr>
                                      <tr>
                                        <td className="p-3">研发与算法迭代费用 (25%)</td>
                                        <td className="p-3">312.5</td>
                                        <td className="p-3">570.0</td>
                                        <td className="p-3">1,116.0</td>
                                      </tr>
                                      <tr className="bg-emerald-50/50 font-bold text-emerald-800">
                                        <td className="p-3">净利润 (净利率)</td>
                                        <td className="p-3">185.0 (14.8%)</td>
                                        <td className="p-3">620.0 (21.8%)</td>
                                        <td className="p-3">1,680.0 (27.1%)</td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}

                            {/* Sheet Tab 3: Cash Flow Stress Test */}
                            {activeSheetTab === 'cash' && (
                              <div className="p-6 space-y-4 text-xs">
                                <div className="p-4 bg-amber-50/60 rounded-lg border border-amber-200 text-amber-900">
                                  <div className="font-bold mb-1">行业回款账期与极端情景压力测试机制：</div>
                                  <p className="leading-relaxed text-amber-800">
                                    半导体装备行业回款账期普遍在 6~9 个月之间。本模型已按最恶劣情况进行沙盘推演：
                                    按“3:3:3:1”分期（预付30%、到货30%、初验30%、终验质保10%），融资所得 1,500 万元完全不考虑新回款的情景下，
                                    可支撑实验室与中试车间不间断运营 <strong>26 个月</strong>，安全冗余充足。
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* Sheet Tab 4: BOM Breakdown */}
                            {activeSheetTab === 'bom' && (
                              <div className="p-6">
                                <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
                                  <table className="w-full text-left">
                                    <thead className="bg-slate-50 font-semibold text-slate-700">
                                      <tr>
                                        <th className="p-3 border-b">BOM元器件名称</th>
                                        <th className="p-3 border-b">规格型号</th>
                                        <th className="p-3 border-b">自研/国产化状态</th>
                                        <th className="p-3 border-b text-right">单机采购成本 (元)</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-slate-600">
                                      <tr>
                                        <td className="p-3 font-medium text-slate-800">大视场纳秒脉冲干涉激光器</td>
                                        <td className="p-3">自研非对称相干光纤模组</td>
                                        <td className="p-3 text-emerald-600 font-semibold">完全自研独占专利</td>
                                        <td className="p-3 text-right font-mono">¥ 220,000</td>
                                      </tr>
                                      <tr>
                                        <td className="p-3 font-medium text-slate-800">超高数值孔径显微物镜组</td>
                                        <td className="p-3">NA=0.85 无畸变远心镜头</td>
                                        <td className="p-3 text-emerald-600 font-semibold">长三角联合试制</td>
                                        <td className="p-3 text-right font-mono">¥ 140,000</td>
                                      </tr>
                                      <tr>
                                        <td className="p-3 font-medium text-slate-800">高速TDI线阵CMOS相机</td>
                                        <td className="p-3">16K 像素 200kHz 采样</td>
                                        <td className="p-3">国产一线替代供应商</td>
                                        <td className="p-3 text-right font-mono">¥ 115,000</td>
                                      </tr>
                                      <tr>
                                        <td className="p-3 font-medium text-slate-800">边缘FPGA多张量推理板卡</td>
                                        <td className="p-3">Zynq UltraScale+ 异构板卡</td>
                                        <td className="p-3 text-emerald-600 font-semibold">自研算法烧录加密</td>
                                        <td className="p-3 text-right font-mono">¥ 95,000</td>
                                      </tr>
                                      <tr>
                                        <td className="p-3 font-medium text-slate-800">精密天然大理石气浮隔振台</td>
                                        <td className="p-3">00级天然花岗岩气浮模组</td>
                                        <td className="p-3">山东成熟供应链</td>
                                        <td className="p-3 text-right font-mono">¥ 80,000</td>
                                      </tr>
                                      <tr>
                                        <td className="p-3 font-medium text-slate-800">整机精密装调与干涉标定辅料</td>
                                        <td className="p-3">千级洁净车间校准工装</td>
                                        <td className="p-3">产学研中试基地自产</td>
                                        <td className="p-3 text-right font-mono">¥ 100,000</td>
                                      </tr>
                                      <tr className="bg-slate-50 font-bold text-slate-900">
                                        <td className="p-3" colSpan={3}>工业级标机硬件BOM合计</td>
                                        <td className="p-3 text-right text-indigo-700 font-mono text-sm">¥ 750,000</td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* 5. MD / 文档形态 (商业计划书正本、访谈纪要、答辩锦囊等) */}
                      {(activeFile.type === 'doc' || activeFile.type === 'bp' || activeFile.ext === 'md' || activeFile.name.endsWith('.md')) && (
                        <div className="max-w-3xl mx-auto space-y-5">
                          <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 md:p-8 space-y-6">
                            {/* Document Header Badge Bar */}
                            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                              <div className="flex items-center space-x-2">
                                <FileText className="h-4 w-4 text-sky-600" />
                                <span className="font-bold text-slate-800 text-sm">{activeFile.name}</span>
                              </div>
                              <div className="flex items-center space-x-2 text-xs text-slate-400">
                                <span className="font-mono">{activeFile.size}</span>
                                <span>·</span>
                                <span>{activeFile.lastCommitAuthor}</span>
                              </div>
                            </div>

                            {/* Markdown Rendered Content */}
                            <div className="prose prose-sm max-w-none text-slate-700 space-y-4 leading-relaxed font-sans">
                              {(activeFile.contentPreview || (activeFile.contentLines ? activeFile.contentLines.join('\n') : '')).split('\n\n').map((paragraph, pIdx) => {
                                const trimmed = paragraph.trim();
                                if (!trimmed) return null;

                                // Heading 1
                                if (trimmed.startsWith('# ')) {
                                  return (
                                    <h1 key={pIdx} className="text-xl font-bold text-slate-900 border-b border-slate-200 pb-2 pt-2">
                                      {trimmed.replace('# ', '')}
                                    </h1>
                                  );
                                }
                                // Heading 2
                                if (trimmed.startsWith('## ')) {
                                  return (
                                    <h2 key={pIdx} className="text-base font-bold text-slate-900 border-l-4 border-indigo-600 pl-3 py-0.5 mt-5">
                                      {trimmed.replace('## ', '')}
                                    </h2>
                                  );
                                }
                                // Heading 3
                                if (trimmed.startsWith('### ')) {
                                  return (
                                    <h3 key={pIdx} className="text-sm font-semibold text-slate-800 mt-3">
                                      {trimmed.replace('### ', '')}
                                    </h3>
                                  );
                                }
                                // Callout / Quote
                                if (trimmed.startsWith('> ')) {
                                  return (
                                    <blockquote key={pIdx} className="bg-slate-50 border-l-4 border-slate-300 p-3 rounded-r-lg text-xs text-slate-600 italic">
                                      {trimmed.replace(/> /g, '')}
                                    </blockquote>
                                  );
                                }
                                // Standard paragraph
                                return (
                                  <p key={pIdx} className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                                    {trimmed}
                                  </p>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 6. Code / JSON 形态 */}
                      {(activeFile.type === 'code' || activeFile.type === 'json' || activeFile.name.endsWith('.json') || activeFile.name.endsWith('.py')) && (
                        <div className="max-w-4xl mx-auto space-y-4">
                          <div className="bg-slate-900 rounded-xl p-5 shadow-lg border border-slate-800 text-slate-200 font-mono text-xs overflow-x-auto leading-relaxed">
                            <pre className="whitespace-pre">
                              {activeFile.contentPreview || activeFile.contentLines?.join('\n') || JSON.stringify(activeFile, null, 2)}
                            </pre>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* File Metadata Footer */}
                {activeFile.metaInfo && (
                  <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center space-x-2">
                    <Info className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>说明: {activeFile.metaInfo}</span>
                  </div>
                )}
              </div>
            )}

            {/* Readme Preview if in root and no file open */}
            {!activeFile && currentFolder === '' && (
              <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3 shadow-xs">
                <div className="flex items-center space-x-2 text-slate-800 font-semibold text-xs border-b border-slate-100 pb-2.5">
                  <FileText className="h-4 w-4 text-sky-600" />
                  <span>README.md</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-500 font-mono">资产底座总纲</span>
                </div>
                <div className="prose prose-xs text-slate-600 space-y-2.5 leading-relaxed font-sans">
                  <h3 className="text-sm font-bold text-slate-900">
                    面向晶圆级高精度光学缺陷检测系统 · 2026国赛金奖对标资产管理体系
                  </h3>
                  <p className="text-slate-600 text-xs">
                    本系统遵循Git无分支版本演进设计模式，整合归档了面向2026中国国际大学生创新大赛的7大核心合规材料及扩展证据链：
                    涵盖标准12章商业计划书正本、华东6家封测厂18位专家深度访谈纪要、15页全国总决赛答辩幻灯片、1200小时工业级洁净车间无故障实跑4K录像、国家第三方CNAS全项权威检验公章报告、未来三年财务三张表联动及自研标机BOM采购清单。
                  </p>
                  <p className="text-slate-500 text-xs">
                    💡 <strong>版本回溯与比对</strong>：点击右侧【版本时间线】中的 <strong>“进入该版本”</strong> 按钮，即可瞬间回溯至省赛、中试、冲刺等各历史节点的完整资产快照；点击 <strong>“Diff 历史”</strong> 按钮可审查版本之间的具体增删变动。
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ======================= COLUMN 3 (RIGHT): VERSION COMMITS TIMELINE ======================= */}
        <div className="w-80 xl:w-96 flex flex-col shrink-0 bg-white overflow-hidden">
          
          {/* Timeline Header with Version Status Indicator and Submit Button */}
          <div className="p-3 border-b border-slate-200 bg-white space-y-2">
            <div className="flex items-center justify-between gap-1.5">
              {/* Left: GitCommit icon + "版本时间线" + Small inline status indicator */}
              <div className="flex items-center space-x-1.5 min-w-0">
                <GitCommit className="h-4 w-4 text-purple-600 shrink-0" />
                <h2 className="font-bold text-xs text-slate-900 tracking-tight shrink-0">版本时间线</h2>

                {/* 是否是最新版本的标志 - 同行且小尺寸 */}
                {isHeadVersion ? (
                  <span
                    id="version-status-indicator"
                    className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0"
                    title="当前展示的是最新主版本资产 (HEAD)"
                  >
                    <CheckCircle2 className="h-2.5 w-2.5 text-emerald-600 shrink-0" />
                    <span>最新</span>
                  </span>
                ) : (
                  <span
                    id="version-status-indicator"
                    className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-300 shrink-0"
                    title={`当前为历史快照 (${activeCommit.shortHash})`}
                  >
                    <AlertCircle className="h-2.5 w-2.5 text-amber-600 shrink-0" />
                    <span className="truncate max-w-[70px]">快照</span>
                  </span>
                )}
              </div>

              {/* Right: Return to HEAD (if snapshot) + 提交 Button + Count badge */}
              <div className="flex items-center space-x-1.5 shrink-0">
                {!isHeadVersion && (
                  <button
                    onClick={() => setSelectedCommitId(versionCommits[0].id)}
                    className="text-[10px] text-sky-600 hover:text-sky-700 font-medium hover:underline px-1 transition-colors"
                    title="点击返回最新版本 (HEAD)"
                  >
                    回最新
                  </button>
                )}
                
                {/* 提交按钮：点击增加一条假数据，并在右侧栏增加一条提交记录 */}
                <button
                  id="btn-asset-commit"
                  onClick={handleCreateMockCommit}
                  className="px-2 py-0.5 text-xs font-semibold rounded bg-sky-600 hover:bg-sky-500 text-white transition-all flex items-center space-x-1 shadow-2xs cursor-pointer active:scale-95"
                  title="点击提交一条新的版本记录（模拟资产增量提交）"
                >
                  <Plus className="h-3 w-3" />
                  <span>提交</span>
                </button>

                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200" title={`共计 ${versionCommits.length} 次提交`}>
                  {versionCommits.length}
                </span>
              </div>
            </div>

            {/* Author filter */}
            <div className="pt-0.5">
              <select
                value={authorFilter}
                onChange={(e) => setAuthorFilter(e.target.value)}
                className="w-full text-xs py-1 px-2 rounded bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:border-sky-500 transition-colors"
              >
                <option value="all">全部作者 ({versionCommits.length})</option>
                <option value="林子越">林子越 (项目负责人)</option>
                <option value="张教授">张教授 (导师评委)</option>
              </select>
            </div>
          </div>

          {/* Chronological Version Commits Stream */}
          <div className="flex-1 overflow-y-auto p-3 space-y-4 text-xs bg-slate-50/30">
            {Object.entries(groupedCommits).map(([dateHeader, commitsOnDate]) => (
              <div key={dateHeader} className="space-y-2.5">
                {/* Date Header */}
                <div className="flex items-center space-x-2 text-[11px] font-semibold text-slate-500 pt-1">
                  <div className="h-2.5 w-2.5 rounded-full border border-slate-400 bg-white flex items-center justify-center shrink-0">
                    <div className="h-1 w-1 rounded-full bg-slate-500" />
                  </div>
                  <span>{dateHeader}</span>
                </div>

                {/* Commit Cards on this date */}
                <div className="space-y-2.5 pl-4 border-l-2 border-slate-200 ml-1">
                  {(commitsOnDate as VersionCommit[]).map((commit) => {
                    const isCurrentActiveSnapshot = selectedCommitId === commit.id;

                    return (
                      <div
                        key={commit.id}
                        className={`rounded-lg border p-3 transition-all relative group ${
                          isCurrentActiveSnapshot
                            ? 'bg-sky-50/70 border-sky-300 ring-1 ring-sky-300 shadow-xs'
                            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 shadow-2xs'
                        }`}
                      >
                        {/* Current Active Indicator Dot on Timeline */}
                        {isCurrentActiveSnapshot && (
                          <div className="absolute -left-[21px] top-3.5 h-3 w-3 rounded-full bg-sky-500 border-2 border-white ring-2 ring-sky-300" />
                        )}

                        {/* Card Header: Title & Stage */}
                        <div className="space-y-1.5">
                          <div className="flex items-start justify-between gap-1.5">
                            <div className="font-semibold text-slate-900 text-xs leading-snug group-hover:text-sky-700 transition-colors">
                              {commit.title}
                            </div>
                            <span className="text-[10px] px-1.5 py-0.2 rounded font-medium shrink-0 bg-slate-100 text-slate-700 border border-slate-200">
                              {commit.stageBadge}
                            </span>
                          </div>

                          {/* Commit Description */}
                          <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">
                            {commit.description}
                          </p>

                          {/* Author & Time */}
                          <div className="flex items-center space-x-2 text-[10px] text-slate-400 pt-0.5">
                            <img
                              src={commit.author.avatar}
                              alt={commit.author.name}
                              className="h-4 w-4 rounded-full border border-slate-200 object-cover shrink-0"
                            />
                            <span className="text-slate-700 font-medium">{commit.author.name}</span>
                            <span>committed {commit.timeAgo}</span>
                          </div>
                        </div>

                        {/* Card Footer: Buttons requested in prompt */}
                        <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-slate-100">
                          {/* Commit Short Hash & Copy */}
                          <div className="flex items-center space-x-1 font-mono text-[10px] text-slate-500">
                            <span>{commit.shortHash}</span>
                            <button
                              onClick={() => handleCopy(commit.hash, commit.id)}
                              className="p-0.5 text-slate-400 hover:text-slate-600"
                              title="复制SHA"
                            >
                              {copiedText === commit.id ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                            </button>
                          </div>

                          {/* TWO ACTION BUTTONS */}
                          <div className="flex items-center space-x-1.5">
                            {/* BUTTON 1: 进入该版本的“资产” */}
                            <button
                              onClick={() => handleEnterVersionSnapshot(commit.id)}
                              className={`px-2 py-1 rounded text-[11px] font-semibold transition-all flex items-center space-x-1 ${
                                isCurrentActiveSnapshot
                                  ? 'bg-sky-600 text-white shadow-xs'
                                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 hover:text-sky-700'
                              }`}
                              title="点击进入该版本的“资产”，使左侧栏与中间栏变化为该版本状态"
                            >
                              <Code className="h-3 w-3" />
                              <span>{isCurrentActiveSnapshot ? '当前版本' : '进入该版本'}</span>
                            </button>

                            {/* BUTTON 2: 查看 diff */}
                            <button
                              onClick={() => {
                                setActiveDiffCommit(commit);
                                setSelectedDiffFileIndex(0);
                              }}
                              className="px-2 py-1 rounded text-[11px] font-semibold bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 transition-colors flex items-center space-x-1"
                              title="查看此版本的代码与文档变更 Diff"
                            >
                              <GitCompare className="h-3 w-3" />
                              <span>查看 diff</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Right Footer: Total Commits Info */}
          <div className="p-2.5 border-t border-slate-200 bg-slate-50 text-[11px] text-slate-500 flex items-center justify-between">
            <span>已归档 <strong>{versionCommits.length}</strong> 个评审里程碑</span>
            <span className="text-emerald-600 font-mono text-[10px]">100% 审计追溯</span>
          </div>
        </div>

      </div>

      {/* ======================= DIFF MODAL (查看 diff 交互) ======================= */}
      {activeDiffCommit && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-4xl max-h-[85vh] rounded-xl border border-slate-200 bg-white flex flex-col shadow-2xl overflow-hidden">
            
            {/* Diff Header */}
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center space-x-3 min-w-0">
                <div className="h-8 w-8 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700">
                  <GitCompare className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-sm text-slate-900 truncate">
                      Commit Diff 变更差异对比
                    </h3>
                    <span className="font-mono text-xs text-purple-700 bg-purple-100 border border-purple-200 px-1.5 py-0.2 rounded">
                      {activeDiffCommit.shortHash}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 truncate mt-0.5">
                    {activeDiffCommit.title}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    handleEnterVersionSnapshot(activeDiffCommit.id);
                    setActiveDiffCommit(null);
                  }}
                  className="px-3 py-1.5 rounded-md text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white transition-colors flex items-center space-x-1.5 shadow-xs"
                >
                  <Code className="h-3.5 w-3.5" />
                  <span>切换至该版本资产快照</span>
                </button>
                <button
                  onClick={() => setActiveDiffCommit(null)}
                  className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Changed Files Tabs */}
            <div className="px-4 py-2 border-b border-slate-200 bg-slate-50 flex items-center space-x-2 overflow-x-auto text-xs">
              <span className="text-slate-500 text-[11px] shrink-0 font-medium mr-2">
                变更文件 ({activeDiffCommit.changes.length}):
              </span>
              {activeDiffCommit.changes.map((change, idx) => (
                <button
                  key={change.fileId}
                  onClick={() => setSelectedDiffFileIndex(idx)}
                  className={`px-2.5 py-1 rounded-md text-xs font-mono transition-colors flex items-center space-x-1.5 shrink-0 ${
                    selectedDiffFileIndex === idx
                      ? 'bg-purple-100 text-purple-800 border border-purple-300 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  <span className={`text-[10px] font-bold ${
                    change.changeType === 'added' ? 'text-emerald-600' :
                    change.changeType === 'deleted' ? 'text-rose-600' : 'text-amber-600'
                  }`}>
                    {change.changeType === 'added' ? '+A' : change.changeType === 'deleted' ? '-D' : '~M'}
                  </span>
                  <span className="truncate max-w-[180px]">{change.fileName}</span>
                  <span className="text-[10px] text-emerald-600">+{change.additions}</span>
                  {change.deletions > 0 && <span className="text-[10px] text-rose-600">-{change.deletions}</span>}
                </button>
              ))}
            </div>

            {/* Active Diff File Viewer */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-xs bg-slate-50/50">
              {activeDiffCommit.changes[selectedDiffFileIndex] && (
                <div className="space-y-3">
                  {/* File change summary */}
                  <div className="p-3 bg-white border border-slate-200 rounded-lg flex items-center justify-between text-xs font-sans shadow-2xs">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-800">
                        {activeDiffCommit.changes[selectedDiffFileIndex].path}
                      </span>
                      <span className="text-slate-400">·</span>
                      <span className="text-slate-500">
                        {activeDiffCommit.changes[selectedDiffFileIndex].description}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 font-mono">
                      <span className="text-emerald-600 font-bold">
                        +{activeDiffCommit.changes[selectedDiffFileIndex].additions} additions
                      </span>
                      <span className="text-rose-600 font-bold">
                        -{activeDiffCommit.changes[selectedDiffFileIndex].deletions} deletions
                      </span>
                    </div>
                  </div>

                  {/* Unified Diff Box with Line Colors */}
                  <div className="rounded-lg border border-slate-200 bg-white overflow-hidden shadow-xs">
                    <div className="divide-y divide-slate-100">
                      {activeDiffCommit.changes[selectedDiffFileIndex].diffLines.map((line, lIdx) => {
                        const isAdd = line.type === 'add';
                        const isDel = line.type === 'del';

                        return (
                          <div
                            key={lIdx}
                            className={`flex py-0.5 px-3 font-mono text-xs ${
                              isAdd ? 'bg-emerald-50 text-emerald-900' :
                              isDel ? 'bg-rose-50 text-rose-900 line-through opacity-80' :
                              'text-slate-700'
                            }`}
                          >
                            <span className="w-8 text-right pr-3 select-none text-slate-400 shrink-0 bg-slate-50/60">
                              {line.oldLine || ''}
                            </span>
                            <span className="w-8 text-right pr-3 select-none text-slate-400 shrink-0 bg-slate-50/60">
                              {line.newLine || ''}
                            </span>
                            <span className="w-4 text-center select-none font-bold shrink-0">
                              {isAdd ? '+' : isDel ? '-' : ' '}
                            </span>
                            <span className="flex-1 whitespace-pre-wrap break-all">
                              {line.text.replace(/^[+-]\s?/, '')}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Diff Modal Footer */}
            <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
              <span className="text-slate-500">
                按国赛答辩演进线对比 · 可在版本之间无损无缝穿梭
              </span>
              <button
                onClick={() => setActiveDiffCommit(null)}
                className="px-3 py-1 rounded bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-medium transition-colors"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================= ADD FILE MODAL (Add file 交互) ======================= */}
      {isAddFileModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm">
                <Plus className="h-4 w-4 text-sky-600" />
                <span>新增资产文件 / 产物归档</span>
              </div>
              <button
                onClick={() => setIsAddFileModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">文件名称 (含后缀)</label>
                <input
                  type="text"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  placeholder="例如: 2026国赛路演全景答辩文稿.pptx"
                  className="w-full px-3 py-2 rounded-md bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">存放目标目录</label>
                  <select
                    value={newFileFolder}
                    onChange={(e) => setNewFileFolder(e.target.value)}
                    className="w-full px-3 py-2 rounded-md bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-sky-500"
                  >
                    <option value="deliverables">deliverables (交付产物)</option>
                    <option value="docs">docs (商业计划书/白皮书)</option>
                    <option value="evidence">evidence (权威佐证材料)</option>
                    <option value="src">src (核心算法代码与数据)</option>
                    <option value="">/ (根目录)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">资产类型</label>
                  <select
                    value={newFileType}
                    onChange={(e) => setNewFileType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-md bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-sky-500"
                  >
                    <option value="doc">Word / 文本说明</option>
                    <option value="ppt">PPT / 路演幻灯片</option>
                    <option value="excel">Excel / 财务甘特</option>
                    <option value="pdf">PDF / 权威报告</option>
                    <option value="code">Code / 核心源码</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">资产说明 / 提交描述</label>
                <textarea
                  value={newFileMeta}
                  onChange={(e) => setNewFileMeta(e.target.value)}
                  placeholder="补充关于该文件的2026大赛评审对标用途或技术亮点..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-md bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setIsAddFileModalOpen(false)}
                className="px-3 py-1.5 rounded-md text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              >
                取消
              </button>
              <button
                onClick={handleCreateMockFile}
                disabled={!newFileName.trim()}
                className="px-3 py-1.5 rounded-md text-xs font-semibold bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white transition-colors"
              >
                确认创建并归档
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
