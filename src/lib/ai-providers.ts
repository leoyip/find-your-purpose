/**
 * AI 提供商配置
 * 所有支持 OpenAI 兼容格式的 API 均可接入
 */

export interface AIProvider {
  id: string;
  name: string;
  baseUrl: string;
  models: AIModel[];
  docsUrl?: string; // 申请 API Key 的文档链接
}

export interface AIModel {
  id: string;
  label: string;
  description?: string;
}

export const AI_PROVIDERS: AIProvider[] = [
  {
    id: 'deepseek',
    name: 'DeepSeek',
    baseUrl: 'https://api.deepseek.com',
    models: [
      { id: 'deepseek-chat', label: 'DeepSeek V3', description: '性价比高，适合日常使用' },
      { id: 'deepseek-reasoner', label: 'DeepSeek R1', description: '推理能力强，但速度较慢' },
    ],
    docsUrl: 'https://platform.deepseek.com/api_keys',
  },
  {
    id: 'minimax',
    name: 'MiniMax',
    baseUrl: 'https://api.minimax.chat/v1',
    models: [
      { id: 'minimax-text-01', label: 'MiniMax Text-01', description: '最新文本模型，综合能力强' },
      { id: 'abab6.5s', label: 'abab6.5s', description: '快速模型' },
    ],
    docsUrl: 'https://platform.minimax.com/',
  },
  {
    id: 'alibaba',
    name: '阿里云通义千问',
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    models: [
      { id: 'qwen-turbo', label: 'Qwen Turbo', description: '快速轻量' },
      { id: 'qwen-plus', label: 'Qwen Plus', description: '均衡型' },
      { id: 'qwen-max', label: 'Qwen Max', description: '最强推理' },
    ],
    docsUrl: 'https://bailian.console.aliyun.com/',
  },
  {
    id: 'tencent',
    name: '腾讯云混元',
    baseUrl: 'https://api.hunyuan.cloud.tencent.com/v1',
    models: [
      { id: 'hunyuan-pro', label: '混元 Pro', description: '专业版' },
      { id: 'hunyuan-standard', label: '混元 Standard', description: '标准版' },
    ],
    docsUrl: 'https://console.cloud.tencent.com/hunyuan',
  },
  {
    id: 'siliconflow',
    name: '硅基流动',
    baseUrl: 'https://api.siliconflow.cn/v1',
    models: [
      { id: 'Qwen/Qwen2.5-7B-Instruct', label: 'Qwen2.5-7B', description: '轻量开源模型' },
      { id: 'deepseek-ai/DeepSeek-V3', label: 'DeepSeek V3', description: 'DeepSeek 开源版' },
      { id: 'Pro/Qwen3-235B-A22B', label: 'Qwen3 235B', description: '旗舰开源模型' },
    ],
    docsUrl: 'https://siliconflow.cn/',
  },
];

export function getProvider(id: string): AIProvider | undefined {
  return AI_PROVIDERS.find((p) => p.id === id);
}

export function getDefaultProvider(): AIProvider {
  return AI_PROVIDERS[0]; // DeepSeek
}
