export interface AssetFile {
  id: string;
  name: string;
  path: string; // e.g., '核心申报/面向晶圆级高精度光学缺陷检测系统-商业计划书.md'
  folder: string; // '核心申报', '用户调研', '路演答辩', '演示多媒体', '佐证材料', '财务模型', or '' for root
  type: 'ppt' | 'excel' | 'doc' | 'bp' | 'pdf' | 'vcr' | 'code' | 'json' | 'yaml' | 'markdown';
  typeLabel: string;
  size: string;
  lastCommitMessage: string;
  lastCommitDate: string;
  lastCommitAuthor: string;
  lastCommitHash: string;
  badge?: string;
  category?: string;
  ext?: string;
  description?: string;
  contentSnippet?: string;
  contentLines?: string[];
  contentPreview?: string;
  metaInfo?: string;
  metadata?: Record<string, any>;
  rawUrl?: string;
}

export interface CommitChange {
  fileId: string;
  fileName: string;
  path: string;
  changeType: 'added' | 'modified' | 'deleted';
  additions: number;
  deletions: number;
  description: string;
  diffLines: Array<{
    type: 'add' | 'del' | 'normal';
    oldLine?: number;
    newLine?: number;
    text: string;
  }>;
}

export interface VersionCommit {
  id: string;
  hash: string;
  shortHash: string;
  title: string;
  description: string;
  author: {
    name: string;
    avatar: string;
    role: string;
  };
  date: string; // e.g. '2026-09-08'
  dateLabel: string; // e.g. 'Commits on Sep 8, 2026'
  timeAgo: string; // e.g. '3 days ago'
  stageBadge: string; // e.g. '国赛冲刺版', '省赛版', '初赛归档'
  fileIdsPresent: string[]; // List of file IDs available in this historical commit
  changes: CommitChange[];
}

export const SAMPLE_INTERVIEW_CONTENT = `# 半导体产线总监与工艺工程师深度访谈纪要

**调研时间**：2026年8月15日 - 8月28日  
**调研范围**：长三角及珠三角6家半导体制造与先进封测龙头企业  
**调研对象**：18位一线核心受访者（含5位制造运营总监、7位良率控制资深专家、6位光机电调试领班工程师）  
**调研形式**：1对1闭门深度访谈 + 洁净车间现场工序走访  
**纪要整理**：市场与调研组（王诗雨） · 审核人：林子越（项目负责人）

---

## 一、调研核心求证与产业卡点
针对2026中国国际大学生创新大赛评审重点关注的“高校技术是否来源于产业真实痛点、市场刚需与付费逻辑是否自洽”，调研组深入半导体制造一线，重点求证三大核心命题：
1. **进口设备痛点诊断**：美日巨头（KLA、基恩士、康耐视）现役设备在实际量产中存在哪些致命短板？
2. **技术性能底线红线**：国产装备进入头部企业产线验证，必须达到的检测节拍与检出精度底线是什么？
3. **商业付费心理边界**：客户对整机采购（ASP）、定制模组授权与算法SaaS年费的预算承受区间有多大？

---

## 二、受访专家访谈原声实录

### 访谈记录 01：某长三角头部封测上市企业 · 高级产线制造总监 张总
> **【专家背景】** 22年半导体封测产线管理经验，主管4条12英寸先进封装倒装与晶圆级封装产线。
- **痛点吐槽**：“我们车间目前主要用基恩士和KLA的设备。单台采购成本超800万元不说，最痛苦的是**换型调试太慢**！国内客户订单小批量、多品种，每月都要换4~5次批号。进口设备算法闭源，每次微调参数都要等海外原厂支持，停线调试经常耗费整整半天，产线停工一天损失就是几十万！”
- **对本项目方案评价**：“得知你们高校团队突破了自适应非对称干涉光路，能把配方自动标定时间压缩在15分钟以内，且检测节拍达到0.18秒/片，我们非常期待！只要经过连续1200小时工业级无故障实跑，我们愿意签署首批商业采购协议。”
- **采购价格预期**：“单机如果在150万~200万元，相比进口节约70%以上采购预算，采购部门可以直接走绿色审批通道。”

---

### 访谈记录 02：某先进制程晶圆代工厂 · 良率提升(Yield)首席工艺专家 李工
> **【专家背景】** 专注于亚微米表面微裂纹、开裂及边缘崩缺检测，主导全厂良率分析体系。
- **核心痛点**：“传统的明场/暗场光学检测最大问题是**虚警过杀率太高（普遍在1.5%~2.0%）**。在薄片晶圆上，许多无害的微小划痕被误判为致命裂纹，导致合格晶圆被误剔除，需要大量人工在高倍显微镜下二次复检，严重拖慢出货节拍。”
- **硬性验收红线**：“如果你们的边缘张量推理算法真能把**过杀率稳定压在0.1%以下**，同时**缺陷检出率保持在99.5%以上**，那就是真正的产线救星。我们急需这种国产自主设备来降低人工复核成本。”
- **数据安全诉求**：“特别赞同你们的端侧嵌入式计算架构。晶圆图谱属于我们企业的核心机密资产，决不允许上传公有云，端侧离线实时推理是进入晶圆代工厂的唯一通行证。”

---

### 访谈记录 03：集成电路装备供应链采购中心 · 部长 陈总
> **【专家背景】** 负责全集团年度超5亿元关键机电设备招标采购与供应商准入。
- **服务承诺要求**：“进口巨头在长三角的备件库经常缺核心光纤激光器或物镜，海外调件动辄3~4周，停工谁也担不起。你们承诺的**长三角2小时极速驻厂响应、7×24小时工程师技术支持**，具有决定性竞争优势。只要拿到国家第三方CNAS权威认证，我们首期计划采购3台专机。”

---

## 三、定量调研数据汇总与需求真伪求证结论

| 调研评估维度 | 统计数值 | 调研求证结论与商业转化支撑 |
| :--- | :--- | :--- |
| **真实刚需认同率** | **87.5%** (15/18人) | 明确表示现役进口设备无法满足柔性快换与本土即时响应，迫切需求国产替代。 |
| **单台设备预算区间** | **¥120万 ~ ¥220万** | 本项目标机定价 ¥180万元 处于客户最舒适采购区间，具备显著性价比优势。 |
| **SaaS/算法更新意向** | **77.8%** (14/18人) | 愿意每年支付 ¥8万~15万元 用于私有缺陷图谱增量更新与产线良率优化顾问服务。 |
| **首期决策验证周期** | **3 ~ 6 个月** | 普遍要求提供样机完成 1000小时以上产线联调无故障试跑，并出具CNAS检验报告。 |

---

## 四、调研成果在申报书与产品架构中的落地闭环
1. **产品研发聚焦**：根据李工反馈，将边缘推理板卡的缺陷分类模型扩展为18类，实测过杀率压降至 0.08%；
2. **商业模式强化**：构筑“硬件标机交付 + 核心模组SDK授权 + 缺陷库增量维护”的三重现金流模型；
3. **答辩攻防支撑**：本访谈纪要有力回应评委关于“客户是否真有付费意愿”与“技术是否真实落地”的极限追问。`;

export const ROADSHOW_SLIDES_DATA = [
  { page: 1, title: '01 封面 · 破局自主可控', subtitle: '面向晶圆级高精度光学缺陷检测系统', note: '8分钟陈述开场：30秒亮明高校团队国家级卡脖子攻坚身份与核心成果' },
  { page: 2, title: '02 痛点诊断 · 巨头垄断与三大死穴', subtitle: '进口设备垄断70%先进制程，单台千万级，节拍高达1.8秒', note: '用产线实拍图片对比凸显传统设备停线换型慢的致命硬伤' },
  { page: 3, title: '03 真实刚需 · 走访TOP8半导体产线', subtitle: '87.5%产线总监急需高性价比国产替代，意向明确', note: '展示华东6家封测厂走访实录与调研数据样本支撑' },
  { page: 4, title: '04 核心技术一 · 大视场纳秒激光干涉光路', subtitle: '非对称干涉光路设计，单脉冲均匀度98.2%，光利用率提升40%', note: '用第一性原理原理解剖图，强调完全自研无海外专利侵权风险' },
  { page: 5, title: '05 核心技术二 · 毫秒级缺陷分类边缘模型', subtitle: '18类缺陷张量并行推理，节拍压缩至0.18秒/片', note: '重点展示AI与精密光机电的一体化协同算法架构' },
  { page: 6, title: '06 权威检测 · 国家第三方CNAS认证', subtitle: '过杀率<0.1%，检出率99.6%，MTBF连续无故障运行超5000小时', note: '突出国家机器人检验评定中心CMA/CNAS红色检验公章' },
  { page: 7, title: '07 落地验证 · 两家封测上市龙头灯塔产线', subtitle: '已获65万元POC合同款并完成1200小时工业级实跑', note: '展示真实签署协议与产线联签单，击碎“实验室玩具”质疑' },
  { page: 8, title: '08 竞品矩阵 · 对标美日巨头三道护城河', subtitle: '先发工业缺陷光谱飞轮 + MES协议深度嵌入 + 2小时极速驻厂', note: '用清晰红绿对比矩阵，直观展现大厂无法替代的本土壁垒' },
  { page: 9, title: '09 商业模式 · 硬件+模组授权+SaaS算法', subtitle: '从整机销售到生态增值，实现健康现金流与长尾溢价', note: '解释单台硬件毛利58.3%与SaaS年费客户复购逻辑' },
  { page: 10, title: '10 获客策略 · 三步走从标杆到泛半导体', subtitle: '标杆灯塔验证 → 区域代理批量放量 → 拓展电池极耳/汽车电子', note: '阐明从长三角到珠三角的明确销售里程碑' },
  { page: 11, title: '11 核心团队 · 杰青博导与博硕青年研发主力', subtitle: '团队博硕比例75%，师生协同，MBA商业总监具备8年产业化操盘', note: '展示股权清晰划分与高校科技处成果独占转让批复' },
  { page: 12, title: '12 财务预测 · 2027年营收2800万净利620万', subtitle: '单客户经济模型健康自洽，1.5个月完全收回单点获客成本', note: '三张表联动，已考虑行业6个月账期极端情景' },
  { page: 13, title: '13 融资规划 · 出让10%股权融资1500万元', subtitle: '40%用于二代机型研发，35%用于长三角中试基地，25%渠道建设', note: '展示估值公允性与投资人退出渠道' },
  { page: 14, title: '14 社会价值 · 支撑国家半导体自立自强', subtitle: '赋能新质生产力，培养30余名高端交叉学科人才，带动百人就业', note: '升华家国情怀，呼应大赛“我敢闯，我会创”立德树人主旨' },
  { page: 15, title: '15 答辩备用 · 专家高频极限追问防守锦囊', subtitle: '技术替代、巨头降价、高校成果归属等12条预案速查', note: '以饱满自信迎接评委质询，随时一键调出支撑附件' }
];

export const INITIAL_ASSET_FILES: AssetFile[] = [
  // ================= 文件夹 1：核心申报 =================
  {
    id: 'f-bp-main',
    name: '面向晶圆级高精度光学缺陷检测系统-商业计划书.md',
    path: '核心申报/面向晶圆级高精度光学缺陷检测系统-商业计划书.md',
    folder: '核心申报',
    type: 'bp',
    typeLabel: '商业计划书正本 (Markdown)',
    size: '148.6 KB',
    lastCommitMessage: 'feat: 完善12章全体系论证与两家头部封测POC实跑成果 (V3.0 Final)',
    lastCommitDate: '3 days ago',
    lastCommitAuthor: '林子越',
    lastCommitHash: 'bf63851',
    badge: '国赛金奖正本',
    category: '核心申报书',
    ext: 'md',
    description: '涵盖12章完整体系论证、技术第一性原理及商业模式自洽正本',
    metaInfo: '已通过省赛金奖终审，直通国赛争夺金奖 · 18,600字标准正本',
    contentPreview: `# 面向晶圆级高精度光学缺陷检测系统 —— 商业计划书（国赛攻坚金奖正本）

## 1. 执行摘要
本项目针对我国集成电路制造与半导体先进封测领域“工业视觉检测核心设备长期被基恩士、康耐视及KLA等美日巨头垄断”的卡脖子难题，由高校光学工程重点实验室科研团队历时4年产学研联合攻关，研制出具有完全自主知识产权的**晶圆级高精度光学缺陷检测系统**。
项目突破大视场纳秒激光相干层析与微米级在线重构算法，将单片晶圆全检节拍从进口设备的1.8秒大幅压缩至0.2秒以内，同时实现99.6%的高检出率与不足0.1%的过杀率。目前已通过国家第三方CNAS/CMA权威检测认证，并在长三角两家头部封测上市企业完成连续1200小时产线无故障试跑，获得65万元前期概念验证(POC)到账开发费。

## 2. 项目背景与痛点
1. **产业卡脖子痛点**：我国先进制程晶圆产线70%以上的明场与暗场光学检测设备依赖进口，面临关键光学器件断供禁运与数据外泄双重安全风险；
2. **现有设备效率瓶颈**：国外同类主流设备单台售价超800万元，且换型调试周期长达2周，无法灵活适应国内特色封装工艺的高频变更；
3. **真实刚需验证**：走访调研国内TOP8半导体制造及封测厂商，87.5%的受访产线总监明确表示：“迫切需要兼具亚微米测量精度、超快节拍响应与高性价比的国产首台套替代装备”。

## 3. 产品/服务与技术
- **核心突破一：大光斑纳秒激光干涉光学系统**：独创非对称光路设计，单脉冲能量均匀度提升至98.2%，光斑利用率提高40%；
- **核心突破二：轻量化实时缺陷分类嵌入式边缘算法**：基于深度边缘张量加速，实现微米级划痕、开裂、空洞等18类常见缺陷毫秒级多重推理；
- **知识产权矩阵**：已获授权国家发明专利8项、实用新型专利12项、软件著作权6项，核心专利链条完整覆盖光机电软全栈架构。

## 4. 市场分析与规模
- **TAM（全市场总额）**：全球半导体量测与缺陷检测设备市场规模达124亿美元；
- **SAM（可服务市场）**：中国大陆半导体晶圆检测设备年采购规模超180亿元人民币，年复合增长率(CAGR)保持在18.4%；
- **SOM（目标可获取市场）**：项目以先进封装与功率半导体检测为切入点，预计2027年实现国内该细分领域8.5%市场占有率，对应年产值1.5亿元。

## 5. 竞争分析与护城河
对比基恩士（Keyence）、康耐视（Cognex）及国内初创公司，本项目构筑了三道不可逾越的护城河：
1. **先发私有工业缺陷数据集飞轮**：已沉淀200万+张产线真实晶圆缺陷多波段光谱图谱，大厂无法获取细分制造场景的专有训练数据；
2. **制造执行系统(MES)协议深度集成**：定制化产线通信协议与自动分选机构无缝联锁，客户替换整套设备停线停工成本高达数百万元；
3. **本土化2小时极速服务响应**：提供7×24小时驻厂工程师支持，相比进口厂商2-4周的海外备件周期具有决定性服务优势。

## 6. 商业模式与盈利路径
- **硬件装备销售**：针对半导体产线推出标机与定制化检测专机（客单价120万~260万元/台）；
- **核心光学传感器模块授权**：向国内自动化集成商提供嵌入式模组与算法SDK授权（客单价15万~30万元/套）；
- **高阶算法SaaS年费与耗材维保**：提供云端缺陷特征库增量更新与产线良率智能优化增值服务，形成稳健长尾现金流。

## 7. 营销推广与获客策略
- **阶段一（标杆突破，已完成）**：与2家行业头部封测上市公司签订联合开发与试用协议，建立国家级行业标杆灯塔工厂；
- **阶段二（区域渗透，2026-2027）**：深耕长三角、珠三角半导体产业集群，签约5家省级代理集成商，实现规模化批量交付；
- **阶段三（生态拓展，2028起）**：拓展新能源电池极耳检测、汽车电子等泛半导体高精密检测领域。

## 8. 生产交付与运营体系
- **轻资产软硬协同制造模式**：核心光机组件与专用算法板卡自研组装与核心标定，机加钣金与通用外设委托长三角优质代工厂生产；
- **严格出厂质检流程**：制定108项晶圆级出厂动态标定规程，通过国家机器人检测评定中心(CNAS)标准认证，平均无故障运行时间(MTBF)超5000小时。

## 9. 团队结构与组织协同
- **项目负责人**：博士研究生，师从国家杰青学者，主持省级重点研发课题2项，发表顶刊论文6篇；
- **首席技术顾问**：光学工程系博导，全国五一劳动奖章获得者，在半导体量测装备领域深耕25年；
- **商业与运营总监**：MBA研究生，曾任知名工业视觉上市公司华东区高级大客户经理，具备8年产业化落地经验；
- **研发骨干配比**：核心成员涵盖光学、精密机械、仪器科学、计算机及工商管理，博硕比例达75%，师生协同创业机制规范清晰。

## 10. 财务预测与融资计划
- **财务测算**：2026年预计营收850万元，实现微利；2027年预计营收2800万元，净利润620万元；2028年预计营收6500万元；
- **单客户经济模型(Unit Economics)**：客单价180万元，硬件物料成本75万元，销售毛利率达58.3%，获客成本在交付后1.5个月即可完全收回；
- **融资规划**：本轮计划出让10%股权融资1500万元，重点用于二代全自动晶圆装载机研发（40%）、长三角中试基地建设（35%）及销售渠道铺设（25%）。

## 11. 风险防控与应急预案
- **技术替代风险**：针对国外厂商可能推出的低价机型，团队已启动二代深紫外波段检测光路研发，性能领先下一代周期；
- **知识产权合规**：已与所在高校签署《科技成果排他性独占转让及转化协议》，明确发明人奖励比例与无职务发明侵权争议，法律批文随附附件。

## 12. 社会价值与产业效益
- **新质生产力标杆**：有力推进国产半导体核心检测装备自主可控进程，彻底摆脱外部断供与技术卡死风险；
- **高质量人才培养与就业带动**：累计为高校输送光机电交叉学科工程硕博30余名，未来三年预计提供高端研发与技术支持岗位超120个。`
  },
  {
    id: 'f-exec-summary-pdf',
    name: '面向晶圆级高精度光学缺陷检测系统-一页纸执行摘要.pdf',
    path: '核心申报/面向晶圆级高精度光学缺陷检测系统-一页纸执行摘要.pdf',
    folder: '核心申报',
    type: 'pdf',
    typeLabel: '评审速览摘要 (PDF)',
    size: '1.2 MB',
    lastCommitMessage: 'docs: 凝练国赛现场评委一分钟速读金奖要点卡',
    lastCommitDate: '3 days ago',
    lastCommitAuthor: '林子越',
    lastCommitHash: 'bf63851',
    badge: '评审极速摘要',
    category: '核心申报书',
    ext: 'pdf',
    description: '提炼四项国家级首创技术突破、核心经济效益与国赛金奖支撑矩阵，供评委1分钟速览',
    metaInfo: '一页纸精炼版 · 包含技术参数矩阵、两家标杆客户签单与毛利率58.3%测算',
    contentPreview: `【面向晶圆级高精度光学缺陷检测系统 - 一页纸执行摘要 (Executive Summary)】
■ 项目定位：面向半导体前道与先进封装晶圆缺陷检测的国产自主替代高精装备
■ 痛点突破：打破美日三巨头垄断，节拍从1.8秒压缩至0.18秒，单机售价节约60%
■ 核心壁垒：自研大视场非对称相干光路 + 边缘18类缺陷张量并行推理 + 200万图谱飞轮
■ 客户验证：已获长三角头部封测上市龙头65万元POC款项，1200小时产线无故障试跑
■ 商业闭环：客单价180万，BOM成本75万，毛利率58.3%，投资回本周期仅1.5个月`
  },
  {
    id: 'f-defense-pocket-md',
    name: '全国总决赛高频12问答辩防守与极限追问锦囊.md',
    path: '核心申报/全国总决赛高频12问答辩防守与极限追问锦囊.md',
    folder: '核心申报',
    type: 'doc',
    typeLabel: '答辩攻防锦囊 (Markdown)',
    size: '24.8 KB',
    lastCommitMessage: 'feat: 整理评委视界12条高频深度质询应答卡',
    lastCommitDate: '4 days ago',
    lastCommitAuthor: '林子越',
    lastCommitHash: '3d888ee',
    badge: '答辩攻防锦囊',
    category: '核心申报书',
    ext: 'md',
    description: '归纳针对技术替代、海外大厂降价反制、高校成果独占性归属及财务账期等12条评委极限追问对策',
    metaInfo: '包含12个靶向防守锦囊，覆盖技术、商业、合规、团队四维极限质询',
    contentPreview: `# 全国总决赛高频12问答辩防守与极限追问锦囊

## Q1：大厂（如基恩士、KLA）如果大幅降价或推出专用低价机，你们如何应对？
- **靶向应答**：
  1. **服务时效壁垒**：大厂工程师从海外或境外调配需要2~4周，我们提供长三角2小时极速驻厂响应；
  2. **非标定制适配**：国内先进封装换型极频，我们算法15分钟自动重构，进口设备改配方需2周；
  3. **数据安全自闭环**：国内厂商对工艺数据极为敏感，我们纯离线端侧部署，大厂普遍强制回传云端。

## Q2：高校科研成果转化的知识产权归属是否清晰？是否存在职务侵权风险？
- **靶向应答**：
  已与所在大学科技处签署《科技成果排他性独占转让及转化实施协议》（见佐证材料），发明人奖励比例清晰公证，无任何职务发明侵权争议。

## Q3：半导体行业回款账期普遍长达6~9个月，财务模型如何避免资金链断裂？
- **靶向应答**：
  采用“3:3:3:1”分期回款机制，且本轮1500万融资预算已按极端9个月账期进行压力测算，可支撑公司无新增订单安全运转24个月以上。`
  },

  // ================= 文件夹 2：用户调研 =================
  {
    id: 'f-interview-records',
    name: '半导体产线总监与工艺工程师深度访谈纪要.md',
    path: '用户调研/半导体产线总监与工艺工程师深度访谈纪要.md',
    folder: '用户调研',
    type: 'doc',
    typeLabel: '实地调研纪要 (Markdown)',
    size: '42.2 KB',
    lastCommitMessage: 'docs: 整理华东6家晶圆封测厂18位专家深度访谈原声',
    lastCommitDate: '4 days ago',
    lastCommitAuthor: '林子越',
    lastCommitHash: '3d888ee',
    badge: '真实实测验证',
    category: '用户调研',
    ext: 'md',
    description: '涵盖华东6家知名晶圆封测厂产线负责人、良率分析专家的真实痛点与采购价格心理区间',
    metaInfo: '受访专家18位 · 真实求证87.5%采购刚需与换型调试停线痛点',
    contentPreview: SAMPLE_INTERVIEW_CONTENT
  },
  {
    id: 'f-poc-intent-xlsx',
    name: '长三角TOP8晶圆封测厂客户痛点与采购意向汇总.xlsx',
    path: '用户调研/长三角TOP8晶圆封测厂客户痛点与采购意向汇总.xlsx',
    folder: '用户调研',
    type: 'excel',
    typeLabel: '意向调研表格 (XLSX)',
    size: '850.5 KB',
    lastCommitMessage: 'docs: 录入TOP8封测厂换型频次与首台套采购意向打分',
    lastCommitDate: '5 days ago',
    lastCommitAuthor: '林子越',
    lastCommitHash: '8e12fa4',
    badge: '87.5%意向率',
    category: '用户调研',
    ext: 'xlsx',
    description: '长三角头部8家封测上市龙头企业调研问卷与首台套试用采购意向矩阵数据表',
    metaInfo: '包含长电科技、通富微电、华天科技等产业链重点企业调研意向明细'
  },
  {
    id: 'f-benchmark-pdf',
    name: '全球半导体缺陷检测设备主流竞品基准对比分析.pdf',
    path: '用户调研/全球半导体缺陷检测设备主流竞品基准对比分析.pdf',
    folder: '用户调研',
    type: 'pdf',
    typeLabel: '竞品对标白皮书 (PDF)',
    size: '3.8 MB',
    lastCommitMessage: 'docs: 完善对标KLA与基恩士光学指标三维对比矩阵',
    lastCommitDate: '5 days ago',
    lastCommitAuthor: '林子越',
    lastCommitHash: '8e12fa4',
    badge: '竞品基准矩阵',
    category: '用户调研',
    ext: 'pdf',
    description: '对标美日巨头KLA、基恩士、康耐视在波长、检出率、过杀率、换型调试周期维度的横向评测报告',
    metaInfo: '对标4大国际巨头共16项硬核参数，论证自研装备在节拍与换型柔性上的代际优势'
  },

  // ================= 文件夹 3：路演答辩 =================
  {
    id: 'f-roadshow-ppt',
    name: '全国总决赛现场答辩-15页路演极速汇报幻灯片.pptx',
    path: '路演答辩/全国总决赛现场答辩-15页路演极速汇报幻灯片.pptx',
    folder: '路演答辩',
    type: 'ppt',
    typeLabel: '路演汇报幻灯片 (PPTX)',
    size: '28.5 MB',
    lastCommitMessage: 'feat: 完成2026大赛8分钟金奖汇报15页PPT终版封装',
    lastCommitDate: '3 days ago',
    lastCommitAuthor: '林子越',
    lastCommitHash: 'bf63851',
    badge: '金奖幻灯片',
    category: '路演答辩',
    ext: 'pptx',
    description: '针对2026大赛8分钟陈述定制，按“痛点→突破→落地→商业→团队”黄金节奏排布',
    metaInfo: '15页金奖架构 · 包含高清工业级光机三维渲染与标杆产线实测动图'
  },
  {
    id: 'f-speech-script-md',
    name: '全国总决赛8分钟现场汇报主讲人演讲逐字稿.md',
    path: '路演答辩/全国总决赛8分钟现场汇报主讲人演讲逐字稿.md',
    folder: '路演答辩',
    type: 'doc',
    typeLabel: '演讲逐字讲稿 (Markdown)',
    size: '18.5 KB',
    lastCommitMessage: 'docs: 细化主讲人每页秒数分配与停顿互动标记',
    lastCommitDate: '3 days ago',
    lastCommitAuthor: '林子越',
    lastCommitHash: 'bf63851',
    badge: '8分钟演讲范式',
    category: '路演答辩',
    ext: 'md',
    description: '标注每一页幻灯片的建议陈述秒数、手势配合点及情绪高潮点（主讲人：李林峰）',
    metaInfo: '精确至秒级节奏把控 · 配套15页PPT实现声画完美同频',
    contentPreview: `# 全国总决赛8分钟现场汇报主讲人演讲逐字稿

**主讲人**：李林峰（光学工程博士研究生）  
**总时长控制**：7分45秒（预留15秒从容鞠躬致谢，绝不超时扣分）  
**演讲核心主线**：“卡脖子之痛 → 硬核破局之法 → 产业落地之实 → 商业自洽之路 → 青年报国之志”

---

### P1 封面引入（00:00 - 00:30 | 30秒）
“尊敬的各位评委专家，上午好！我是项目负责人李林峰。今天，我们团队带来的项目是——《面向晶圆级高精度光学缺陷检测系统》。”
“在半导体制造的微观世界里，一片12英寸晶圆上分布着数百亿个晶体管，哪怕一根微米级的细微划痕，都会导致整枚芯片报废。然而，长期以来，这双‘工业之眼’，却被美日巨头死死掐住脖子……”

### P2 产业痛点（00:30 - 01:05 | 35秒）
“我国先进制程产线上，70%以上的光学检测设备依赖进口。单台设备售价高达800万元，更致命的是，检测单片晶圆耗时高达1.8秒，每次换型调试需要整整两周！这不仅是高昂的设备成本，更是国家产业安全的巨大软肋！”

### P3 落地实测与CNAS认证（02:30 - 03:15 | 45秒）
“今天，我们不仅带着图纸来，更带着产线实跑的硬核成绩！我们的设备已在长三角两家封测上市公司完成了连续1200小时工业级试跑，获得65万元POC合同款！并通过了国家第三方CNAS全项权威检测，检出率高达99.6%，虚警过杀率低于0.08%！”`
  },

  // ================= 文件夹 4：演示多媒体 =================
  {
    id: 'f-demo-video',
    name: '晶圆微米级缺陷在线高速检测样机产线实录.mp4',
    path: '演示多媒体/晶圆微米级缺陷在线高速检测样机产线实录.mp4',
    folder: '演示多媒体',
    type: 'vcr',
    typeLabel: '中试产线录像 (MP4)',
    size: '89.5 MB',
    lastCommitMessage: 'feat: 上传某国家级封测中试车间1200小时实跑4K录像',
    lastCommitDate: '6 days ago',
    lastCommitAuthor: '林子越',
    lastCommitHash: '5a22c19',
    badge: '中试实跑录像',
    category: '演示多媒体',
    ext: 'mp4',
    description: '展示产线全自动上下料、0.18秒超高速纳秒激光重构与缺陷毫秒级标定全流程实录',
    metaInfo: '4K 60FPS · 时长 03:15 · 录制于长三角某头部芯片封测洁净中试车间'
  },
  {
    id: 'f-optics-sim-mp4',
    name: '纳秒激光大视场非对称相干层析光路三维仿真模拟.mp4',
    path: '演示多媒体/纳秒激光大视场非对称相干层析光路三维仿真模拟.mp4',
    folder: '演示多媒体',
    type: 'vcr',
    typeLabel: '光路原理动画 (MP4)',
    size: '45.2 MB',
    lastCommitMessage: 'feat: 导入第一性原理非对称干涉光路三维光学仿真',
    lastCommitDate: '6 days ago',
    lastCommitAuthor: '林子越',
    lastCommitHash: '5a22c19',
    badge: '第一性原理动画',
    category: '演示多媒体',
    ext: 'mp4',
    description: '独创非对称干涉光路设计的三维光线追踪仿真，展示单脉冲能量均匀度提升至98.2%',
    metaInfo: '三维光机动画直观解构自研底层专利无侵权风险'
  },

  // ================= 文件夹 5：佐证材料 =================
  {
    id: 'f-patent-cert',
    name: '国家知识产权局发明专利证书与科技成果转化审查意见书.pdf',
    path: '佐证材料/国家知识产权局发明专利证书与科技成果转化审查意见书.pdf',
    folder: '佐证材料',
    type: 'pdf',
    typeLabel: '发明专利与转化批件 (PDF)',
    size: '4.5 MB',
    lastCommitMessage: 'docs: 归档国家知识产权局发明专利授权公告与高校转化批件',
    lastCommitDate: '10 days ago',
    lastCommitAuthor: '林子越',
    lastCommitHash: '1a998c0',
    badge: '国知局授权',
    category: '佐证材料',
    ext: 'pdf',
    description: '核心发明专利ZL202310884210.X授权公告及高校科技处独占性转让转化批复文件',
    metaInfo: '包含排他性独占转让合同、发明人公证确认函与国家专利授权红章'
  },
  {
    id: 'f-cnas-report',
    name: '国家机器人与精密仪器检测评定中心(CNAS)全项检验报告.pdf',
    path: '佐证材料/国家机器人与精密仪器检测评定中心(CNAS)全项检验报告.pdf',
    folder: '佐证材料',
    type: 'pdf',
    typeLabel: '国家CNAS检验报告 (PDF)',
    size: '6.2 MB',
    lastCommitMessage: 'docs: 导入CNAS/CMA国家级第三方全项检验报告红章扫描件',
    lastCommitDate: '9 days ago',
    lastCommitAuthor: '林子越',
    lastCommitHash: '2c884b1',
    badge: 'CNAS权威检验',
    category: '佐证材料',
    ext: 'pdf',
    description: '第三方出具的亚微米测量重复精度、MTBF无故障运行时间与过杀率检验公章报告',
    metaInfo: '报告编号 CNAS-2026-ST88921 · 检验合格率100% · MTBF>5000小时'
  },
  {
    id: 'f-pilot-joint-pdf',
    name: '长三角两家封测上市龙头1200小时产线无故障试跑联签单.pdf',
    path: '佐证材料/长三角两家封测上市龙头1200小时产线无故障试跑联签单.pdf',
    folder: '佐证材料',
    type: 'pdf',
    typeLabel: '上市龙头联签证明 (PDF)',
    size: '2.6 MB',
    lastCommitMessage: 'docs: 归档两家头部上市公司产线联签单与65万POC银行到账回单',
    lastCommitDate: '7 days ago',
    lastCommitAuthor: '林子越',
    lastCommitHash: '4d771e3',
    badge: '灯塔产线联签公章',
    category: '佐证材料',
    ext: 'pdf',
    description: '两家行业头部封测上市公司盖章确认的连续1200小时工业级实跑运行报告及POC验收单',
    metaInfo: '含两家上市公司生产制造部公章、现场负责人联签单及财务对公转账凭证'
  },

  // ================= 文件夹 6：财务模型 =================
  {
    id: 'f-financial-model',
    name: '未来三年财务预测三张表与单客户经济模型测算.xlsx',
    path: '财务模型/未来三年财务预测三张表与单客户经济模型测算.xlsx',
    folder: '财务模型',
    type: 'excel',
    typeLabel: '三张财务报表模型 (XLSX)',
    size: '1.5 MB',
    lastCommitMessage: 'feat: 完善单客户经济模型与6个月账期极端情景压力测试',
    lastCommitDate: '4 days ago',
    lastCommitAuthor: '林子越',
    lastCommitHash: '3d888ee',
    badge: '三表逻辑自洽',
    category: '财务模型',
    ext: 'xlsx',
    description: '资产负债表、利润表、现金流量表动态联动测算，包含回款账期与敏感性分析',
    metaInfo: '含单机毛利58.3%、LTV/CAC 19.1倍测算及回本周期1.5个月动态联动'
  },
  {
    id: 'f-bom-cost-xlsx',
    name: '工业级标机BOM物料成本与核心光机元器件采购清单.xlsx',
    path: '财务模型/工业级标机BOM物料成本与核心光机元器件采购清单.xlsx',
    folder: '财务模型',
    type: 'excel',
    typeLabel: '硬件BOM核算表 (XLSX)',
    size: '720.8 KB',
    lastCommitMessage: 'docs: 细化激光光源与专用FPGA板卡供应链采购报价核算',
    lastCommitDate: '5 days ago',
    lastCommitAuthor: '林子越',
    lastCommitHash: '8e12fa4',
    badge: '单机BOM ¥75万',
    category: '财务模型',
    ext: 'xlsx',
    description: '激光光源、非球面物镜组、高速CMOS传感器、FPGA板卡及花岗岩减震平台的逐项分摊',
    metaInfo: '支撑180万售价与58.3%毛利率的第一性原理物料成本核算依据'
  },

  // ================= 根目录文件 =================
  {
    id: 'asset-readme',
    name: 'README.md',
    path: 'README.md',
    folder: '',
    type: 'markdown',
    typeLabel: '资产基线说明 (Markdown)',
    size: '5.2 KB',
    lastCommitMessage: 'feat: 升级2026国赛金奖对标材料与全套申报资产目录 (V3.0 Final)',
    lastCommitDate: '3 days ago',
    lastCommitAuthor: '林子越',
    lastCommitHash: 'bf63851',
    badge: '资产总纲',
    category: '核心申报书',
    ext: 'md',
    description: '面向晶圆级高精度光学缺陷检测系统 - 2026大赛申报全要素资产目录与索引规范',
    metaInfo: '项目编号 CX2026-HQ88921 · 负责人：林子越 · 指导团队：高校光学工程重点实验室',
    contentPreview: `# 面向晶圆级高精度光学缺陷检测系统 - 项目资产库总纲

> 2026中国国际大学生创新大赛（中国国际“互联网+”）高教主赛道金奖冲刺申报全案

## 1. 项目基本信息
- **申报编号**: CX2026-HQ88921
- **项目团队**: 高校光学工程重点实验室科研团队（负责人：林子越）
- **当前演进状态**: L5 终审冲刺 · V3.0 Final 金奖决战版
- **核心专利支撑**: 已授权国家发明专利8项、实用新型12项、软著6项（独占转让有效）

## 2. 文件夹分类规范与资产索引
\`\`\`
├── 核心申报/     # 12章商业计划书正本、一页纸执行摘要、答辩攻防锦囊
├── 用户调研/     # 华东6家封测厂18位专家深度访谈纪要、客户意向汇总、竞品基准报告
├── 路演答辩/     # 15页金奖路演PPTX全套幻灯片、8分钟汇报主讲人演讲逐字稿
├── 演示多媒体/   # 某国家级封测中试车间1200小时4K实跑录像、非对称光路三维仿真
├── 佐证材料/     # 国家知识产权局发明专利证书、CNAS全项检验报告、两家龙头联签单
└── 财务模型/     # 未来三年三张表财务模型、单客户经济学(Unit Economics)、BOM清单
\`\`\`

## 3. 2026国赛金奖指标对标闭环
1. **创新维度 (25分)**: 大视场非对称相干层析与边缘18类缺陷毫秒级推理，拥有完全自主知识产权。
2. **商业维度 (20分)**: 单机售价180万，毛利率58.3%，已获得两家头部上市封测厂65万元POC合同款。
3. **团队维度 (20分)**: 博硕比例75%，师生协同创业，核心成员具备深厚光机电算跨学科背景。
4. **带动就业与新质生产力 (15分)**: 赋能半导体检测装备国产自主替代，解决先进制程卡脖子难题。
5. **合规与佐证链 (20分)**: 具备国家CNAS第三方检验报告红章与高校科技处独占转让批复，佐证链100%严密闭环。`
  },
  {
    id: 'asset-manifest',
    name: 'project_manifest.json',
    path: 'project_manifest.json',
    folder: '',
    type: 'json',
    typeLabel: '参赛元数据规范 (JSON)',
    size: '2.4 KB',
    lastCommitMessage: 'docs: 同步2026大赛评审细则与全要素资产索引映射',
    lastCommitDate: '4 days ago',
    lastCommitAuthor: '林子越',
    lastCommitHash: '3d888ee',
    badge: '元数据',
    category: '核心申报书',
    ext: 'json',
    description: '结构化项目指标、赛道细分指标评分映射与团队合规校验凭据',
    metaInfo: 'JSON格式 · 包含国赛评审得分预测92.5与CNAS证书编号映射',
    contentPreview: `{
  "projectName": "面向晶圆级高精度光学缺陷检测系统",
  "competition": "2026中国国际大学生创新大赛",
  "track": "高教主赛道 - 研究生组",
  "projectCode": "CX2026-HQ88921",
  "projectLeader": "林子越",
  "institution": "高校光学工程重点实验室",
  "evaluationScore": 92.5,
  "grade": "Gold-Candidate",
  "verifiedCertificates": [
    "ZL202310884210.X",
    "CNAS-2026-ST88921",
    "TECH-TRANSFER-2026-0812"
  ],
  "assetsSummary": {
    "coreDocsCount": 3,
    "userResearchCount": 3,
    "roadshowCount": 2,
    "multimediaCount": 2,
    "evidenceCount": 3,
    "financeCount": 2
  }
}`
  }
];

export const MOCK_VERSION_COMMITS: VersionCommit[] = [
  {
    id: 'commit-1',
    hash: 'bf638515c1e92d4b8f729e1a49827cd9018f23',
    shortHash: 'bf63851',
    title: 'feat: 完成2026国赛金奖对标材料与全套BP路演交付产物 (V3.0 Final)',
    description: '按照国赛评审专家问诊反馈，补充风险防范机制、客户深度访谈纪要、CNAS检验公章报告及三表财务模型，打包全套路演交付产物。',
    author: {
      name: '林子越',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&auto=format&fit=crop&q=80',
      role: '项目负责人'
    },
    date: '2026-09-05',
    dateLabel: 'Commits on Sep 5, 2026',
    timeAgo: '3 days ago',
    stageBadge: '国赛金奖终稿 V3.0',
    fileIdsPresent: INITIAL_ASSET_FILES.map(f => f.id),
    changes: [
      {
        fileId: 'f-bp-main',
        fileName: '面向晶圆级高精度光学缺陷检测系统-商业计划书.md',
        path: '核心申报/面向晶圆级高精度光学缺陷检测系统-商业计划书.md',
        changeType: 'modified',
        additions: 120,
        deletions: 15,
        description: '完善标准12章体系，补充两家头部封测上市龙头1200小时无故障实跑数据与65万元到账证明。',
        diffLines: [
          { type: 'normal', oldLine: 18, newLine: 18, text: '  - 检出节拍由进口设备的1.8秒压缩至0.2秒以内' },
          { type: 'add', newLine: 19, text: '+ - 已在长三角两家头部封测上市龙头完成1200小时产线无故障试跑' },
          { type: 'add', newLine: 20, text: '+ - 获得65万元前期概念验证(POC)到账开发费' }
        ]
      },
      {
        fileId: 'f-interview-records',
        fileName: '半导体产线总监与工艺工程师深度访谈纪要.md',
        path: '用户调研/半导体产线总监与工艺工程师深度访谈纪要.md',
        changeType: 'modified',
        additions: 85,
        deletions: 10,
        description: '替换为长三角6家龙头企业18位产线总监与良率专家的真实调研访谈纪要。',
        diffLines: [
          { type: 'add', newLine: 1, text: '+ # 半导体产线总监与工艺工程师深度访谈纪要' },
          { type: 'add', newLine: 2, text: '+ 真实刚需认同率达87.5%，受访专家强烈需要解决换型停机过慢痛点' }
        ]
      },
      {
        fileId: 'f-financial-model',
        fileName: '未来三年财务预测三张表与单客户经济模型测算.xlsx',
        path: '财务模型/未来三年财务预测三张表与单客户经济模型测算.xlsx',
        changeType: 'modified',
        additions: 42,
        deletions: 8,
        description: '单客户经济模型测算自洽，毛利率58.3%，回本周期1.5个月。',
        diffLines: [
          { type: 'normal', oldLine: 5, newLine: 5, text: '  - 单台售价：180万元 | 硬件BOM：75万元' },
          { type: 'add', newLine: 6, text: '+ - 考虑半导体行业6~9个月长账期压力测试，现金流安全边际充沛' }
        ]
      }
    ]
  },
  {
    id: 'commit-2',
    hash: '3d888ee27a054ec914fa6b4618e950bc412ca7',
    shortHash: '3d888ee',
    title: 'docs: 导入国家检验评定中心CNAS全项检验报告与高校专利独占许可批件',
    description: '落实知识产权与技术壁垒支撑，补充国家机器人检验评定中心权威CNAS公章报告及高校科技成果排他性独占转让批复。',
    author: {
      name: '林子越',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&auto=format&fit=crop&q=80',
      role: '项目负责人'
    },
    date: '2026-09-04',
    dateLabel: 'Commits on Sep 4, 2026',
    timeAgo: '4 days ago',
    stageBadge: '权威质检合规版 V2.8',
    fileIdsPresent: INITIAL_ASSET_FILES.filter(f => f.id !== 'f-exec-summary-pdf').map(f => f.id),
    changes: [
      {
        fileId: 'f-cnas-report',
        fileName: '国家机器人与精密仪器检测评定中心(CNAS)全项检验报告.pdf',
        path: '佐证材料/国家机器人与精密仪器检测评定中心(CNAS)全项检验报告.pdf',
        changeType: 'added',
        additions: 60,
        deletions: 0,
        description: '归档CNAS全项检验报告，过杀率<0.1%，检出率99.6%，MTBF超5000小时判定优级。',
        diffLines: [
          { type: 'add', newLine: 1, text: '+ 【国家机器人与精密仪器检测评定中心检验报告 (CNAS-2026-ST88921)】' },
          { type: 'add', newLine: 2, text: '+ 单片晶圆全检节拍实测：0.18 ~ 0.20 秒（优级通过）' }
        ]
      }
    ]
  },
  {
    id: 'commit-3',
    hash: '8e12fa4c09d187b8f9024128f729e1a49827cd9',
    shortHash: '8e12fa4',
    title: 'feat: 增补长三角封测上市龙头1200小时中试录像与单台标机BOM成本核算',
    description: '完成某国家级洁净车间1200小时工业级实跑4K录像与激光器、物镜单项BOM采购报价核算。',
    author: {
      name: '林子越',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&auto=format&fit=crop&q=80',
      role: '项目负责人'
    },
    date: '2026-09-02',
    dateLabel: 'Commits on Sep 2, 2026',
    timeAgo: '6 days ago',
    stageBadge: '产线实测版 V2.5',
    fileIdsPresent: [
      'f-bp-main',
      'f-interview-records',
      'f-roadshow-ppt',
      'f-demo-video',
      'f-patent-cert',
      'f-cnas-report',
      'f-financial-model',
      'f-bom-cost-xlsx',
      'asset-readme',
      'asset-manifest'
    ],
    changes: [
      {
        fileId: 'f-demo-video',
        fileName: '晶圆微米级缺陷在线高速检测样机产线实录.mp4',
        path: '演示多媒体/晶圆微米级缺陷在线高速检测样机产线实录.mp4',
        changeType: 'added',
        additions: 1,
        deletions: 0,
        description: '产线4K实录视频上传并完成节点标记。',
        diffLines: [
          { type: 'add', newLine: 1, text: '+ 4K 60FPS 产线实跑录像：包含真空吸附、激光层析与0.18s边缘推理' }
        ]
      }
    ]
  },
  {
    id: 'commit-4',
    hash: '1a998c0b2c884b15a22c194d771e33d888eebf6',
    shortHash: '1a998c0',
    title: 'init: 项目资产库初始化与省赛金奖正本归档 (V2.0)',
    description: '正式初始化面向晶圆级高精度光学缺陷检测系统资产库，归档省赛金奖正本。',
    author: {
      name: '林子越',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&auto=format&fit=crop&q=80',
      role: '项目负责人'
    },
    date: '2026-08-28',
    dateLabel: 'Commits on Aug 28, 2026',
    timeAgo: '11 days ago',
    stageBadge: '省赛金奖归档 V2.0',
    fileIdsPresent: [
      'f-bp-main',
      'f-roadshow-ppt',
      'f-patent-cert',
      'f-financial-model',
      'asset-readme'
    ],
    changes: [
      {
        fileId: 'f-bp-main',
        fileName: '面向晶圆级高精度光学缺陷检测系统-商业计划书.md',
        path: '核心申报/面向晶圆级高精度光学缺陷检测系统-商业计划书.md',
        changeType: 'added',
        additions: 980,
        deletions: 0,
        description: '省赛金奖商业计划书正本初次提交归档。',
        diffLines: [
          { type: 'add', newLine: 1, text: '+ # 面向晶圆级高精度光学缺陷检测系统 —— 商业计划书' }
        ]
      }
    ]
  }
];

export const FOLDER_METADATA: Record<string, { label: string; desc: string; icon: string }> = {
  '核心申报': {
    label: '核心申报 (商业计划书与申报正本)',
    desc: '包含标准12章商业计划书金奖正本、一页纸执行摘要与全国总决赛高频答辩锦囊',
    icon: 'FileText'
  },
  '用户调研': {
    label: '用户调研 (产线访谈与客户画像)',
    desc: '包含长三角6家晶圆封测厂18位专家深度访谈纪要、意向汇总与全球竞品横向测评',
    icon: 'User'
  },
  '路演答辩': {
    label: '路演答辩 (15页金奖幻灯片与主讲讲稿)',
    desc: '包含针对2026大赛8分钟陈述定制的15页金奖路演幻灯片与主讲人演讲逐字稿',
    icon: 'Presentation'
  },
  '演示多媒体': {
    label: '演示多媒体 (样机实跑录像与光路仿真)',
    desc: '包含某国家级封测中试车间1200小时4K无故障实跑录像与非对称干涉光路仿真',
    icon: 'Video'
  },
  '佐证材料': {
    label: '佐证材料 (发明专利与CNAS权威检验)',
    desc: '包含国家发明专利证书、国家机器人与精密仪器检测中心(CNAS)检验报告与龙头企业联签单',
    icon: 'ShieldCheck'
  },
  '财务模型': {
    label: '财务模型 (三张表预测与单机BOM核算)',
    desc: '包含未来三年财务三张表、单客户经济学(Unit Economics)及标机硬件BOM成本清单',
    icon: 'FileSpreadsheet'
  }
};

