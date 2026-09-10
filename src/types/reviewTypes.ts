export type ReviewChangeType = 'create' | 'modify';
export type ReviewDecision = 'pending' | 'approved' | 'rejected' | 'improved';

export interface FileAnnotation {
  id: string;
  fileId: string;
  selectedText: string;
  comment: string;
  timestamp: string;
  author: string;
  side?: 'old' | 'new' | 'single';
}

export interface ReviewChangePoint {
  id?: string;
  location: string; // 修改位置
  description: string; // 修改内容与说明
}

export interface ReviewFileItem {
  id: string;
  name: string;
  changeType: ReviewChangeType; // 'create' (新增) | 'modify' (修改)
  status: ReviewDecision;
  fileType: 'doc' | 'ppt' | 'excel' | 'bp';
  typeLabel: string;
  summary: string;
  updateTime: string;
  size: string;
  // For 'modify': originalContent is before, modifiedContent is after
  // For 'create': modifiedContent is the content of the new file
  originalContent?: string[];
  modifiedContent: string[];
  annotations: FileAnnotation[];
  changePoints?: ReviewChangePoint[]; // 一个点一个点的写位置与修改内容
  changeLocation?: string; // 兼容旧字段
  changeDescription?: string[]; // 兼容旧字段
  decisionComment?: string;
  decisionTime?: string;
}

export const INITIAL_REVIEW_FILES: ReviewFileItem[] = [
  {
    id: 'rev-file-1',
    name: '智耘农业_商业计划书_第4章商业模式与财务测算.docx',
    changeType: 'modify',
    status: 'pending',
    fileType: 'doc',
    typeLabel: '商业计划书核心章节',
    summary: '重构商业闭环为 B2B2G 模式，强化万亩茶园服务协议与ARR财务造血测算',
    updateTime: '刚刚',
    size: '42.8 KB',
    changeLocation: '第4章商业模式与财务测算（4.1、4.2、4.3小节）',
    changePoints: [
      {
        id: 'cp-1-1',
        location: '4.1 商业模式与痛点分析小节',
        description: '摒弃个体农户散售单一硬件模式，升级为“智能多光谱巡航SaaS订阅 + 龙头茶企品质增收分成 + 涉农险企防灾减损数据分成”三大造血支柱，构建 B2B2G 闭环体系。'
      },
      {
        id: 'cp-1-2',
        location: '4.2 定价机制与渠道壁垒小节',
        description: '与建瓯、吉安等核心茶产区12家万亩示范茶园建立战略合作，采用“每亩45元/年+15%挽损分成”复合计费模式，并补充附带行业公章的正式服务协议排他佐证。'
      },
      {
        id: 'cp-1-3',
        location: '4.3 财务盈利预测与测算小节',
        description: '权威重构财务模型，2026年预计覆盖8.6万亩，年经常性收入（ARR）达580万元，毛利率稳定在68.5%，算力成本占比18%，现金流自我造血能力充分对标国赛金奖。'
      }
    ],
    changeDescription: [
      '商业模式升级：摒弃个体农户散售单一硬件，升级为“B2B2G 闭环 + 智能巡航SaaS订阅 + 险企防灾减损分成”',
      '渠道壁垒突破：与建瓯、吉安等12家万亩示范茶园建立战略合作，补充公章服务协议排他佐证',
      '权威财务造血：重构财务模型，2026年预计覆盖8.6万亩，ARR达580万元，毛利率提升至68.5%'
    ],
    originalContent: [
      '【4.1 传统商业痛点与模式初探】',
      '团队最初构想通过向各产茶地散户销售手持多光谱巡检仪获利。硬件单价初定 1.2 万元/台，包含 1 年免费固件维护。',
      '经多轮走访发现，个体农户购买力有限，硬件一次性回款周期过长，且存在极高的售后培训与技术支持负担。',
      '【4.2 定价机制与渠道构想】',
      '由于早期未能深入打通涉农政策性农业保险与龙头茶企供应链，缺乏长效服务订阅机制，导致淡季营收波动剧烈。',
      '【4.3 财务盈利预测】',
      '预计第一年销售设备 30 台，营业额约 36 万元，净利润率约 12%，现金流较为脆弱，抗行业竞争风险能力不足。'
    ],
    modifiedContent: [
      '【4.1 升级商业模式：B2B2G 闭环与多元造血体系】',
      '彻底摒弃单一低频硬件销售模式，重构为“智能多光谱巡航SaaS年费订阅 + 龙头茶企品质增收分成 + 涉农险企防灾减损数据分成”三大稳健现金流支柱。通过政企联合示范基地切入，实现零散农户组织化赋能。',
      '【4.2 定价机制与渠道壁垒突破】',
      '与建瓯、吉安等核心茶产区 12 家万亩示范茶园建立战略合作，采用“基础巡航按亩计费（每亩45元/年）+ 精准防灾挽损分成（挽损额的15%）”复合计费模式。已签署具备行业公章的正式服务协议，形成坚实排他壁垒。',
      '【4.3 权威测算与财务造血指标】',
      '2026 年预计覆盖标杆示范茶园 8.6 万亩，年经常性收入（ARR）达 580 万元，毛利率稳定在 68.5%，研发及模型迭代算力成本占 18%。现金流自我造血能力充分对标国赛金奖标杆企业。'
    ],
    annotations: [
      {
        id: 'ann-init-1',
        fileId: 'rev-file-1',
        selectedText: '已签署具备行业公章的正式服务协议',
        comment: '建议在附件中同步增加吉安示范基地协议公章扫描件作为佐证材料。',
        timestamp: '14:25',
        author: '项目负责人 林同学',
        side: 'new'
      }
    ]
  },
  {
    id: 'rev-file-2',
    name: '新增_2026国赛路演风险防范与数据合规预案.docx',
    changeType: 'create',
    status: 'pending',
    fileType: 'doc',
    typeLabel: '合规防范专项文档',
    summary: 'Agent 自动新增：覆盖空域报备、地理遥感脱敏与模型幻觉双重专家兜底机制',
    updateTime: '1 分钟前',
    size: '34.2 KB',
    changeLocation: '项目交付物库 / 专项合规预案（全篇新增）',
    changePoints: [
      {
        id: 'cp-2-1',
        location: '第一章 · 低空飞行与地理信息合规',
        description: '严格遵循《民用无人驾驶航空器飞行管理暂行条例》完成空域报备；地理遥感底图通过国测局审图号校验，敏感地界脱敏加密接入推理引擎。'
      },
      {
        id: 'cp-2-2',
        location: '第二章 · 模型置信度与专家兜底机制',
        description: '针对茶网蝽等病虫害推理输出置信度区间，低于92%自动触发植保专家复核工单；设立离线审计日志与保险兜底基金，确保方案具备完全法律公信力。'
      }
    ],
    changeDescription: [
      '新增必要性：根据 2026 年国赛数据合规初筛专项审查标准自动生成的专项交付物',
      '核心增补内容：明确低空飞行空域报备、遥感底图脱敏加密与病虫害推理置信度专家复核兜底'
    ],
    modifiedContent: [
      '【新增文件 · 风险防范与数据合规预案（2026国赛标准）】',
      '一、数据安全与地理信息合规专项说明：',
      '1. 低空多光谱无人机巡航严格遵从《民用无人驾驶航空器飞行管理暂行条例》，所有作业空域申请完备，航线资质健全；',
      '2. 地理遥感原始底图均通过国测局审图号校验，对农户敏感地界脱敏加密后接入推理引擎，彻底规避涉密隐患；',
      '3. 农户与生产基地台账采用多租户 KMS 硬件加密与白名单访问隔离。',
      '二、模型幻觉防范与权威专家双重兜底机制：',
      '1. 针对茶网蝽、茶尺蠖等高发病虫害，推理结果输出置信度区间，若置信度低于 92% 自动触发校内植保专家复核工单；',
      '2. 建立离线审计日志与差错减损保险兜底基金，确保方案落地具备完全法律公信力。'
    ],
    annotations: []
  },
  {
    id: 'rev-file-3',
    name: '安里AI_BP补充_产品里程碑.pptx',
    changeType: 'modify',
    status: 'pending',
    fileType: 'ppt',
    typeLabel: '路演幻灯片 (Deck)',
    summary: '优化 P1~P4 四阶段技术研发与知识产权申报节点，强化全国示范网布局',
    updateTime: '3 分钟前',
    size: '35.2 KB',
    changeLocation: '路演汇报幻灯片 · 第5页产品四阶段演进矩阵表',
    changePoints: [
      {
        id: 'cp-3-1',
        location: '幻灯片第5页 · P1验证期节点 (2025.01-06)',
        description: '明确自研小样本多光谱蒸馏算子落地，获4项发明专利授权实审与6项软著，端侧推理速度提升400%。'
      },
      {
        id: 'cp-3-2',
        location: '幻灯片第5页 · P2拓展期节点 (2025.07-2026.06)',
        description: '升级为多Agent编排与工作流深度融合，落地12家万亩示范茶园标准化SOP，明确ARR突破500万元。'
      },
      {
        id: 'cp-3-3',
        location: '幻灯片第5页 · P3~P4增长与规模化 (2026-2028)',
        description: '深度绑定头部险企防灾减损数据分成，毛利率稳居68%以上；构建开放生态API矩阵，打造高教主赛道双创龙头。'
      }
    ],
    changeDescription: [
      'P1阶段：明确自研小样本多光谱蒸馏算子落地与4项发明专利实审，端侧提速400%',
      'P2阶段：升级为多Agent协同与12家万亩示范茶园SOP落地，明确ARR突破500万',
      'P3~P4阶段：绑定头部涉农险企防灾分成，搭建开放生态API矩阵'
    ],
    originalContent: [
      '【P1 验证期 (2025.01-06)】MVP基础助手开发，7项算法基础功能验证，知识产权准备申报。',
      '【P2 拓展期 (2025.07-2026.06)】SaaS产品化推进，在试点茶园人工协助标定，拓展中小型企业客户。',
      '【P3 增长期 (2026.07-2027.06)】全流程AI嵌入，寻求跨区域合作，探索行业垂直大模型。',
      '【P4 规模化 (2027.07-2028.12)】平台生态构建，多法域多语言适配，启动下一轮融资。'
    ],
    modifiedContent: [
      '【P1 验证期 (2025.01-06)】（AI本次优化）自研小样本多光谱蒸馏算子落地，获 4 项发明专利授权实审与 6 项软著，端侧推理速度提升 400%。',
      '【P2 拓展期 (2025.07-2026.06)】（AI本次优化）多Agent编排与工作流深度融合，12 家万亩示范茶园标准化SOP落地，ARR 突破 500 万。',
      '【P3 增长期 (2026.07-2027.06)】（AI本次优化）案件/病虫害溯源全链条智能化，与头部险企深度绑定防灾减损数据分成，毛利率稳居 68% 以上。',
      '【P4 规模化 (2027.07-2028.12)】（AI本次优化）开放生态 API 矩阵，覆盖全国茶产业集群，打造全国高教主赛道双创标杆龙头。'
    ],
    annotations: []
  }
];
