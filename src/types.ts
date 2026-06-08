// ===== 模块定义 =====
export interface Step {
  id: string;
  title: string;
  description: string;
  type: 'question' | 'quiz' | 'reflection' | 'sort' | 'combine' | 'info' | 'checklist';
}

export interface Module {
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
  description: string;
  steps: Step[];
  order: number;
}

// ===== 价值观（模块1） =====
export interface ValueEntry {
  id: string;
  text: string;
  questionId: string; // which question
}

export interface CoreValue {
  id: string;
  text: string;
  order: number;
  isControllable: boolean;
  deepDesire: string;
  isTrue: boolean; // true=真价值观
}

// ===== 才能（模块2） =====
export interface TalentEntry {
  id: string;
  description: string;
  level: '◎' | '〇' | '△';
  howToUse: string;
}

// ===== 热情（模块3） =====
export interface PassionEntry {
  id: string;
  area: string;
  questionId: string;
}

// ===== 组合（模块4） =====
export interface Hypothesis {
  id: string;
  passion: string;
  talent: string;
  description: string;
  score: number;
  passedFilter: boolean | null;
}

// ===== 模块定义数据 =====
export const MODULES: Module[] = [
  {
    id: 'module1',
    title: '找到重要的事',
    subtitle: '价值观 — Why',
    emoji: '🧭',
    description: '找到你人生的指南针，明确"为什么做"比"做什么"更重要',
    order: 1,
    steps: [
      { id: 'm1-s1', title: '5个问题收集价值观关键词', description: '回答5个核心问题，挖掘内心真正的价值观', type: 'question' },
      { id: 'm1-s2', title: '形成价值观思维导图', description: '把关键词分组归纳，提炼核心价值观', type: 'reflection' },
      { id: 'm1-s3', title: '辨别真假价值观', description: '区分"我想做"和"我应该做"', type: 'quiz' },
      { id: 'm1-s4', title: '排序确定优先级', description: '理清价值观之间的因果链条', type: 'sort' },
      { id: 'm1-s5', title: '确定工作目的', description: '找到你最想传递给别人的价值', type: 'reflection' },
    ],
  },
  {
    id: 'module2',
    title: '找到擅长的事',
    subtitle: '才能 — How',
    emoji: '⚡',
    description: '发现你的无意识习惯和天赋，缺点其实是放错位置的优点',
    order: 2,
    steps: [
      { id: 'm2-s1', title: '才能5问', description: '通过5个问题挖掘你的隐藏才能', type: 'question' },
      { id: 'm2-s2', title: '缺点转优点', description: '把"所以"换成"正因为"', type: 'reflection' },
      { id: 'm2-s3', title: '成功经历深挖', description: '从8个角度分析你的成功经验', type: 'question' },
      { id: 'm2-s4', title: '制作使用说明书', description: '整理10-20个长处并分级', type: 'checklist' },
    ],
  },
  {
    id: 'module3',
    title: '找到喜欢的事',
    subtitle: '热情 — What',
    emoji: '❤️',
    description: '探索你真正好奇的领域，区分"因为有用"和"因为兴趣"',
    order: 3,
    steps: [
      { id: 'm3-s1', title: '热情5问', description: '5个问题发现你的兴趣领域', type: 'question' },
      { id: 'm3-s2', title: '合理性陷阱检测', description: '检查你是否陷入了"合理性陷阱"', type: 'quiz' },
      { id: 'm3-s3', title: '整理兴趣清单', description: '归纳你的兴趣领域', type: 'reflection' },
    ],
  },
  {
    id: 'module4',
    title: '组合成想做的事',
    subtitle: 'What × How × Why',
    emoji: '🔗',
    description: '把三大支柱组合成真正想做的事，用工作目的筛选',
    order: 4,
    steps: [
      { id: 'm4-s1', title: '自由组合', description: '将喜欢的事×擅长的事自由组合', type: 'combine' },
      { id: 'm4-s2', title: '工作目的筛选', description: '用价值观筛选出最匹配的选项', type: 'sort' },
      { id: 'm4-s3', title: '制定验证计划', description: '设计最小可行验证方案', type: 'reflection' },
    ],
  },
];

export const MODULE_MAP = new Map(MODULES.map(m => [m.id, m]));
