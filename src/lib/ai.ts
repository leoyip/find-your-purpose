/**
 * AI 服务层 — 支持任何 OpenAI 兼容格式的 API
 * 默认使用 DeepSeek，可通过环境变量切换为 MiniMax / OpenAI 等
 */

export interface AIAnalysisRequest {
  type: AnalysisType;
  text: string;
  context?: Record<string, unknown>;
}

export type AnalysisType =
  | 'extract-values'
  | 'group-values'
  | 'extract-talents'
  | 'extract-passions'
  | 'suggest-combinations'
  | 'custom';

export interface AIAnalysisResult {
  success: boolean;
  data?: string[];
  error?: string;
  raw?: string;
}

const SYSTEM_PROMPTS: Record<string, string> = {
  'extract-values': `你是一位专业的自我认知教练。用户正在做《如何找到你想做的事》书中的价值观发现练习。

请从用户的回答中，提取出所有可能的**价值观关键词**。价值观关键词描述的是"什么是重要的"，而不是"想做什么事"。

规则：
- 提取 5~15 个关键词
- 每个词 2~6 个字
- 只返回一个 JSON 数组，如 ["自由", "创造", "真诚", "成长"]
- 不要任何解释`,

  'group-values': `你是一位专业的自我认知教练。用户已经收集了一些价值观关键词，需要你帮他们归纳分组。

规则：
- 把含义相近的关键词归为一组
- 每组用 1 个概括词命名
- 每组包含 2~6 个关键词
- 返回 JSON 数组，格式：[{"group":"组名","keywords":["词1","词2","词3"]}]
- 不要任何解释`,

  'extract-talents': `你是一位专业的优势教练。用户正在做才能发现练习。

请从用户的描述中，提取出他们可能拥有的**才能/长处/优势**。才能是无意识的思维、情感、行为习惯。

规则：
- 提取 3~10 个才能
- 用动词或形容词描述，如"善于倾听"、"做事有条理"、"擅长从不同角度看问题"
- 只返回 JSON 数组，如 ["善于倾听他人的心声", "能把复杂的事讲清楚", "做事有条理"]
- 不要任何解释`,

  'extract-passions': `你是一位职业规划教练。用户正在做热情发现练习。

请从用户的描述中，提取出他们真正感兴趣的**领域/主题**。

规则：
- 提取 3~8 个兴趣领域
- 每个领域用 2~6 个字概括，如"心理学"、"自我成长"、"教育"、"艺术"
- 只返回 JSON 数组
- 不要任何解释`,

  'suggest-combinations': `你是一位职业规划顾问。用户已经找到了自己的兴趣领域和才能，需要你帮他们组合成"假设想做的事"。

规则：
- 把他们感兴趣的领域（What）和才能（How）自由组合
- 生成 5~8 个合理的组合
- 每个组合描述要具体、有画面感
- 返回 JSON 数组，格式：[{"passion":"兴趣领域","talent":"才能","description":"具体描述","reason":"为什么这个组合有意义"}]
- 不要任何解释`,
};

export function getSystemPrompt(type: AnalysisType, context?: Record<string, unknown>): string {
  const base = SYSTEM_PROMPTS[type] || '请分析以下内容并返回 JSON 数组。';
  if (context && Object.keys(context).length > 0) {
    return `${base}\n\n附加信息：${JSON.stringify(context, null, 2)}`;
  }
  return base;
}

export function getUserPrompt(type: AnalysisType, text: string): string {
  const prompts: Record<string, string> = {
    'extract-values': `以下是用户对价值观5个问题的回答。请从中提取价值观关键词：\n\n${text}`,
    'group-values': `以下是用已经收集到的价值观关键词，请帮他们归纳分组：\n\n${text}`,
    'extract-talents': `以下是用户的才能描述，请提取出他们的才能/长处：\n\n${text}`,
    'extract-passions': `以下是用户的回答，请提取出他们感兴趣的领域：\n\n${text}`,
    'suggest-combinations': `以下是用户的兴趣领域和才能，请帮他们组合成"假设想做的事"：\n\n${text}`,
  };
  return prompts[type] || text;
}

/**
 * 调用 LLM API 进行文本分析
 */
export async function analyzeText(request: AIAnalysisRequest): Promise<AIAnalysisResult> {
  const { type, text, context } = request;

  if (!text.trim()) {
    return { success: false, error: '输入文本为空' };
  }

  const apiBase = process.env.LLM_API_BASE || 'https://api.deepseek.com';
  const apiKey = process.env.LLM_API_KEY || '';
  const model = process.env.LLM_MODEL || 'deepseek-chat';

  if (!apiKey) {
    return { success: false, error: '未配置 API Key。请在 .env.local 中设置 LLM_API_KEY' };
  }

  try {
    const response = await fetch(`${apiBase}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: getSystemPrompt(type, context) },
          { role: 'user', content: getUserPrompt(type, text) },
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '');
      return {
        success: false,
        error: `API 请求失败 (${response.status}): ${errorBody || response.statusText}`,
      };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    // 尝试从返回文本中提取 JSON
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return { success: true, data: Array.isArray(parsed) ? parsed : [parsed], raw: content };
    }

    // 如果整个返回就是 JSON
    try {
      const parsed = JSON.parse(content);
      return { success: true, data: Array.isArray(parsed) ? parsed : [parsed], raw: content };
    } catch {
      // 不是 JSON，按行分割作为结果
      const lines = content.split('\n').filter((l: string) => l.trim()).map((l: string) => l.trim());
      return { success: true, data: lines, raw: content };
    }
  } catch (error) {
    return {
      success: false,
      error: `AI 调用异常: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}
