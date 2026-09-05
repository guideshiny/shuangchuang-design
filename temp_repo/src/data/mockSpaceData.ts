/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProjectSpace } from '../types';

export const initialProjectSpaces: ProjectSpace[] = [
  {
    id: 'sp-zhiyun',
    name: '智耘农业',
    trackTag: '高教主赛道 · 新农科组',
    school: '厦门大学',
    leader: '林小满',
    stage: 'L3',
    icon: '🌾',
    workspace: {
      localPath: '~/Workspaces/智耘农业-2026/',
      cloudBucket: 'oss://innov-cloud/spaces/sp-zhiyun/',
      cloudSyncStatus: 'synced',
      lastSyncTime: '刚刚',
      totalFiles: 8,
      syncRate: '100% 同步'
    },
    sessions: [
      {
        id: 'sess-zy-task-1',
        title: '赛事政策与规则 · 规则库与评分标准解读',
        time: '刚刚',
        preview: '高教主赛道新农科组 vs 红旅赛道准入边界、双重申报红线与主赛道创意组评分导向精读',
        taskKey: 'task-1'
      },
      {
        id: 'sess-zy-deep-42',
        title: '【深度调用】BP商业计划书全链路深度体检',
        time: '15分钟前',
        preview: '调用 4.2 深度诊断引擎，6维量化雷达对标国金基准线，逐章排查散户付费漏洞并生成整改待办',
        taskKey: 'task-deep-42-diag'
      },
      {
        id: 'sess-zy-deep-43',
        title: '【深度调用】全流程模拟答辩与多考官极限压力训练',
        time: '40分钟前',
        preview: '调用 4.3 答辩引擎，多考官视角极限压力测试，输出连环质询防守复盘与答辩能力雷达',
        taskKey: 'task-deep-43-defense'
      },
      {
        id: 'sess-zy-shallow-42',
        title: '【浅度调用】商业计划书商业模式章节原子速诊',
        time: '2小时前',
        preview: '轻量 RPC 调用 4.2 诊断微服务 (sk-bp-diag)，极速剖析第三章散户付费漏洞与合作社分成改进方案',
        taskKey: 'task-shallow-42-chapter'
      },
      {
        id: 'sess-zy-shallow-43',
        title: '【浅度调用】考官高频尖锐答辩质询题直出',
        time: '昨天',
        preview: '轻量微服务调用 4.3 出题算子 (sk-defense-grill)，单次全量输出 5 道商业壁垒/产能/落地高频尖锐质询题',
        taskKey: 'task-shallow-43-questions'
      },
      {
        id: 'sess-zy-task-3-1',
        title: '金奖标杆拆解 · 近三年乡村振兴金奖共性',
        time: '昨天 15:40',
        preview: '对标近三年全国红旅赛道金奖项目，解构“政府撬动+村集体增收台账+农险兜底”底层范式',
        taskKey: 'task-3-1'
      },
      {
        id: 'sess-zy-task-3-2',
        title: '竞品与市场调研 · 智慧农业5大痛点与竞品矩阵',
        time: '2天前',
        preview: '梳理大疆、极飞、麦飞竞品生态矩阵，提炼水稻精细化病虫害5大痛点与差异化插件载荷对策',
        taskKey: 'task-3-2'
      },
      {
        id: 'sess-zy-task-4',
        title: '校内智库 · 厦大双创专属知识库与算力报销',
        time: '3天前',
        preview: '调用厦门大学校本双创专属库，对接信息学院重点实验室算力池、匹配导师与国赛培育报销',
        taskKey: 'task-4'
      }
    ],
    activeSessionId: 'sess-zy-task-1'
  }
];
