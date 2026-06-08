import { NextRequest, NextResponse } from 'next/server';
import { analyzeText, type AIAnalysisRequest } from '@/lib/ai';

export async function POST(request: NextRequest) {
  try {
    const body: AIAnalysisRequest = await request.json();

    if (!body.type || !body.text) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数: type, text' },
        { status: 400 }
      );
    }

    const result = await analyzeText(body);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: `服务器内部错误: ${error instanceof Error ? error.message : String(error)}`,
      },
      { status: 500 }
    );
  }
}
