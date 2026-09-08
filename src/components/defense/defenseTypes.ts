import { LucideIcon } from 'lucide-react';

export type TrainingMode = 'standard' | 'elevator' | 'followup' | 'weakness' | 'adversarial' | 'roadshow';

export interface DefenseProject {
  id: string;
  name: string;
  track: string;
  summary: string;
  tags: string[];
  isCurrentProject?: boolean;
}

export interface RoadshowSlide {
  id: number;
  title: string;
  subtitle: string;
  category: '痛点洞察' | '核心突破' | '产品矩阵' | '商业模式' | '产业落地' | '创业团队' | '财务与规划' | '社会价值' | '综合答辩';
  plannedSeconds: number;
  keyPoints: string[];
  speakerScript: string;
  goldAdvice: string;
  visualMetrics: { label: string; value: string; hint?: string; badge?: string }[];
  highlightBullets: string[];
  chartType?: 'pipeline' | 'market' | 'radar' | 'compare' | 'timeline' | 'team';
}

export interface VirtualJudge {
  id: string;
  name: string;
  title: string;
  avatar: string;
  role: '组长·高校泰斗' | '一线创投合伙人' | '教育部双创专家' | '硬科技产业CTO';
  interestFocus: string;
  mood: 'focused' | 'impressed' | 'questioning' | 'taking_notes';
  reactionText: string;
  satisfactionScore: number; // 0-100
}

export interface RoadshowEvaluation {
  timePacingScore: number; // 控时节奏分
  contentCompletenessScore: number; // 架构完整度
  persuasivenessScore: number; // 商业说服力
  stagePresenceScore: number; // 表达风采分
  totalScore: number;
  timeSpentSeconds: number;
  plannedTotalSeconds: number;
  slideDurations: { slideId: number; title: string; spent: number; planned: number }[];
  judgeComments: { judgeName: string; role: string; comment: string; rating: '优秀' | '良好' | '需加强' }[];
  suggestedQAQuestions: string[];
  qaRoundsCount?: number;
  qaAverageScore?: number;
  qaQuestionsAndAnswers?: { 
    judgeName: string; 
    role: string; 
    question: string; 
    answer: string; 
    score: number; 
    comment: string; 
    timeSpent?: number 
  }[];
}

export interface ModeDef {
  id: TrainingMode;
  name: string;
  icon: LucideIcon;
  description: string;
  color: string;
  bg: string;
  border: string;
  text: string;
  tags: string[];
  badge?: string;
}

export interface DefenseMessage {
  id: string;
  role: 'judge' | 'user';
  content: string;
  time?: number; // seconds spent
  tag?: string;
}

export interface DimensionScore {
  label: string;
  value: number;
  color: string;
  comment?: string;
}

export interface DefenseSessionConfig {
  judgeMode: 'single' | 'panel';
  difficulty: 'friendly' | 'standard' | 'high_pressure';
  rounds: 'unlimited' | '3' | '5' | '8';
  timeLimit: number; // 60, 90, 120
  elevatorDuration?: '1min' | '3min';
  roadshowDuration?: '3min' | '5min' | '8min' | '10min';
  teleprompterMode?: 'bullets' | 'full_script';
  autoTransitionToQA?: boolean;
}

export interface DefenseHistoryItem {
  id: string;
  modeId: TrainingMode;
  modeName: string;
  projectId: string;
  projectName: string;
  status: '进行中' | '已结束';
  stats: string;
  score?: number;
  date: string;
}
