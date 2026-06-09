import { NextRequest, NextResponse } from 'next/server';
import { analyzeText, type AIAnalysisRequest } from '@/lib/ai';

// 请求体最大 50KB
const MAX_BODY_SIZE = 50 * 1024;

// 允许的来源（生产环境应设为具体域名）
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : null; // null = 允许所有（开发模式）

export async function POST(request: NextRequest) {
  try {
    // 1. CORS / 来源校验（生产环境）
    if (ALLOWED_ORIGINS) {
      const origin = request.headers.get('origin') || request.headers.get('referer') || '';
      const allowed = ALLOWED_ORIGINS.some((o) => origin.startsWith(o));
      if (!allowed) {
        return NextResponse.json(
          { success: false, error: '请求来源不被允许' },
          { status: 403 }
        );
      }
    }

    // 2. 内容长度检查
    const contentLength = parseInt(request.headers.get('content-length') || '0', 10);
    if (contentLength > MAX_BODY_SIZE) {
      return NextResponse.json(
        { success: false, error: '请求体过大' },
        { status: 413 }
      );
    }

    // 3. 解析并校验参数
    const body: AIAnalysisRequest = await request.json();

    if (!body.type || typeof body.type !== 'string') {
      return NextResponse.json(
        { success: false, error: '缺少参数: type' },
        { status: 400 }
      );
    }

    if (!body.text || typeof body.text !== 'string') {
      return NextResponse.json(
        { success: false, error: '缺少参数: text' },
        { status: 400 }
      );
    }

    // 4. 限制文本长度防止滥用
    if (body.text.length > 10000) {
      return NextResponse.json(
        { success: false, error: 'text 过长（上限 10000 字符）' },
        { status: 400 }
      );
    }

    // 5. 调用 AI
    const result = await analyzeText(body);
    return NextResponse.json(result);
  } catch (error) {
    // 生产环境不暴露内部错误细节
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    );
  }
}
